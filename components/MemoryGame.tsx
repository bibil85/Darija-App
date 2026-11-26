import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORDS, shuffleArray } from '../constants.ts';
import { DifficultyLevel, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { MemoryFlipScene, MemoryTileData } from '../engine/scenes/MemoryFlipScene.ts';
import { CelebrationModal, StarIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import {
  playFanfareSound,
  playFlipSound,
  playGentleBoing,
} from '../services/soundService.ts';

interface MemoryGameProps {
  sceneManager: SceneManager | null;
  difficulty: DifficultyLevel;
  settings: ParentSettings;
  onReward: (stars: number, wordId?: string) => Word | null;
  onHome: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  sceneManager,
  difficulty,
  settings,
  onReward,
  onHome,
}) => {
  // 3 progressive levels: Lv1 = 3 pairs (6 tiles), Lv2 = 6 pairs (12 tiles), Lv3 = 8 pairs (16 tiles)
  const pairCount = difficulty === 1 ? 3 : difficulty === 2 ? 6 : 8;

  const [matchedCount, setMatchedCount] = useState(0);
  const [lastSpoken, setLastSpoken] = useState<Word | null>(null);
  const [finished, setFinished] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Word | null>(null);

  const sceneRef = useRef<MemoryFlipScene | null>(null);
  const deckRef = useRef<MemoryTileData[]>([]);
  const flippedRef = useRef<string[]>([]);
  const matchedRef = useRef<string[]>([]);
  const lockedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const initGame = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    const chosen = shuffleArray(WORDS).slice(0, pairCount);
    const deck: MemoryTileData[] = shuffleArray(
      chosen.flatMap((w) => [
        { uid: `${w.id}-a`, word: w },
        { uid: `${w.id}-b`, word: w },
      ])
    );

    deckRef.current = deck;
    flippedRef.current = [];
    matchedRef.current = [];
    lockedRef.current = false;

    setMatchedCount(0);
    setLastSpoken(null);
    setFinished(false);
    setUnlockedSticker(null);

    if (sceneManager) {
      const scene = new MemoryFlipScene(deck, (uid) => {
        if (lockedRef.current) return;
        const card = deckRef.current.find((c) => c.uid === uid);
        if (!card) return;
        if (matchedRef.current.includes(card.word.id)) return;
        if (flippedRef.current.includes(uid)) return;

        playFlipSound();
        setLastSpoken(card.word);
        speakWord(card.word);

        flippedRef.current = [...flippedRef.current, uid];
        scene.syncState(flippedRef.current, matchedRef.current);

        if (flippedRef.current.length === 2) {
          lockedRef.current = true;
          const first = deckRef.current.find((c) => c.uid === flippedRef.current[0]);

          if (first && first.word.id === card.word.id) {
            addTimer(() => {
              matchedRef.current = [...matchedRef.current, card.word.id];
              flippedRef.current = [];
              lockedRef.current = false;
              setMatchedCount(matchedRef.current.length);
              scene.syncState(flippedRef.current, matchedRef.current);

              if (matchedRef.current.length === pairCount) {
                addTimer(() => {
                  playFanfareSound();
                  sceneManager.triggerCelebration();
                  const sticker = onReward(difficulty + 2, card.word.id);
                  setUnlockedSticker(sticker);
                  setFinished(true);
                }, 650);
              }
            }, 420);
          } else {
            addTimer(() => {
              playGentleBoing();
              flippedRef.current = [];
              lockedRef.current = false;
              scene.syncState(flippedRef.current, matchedRef.current);
            }, 950);
          }
        }
      });
      sceneRef.current = scene;
      sceneManager.setScene(scene);
    }
  }, [difficulty, onReward, pairCount, sceneManager]);

  useEffect(() => {
    initGame();
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      sceneRef.current = null;
    };
  }, [initGame]);

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between">
      <div className="pointer-events-auto bg-white/85 backdrop-blur-md border-2 border-white rounded-3xl px-4 sm:px-5 py-2 shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          {lastSpoken ? (
            <div className="flex items-center gap-2 font-kids text-lg sm:text-xl text-amber-800">
              <span>{lastSpoken.darija}</span>
              {settings.showArabic && (
                <span className="font-arabic text-majorelle-500" dir="rtl">
                  {lastSpoken.arabic}
                </span>
              )}
            </div>
          ) : (
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-minttile-600 border-2 border-white shadow-sm inline-block" />
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from({ length: pairCount }).map((_, i) => (
            <StarIcon key={i} filled={i < matchedCount} className="w-6 h-6" />
          ))}
        </div>
      </div>

      <div />

      {finished && (
        <CelebrationModal
          starsEarned={difficulty + 2}
          unlockedWord={unlockedSticker}
          showArabic={settings.showArabic}
          onPlayAgain={initGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
