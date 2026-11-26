import React, { useEffect, useState, useRef } from 'react';
import { PRAISE_PHRASES } from '../constants.ts';
import { Word } from '../types.ts';
import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

/** Authentic Moroccan 8-point zellige tile border strip */
export const ZelligeBorder: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full h-3 overflow-hidden flex-shrink-0 ${className}`} aria-hidden="true">
    <svg className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <pattern id="zellige-strip" width="44" height="12" patternUnits="userSpaceOnUse">
          <rect width="44" height="12" fill="#1D5FD1" />
          <polygon points="7,1 12,6 7,11 2,6" fill="#FBBF24" />
          <circle cx="7" cy="6" r="2" fill="#FFF7E6" />
          <polygon points="22,1 27,6 22,11 17,6" fill="#14A392" />
          <circle cx="22" cy="6" r="2" fill="#FFF7E6" />
          <polygon points="37,1 42,6 37,11 32,6" fill="#E5633B" />
          <circle cx="37" cy="6" r="2" fill="#FFF7E6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige-strip)" />
    </svg>
  </div>
);

/** Crisp vector star icon (no raw Unicode emoji) */
export const StarIcon: React.FC<{ filled?: boolean; className?: string }> = ({
  filled = true,
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <polygon
      points="16,3 20,12 30,13 22,19 25,29 16,24 7,29 10,19 2,13 12,12"
      fill={filled ? '#FBBF24' : '#E2E8F0'}
      stroke={filled ? '#B45309' : '#94A3B8'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Crisp vector speaker icon */
export const SpeakerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

interface CelebrationModalProps {
  starsEarned: number;
  unlockedWord?: Word | null;
  showArabic: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

interface PoppableStar {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  popped: boolean;
}

const CELEBRATION_DURATION_MS = 2000;

/**
 * Reward Without Friction:
 * - Brief (~2.0s) interactive celebration with poppable glowing stars & confetti!
 * - Toddlers can tap/pop floating celebration stars for musical sparkles.
 * - Automatically flows right into the next round — zero tiny "Next" button hunting,
 *   and zero stray single-tap "Home" exits!
 */
export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  starsEarned,
  unlockedWord,
  showArabic,
  onPlayAgain,
}) => {
  const praise = PRAISE_PHRASES[starsEarned % PRAISE_PHRASES.length];
  const [poppedCombo, setPoppedCombo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [floatingStars, setFloatingStars] = useState<PoppableStar[]>(() => {
    const palette = ['#FBBF24', '#F472B6', '#38BDF8', '#34D399', '#A78BFA', '#FB923C'];
    return Array.from({ length: 10 }, (_, idx) => {
      const angle = (idx / 10) * Math.PI * 2;
      const rx = 34 + (idx % 2) * 10;
      const ry = 30 + ((idx + 1) % 2) * 10;
      return {
        id: idx,
        x: Math.max(10, Math.min(90, 50 + Math.cos(angle) * rx)),
        y: Math.max(14, Math.min(86, 50 + Math.sin(angle) * ry)),
        size: 46 + (idx % 3) * 10,
        color: palette[idx % palette.length],
        popped: false,
      };
    });
  });

  const onPlayAgainRef = useRef(onPlayAgain);
  onPlayAgainRef.current = onPlayAgain;

  useEffect(() => {
    const start = performance.now();
    let rafId = 0;
    let done = false;

    const tick = (now: number) => {
      const pct = Math.min(1, (now - start) / CELEBRATION_DURATION_MS);
      setProgress(pct);
      if (pct >= 1 && !done) {
        done = true;
        onPlayAgainRef.current();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const popStar = (id: number, xPct: number) => {
    setFloatingStars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, popped: true } : s))
    );
    const panX = (xPct / 100) * 2 - 1;
    SoundFXEngine.playBubblePop(0.85, panX);
    SoundFXEngine.playSparkleCascade(poppedCombo, panX);
    setPoppedCombo((c) => c + 1);
  };

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 bg-amber-950/25 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-hidden select-none"
      onPointerDown={(e) => {
        const panX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
        SoundFXEngine.playSparkleCascade(poppedCombo, panX);
        setPoppedCombo((c) => c + 1);
      }}
    >
      {/* Interactive Poppable Celebration Stars & Confetti Orbs */}
      {floatingStars.map((star) => (
        <button
          key={star.id}
          type="button"
          aria-label="Pop celebration star"
          onPointerDown={(e) => {
            e.stopPropagation();
            if (!star.popped) popStar(star.id, star.x);
          }}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-300 ${
            star.popped
              ? 'scale-150 opacity-0 pointer-events-none'
              : 'animate-float hover:scale-110 active:scale-75 drop-shadow-xl'
          }`}
        >
          <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
            <polygon
              points="18,2 22.8,12.2 34,13.6 25.6,21.2 27.8,32.4 18,26.8 8.2,32.4 10.4,21.2 2,13.6 13.2,12.2"
              fill={star.color}
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}

      {/* Joyful Compact Praise Plaque — Auto-Advances Smoothly in 2.0s! */}
      <div className="relative bg-white/95 border-8 border-saffron-400 rounded-[2.25rem] shadow-2xl max-w-sm w-full p-6 text-center animate-pop">
        <div className="flex justify-center gap-2 mb-2.5">
          <StarIcon className="w-10 h-10 animate-bounce" />
          <StarIcon className="w-12 h-12 animate-bounce" />
          <StarIcon className="w-10 h-10 animate-bounce" />
        </div>

        <h2 className="font-kids text-4xl text-terracotta-500 leading-tight">{praise.darija}</h2>
        {showArabic && (
          <p className="font-arabic text-2xl font-bold text-majorelle-500 mt-0.5" dir="rtl">
            {praise.arabic}
          </p>
        )}

        <div className="mt-3.5 inline-flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-5 py-1.5 rounded-full">
          <StarIcon className="w-6 h-6" />
          <span className="font-kids text-2xl text-amber-700">+{starsEarned}</span>
        </div>

        {unlockedWord && (
          <div className="mt-3.5 bg-sand-50 border-4 border-minttile-400/50 rounded-3xl p-3 text-center shadow-sm">
            <div className="font-kids text-2xl text-amber-800">
              {unlockedWord.darija}{' '}
              {showArabic && (
                <span className="font-arabic text-majorelle-500" dir="rtl">
                  {unlockedWord.arabic}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Smooth Auto-Advance Visual Progress Pill */}
        <div className="mt-5 h-2.5 w-full bg-amber-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-saffron-400 via-minttile-500 to-majorelle-500 rounded-full transition-none"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
