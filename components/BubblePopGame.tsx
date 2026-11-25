import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { CelebrationModal } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playPopSound,
  playSuccessSound,
} from '../services/soundService.ts';

interface BubbleItem {
  uid: number;
  word: Word;
  x: number; // % 12..88
  y: number; // % 0..108
  speed: number; // % per second
  swayPhase: number;
  size: number; // px
  tint: string;
}

interface PopBurst {
  id: number;
  x: number;
  y: number;
  word: Word;
}

interface BubblePopGameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

const BUBBLE_TINTS = [
  'rgba(255, 255, 255, 0.85)',
  'rgba(254, 243, 199, 0.88)',
  'rgba(224, 242, 254, 0.88)',
  'rgba(252, 231, 243, 0.88)',
  'rgba(209, 250, 229, 0.88)',
];

export const BubblePopGame: React.FC<BubblePopGameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isLittle = ageMode === 'little';
  const targetGoal = isLittle ? 8 : 5;

  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [lastPopped, setLastPopped] = useState<Word | null>(null);
  const [bursts, setBursts] = useState<PopBurst[]>([]);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const nextUidRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const makeBubble = useCallback((word: Word, startY?: number): BubbleItem => {
    const uid = nextUidRef.current++;
    return {
      uid,
      word,
      x: 14 + Math.random() * 72,
      y: startY ?? 95 + Math.random() * 20,
      speed: (isLittle ? 7 : 10) + Math.random() * 5,
      swayPhase: Math.random() * Math.PI * 2,
      size: isLittle ? 124 : 108,
      tint: BUBBLE_TINTS[uid % BUBBLE_TINTS.length],
    };
  }, [isLittle]);

  const initGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setPoppedCount(0);
    setLastPopped(null);
    setBursts([]);
    setShowHint(false);
    setFinished(false);
    setUnlockedSticker(null);

    const pool = shuffleArray(WORDS).slice(0, isLittle ? 6 : 7);
    const initial = pool.map((w, i) => makeBubble(w, 22 + ((i * 15) % 72)));
    setBubbles(initial);

    if (!isLittle) {
      const firstTarget = initial[0].word;
      setTargetWord(firstTarget);
      addTimer(() => {
        speakWord(firstTarget);
      }, 350);
    } else {
      setTargetWord(null);
    }
  }, [isLittle, makeBubble]);

  useEffect(() => {
    initGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [initGame]);

  // Smooth gentle floating animation loop
  useEffect(() => {
    if (finished) return;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      setBubbles((prev) =>
        prev.map((b) => {
          let nextY = b.y - b.speed * dt;
          let nextX = b.x + Math.sin(now / 750 + b.swayPhase) * 4.5 * dt;
          nextX = Math.max(10, Math.min(90, nextX));
          if (nextY < 4) {
            nextY = 104;
            nextX = 14 + Math.random() * 72;
          }
          return { ...b, x: nextX, y: nextY };
        })
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finished]);

  const handleBubblePop = (bubble: BubbleItem) => {
    if (finished) return;

    // 4+ Target Mode check
    if (!isLittle && targetWord && bubble.word.id !== targetWord.id) {
      playGentleBoing();
      speakWord(bubble.word);
      return;
    }

    playPopSound();
    speakWord(bubble.word);
    setLastPopped(bubble.word);

    const burstId = Date.now() + Math.random();
    setBursts((prev) => [...prev, { id: burstId, x: bubble.x, y: bubble.y, word: bubble.word }]);
    addTimer(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 850);

    const nextCount = poppedCount + 1;
    setPoppedCount(nextCount);

    // Replace popped bubble with a fresh word not currently on screen
    const replacementPool = shuffleArray(WORDS);
    const replacementWord = replacementPool[0];

    if (nextCount >= targetGoal) {
      playSuccessSound();
      addTimer(() => {
        playFanfareSound();
        const sticker = onReward(isLittle ? 2 : 3, bubble.word.id);
        setUnlockedSticker(sticker);
        setFinished(true);
      }, 650);
      setBubbles((prev) => prev.filter((b) => b.uid !== bubble.uid));
      return;
    }

    if (!isLittle) {
      playSuccessSound();
      setBubbles((prev) => {
        const remaining = prev.filter((b) => b.uid !== bubble.uid);
        const fresh = makeBubble(replacementWord, 102);
        const updated = [...remaining, fresh];
        const nextTarget = updated[Math.floor(Math.random() * updated.length)].word;
        setTargetWord(nextTarget);
        setShowHint(false);
        addTimer(() => speakWord(nextTarget), 750);
        return updated;
      });
    } else {
      setBubbles((prev) => [
        ...prev.filter((b) => b.uid !== bubble.uid),
        makeBubble(replacementWord, 102),
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Top Instruction / Progress Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 border-4 border-sky-200 rounded-3xl px-4 sm:px-6 py-3 shadow-sm flex-shrink-0">
        {isLittle ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">🫧</span>
            <div>
              <h3 className="font-kids text-xl sm:text-2xl text-sky-700 leading-tight">
                Pop any bubble!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Tap floating bubbles to hear Moroccan Darija!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => targetWord && speakWord(targetWord)}
              className="flex items-center gap-2 bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-lg sm:text-xl px-5 py-2.5 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow-md"
            >
              <span className="text-2xl">🔊</span>
              <span>Hear Word</span>
            </button>
            <span className="font-kids text-lg sm:text-xl text-sky-800">
              Pop the matching bubble!
            </span>
            {targetWord && (
              <button
                onClick={() => setShowHint((h) => !h)}
                className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full"
              >
                {showHint ? `${targetWord.darija} (${targetWord.english})` : '👀 Peek'}
              </button>
            )}
          </div>
        )}

        {/* Star Progress Bubbles */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: targetGoal }).map((_, i) => (
            <span
              key={i}
              className={`text-xl sm:text-2xl transition-transform duration-300 ${
                i < poppedCount ? 'scale-110' : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Illustrated Moroccan Courtyard Sky Bubble Stage */}
      <div className="relative flex-1 min-h-0 w-full rounded-[2.25rem] border-4 border-sky-300 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 overflow-hidden shadow-inner">
        {/* Decorative background clouds & Moroccan arch silhouette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-amber-200/70 to-transparent" />
        <div className="pointer-events-none absolute top-4 left-8 text-5xl opacity-35">☁️</div>
        <div className="pointer-events-none absolute top-10 right-12 text-6xl opacity-30">☁️</div>

        {/* Last Popped Big Word Callout */}
        {lastPopped && (
          <div
            key={lastPopped.id + poppedCount}
            className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 border-4 border-saffron-400 rounded-full px-6 py-2 shadow-lg flex items-center gap-3 animate-pop"
          >
            <span className="font-kids text-2xl sm:text-3xl" style={{ color: lastPopped.accentHex }}>
              {lastPopped.darija}
            </span>
            {settings.showArabic && (
              <span className="font-arabic text-2xl font-bold text-majorelle-500" dir="rtl">
                {lastPopped.arabic}
              </span>
            )}
            {settings.showEnglish && (
              <span className="text-sm font-bold text-slate-400">({lastPopped.english})</span>
            )}
          </div>
        )}

        {/* Floating Interactive Bubbles */}
        {bubbles.map((b) => (
          <button
            key={b.uid}
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              handleBubblePop(b);
            }}
            aria-label={`Pop ${b.word.english}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center p-3 shadow-lg active:scale-125 transition-transform focus:outline-none cursor-pointer"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              backgroundColor: b.tint,
              border: '4px solid rgba(255, 255, 255, 0.95)',
              boxShadow: 'inset -8px -8px 18px rgba(56,189,248,0.22), inset 8px 8px 16px rgba(255,255,255,0.9), 0 10px 20px rgba(14,116,144,0.14)',
            }}
          >
            {/* Glossy Bubble Highlight */}
            <span className="pointer-events-none absolute top-3 left-4 w-5 h-3 rounded-full bg-white/90 -rotate-30" />
            <WordIllustration wordId={b.word.id} className="w-[84%] h-[84%] pointer-events-none" />
          </button>
        ))}

        {/* Pop Sparkle Bursts */}
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center"
            style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
          >
            <span className="text-5xl animate-sparkle">💥</span>
            <span className="text-3xl animate-sparkle absolute -top-6 -left-6">✨</span>
            <span className="text-3xl animate-sparkle absolute -top-6 -right-6">⭐</span>
          </div>
        ))}
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={isLittle ? 2 : 3}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={initGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
