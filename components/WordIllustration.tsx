import React from 'react';
import { renderAnimalsOrFoodArt } from './art/AnimalsFoodArt.tsx';
import { renderFamilyHomeNatureColorsArt } from './art/FamilyHomeNatureArt.tsx';
import { renderBodyOrNumbersArt } from './art/BodyNumbersArt.tsx';

interface WordIllustrationProps {
  wordId: string;
  className?: string;
  animated?: boolean;
}

/**
 * Renders living, Disney/Pixar-shaded storybook SVG illustrations for all 64 Darija words.
 * Includes soft 3D gradients, ground shadow, subtle breathing motion, and glossy specular depth.
 */
export const WordIllustration: React.FC<WordIllustrationProps> = ({
  wordId,
  className = 'w-full h-full',
  animated = true,
}) => {
  const artwork =
    renderAnimalsOrFoodArt(wordId) ??
    renderFamilyHomeNatureColorsArt(wordId) ??
    renderBodyOrNumbersArt(wordId);

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={wordId}
    >
      <defs>
        {/* Soft Pixar-inspired 3D depth gradients */}
        <radialGradient id="pxSkin" cx="40%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFE1C6" />
          <stop offset="65%" stopColor="#F6C59F" />
          <stop offset="100%" stopColor="#DF9E72" />
        </radialGradient>
        <radialGradient id="pxGold" cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>
        <radialGradient id="pxBlue" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </radialGradient>
        <radialGradient id="pxSheen" cx="30%" cy="22%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="pxSoftShadow" x="-12%" y="-12%" width="124%" height="128%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#78350F" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Soft grounded 3D contact shadow */}
      <ellipse cx="100" cy="180" rx="52" ry="9" fill="#92400E" opacity="0.14" />

      <g className={animated ? 'animate-alive' : ''} filter="url(#pxSoftShadow)">
        {artwork || (
          <g>
            <circle cx="100" cy="100" r="62" fill="url(#pxGold)" stroke="#D97706" strokeWidth="4" />
            <text x="100" y="114" textAnchor="middle" fontSize="48">⭐</text>
          </g>
        )}
      </g>

      {/* Subtle warm top-left 3D studio rim sheen */}
      <ellipse cx="82" cy="52" rx="48" ry="26" fill="url(#pxSheen)" pointerEvents="none" />
    </svg>
  );
};
