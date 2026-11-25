import React, { useState } from 'react';
import { AgeMode } from '../types.ts';
import { ZelligeBorder } from './MoroccanDecor.tsx';
import { Mascot } from './Mascot.tsx';
import { ExplorerAvatar } from './ExplorerAvatar.tsx';
import { playClickSound, playGentleBoing, playSuccessSound } from '../services/soundService.ts';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHomeButton?: boolean;
  stars: number;
  ageMode: AgeMode;
  onHomeClick: () => void;
  onAgeModeChange: (mode: AgeMode) => void;
  onStickersClick: () => void;
  onParentOpen: () => void;
  hideChromeControls?: boolean;
}

interface MathChallenge {
  question: string;
  answer: number;
  choices: number[];
}

function createMathChallenge(): MathChallenge {
  // Multiplication challenge: easy & instant for grown-ups, safe from toddlers/4-year-olds
  const a = 4 + Math.floor(Math.random() * 6); // 4..9
  const b = 3 + Math.floor(Math.random() * 7); // 3..9
  const answer = a * b;

  const wrongSet = new Set<number>();
  const offsets = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 8];
  while (wrongSet.size < 3) {
    const candidate = answer + offsets[Math.floor(Math.random() * offsets.length)];
    if (candidate > 0 && candidate !== answer) {
      wrongSet.add(candidate);
    }
  }

  const choices = [answer, ...Array.from(wrongSet)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return {
    question: `${a} × ${b} = ?`,
    answer,
    choices,
  };
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showHomeButton = false,
  stars,
  ageMode,
  onHomeClick,
  onAgeModeChange,
  onStickersClick,
  onParentOpen,
  hideChromeControls = false,
}) => {
  const [mathGate, setMathGate] = useState<MathChallenge | null>(null);
  const [gateWrong, setGateWrong] = useState(false);

  const openMathGate = () => {
    playClickSound();
    setGateWrong(false);
    setMathGate(createMathChallenge());
  };

  const handleGateChoice = (choice: number) => {
    if (!mathGate) return;
    if (choice === mathGate.answer) {
      playSuccessSound();
      setMathGate(null);
      setGateWrong(false);
      onParentOpen();
    } else {
      playGentleBoing();
      setGateWrong(true);
      window.setTimeout(() => {
        setGateWrong(false);
        setMathGate(createMathChallenge());
      }, 450);
    }
  };

  return (
    <div
      className="relative h-full w-full flex flex-col bg-moroccan-paper overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Ambient Living Sunlit Clouds in Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-45 z-0" aria-hidden="true">
        <svg className="absolute top-20 left-6 w-28 h-16 animate-cloud-drift" viewBox="0 0 120 60">
          <path d="M24 50 C10 50 8 32 22 28 C24 12 48 8 58 20 C68 10 92 14 94 30 C110 32 108 50 92 50 Z" fill="#FFFFFF" />
        </svg>
        <svg className="absolute top-28 right-10 w-36 h-20 animate-cloud-drift" style={{ animationDelay: '-4s' }} viewBox="0 0 120 60">
          <path d="M24 50 C10 50 8 32 22 28 C24 12 48 8 58 20 C68 10 92 14 94 30 C110 32 108 50 92 50 Z" fill="#FFFFFF" />
        </svg>
      </div>

      <ZelligeBorder className="relative z-20" />

      {/* Responsive iPad Header */}
      <header className="relative w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-200/80 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 z-20 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          {showHomeButton ? (
            <button
              onClick={() => {
                playClickSound();
                onHomeClick();
              }}
              aria-label="Back to Home"
              className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-kids text-lg sm:text-xl px-4 py-2 rounded-2xl border-b-4 border-amber-300 active:translate-y-0.5 active:border-b-0 transition-all"
            >
              <svg viewBox="0 0 36 36" className="w-6 h-6" aria-hidden="true">
                <path d="M5 17 L18 5 L31 17 L27 17 L27 30 L21 30 L21 22 L15 22 L15 30 L9 30 L9 17 Z" fill="#D97706" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </button>
          ) : (
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <Mascot mood="happy" size={44} />
              <div>
                <h1 className="font-kids text-2xl sm:text-3xl text-terracotta-500 leading-none tracking-tight">
                  Darija Fun!
                </h1>
                <span className="hidden md:inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-600/80">
                  Nora &amp; Sophia&apos;s Playworld
                </span>
              </div>
            </button>
          )}

          {title && showHomeButton && (
            <h2 className="font-kids text-xl sm:text-2xl text-amber-800 truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Right Controls: Nora / Sophia Profile Switcher, Golden Stars, Grown-Up Math Gate */}
        {!hideChromeControls && (
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Nora & Sophia Profile Switcher */}
            <div
              className="flex items-center bg-amber-100/90 p-1 rounded-2xl border-2 border-amber-200 gap-1"
              role="group"
              aria-label="Choose Nora or Sophia"
            >
              <button
                onClick={() => {
                  playClickSound();
                  onAgeModeChange('little');
                }}
                className={`pl-1.5 pr-3 py-1 rounded-xl font-kids text-sm sm:text-base transition-all flex items-center gap-1.5 ${
                  ageMode === 'little'
                    ? 'bg-saffron-400 text-amber-950 shadow-sm'
                    : 'text-amber-700 hover:bg-amber-200/60'
                }`}
              >
                <ExplorerAvatar profile="little" size={26} />
                <span>Nora</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onAgeModeChange('big');
                }}
                className={`pl-1.5 pr-3 py-1 rounded-xl font-kids text-sm sm:text-base transition-all flex items-center gap-1.5 ${
                  ageMode === 'big'
                    ? 'bg-majorelle-500 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-200/60'
                }`}
              >
                <ExplorerAvatar profile="big" size={26} />
                <span>Sophia</span>
              </button>
            </div>

            {/* Golden Stars / Sticker Oasis Shortcut */}
            <button
              onClick={() => {
                playClickSound();
                onStickersClick();
              }}
              aria-label="Open Sticker Oasis"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-saffron-400 px-3 sm:px-3.5 py-1.5 rounded-2xl shadow-sm active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
                <polygon points="16,3 20,12 30,13 22,19 25,29 16,24 7,29 10,19 2,13 12,12" fill="#FBBF24" stroke="#B45309" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="font-kids text-lg sm:text-xl text-amber-700">{stars}</span>
            </button>

            {/* Grown-Up Math Gate Button */}
            <button
              type="button"
              onClick={openMathGate}
              title="Grown-Up Studio (Voice Recorder & Settings)"
              aria-label="Open Grown-Up Parent Studio"
              className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-600 px-3 py-2 rounded-2xl text-sm font-bold flex items-center gap-1.5 active:scale-95 transition-transform select-none"
            >
              <span className="text-base">🔒</span>
              <span className="hidden lg:inline text-xs uppercase tracking-wide">Parents</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Responsive Stage */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 py-3.5 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Grown-Up Math Gate Modal */}
      {mathGate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMathGate(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white border-4 border-majorelle-400 rounded-[2rem] shadow-2xl max-w-sm w-full p-6 text-center animate-pop ${
              gateWrong ? 'animate-wiggle border-rose-400' : ''
            }`}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-3xl mb-2">
              🔒
            </div>
            <h3 className="font-kids text-2xl text-slate-800">For Grown-Ups Only</h3>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Solve to open Parent Voice Studio &amp; Settings:
            </p>

            <div className="my-5 py-3.5 px-4 rounded-2xl bg-amber-50 border-2 border-amber-200 font-kids text-4xl text-majorelle-600 tracking-wide">
              {mathGate.question}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mathGate.choices.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleGateChoice(val)}
                  className="py-3.5 rounded-2xl bg-slate-100 hover:bg-majorelle-500 hover:text-white text-slate-800 font-kids text-2xl border-b-4 border-slate-300 hover:border-majorelle-600 active:translate-y-0.5 active:border-b-0 transition-all"
                >
                  {val}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setMathGate(null);
              }}
              className="mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 px-4 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
