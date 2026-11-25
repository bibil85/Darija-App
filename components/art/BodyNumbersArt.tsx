import React from 'react';

/** Bespoke Pixar-inspired animated SVG illustrations for Body Parts (10) & Numbers 1-10 (10) */
export function renderBodyOrNumbersArt(wordId: string): React.ReactNode | null {
  switch (wordId) {
    // ================= BODY PARTS (10) =================
    case 'head':
      return (
        <g>
          {/* Cute Pixar Kid Portrait pointing to Head */}
          <ellipse cx="100" cy="176" rx="44" ry="20" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="4" />
          <circle cx="54" cy="108" r="12" fill="#F6C59F" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="146" cy="108" r="12" fill="#F6C59F" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="100" cy="106" r="46" fill="url(#pxSkin)" stroke="#78350F" strokeWidth="4" />
          {/* Curly Hair Puff */}
          <g fill="#451A03" stroke="#291A12" strokeWidth="3">
            <circle cx="70" cy="68" r="16" />
            <circle cx="92" cy="58" r="18" />
            <circle cx="116" cy="60" r="17" />
            <circle cx="134" cy="72" r="15" />
          </g>
          {/* Sparkly Crown / Halo Accent Highlighting Head */}
          <path d="M72 42 Q100 22 128 42" fill="none" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 8" />
          {/* Expressive Blinking Pixar Eyes */}
          <g className="animate-blink">
            <ellipse cx="82" cy="106" rx="9" ry="11" fill="#291A12" />
            <ellipse cx="118" cy="106" rx="9" ry="11" fill="#291A12" />
            <circle cx="85" cy="102" r="3.5" fill="#FFF" />
            <circle cx="121" cy="102" r="3.5" fill="#FFF" />
            <circle cx="79" cy="110" r="1.8" fill="#FFF" opacity="0.8" />
            <circle cx="115" cy="110" r="1.8" fill="#FFF" opacity="0.8" />
          </g>
          <ellipse cx="68" cy="120" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="132" cy="120" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
          <path d="M86 126 Q100 140 114 126" fill="none" stroke="#9A3412" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      );

    case 'eyes':
      return (
        <g>
          {/* Pair of huge expressive sparkling Pixar eyes */}
          <g className="animate-blink">
            {/* Left Eye */}
            <ellipse cx="62" cy="104" rx="34" ry="40" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="4.5" />
            <circle cx="66" cy="106" r="22" fill="url(#pxBlue)" />
            <circle cx="66" cy="106" r="11" fill="#0F172A" />
            <circle cx="74" cy="96" r="7" fill="#FFFFFF" />
            <circle cx="58" cy="114" r="3.5" fill="#FFFFFF" opacity="0.85" />
            {/* Right Eye */}
            <ellipse cx="138" cy="104" rx="34" ry="40" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="4.5" />
            <circle cx="134" cy="106" r="22" fill="url(#pxBlue)" />
            <circle cx="134" cy="106" r="11" fill="#0F172A" />
            <circle cx="142" cy="96" r="7" fill="#FFFFFF" />
            <circle cx="126" cy="114" r="3.5" fill="#FFFFFF" opacity="0.85" />
          </g>
          {/* Cute Eyebrows & Lashes */}
          <path d="M36 58 Q62 44 86 58" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M114 58 Q138 44 164 58" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
        </g>
      );

    case 'nose':
      return (
        <g>
          {/* Soft friendly face framing a glowing boop-able nose */}
          <circle cx="100" cy="104" r="64" fill="url(#pxSkin)" stroke="#9A3412" strokeWidth="4" />
          <g className="animate-blink">
            <circle cx="74" cy="84" r="7" fill="#291A12" />
            <circle cx="126" cy="84" r="7" fill="#291A12" />
            <circle cx="76.5" cy="81.5" r="2.5" fill="#FFF" />
            <circle cx="128.5" cy="81.5" r="2.5" fill="#FFF" />
          </g>
          {/* Highlighted cute button nose with boop sparkle */}
          <ellipse cx="100" cy="110" rx="22" ry="18" fill="#FB7185" stroke="#BE123C" strokeWidth="4" />
          <ellipse cx="93" cy="103" rx="7" ry="4.5" fill="#FFFFFF" opacity="0.65" />
          <path d="M84 140 Q100 152 116 140" fill="none" stroke="#9A3412" strokeWidth="4" strokeLinecap="round" />
          <text x="142" y="70" fontSize="26">✨</text>
        </g>
      );

    case 'mouth':
      return (
        <g>
          {/* Big Joyful Cartoon Smile */}
          <path
            d="M36 86 Q100 100 164 86 C164 148 134 166 100 166 C66 166 36 148 36 86 Z"
            fill="#BE123C"
            stroke="#881337"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Glossy Top Teeth */}
          <path d="M52 92 Q100 104 148 92 L144 114 Q100 122 56 114 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          {/* Happy Pink Tongue */}
          <path d="M68 152 Q100 124 132 152 Q100 166 68 152 Z" fill="#FB7185" />
          {/* Rosy Cheeks */}
          <ellipse cx="32" cy="78" rx="14" ry="8" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="168" cy="78" rx="14" ry="8" fill="#FDA4AF" opacity="0.65" />
        </g>
      );

    case 'ears':
      return (
        <g>
          {/* Big Cute Listening Ear with Musical Sound Waves */}
          <path
            d="M96 42 C136 42 150 76 142 112 C136 142 118 164 94 160 C78 158 72 142 82 132 C92 122 106 122 104 104 C102 88 84 82 76 92 C66 68 72 42 96 42 Z"
            fill="url(#pxSkin)"
            stroke="#9A3412"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path d="M98 66 C118 68 122 96 110 112" fill="none" stroke="#C2410C" strokeWidth="4.5" strokeLinecap="round" />
          {/* Musical Waves */}
          <g stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" fill="none" className="animate-pulse">
            <path d="M48 80 Q36 100 48 120" />
            <path d="M32 66 Q16 100 32 134" />
          </g>
          <text x="148" y="66" fontSize="28">🎵</text>
        </g>
      );

    case 'hands':
      return (
        <g className="animate-wag">
          {/* Two Playful Waving Hands */}
          <g fill="url(#pxSkin)" stroke="#9A3412" strokeWidth="4" strokeLinejoin="round">
            {/* Palm */}
            <rect x="64" y="96" width="72" height="64" rx="28" />
            {/* Fingers */}
            <rect x="64" y="48" width="16" height="58" rx="8" />
            <rect x="83" y="36" width="17" height="68" rx="8.5" />
            <rect x="103" y="40" width="17" height="64" rx="8.5" />
            <rect x="122" y="54" width="15" height="52" rx="7.5" />
            {/* Thumb */}
            <rect x="38" y="102" width="36" height="17" rx="8.5" transform="rotate(-28 56 110)" />
          </g>
          {/* Cute Heart on Palm */}
          <path d="M100 124 C100 117 110 117 110 124 C110 132 100 139 100 139 C100 139 90 132 90 124 C90 117 100 117 100 124 Z" fill="#FB7185" />
        </g>
      );

    case 'feet':
      return (
        <g>
          {/* Cute Pair of Toddler Feet */}
          <g fill="url(#pxSkin)" stroke="#9A3412" strokeWidth="3.8">
            {/* Left Foot */}
            <ellipse cx="66" cy="128" rx="24" ry="42" transform="rotate(-8 66 128)" />
            <circle cx="80" cy="76" r="10" />
            <circle cx="66" cy="74" r="7.5" />
            <circle cx="54" cy="78" r="6.5" />
            <circle cx="44" cy="86" r="5.5" />
            {/* Right Foot */}
            <ellipse cx="134" cy="128" rx="24" ry="42" transform="rotate(8 134 128)" />
            <circle cx="120" cy="76" r="10" />
            <circle cx="134" cy="74" r="7.5" />
            <circle cx="146" cy="78" r="6.5" />
            <circle cx="156" cy="86" r="5.5" />
          </g>
          {/* Playful tickle sparkles */}
          <text x="90" y="54" fontSize="24">✨</text>
        </g>
      );

    case 'belly':
      return (
        <g>
          {/* Cute Smiling Bear/Kid Tummy with Heart */}
          <ellipse cx="100" cy="112" rx="64" ry="60" fill="url(#pxGold)" stroke="#92400E" strokeWidth="4.5" />
          <ellipse cx="100" cy="120" rx="44" ry="40" fill="#FEF3C7" stroke="#D97706" strokeWidth="3.5" />
          {/* Cute Belly Button */}
          <circle cx="100" cy="128" r="6" fill="#D97706" />
          {/* Tickle Hands / Sparkles */}
          <path d="M84 102 Q100 116 116 102" fill="none" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <text x="32" y="64" fontSize="26">✨</text>
          <text x="144" y="64" fontSize="26">✨</text>
        </g>
      );

    case 'hair':
      return (
        <g>
          {/* Fluffy Swirly Curly Hair with Pretty Ribbon Bow */}
          <g fill="#451A03" stroke="#291A12" strokeWidth="4">
            <circle cx="62" cy="96" r="32" />
            <circle cx="138" cy="96" r="32" />
            <circle cx="80" cy="64" r="32" />
            <circle cx="120" cy="64" r="32" />
            <circle cx="100" cy="98" r="44" />
          </g>
          {/* Glossy Hair Highlights */}
          <path d="M68 56 Q84 44 100 54" fill="none" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          <path d="M114 58 Q130 50 140 66" fill="none" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
          {/* Big Cute Pink Hair Bow */}
          <polygon points="100,118 68,96 68,140" fill="#F472B6" stroke="#9D174D" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="100,118 132,96 132,140" fill="#F472B6" stroke="#9D174D" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="100" cy="118" r="12" fill="#FB7185" stroke="#9D174D" strokeWidth="4" />
        </g>
      );

    case 'teeth':
      return (
        <g>
          {/* Super Cute Sparkling Smiling Tooth */}
          <path
            d="M66 46 C46 46 42 78 52 108 C60 134 62 164 78 164 C90 164 92 138 100 138 C108 138 110 164 122 164 C138 164 140 134 148 108 C158 78 154 46 134 46 C118 46 112 58 100 58 C88 58 82 46 66 46 Z"
            fill="#FFFFFF"
            stroke="#0891B2"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <g className="animate-blink">
            <circle cx="82" cy="92" r="6.5" fill="#0F172A" />
            <circle cx="118" cy="92" r="6.5" fill="#0F172A" />
            <circle cx="84.5" cy="89.5" r="2.2" fill="#FFF" />
            <circle cx="120.5" cy="89.5" r="2.2" fill="#FFF" />
          </g>
          <path d="M88 108 Q100 120 112 108" fill="none" stroke="#0891B2" strokeWidth="4" strokeLinecap="round" />
          {/* Sparkles */}
          <path d="M156 44 L160 32 L164 44 L176 48 L164 52 L160 64 L156 52 L144 48 Z" fill="#FBBF24" />
          <path d="M36 62 L39 54 L42 62 L50 65 L42 68 L39 76 L36 68 L28 65 Z" fill="#38BDF8" />
        </g>
      );

    // ================= NUMBERS 1–10 (Glossy 3D Numeral + Countable Stars!) =================
    case 'num_1':
    case 'num_2':
    case 'num_3':
    case 'num_4':
    case 'num_5':
    case 'num_6':
    case 'num_7':
    case 'num_8':
    case 'num_9':
    case 'num_10': {
      const count = parseInt(wordId.replace('num_', ''), 10);
      const colors = [
        '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
        '#0EA5E9', '#1D5FD1', '#8B5CF6', '#D946EF', '#EC4899',
      ];
      const fill = colors[(count - 1) % colors.length];
      // Arrange countable golden stars cleanly at the bottom
      const cols = Math.min(count, 5);
      const rows = Math.ceil(count / 5);

      return (
        <g>
          {/* Glossy 3D Sticker Pill */}
          <rect
            x="28"
            y="18"
            width="144"
            height="108"
            rx="34"
            fill={fill}
            stroke="#FFFFFF"
            strokeWidth="6"
          />
          {/* Top specular shine */}
          <rect x="42" y="26" width="116" height="22" rx="11" fill="#FFFFFF" opacity="0.28" />
          {/* Big Chunky 3D Numeral */}
          <text
            x="100"
            y="94"
            textAnchor="middle"
            fontSize={count === 10 ? '68' : '78'}
            fontWeight="800"
            fontFamily="Fredoka, sans-serif"
            fill="#FFFFFF"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="3"
          >
            {count}
          </text>

          {/* Countable Golden Stars */}
          <g>
            {Array.from({ length: count }).map((_, i) => {
              const row = Math.floor(i / 5);
              const inRow = row === rows - 1 && count % 5 !== 0 ? count % 5 : cols;
              const col = i % 5;
              const spacing = 30;
              const startX = 100 - ((inRow - 1) * spacing) / 2;
              const cx = startX + col * spacing;
              const cy = rows === 1 ? 156 : 146 + row * 28;
              return (
                <g key={i} transform={`translate(${cx}, ${cy}) scale(0.95)`}>
                  <polygon
                    points="0,-12 3.5,-4 12,-3.5 5.5,2 7.5,11 0,6.5 -7.5,11 -5.5,2 -12,-3.5 -3.5,-4"
                    fill="#FBBF24"
                    stroke="#B45309"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
          </g>
        </g>
      );
    }

    default:
      return null;
  }
}
