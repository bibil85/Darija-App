import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES, WORDS } from '../constants.ts';
import { CategoryType, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import {
  clearTTSCache,
  countCachedTTS,
  deleteParentRecording,
  listParentRecordingIds,
  saveParentRecording,
} from '../services/storageService.ts';
import { hasGeminiApiKey } from '../services/geminiService.ts';
import { getAudioDiagnostics, speakWord, warmAudioCaches } from '../services/audioService.ts';
import { playClickSound, playSuccessSound } from '../services/soundService.ts';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

interface ParentStudioProps {
  settings: ParentSettings;
  onUpdateSettings: (next: ParentSettings) => void;
  onUnlockAllStickers: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const ParentStudio: React.FC<ParentStudioProps> = ({
  settings,
  onUpdateSettings,
  onUnlockAllStickers,
  onResetProgress,
  onClose,
}) => {
  const [selectedCat, setSelectedCat] = useState<CategoryType>(CategoryType.ANIMALS);
  const [recordings, setRecordings] = useState<Record<string, string>>({});
  const [cachedTTSCount, setCachedTTSCount] = useState(0);
  const [recordingWordId, setRecordingWordId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [diag, setDiag] = useState(() => getAudioDiagnostics());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const refreshCounts = async () => {
    const [recs, ttsCount] = await Promise.all([
      listParentRecordingIds(),
      countCachedTTS(),
    ]);
    setRecordings(recs);
    setCachedTTSCount(ttsCount);
  };

  useEffect(() => {
    refreshCounts();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecordingWordId(null);
  };

  const startRecording = async (word: Word) => {
    setMicError(null);
    if (recordingWordId === word.id) {
      stopRecording();
      return;
    }
    if (recordingWordId) {
      stopRecording();
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const preferredTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', ''];
      const mimeType = preferredTypes.find((t) => t === '' || MediaRecorder.isTypeSupported(t)) || '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        // Critical iPad Safari fix: releasing getUserMedia leaves AudioContext 'interrupted' — re-unlock now!
        SoundFXEngine.unlock();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/mp4' });
        if (blob.size > 0) {
          await saveParentRecording({
            wordId: word.id,
            blob,
            mimeType: blob.type,
            speakerLabel: settings.voiceLabel,
            updatedAt: Date.now(),
          });
          await warmAudioCaches();
          playSuccessSound();
          setStatusMsg(`Saved ${settings.voiceLabel}'s voice for "${word.darija}"!`);
          await refreshCounts();
          setDiag(getAudioDiagnostics());
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingWordId(word.id);
    } catch {
      setMicError('Please allow microphone access in Safari/iPad settings to record your voice.');
    }
  };

  const handleDeleteRecording = async (word: Word) => {
    playClickSound();
    await deleteParentRecording(word.id);
    await warmAudioCaches();
    setStatusMsg(`Removed custom recording for "${word.darija}".`);
    await refreshCounts();
    setDiag(getAudioDiagnostics());
  };

  const handleClearTTS = async () => {
    playClickSound();
    await clearTTSCache();
    await warmAudioCaches();
    setStatusMsg('Cleared cached Gemini TTS audio.');
    await refreshCounts();
    setDiag(getAudioDiagnostics());
  };

  const handleTestIPadAudio = async () => {
    SoundFXEngine.unlock();
    playSuccessSound();
    const res = await speakWord(WORDS[0]);
    const nextDiag = getAudioDiagnostics();
    setDiag(nextDiag);
    setStatusMsg(
      `Audio test complete! Engine: ${nextDiag.state}, Voice: ${res.source} (${nextDiag.arabicVoiceName})`
    );
  };

  const wordsInCat = WORDS.filter((w) => w.category === selectedCat);
  const recordedCount = Object.keys(recordings).length;
  const geminiEnabled = hasGeminiApiKey();

  return (
    <div
      className="pointer-events-auto h-full overflow-y-auto bg-sand-50/95 backdrop-blur-md rounded-[2rem] border-4 border-white p-4 sm:p-5 flex flex-col gap-4 pb-6 shadow-2xl"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Header Banner */}
      <div className="bg-white border-4 border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div>
          <h2 className="font-kids text-2xl sm:text-3xl text-slate-800">
            🔒 Grown-Up Studio &amp; Voice Recorder
          </h2>
          <p className="text-sm font-bold text-slate-500">
            Record Mama or Baba saying Darija words for Nora &amp; Sophia — works 100% offline on iPad!
          </p>
        </div>
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="px-5 py-2.5 rounded-2xl bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-lg border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0"
        >
          Done ✓
        </button>
      </div>

      {/* Settings & Audio Diagnostics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border-4 border-amber-200 rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm">
          <h3 className="font-kids text-xl text-amber-800">Display &amp; Sound Settings</h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-bold text-slate-700">Show Arabic Script (العربية)</div>
              <div className="text-xs text-slate-500">Shows Moroccan Arabic script alongside Arabizi</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showArabic}
              onChange={(e) => onUpdateSettings({ ...settings, showArabic: e.target.checked })}
              className="w-6 h-6 accent-majorelle-500"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-bold text-slate-700">Show English Helper Labels</div>
              <div className="text-xs text-slate-500">Helpful translation cues for parents</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showEnglish}
              onChange={(e) => onUpdateSettings({ ...settings, showEnglish: e.target.checked })}
              className="w-6 h-6 accent-majorelle-500"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-bold text-slate-700">Playful Sound Effects</div>
              <div className="text-xs text-slate-500">Chimes, bubble pops, and cheers</div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEffects}
              onChange={(e) => onUpdateSettings({ ...settings, soundEffects: e.target.checked })}
              className="w-6 h-6 accent-majorelle-500"
            />
          </div>

          <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100">
            <button
              onClick={() => {
                playSuccessSound();
                onUnlockAllStickers();
                setStatusMsg(`All ${WORDS.length} stickers unlocked in the Oasis!`);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs"
            >
              🌟 Unlock All {WORDS.length} Stickers
            </button>
            <button
              onClick={() => {
                playClickSound();
                onResetProgress();
                setStatusMsg('Stars and stickers reset.');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs"
            >
              Reset Progress
            </button>
          </div>
        </div>

        <div className="bg-white border-4 border-sky-200 rounded-3xl p-4 sm:p-5 space-y-3 shadow-sm">
          <h3 className="font-kids text-xl text-sky-800">Hybrid Darija Audio Engine</h3>
          <ol className="text-sm font-bold text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>
              <span className="text-rose-600">Parent Voice (Highest Priority):</span>{' '}
              {recordedCount} / {WORDS.length} words recorded on this iPad
            </li>
            <li>
              <span className="text-majorelle-600">Cached Gemini TTS:</span>{' '}
              {geminiEnabled ? 'API Key Active' : 'No VITE_GEMINI_API_KEY set'} • {cachedTTSCount} cached offline
            </li>
            <li>
              <span className="text-emerald-600">Instant iPad/Browser Speech Fallback:</span> Always ready offline
            </li>
          </ol>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestIPadAudio}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-kids text-xs sm:text-sm shadow-sm active:scale-95 transition-transform"
            >
              Test iPad Sound &amp; Voice
            </button>
            <span className="text-[11px] font-bold text-slate-500">
              Engine: <strong className="text-slate-700">{diag.state}</strong> • Voices: {diag.voiceCount} • Session: {diag.audioSessionType}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-extrabold uppercase text-slate-500">Recording as:</span>
            {(['Mama', 'Baba', 'Family'] as const).map((label) => (
              <button
                key={label}
                onClick={() => onUpdateSettings({ ...settings, voiceLabel: label })}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  settings.voiceLabel === label
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ❤️ {label}
              </button>
            ))}

            {cachedTTSCount > 0 && (
              <button
                onClick={handleClearTTS}
                className="ml-auto px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
              >
                Clear TTS Cache
              </button>
            )}
          </div>
        </div>
      </div>

      {micError && (
        <div className="bg-rose-100 border-2 border-rose-300 text-rose-800 font-bold text-sm px-4 py-2.5 rounded-2xl">
          ⚠️ {micError}
        </div>
      )}
      {statusMsg && (
        <div className="bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-bold text-sm px-4 py-2.5 rounded-2xl">
          ✅ {statusMsg}
        </div>
      )}

      {/* Voice Recording Word List */}
      <div className="bg-white border-4 border-amber-200 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-kids text-xl text-amber-800">
            🎙️ Record Words ({recordedCount}/{WORDS.length})
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? `${cat.bgClass} text-white shadow-sm`
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-white/90 p-0.5 inline-flex">
                  <WordIllustration wordId={cat.icon} animated={false} className="w-full h-full" />
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wordsInCat.map((word) => {
            const speaker = recordings[word.id];
            const isRec = recordingWordId === word.id;

            return (
              <div
                key={word.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border-2 border-slate-100 bg-sand-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl p-1 flex-shrink-0"
                    style={{ backgroundColor: word.bgHex }}
                  >
                    <WordIllustration wordId={word.id} animated={false} className="w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-kids text-lg text-slate-800">{word.darija}</span>
                      <span className="font-arabic text-base font-bold text-majorelle-500" dir="rtl">
                        {word.arabic}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 truncate">
                      {word.english} • {word.phonetics}
                      {speaker && (
                        <span className="ml-2 text-rose-600 font-extrabold">❤️ {speaker}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => speakWord(word)}
                    aria-label={`Play ${word.darija}`}
                    className="px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => startRecording(word)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                      isRec
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
                    }`}
                  >
                    {isRec ? '⏹ Stop' : speaker ? '🎙️ Redo' : '🎙️ Rec'}
                  </button>
                  {speaker && (
                    <button
                      onClick={() => handleDeleteRecording(word)}
                      aria-label={`Delete recording for ${word.darija}`}
                      className="px-2.5 py-2 rounded-xl bg-slate-200 hover:bg-rose-200 text-slate-600 hover:text-rose-700 font-bold text-xs"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
