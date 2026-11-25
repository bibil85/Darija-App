import React from 'react';
import { PRAISE_PHRASES } from '../constants.ts';
import { Word } from '../types.ts';
import { Mascot } from './Mascot.tsx';
import { WordIllustration } from './WordIllustration.tsx';

/** Authentic Moroccan 8-point zellige tile border strip */
export const ZelligeBorder: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full h-3.5 overflow-hidden flex-shrink-0 ${className}`} aria-hidden="true">
    <svg className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <pattern id="zellige-strip" width="44" height="14" patternUnits="userSpaceOnUse">
          <rect width="44" height="14" fill="#1D5FD1" />
          <polygon points="7,1 13,7 7,13 1,7" fill="#FBBF24" />
          <circle cx="7" cy="7" r="2.2" fill="#FFF7E6" />
          <polygon points="22,1 28,7 22,13 16,7" fill="#14A392" />
          <circle cx="22" cy="7" r="2.2" fill="#FFF7E6" />
          <polygon points="37,1 43,7 37,13 31,7" fill="#E5633B" />
          <circle cx="37" cy="7" r="2.2" fill="#FFF7E6" />
          <circle cx="14.5" cy="7" r="1.4" fill="#FFF7E6" opacity="0.85" />
          <circle cx="29.5" cy="7" r="1.4" fill="#FFF7E6" opacity="0.85" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige-strip)" />
    </svg>
  </div>
);

/** Decorative tile pattern for Memory card backs */
export const ZelligeCardPattern: React.FC = () => (
  <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
    <rect width="120" height="120" rx="18" fill="#1D5FD1" />
    <rect x="6" y="6" width="108" height="108" rx="14" fill="none" stroke="#FBBF24" strokeWidth="3" strokeDasharray="6 4" />
    {/* 8-point Moroccan star */}
    <g transform="translate(60, 60)">
      <rect x="-26" y="-26" width="52" height="52" rx="6" fill="#14A392" stroke="#FFF7E6" strokeWidth="2.5" />
      <rect x="-26" y="-26" width="52" height="52" rx="6" transform="rotate(45)" fill="#F59E0B" stroke="#FFF7E6" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="15" fill="#E5633B" stroke="#FFF7E6" strokeWidth="2.5" />
      <circle cx="0" cy="0" r="6" fill="#FEF3C7" />
    </g>
    {/* Corner dots */}
    <circle cx="20" cy="20" r="4" fill="#FBBF24" />
    <circle cx="100" cy="20" r="4" fill="#FBBF24" />
    <circle cx="20" cy="100" r="4" fill="#FBBF24" />
    <circle cx="100" cy="100" r="4" fill="#FBBF24" />
  </svg>
);

interface CelebrationModalProps {
  starsEarned: number;
  unlockedWord?: Word | null;
  showArabic: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  starsEarned,
  unlockedWord,
  showArabic,
  onPlayAgain,
  onHome,
}) => {
  const praise = PRAISE_PHRASES[starsEarned % PRAISE_PHRASES.length];

  return (
    <div className="fixed inset-0 z-50 bg-amber-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-sand-50 border-8 border-saffron-400 rounded-[2.25rem] shadow-2xl max-w-md w-full p-6 sm:p-8 text-center animate-pop overflow-hidden">
        {/* Confetti bits */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <span className="absolute top-2 left-8 text-2xl animate-confetti">🌟</span>
          <span className="absolute top-0 right-10 text-2xl animate-confetti" style={{ animationDelay: '0.15s' }}>🎉</span>
          <span className="absolute top-4 left-1/3 text-xl animate-confetti" style={{ animationDelay: '0.3s' }}>✨</span>
          <span className="absolute top-2 right-1/3 text-2xl animate-confetti" style={{ animationDelay: '0.45s' }}>⭐</span>
        </div>

        <div className="flex justify-center -mt-2 mb-2">
          <Mascot mood="cheering" size={112} />
        </div>

        <h2 className="font-kids text-4xl text-terracotta-500 leading-tight">{praise.darija}</h2>
        {showArabic && (
          <p className="font-arabic text-2xl font-bold text-majorelle-500 mt-0.5" dir="rtl">
            {praise.arabic}
          </p>
        )}

        <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-5 py-2 rounded-full">
          <span className="text-2xl">⭐</span>
          <span className="font-kids text-2xl text-amber-700">+{starsEarned} Stars!</span>
        </div>

        {unlockedWord && (
          <div className="mt-4 bg-white border-4 border-minttile-400/50 rounded-3xl p-3 flex items-center justify-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: unlockedWord.bgHex }}>
              <WordIllustration wordId={unlockedWord.id} className="w-full h-full" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold uppercase tracking-wider text-minttile-600">
                New Sticker Unlocked!
              </div>
              <div className="font-kids text-xl text-amber-800">{unlockedWord.darija}</div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onHome}
            className="py-4 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-kids text-xl border-b-4 border-amber-300 active:translate-y-0.5 active:border-b-0 transition-all"
          >
            🏠 Home
          </button>
          <button
            onClick={onPlayAgain}
            className="py-4 px-4 rounded-2xl bg-minttile-500 hover:bg-minttile-600 text-white font-kids text-xl border-b-4 border-minttile-600 active:translate-y-0.5 active:border-b-0 transition-all shadow-md"
          >
            🔄 Play Again!
          </button>
        </div>
      </div>
    </div>
  );
};
