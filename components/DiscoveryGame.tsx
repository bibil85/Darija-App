import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { Mascot } from './Mascot.tsx';
import { CelebrationModal } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playSuccessSound,
} from '../services/soundService.ts';

interface DiscoveryGameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const DiscoveryGame: React.FC<DiscoveryGameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isLittle = ageMode === 'little';
  const totalRounds = isLittle ? 4 : 5;
  const choiceCount = isLittle ? 2 : 4;

  const [roundQueue, setRoundQueue] = useState<Word[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [options, setOptions] = useState<Word[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const setupRound = useCallback((queue: Word[], idx: number) => {
    const target = queue[idx];
    if (!target) return;
    const distractors = shuffleArray(WORDS.filter((w) => w.id !== target.id)).slice(
      0,
      choiceCount - 1
    );
    setOptions(shuffleArray([target, ...distractors]));
    setWrongIds([]);
    setWiggleId(null);
    setSolved(false);
    setShowPeek(false);

    addTimer(() => {
      speakWord(target);
    }, 320);
  }, [choiceCount]);

  const startNewGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const queue = shuffleArray(WORDS).slice(0, totalRounds);
    setRoundQueue(queue);
    setRoundIdx(0);
    setFinished(false);
    setUnlockedSticker(null);
    setupRound(queue, 0);
  }, [setupRound, totalRounds]);

  useEffect(() => {
    startNewGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [startNewGame]);

  const targetWord = roundQueue[roundIdx] || null;

  const handleChoice = (choice: Word) => {
    if (!targetWord || solved || finished) return;

    if (choice.id === targetWord.id) {
      setSolved(true);
      playSuccessSound();
      speakWord(targetWord);

      if (roundIdx + 1 >= totalRounds) {
        addTimer(() => {
          playFanfareSound();
          const sticker = onReward(isLittle ? 2 : 3, targetWord.id);
          setUnlockedSticker(sticker);
          setFinished(true);
        }, 1150);
      } else {
        addTimer(() => {
          const next = roundIdx + 1;
          setRoundIdx(next);
          setupRound(roundQueue, next);
        }, 1250);
      }
    } else {
      playGentleBoing();
      setWiggleId(choice.id);
      setWrongIds((prev) => (prev.includes(choice.id) ? prev : [...prev, choice.id]));
      addTimer(() => setWiggleId(null), 500);
    }
  };

  if (!targetWord) return null;

  return (
    <div className="h-full flex flex-col gap-4 items-center justify-between">
      {/* Top Sba3 Audio Prompt Banner */}
      <div className="w-full max-w-3xl bg-white/95 border-4 border-majorelle-400/40 rounded-[2rem] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Mascot
            mood={solved ? 'cheering' : 'listening'}
            size={68}
            onClick={() => speakWord(targetWord)}
          />
          <div>
            <button
              onClick={() => speakWord(targetWord)}
              className="flex items-center gap-2 bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-xl sm:text-2xl px-5 py-2.5 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow-md transition-all"
            >
              <span>🔊</span>
              <span>Tap to Listen!</span>
            </button>
            <div className="mt-1.5 flex items-center gap-2">
              <button
                onClick={() => setShowPeek((p) => !p)}
                className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full"
              >
                {showPeek
                  ? `${targetWord.darija}${settings.showArabic ? ` • ${targetWord.arabic}` : ''}${settings.showEnglish ? ` (${targetWord.english})` : ''}`
                  : '👀 Parent Word Peek'}
              </button>
            </div>
          </div>
        </div>

        {/* Round Stars */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <span
              key={i}
              className={`text-xl sm:text-2xl transition-all ${
                i < roundIdx || (i === roundIdx && solved)
                  ? 'scale-110'
                  : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Big Illustrated Choice Grid (2 huge cards for 2+, 4 cards for 4+) */}
      <div
        className={`flex-1 min-h-0 w-full max-w-3xl grid grid-cols-2 gap-4 sm:gap-6 items-center content-center`}
      >
        {options.map((opt) => {
          const isCorrect = solved && opt.id === targetWord.id;
          const isWrong = wrongIds.includes(opt.id);
          const isWiggling = wiggleId === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleChoice(opt)}
              aria-label={opt.english}
              className={`relative w-full ${
                isLittle ? 'aspect-square max-h-[46vh]' : 'aspect-[4/3] max-h-[29vh]'
              } rounded-[2rem] border-8 p-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 focus:outline-none ${
                isCorrect
                  ? 'border-emerald-400 scale-105 ring-4 ring-emerald-300 shadow-xl'
                  : isWrong
                  ? 'border-rose-200 opacity-45 scale-95'
                  : 'border-white hover:border-saffron-300 hover:scale-[1.02]'
              } ${isWiggling ? 'animate-wiggle' : ''}`}
              style={{ backgroundColor: opt.bgHex }}
            >
              <WordIllustration wordId={opt.id} className="w-[78%] h-[78%] drop-shadow-sm" />

              {isCorrect && (
                <div className="absolute inset-x-3 bottom-3 bg-emerald-500 text-white font-kids text-lg sm:text-2xl py-1 px-3 rounded-2xl shadow-md animate-pop flex items-center justify-center gap-2">
                  <span>🌟</span>
                  <span>{opt.darija}</span>
                  {settings.showArabic && (
                    <span className="font-arabic font-bold" dir="rtl">
                      {opt.arabic}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={isLittle ? 2 : 3}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={startNewGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
