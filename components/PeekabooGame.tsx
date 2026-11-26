import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { CategoryType, DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { PeekabooScene } from '../engine/scenes/PeekabooScene.ts';
import { CelebrationModal, SpeakerIcon, StarIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playGentleBoing,
  playPopSound,
  playSuccessSound,
} from '../services/soundService.ts';

interface PeekabooGameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const PeekabooGame: React.FC<PeekabooGameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  const isNoraGentle = difficulty === 1;
  const totalRounds = difficulty === 1 ? 4 : 5;
  const doorCount = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;

  const [roundIdx, setRoundIdx] = useState(0);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [revealedWord, setRevealedWord] = useState<Word | null>(null);
  const [showPeek, setShowPeek] = useState(false);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<PeekabooScene | null>(null);
  const roundRef = useRef(0);
  const targetRef = useRef<Word | null>(null);
  const solvedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const makeRoundWords = useCallback(() => {
    const cutePool = WORDS.filter(
      (w) =>
        w.category === CategoryType.ANIMALS ||
        w.category === CategoryType.FAMILY ||
        w.category === CategoryType.NATURE
    );
    return shuffleArray(cutePool).slice(0, doorCount);
  }, [doorCount]);

  const loadRound = useCallback(
    (words: Word[]) => {
      const target = words[Math.floor(Math.random() * words.length)];
      setTargetWord(target);
      targetRef.current = target;
      setRevealedWord(null);
      solvedRef.current = false;
      setShowPeek(false);
      sceneRef.current?.setRound(words);
      sceneRef.current?.setTargetWordId(isNoraGentle ? null : target?.id ?? null);

      if (!isNoraGentle && target) {
        addTimer(() => speakWord(target), 380);
      }
    },
    [isNoraGentle]
  );

  const startGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    roundRef.current = 0;
    setRoundIdx(0);
    setFinished(false);
    setUnlockedSticker(null);

    const firstWords = makeRoundWords();
    const firstTarget = firstWords[Math.floor(Math.random() * firstWords.length)];
    setTargetWord(firstTarget);
    targetRef.current = firstTarget;
    setRevealedWord(null);
    solvedRef.current = false;
    setShowPeek(false);

    if (sceneManager) {
      const scene = new PeekabooScene(firstWords, (word) => {
        if (solvedRef.current) return 'ignore';

        if (isNoraGentle || word.id === targetRef.current?.id) {
          solvedRef.current = true;
          setRevealedWord(word);
          playPopSound();
          playSuccessSound();
          speakWord(word);

          if (roundRef.current + 1 >= totalRounds) {
            addTimer(() => {
              playFanfareSound();
              sceneManager.triggerCelebration();
              const sticker = onReward(difficulty + 1, word.id);
              setUnlockedSticker(sticker);
              setFinished(true);
            }, 1350);
          } else {
            addTimer(() => {
              roundRef.current += 1;
              setRoundIdx(roundRef.current);
              loadRound(makeRoundWords());
            }, 1500);
          }
          return 'win';
        } else {
          playGentleBoing();
          speakWord(word);
          return 'miss';
        }
      });
      scene.setTargetWordId(isNoraGentle ? null : firstTarget?.id ?? null);
      sceneRef.current = scene;
      sceneManager.setScene(scene);

      if (!isNoraGentle && firstTarget) {
        addTimer(() => speakWord(firstTarget), 400);
      }
    }
  }, [difficulty, isNoraGentle, loadRound, makeRoundWords, onReward, sceneManager, totalRounds]);

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
        {isNoraGentle ? (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 border-2 border-white shadow-sm inline-block animate-peek-wiggle" />
            <span className="font-kids text-lg text-indigo-800">{roundIdx + (revealedWord ? 1 : 0)} / {totalRounds}</span>
          </div>
        ) : (
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => targetWord && speakWord(targetWord)}
              aria-label="Replay spoken word"
              className="flex items-center gap-2 bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-base sm:text-lg px-4 py-2 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow"
            >
              <SpeakerIcon className="w-6 h-6" />
              {showPeek && targetWord && <span>{targetWord.darija}</span>}
            </button>
            {targetWord && (
              <button
                onClick={() => setShowPeek((p) => !p)}
                aria-label="Toggle word hint for parents"
                className="text-xs font-extrabold uppercase bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full"
              >
                {showPeek ? targetWord.english : '?'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <StarIcon
              key={i}
              filled={i < roundIdx || (i === roundIdx && Boolean(revealedWord))}
              className="w-6 h-6"
            />
          ))}
        </div>
      </div>

      {/* Revealed Character Darija Callout */}
      <div className="pointer-events-none flex justify-center pb-2">
        {revealedWord && (
          <div className="bg-white/95 backdrop-blur border-4 border-saffron-400 rounded-full px-6 py-2 shadow-xl flex items-center gap-3 animate-pop">
            <span className="font-kids text-2xl sm:text-3xl" style={{ color: revealedWord.accentHex }}>
              {revealedWord.darija}
            </span>
            {settings.showArabic && (
              <span className="font-arabic text-2xl font-bold text-majorelle-500" dir="rtl">
                {revealedWord.arabic}
              </span>
            )}
            {settings.showEnglish && (
              <span className="text-sm font-bold text-slate-400">({revealedWord.english})</span>
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
