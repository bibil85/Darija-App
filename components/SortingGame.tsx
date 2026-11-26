import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CATEGORY_BY_ID, WORDS, shuffleArray } from '../constants.ts';
import { CategoryType, DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { SortingScene } from '../engine/scenes/SortingScene.ts';
import { CelebrationModal, SpeakerIcon, StarIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import { playFanfareSound } from '../services/soundService.ts';

interface SortingGameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const SortingGame: React.FC<SortingGameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  const totalRounds = difficulty === 1 ? 5 : 6;
  const basketCats: CategoryType[] =
    difficulty === 1
      ? [CategoryType.ANIMALS, CategoryType.FOOD]
      : difficulty === 2
      ? [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.NATURE]
      : [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.HOME];

  const [roundIdx, setRoundIdx] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [matched, setMatched] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<SortingScene | null>(null);
  const queueRef = useRef<Word[]>([]);
  const roundRef = useRef(0);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const cats: CategoryType[] =
      difficulty === 1
        ? [CategoryType.ANIMALS, CategoryType.FOOD]
        : difficulty === 2
        ? [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.NATURE]
        : [CategoryType.ANIMALS, CategoryType.FOOD, CategoryType.HOME];

    const pool = shuffleArray(WORDS.filter((w) => cats.includes(w.category))).slice(0, totalRounds);
    queueRef.current = pool;
    roundRef.current = 0;
    busyRef.current = false;

    const first = pool[0];
    setRoundIdx(0);
    setCurrentWord(first);
    setMatched(false);
    setFinished(false);
    setUnlockedSticker(null);

    if (sceneManager && first) {
      const metas = cats.map((c) => CATEGORY_BY_ID[c]);
      const scene = new SortingScene(
        metas,
        first,
        (catId) => {
          const word = queueRef.current[roundRef.current];
          if (!word || busyRef.current) return 'ignore';

          if (catId === word.category) {
            busyRef.current = true;
            setMatched(true);
            speakWord(word);

            if (roundRef.current + 1 >= totalRounds) {
              addTimer(() => {
                playFanfareSound();
                sceneManager.triggerCelebration();
                const sticker = onReward(difficulty + 1, word.id);
                setUnlockedSticker(sticker);
                setFinished(true);
              }, 1050);
            } else {
              addTimer(() => {
                roundRef.current += 1;
                const next = queueRef.current[roundRef.current];
                setRoundIdx(roundRef.current);
                setCurrentWord(next);
                setMatched(false);
                busyRef.current = false;
                if (next) {
                  scene.setActiveWord(next);
                  speakWord(next);
                }
              }, 1100);
            }
            return 'match';
          } else {
            return 'wrong';
          }
        },
        () => {
          const w = queueRef.current[roundRef.current];
          if (w) speakWord(w);
        }
      );
      sceneRef.current = scene;
      sceneManager.setScene(scene);
      addTimer(() => speakWord(first), 380);
    }
  }, [difficulty, onReward, sceneManager, totalRounds]);

  useEffect(() => {
    startGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      sceneRef.current = null;
    };
  }, [startGame]);

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between">
      {/* Top Visual HUD Bar — Zero-Text Signposting */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {currentWord && (
            <button
              onClick={() => speakWord(currentWord)}
              aria-label="Replay spoken word"
              className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-kids text-base sm:text-xl px-4 py-2 rounded-2xl border-b-4 border-terracotta-600 active:translate-y-0.5 active:border-b-0 shadow"
            >
              <SpeakerIcon className="w-6 h-6" />
              <span>{currentWord.darija}</span>
              {settings.showArabic && (
                <span className="font-arabic font-bold" dir="rtl">
                  {currentWord.arabic}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <StarIcon
              key={i}
              filled={i < roundIdx || (i === roundIdx && matched)}
              className="w-6 h-6"
            />
          ))}
        </div>
      </div>

      {/* Bottom Basket Label Legend Pills aligned beneath the 3D baskets */}
      <div className="pointer-events-none w-full max-w-3xl mx-auto flex items-center justify-around px-6 pb-1">
        {basketCats.map((catId) => {
          const meta = CATEGORY_BY_ID[catId];
          return (
            <div
              key={catId}
              className="bg-white/90 backdrop-blur border-2 border-white rounded-2xl px-4 py-1.5 shadow text-center"
            >
              <div className="font-kids text-sm sm:text-base" style={{ color: meta.hex }}>
                {meta.label}
              </div>
              <div className="text-[11px] font-extrabold text-slate-500">{meta.darija}</div>
            </div>
          );
        })}
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={difficulty + 1}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={startGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
