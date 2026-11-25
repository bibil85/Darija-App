import React from 'react';
import { AppView } from '../types.ts';

interface GameIconProps {
  view: AppView;
  className?: string;
}

/** Custom 3D-shaded animated Pixar-style game emblems (replaces basic system emojis!) */
export const GameIcon: React.FC<GameIconProps> = ({ view, className = 'w-14 h-14' }) => {
  switch (view) {
    case 'explore':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <defs>
            <linearGradient id="giBook" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
          <g className="animate-alive">
            <path d="M12 28 Q32 18 50 30 L50 82 Q32 70 12 78 Z" fill="url(#giBook)" stroke="#92400E" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M88 28 Q68 18 50 30 L50 82 Q68 70 88 78 Z" fill="#FFFBEB" stroke="#92400E" strokeWidth="3.5" strokeLinejoin="round" />
            <circle cx="31" cy="52" r="9" fill="#FB923C" />
            <polygon points="70,40 73,48 82,48 75,53 77,62 70,57 63,62 65,53 58,48 67,48" fill="#F59E0B" />
            <circle cx="50" cy="18" r="4" fill="#FEF08A" className="animate-pulse" />
          </g>
        </svg>
      );

    case 'bubbles':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <defs>
            <radialGradient id="giBub" cx="30%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#BAE6FD" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
            </radialGradient>
          </defs>
          <g className="animate-float">
            <circle cx="42" cy="54" r="28" fill="url(#giBub)" stroke="#FFFFFF" strokeWidth="3.5" />
            <ellipse cx="32" cy="42" rx="8" ry="4.5" transform="rotate(-30 32 42)" fill="#FFFFFF" />
            <circle cx="72" cy="34" r="16" fill="url(#giBub)" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="67" cy="28" r="3.5" fill="#FFFFFF" />
            <circle cx="74" cy="70" r="11" fill="url(#giBub)" stroke="#FFFFFF" strokeWidth="2.5" />
          </g>
        </svg>
      );

    case 'peekaboo':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          {/* Glowing Moroccan Arched Door with Peeking Eyes! */}
          <g className="animate-peek-wiggle">
            <path d="M18 86 L18 44 Q50 8 82 44 L82 86 Z" fill="#1D5FD1" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M28 84 L28 48 Q50 22 72 48 L72 84 Z" fill="#0F172A" />
            <g className="animate-blink">
              <circle cx="41" cy="56" r="7" fill="#FFFFFF" />
              <circle cx="59" cy="56" r="7" fill="#FFFFFF" />
              <circle cx="42.5" cy="56" r="3.5" fill="#1E293B" />
              <circle cx="60.5" cy="56" r="3.5" fill="#1E293B" />
              <circle cx="44" cy="54" r="1.5" fill="#FFFFFF" />
              <circle cx="62" cy="54" r="1.5" fill="#FFFFFF" />
            </g>
            <circle cx="50" cy="24" r="4" fill="#FBBF24" />
          </g>
        </svg>
      );

    case 'feed':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <g className="animate-alive">
            {/* Yummy Bowl + Red Apple */}
            <circle cx="50" cy="40" r="20" fill="#EF4444" stroke="#991B1B" strokeWidth="3" />
            <path d="M50 20 Q54 12 60 12" fill="none" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="58" cy="18" rx="7" ry="4" fill="#22C55E" />
            <ellipse cx="42" cy="34" rx="4" ry="7" fill="#FFFFFF" opacity="0.45" />
            <path d="M16 54 L84 54 C80 82 68 88 50 88 C32 88 20 82 16 54 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="3.5" />
            <path d="M24 66 Q50 74 76 66" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'discovery':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <g className="animate-alive">
            <circle cx="42" cy="52" r="24" fill="#FEF3C7" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M30 44 L40 44 L52 34 L52 70 L40 60 L30 60 Z" fill="#1D5FD1" />
            <g stroke="#FDE047" strokeWidth="5" strokeLinecap="round" fill="none" className="animate-pulse">
              <path d="M62 38 Q72 52 62 66" />
              <path d="M74 28 Q88 52 74 76" />
            </g>
          </g>
        </svg>
      );

    case 'memory':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <g className="animate-alive">
            <rect x="14" y="24" width="46" height="58" rx="12" transform="rotate(-10 37 53)" fill="#1D5FD1" stroke="#FFFFFF" strokeWidth="3.5" />
            <rect x="40" y="20" width="46" height="58" rx="12" transform="rotate(8 63 49)" fill="#FEF3C7" stroke="#FFFFFF" strokeWidth="3.5" />
            <polygon points="63,34 67,45 79,45 69,52 73,63 63,56 53,63 57,52 47,45 59,45" fill="#F59E0B" />
          </g>
        </svg>
      );

    case 'sorting':
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <g className="animate-alive">
            {/* Woven Moroccan Basket */}
            <path d="M28 46 Q50 14 72 46" fill="none" stroke="#FEF3C7" strokeWidth="6" strokeLinecap="round" />
            <path d="M16 46 L84 46 L74 84 Q50 90 26 84 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" strokeLinejoin="round" />
            <line x1="22" y1="60" x2="78" y2="60" stroke="#92400E" strokeWidth="3" />
            <line x1="26" y1="73" x2="74" y2="73" stroke="#92400E" strokeWidth="3" />
            <circle cx="40" cy="40" r="10" fill="#FB7185" />
            <circle cx="60" cy="40" r="10" fill="#4ADE80" />
          </g>
        </svg>
      );

    case 'stickers':
    default:
      return (
        <svg viewBox="0 0 100 100" className={`${className} drop-shadow-md`} aria-hidden="true">
          <g className="animate-alive">
            <circle cx="50" cy="52" r="34" fill="#FEF3C7" stroke="#FFFFFF" strokeWidth="4" />
            {/* Palm & Star */}
            <path d="M50 82 Q54 58 48 40" fill="none" stroke="#92400E" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="36" cy="38" rx="14" ry="5" transform="rotate(-18 36 38)" fill="#22C55E" />
            <ellipse cx="62" cy="38" rx="14" ry="5" transform="rotate(18 62 38)" fill="#22C55E" />
            <ellipse cx="49" cy="30" rx="13" ry="5" transform="rotate(-48 49 30)" fill="#16A34A" />
            <polygon points="74,20 77,28 85,28 79,33 81,41 74,36 67,41 69,33 63,28 71,28" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
          </g>
        </svg>
      );
  }
};
