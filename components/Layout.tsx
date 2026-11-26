import React, { useState, useEffect, useRef } from 'react';
import { AgeMode, DifficultyLevel } from '../types.ts';
import { StarIcon, ZelligeBorder } from './MoroccanDecor.tsx';
import { ExplorerAvatar } from './ExplorerAvatar.tsx';
import { HoldGateButton } from './ParentGateButton.tsx';
import { playClickSound, playGentleBoing, playSuccessSound } from '../services/soundService.ts';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHomeButton?: boolean;
  stars: number;
  ageMode: AgeMode;
  difficulty: DifficultyLevel;
  showGyroButton?: boolean;
  gyroEnabled?: boolean;
  onEnableGyro?: () => void;
  sfxEnabled?: boolean;
  onToggleSfx?: () => void;
  onHomeClick: () => void;
  onProfileSelect: (mode: AgeMode, difficulty: DifficultyLevel) => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
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
  const a = 4 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 7);
  const answer = a * b;

  const wrongSet = new Set<number>();
  const offsets = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 8];
  while (wrongSet.size < 3) {
    const candidate = answer + offsets[Math.floor(Math.random() * offsets.length)];
    if (candidate > 0 && candidate !== answer) wrongSet.add(candidate);
  }

  const choices = [answer, ...Array.from(wrongSet)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { question: `${a} × ${b} = ?`, answer, choices };
}

