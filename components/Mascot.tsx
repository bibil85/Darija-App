import React from 'react';

export type MascotMood = 'happy' | 'cheering' | 'listening' | 'waving' | 'hungry' | 'chomp';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Sba3 — Disney/Pixar-inspired 3D-shaded animated Moroccan Atlas Lion cub mascot.
 * Features multi-stop radial fur/mane lighting, expressive blinking Pixar eyes with
 * dual specular catchlights, animated ears/paw, and dynamic moods (hungry/chomp/cheering).
 */
export const Mascot: React.FC<MascotProps> = ({
  mood = 'happy',
  size = 112,
  className = '',
  onClick,
}) => {
  const isCheering = mood === 'cheering';
  const isListening = mood === 'listening';
  const isHungry = mood === 'hungry';
  const isChomp = mood === 'chomp';

  const bodyMotion = isCheering
    ? 'animate-bounce'
    : isChomp
    ? 'animate-chomp'
    : isHungry
    ? 'animate-jelly'
    : 'animate-alive';

  const content = (
      <svg
        viewBox="0 0 220 220"
        className={`w-full h-full drop-shadow-xl ${bodyMotion}`}
      >
        <defs>
          <radialGradient id="sba3ManeGrad" cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#FF8A5B" />
            <stop offset="52%" stopColor="#D95D39" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>
          <radialGradient id="sba3FaceGrad" cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="52%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>
          <radialGradient id="sba3SnoutGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </radialGradient>
          <radialGradient id="sba3EyeIris" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="60%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#1C0A00" />
          </radialGradient>
          <linearGradient id="sba3CrownGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="55%" stopColor="#1D5FD1" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <radialGradient id="sba3CheekGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse cx="110" cy="198" rx="64" ry="11" fill="#78350F" opacity="0.16" />

        {/* Fluffy 3D Layered Mane */}
        <g fill="url(#sba3ManeGrad)" stroke="#7C2D12" strokeWidth="3.5" strokeLinejoin="round">
          <circle cx="110" cy="46" r="28" />
          <circle cx="148" cy="56" r="28" />
          <circle cx="174" cy="88" r="28" />
          <circle cx="176" cy="128" r="28" />
          <circle cx="156" cy="162" r="28" />
          <circle cx="122" cy="176" r="28" />
          <circle cx="98" cy="176" r="28" />
          <circle cx="64" cy="162" r="28" />
          <circle cx="44" cy="128" r="28" />
          <circle cx="46" cy="88" r="28" />
          <circle cx="72" cy="56" r="28" />
          <circle cx="110" cy="116" r="68" stroke="none" />
        </g>

        {/* Soft Mane Rim Highlight */}
        <path
          d="M54 78 Q82 34 140 46"
          fill="none"
          stroke="#FED7AA"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Rounded Expressive Ears */}
        <g>
          <circle cx="62" cy="64" r="20" fill="url(#sba3FaceGrad)" stroke="#9A3412" strokeWidth="3.5" />
          <circle cx="62" cy="64" r="10" fill="#FDBA74" />
          <circle cx="158" cy="64" r="20" fill="url(#sba3FaceGrad)" stroke="#9A3412" strokeWidth="3.5" />
          <circle cx="158" cy="64" r="10" fill="#FDBA74" />
        </g>

        {/* Royal Majorelle-Blue Moroccan Crown */}
        <path
          d="M86 48 L95 22 L110 35 L125 22 L134 48 Q110 54 86 48 Z"
          fill="url(#sba3CrownGrad)"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <polygon points="110,33 112.5,39 119,39 114,43 116,49 110,45 104,49 106,43 101,39 107.5,39" fill="#FDE047" />

        {/* Pixar 3D Shaded Face */}
        <circle cx="110" cy="118" r="56" fill="url(#sba3FaceGrad)" stroke="#9A3412" strokeWidth="3.5" />
        {/* Forehead Specular Highlight */}
        <ellipse cx="96" cy="78" rx="22" ry="10" fill="#FFFFFF" opacity="0.32" />

        {/* Soft Snout */}
        <ellipse cx="110" cy="138" rx="33" ry="24" fill="url(#sba3SnoutGrad)" />

        {/* Expressive Pixar Eyes with Dual Specular Catchlights & Blinking */}
        {isCheering ? (
          <g fill="none" stroke="#3B2314" strokeWidth="5.5" strokeLinecap="round">
            <path d="M74 106 Q86 90 98 106" />
            <path d="M122 106 Q134 90 146 106" />
          </g>
        ) : (
          <g className="animate-blink">
            {/* Left Eye */}
            <ellipse cx="86" cy="105" rx="13" ry="15" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.5" />
            <ellipse cx="87" cy="106" rx="9.5" ry="11.5" fill="url(#sba3EyeIris)" />
            <circle cx="87" cy="106" r="5" fill="#0F0702" />
            <circle cx="91" cy="100" r="4" fill="#FFFFFF" />
            <circle cx="83" cy="110" r="1.9" fill="#FFFFFF" opacity="0.85" />
            {/* Right Eye */}
            <ellipse cx="134" cy="105" rx="13" ry="15" fill="#FFFFFF" stroke="#78350F" strokeWidth="2.5" />
            <ellipse cx="133" cy="106" rx="9.5" ry="11.5" fill="url(#sba3EyeIris)" />
            <circle cx="133" cy="106" r="5" fill="#0F0702" />
            <circle cx="137" cy="100" r="4" fill="#FFFFFF" />
            <circle cx="129" cy="110" r="1.9" fill="#FFFFFF" opacity="0.85" />
          </g>
        )}

        {/* Cute Eyebrows */}
        <path d="M74 86 Q86 80 96 86" fill="none" stroke="#9A3412" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M124 86 Q134 80 146 86" fill="none" stroke="#9A3412" strokeWidth="3.5" strokeLinecap="round" />

        {/* Subsurface Rosy Cheeks */}
        <ellipse cx="68" cy="126" rx="15" ry="10" fill="url(#sba3CheekGlow)" />
        <ellipse cx="152" cy="126" rx="15" ry="10" fill="url(#sba3CheekGlow)" />

        {/* Glossy Lion Nose */}
        <path d="M98 126 Q110 118 122 126 Q110 138 98 126 Z" fill="#5C3218" />
        <ellipse cx="107" cy="124" rx="4.5" ry="2.2" fill="#FFFFFF" opacity="0.45" />

        {/* Expressive Mouth (Hungry Open / Cheering Laugh / Warm Smile) */}
        {isHungry ? (
          <g>
            <ellipse cx="110" cy="148" rx="22" ry="18" fill="#881337" stroke="#5C3218" strokeWidth="3.5" />
            <ellipse cx="110" cy="158" rx="14" ry="7" fill="#FB7185" />
          </g>
        ) : isCheering || isChomp ? (
          <g>
            <path d="M90 140 Q110 164 130 140 Z" fill="#BE123C" stroke="#5C3218" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M98 152 Q110 144 122 152 Q110 158 98 152 Z" fill="#FB7185" />
          </g>
        ) : (
          <path d="M96 142 Q110 154 124 142" fill="none" stroke="#5C3218" strokeWidth="4.2" strokeLinecap="round" />
        )}

        {/* Whiskers */}
        <g stroke="#9A3412" strokeWidth="2.6" strokeLinecap="round" opacity="0.65">
          <line x1="60" y1="130" x2="78" y2="132" />
          <line x1="60" y1="140" x2="78" y2="138" />
          <line x1="160" y1="130" x2="142" y2="132" />
          <line x1="160" y1="140" x2="142" y2="138" />
        </g>

        {/* Listening Sound Waves */}
        {isListening && (
          <g stroke="#1D5FD1" strokeWidth="5" strokeLinecap="round" fill="none" className="animate-pulse">
            <path d="M184 68 Q196 80 184 92" />
            <path d="M196 58 Q212 80 196 102" />
          </g>
        )}

        {/* Animated Waving Paw (outer translate keeps CSS wag in place!) */}
        {(mood === 'waving' || mood === 'happy') && (
          <g transform="translate(174, 148)">
            <g className="animate-wag">
              <ellipse cx="0" cy="0" rx="17" ry="20" fill="url(#sba3FaceGrad)" stroke="#9A3412" strokeWidth="3.5" />
              <circle cx="-6" cy="-7" r="3.5" fill="#D95D39" />
              <circle cx="0" cy="-10" r="3.5" fill="#D95D39" />
              <circle cx="6" cy="-7" r="3.5" fill="#D95D39" />
              <ellipse cx="0" cy="4" rx="7" ry="5.5" fill="#D95D39" />
            </g>
          </g>
        )}
      </svg>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Sba3 the Moroccan Lion"
        className={`relative inline-flex items-center justify-center focus:outline-none cursor-pointer active:scale-95 transition-transform ${className}`}
        style={{ width: size, height: size }}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      role="img"
      aria-label="Sba3 the Moroccan Lion"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {content}
    </span>
  );
};
