import React from 'react';

/** Bespoke storybook SVG illustrations for Animals (8) and Food (8) */
export function renderAnimalsOrFoodArt(wordId: string): React.ReactNode | null {
  switch (wordId) {
    // ================= ANIMALS =================
    case 'cat':
      return (
        <g>
          {/* Animated Wagging Tail */}
          <path className="animate-wag" d="M148 152 Q178 140 172 106 Q168 92 158 98" fill="none" stroke="#F97316" strokeWidth="14" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="100" cy="148" rx="44" ry="34" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" />
          <ellipse cx="100" cy="154" rx="24" ry="20" fill="#FFEDD5" />
          {/* Ears */}
          <polygon points="56,74 48,34 86,56" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="58,66 55,44 76,58" fill="#FDA4AF" />
          <polygon points="144,74 152,34 114,56" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" strokeLinejoin="round" />
          <polygon points="142,66 145,44 124,58" fill="#FDA4AF" />
          {/* Head */}
          <ellipse cx="100" cy="92" rx="48" ry="42" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" />
          {/* Stripes */}
          <path d="M90 52 L93 66 M100 50 L100 66 M110 52 L107 66" stroke="#C2410C" strokeWidth="4" strokeLinecap="round" />
          {/* Blinking Pixar Eyes */}
          <g className="animate-blink">
            <ellipse cx="80" cy="88" rx="9" ry="10.5" fill="#291A12" />
            <ellipse cx="120" cy="88" rx="9" ry="10.5" fill="#291A12" />
            <circle cx="83" cy="84" r="3.4" fill="#FFF" />
            <circle cx="123" cy="84" r="3.4" fill="#FFF" />
            <circle cx="78" cy="91" r="1.6" fill="#FFF" opacity="0.8" />
            <circle cx="118" cy="91" r="1.6" fill="#FFF" opacity="0.8" />
          </g>
          {/* Cheeks & Nose & Mouth */}
          <ellipse cx="66" cy="102" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="134" cy="102" rx="9" ry="5" fill="#FB7185" opacity="0.55" />
          <polygon points="94,98 106,98 100,106" fill="#F43F5E" />
          <path d="M100 106 Q93 114 86 108 M100 106 Q107 114 114 108" fill="none" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
          {/* Whiskers */}
          <path d="M40 96 L64 100 M38 108 L64 107 M160 96 L136 100 M162 108 L136 107" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'dog':
      return (
        <g>
          {/* Body */}
          <ellipse cx="100" cy="150" rx="44" ry="32" fill="#D97706" stroke="#5C2D0C" strokeWidth="4" />
          <ellipse cx="100" cy="155" rx="22" ry="18" fill="#FEF3C7" />
          {/* Collar */}
          <rect x="68" y="122" width="64" height="12" rx="6" fill="#EF4444" stroke="#5C2D0C" strokeWidth="3" />
          <circle cx="100" cy="136" r="7" fill="#FBBF24" stroke="#5C2D0C" strokeWidth="2.5" />
          {/* Floppy Ears */}
          <ellipse cx="48" cy="96" rx="18" ry="34" transform="rotate(14 48 96)" fill="#92400E" stroke="#5C2D0C" strokeWidth="4" />
          <ellipse cx="152" cy="96" rx="18" ry="34" transform="rotate(-14 152 96)" fill="#92400E" stroke="#5C2D0C" strokeWidth="4" />
          {/* Head */}
          <ellipse cx="100" cy="88" rx="46" ry="42" fill="#F59E0B" stroke="#5C2D0C" strokeWidth="4" />
          {/* Cute Spot */}
          <ellipse cx="78" cy="82" rx="18" ry="15" fill="#B45309" opacity="0.45" />
          {/* Snout */}
          <ellipse cx="100" cy="105" rx="24" ry="16" fill="#FEF3C7" />
          {/* Eyes */}
          <circle cx="80" cy="82" r="8" fill="#291A12" />
          <circle cx="120" cy="82" r="8" fill="#291A12" />
          <circle cx="83" cy="79" r="2.8" fill="#FFF" />
          <circle cx="123" cy="79" r="2.8" fill="#FFF" />
          {/* Nose & Happy Tongue */}
          <ellipse cx="100" cy="98" rx="10" ry="7" fill="#3B2314" />
          <path d="M93 114 Q100 128 107 114" fill="#FB7185" stroke="#5C2D0C" strokeWidth="3" />
          <path d="M88 110 Q100 118 112 110" fill="none" stroke="#5C2D0C" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'lion':
      return (
        <g>
          {/* Scalloped Mane */}
          <g fill="#D95D39" stroke="#7C2D12" strokeWidth="4">
            <circle cx="100" cy="44" r="22" />
            <circle cx="136" cy="56" r="22" />
            <circle cx="156" cy="90" r="22" />
            <circle cx="150" cy="128" r="22" />
            <circle cx="122" cy="154" r="22" />
            <circle cx="78" cy="154" r="22" />
            <circle cx="50" cy="128" r="22" />
            <circle cx="44" cy="90" r="22" />
            <circle cx="64" cy="56" r="22" />
            <circle cx="100" cy="102" r="56" stroke="none" />
          </g>
          <circle cx="66" cy="60" r="14" fill="#FBBF24" stroke="#7C2D12" strokeWidth="3.5" />
          <circle cx="134" cy="60" r="14" fill="#FBBF24" stroke="#7C2D12" strokeWidth="3.5" />
          <circle cx="100" cy="104" r="46" fill="#FBBF24" stroke="#7C2D12" strokeWidth="4" />
          <ellipse cx="100" cy="120" rx="22" ry="16" fill="#FEF3C7" />
          <circle cx="82" cy="94" r="7.5" fill="#291A12" />
          <circle cx="118" cy="94" r="7.5" fill="#291A12" />
          <circle cx="84.5" cy="91.5" r="2.6" fill="#FFF" />
          <circle cx="120.5" cy="91.5" r="2.6" fill="#FFF" />
          <ellipse cx="68" cy="110" rx="8" ry="5" fill="#FB7185" opacity="0.5" />
          <ellipse cx="132" cy="110" rx="8" ry="5" fill="#FB7185" opacity="0.5" />
          <polygon points="91,110 109,110 100,120" fill="#7C2D12" />
          <path d="M88 125 Q100 135 112 125" fill="none" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'cow':
      return (
        <g>
          {/* Horns */}
          <path d="M62 56 Q52 34 68 38" fill="#FDE68A" stroke="#52525B" strokeWidth="4" strokeLinecap="round" />
          <path d="M138 56 Q148 34 132 38" fill="#FDE68A" stroke="#52525B" strokeWidth="4" strokeLinecap="round" />
          {/* Ears */}
          <ellipse cx="44" cy="76" rx="20" ry="11" transform="rotate(-18 44 76)" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="4" />
          <ellipse cx="156" cy="76" rx="20" ry="11" transform="rotate(18 156 76)" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="4" />
          {/* Body */}
          <ellipse cx="100" cy="154" rx="44" ry="28" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="4" />
          <circle cx="120" cy="154" r="14" fill="#3F3F46" />
          {/* Head */}
          <rect x="52" y="48" width="96" height="86" rx="40" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="4" />
          {/* Cow patches */}
          <path d="M58 66 Q84 56 88 86 Q66 94 54 80 Z" fill="#3F3F46" />
          <circle cx="130" cy="72" r="12" fill="#3F3F46" />
          {/* Pink Snout */}
          <ellipse cx="100" cy="116" rx="40" ry="24" fill="#FBCFE8" stroke="#3F3F46" strokeWidth="4" />
          <ellipse cx="84" cy="112" rx="6" ry="4" fill="#BE185D" />
          <ellipse cx="116" cy="112" rx="6" ry="4" fill="#BE185D" />
          <path d="M88 126 Q100 135 112 126" fill="none" stroke="#831843" strokeWidth="3.5" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="78" cy="84" r="7.5" fill="#18181B" />
          <circle cx="122" cy="84" r="7.5" fill="#18181B" />
          <circle cx="80.5" cy="81.5" r="2.6" fill="#FFF" />
          <circle cx="124.5" cy="81.5" r="2.6" fill="#FFF" />
        </g>
      );

    case 'bird':
      return (
        <g>
          {/* Branch */}
          <path d="M24 156 Q100 166 176 146" fill="none" stroke="#92400E" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="154" cy="144" rx="14" ry="7" transform="rotate(-24 154 144)" fill="#22C55E" stroke="#166534" strokeWidth="3" />
          {/* Tail feathers */}
          <polygon points="48,118 22,102 28,134" fill="#0284C7" stroke="#0C4A6E" strokeWidth="4" strokeLinejoin="round" />
          {/* Feet */}
          <path d="M88 144 L88 158 M112 144 L112 158" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
          {/* Round Body */}
          <ellipse cx="100" cy="108" rx="48" ry="42" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="4" />
          <ellipse cx="112" cy="118" rx="28" ry="24" fill="#E0F2FE" />
          {/* Wing */}
          <path d="M62 104 Q88 92 108 118 Q82 134 62 104 Z" fill="#0EA5E9" stroke="#0C4A6E" strokeWidth="3.5" />
          {/* Crest */}
          <path d="M98 66 Q104 44 114 58 Q122 46 120 68" fill="#0EA5E9" stroke="#0C4A6E" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Beak */}
          <polygon points="142,92 168,100 142,108" fill="#FBBF24" stroke="#92400E" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Eye & Cheek */}
          <circle cx="122" cy="92" r="8" fill="#0F172A" />
          <circle cx="124.5" cy="89.5" r="2.8" fill="#FFF" />
          <ellipse cx="116" cy="106" rx="8" ry="5" fill="#FB7185" opacity="0.55" />
        </g>
      );

    case 'rabbit':
      return (
        <g>
          {/* Long Ears */}
          <ellipse cx="76" cy="54" rx="15" ry="40" transform="rotate(-10 76 54)" fill="#FFFFFF" stroke="#6B7280" strokeWidth="4" />
          <ellipse cx="76" cy="56" rx="7" ry="26" transform="rotate(-10 76 56)" fill="#FBCFE8" />
          <ellipse cx="124" cy="54" rx="15" ry="40" transform="rotate(10 124 54)" fill="#FFFFFF" stroke="#6B7280" strokeWidth="4" />
          <ellipse cx="124" cy="56" rx="7" ry="26" transform="rotate(10 124 56)" fill="#FBCFE8" />
          {/* Body */}
          <ellipse cx="100" cy="156" rx="38" ry="28" fill="#FFFFFF" stroke="#6B7280" strokeWidth="4" />
          {/* Fluffy Tail */}
          <circle cx="144" cy="162" r="14" fill="#FFFFFF" stroke="#6B7280" strokeWidth="3.5" />
          {/* Head */}
          <ellipse cx="100" cy="106" rx="46" ry="38" fill="#FFFFFF" stroke="#6B7280" strokeWidth="4" />
          {/* Eyes */}
          <circle cx="82" cy="102" r="7.5" fill="#1F2937" />
          <circle cx="118" cy="102" r="7.5" fill="#1F2937" />
          <circle cx="84.5" cy="99.5" r="2.6" fill="#FFF" />
          <circle cx="120.5" cy="99.5" r="2.6" fill="#FFF" />
          {/* Cheeks, Nose & Buck Teeth */}
          <ellipse cx="66" cy="114" rx="9" ry="5" fill="#F472B6" opacity="0.55" />
          <ellipse cx="134" cy="114" rx="9" ry="5" fill="#F472B6" opacity="0.55" />
          <polygon points="94,110 106,110 100,117" fill="#EC4899" />
          <rect x="94" y="120" width="12" height="10" rx="3" fill="#FFF" stroke="#6B7280" strokeWidth="2.5" />
          <path d="M100 117 Q94 124 88 120 M100 117 Q106 124 112 120" fill="none" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
        </g>
      );

    case 'fish':
      return (
        <g>
          {/* Bubbles */}
          <circle cx="164" cy="54" r="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
          <circle cx="176" cy="36" r="5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
          {/* Tail */}
          <polygon points="56,104 20,70 30,104 20,138" fill="#F97316" stroke="#7C2D12" strokeWidth="4" strokeLinejoin="round" />
          {/* Top & Bottom Fins */}
          <path d="M84 68 Q106 40 128 70 Z" fill="#FBBF24" stroke="#7C2D12" strokeWidth="4" strokeLinejoin="round" />
          <path d="M90 138 Q106 164 120 138 Z" fill="#FBBF24" stroke="#7C2D12" strokeWidth="4" strokeLinejoin="round" />
          {/* Body */}
          <ellipse cx="108" cy="104" rx="58" ry="40" fill="#FB923C" stroke="#7C2D12" strokeWidth="4" />
          {/* Stripes */}
          <path d="M88 66 Q98 104 88 142" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path d="M114 66 Q124 104 114 142" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          {/* Eye & Smile */}
          <circle cx="140" cy="96" r="9" fill="#FFFFFF" stroke="#7C2D12" strokeWidth="3" />
          <circle cx="142" cy="96" r="4.5" fill="#0F172A" />
          <circle cx="144" cy="94" r="1.8" fill="#FFF" />
          <path d="M148 114 Q156 120 162 112" fill="none" stroke="#7C2D12" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'elephant':
      return (
        <g>
          {/* Big Ears */}
          <ellipse cx="44" cy="96" rx="28" ry="38" fill="#94A3B8" stroke="#334155" strokeWidth="4" />
          <ellipse cx="46" cy="98" rx="16" ry="24" fill="#FBCFE8" />
          <ellipse cx="156" cy="96" rx="28" ry="38" fill="#94A3B8" stroke="#334155" strokeWidth="4" />
          <ellipse cx="154" cy="98" rx="16" ry="24" fill="#FBCFE8" />
          {/* Body */}
          <ellipse cx="100" cy="150" rx="44" ry="30" fill="#94A3B8" stroke="#334155" strokeWidth="4" />
          {/* Head */}
          <circle cx="100" cy="94" r="46" fill="#CBD5E1" stroke="#334155" strokeWidth="4" />
          {/* Trunk */}
          <path d="M90 104 Q88 148 114 152 Q128 152 126 138" fill="none" stroke="#94A3B8" strokeWidth="18" strokeLinecap="round" />
          <path d="M90 104 Q88 148 114 152 Q128 152 126 138" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          {/* Eyes & Cheeks */}
          <circle cx="80" cy="86" r="7" fill="#1E293B" />
          <circle cx="120" cy="86" r="7" fill="#1E293B" />
          <circle cx="82" cy="84" r="2.4" fill="#FFF" />
          <circle cx="122" cy="84" r="2.4" fill="#FFF" />
          <ellipse cx="68" cy="102" rx="8" ry="5" fill="#F472B6" opacity="0.5" />
          <ellipse cx="132" cy="102" rx="8" ry="5" fill="#F472B6" opacity="0.5" />
        </g>
      );

    // ================= FOOD =================
    case 'apple':
      return (
        <g>
          {/* Stem & Leaf */}
          <path d="M100 58 Q102 34 114 28" fill="none" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
          <path d="M106 46 Q134 26 144 48 Q126 62 106 46 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          {/* Apple Body */}
          <path
            d="M100 64 C74 48 40 70 46 116 C52 158 78 174 100 164 C122 174 148 158 154 116 C160 70 126 48 100 64 Z"
            fill="#EF4444"
            stroke="#991B1B"
            strokeWidth="4.5"
          />
          {/* Shine */}
          <ellipse cx="70" cy="92" rx="9" ry="18" transform="rotate(18 70 92)" fill="#FFFFFF" opacity="0.4" />
          {/* Cute Face */}
          <circle cx="84" cy="112" r="6" fill="#450A0A" />
          <circle cx="116" cy="112" r="6" fill="#450A0A" />
          <circle cx="86" cy="110" r="2" fill="#FFF" />
          <circle cx="118" cy="110" r="2" fill="#FFF" />
          <path d="M90 126 Q100 136 110 126" fill="none" stroke="#450A0A" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'milk':
      return (
        <g>
          {/* Milk Carton */}
          <polygon points="62,64 138,64 126,38 74,38" fill="#93C5FD" stroke="#1E3A8A" strokeWidth="4" strokeLinejoin="round" />
          <rect x="74" y="28" width="52" height="12" rx="4" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="4" />
          <rect x="62" y="64" width="76" height="106" rx="10" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="4" />
          {/* Blue Wave Band */}
          <rect x="64" y="96" width="72" height="44" fill="#DBEAFE" />
          <path d="M64 96 Q82 88 100 96 T136 96" fill="none" stroke="#3B82F6" strokeWidth="4" />
          {/* Happy Face */}
          <circle cx="86" cy="114" r="5.5" fill="#1E3A8A" />
          <circle cx="114" cy="114" r="5.5" fill="#1E3A8A" />
          <path d="M92 126 Q100 134 108 126" fill="none" stroke="#1E3A8A" strokeWidth="3.5" strokeLinecap="round" />
          {/* Milk Drop */}
          <path d="M156 124 Q170 144 156 154 Q142 144 156 124 Z" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="3.5" />
        </g>
      );

    case 'water':
      return (
        <g>
          {/* Glass */}
          <polygon points="56,48 144,48 132,166 68,166" fill="#E0F2FE" stroke="#0369A1" strokeWidth="4.5" strokeLinejoin="round" />
          {/* Water Fill */}
          <polygon points="61,76 139,76 130,162 70,162" fill="#38BDF8" />
          <path d="M61 76 Q80 68 100 76 T139 76" fill="none" stroke="#7DD3FC" strokeWidth="5" />
          {/* Bubbles */}
          <circle cx="84" cy="140" r="5" fill="#E0F2FE" />
          <circle cx="118" cy="134" r="7" fill="#E0F2FE" />
          {/* Cute Face */}
          <circle cx="86" cy="108" r="5.5" fill="#0C4A6E" />
          <circle cx="114" cy="108" r="5.5" fill="#0C4A6E" />
          <path d="M92 120 Q100 128 108 120" fill="none" stroke="#0C4A6E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Water Drop Accent */}
          <path d="M156 50 Q168 68 156 76 Q144 68 156 50 Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3" />
        </g>
      );

    case 'bread':
      return (
        <g>
          {/* Traditional Moroccan Round Khobz Loaf */}
          <ellipse cx="100" cy="116" rx="70" ry="52" fill="#D97706" stroke="#78350F" strokeWidth="4.5" />
          <ellipse cx="100" cy="106" rx="64" ry="44" fill="#F59E0B" stroke="#78350F" strokeWidth="4" />
          {/* Golden Crust Center & Moroccan Bread Scoring */}
          <ellipse cx="100" cy="100" rx="46" ry="30" fill="#FCD34D" opacity="0.65" />
          <path d="M74 88 Q100 76 126 88" fill="none" stroke="#B45309" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M70 106 Q100 94 130 106" fill="none" stroke="#B45309" strokeWidth="4.5" strokeLinecap="round" />
          {/* Steam puffs */}
          <path d="M76 50 Q70 38 78 28 M100 44 Q94 32 102 22 M124 50 Q118 38 126 28" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          {/* Smile */}
          <circle cx="84" cy="116" r="5" fill="#78350F" />
          <circle cx="116" cy="116" r="5" fill="#78350F" />
          <path d="M92 126 Q100 134 108 126" fill="none" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'banana':
      return (
        <g>
          <path
            d="M142 42 C154 88 126 154 50 158 C38 158 34 146 44 138 C94 128 118 86 122 44 C124 34 138 32 142 42 Z"
            fill="#FACC15"
            stroke="#854D0E"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path d="M126 42 L138 34" stroke="#713F12" strokeWidth="7" strokeLinecap="round" />
          <path d="M124 72 Q114 114 64 142" fill="none" stroke="#FEF08A" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          {/* Cute Face */}
          <circle cx="102" cy="116" r="5" fill="#713F12" />
          <circle cx="122" cy="100" r="5" fill="#713F12" />
          <path d="M110 116 Q120 120 124 110" fill="none" stroke="#713F12" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'egg':
      return (
        <g>
          {/* Egg Cup / Shadow */}
          <ellipse cx="100" cy="168" rx="40" ry="10" fill="#FDE68A" />
          {/* Egg Shell */}
          <path
            d="M100 34 C138 34 152 96 146 132 C140 162 122 170 100 170 C78 170 60 162 54 132 C48 96 62 34 100 34 Z"
            fill="#FFFBEB"
            stroke="#B45309"
            strokeWidth="4.5"
          />
          {/* Highlight */}
          <ellipse cx="80" cy="76" rx="8" ry="18" transform="rotate(14 80 76)" fill="#FFFFFF" />
          {/* Cute Face */}
          <circle cx="84" cy="112" r="6" fill="#451A03" />
          <circle cx="116" cy="112" r="6" fill="#451A03" />
          <circle cx="86" cy="110" r="2" fill="#FFF" />
          <circle cx="118" cy="110" r="2" fill="#FFF" />
          <ellipse cx="72" cy="122" rx="7" ry="4" fill="#FB7185" opacity="0.5" />
          <ellipse cx="128" cy="122" rx="7" ry="4" fill="#FB7185" opacity="0.5" />
          <path d="M92 126 Q100 135 108 126" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'orange':
      return (
        <g>
          <path d="M100 50 L104 30" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M104 42 Q132 24 142 46 Q124 60 104 42 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          <circle cx="100" cy="110" r="58" fill="#FB923C" stroke="#9A3412" strokeWidth="4.5" />
          <circle cx="72" cy="84" r="4" fill="#FDBA74" />
          <circle cx="64" cy="100" r="3" fill="#FDBA74" />
          <circle cx="132" cy="90" r="3.5" fill="#FDBA74" />
          <circle cx="84" cy="108" r="6" fill="#431407" />
          <circle cx="116" cy="108" r="6" fill="#431407" />
          <circle cx="86" cy="106" r="2" fill="#FFF" />
          <circle cx="118" cy="106" r="2" fill="#FFF" />
          <path d="M90 124 Q100 134 110 124" fill="none" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'grapes':
      return (
        <g>
          {/* Vine & Leaf */}
          <path d="M100 52 L100 28 Q114 22 124 30" fill="none" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
          <path d="M98 44 Q72 26 62 46 Q78 60 98 44 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          {/* Grape Cluster */}
          <g fill="#A855F7" stroke="#581C87" strokeWidth="3.5">
            <circle cx="74" cy="76" r="20" />
            <circle cx="100" cy="74" r="20" />
            <circle cx="126" cy="76" r="20" />
            <circle cx="66" cy="104" r="20" />
            <circle cx="92" cy="104" r="20" />
            <circle cx="118" cy="104" r="20" />
            <circle cx="82" cy="132" r="20" />
            <circle cx="110" cy="132" r="20" />
            <circle cx="96" cy="156" r="19" />
          </g>
          {/* Shine dots */}
          <g fill="#E9D5FF">
            <circle cx="68" cy="70" r="4" />
            <circle cx="94" cy="68" r="4" />
            <circle cx="120" cy="70" r="4" />
            <circle cx="86" cy="98" r="4" />
            <circle cx="90" cy="150" r="4" />
          </g>
        </g>
      );

    default:
      return null;
  }
}
