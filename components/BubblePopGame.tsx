import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { BubblePopScene } from '../engine/scenes/BubblePopScene.ts';
import { CelebrationModal, SpeakerIcon, StarIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playSuccessSound,
} from '../services/soundService.ts';

interface BubblePopGameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const BubblePopGame: React.FC<BubblePopGameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  const isFreePlay = difficulty === 1; // Lv 1 (Nora) = Free Pop & Hear! Lv 2/3 = Target Pop!
  const targetGoal = difficulty === 1 ? 7 : difficulty === 2 ? 5 : 7;
  const bubbleCount = difficulty === 1 ? 6 : difficulty === 2 ? 7 : 8;
  const speedScale = difficulty === 1 ? 0.85 : difficulty === 2 ? 1.15 : 1.45;

  const [poppedCount, setPoppedCount] = useState(0);
  const [lastPopped, setLastPopped] = useState<Word | null>(null);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<BubblePopScene | null>(null);
  const targetRef = useRef<Word | null>(null);
  const countRef = useRef(0);
  const finishedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  targetRef.current = targetWord;
  countRef.current = poppedCount;
  finishedRef.current = finished;

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const initGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setPoppedCount(0);
    setLastPopped(null);
    setShowHint(false);
    setFinished(false);
    setUnlockedSticker(null);

    const initialWords = shuffleArray(WORDS).slice(0, bubbleCount);

    if (!isFreePlay) {
      const firstTarget = initialWords[0];
      setTargetWord(firstTarget);
      targetRef.current = firstTarget;
      addTimer(() => speakWord(firstTarget), 380);
    } else {
      setTargetWord(null);
      targetRef.current = null;
    }

    if (sceneManager) {
      const scene = new BubblePopScene(initialWords, WORDS, speedScale, {
        onBubblePopped: (word) => {
          if (finishedRef.current) return false;

          if (!isFreePlay && targetRef.current && word.id !== targetRef.current.id) {
            speakWord(word);
            return false;
          }

          speakWord(word);
          setLastPopped(word);

          const nextCount = countRef.current + 1;
          setPoppedCount(nextCount);
          countRef.current = nextCount;

          if (nextCount >= targetGoal) {
            playSuccessSound();
            finishedRef.current = true;
            addTimer(() => {
              playFanfareSound();
              sceneManager.triggerCelebration();
              const sticker = onReward(difficulty + 1, word.id);
              setUnlockedSticker(sticker);
              setFinished(true);
            }, 650);
          } else if (!isFreePlay) {
            playSuccessSound();
            addTimer(() => {
              const active = scene.getActiveWords().filter((w) => w.id !== word.id);
              const nextTarget = active[Math.floor(Math.random() * active.length)] || WORDS[0];
              setTargetWord(nextTarget);
              targetRef.current = nextTarget;
              scene.setTargetWordId(nextTarget.id);
              setShowHint(false);
              speakWord(nextTarget);
            }, 650);
          }
          return true;
        },
      });
      scene.setTargetWordId(isFreePlay ? null : initialWords[0]?.id ?? null);
      sceneRef.current = scene;
      sceneManager.setScene(scene);
    }
  }, [bubbleCount, difficulty, isFreePlay, onReward, sceneManager, speedScale, targetGoal]);

  useEffect(() => {
    initGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      sceneRef.current = null;
    };
  }, [initGame]);

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between">
      {/* Top Visual HUD Bar — Zero-Text Signposting (Iconic Speaker + Star Slots!) */}
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2 shadow-lg flex flex-wrap items-center justify-between gap-2">
        {isFreePlay ? (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-300 to-cyan-500 shadow-inner border-2 border-white inline-block animate-pulse" />
            <span className="font-kids text-lg text-sky-800">{poppedCount} / {targetGoal}</span>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => targetWord && speakWord(targetWord)}
              aria-label="Replay spoken bubble word"
              className="flex items-center gap-2 bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-base sm:text-lg px-4 py-2 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow"
            >
              <SpeakerIcon className="w-6 h-6" />
              {showHint && targetWord && <span>{targetWord.darija}</span>}
            </button>
            {targetWord && (
              <button
                onClick={() => setShowHint((h) => !h)}
                aria-label="Toggle word hint for parents"
                className="text-xs font-extrabold uppercase bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full"
              >
                {showHint ? targetWord.english : '?'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          {Array.from({ length: targetGoal }).map((_, i) => (
            <StarIcon key={i} filled={i < poppedCount} className="w-6 h-6 transition-transform" />
          ))}
        </div>
      </div>

      {/* Bottom Spoken Word Toast */}
      <div className="pointer-events-none flex justify-center pb-2">
        {lastPopped && (
          <div
            key={lastPopped.id + poppedCount}
            className="bg-white/95 backdrop-blur border-4 border-saffron-400 rounded-full px-6 py-2 shadow-xl flex items-center gap-3 animate-pop"
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
      </div>

      {finished && (
        <CelebrationModal
          starsEarned={difficulty + 1}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={initGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
