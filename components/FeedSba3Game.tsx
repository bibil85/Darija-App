import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, CategoryType, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { Mascot, MascotMood } from './Mascot.tsx';
import { CelebrationModal } from './MoroccanDecor.tsx';
import { speakShortPhrase, speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playPopSound,
  playSuccessSound,
} from '../services/soundService.ts';

interface FeedSba3GameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

/**
 * Feed Sba3! — Intuitive Drag-to-Mouth Darija Food Game!
 * Kids drag yummy Moroccan food directly into Sba3 the Lion's mouth (or tap it!)
 * Sba3 opens his mouth wide when food approaches and CHOMPS with crumbs & "Bessa7a!"
 */
export const FeedSba3Game: React.FC<FeedSba3GameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isNora = ageMode === 'little';
  const totalRounds = isNora ? 4 : 5;
  const choiceCount = isNora ? 2 : 3;

  const [queue, setQueue] = useState<Word[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [plateFoods, setPlateFoods] = useState<Word[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isNearMouth, setIsNearMouth] = useState(false);
  const [sba3Mood, setSba3Mood] = useState<MascotMood>('hungry');
  const [wiggleFoodId, setWiggleFoodId] = useState<string | null>(null);
  const [crumbsKey, setCrumbsKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const mouthZoneRef = useRef<HTMLDivElement | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const foodWords = WORDS.filter((w) => w.category === CategoryType.FOOD);

  const setupRound = useCallback(
    (q: Word[], idx: number) => {
      const target = q[idx];
      if (!target) return;
      const others = shuffleArray(foodWords.filter((w) => w.id !== target.id)).slice(
        0,
        choiceCount - 1
      );
      setPlateFoods(shuffleArray([target, ...others]));
      setSba3Mood('hungry');
      setDraggingId(null);
      setIsNearMouth(false);
      setWiggleFoodId(null);

      addTimer(() => speakWord(target), 350);
    },
    [choiceCount]
  );

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const q = shuffleArray(foodWords).slice(0, totalRounds);
    setQueue(q);
    setRoundIdx(0);
    setFinished(false);
    setUnlockedSticker(null);
    setupRound(q, 0);
  }, [setupRound, totalRounds]);

  useEffect(() => {
    startGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [startGame]);

  const targetFood = queue[roundIdx] || null;

  const attemptFeed = (food: Word) => {
    if (!targetFood || sba3Mood === 'chomp' || finished) return;

    if (food.id === targetFood.id) {
      setSba3Mood('chomp');
      setCrumbsKey((k) => k + 1);
      playPopSound();
      playSuccessSound();
      speakWord(food);
      addTimer(() => speakShortPhrase('Bessa7a!', 'بالصحة!'), 650);

      if (roundIdx + 1 >= totalRounds) {
        addTimer(() => {
          playFanfareSound();
          const sticker = onReward(isNora ? 2 : 3, food.id);
          setUnlockedSticker(sticker);
          setFinished(true);
        }, 1250);
      } else {
        addTimer(() => {
          const next = roundIdx + 1;
          setRoundIdx(next);
          setupRound(queue, next);
        }, 1350);
      }
    } else {
      playGentleBoing();
      setWiggleFoodId(food.id);
      speakWord(food);
      addTimer(() => setWiggleFoodId(null), 500);
    }
  };

  const checkMouthHit = (clientX: number, clientY: number) => {
    const rect = mouthZoneRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pad = 36;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const handleFoodPointerDown = (food: Word, e: React.PointerEvent<HTMLDivElement>) => {
    if (sba3Mood === 'chomp' || finished) return;
    dragOriginRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    setDraggingId(food.id);
    setDragPos({ x: 0, y: 0 });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleFoodPointerMove = (food: Word, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== food.id || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.x;
    const dy = e.clientY - dragOriginRef.current.y;
    setDragPos({ x: dx, y: dy });
    setIsNearMouth(checkMouthHit(e.clientX, e.clientY));
  };

  const handleFoodPointerUp = (food: Word, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId !== food.id || !dragOriginRef.current) return;
    const dx = e.clientX - dragOriginRef.current.x;
    const dy = e.clientY - dragOriginRef.current.y;
    const moved = Math.hypot(dx, dy);
    const droppedOnMouth = checkMouthHit(e.clientX, e.clientY);

    dragOriginRef.current = null;
    setDraggingId(null);
    setDragPos({ x: 0, y: 0 });
    setIsNearMouth(false);

    // Feed if dragged onto Sba3 OR cleanly tapped!
    if (droppedOnMouth || moved < 16) {
      attemptFeed(food);
    }
  };

  if (!targetFood) return null;

  return (
    <div className="h-full flex flex-col items-center justify-between gap-3">
      {/* Top Progress Strip */}
      <div className="w-full max-w-4xl bg-white/95 border-4 border-rose-200 rounded-3xl px-5 py-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍽️</span>
          <div>
            <h3 className="font-kids text-xl sm:text-2xl text-rose-600 leading-tight">
              Feed Sba3! Drag the yummy food to his mouth!
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500">
              {isNora
                ? 'Drag or tap the food Sba3 is dreaming of!'
                : 'Listen to the Darija food and drag it to Sba3!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`text-xl sm:text-2xl ${
                i < roundIdx || (i === roundIdx && sba3Mood === 'chomp')
                  ? 'scale-110'
                  : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Center Stage: Hungry Sba3 + Dreaming Thought Bubble */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-4 sm:gap-8 relative">
        <div
          ref={mouthZoneRef}
          className={`relative rounded-full p-3 transition-all duration-300 ${
            isNearMouth
              ? 'bg-saffron-400/35 scale-110 ring-8 ring-saffron-400/50'
              : 'bg-amber-100/60'
          }`}
        >
          <Mascot
            mood={sba3Mood}
            size={185}
            onClick={() => speakWord(targetFood)}
          />
          {crumbsKey > 0 && sba3Mood === 'chomp' && (
            <div key={crumbsKey} className="pointer-events-none absolute inset-0">
              <span className="absolute top-6 left-4 text-3xl animate-sparkle">✨</span>
              <span className="absolute top-4 right-4 text-3xl animate-sparkle">🌟</span>
              <span className="absolute bottom-8 right-2 text-2xl animate-sparkle">😋</span>
            </div>
          )}
        </div>

        {/* Sba3's Thought Bubble */}
        <button
          type="button"
          onClick={() => speakWord(targetFood)}
          className="relative bg-white border-4 border-saffron-400 rounded-[2rem] px-5 py-3.5 shadow-xl flex flex-col items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            🔊 Sba3 wants:
          </span>
          {/* Nora gets a clear picture clue in the thought bubble; Sophia listens first! */}
          {isNora && (
            <div className="w-16 h-16 rounded-2xl p-1" style={{ backgroundColor: targetFood.bgHex }}>
              <WordIllustration wordId={targetFood.id} animated={false} className="w-full h-full" />
            </div>
          )}
          <div className="font-kids text-2xl sm:text-3xl" style={{ color: targetFood.accentHex }}>
            {targetFood.darija}
          </div>
          {settings.showArabic && (
            <div className="font-arabic text-xl font-bold text-majorelle-500" dir="rtl">
              {targetFood.arabic}
            </div>
          )}
        </button>
      </div>

      {/* Bottom Draggable Food Plate */}
      <div className="w-full max-w-3xl bg-white/90 border-4 border-amber-200 rounded-[2.25rem] p-3.5 sm:p-4 shadow-md flex-shrink-0">
        <div className={`grid gap-4 ${isNora ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {plateFoods.map((food) => {
            const isDragging = draggingId === food.id;
            const isWiggling = wiggleFoodId === food.id;

            return (
              <div
                key={food.id}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => handleFoodPointerDown(food, e)}
                onPointerMove={(e) => handleFoodPointerMove(food, e)}
                onPointerUp={(e) => handleFoodPointerUp(food, e)}
                onPointerCancel={(e) => handleFoodPointerUp(food, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    attemptFeed(food);
                  }
                }}
                aria-label={`Feed ${food.english} (${food.darija})`}
                className={`relative rounded-[1.75rem] border-4 border-white p-3 flex flex-col items-center justify-center shadow-lg select-none touch-none cursor-grab active:cursor-grabbing ${
                  isDragging ? 'z-50 scale-115 shadow-2xl ring-4 ring-saffron-400' : 'hover:scale-105 transition-transform'
                } ${isWiggling ? 'animate-wiggle' : ''}`}
                style={{
                  backgroundColor: food.bgHex,
                  transform: isDragging
                    ? `translate3d(${dragPos.x}px, ${dragPos.y}px, 0) scale(1.12)`
                    : undefined,
                }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 pointer-events-none">
                  <WordIllustration wordId={food.id} className="w-full h-full" />
                </div>
                <span className="font-kids text-lg sm:text-xl mt-0.5 pointer-events-none" style={{ color: food.accentHex }}>
                  {food.darija}
                </span>
              </div>
            );
          })}
        </div>
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
