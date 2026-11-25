import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { AgeMode, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { CelebrationModal, ZelligeCardPattern } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playFlipSound,
  playGentleBoing,
  playSuccessSound,
} from '../services/soundService.ts';

interface MemoryCard {
  uid: string;
  word: Word;
}

interface MemoryGameProps {
  ageMode: AgeMode;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  ageMode,
  settings,
  onReward,
  onHome,
}) => {
  const isLittle = ageMode === 'little';
  const pairCount = isLittle ? 3 : 6;

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedWordIds, setMatchedWordIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<Word | null>(null);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const initGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const chosen = shuffleArray(WORDS).slice(0, pairCount);
    const deck: MemoryCard[] = shuffleArray(
      chosen.flatMap((w) => [
        { uid: `${w.id}-a`, word: w },
        { uid: `${w.id}-b`, word: w },
      ])
    );
    setCards(deck);
    setFlippedUids([]);
    setMatchedWordIds([]);
    setLocked(false);
    setLastSpoken(null);
    setFinished(false);
    setUnlockedSticker(null);
  }, [pairCount]);

  useEffect(() => {
    initGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, [initGame]);

  const handleFlip = (card: MemoryCard) => {
    if (locked || finished) return;
    if (matchedWordIds.includes(card.word.id)) return;
    if (flippedUids.includes(card.uid)) return;

    playFlipSound();
    setLastSpoken(card.word);
    speakWord(card.word);

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      const firstCard = cards.find((c) => c.uid === nextFlipped[0]);
      if (firstCard && firstCard.word.id === card.word.id) {
        // Match!
        const nextMatched = [...matchedWordIds, card.word.id];
        addTimer(() => {
          playSuccessSound();
          setMatchedWordIds(nextMatched);
          setFlippedUids([]);
          setLocked(false);

          if (nextMatched.length === pairCount) {
            addTimer(() => {
              playFanfareSound();
              const sticker = onReward(isLittle ? 2 : 4, card.word.id);
              setUnlockedSticker(sticker);
              setFinished(true);
            }, 650);
          }
        }, 420);
      } else {
        // Not a match — flip back gently
        addTimer(() => {
          playGentleBoing();
          setFlippedUids([]);
          setLocked(false);
        }, 950);
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 sm:gap-4 items-center">
      {/* Top Header Strip */}
      <div className="w-full max-w-4xl bg-white/95 border-4 border-minttile-400/50 rounded-3xl px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl">🃏</span>
          <div className="min-w-0">
            <h3 className="font-kids text-xl sm:text-2xl text-minttile-600 leading-tight">
              Find the Matching Pictures!
            </h3>
            {lastSpoken ? (
              <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700">
                <span>🔊 {lastSpoken.darija}</span>
                {settings.showArabic && (
                  <span className="font-arabic text-majorelle-500" dir="rtl">
                    {lastSpoken.arabic}
                  </span>
                )}
                {settings.showEnglish && (
                  <span className="text-slate-400 font-bold">({lastSpoken.english})</span>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Flip any tile to hear its Darija name!
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-kids text-lg sm:text-xl text-minttile-600 bg-minttile-400/20 px-3.5 py-1 rounded-full">
            {matchedWordIds.length} / {pairCount} ✨
          </span>
        </div>
      </div>

      {/* Responsive iPad Memory Grid — Fits cleanly without scrolling */}
      <div
        className={`flex-1 min-h-0 w-full max-w-4xl grid gap-3 sm:gap-4 items-center content-center ${
          isLittle ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
        }`}
      >
        {cards.map((card) => {
          const isMatched = matchedWordIds.includes(card.word.id);
          const isFaceUp = isMatched || flippedUids.includes(card.uid);

          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card)}
              aria-label={isFaceUp ? card.word.english : 'Hidden Moroccan tile'}
              className={`perspective-1000 w-full ${
                isLittle ? 'aspect-square max-h-[30vh]' : 'aspect-square max-h-[21vh]'
              } focus:outline-none`}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                  isFaceUp ? 'rotate-y-180' : 'hover:scale-[1.03] active:scale-95'
                }`}
              >
                {/* Back: Moroccan Zellige Tile */}
                <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                  <ZelligeCardPattern />
                </div>

                {/* Front: Bespoke Storybook Illustration */}
                <div
                  aria-hidden={!isFaceUp}
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-4 p-2 sm:p-3 flex flex-col items-center justify-center shadow-lg ${
                    isMatched
                      ? 'border-emerald-400 ring-4 ring-emerald-300/60'
                      : 'border-saffron-400'
                  }`}
                  style={{ backgroundColor: card.word.bgHex }}
                >
                  <WordIllustration wordId={card.word.id} className="w-[78%] h-[78%]" />
                  <span
                    className="font-kids text-xs sm:text-base leading-none mt-0.5 truncate max-w-full"
                    style={{ color: card.word.accentHex }}
                  >
                    {card.word.darija}
                  </span>
                  {isMatched && (
                    <span className="absolute top-1.5 right-1.5 text-lg sm:text-xl animate-pop">✅</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={isLittle ? 2 : 4}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={initGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
