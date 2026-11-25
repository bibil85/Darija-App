import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CATEGORIES, WORDS } from '../constants.ts';
import { CategoryType, ParentSettings, Word } from '../types.ts';
import { WordIllustration } from './WordIllustration.tsx';
import { speakWord } from '../services/audioService.ts';
import { playClickSound, playFlipSound, playPopSound } from '../services/soundService.ts';

interface ExploreBookProps {
  initialCategory: CategoryType;
  settings: ParentSettings;
  onWordExplored?: (wordId: string) => void;
}

/**
 * Swipe-First Interactive Moroccan Picture Book:
 * - Swipe left/right directly on the giant storybook card to turn pages!
 * - Tap anywhere on the animated character to hear its Darija name & see sparkles!
 * - Tap any mini thumbnail below to jump straight to a word — zero clunky arrows!
 */
export const ExploreBook: React.FC<ExploreBookProps> = ({
  initialCategory,
  settings,
  onWordExplored,
}) => {
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [index, setIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [voiceBadge, setVoiceBadge] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const badgeTimerRef = useRef<number | null>(null);
  const catButtonRefs = useRef<Partial<Record<CategoryType, HTMLButtonElement | null>>>({});

  const words = useMemo(
    () => WORDS.filter((w) => w.category === category),
    [category]
  );

  const currentWord: Word = words[index] || words[0];

  useEffect(() => {
    catButtonRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [category]);

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    };
  }, []);

  const handleSpeak = async (word: Word) => {
    setIsSpeaking(true);
    setSparkleKey((k) => k + 1);
    playPopSound();
    onWordExplored?.(word.id);

    const res = await speakWord(word);
    if (res.source === 'parent') {
      setVoiceBadge(`❤️ ${res.speakerLabel || 'Family'}`);
    } else if (res.source === 'gemini') {
      setVoiceBadge('✨ Darija Voice');
    } else {
      setVoiceBadge(null);
    }

    if (badgeTimerRef.current) window.clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = window.setTimeout(() => {
      setIsSpeaking(false);
      setVoiceBadge(null);
    }, 1100);
  };

  const selectCategory = (cat: CategoryType) => {
    playClickSound();
    setCategory(cat);
    setIndex(0);
    setVoiceBadge(null);
  };

  const turnPage = (delta: number) => {
    playFlipSound();
    const nextIdx = (index + delta + words.length) % words.length;
    setIndex(nextIdx);
    const nextWord = words[nextIdx];
    if (nextWord) {
      handleSpeak(nextWord);
    }
  };

  // Direct pointer/touch swipe gesture on the big storybook card
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    setIsDragging(true);
    setDragOffsetX(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore synthetic events
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragStartRef.current.x;
    setDragOffsetX(Math.max(-180, Math.min(180, dx)));
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragStartRef.current.x;
    dragStartRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);

    if (dx <= -55) {
      turnPage(1); // Swipe left -> Next word!
    } else if (dx >= 55) {
      turnPage(-1); // Swipe right -> Previous word!
    } else if (Math.abs(dx) < 16) {
      // Gentle tap -> Speak & animate character!
      handleSpeak(currentWord);
    }
  };

  const rotation = dragOffsetX * 0.055;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Category Pills Strip (With Custom Pixar Mini Illustrations!) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
        {CATEGORIES.map((cat) => {
          const active = cat.id === category;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                catButtonRefs.current[cat.id] = el;
              }}
              onClick={() => selectCategory(cat.id)}
              className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-2xl font-kids text-base sm:text-lg whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 active:border-b-0 ${
                active
                  ? `${cat.bgClass} ${cat.borderClass} text-white shadow-md scale-[1.02]`
                  : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span className="w-9 h-9 rounded-xl bg-white/90 p-0.5 flex items-center justify-center flex-shrink-0">
                <WordIllustration wordId={cat.icon} animated={false} className="w-full h-full" />
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Swipeable Storybook Stage */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-7">
        {/* Swipeable Giant Living Picture Card */}
        <div
          role="button"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') turnPage(1);
            else if (e.key === 'ArrowLeft') turnPage(-1);
            else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSpeak(currentWord);
            }
          }}
          aria-label={`${currentWord.darija} (${currentWord.english}) — Tap to hear, swipe left or right to change card`}
          className={`relative w-full md:w-1/2 max-w-md aspect-square max-h-[46vh] md:max-h-[58vh] rounded-[2.5rem] border-8 border-white pixar-card-sheen flex flex-col items-center justify-center p-5 sm:p-7 select-none touch-none cursor-grab active:cursor-grabbing focus:outline-none overflow-hidden ${
            isSpeaking && !isDragging ? 'animate-jelly ring-4 ring-saffron-400' : ''
          }`}
          style={{
            backgroundColor: currentWord.bgHex,
            transform: `translateX(${dragOffsetX}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* Sparkle Burst on Tap */}
          {sparkleKey > 0 && (
            <div key={sparkleKey} className="pointer-events-none absolute inset-0">
              <span className="absolute top-6 left-8 text-3xl animate-sparkle">✨</span>
              <span className="absolute top-8 right-10 text-3xl animate-sparkle" style={{ animationDelay: '0.08s' }}>🌟</span>
              <span className="absolute bottom-12 left-10 text-2xl animate-sparkle" style={{ animationDelay: '0.15s' }}>⭐</span>
              <span className="absolute bottom-10 right-10 text-3xl animate-sparkle" style={{ animationDelay: '0.2s' }}>✨</span>
            </div>
          )}

          {/* Voice Source Badge */}
          {voiceBadge && (
            <div className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full text-xs font-extrabold text-terracotta-600 shadow-sm animate-pop">
              {voiceBadge}
            </div>
          )}

          {/* Fun Cue Bubble */}
          {currentWord.funCue && (
            <div
              className={`absolute top-4 right-4 bg-white/95 px-3.5 py-1.5 rounded-full font-kids text-sm sm:text-base shadow-sm transition-transform ${
                isSpeaking ? 'scale-110' : 'scale-100'
              }`}
              style={{ color: currentWord.accentHex }}
            >
              {currentWord.funCue}
            </div>
          )}

          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            <WordIllustration
              wordId={currentWord.id}
              className={`w-[84%] h-[84%] transition-transform duration-300 ${
                isSpeaking ? 'scale-110 -rotate-2' : ''
              }`}
            />
          </div>

          {/* Gentle Swipe Hint Pill */}
          <div className="pointer-events-none absolute bottom-3 inset-x-4 flex items-center justify-center">
            <span className="bg-white/90 px-4 py-1 rounded-full text-xs sm:text-sm font-extrabold text-amber-800 shadow-sm flex items-center gap-2">
              <span className="animate-swipe-hint inline-block">👈</span>
              <span>Swipe card or tap to hear!</span>
              <span className="animate-swipe-hint inline-block">👉</span>
            </span>
          </div>
        </div>

        {/* Word Info & Giant Listen Button Panel (No clunky arrow buttons!) */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col items-center text-center gap-4">
          <div className="bg-white/95 border-4 border-amber-200 rounded-[2.25rem] px-6 py-5 sm:py-6 w-full shadow-md">
            <div
              className="font-kids text-5xl sm:text-6xl leading-tight tracking-tight"
              style={{ color: currentWord.accentHex }}
            >
              {currentWord.darija}
            </div>

            {settings.showArabic && (
              <div
                className="font-arabic text-3xl sm:text-4xl font-bold text-majorelle-500 mt-1"
                dir="rtl"
              >
                {currentWord.arabic}
              </div>
            )}

            <div className="mt-3 flex items-center justify-center flex-wrap gap-2">
              <span className="bg-amber-100 text-amber-800 font-extrabold text-sm sm:text-base px-3.5 py-1 rounded-full">
                🗣️ {currentWord.phonetics}
              </span>
              {settings.showEnglish && (
                <span className="bg-slate-100 text-slate-600 font-bold text-sm sm:text-base px-3.5 py-1 rounded-full">
                  {currentWord.english}
                </span>
              )}
            </div>
          </div>

          {/* Single Huge Child-Friendly Audio Button */}
          <button
            onClick={() => handleSpeak(currentWord)}
            aria-label={`Play pronunciation for ${currentWord.darija}`}
            className={`w-full max-w-[280px] h-20 rounded-[1.75rem] font-kids text-2xl sm:text-3xl text-white border-b-[6px] shadow-xl flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0 transition-all ${
              isSpeaking
                ? 'bg-minttile-500 border-minttile-600 scale-105'
                : 'bg-majorelle-500 hover:bg-majorelle-600 border-majorelle-600'
            }`}
          >
            <span className="text-3xl">{isSpeaking ? '🎶' : '🔊'}</span>
            <span>Say {currentWord.darija}!</span>
          </button>
        </div>
      </div>

      {/* Direct Visual Picture Strip — Tap Any Picture Directly */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pt-1 pb-1 flex-shrink-0">
        {words.map((w, i) => {
          const active = i === index;
          return (
            <button
              key={w.id}
              onClick={() => {
                playClickSound();
                setIndex(i);
                handleSpeak(w);
              }}
              aria-label={w.english}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 flex-shrink-0 border-4 transition-all ${
                active
                  ? 'border-majorelle-500 scale-110 shadow-md ring-2 ring-majorelle-400/40'
                  : 'border-white opacity-75 hover:opacity-100'
              }`}
              style={{ backgroundColor: w.bgHex }}
            >
              <WordIllustration wordId={w.id} animated={false} className="w-full h-full" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
