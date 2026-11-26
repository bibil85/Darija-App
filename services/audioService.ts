import { AudioSource, Word } from '../types.ts';
import { fadeOutActivePCM, generateDarijaAudio, hasGeminiApiKey, playPCM } from './geminiService.ts';
import {
  getCachedTTS,
  getParentRecording,
  saveCachedTTS,
} from './storageService.ts';
import { getSharedAudioContext, playClickSound } from './soundService.ts';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

// Keep in-memory cache of base64 TTS & blob URLs for instant replay
const memoryTTSCache = new Map<string, string>();
let activeHtmlAudio: HTMLAudioElement | null = null;
let latestSpeechTicket = 0;
let pendingCoalesceTimer: number | null = null;

/** Smoothly crossfade out active recorded audio / PCM / speechSynthesis without abrupt clicks */
function crossfadeOutCurrentPlayback() {
  fadeOutActivePCM(65);

  if (activeHtmlAudio) {
    const audio = activeHtmlAudio;
    activeHtmlAudio = null;
    try {
      const startVol = audio.volume;
      let step = 0;
      const fadeId = window.setInterval(() => {
        step += 1;
        const nextVol = Math.max(0, startVol * (1 - step / 4));
        try {
          audio.volume = nextVol;
        } catch {
          // iOS Safari may keep HTMLAudioElement.volume read-only; pause cleanly at end
        }
        if (step >= 4) {
          window.clearInterval(fadeId);
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch {
            // ignore
          }
        }
      }, 16);
    } catch {
      try {
        audio.pause();
      } catch {
        // ignore
      }
    }
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

async function playRecordedBlob(blob: Blob): Promise<boolean> {
  try {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeHtmlAudio = audio;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Playback error'));
      };
      audio.play().catch((err) => {
        URL.revokeObjectURL(url);
        reject(err);
      });
    });
    return true;
  } catch {
    return false;
  }
}

function speakWithWebSpeech(word: Word): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    try {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const arabicVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('ar-ma')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

      const utterance = new SpeechSynthesisUtterance(
        arabicVoice ? word.arabic : word.phonetics.replace(/-/g, ' ')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
        utterance.rate = 0.85;
      } else {
        utterance.lang = 'en-US';
        utterance.rate = 0.88;
        utterance.pitch = 1.1;
      }

      let settled = false;
      const done = (ok: boolean) => {
        if (!settled) {
          settled = true;
          resolve(ok);
        }
      };

      utterance.onend = () => done(true);
      utterance.onerror = () => done(false);
      // Safety fallback timeout so UI never hangs
      setTimeout(() => done(true), 2400);

      synth.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

export interface SpeakResult {
  source: AudioSource;
  speakerLabel?: string;
}

/**
 * 3-Tier Hybrid Darija Pronunciation Engine with Toddler Anti-Overlap Priority Queue:
 * - Rapid toddler taps (e.g., 4 taps in 1 second) coalesce cleanly (60ms burst window) and
 *   smoothly crossfade to the LATEST tapped vocabulary word — zero overlapping garbled speech!
 * 1. Parent Voice Recording (IndexedDB — Mama/Baba's real voice!)
 * 2. Cached or Live Gemini TTS (IndexedDB cached after first fetch)
 * 3. Instant Web Speech API fallback (prefers iOS/browser Arabic voices)
 */
export async function speakWord(word: Word): Promise<SpeakResult> {
  // Unlock iOS Safari AudioContext immediately inside the user gesture stack
  SoundFXEngine.unlock();
  getSharedAudioContext();

  const ticket = ++latestSpeechTicket;

  // Brief 55ms burst coalescing: if toddler mashes 4 objects in 1 second, skip stale intermediate calls cleanly
  if (pendingCoalesceTimer !== null) {
    window.clearTimeout(pendingCoalesceTimer);
    pendingCoalesceTimer = null;
  }
  await new Promise<void>((resolve) => {
    pendingCoalesceTimer = window.setTimeout(() => {
      pendingCoalesceTimer = null;
      resolve();
    }, 55);
  });

  // Superseded by a newer tap before playback even started
  if (ticket !== latestSpeechTicket) {
    return { source: 'chime' };
  }

  crossfadeOutCurrentPlayback();
  SoundFXEngine.duckForSpeech(true, 2100);

  try {
    // Tier 1: Parent Voice Recording
    const recording = await getParentRecording(word.id);
    if (ticket !== latestSpeechTicket) return { source: 'chime' };
    if (recording?.blob) {
      const ok = await playRecordedBlob(recording.blob);
      if (ok) {
        return { source: 'parent', speakerLabel: recording.speakerLabel };
      }
    }

    // Tier 2: Cached or Live Gemini TTS
    let base64 = memoryTTSCache.get(word.id) || (await getCachedTTS(word.id));
    if (ticket !== latestSpeechTicket) return { source: 'chime' };
    if (!base64 && hasGeminiApiKey()) {
      base64 = await generateDarijaAudio(word.darija, word.arabic);
      if (base64) {
        memoryTTSCache.set(word.id, base64);
        await saveCachedTTS(word.id, base64);
      }
    } else if (base64) {
      memoryTTSCache.set(word.id, base64);
    }

    if (ticket !== latestSpeechTicket) return { source: 'chime' };

    if (base64) {
      try {
        await playPCM(base64);
        return { source: 'gemini' };
      } catch {
        // Fall through to Web Speech
      }
    }

    if (ticket !== latestSpeechTicket) return { source: 'chime' };

    // Tier 3: Browser Web Speech API (great built-in Arabic voices on iPad Safari!)
    const spoke = await speakWithWebSpeech(word);
    if (spoke) {
      return { source: 'speech' };
    }

    playClickSound();
    return { source: 'chime' };
  } finally {
    if (ticket === latestSpeechTicket) {
      SoundFXEngine.duckForSpeech(false);
    }
  }
}

/** Speak a short Darija greeting or praise phrase with Web Speech fallback */
export function speakShortPhrase(text: string, arabic?: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const arabicVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ar'));
    const utterance = new SpeechSynthesisUtterance(arabicVoice && arabic ? arabic : text);
    if (arabicVoice && arabic) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    synth.speak(utterance);
  } catch {
    // ignore
  }
}
