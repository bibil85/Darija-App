import React, { useState, useEffect, useRef } from 'react';
import { WORD_BY_ID, WORDS } from '../constants.ts';
import { ParentSettings, ProgressData, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { StickerOasisScene } from '../engine/scenes/StickerOasisScene.ts';
import { speakWord } from '../services/audioService.ts';
import { playClickSound, playFanfareSound, playPopSound } from '../services/soundService.ts';

interface StickerOasisProps {
  sceneManager: SceneManager | null;
  progress: ProgressData;
  settings: ParentSettings;
  onPlaceSticker: (wordId: string) => void;
  onMoveSticker: (uid: string, x: number, y: number) => void;
  onClearScene: () => void;
  onRedeemSurprise: () => Word | null;
}

export const StickerOasis: React.FC<StickerOasisProps> = ({
  sceneManager,
  progress,
  settings,
  onPlaceSticker,
  onMoveSticker,
  onClearScene,
  onRedeemSurprise,
}) => {
  const [activeWord, setActiveWord] = useState<Word | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<Word | null>(null);
  const sceneRef = useRef<StickerOasisScene | null>(null);

  const lockedCount = WORDS.length - progress.unlockedWordIds.length;
  const canRedeem = progress.stars >= 3 && lockedCount > 0;

  useEffect(() => {
    if (!sceneManager) return;
    const scene = new StickerOasisScene(progress.placedStickers, {
      onTapFigurine: (wordId) => {
        const w = WORD_BY_ID[wordId];
        if (w) {
          setActiveWord(w);
          speakWord(w);
        }
      },
      onMoveFigurine: (uid, xPct, yPct) => {
        onMoveSticker(uid, xPct, yPct);
      },
    });
    sceneRef.current = scene;
    sceneManager.setScene(scene);

    return () => {
      sceneRef.current = null;
    };
  }, [sceneManager]);

  // Keep 3D courtyard figurines synced with progress state
  useEffect(() => {
    sceneRef.current?.syncStickers(progress.placedStickers);
  }, [progress.placedStickers]);

  const handleTrayTap = (word: Word, unlocked: boolean) => {
    if (!unlocked) {
      playClickSound();
      return;
    }
    playPopSound();
    setActiveWord(word);
    speakWord(word);
    onPlaceSticker(word.id);
  };

  const handleSurprise = () => {
    const unlocked = onRedeemSurprise();
    if (unlocked) {
      playFanfareSound();
      sceneManager?.triggerCelebration();
      setJustUnlocked(unlocked);
      setActiveWord(unlocked);
      speakWord(unlocked);
      window.setTimeout(() => setJustUnlocked(null), 2600);
    }
  };

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between gap-2">
      {/* Top Action Bar */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-kids text-lg sm:text-xl text-amber-900 leading-tight">
            3D Moroccan Toy Oasis ({progress.unlockedWordIds.length}/{WORDS.length})
          </h3>
          <p className="text-xs font-bold text-slate-500">
            Drag 3D toys around the courtyard &amp; tap them to bounce and speak Darija!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lockedCount > 0 && (
            <button
              onClick={handleSurprise}
              disabled={!canRedeem}
              className={`px-4 py-2 rounded-2xl font-kids text-sm border-b-4 transition-all ${
                canRedeem
                  ? 'bg-saffron-400 hover:bg-saffron-500 text-amber-950 border-saffron-600 active:translate-y-0.5 active:border-b-0 shadow'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              Unlock 3D Toy (3 Stars)
            </button>
          )}
          {progress.placedStickers.length > 0 && (
            <button
              onClick={() => {
                playClickSound();
                onClearScene();
              }}
              className="px-3.5 py-2 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs sm:text-sm"
            >
              Clear Courtyard
            </button>
          )}
        </div>
      </div>

      {/* Center Spoken Callout */}
      <div className="pointer-events-none flex flex-col items-center gap-2">
        {activeWord && (
          <div className="bg-white/95 backdrop-blur border-4 border-saffron-400 px-5 py-1.5 rounded-full shadow-lg flex items-center gap-2.5 animate-pop">
            <span className="font-kids text-xl sm:text-2xl" style={{ color: activeWord.accentHex }}>
              {activeWord.darija}
            </span>
            {settings.showArabic && (
              <span className="font-arabic text-xl font-bold text-majorelle-500" dir="rtl">
                {activeWord.arabic}
              </span>
            )}
            {settings.showEnglish && (
              <span className="text-xs font-bold text-slate-400">({activeWord.english})</span>
            )}
          </div>
        )}
        {justUnlocked && (
          <div className="bg-emerald-500 text-white font-kids text-lg px-5 py-1.5 rounded-full shadow-xl animate-bounce">
            Unlocked {justUnlocked.darija}!
          </div>
        )}
      </div>

      {/* Compact Horizontal 3D Toy Tray at Bottom */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl p-2.5 shadow-xl">
        <div className="allow-scroll-x flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {WORDS.map((word) => {
            const unlocked = progress.unlockedWordIds.includes(word.id);
            return (
              <button
                key={word.id}
                type="button"
                onClick={() => handleTrayTap(word, unlocked)}
                className={`px-3.5 py-2 rounded-2xl font-kids text-xs sm:text-sm whitespace-nowrap border-2 transition-all flex-shrink-0 ${
                  unlocked
                    ? 'bg-white border-amber-200 hover:border-majorelle-400 text-amber-900 shadow-sm active:scale-95'
                    : 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-default'
                }`}
              >
                {unlocked ? word.darija : 'Locked'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
