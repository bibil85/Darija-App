import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CATEGORIES, WORDS } from '../constants.ts';
import { CategoryType, ParentSettings, Word } from '../types.ts';
import { SceneManager } from '../engine/SceneManager.ts';
import { ExploreBookScene } from '../engine/scenes/ExploreBookScene.ts';
import { SpeakerIcon } from './MoroccanDecor.tsx';
import { speakWord } from '../services/audioService.ts';
import { playClickSound } from '../services/soundService.ts';

interface ExploreBookProps {
  sceneManager: SceneManager | null;
  initialCategory: CategoryType;
  settings: ParentSettings;
}

/**
 * 3D Picture Book HUD Overlay:
 * The giant articulated 3D toy stands center-stage in the 3D WebGL courtyard!
 * Kids swipe left/right anywhere on the 3D stage to spin & switch toys, or tap the 3D toy to hear Darija.
 */
export const ExploreBook: React.FC<ExploreBookProps> = ({
  sceneManager,
  initialCategory,
  settings,
}) => {
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [index, setIndex] = useState(0);
  const [voiceBadge, setVoiceBadge] = useState<string | null>(null);

  const sceneRef = useRef<ExploreBookScene | null>(null);
  const indexRef = useRef(0);
  const wordsRef = useRef<Word[]>([]);
  const badgeTimerRef = useRef<number | null>(null);
  const catRefs = useRef<Partial<Record<CategoryType, HTMLButtonElement | null>>>({});

  const words = useMemo(() => WORDS.filter((w) => w.category === category), [category]);
  const currentWord = words[index] || words[0];

  indexRef.current = index;
  wordsRef.current = words;

  useEffect(() => {
    catRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [category]);

  const speakCurrent = async (word: Word) => {
    const res = await speakWord(word);
    if (res.source === 'parent') {
      setVoiceBadge(`${res.speakerLabel || 'Family'} Voice`);
    } else if (res.source === 'gemini') {
      setVoiceBadge('Darija Voice');
    } else {
      setVoiceBadge(null);
    }
    if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => setVoiceBadge(null), 1300);
  };

  // Mount the 3D ExploreBookScene once
  useEffect(() => {
    if (!sceneManager) return;
    const first = wordsRef.current[indexRef.current] || WORDS[0];
    const scene = new ExploreBookScene(first.id, first.accentHex, {
      onTapToy: () => {
        const w = wordsRef.current[indexRef.current];
        if (w) speakCurrent(w);
      },
      onSwipeNext: () => {
        const list = wordsRef.current;
        const nextIdx = (indexRef.current + 1) % list.length;
        setIndex(nextIdx);
        const nextWord = list[nextIdx];
        if (nextWord) {
          scene.loadWord(nextWord.id, nextWord.accentHex, 1);
          speakCurrent(nextWord);
        }
      },
      onSwipePrev: () => {
        const list = wordsRef.current;
        const prevIdx = (indexRef.current - 1 + list.length) % list.length;
        setIndex(prevIdx);
        const prevWord = list[prevIdx];
        if (prevWord) {
          scene.loadWord(prevWord.id, prevWord.accentHex, -1);
          speakCurrent(prevWord);
        }
      },
    });
    sceneRef.current = scene;
    sceneManager.setScene(scene);

    return () => {
      if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
      sceneRef.current = null;
    };
  }, [sceneManager]);

  const selectCategory = (cat: CategoryType) => {
    playClickSound();
    setCategory(cat);
    setIndex(0);
    const nextList = WORDS.filter((w) => w.category === cat);
    if (nextList[0] && sceneRef.current) {
      sceneRef.current.loadWord(nextList[0].id, nextList[0].accentHex, 1);
      speakCurrent(nextList[0]);
    }
  };

  const jumpToWord = (i: number) => {
    playClickSound();
    const dir: -1 | 1 = i >= index ? 1 : -1;
    setIndex(i);
    const w = words[i];
    if (w && sceneRef.current) {
      sceneRef.current.loadWord(w.id, w.accentHex, dir);
      speakCurrent(w);
    }
  };

  return (
    <div className="pointer-events-none h-full flex flex-col justify-between gap-2">
      {/* Top Category Strip */}
      <div className="pointer-events-auto allow-scroll-x flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const active = cat.id === category;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                catRefs.current[cat.id] = el;
              }}
              onClick={() => selectCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl font-kids text-sm sm:text-base whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 active:border-b-0 ${
                active
                  ? `${cat.bgClass} ${cat.borderClass} text-white shadow-md`
                  : 'bg-white/85 backdrop-blur border-amber-200 text-amber-900 hover:bg-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Center Open Window — 100% Clear for the Giant 3D Toy! */}
      <div className="pointer-events-none flex-1 flex items-start justify-center pt-1">
        {voiceBadge && (
          <div className="bg-white/90 backdrop-blur px-4 py-1 rounded-full text-xs font-extrabold text-terracotta-600 shadow animate-pop">
            {voiceBadge}
          </div>
        )}
      </div>

      {/* Bottom Compact Frosted Word Plaque & Word Dots */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 pb-1">
        <div className="bg-white/90 backdrop-blur-md border-4 border-white rounded-[2rem] px-5 sm:px-7 py-3 shadow-xl flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="font-kids text-3xl sm:text-4xl leading-none" style={{ color: currentWord.accentHex }}>
                {currentWord.darija}
              </span>
              {settings.showArabic && (
                <span className="font-arabic text-2xl sm:text-3xl font-bold text-majorelle-500" dir="rtl">
                  {currentWord.arabic}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-extrabold">
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                {currentWord.phonetics}
              </span>
              {settings.showEnglish && (
                <span className="text-slate-500">{currentWord.english}</span>
              )}
              {currentWord.funCue && (
                <span className="text-terracotta-500">{currentWord.funCue}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              sceneRef.current?.triggerCelebrate();
              speakCurrent(currentWord);
            }}
            className="bg-majorelle-500 hover:bg-majorelle-600 text-white font-kids text-lg sm:text-xl px-5 py-3 rounded-2xl border-b-4 border-majorelle-600 active:translate-y-0.5 active:border-b-0 shadow-lg flex items-center gap-2 transition-all"
          >
            <SpeakerIcon className="w-6 h-6" />
            <span>Say {currentWord.darija}</span>
          </button>
        </div>

        {/* Direct Word Selector Pills (Swipe 3D stage OR tap any pill!) */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-2xl">
          {words.map((w, i) => (
            <button
              key={w.id}
              onClick={() => jumpToWord(i)}
              className={`px-3 py-1 rounded-full font-kids text-xs sm:text-sm transition-all ${
                i === index
                  ? 'bg-majorelle-500 text-white shadow scale-105'
                  : 'bg-white/80 text-amber-900 hover:bg-white'
              }`}
            >
              {w.darija}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
