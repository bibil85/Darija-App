import { AudioSource, ParentRecording, Word } from '../types.ts';
import { fadeOutActivePCM, generateDarijaAudio, hasGeminiApiKey, playPCM } from './geminiService.ts';
import {
  getAllCachedTTS,
  getAllParentRecordings,
  getCachedTTS,
  getParentRecording,
  saveCachedTTS,
} from './storageService.ts';
import { getSharedAudioContext, playClickSound } from './soundService.ts';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

// Synchronous in-memory caches preloaded from IndexedDB so iPad Safari NEVER loses user-gesture activation!
const memoryTTSCache = new Map<string, string>();
const memoryParentCache = new Map<string, ParentRecording>();
const decodedParentBuffers = new Map<string, AudioBuffer>();
let cachesWarmed = false;

// Active playback handles for smooth crossfading & Safari GC protection
let activeRecordedSource: AudioBufferSourceNode | null = null;
let activeRecordedGain: GainNode | null = null;
let sharedHtmlAudio: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null; // Prevents WebKit GC cutting off speech!
let cachedVoices: SpeechSynthesisVoice[] = [];
let speechPrimed = false;
let latestSpeechTicket = 0;
let lastSpeechStartMs = 0;
let deferredSpeakTimer: number | null = null;

/** Load & cache available Web Speech voices (handles async iOS/Safari voiceschanged event) */
function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  } catch {
    // ignore
  }
  return cachedVoices;
}

/**
 * Unlock iPad Safari's SpeechSynthesis & reusable HTMLAudioElement synchronously inside the first tap!
 * Without this, timer-triggered game prompts (like "Find Tefa7a!") stay silent on iPadOS Safari.
 */
function primeIOSSpeechAndAudio() {
  refreshVoices();

  // 1. Prime SpeechSynthesis inside the user gesture
  if (!speechPrimed && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      u.rate = 10;
      activeUtterance = u;
      synth.speak(u);
      speechPrimed = true;
    } catch {
      // Retry on next tap
    }
  }

  // 2. Prime one reusable <audio playsinline> element for fallback blob playback
  if (!sharedHtmlAudio && typeof document !== 'undefined') {
    try {
      const el = document.createElement('audio');
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      el.preload = 'auto';
      sharedHtmlAudio = el;
    } catch {
      // ignore
    }
  }
}

