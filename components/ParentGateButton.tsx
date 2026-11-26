import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TODDLER_UX_CONFIG } from '../src/ux/ToddlerUXGuard.ts';
import { playClickSound, playSuccessSound } from '../services/soundService.ts';

interface HoldGateButtonProps {
  onComplete: () => void;
  holdMs?: number;
  gated?: boolean;
  ariaLabel: string;
  className?: string;
  ringColor?: string;
  children: React.ReactNode;
}

/**
 * Toddler-Safe Parent Gate Button (Hold 1.5s with Visible Circular Progress Ring):
 * Prevents stray toddler taps from kicking a child out of a game or switching difficulty mid-session.
 * - While holding, displays an animated circular SVG progress ring around a floating badge.
 * - Releasing early gently nudges with a brief "Hold 1.5s" hint pill for parents and keeps the game running!
 */
export const HoldGateButton: React.FC<HoldGateButtonProps> = ({
  onComplete,
  holdMs = TODDLER_UX_CONFIG.PARENT_GATE_HOLD_MS,
  gated = true,
  ariaLabel,
  className = '',
  ringColor = '#F59E0B',
  children,
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);
  const activePointerIdRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setHolding(false);
    setProgress(0);
    activePointerIdRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  const flashHoldHint = () => {
    setShowHint(true);
    if (hintTimerRef.current !== null) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = window.setTimeout(() => setShowHint(false), 1200);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!gated) {
      playClickSound();
      onComplete();
      return;
    }

    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    completedRef.current = false;
    startTimeRef.current = performance.now();
    setHolding(true);
    setProgress(0);
    setShowHint(false);
    playClickSound();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture unsupported
    }

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(1, elapsed / holdMs);
      setProgress(pct);

      if (pct >= 1) {
        completedRef.current = true;
        cleanup();
        playSuccessSound();
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    const wasCompleted = completedRef.current;
    cleanup();
    if (gated && !wasCompleted) {
      flashHoldHint();
    }
  };

  // SVG Circular Progress Ring geometry
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={gated ? `${ariaLabel} (Hold 1.5s)` : ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative select-none ${holding ? 'scale-95' : ''} ${className}`}
      >
        {children}

        {/* Visible Circular Progress Ring Overlay while holding */}
        {gated && holding && (
          <span
            className="pointer-events-none absolute -top-2 -right-2 z-30 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center border border-amber-200"
            aria-hidden="true"
          >
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
          </span>
        )}
      </button>

      {/* Brief subtle parent-only tooltip when tapped instead of held */}
      {gated && showHint && (
        <div
          role="status"
          className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 whitespace-nowrap bg-slate-800/90 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg animate-fade-up"
        >
          Hold 1.5s
        </div>
      )}
    </div>
  );
};
