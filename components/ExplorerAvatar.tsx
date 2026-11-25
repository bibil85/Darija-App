import React from 'react';
import { AgeMode } from '../types.ts';

interface ExplorerAvatarProps {
  profile: AgeMode; // 'little' = Nora (2), 'big' = Sophia (4)
  size?: number;
  className?: string;
}

/**
 * Pixar-inspired 3D-shaded animated character avatars for Nora (2) & Sophia (4).
 */
export const ExplorerAvatar: React.FC<ExplorerAvatarProps> = ({
  profile,
  size = 44,
  className = '',
}) => {
  const isNora = profile === 'little';

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`flex-shrink-0 drop-shadow-sm ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`avBg-${profile}`} cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor={isNora ? '#FEF9C3' : '#E0F2FE'} />
          <stop offset="100%" stopColor={isNora ? '#FDE047' : '#93C5FD'} />
        </radialGradient>
        <radialGradient id={`avSkin-${profile}`} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE4CC" />
          <stop offset="65%" stopColor="#F5C39C" />
          <stop offset="100%" stopColor="#DE9D70" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="56" fill={`url(#avBg-${profile})`} stroke="#FFFFFF" strokeWidth="5" />

      {isNora ? (
        /* NORA (Age 2) — Curly pigtails with sunny saffron ribbons! */
        <g>
          {/* Pigtails */}
          <circle cx="22" cy="52" r="16" fill="#3B2314" stroke="#291A12" strokeWidth="2.5" />
          <circle cx="98" cy="52" r="16" fill="#3B2314" stroke="#291A12" strokeWidth="2.5" />
          <circle cx="32" cy="44" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="88" cy="44" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
          {/* Dress */}
          <path d="M26 112 C28 86 92 86 94 112 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
          {/* Chubby Toddler Face */}
          <circle cx="60" cy="60" r="30" fill={`url(#avSkin-${profile})`} stroke="#78350F" strokeWidth="2.5" />
          {/* Curly Bangs */}
          <path d="M32 54 Q45 28 60 36 Q75 28 88 54 Q74 42 60 44 Q46 42 32 54 Z" fill="#3B2314" />
          {/* Big Sparkling Pixar Eyes */}
          <g className="animate-blink">
            <ellipse cx="48" cy="61" rx="6.5" ry="7.5" fill="#291A12" />
            <ellipse cx="72" cy="61" rx="6.5" ry="7.5" fill="#291A12" />
            <circle cx="50" cy="58.5" r="2.5" fill="#FFFFFF" />
            <circle cx="74" cy="58.5" r="2.5" fill="#FFFFFF" />
            <circle cx="46.5" cy="63.5" r="1.2" fill="#FFFFFF" />
            <circle cx="70.5" cy="63.5" r="1.2" fill="#FFFFFF" />
          </g>
          <ellipse cx="39" cy="70" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.6" />
          <ellipse cx="81" cy="70" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.6" />
          <path d="M51 73 Q60 82 69 73" fill="none" stroke="#9D174D" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : (
        /* SOPHIA (Age 4) — Wavy dark hair with turquoise Moroccan star headband! */
        <g>
          {/* Flowing Hair Back */}
          <ellipse cx="60" cy="64" rx="38" ry="38" fill="#3B2314" stroke="#291A12" strokeWidth="2.5" />
          {/* Majorelle Blue Cardigan */}
          <path d="M24 112 C28 86 92 86 96 112 Z" fill="#1D5FD1" stroke="#1E3A8A" strokeWidth="2.5" />
          {/* Face */}
          <circle cx="60" cy="60" r="29" fill={`url(#avSkin-${profile})`} stroke="#78350F" strokeWidth="2.5" />
          {/* Hair Bangs */}
          <path d="M31 54 C35 28 85 28 89 54 C74 42 46 42 31 54 Z" fill="#3B2314" />
          {/* Turquoise Headband + Golden Star */}
          <path d="M33 44 Q60 24 87 44" fill="none" stroke="#14B8A6" strokeWidth="6" strokeLinecap="round" />
          <polygon points="78,31 80,36 85,36 81,39 82,44 78,41 74,44 75,39 71,36 76,36" fill="#FDE047" />
          {/* Big Sparkling Pixar Eyes */}
          <g className="animate-blink">
            <ellipse cx="48" cy="61" rx="6.5" ry="7.5" fill="#291A12" />
            <ellipse cx="72" cy="61" rx="6.5" ry="7.5" fill="#291A12" />
            <circle cx="50" cy="58.5" r="2.5" fill="#FFFFFF" />
            <circle cx="74" cy="58.5" r="2.5" fill="#FFFFFF" />
            <circle cx="46.5" cy="63.5" r="1.2" fill="#FFFFFF" />
            <circle cx="70.5" cy="63.5" r="1.2" fill="#FFFFFF" />
          </g>
          <ellipse cx="39" cy="70" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.55" />
          <ellipse cx="81" cy="70" rx="5.5" ry="3.2" fill="#FB7185" opacity="0.55" />
          <path d="M50 73 Q60 83 70 73" fill="none" stroke="#9D174D" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};