// Automatically wire into SoundFXEngine's capturing first-user-gesture listeners + voiceschanged!
if (typeof window !== 'undefined') {
  SoundFXEngine.onFirstUserGesture(primeIOSSpeechAndAudio);
  if ('speechSynthesis' in window) {
    refreshVoices();
    try {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    } catch {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  }
}

/**
 * Preload all Parent Recordings and Cached Gemini TTS from IndexedDB into RAM.
 * Call once at startup and after ParentStudio saves/deletes recordings so `speakWord()`
 * can execute synchronously inside the user-gesture stack on iPad Safari!
 */
export async function warmAudioCaches(): Promise<void> {
  try {
    const [recordings, ttsMap] = await Promise.all([
      getAllParentRecordings(),
      getAllCachedTTS(),
    ]);

    memoryParentCache.clear();
    decodedParentBuffers.clear();
    for (const r of recordings) {
      memoryParentCache.set(r.wordId, r);
    }

    memoryTTSCache.clear();
    for (const [id, b64] of Object.entries(ttsMap)) {
      memoryTTSCache.set(id, b64);
    }
    cachesWarmed = true;
  } catch {
    // ignore
  }
}

/** Smoothly crossfade out active recorded audio / PCM without abrupt pops */
function fadeOutActiveRecording(fadeMs = 65) {
  const ctx = getSharedAudioContext();
  const src = activeRecordedSource;
  const gain = activeRecordedGain;
  activeRecordedSource = null;
  activeRecordedGain = null;

  if (src) {
    try {
      if (ctx && gain) {
        const now = ctx.currentTime;
        const dur = Math.max(0.02, fadeMs / 1000);
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        src.stop(now + dur + 0.01);
      } else {
        src.stop();
      }
    } catch {
      // ignore
    }
  }

  if (sharedHtmlAudio && !sharedHtmlAudio.paused) {
    try {
      sharedHtmlAudio.pause();
      sharedHtmlAudio.currentTime = 0;
    } catch {
      // ignore
    }
  }
}

function stopAllOtherAudio(cancelSpeech: boolean) {
  if (deferredSpeakTimer !== null) {
    window.clearTimeout(deferredSpeakTimer);
    deferredSpeakTimer = null;
  }
  fadeOutActivePCM(65);
  fadeOutActiveRecording(65);

  if (cancelSpeech && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Play a Parent Voice Recording Blob reliably on iPad Safari:
 * Primary: Decode into our unlocked singleton AudioContext (works 100% after async + smooth crossfade!)
 * Fallback: Reusable pre-created inline <audio playsinline> element.
 */
async function playRecordedBlob(wordId: string, blob: Blob, ticket: number): Promise<boolean> {
  const ctx = getSharedAudioContext();

  // Primary path: Web Audio API decodeAudioData (immune to iOS HTMLAudio autoplay restrictions!)
  if (ctx) {
    try {
      if (ctx.state !== 'running') {
        await ctx.resume();
      }
      let buffer = decodedParentBuffers.get(wordId);
      if (!buffer) {
        const arrayBuf = await blob.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf.slice(0));
        decodedParentBuffers.set(wordId, buffer);
      }
      if (ticket !== latestSpeechTicket) return false;

      fadeOutActiveRecording(60);

      return await new Promise<boolean>((resolve) => {
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(1.0, now + 0.02);

        src.buffer = buffer!;
        src.connect(gain);
        gain.connect(ctx.destination);
        activeRecordedSource = src;
        activeRecordedGain = gain;

        src.onended = () => {
          if (activeRecordedSource === src) {
            activeRecordedSource = null;
            activeRecordedGain = null;
          }
          resolve(true);
        };
        src.start(now);
      });
    } catch {
      // Fall through to reusable inline HTMLAudioElement if Safari can't decode container via WebAudio
    }
  }

  // Fallback path: Reusable inline <audio playsinline>
  try {
    if (ticket !== latestSpeechTicket) return false;
    if (!sharedHtmlAudio) {
      sharedHtmlAudio = document.createElement('audio');
      sharedHtmlAudio.setAttribute('playsinline', '');
      sharedHtmlAudio.setAttribute('webkit-playsinline', '');
    }
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = null;
    }
    const url = URL.createObjectURL(blob);
    activeBlobUrl = url;
    const audio = sharedHtmlAudio;
    audio.src = url;
    audio.load();

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('HTMLAudio playback error'));
      audio.play().catch(reject);
    });
    return true;
  } catch {
    return false;
  }
}

function findBestArabicVoice(): SpeechSynthesisVoice | undefined {
  const voices = refreshVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('ar-ma')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('ar'))
  );
}

/**
 * Safari-Safe Web Speech Synthesizer:
 * - Retains `activeUtterance` globally so WebKit never GCs mid-utterance.
 * - Avoids the infamous iOS WebKit bug where `synth.cancel()` immediately before `synth.speak()`
 *   silently drops the new utterance (only calls `cancel()` if actively speaking, with a brief handover).
 * - Resumes `synth.paused` state automatically.
 */
