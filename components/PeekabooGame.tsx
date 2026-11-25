import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, CategoryType, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { Mascot } from './Mascot.tsx';
import { CelebrationModal } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playPopSound,
  playSuccessSound,
} from '../services/soundService.ts';

interface PeekabooGameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

const DOOR_STYLES = [
  { bg: '#1D5FD1', arch: '#1E3A8A', trim: '#FBBF24', knob: '#FDE047' },
  { bg: '#E5633B', arch: '#9A3412', trim: '#FEF08A', knob: '#FFFFFF' },
  { bg: '#14A392', arch: '#0F766E', trim: '#FDE047', knob: '#FFF7E6' },
];

/**
 * Peek-a-Boo! Moroccan Palace Doors:
 * - Nora (2+): 2 cozy wiggling doors — swipe OR tap any door to burst it open and meet the friend inside!
 * - Sophia (4+): 3 wiggling doors — listen to Sba3 say a Darija word, then swipe/tap the right door!
 */
export const PeekabooGame: React.FC<PeekabooGameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isNora = ageMode === 'little';
  const totalRounds = isNora ? 4 : 5;
  const doorCount = isNora ? 2 : 3;

  const [roundIdx, setRoundIdx] = useState(0);
  const [doors, setDoors] = useState<Word[]>([]);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [revealedWord, setRevealedWord] = useState<Word | null>(null);
  const [showPeek, setShowPeek] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const timersRef = useRef<number[]>([]);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const setupRound = useCallback(() => {
    // Prefer adorable character categories (Animals, Family, Nature) for Peek-a-Boo!
    const cutePool = WORDS.filter(
      (w) =>
        w.category === CategoryType.ANIMALS ||
        w.category === CategoryType.FAMILY ||
        w.category === CategoryType.NATURE
    );
    const chosen = shuffleArray(cutePool).slice(0, doorCount);
    const target = chosen[Math.floor(Math.random() * chosen.length)];
    setDoors(chosen);
    setTargetWord(target);
    setOpenedIds([]);
    setWiggleId(null);
    setRevealedWord(null);
    setShowPeek(false);

    if (!isNora && target) {
      addTimer(() => speakWord(target), 350);
    }
  }, [doorCount, isNora]);

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setRoundIdx(0);
    setFinished(false);
    setUnlockedSticker(null);
    setupRound();
  }, [setupRound]);

  useEffect(() => {
    startGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [startGame]);

  const openDoor = (word: Word) => {
    if (finished || revealedWord) return;

    // For Nora (2+): every door she opens is a joyful Peek-a-Boo surprise!
    if (isNora || word.id === targetWord?.id) {
      setOpenedIds((prev) => [...prev, word.id]);
      setRevealedWord(word);
      playPopSound();
      playSuccessSound();
      speakWord(word);

      if (roundIdx + 1 >= totalRounds) {
        addTimer(() => {
          playFanfareSound();
          const sticker = onReward(isNora ? 2 : 3, word.id);
          setUnlockedSticker(sticker);
          setFinished(true);
        }, 1450);
      } else {
        addTimer(() => {
          setRoundIdx((r) => r + 1);
          setupRound();
        }, 1550);
      }
    } else {
      // For Sophia (4+): door opens to show who's there, gently wiggles, and says their name!
      playGentleBoing();
      setWiggleId(word.id);
      setOpenedIds((prev) => (prev.includes(word.id) ? prev : [...prev, word.id]));
      speakWord(word);
      addTimer(() => setWiggleId(null), 500);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-between gap-4">
      {/* Top Prompt Banner */}
      <div className="w-full max-w-4xl bg-white/95 border-4 border-violet-200 rounded-[2rem] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Mascot
            mood={revealedWord ? 'cheering' : isNora ? 'waving' : 'listening'}
            size={64}
            onClick={() => targetWord && speakWord(targetWord)}
          />
          <div>
            {isNora ? (
              <>
                <h3 className="font-kids text-xl sm:text-2xl text-violet-700 leading-tight">
                  Peek-a-Boo, Nora! Who&apos;s hiding?
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  Swipe or tap a wiggling Moroccan door to open it!
                </p>
              </>
            ) : (
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => targetWord && speakWord(targetWord)}
                  className="bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-lg sm:text-xl px-4 py-2 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow-md flex items-center gap-2"
                >
                  <span>🔊</span>
                  <span>Hear Who&apos;s Hiding!</span>
                </button>
                {targetWord && (
                  <button
                    onClick={() => setShowPeek((p) => !p)}
                    className="text-xs font-extrabold uppercase bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full"
                  >
                    {showPeek ? `${targetWord.darija} (${targetWord.english})` : '👀 Parent Peek'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Round Stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`text-xl sm:text-2xl ${
                i < roundIdx || (i === roundIdx && revealedWord)
                  ? 'scale-110'
                  : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Wiggling Moroccan Palace Arched Doors Stage */}
      <div
        className={`flex-1 min-h-0 w-full max-w-4xl grid gap-5 sm:gap-7 items-center content-center ${
          isNora ? 'grid-cols-2' : 'grid-cols-3'
        }`}
      >
        {doors.map((word, idx) => {
          const isOpen = openedIds.includes(word.id);
          const isWinner = revealedWord?.id === word.id;
          const isWiggling = wiggleId === word.id;
          const style = DOOR_STYLES[idx % DOOR_STYLES.length];

          return (
            <div
              key={word.id}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                swipeStartRef.current = { x: e.clientX, y: e.clientY };
              }}
              onPointerUp={(e) => {
                // Supports both swiping open AND tapping!
                if (swipeStartRef.current) {
                  swipeStartRef.current = null;
                  openDoor(word);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDoor(word);
                }
              }}
              aria-label={isOpen ? word.english : `Open Moroccan door ${idx + 1}`}
              className={`relative w-full aspect-[4/5] max-h-[48vh] rounded-t-[48%] rounded-b-[2rem] border-8 border-white pixar-card-sheen overflow-hidden cursor-pointer select-none touch-none transition-all ${
                isWinner
                  ? 'scale-105 ring-4 ring-saffron-400'
                  : !isOpen
                  ? 'animate-peek-wiggle hover:scale-[1.03] active:scale-95'
                  : ''
              } ${isWiggling ? 'animate-wiggle' : ''}`}
              style={{
                backgroundColor: isOpen ? word.bgHex : style.bg,
                animationDelay: `${idx * 0.45}s`,
              }}
            >
              {isOpen ? (
                /* PEEK-A-BOO! Character leaps out! */
                <div className="w-full h-full flex flex-col items-center justify-center p-3 animate-pop">
                  {isWinner && (
                    <div className="pointer-events-none absolute inset-0">
                      <span className="absolute top-5 left-5 text-3xl animate-sparkle">✨</span>
                      <span className="absolute top-6 right-5 text-3xl animate-sparkle">🌟</span>
                    </div>
                  )}
                  <WordIllustration wordId={word.id} className="w-[78%] h-[72%]" />
                  <div className="mt-1 text-center">
                    <div className="font-kids text-2xl sm:text-3xl leading-none" style={{ color: word.accentHex }}>
                      {word.darija}
                    </div>
                    {settings.showArabic && (
                      <div className="font-arabic text-lg sm:text-xl font-bold text-majorelle-500" dir="rtl">
                        {word.arabic}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Closed Wiggling Moroccan Palace Arch Door with Peeking Eyes! */
                <svg viewBox="0 0 180 220" className="w-full h-full" aria-hidden="true">
                  <rect width="180" height="220" fill={style.bg} />
                  <path
                    d="M16 212 L16 86 Q90 12 164 86 L164 212 Z"
                    fill="none"
                    stroke={style.trim}
                    strokeWidth="6"
                    strokeDasharray="10 6"
                  />
                  {/* Peeking window slot with animated blinking eyes! */}
                  <rect x="46" y="76" width="88" height="36" rx="18" fill="#0F172A" stroke={style.trim} strokeWidth="4" />
                  <g className="animate-blink">
                    <circle cx="72" cy="94" r="10" fill="#FFFFFF" />
                    <circle cx="108" cy="94" r="10" fill="#FFFFFF" />
                    <circle cx="74" cy="94" r="5" fill="#1E293B" />
                    <circle cx="110" cy="94" r="5" fill="#1E293B" />
                    <circle cx="76" cy="91.5" r="2.2" fill="#FFFFFF" />
                    <circle cx="112" cy="91.5" r="2.2" fill="#FFFFFF" />
                  </g>
                  {/* Golden Door Knocker */}
                  <circle cx="90" cy="148" r="14" fill="none" stroke={style.knob} strokeWidth="6" />
                  <circle cx="90" cy="136" r="6" fill={style.knob} />
                  {/* Fun clue bubble for Nora */}
                  {word.funCue && (
                    <g>
                      <rect x="38" y="176" width="104" height="28" rx="14" fill="rgba(255,255,255,0.92)" />
                      <text x="90" y="195" textAnchor="middle" fontSize="14" fontWeight="800" fill={style.arch} fontFamily="Fredoka, sans-serif">
                        {isNora ? `${word.funCue} 👆` : 'Swipe / Tap!'}
                      </text>
                    </g>
                  )}
                </svg>
              )}
            </div>
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