/**
 * Floating translucent HUD shell positioned above the full-bleed 3D WebGL Stage3D.
 * Pointer events pass directly through empty areas to the 3D scene below!
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showHomeButton = false,
  stars,
  ageMode,
  difficulty,
  showGyroButton = false,
  gyroEnabled = false,
  onEnableGyro,
  sfxEnabled = true,
  onToggleSfx,
  onHomeClick,
  onProfileSelect,
  onDifficultyChange,
  onStickersClick,
  onParentOpen,
  hideChromeControls = false,
}) => {
  const [mathGate, setMathGate] = useState<MathChallenge | null>(null);
  const [gateWrong, setGateWrong] = useState(false);
  const twoFingerStartRef = useRef<{ avgY: number; triggered: boolean } | null>(null);

  // Two-finger downward swipe (> 110px) parent shortcut to safely exit an active game to Home
  useEffect(() => {
    if (!showHomeButton) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        twoFingerStartRef.current = { avgY, triggered: false };
      } else {
        twoFingerStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = twoFingerStartRef.current;
      if (!state || state.triggered || e.touches.length !== 2) return;
      const avgY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (avgY - state.avgY >= 115) {
        state.triggered = true;
        playSuccessSound();
        onHomeClick();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        twoFingerStartRef.current = null;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showHomeButton, onHomeClick]);

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
      className="pointer-events-none relative z-10 h-full w-full flex flex-col overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <ZelligeBorder className="pointer-events-auto" />

      {/* Sleek Frosted Glass iPad HUD Header (Parent-Gated 1.5s Hold Navigation!) */}
      <header className="pointer-events-auto relative z-30 w-full bg-white/80 backdrop-blur-md border-b-2 border-white/70 px-3.5 sm:px-5 py-2 flex items-center justify-between gap-2 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          {showHomeButton ? (
            <HoldGateButton
              onComplete={onHomeClick}
              gated={true}
              ariaLabel="Back to Home"
              ringColor="#D97706"
              className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-kids text-base sm:text-lg px-3.5 py-2 rounded-2xl border-b-4 border-amber-300 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </HoldGateButton>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-terracotta-500 flex items-center justify-center shadow text-white font-kids text-lg">
                DF
              </div>
              <div>
                <h1 className="font-kids text-xl sm:text-2xl text-terracotta-600 leading-none tracking-tight">
                  Darija Fun 3D
                </h1>
                <span className="hidden md:inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700/80">
                  Nora &amp; Sophia&apos;s Playworld
                </span>
              </div>
            </div>
          )}

          {title && showHomeButton && (
            <h2 className="font-kids text-lg sm:text-2xl text-amber-900 truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Right HUD Controls: Parent-Gated Nora/Sophia + 3 Difficulty Levels + Stars + Math Lock */}
        {!hideChromeControls && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Nora & Sophia Profile Toggle (1.5s Hold Gate prevents stray taps switching profile) */}
            <div
              className="flex items-center bg-amber-100/90 p-1 rounded-2xl border-2 border-amber-200 gap-1"
              role="group"
              aria-label="Choose Nora or Sophia"
            >
              <HoldGateButton
                onComplete={() => onProfileSelect('little', 1)}
                gated={ageMode !== 'little'}
                ariaLabel="Switch to Nora"
                ringColor="#F59E0B"
                className={`pl-1 pr-2.5 py-1 rounded-xl font-kids text-sm sm:text-base transition-all flex items-center gap-1.5 ${
                  ageMode === 'little'
                    ? 'bg-saffron-400 text-amber-950 shadow-sm'
                    : 'text-amber-800 hover:bg-amber-200/60'
                }`}
              >
                <ExplorerAvatar profile="little" size={24} />
                <span>Nora</span>
              </HoldGateButton>
              <HoldGateButton
                onComplete={() => onProfileSelect('big', difficulty === 3 ? 3 : 2)}
                gated={ageMode !== 'big'}
                ariaLabel="Switch to Sophia"
                ringColor="#1D5FD1"
                className={`pl-1 pr-2.5 py-1 rounded-xl font-kids text-sm sm:text-base transition-all flex items-center gap-1.5 ${
                  ageMode === 'big'
                    ? 'bg-majorelle-500 text-white shadow-sm'
                    : 'text-amber-800 hover:bg-amber-200/60'
                }`}
              >
                <ExplorerAvatar profile="big" size={24} />
                <span>Sophia</span>
              </HoldGateButton>
            </div>

            {/* 3 Progressive Difficulty Levels (1.5s Hold Gate prevents accidental resets mid-game) */}
            <div
              className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-2xl border-2 border-slate-200 gap-0.5"
              role="group"
              aria-label="Difficulty level"
            >
              {([1, 2, 3] as DifficultyLevel[]).map((lv) => (
                <HoldGateButton
                  key={lv}
                  onComplete={() => onDifficultyChange(lv)}
                  gated={difficulty !== lv}
                  ariaLabel={`Difficulty Level ${lv}`}
                  ringColor="#14A392"
                  className={`px-2 py-1 rounded-xl font-kids text-xs transition-all ${
                    difficulty === lv
                      ? 'bg-minttile-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Lv {lv}
                </HoldGateButton>
              ))}
            </div>

            {/* Optional iPad Safari 3D Tilt Gyroscope Permission Pill */}
            {showGyroButton && !gyroEnabled && onEnableGyro && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onEnableGyro();
                }}
                aria-label="Enable 3D Tilt Gyroscope"
                className="bg-sky-100 hover:bg-sky-200 border-2 border-sky-300 text-sky-800 px-2.5 py-1.5 rounded-2xl text-xs font-extrabold uppercase tracking-wide active:scale-95 transition-transform"
              >
                3D Tilt
              </button>
            )}

            {/* Quick Sound FX Mute / Unmute Toggle (independent of Darija voice!) */}
            {onToggleSfx && (
              <button
                type="button"
                onClick={onToggleSfx}
                aria-label={sfxEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
                title={sfxEnabled ? 'SFX On (tap to mute)' : 'SFX Muted (tap to unmute)'}
                className={`p-2 rounded-2xl border-2 active:scale-95 transition-all ${
                  sfxEnabled
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-400'
                }`}
              >
                {sfxEnabled ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>
            )}

            {/* Star Counter (Gated while inside an active game so stray taps never exit mid-round) */}
            <HoldGateButton
              onComplete={onStickersClick}
              gated={showHomeButton}
              ariaLabel="Open 3D Sticker Oasis"
              ringColor="#F59E0B"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-saffron-400 px-3 py-1.5 rounded-2xl shadow-sm transition-transform"
            >
              <StarIcon className="w-5 h-5" />
              <span className="font-kids text-base sm:text-lg text-amber-800">{stars}</span>
            </HoldGateButton>

            {/* Grown-Up Math Gate Button */}
            <button
              type="button"
              onClick={openMathGate}
              aria-label="Open Grown-Up Parent Studio"
              className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 px-2.5 sm:px-3 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span className="hidden lg:inline">Parents</span>
            </button>
          </div>
        )}
      </header>

      {/* Transparent HUD Layer over the live 3D Canvas */}
      <main className="pointer-events-none flex-1 min-h-0 w-full max-w-6xl mx-auto px-3 sm:px-5 py-2.5 flex flex-col justify-between overflow-hidden">
        {children}
      </main>

      {/* Grown-Up Math Gate Modal */}
      {mathGate && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setMathGate(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white border-4 border-majorelle-400 rounded-[2rem] shadow-2xl max-w-sm w-full p-6 text-center animate-pop ${
              gateWrong ? 'animate-wiggle border-rose-400' : ''
            }`}
          >
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
