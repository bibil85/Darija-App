import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { CategoryType, DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { FeedSba3Scene } from '../engine/scenes/FeedSba3Scene.ts';
import { CelebrationModal, SpeakerIcon, StarIcon } from './MoroccanDecor.tsx';
import { speakShortPhrase, speakWord } from '../services/audioService.ts';
import { playFanfareSound } from '../services/soundService.ts';

interface FeedSba3GameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const FeedSba3Game: React.FC<FeedSba3GameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  const totalRounds = difficulty === 1 ? 4 : 5;
  const choiceCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;

  const [roundIdx, setRoundIdx] = useState(0);
  const [targetFood, setTargetFood] = useState<Word | null>(null);
  const [justAte, setJustAte] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<FeedSba3Scene | null>(null);
  const queueRef = useRef<Word[]>([]);
  const roundRef = useRef(0);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const foodPool = WORDS.filter((w) => w.category === CategoryType.FOOD);

  const makeChoices = useCallback(
    (target: Word) => {
      const others = shuffleArray(foodPool.filter((w) => w.id !== target.id)).slice(
        0,
        choiceCount - 1
      );
      return shuffleArray([target, ...others]);
    },
    [choiceCount]
  );

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const q = shuffleArray(foodPool).slice(0, totalRounds);
    queueRef.current = q;
    roundRef.current = 0;
    busyRef.current = false;

    const first = q[0];
    setRoundIdx(0);
    setTargetFood(first);
    setJustAte(false);
    setFinished(false);
    setUnlockedSticker(null);

    if (sceneManager && first) {
      const initialChoices = makeChoices(first);
      const scene = new FeedSba3Scene(initialChoices, (food) => {
        const currentTarget = queueRef.current[roundRef.current];
        if (!currentTarget || busyRef.current) return 'ignore';

        if (food.id === currentTarget.id) {
          busyRef.current = true;
          setJustAte(true);
          speakWord(food);
          addTimer(() => speakShortPhrase('Bessa7a!', 'بالصحة!'), 650);

          if (roundRef.current + 1 >= totalRounds) {
            addTimer(() => {
              playFanfareSound();
              sceneManager.triggerCelebration();
              const sticker = onReward(difficulty + 1, food.id);
              setUnlockedSticker(sticker);
              setFinished(true);
            }, 1250);
          } else {
            addTimer(() => {
              roundRef.current += 1;
              const nextFood = queueRef.current[roundRef.current];
              setRoundIdx(roundRef.current);
              setTargetFood(nextFood);
              setJustAte(false);
              busyRef.current = false;
              if (nextFood) {
                scene.setFoods(makeChoices(nextFood));
                scene.setTargetWordId(nextFood.id);
                speakWord(nextFood);
              }
            }, 1350);
          }
          return 'eat';
        } else {
          speakWord(food);
          return 'reject';
        }
      });
      scene.setTargetWordId(first.id);
      sceneRef.current = scene;
      sceneManager.setScene(scene);
      addTimer(() => speakWord(first), 380);
    }
  }, [difficulty, makeChoices, onReward, sceneManager, totalRounds]);

  useEffect(() => {
    startGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      sceneRef.current = null;
    };
  }, [startGame]);

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between">
      {/* Top Visual Sba3 Craving Prompt & Stars */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-3">
          {targetFood && (
            <button
              onClick={() => speakWord(targetFood)}
              aria-label="Replay spoken food word"
              className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white font-kids text-base sm:text-xl px-4 py-2 rounded-2xl border-b-4 border-terracotta-600 active:translate-y-0.5 active:border-b-0 shadow"
            >
              <SpeakerIcon className="w-6 h-6" />
              <span>{targetFood.darija}</span>
              {settings.showArabic && (
                <span className="font-arabic font-bold" dir="rtl">
                  {targetFood.arabic}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <StarIcon
              key={i}
              filled={i < roundIdx || (i === roundIdx && justAte)}
              className="w-6 h-6"
            />
          ))}
        </div>
      </div>

      {/* Bottom Chomp Cheer Toast */}
      <div className="pointer-events-none flex justify-center pb-2">
        {justAte && (
          <div className="bg-emerald-500 text-white font-kids text-2xl px-6 py-2 rounded-full shadow-xl animate-pop">
            Bessa7a!
          </div>
        )}
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
