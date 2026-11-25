import { AudioSource, Word } from '../types.ts';
import { generateDarijaAudio, hasGeminiApiKey, playPCM } from './geminiService.ts';
import {
  getCachedTTS,
  getParentRecording,
  saveCachedTTS,
} from './storageService.ts';
import { getSharedAudioContext, playClickSound } from './soundService.ts';

// Keep in-memory cache of base64 TTS & blob URLs for instant replay
const memoryTTSCache = new Map<string, string>();
let activeHtmlAudio: HTMLAudioElement | null = null;

function stopCurrentPlayback() {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeHtmlAudio = null;
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
 * 3-Tier Hybrid Darija Pronunciation Engine:
 * 1. Parent Voice Recording (IndexedDB — Mama/Baba's real voice!)
 * 2. Cached or Live Gemini TTS (IndexedDB cached after first fetch)
 * 3. Instant Web Speech API fallback (prefers iOS/browser Arabic voices)
 */
export async function speakWord(word: Word): Promise<SpeakResult> {
  // Ensure AudioContext is unlocked on iOS Safari user tap
  getSharedAudioContext();
  stopCurrentPlayback();

  // Tier 1: Parent Voice Recording
  const recording = await getParentRecording(word.id);
  if (recording?.blob) {
    const ok = await playRecordedBlob(recording.blob);
    if (ok) {
      return { source: 'parent', speakerLabel: recording.speakerLabel };
    }
  }

  // Tier 2: Cached or Live Gemini TTS
  let base64 = memoryTTSCache.get(word.id) || (await getCachedTTS(word.id));
  if (!base64 && hasGeminiApiKey()) {
    base64 = await generateDarijaAudio(word.darija, word.arabic);
    if (base64) {
      memoryTTSCache.set(word.id, base64);
      await saveCachedTTS(word.id, base64);
    }
  } else if (base64) {
    memoryTTSCache.set(word.id, base64);
  }

  if (base64) {
    try {
      await playPCM(base64);
      return { source: 'gemini' };
    } catch {
      // Fall through to Web Speech
    }
  }

  // Tier 3: Browser Web Speech API (great built-in Arabic voices on iPad Safari!)
  const spoke = await speakWithWebSpeech(word);
  if (spoke) {
    return { source: 'speech' };
  }

  playClickSound();
  return { source: 'chime' };
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
