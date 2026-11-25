import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORY_BY_ID, WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, CategoryType, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { CelebrationModal } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playSuccessSound,
} from '../services/soundService.ts';

interface SortingGameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

/**
 * Drag-and-Drop (or Tap!) Sort Baskets Game:
 * Drag the living illustrated card directly into the glowing Moroccan basket —
 * or tap a basket directly for 2-year-old Nora!
 */
export const SortingGame: React.FC<SortingGameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isNora = ageMode === 'little';
  const totalRounds = isNora ? 5 : 6;
  const basketCategories: CategoryType[] = isNora
    ? [CategoryType.ANIMALS, CategoryType.FOOD]
    : [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.NATURE];

  const [queue, setQueue] = useState<Word[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [wiggleCat, setWiggleCat] = useState<CategoryType | null>(null);
  const [matchedCat, setMatchedCat] = useState<CategoryType | null>(null);
  const [hoveredCat, setHoveredCat] = useState<CategoryType | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const basketRefs = useRef<Partial<Record<CategoryType, HTMLButtonElement | null>>>({});
  const dragOriginRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const cats = isNora
      ? [CategoryType.ANIMALS, CategoryType.FOOD]
      : [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.NATURE];

    const pool = shuffleArray(WORDS.filter((w) => cats.includes(w.category))).slice(0, totalRounds);
    setQueue(pool);
    setRoundIdx(0);
    setWiggleCat(null);
    setMatchedCat(null);
    setHoveredCat(null);
    setIsDragging(false);
    setDragPos({ x: 0, y: 0 });
    setFinished(false);
    setUnlockedSticker(null);

    if (pool[0]) {
      addTimer(() => speakWord(pool[0]), 320);
    }
  }, [isNora, totalRounds]);

  useEffect(() => {
    startGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [startGame]);

  const currentWord = queue[roundIdx] || null;

  const handleBasketPick = (catId: CategoryType) => {
    if (!currentWord || matchedCat || finished) return;

    if (catId === currentWord.category) {
      setMatchedCat(catId);
      playSuccessSound();
      speakWord(currentWord);

      if (roundIdx + 1 >= totalRounds) {
        addTimer(() => {
          playFanfareSound();
          const sticker = onReward(isNora ? 2 : 3, currentWord.id);
          setUnlockedSticker(sticker);
          setFinished(true);
        }, 1050);
      } else {
        addTimer(() => {
          const nextIdx = roundIdx + 1;
          setRoundIdx(nextIdx);
          setMatchedCat(null);
          if (queue[nextIdx]) speakWord(queue[nextIdx]);
        }, 1050);
      }
    } else {
      playGentleBoing();
      setWiggleCat(catId);
      addTimer(() => setWiggleCat(null), 480);
    }
  };

  const findHitBasket = (clientX: number, clientY: number): CategoryType | null => {
    for (const catId of basketCategories) {
      const el = basketRefs.current[catId];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - 12 &&
        clientX <= rect.right + 12 &&
        clientY >= rect.top - 16 &&
        clientY <= rect.bottom + 12
      ) {
        return catId;
      }
    }
    return null;
  };

  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!currentWord || matchedCat || finished) return;
    dragOriginRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    setIsDragging(true);
    setDragPos({ x: 0, y: 0 });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragOriginRef.current) return;
    setDragPos({
      x: e.clientX - dragOriginRef.current.x,
      y: e.clientY - dragOriginRef.current.y,
    });
    setHoveredCat(findHitBasket(e.clientX, e.clientY));
  };

  const handleCardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.x;
    const dy = e.clientY - dragOriginRef.current.y;
    const hitCat = findHitBasket(e.clientX, e.clientY);

    dragOriginRef.current = null;
    setIsDragging(false);
    setDragPos({ x: 0, y: 0 });
    setHoveredCat(null);

    if (hitCat) {
      handleBasketPick(hitCat);
    } else if (Math.hypot(dx, dy) < 15 && currentWord) {
      speakWord(currentWord);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="h-full flex flex-col items-center justify-between gap-4">
      {/* Top Progress Strip */}
      <div className="w-full max-w-4xl bg-white/95 border-4 border-orange-200 rounded-3xl px-5 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧺</span>
          <div>
            <h3 className="font-kids text-xl sm:text-2xl text-terracotta-600 leading-tight">
              Drag Into the Matching Basket!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              Drag the picture into the right basket (or tap a basket)!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`text-xl sm:text-2xl ${
                i < roundIdx || (i === roundIdx && matchedCat)
                  ? 'scale-110'
                  : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Center Draggable Item Card */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        <div
          role="button"
          tabIndex={0}
          onPointerDown={handleCardPointerDown}
          onPointerMove={handleCardPointerMove}
          onPointerUp={handleCardPointerUp}
          onPointerCancel={handleCardPointerUp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              speakWord(currentWord);
            }
          }}
          aria-label={`Drag ${currentWord.english} (${currentWord.darija}) into a basket`}
          className={`relative w-52 h-52 sm:w-64 sm:h-64 rounded-[2.5rem] border-8 border-white pixar-card-sheen flex flex-col items-center justify-center p-4 select-none touch-none cursor-grab active:cursor-grabbing ${
            isDragging ? 'z-50 ring-4 ring-saffron-400 shadow-2xl' : 'transition-transform hover:scale-105'
          } ${matchedCat ? 'scale-110 ring-4 ring-emerald-400 animate-jelly' : ''}`}
          style={{
            backgroundColor: currentWord.bgHex,
            transform: isDragging
              ? `translate3d(${dragPos.x}px, ${dragPos.y}px, 0) scale(1.08) rotate(${dragPos.x * 0.04}deg)`
              : undefined,
          }}
        >
          <div className="w-3/4 h-3/4 pointer-events-none">
            <WordIllustration wordId={currentWord.id} className="w-full h-full" />
          </div>
          <div className="mt-1 flex items-center gap-2 pointer-events-none">
            <span className="font-kids text-2xl sm:text-3xl" style={{ color: currentWord.accentHex }}>
              {currentWord.darija}
            </span>
            {settings.showArabic && (
              <span className="font-arabic text-xl sm:text-2xl font-bold text-majorelle-500" dir="rtl">
                {currentWord.arabic}
              </span>
            )}
          </div>
          <span className="pointer-events-none absolute top-3 right-3 text-xl">🔊</span>
        </div>
      </div>

      {/* Big Tactile Moroccan Baskets (Glowing Drop Targets!) */}
      <div
        className={`w-full max-w-4xl grid gap-4 flex-shrink-0 pb-1 ${
          isNora ? 'grid-cols-2' : 'grid-cols-3'
        }`}
      >
        {basketCategories.map((catId) => {
          const meta = CATEGORY_BY_ID[catId];
          const isMatched = matchedCat === catId;
          const isHovered = hoveredCat === catId;
          const isWiggling = wiggleCat === catId;

          return (
            <button
              key={catId}
              ref={(el) => {
                basketRefs.current[catId] = el;
              }}
              type="button"
              onClick={() => handleBasketPick(catId)}
              className={`relative rounded-[2rem] p-3.5 sm:p-5 border-b-8 text-white shadow-xl flex flex-col items-center justify-center gap-1.5 transition-all active:translate-y-1 active:border-b-0 ${
                meta.bgClass
              } ${meta.borderClass} ${
                isHovered
                  ? 'scale-105 ring-8 ring-saffron-400/70 brightness-110'
                  : isMatched
                  ? 'scale-105 ring-4 ring-emerald-300'
                  : 'hover:brightness-105'
              } ${isWiggling ? 'animate-wiggle opacity-75' : ''}`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 p-1.5 shadow-sm">
                <WordIllustration wordId={meta.icon} className="w-full h-full" />
              </div>
              <span className="font-kids text-xl sm:text-2xl leading-tight">{meta.label}</span>
              <span className="text-xs sm:text-sm font-extrabold bg-black/15 px-3 py-0.5 rounded-full">
                {meta.darija}
              </span>
              {isMatched && (
                <span className="absolute -top-3 -right-2 text-4xl animate-pop">🌟</span>
              )}
            </button>
          );
        })}
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={isNora ? 2 : 3}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={startGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
