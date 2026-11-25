import React from 'react';

/** Bespoke storybook SVG illustrations for Family (8), Around Me (8), Nature (6), and Colors (6) */
export function renderFamilyHomeNatureColorsArt(wordId: string): React.ReactNode | null {
  switch (wordId) {
    // ================= FAMILY =================
    case 'mama':
      return (
        <g>
          {/* Hair back */}
          <ellipse cx="100" cy="98" rx="56" ry="56" fill="#3B2314" stroke="#291A12" strokeWidth="4" />
          {/* Moroccan Kaftan/Dress */}
          <path d="M54 176 C54 136 146 136 146 176 Z" fill="#EC4899" stroke="#831843" strokeWidth="4" />
          <path d="M92 146 L100 176 L108 146" fill="none" stroke="#FBBF24" strokeWidth="4" />
          {/* Face */}
          <circle cx="100" cy="94" r="40" fill="#F6C59F" stroke="#78350F" strokeWidth="4" />
          {/* Hair bangs */}
          <path d="M60 88 Q78 52 100 62 Q122 52 140 88 Q126 70 100 72 Q74 70 60 88 Z" fill="#3B2314" />
          {/* Earrings */}
          <circle cx="58" cy="106" r="5" fill="#FBBF24" stroke="#92400E" strokeWidth="2" />
          <circle cx="142" cy="106" r="5" fill="#FBBF24" stroke="#92400E" strokeWidth="2" />
          {/* Eyes & Smile */}
          <circle cx="84" cy="96" r="6" fill="#291A12" />
          <circle cx="116" cy="96" r="6" fill="#291A12" />
          <circle cx="86" cy="94" r="2" fill="#FFF" />
          <circle cx="118" cy="94" r="2" fill="#FFF" />
          <ellipse cx="74" cy="108" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="126" cy="108" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <path d="M88 114 Q100 125 112 114" fill="none" stroke="#9D174D" strokeWidth="4" strokeLinecap="round" />
          {/* Floating Heart */}
          <path d="M154 54 C154 46 164 46 164 54 C164 62 154 68 154 68 C154 68 144 62 144 54 C144 46 154 46 154 54 Z" fill="#F43F5E" />
        </g>
      );

    case 'baba':
      return (
        <g>
          {/* Shirt */}
          <path d="M50 176 C50 136 150 136 150 176 Z" fill="#1D5FD1" stroke="#1E3A8A" strokeWidth="4" />
          <path d="M86 140 L100 158 L114 140" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="3" strokeLinejoin="round" />
          {/* Ears */}
          <circle cx="58" cy="98" r="10" fill="#E8B288" stroke="#78350F" strokeWidth="3.5" />
          <circle cx="142" cy="98" r="10" fill="#E8B288" stroke="#78350F" strokeWidth="3.5" />
          {/* Face */}
          <circle cx="100" cy="94" r="42" fill="#E8B288" stroke="#78350F" strokeWidth="4" />
          {/* Hair */}
          <path d="M58 84 C60 44 140 44 142 84 C126 66 74 66 58 84 Z" fill="#291A12" />
          {/* Friendly Short Beard */}
          <path d="M64 106 C66 138 134 138 136 106 C122 124 78 124 64 106 Z" fill="#3B2314" opacity="0.85" />
          {/* Eyes & Warm Smile */}
          <circle cx="84" cy="92" r="6" fill="#291A12" />
          <circle cx="116" cy="92" r="6" fill="#291A12" />
          <circle cx="86" cy="90" r="2" fill="#FFF" />
          <circle cx="118" cy="90" r="2" fill="#FFF" />
          <path d="M88 112 Q100 122 112 112" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'brother':
      return (
        <g>
          {/* Striped T-Shirt */}
          <path d="M56 176 C56 140 144 140 144 176 Z" fill="#14B8A6" stroke="#115E59" strokeWidth="4" />
          <line x1="66" y1="158" x2="134" y2="158" stroke="#FDE047" strokeWidth="6" />
          {/* Face */}
          <circle cx="100" cy="98" r="38" fill="#F5C199" stroke="#78350F" strokeWidth="4" />
          {/* Curly Kid Hair */}
          <g fill="#3B2314">
            <circle cx="72" cy="64" r="14" />
            <circle cx="90" cy="56" r="16" />
            <circle cx="112" cy="56" r="16" />
            <circle cx="128" cy="66" r="14" />
          </g>
          {/* Cap visor */}
          <path d="M68 62 Q100 44 134 62 L152 68 Q128 74 100 68 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" strokeLinejoin="round" />
          {/* Eyes & Grin */}
          <circle cx="85" cy="98" r="6" fill="#291A12" />
          <circle cx="115" cy="98" r="6" fill="#291A12" />
          <circle cx="87" cy="96" r="2" fill="#FFF" />
          <circle cx="117" cy="96" r="2" fill="#FFF" />
          <ellipse cx="74" cy="108" rx="6" ry="4" fill="#FB7185" opacity="0.5" />
          <ellipse cx="126" cy="108" rx="6" ry="4" fill="#FB7185" opacity="0.5" />
          <path d="M86 112 Q100 126 114 112 Z" fill="#FFFFFF" stroke="#78350F" strokeWidth="3" />
        </g>
      );

    case 'sister':
      return (
        <g>
          {/* Pigtails */}
          <circle cx="48" cy="86" r="20" fill="#3B2314" stroke="#291A12" strokeWidth="3.5" />
          <circle cx="152" cy="86" r="20" fill="#3B2314" stroke="#291A12" strokeWidth="3.5" />
          <circle cx="62" cy="76" r="7" fill="#F472B6" stroke="#9D174D" strokeWidth="2.5" />
          <circle cx="138" cy="76" r="7" fill="#F472B6" stroke="#9D174D" strokeWidth="2.5" />
          {/* Dress */}
          <path d="M56 176 C56 140 144 140 144 176 Z" fill="#A855F7" stroke="#581C87" strokeWidth="4" />
          {/* Face */}
          <circle cx="100" cy="98" r="38" fill="#F6C59F" stroke="#78350F" strokeWidth="4" />
          {/* Bangs */}
          <path d="M62 90 C66 56 134 56 138 90 C122 72 78 72 62 90 Z" fill="#3B2314" />
          {/* Eyes & Smile */}
          <circle cx="85" cy="98" r="6" fill="#291A12" />
          <circle cx="115" cy="98" r="6" fill="#291A12" />
          <circle cx="87" cy="96" r="2" fill="#FFF" />
          <circle cx="117" cy="96" r="2" fill="#FFF" />
          <ellipse cx="74" cy="109" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="126" cy="109" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <path d="M88 114 Q100 124 112 114" fill="none" stroke="#9D174D" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'grandpa':
      return (
        <g>
          {/* Djellaba */}
          <path d="M50 176 C50 136 150 136 150 176 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="4" />
          {/* Face */}
          <circle cx="100" cy="96" r="40" fill="#ECC098" stroke="#78350F" strokeWidth="4" />
          {/* White side hair & Moroccan Fez */}
          <circle cx="62" cy="88" r="11" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2.5" />
          <circle cx="138" cy="88" r="11" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2.5" />
          <polygon points="74,64 126,64 120,34 80,34" fill="#DC2626" stroke="#7F1D1D" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M120 38 Q134 46 130 62" fill="none" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />
          {/* Glasses */}
          <circle cx="83" cy="94" r="12" fill="#FFFFFF" fillOpacity="0.4" stroke="#4B5563" strokeWidth="3.5" />
          <circle cx="117" cy="94" r="12" fill="#FFFFFF" fillOpacity="0.4" stroke="#4B5563" strokeWidth="3.5" />
          <line x1="95" y1="94" x2="105" y2="94" stroke="#4B5563" strokeWidth="3.5" />
          <circle cx="83" cy="94" r="4.5" fill="#291A12" />
          <circle cx="117" cy="94" r="4.5" fill="#291A12" />
          {/* White Mustache & Smile */}
          <path d="M78 114 Q100 104 122 114 Q100 122 78 114 Z" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="2.5" />
          <path d="M90 122 Q100 130 110 122" fill="none" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'grandma':
      return (
        <g>
          {/* Silver Hair Bun */}
          <circle cx="100" cy="44" r="18" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3.5" />
          {/* Warm Scarf / Shawl */}
          <path d="M48 176 C48 134 152 134 152 176 Z" fill="#FB7185" stroke="#9F1239" strokeWidth="4" />
          <ellipse cx="100" cy="96" rx="48" ry="44" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3.5" />
          {/* Face */}
          <circle cx="100" cy="98" r="38" fill="#F6C59F" stroke="#78350F" strokeWidth="4" />
          {/* Hair waves */}
          <path d="M62 88 Q82 62 100 72 Q118 62 138 88" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3" />
          {/* Round Glasses */}
          <circle cx="84" cy="98" r="11" fill="#FFFFFF" fillOpacity="0.4" stroke="#9F1239" strokeWidth="3" />
          <circle cx="116" cy="98" r="11" fill="#FFFFFF" fillOpacity="0.4" stroke="#9F1239" strokeWidth="3" />
          <line x1="95" y1="98" x2="105" y2="98" stroke="#9F1239" strokeWidth="3" />
          <circle cx="84" cy="98" r="4.5" fill="#291A12" />
          <circle cx="116" cy="98" r="4.5" fill="#291A12" />
          {/* Cheeks & Loving Smile */}
          <ellipse cx="72" cy="112" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <ellipse cx="128" cy="112" rx="7" ry="4" fill="#FB7185" opacity="0.55" />
          <path d="M88 118 Q100 128 112 118" fill="none" stroke="#9F1239" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'baby':
      return (
        <g>
          {/* Cozy Swaddle */}
          <ellipse cx="100" cy="144" rx="42" ry="34" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="4" />
          {/* Baby Head */}
          <circle cx="100" cy="92" r="42" fill="#FDE0C8" stroke="#9A3412" strokeWidth="4" />
          {/* Little Curl */}
          <path d="M100 50 Q112 32 102 36 Q90 40 100 50" fill="none" stroke="#5C3218" strokeWidth="5" strokeLinecap="round" />
          {/* Big Cute Eyes */}
          <circle cx="83" cy="90" r="7.5" fill="#291A12" />
          <circle cx="117" cy="90" r="7.5" fill="#291A12" />
          <circle cx="85.5" cy="87.5" r="2.8" fill="#FFF" />
          <circle cx="119.5" cy="87.5" r="2.8" fill="#FFF" />
          <ellipse cx="70" cy="102" rx="8" ry="5" fill="#FB7185" opacity="0.55" />
          <ellipse cx="130" cy="102" rx="8" ry="5" fill="#FB7185" opacity="0.55" />
          {/* Pacifier */}
          <circle cx="100" cy="114" r="11" fill="#F472B6" stroke="#9D174D" strokeWidth="3" />
          <circle cx="100" cy="118" r="6" fill="none" stroke="#FDF2F8" strokeWidth="3" />
        </g>
      );

    case 'friend':
      return (
        <g>
          {/* Two happy kids side-by-side */}
          {/* Left Kid */}
          <path d="M30 174 C30 142 96 142 96 174 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          <circle cx="64" cy="106" r="30" fill="#F6C59F" stroke="#78350F" strokeWidth="3.5" />
          <path d="M36 98 C40 70 88 70 92 98 C80 84 48 84 36 98 Z" fill="#3B2314" />
          <circle cx="54" cy="106" r="4.5" fill="#291A12" />
          <circle cx="74" cy="106" r="4.5" fill="#291A12" />
          <path d="M56 118 Q64 126 72 118" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          {/* Right Kid */}
          <path d="M104 174 C104 142 170 142 170 174 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="3.5" />
          <circle cx="136" cy="106" r="30" fill="#E4A87B" stroke="#78350F" strokeWidth="3.5" />
          <g fill="#291A12">
            <circle cx="116" cy="82" r="10" />
            <circle cx="136" cy="76" r="11" />
            <circle cx="154" cy="84" r="10" />
          </g>
          <circle cx="126" cy="106" r="4.5" fill="#291A12" />
          <circle cx="146" cy="106" r="4.5" fill="#291A12" />
          <path d="M128 118 Q136 126 144 118" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          {/* Star between friends */}
          <polygon points="100,40 105,54 120,54 108,63 112,77 100,68 88,77 92,63 80,54 95,54" fill="#FBBF24" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
        </g>
      );

    // ================= AROUND ME (HOME) =================
    case 'ball':
      return (
        <g>
          <ellipse cx="100" cy="168" rx="44" ry="9" fill="#FCA5A5" opacity="0.45" />
          <circle cx="100" cy="100" r="60" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4.5" />
          <path d="M44 82 Q100 58 156 82" fill="none" stroke="#EF4444" strokeWidth="14" />
          <path d="M44 118 Q100 142 156 118" fill="none" stroke="#3B82F6" strokeWidth="14" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#1E293B" strokeWidth="4.5" />
          <circle cx="100" cy="100" r="18" fill="#FBBF24" stroke="#1E293B" strokeWidth="4" />
          <ellipse cx="72" cy="68" rx="10" ry="6" transform="rotate(-30 72 68)" fill="#FFFFFF" opacity="0.7" />
        </g>
      );

    case 'car':
      return (
        <g>
          {/* Road shadow */}
          <ellipse cx="100" cy="158" rx="70" ry="8" fill="#BFDBFE" />
          {/* Car Top */}
          <path d="M58 100 L74 62 Q80 54 92 54 L120 54 Q132 54 138 64 L152 100 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="4" strokeLinejoin="round" />
          {/* Windows */}
          <path d="M72 96 L82 66 L100 66 L100 96 Z" fill="#BAE6FD" stroke="#7F1D1D" strokeWidth="3" />
          <path d="M108 96 L108 66 L128 66 L140 96 Z" fill="#BAE6FD" stroke="#7F1D1D" strokeWidth="3" />
          {/* Car Body */}
          <rect x="28" y="96" width="144" height="44" rx="18" fill="#EF4444" stroke="#7F1D1D" strokeWidth="4" />
          {/* Headlight & Taillight */}
          <circle cx="164" cy="116" r="8" fill="#FDE047" stroke="#7F1D1D" strokeWidth="3" />
          <rect x="30" y="110" width="10" height="12" rx="4" fill="#FBBF24" />
          {/* Wheels */}
          <circle cx="62" cy="142" r="20" fill="#334155" stroke="#0F172A" strokeWidth="4" />
          <circle cx="62" cy="142" r="9" fill="#E2E8F0" />
          <circle cx="138" cy="142" r="20" fill="#334155" stroke="#0F172A" strokeWidth="4" />
          <circle cx="138" cy="142" r="9" fill="#E2E8F0" />
        </g>
      );

    case 'house':
      return (
        <g>
          {/* Cozy Moroccan-inspired House */}
          <rect x="46" y="90" width="108" height="76" rx="8" fill="#FFFBEB" stroke="#9A3412" strokeWidth="4.5" />
          {/* Roof */}
          <polygon points="32,96 100,36 168,96" fill="#E5633B" stroke="#9A3412" strokeWidth="4.5" strokeLinejoin="round" />
          {/* Arched Moroccan Door */}
          <path d="M82 166 L82 126 Q100 104 118 126 L118 166 Z" fill="#1D5FD1" stroke="#1E3A8A" strokeWidth="4" />
          <circle cx="110" cy="144" r="3.5" fill="#FBBF24" />
          {/* Windows */}
          <rect x="56" y="106" width="20" height="22" rx="6" fill="#BAE6FD" stroke="#9A3412" strokeWidth="3.5" />
          <rect x="124" y="106" width="20" height="22" rx="6" fill="#BAE6FD" stroke="#9A3412" strokeWidth="3.5" />
          {/* Little Heart on Roof */}
          <circle cx="100" cy="70" r="8" fill="#FBBF24" stroke="#9A3412" strokeWidth="3" />
        </g>
      );

    case 'bed':
      return (
        <g>
          {/* Headboard & Footboard */}
          <rect x="30" y="64" width="18" height="96" rx="8" fill="#92400E" stroke="#451A03" strokeWidth="4" />
          <rect x="154" y="98" width="16" height="62" rx="7" fill="#92400E" stroke="#451A03" strokeWidth="4" />
          {/* Mattress */}
          <rect x="46" y="108" width="110" height="36" rx="10" fill="#FFFFFF" stroke="#451A03" strokeWidth="4" />
          {/* Pillow */}
          <rect x="52" y="90" width="38" height="22" rx="10" fill="#FDE68A" stroke="#B45309" strokeWidth="3.5" />
          {/* Cozy Blanket */}
          <path d="M82 106 L154 106 Q160 124 156 144 L82 144 Z" fill="#8B5CF6" stroke="#4C1D95" strokeWidth="4" strokeLinejoin="round" />
          {/* Stars on Blanket */}
          <circle cx="106" cy="124" r="4" fill="#FDE047" />
          <circle cx="132" cy="122" r="5" fill="#FDE047" />
          <circle cx="120" cy="136" r="3.5" fill="#FDE047" />
          {/* Sleepy Zzz */}
          <text x="122" y="76" fontSize="24" fontWeight="bold" fill="#7C3AED" fontFamily="Fredoka, sans-serif">Zzz</text>
        </g>
      );

    case 'chair':
      return (
        <g>
          {/* Backrest */}
          <rect x="58" y="34" width="84" height="62" rx="12" fill="#F59E0B" stroke="#78350F" strokeWidth="4.5" />
          <rect x="72" y="48" width="56" height="14" rx="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="3" />
          <rect x="72" y="70" width="56" height="14" rx="6" fill="#FEF3C7" stroke="#78350F" strokeWidth="3" />
          {/* Seat */}
          <rect x="46" y="96" width="108" height="22" rx="10" fill="#D97706" stroke="#78350F" strokeWidth="4.5" />
          {/* Legs */}
          <rect x="56" y="118" width="14" height="52" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="4" />
          <rect x="130" y="118" width="14" height="52" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="4" />
          <line x1="70" y1="146" x2="130" y2="146" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
        </g>
      );

    case 'book':
      return (
        <g>
          {/* Open Storybook */}
          <path d="M28 62 Q64 46 100 66 L100 156 Q64 138 28 152 Z" fill="#FFFFFF" stroke="#0F766E" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M172 62 Q136 46 100 66 L100 156 Q136 138 172 152 Z" fill="#FFFBEB" stroke="#0F766E" strokeWidth="4.5" strokeLinejoin="round" />
          {/* Cover Backing */}
          <path d="M22 68 L22 158 Q62 146 100 162 Q138 146 178 158 L178 68" fill="none" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {/* Page Lines & Star */}
          <line x1="44" y1="88" x2="84" y2="92" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="44" y1="106" x2="84" y2="110" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="44" y1="124" x2="74" y2="127" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="136,82 141,96 156,96 144,105 148,119 136,110 124,119 128,105 116,96 131,96" fill="#FBBF24" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
        </g>
      );

    case 'key':
      return (
        <g transform="rotate(-25 100 100)">
          {/* Golden Key Bow */}
          <circle cx="64" cy="100" r="32" fill="#FBBF24" stroke="#92400E" strokeWidth="4.5" />
          <circle cx="64" cy="100" r="13" fill="#FEF9C3" stroke="#92400E" strokeWidth="4" />
          {/* Shaft & Teeth */}
          <rect x="92" y="90" width="76" height="20" rx="8" fill="#FBBF24" stroke="#92400E" strokeWidth="4.5" />
          <rect x="130" y="108" width="14" height="24" rx="5" fill="#F59E0B" stroke="#92400E" strokeWidth="4" />
          <rect x="150" y="108" width="14" height="18" rx="5" fill="#F59E0B" stroke="#92400E" strokeWidth="4" />
          {/* Sparkle */}
          <path d="M52 54 L56 42 L60 54 L72 58 L60 62 L56 74 L52 62 L40 58 Z" fill="#FFFFFF" />
        </g>
      );

    case 'table':
      return (
        <g>
          {/* Legs */}
          <rect x="44" y="92" width="14" height="68" rx="6" fill="#92400E" stroke="#451A03" strokeWidth="4" />
          <rect x="142" y="92" width="14" height="68" rx="6" fill="#92400E" stroke="#451A03" strokeWidth="4" />
          <rect x="64" y="96" width="10" height="50" rx="4" fill="#78350F" />
          <rect x="126" y="96" width="10" height="50" rx="4" fill="#78350F" />
          {/* Tabletop */}
          <rect x="26" y="76" width="148" height="24" rx="10" fill="#D97706" stroke="#451A03" strokeWidth="4.5" />
          {/* Cute Moroccan Teapot on Table */}
          <ellipse cx="100" cy="60" rx="18" ry="14" fill="#E2E8F0" stroke="#475569" strokeWidth="3.5" />
          <path d="M84 54 Q70 50 74 64" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M116 58 Q132 46 130 58" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="100" cy="43" r="4" fill="#FBBF24" stroke="#475569" strokeWidth="2.5" />
        </g>
      );

    // ================= NATURE & SKY =================
    case 'sun':
      return (
        <g>
          {/* Slowly Spinning Sun Rays */}
          <g className="animate-sun-spin" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round">
            <line x1="100" y1="22" x2="100" y2="40" />
            <line x1="100" y1="160" x2="100" y2="178" />
            <line x1="22" y1="100" x2="40" y2="100" />
            <line x1="160" y1="100" x2="178" y2="100" />
            <line x1="45" y1="45" x2="58" y2="58" />
            <line x1="142" y1="142" x2="155" y2="155" />
            <line x1="155" y1="45" x2="142" y2="58" />
            <line x1="58" y1="142" x2="45" y2="155" />
          </g>
          <circle cx="100" cy="100" r="48" fill="url(#pxGold)" stroke="#D97706" strokeWidth="4.5" />
          <g className="animate-blink">
            <ellipse cx="84" cy="94" rx="6.5" ry="7.5" fill="#78350F" />
            <ellipse cx="116" cy="94" rx="6.5" ry="7.5" fill="#78350F" />
            <circle cx="86" cy="91.5" r="2.5" fill="#FFF" />
            <circle cx="118" cy="91.5" r="2.5" fill="#FFF" />
          </g>
          <ellipse cx="72" cy="106" rx="7" ry="4" fill="#FB923C" opacity="0.6" />
          <ellipse cx="128" cy="106" rx="7" ry="4" fill="#FB923C" opacity="0.6" />
          <path d="M88 112 Q100 124 112 112" fill="none" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case 'moon':
      return (
        <g>
          {/* Crescent Moon */}
          <path
            d="M126 36 C76 40 44 82 54 128 C64 166 112 180 148 150 C112 152 88 126 90 92 C92 66 106 48 126 36 Z"
            fill="#FDE047"
            stroke="#A16207"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Sleepy happy face */}
          <path d="M74 104 Q80 98 86 104" fill="none" stroke="#713F12" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M82 122 Q92 128 100 122" fill="none" stroke="#713F12" strokeWidth="3.5" strokeLinecap="round" />
          {/* Twinkle Stars */}
          <polygon points="146,56 150,66 160,66 152,72 155,82 146,76 137,82 140,72 132,66 142,66" fill="#FBBF24" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="158" cy="104" r="5" fill="#818CF8" />
        </g>
      );

    case 'star':
      return (
        <g>
          <polygon
            points="100,24 121,72 174,77 134,112 146,164 100,136 54,164 66,112 26,77 79,72"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <circle cx="86" cy="96" r="6" fill="#713F12" />
          <circle cx="114" cy="96" r="6" fill="#713F12" />
          <circle cx="88" cy="94" r="2" fill="#FFF" />
          <circle cx="116" cy="94" r="2" fill="#FFF" />
          <ellipse cx="74" cy="106" rx="6" ry="4" fill="#FB923C" opacity="0.55" />
          <ellipse cx="126" cy="106" rx="6" ry="4" fill="#FB923C" opacity="0.55" />
          <path d="M90 112 Q100 122 110 112" fill="none" stroke="#713F12" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );

    case 'tree':
      return (
        <g>
          {/* Grass */}
          <ellipse cx="100" cy="170" rx="58" ry="12" fill="#86EFAC" />
          {/* Trunk */}
          <path d="M86 168 L90 108 L110 108 L114 168 Z" fill="#92400E" stroke="#451A03" strokeWidth="4" strokeLinejoin="round" />
          {/* Fluffy Foliage */}
          <g fill="#22C55E" stroke="#166534" strokeWidth="4">
            <circle cx="66" cy="92" r="30" />
            <circle cx="134" cy="92" r="30" />
            <circle cx="100" cy="60" r="34" />
            <circle cx="100" cy="96" r="34" stroke="none" />
          </g>
          {/* Little Oranges on the Tree */}
          <circle cx="72" cy="86" r="7" fill="#FB923C" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="126" cy="92" r="7" fill="#FB923C" stroke="#9A3412" strokeWidth="2.5" />
          <circle cx="104" cy="62" r="7" fill="#FB923C" stroke="#9A3412" strokeWidth="2.5" />
        </g>
      );

    case 'flower':
      return (
        <g>
          {/* Stem & Leaves */}
          <path d="M100 104 L100 172" stroke="#16A34A" strokeWidth="8" strokeLinecap="round" />
          <path d="M100 144 Q70 126 64 148 Q84 162 100 144 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          <path d="M100 138 Q130 120 136 142 Q116 156 100 138 Z" fill="#22C55E" stroke="#166534" strokeWidth="3.5" />
          {/* Petals */}
          <g fill="#F472B6" stroke="#9D174D" strokeWidth="4">
            <circle cx="100" cy="52" r="22" />
            <circle cx="132" cy="74" r="22" />
            <circle cx="120" cy="110" r="22" />
            <circle cx="80" cy="110" r="22" />
            <circle cx="68" cy="74" r="22" />
          </g>
          {/* Smiling Center */}
          <circle cx="100" cy="84" r="24" fill="#FDE047" stroke="#B45309" strokeWidth="4" />
          <circle cx="92" cy="80" r="4" fill="#713F12" />
          <circle cx="108" cy="80" r="4" fill="#713F12" />
          <path d="M92 92 Q100 100 108 92" fill="none" stroke="#713F12" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );

    case 'cloud':
      return (
        <g>
          {/* Fluffy Cloud */}
          <path
            d="M52 138 C32 138 24 114 40 100 C40 76 66 64 84 74 C96 52 134 56 142 80 C166 80 176 112 158 130 C152 136 144 138 136 138 Z"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Cute Face */}
          <circle cx="84" cy="106" r="5.5" fill="#0C4A6E" />
          <circle cx="116" cy="106" r="5.5" fill="#0C4A6E" />
          <ellipse cx="72" cy="116" rx="7" ry="4" fill="#93C5FD" opacity="0.7" />
          <ellipse cx="128" cy="116" rx="7" ry="4" fill="#93C5FD" opacity="0.7" />
          <path d="M92 118 Q100 126 108 118" fill="none" stroke="#0C4A6E" strokeWidth="3.5" strokeLinecap="round" />
          {/* Tiny Raindrops */}
          <path d="M74 152 Q80 162 74 166 Q68 162 74 152 Z" fill="#38BDF8" />
          <path d="M100 156 Q106 166 100 170 Q94 166 100 156 Z" fill="#38BDF8" />
          <path d="M126 152 Q132 162 126 166 Q120 162 126 152 Z" fill="#38BDF8" />
        </g>
      );

    // ================= COLORS (Playful Paint Blobs + Crayon) =================
    case 'red':
    case 'blue':
    case 'yellow':
    case 'green':
    case 'orange_color':
    case 'purple': {
      const palette: Record<string, { main: string; stroke: string; light: string }> = {
        red: { main: '#EF4444', stroke: '#991B1B', light: '#FCA5A5' },
        blue: { main: '#1D5FD1', stroke: '#1E3A8A', light: '#93C5FD' },
        yellow: { main: '#FACC15', stroke: '#A16207', light: '#FEF08A' },
        green: { main: '#22C55E', stroke: '#166534', light: '#86EFAC' },
        orange_color: { main: '#F97316', stroke: '#9A3412', light: '#FDBA74' },
        purple: { main: '#A855F7', stroke: '#581C87', light: '#D8B4FE' },
      };
      const c = palette[wordId];
      return (
        <g>
          {/* Paint Splat */}
          <path
            d="M100 32 C124 30 132 54 154 58 C176 62 178 96 158 112 C170 136 146 168 118 160 C98 178 62 166 56 140 C30 136 28 98 48 82 C38 56 72 34 100 32 Z"
            fill={c.main}
            stroke={c.stroke}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <circle cx="164" cy="44" r="10" fill={c.main} stroke={c.stroke} strokeWidth="3.5" />
          <circle cx="38" cy="154" r="8" fill={c.main} stroke={c.stroke} strokeWidth="3.5" />
          {/* Shine */}
          <ellipse cx="76" cy="70" rx="14" ry="8" transform="rotate(-24 76 70)" fill={c.light} opacity="0.7" />
          {/* Smiling Paint Friend */}
          <circle cx="84" cy="100" r="6.5" fill="#FFFFFF" />
          <circle cx="116" cy="100" r="6.5" fill="#FFFFFF" />
          <circle cx="85" cy="100" r="3.5" fill="#1E293B" />
          <circle cx="117" cy="100" r="3.5" fill="#1E293B" />
          <path d="M86 118 Q100 132 114 118" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      );
    }

    default:
      return null;
  }
}
