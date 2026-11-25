import React, { useState, useRef } from 'react';
import { WORD_BY_ID, WORDS } from '../constants.ts';
import { ParentSettings, PlacedSticker, ProgressData, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { speakWord } from '../services/audioService.ts';
import { playClickSound, playFanfareSound, playPopSound } from '../services/soundService.ts';

interface StickerOasisProps {
  progress: ProgressData;
  settings: ParentSettings;
  onPlaceSticker: (wordId: string) => void;
  onMoveSticker: (uid: string, x: number, y: number) => void;
  onRemoveSticker: (uid: string) => void;
  onClearScene: () => void;
  onRedeemSurprise: () => Word | null;
}

export const StickerOasis: React.FC<StickerOasisProps> = ({
  progress,
  settings,
  onPlaceSticker,
  onMoveSticker,
  onRemoveSticker,
  onClearScene,
  onRedeemSurprise,
}) => {
  const [bouncingUid, setBouncingUid] = useState<string | null>(null);
  const [draggingUid, setDraggingUid] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<Word | null>(null);
  const [justUnlocked, setJustUnlocked] = useState<Word | null>(null);

  const sceneRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const lockedCount = WORDS.length - progress.unlockedWordIds.length;
  const canRedeem = progress.stars >= 3 && lockedCount > 0;

  const handleStickerPointerDown = (
    sticker: PlacedSticker,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    setDraggingUid(sticker.uid);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleStickerPointerMove = (
    sticker: PlacedSticker,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (draggingUid !== sticker.uid || !sceneRef.current || !dragStartRef.current) return;
    if (Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y) > 8) {
      dragStartRef.current.moved = true;
    }
    const rect = sceneRef.current.getBoundingClientRect();
    const xPct = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(14, Math.min(86, ((e.clientY - rect.top) / rect.height) * 100));
    onMoveSticker(sticker.uid, xPct, yPct);
  };

  const handleStickerPointerUp = (sticker: PlacedSticker) => {
    if (draggingUid !== sticker.uid) return;
    const wasTap = !dragStartRef.current?.moved;
    dragStartRef.current = null;
    setDraggingUid(null);

    const word = WORD_BY_ID[sticker.wordId];
    if (word && wasTap) {
      playPopSound();
      setBouncingUid(sticker.uid);
      setActiveWord(word);
      speakWord(word);
      window.setTimeout(() => setBouncingUid(null), 600);
    }
  };

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
      setJustUnlocked(unlocked);
      setActiveWord(unlocked);
      speakWord(unlocked);
      window.setTimeout(() => setJustUnlocked(null), 2600);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 border-4 border-amber-200 rounded-3xl px-4 sm:px-5 py-2.5 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌴</span>
          <div>
            <h3 className="font-kids text-xl sm:text-2xl text-amber-800 leading-tight">
              My Moroccan Sticker Oasis
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              {progress.unlockedWordIds.length} / {WORDS.length} stickers — drag stickers anywhere &amp; tap to hear!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lockedCount > 0 && (
            <button
              onClick={handleSurprise}
              disabled={!canRedeem}
              className={`px-4 py-2 rounded-2xl font-kids text-sm sm:text-base border-b-4 transition-all ${
                canRedeem
                  ? 'bg-saffron-400 hover:bg-saffron-500 text-amber-950 border-saffron-600 active:translate-y-0.5 active:border-b-0 shadow-md'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              🎁 Unlock Sticker (3 ⭐)
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
              Clear Scene
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Animated Moroccan Kasbah Oasis + Sticker Tray */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">
        {/* Living Animated Moroccan Garden Scene */}
        <div
          ref={sceneRef}
          className="relative flex-1 min-h-[240px] rounded-[2rem] border-4 border-amber-300 overflow-hidden shadow-inner bg-gradient-to-b from-sky-300 via-amber-100 to-amber-200"
        >
          {/* Living Animated Moroccan Kasbah & Swaying Palms SVG */}
          <svg
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            {/* Glowing Sun */}
            <g className="animate-sun-spin" style={{ transformOrigin: '640px 72px' }}>
              <circle cx="640" cy="72" r="36" fill="#FDE047" opacity="0.9" />
              <circle cx="640" cy="72" r="48" fill="#FEF08A" opacity="0.35" />
            </g>
            {/* Drifting Sunlit Clouds */}
            <g className="animate-cloud-drift" opacity="0.88">
              <path d="M120 90 C96 90 92 64 114 58 C118 36 154 30 168 48 C184 34 220 42 222 64 C244 68 242 90 218 90 Z" fill="#FFFFFF" />
            </g>
            <g className="animate-cloud-drift" style={{ animationDelay: '-5s' }} opacity="0.78">
              <path d="M440 76 C422 76 420 58 436 54 C440 38 468 34 478 48 C490 38 516 44 518 58 C534 62 532 76 514 76 Z" fill="#FFFFFF" />
            </g>
            {/* Desert Dunes */}
            <path d="M0 320 Q180 240 400 300 T800 280 L800 450 L0 450 Z" fill="#FCD34D" opacity="0.65" />
            {/* Kasbah Silhouette */}
            <g fill="#E59866" stroke="#C96A3B" strokeWidth="3">
              <rect x="260" y="190" width="280" height="140" rx="8" />
              <rect x="240" y="150" width="58" height="180" rx="6" />
              <rect x="502" y="150" width="58" height="180" rx="6" />
              <path d="M362 330 L362 256 Q400 218 438 256 L438 330 Z" fill="#1D5FD1" stroke="#1E3A8A" />
              <rect x="258" y="182" width="22" height="30" rx="11" fill="#FEF3C7" />
              <rect x="520" y="182" width="22" height="30" rx="11" fill="#FEF3C7" />
            </g>
            {/* Oasis Pool with Animated Ripples & Green Grass */}
            <path d="M0 330 Q220 295 440 325 T800 315 L800 450 L0 450 Z" fill="#86EFAC" />
            <ellipse cx="400" cy="390" rx="184" ry="38" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
            <ellipse cx="400" cy="390" rx="110" ry="18" fill="none" stroke="#E0F2FE" strokeWidth="3" strokeDasharray="16 14" className="animate-pulse" />
            {/* Swaying Palm Tree Left */}
            <g className="animate-sway" style={{ transformOrigin: '106px 340px' }}>
              <path d="M106 340 Q118 250 96 170" fill="none" stroke="#92400E" strokeWidth="18" strokeLinecap="round" />
              <g fill="#16A34A">
                <ellipse cx="64" cy="166" rx="44" ry="14" transform="rotate(-18 64 166)" />
                <ellipse cx="132" cy="168" rx="44" ry="14" transform="rotate(18 132 168)" />
                <ellipse cx="96" cy="144" rx="42" ry="14" transform="rotate(-48 96 144)" />
              </g>
            </g>
            {/* Swaying Palm Tree Right */}
            <g className="animate-sway" style={{ transformOrigin: '704px 345px', animationDelay: '-1.5s' }}>
              <path d="M704 345 Q688 260 710 185" fill="none" stroke="#92400E" strokeWidth="16" strokeLinecap="round" />
              <g fill="#16A34A">
                <ellipse cx="674" cy="182" rx="40" ry="13" transform="rotate(-20 674 182)" />
                <ellipse cx="742" cy="184" rx="40" ry="13" transform="rotate(18 742 184)" />
              </g>
            </g>
          </svg>

          {/* Active Spoken Word Pill */}
          {activeWord && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 border-4 border-saffron-400 px-5 py-1.5 rounded-full shadow-lg flex items-center gap-2.5 animate-pop">
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
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-white font-kids text-lg px-5 py-2 rounded-full shadow-xl animate-bounce">
              🎉 Unlocked {justUnlocked.darija}!
            </div>
          )}

          {/* Placed Freely Draggable Interactive Stickers */}
          {progress.placedStickers.map((sticker) => {
            const word = WORD_BY_ID[sticker.wordId];
            if (!word) return null;
            const isBouncing = bouncingUid === sticker.uid;
            const isDragging = draggingUid === sticker.uid;

            return (
              <div
                key={sticker.uid}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group select-none ${
                  isDragging ? 'z-30 scale-115' : 'z-10'
                }`}
                style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => handleStickerPointerDown(sticker, e)}
                  onPointerMove={(e) => handleStickerPointerMove(sticker, e)}
                  onPointerUp={() => handleStickerPointerUp(sticker)}
                  onPointerCancel={() => handleStickerPointerUp(sticker)}
                  aria-label={`${word.english} sticker — drag to move or tap to hear`}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 border-4 border-white shadow-lg p-1.5 transition-transform touch-none cursor-grab active:cursor-grabbing ${
                    isBouncing ? 'animate-jelly ring-4 ring-saffron-400' : 'hover:scale-110'
                  }`}
                >
                  <WordIllustration wordId={word.id} className="w-full h-full pointer-events-none" />
                </div>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSticker(sticker.uid);
                  }}
                  aria-label={`Remove ${word.english}`}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold shadow flex items-center justify-center transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {/* Sticker Collection Tray */}
        <div className="w-full lg:w-80 bg-white/95 border-4 border-amber-200 rounded-[2rem] p-3 flex flex-col max-h-48 lg:max-h-full overflow-hidden shadow-sm">
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 px-2 mb-2 flex-shrink-0">
            Tap an unlocked sticker to add it!
          </div>
          <div className="flex-1 overflow-y-auto grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-3 gap-2 pr-1">
            {WORDS.map((word) => {
              const unlocked = progress.unlockedWordIds.includes(word.id);
              return (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => handleTrayTap(word, unlocked)}
                  title={unlocked ? `${word.darija} (${word.english})` : 'Play games to unlock!'}
                  className={`aspect-square rounded-2xl p-1.5 border-2 flex flex-col items-center justify-center transition-all ${
                    unlocked
                      ? 'border-amber-200 hover:border-majorelle-400 active:scale-90 shadow-sm'
                      : 'border-slate-200 bg-slate-100 opacity-45 grayscale cursor-default'
                  }`}
                  style={unlocked ? { backgroundColor: word.bgHex } : undefined}
                >
                  <WordIllustration wordId={word.id} animated={false} className="w-4/5 h-4/5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