function speakWithWebSpeech(text: string, arabicText: string | undefined, ticket: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      const synth = window.speechSynthesis;
      if (synth.paused) {
        try {
          synth.resume();
        } catch {
          // ignore
        }
      }

      const arabicVoice = findBestArabicVoice();
      const useArabic = Boolean(arabicVoice && arabicText);
      const utterance = new SpeechSynthesisUtterance(useArabic ? arabicText! : text);

      if (useArabic && arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = arabicVoice.lang;
        utterance.rate = 0.86;
      } else {
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.08;
      }
      utterance.volume = 1.0;

      let settled = false;
      const done = (ok: boolean) => {
        if (!settled) {
          settled = true;
          if (activeUtterance === utterance) activeUtterance = null;
          resolve(ok);
        }
      };

      utterance.onend = () => done(true);
      utterance.onerror = () => done(false);
      // Safety fallback timeout so UI never hangs if Safari skips onend
      window.setTimeout(() => done(true), 2600);

      const triggerSpeak = () => {
        if (ticket !== latestSpeechTicket) {
          done(false);
          return;
        }
        activeUtterance = utterance; // Keep strong reference for Safari WebKit!
        try {
          if (synth.paused) synth.resume();
          synth.speak(utterance);
        } catch {
          done(false);
        }
      };

      // Key iPad Safari fix:
      // If nothing is currently speaking, call synth.speak() SYNCHRONOUSLY inside the user gesture!
      // Only if Safari is mid-speech, cancel first and yield 55ms so WebKit doesn't drop the new utterance!
      if (synth.speaking || synth.pending) {
        synth.cancel();
        deferredSpeakTimer = window.setTimeout(() => {
          deferredSpeakTimer = null;
          triggerSpeak();
        }, 55);
      } else {
        triggerSpeak();
      }
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
 * 3-Tier Hybrid Darija Pronunciation Engine (Optimized for iPad Safari!):
 * - Zero `await` before speech when caches are warm, preserving iOS Safari user-gesture activation!
 * - Smooth crossfade & latest-wins priority so rapid toddler tapping never creates overlapping garbled speech.
 * 1. Parent Voice Recording (IndexedDB -> Web Audio AudioBuffer — Mama/Baba's real voice!)
 * 2. Cached or Live Gemini TTS (IndexedDB cached after first fetch)
 * 3. Instant iPad/Browser SpeechSynthesis fallback (prefers built-in Arabic voices)
 */
export async function speakWord(word: Word): Promise<SpeakResult> {
  // Always unlock iOS Safari AudioContext + SpeechSynthesis synchronously inside the tap!
  SoundFXEngine.unlock();
  primeIOSSpeechAndAudio();
  getSharedAudioContext();

  const ticket = ++latestSpeechTicket;
  const nowMs = performance.now();
  const isRapidMash = nowMs - lastSpeechStartMs < 130;
  lastSpeechStartMs = nowMs;

  stopAllOtherAudio(false);
  SoundFXEngine.duckForSpeech(true, 2100);

  try {
    // Tier 1: Parent Voice Recording (synchronous RAM hit if warmed!)
    let recording = memoryParentCache.get(word.id) || null;
    if (!recording && !cachesWarmed) {
      recording = await getParentRecording(word.id);
      if (recording) memoryParentCache.set(word.id, recording);
    }
    if (ticket !== latestSpeechTicket) return { source: 'chime' };

    if (recording?.blob) {
      stopAllOtherAudio(true);
      const ok = await playRecordedBlob(word.id, recording.blob, ticket);
      if (ok) {
        return { source: 'parent', speakerLabel: recording.speakerLabel };
      }
    }

    // Tier 2: Cached or Live Gemini TTS (synchronous RAM hit if warmed!)
    let base64 = memoryTTSCache.get(word.id) || null;
    if (!base64 && !cachesWarmed) {
      base64 = await getCachedTTS(word.id);
      if (base64) memoryTTSCache.set(word.id, base64);
    }
    if (!base64 && hasGeminiApiKey()) {
      base64 = await generateDarijaAudio(word.darija, word.arabic);
      if (base64) {
        memoryTTSCache.set(word.id, base64);
        await saveCachedTTS(word.id, base64);
      }
    }
    if (ticket !== latestSpeechTicket) return { source: 'chime' };

    if (base64) {
      try {
        stopAllOtherAudio(true);
        await playPCM(base64);
        return { source: 'gemini' };
      } catch {
        // Fall through to Web Speech
      }
    }

    if (ticket !== latestSpeechTicket) return { source: 'chime' };

    // If toddler mashed two different words within 130ms, briefly yield before Web Speech handover
    if (isRapidMash) {
      await new Promise<void>((r) => {
        deferredSpeakTimer = window.setTimeout(() => {
          deferredSpeakTimer = null;
          r();
        }, 65);
      });
      if (ticket !== latestSpeechTicket) return { source: 'chime' };
    }

    // Tier 3: Safari-Safe Web Speech API (synchronous when idle!)
    const spokenFallback = word.phonetics.replace(/-/g, ' ');
    const spoke = await speakWithWebSpeech(spokenFallback, word.arabic, ticket);
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

/** Speak a short Darija greeting or praise phrase cleanly on iPad Safari */
export function speakShortPhrase(text: string, arabic?: string) {
  SoundFXEngine.unlock();
  primeIOSSpeechAndAudio();
  const ticket = ++latestSpeechTicket;
  stopAllOtherAudio(false);
  void speakWithWebSpeech(text, arabic, ticket);
}

/** Live iPad Audio Diagnostics for Parent Studio troubleshooting */
export function getAudioDiagnostics() {
  const sfx = SoundFXEngine.getDiagnostics();
  const voices = refreshVoices();
  const arabicVoice = findBestArabicVoice();
  return {
    ...sfx,
    speechSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voiceCount: voices.length,
    arabicVoiceName: arabicVoice ? `${arabicVoice.name} (${arabicVoice.lang})` : 'None (using phonetic fallback)',
    cachedParentRecordings: memoryParentCache.size,
  };
}
