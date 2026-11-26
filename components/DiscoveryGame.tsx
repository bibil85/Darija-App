import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { DiscoveryScene } from '../engine/scenes/DiscoveryScene.ts';
import { CelebrationModal, SpeakerIcon, StarIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playSuccessSound,
} from '../services/soundService.ts';

interface DiscoveryGameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const DiscoveryGame: React.FC<DiscoveryGameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  const totalRounds = difficulty === 1 ? 4 : 5;
  const choiceCount = difficulty === 1 ? 2 : difficulty === 2 ? 4 : 6;

  const [roundIdx, setRoundIdx] = useState(0);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [solved, setSolved] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<DiscoveryScene | null>(null);
  const queueRef = useRef<Word[]>([]);
  const roundRef = useRef(0);
  const solvedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const makeChoices = useCallback(
    (target: Word) => {
      const distractors = shuffleArray(WORDS.filter((w) => w.id !== target.id)).slice(
        0,
        choiceCount - 1
      );
      return shuffleArray([target, ...distractors]);
    },
    [choiceCount]
  );

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const queue = shuffleArray(WORDS).slice(0, totalRounds);
    queueRef.current = queue;
    roundRef.current = 0;
    solvedRef.current = false;

    const first = queue[0];
    setRoundIdx(0);
    setTargetWord(first);
    setSolved(false);
    setShowPeek(false);
    setFinished(false);
    setUnlockedSticker(null);

    if (sceneManager && first) {
      const scene = new DiscoveryScene(makeChoices(first), (picked) => {
        const target = queueRef.current[roundRef.current];
        if (!target || solvedRef.current) return 'ignore';

        if (picked.id === target.id) {
          solvedRef.current = true;
          setSolved(true);
          playSuccessSound();
          speakWord(target);

          if (roundRef.current + 1 >= totalRounds) {
            addTimer(() => {
              playFanfareSound();
              sceneManager.triggerCelebration();
              const sticker = onReward(difficulty + 1, target.id);
              setUnlockedSticker(sticker);
              setFinished(true);
            }, 1150);
          } else {
            addTimer(() => {
              roundRef.current += 1;
              const next = queueRef.current[roundRef.current];
              setRoundIdx(roundRef.current);
              setTargetWord(next);
              setSolved(false);
              setShowPeek(false);
              solvedRef.current = false;
              if (next) {
                scene.setChoices(makeChoices(next));
                scene.setTargetWordId(next.id);
                speakWord(next);
              }
            }, 1250);
          }
          return 'correct';
        } else {
          playGentleBoing();
          return 'wrong';
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
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-2.5">
          {targetWord && (
            <button
              onClick={() => speakWord(targetWord)}
              aria-label="Replay spoken target word"
              className="flex items-center gap-2 bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-base sm:text-xl px-4 py-2 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow"
            >
              <SpeakerIcon className="w-6 h-6" />
              {showPeek && <span>{targetWord.darija}</span>}
            </button>
          )}
          {targetWord && (
            <button
              onClick={() => setShowPeek((p) => !p)}
              aria-label="Toggle word hint for parents"
              className="text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full"
            >
              {showPeek
                ? `${targetWord.arabic}${settings.showEnglish ? ` (${targetWord.english})` : ''}`
                : '?'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <StarIcon
              key={i}
              filled={i < roundIdx || (i === roundIdx && solved)}
              className="w-6 h-6"
            />
          ))}
        </div>
      </div>

      {/* Solved Word Celebration Pill */}
      <div className="pointer-events-none flex justify-center pb-2">
        {solved && targetWord && (
          <div className="bg-emerald-500 text-white border-4 border-white rounded-full px-6 py-2 shadow-xl flex items-center gap-3 animate-pop">
            <span className="font-kids text-2xl sm:text-3xl">{targetWord.darija}</span>
            {settings.showArabic && (
              <span className="font-arabic text-2xl font-bold" dir="rtl">
                {targetWord.arabic}
              </span>
            )}
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
