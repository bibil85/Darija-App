import { ParentRecording, ParentSettings, ProgressData } from '../types.ts';

const SETTINGS_KEY = 'darija_fun_settings_v2';
const PROGRESS_KEY = 'darija_fun_progress_v2';
const DB_NAME = 'darija_fun_audio_db';
const DB_VERSION = 1;
const STORE_RECORDINGS = 'parent_recordings';
const STORE_TTS_CACHE = 'tts_cache';

export const DEFAULT_SETTINGS: ParentSettings = {
  ageMode: 'little',
  difficulty: 1,
  showArabic: true,
  showEnglish: true,
  soundEffects: true,
  voiceLabel: 'Mama',
};

export const DEFAULT_PROGRESS: ProgressData = {
  stars: 0,
  unlockedWordIds: ['lion', 'cat', 'apple', 'sun'],
  placedStickers: [
    { uid: 'starter-1', wordId: 'lion', x: 50, y: 66, scale: 1.1 },
    { uid: 'starter-2', wordId: 'sun', x: 80, y: 24, scale: 1 },
  ],
};

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ParentSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      stars: typeof parsed.stars === 'number' ? parsed.stars : 0,
      unlockedWordIds: Array.isArray(parsed.unlockedWordIds)
        ? parsed.unlockedWordIds
        : DEFAULT_PROGRESS.unlockedWordIds,
      placedStickers: Array.isArray(parsed.placedStickers)
        ? parsed.placedStickers
        : DEFAULT_PROGRESS.placedStickers,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: ProgressData): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}

function openAudioDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
          db.createObjectStore(STORE_RECORDINGS, { keyPath: 'wordId' });
        }
        if (!db.objectStoreNames.contains(STORE_TTS_CACHE)) {
          db.createObjectStore(STORE_TTS_CACHE, { keyPath: 'wordId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// --- Parent Voice Recordings (IndexedDB) ---

export async function saveParentRecording(recording: ParentRecording): Promise<boolean> {
  const db = await openAudioDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
      tx.objectStore(STORE_RECORDINGS).put(recording);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getParentRecording(wordId: string): Promise<ParentRecording | null> {
  const db = await openAudioDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDINGS, 'readonly');
      const req = tx.objectStore(STORE_RECORDINGS).get(wordId);
      req.onsuccess = () => resolve((req.result as ParentRecording) || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function deleteParentRecording(wordId: string): Promise<boolean> {
  const db = await openAudioDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
      tx.objectStore(STORE_RECORDINGS).delete(wordId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function listParentRecordingIds(): Promise<Record<string, string>> {
  const db = await openAudioDB();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_RECORDINGS, 'readonly');
      const req = tx.objectStore(STORE_RECORDINGS).getAll();
      req.onsuccess = () => {
        const result: Record<string, string> = {};
        const rows = (req.result as ParentRecording[]) || [];
        for (const r of rows) {
          result[r.wordId] = r.speakerLabel || 'Family';
        }
        resolve(result);
      };
      req.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}

// --- Cached Gemini TTS PCM (IndexedDB) ---

export async function getCachedTTS(wordId: string): Promise<string | null> {
  const db = await openAudioDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_CACHE, 'readonly');
      const req = tx.objectStore(STORE_TTS_CACHE).get(wordId);
      req.onsuccess = () => resolve(req.result?.base64 || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveCachedTTS(wordId: string, base64: string): Promise<void> {
  const db = await openAudioDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_CACHE, 'readwrite');
      tx.objectStore(STORE_TTS_CACHE).put({ wordId, base64, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function countCachedTTS(): Promise<number> {
  const db = await openAudioDB();
  if (!db) return 0;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_CACHE, 'readonly');
      const req = tx.objectStore(STORE_TTS_CACHE).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

export async function clearTTSCache(): Promise<void> {
  const db = await openAudioDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_TTS_CACHE, 'readwrite');
      tx.objectStore(STORE_TTS_CACHE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
