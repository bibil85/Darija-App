import { CategoryMeta, CategoryType, Word } from './types.ts';

export const CHILD_PROFILES = {
  little: {
    name: 'Nora',
    tagline: 'Big pictures, gentle swipes & playful discovery!',
    avatarUrl: '/art/nora-avatar.png',
    badgeColor: '#F59E0B',
  },
  big: {
    name: 'Sophia',
    tagline: 'Exciting puzzles, memory tiles & Darija quests!',
    avatarUrl: '/art/sophia-avatar.png',
    badgeColor: '#1D5FD1',
  },
} as const;

export const CATEGORIES: CategoryMeta[] = [
  {
    id: CategoryType.ANIMALS,
    label: 'Animals',
    darija: 'L-Hayawanat',
    arabic: 'الحيوانات',
    icon: 'lion',
    bgClass: 'bg-orange-400',
    borderClass: 'border-orange-600',
    softBgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    hex: '#FB923C',
    gradientFrom: '#FFAE52',
    gradientTo: '#EA580C',
  },
  {
    id: CategoryType.FOOD,
    label: 'Yummy Food',
    darija: 'L-Makla',
    arabic: 'الماكلة',
    icon: 'apple',
    bgClass: 'bg-rose-400',
    borderClass: 'border-rose-600',
    softBgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    hex: '#FB7185',
    gradientFrom: '#FF7B93',
    gradientTo: '#E11D48',
  },
  {
    id: CategoryType.VEHICLES,
    label: 'Vehicles',
    darija: 'L-Markabat',
    arabic: 'المركبات',
    icon: 'car',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-700',
    softBgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    hex: '#3B82F6',
    gradientFrom: '#60A5FA',
    gradientTo: '#1D4ED8',
  },
  {
    id: CategoryType.FAMILY,
    label: 'My Family',
    darija: 'L-3a2ila',
    arabic: 'العائلة',
    icon: 'mama',
    bgClass: 'bg-pink-400',
    borderClass: 'border-pink-600',
    softBgClass: 'bg-pink-50',
    textClass: 'text-pink-700',
    hex: '#F472B6',
    gradientFrom: '#F984C4',
    gradientTo: '#DB2777',
  },
  {
    id: CategoryType.HOME,
    label: 'Around Me',
    darija: 'F-Dar',
    arabic: 'فالدار',
    icon: 'house',
    bgClass: 'bg-sky-400',
    borderClass: 'border-sky-600',
    softBgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    hex: '#38BDF8',
    gradientFrom: '#5AC8FA',
    gradientTo: '#0284C7',
  },
  {
    id: CategoryType.NATURE,
    label: 'Nature & Sky',
    darija: 'T-Tabi3a',
    arabic: 'الطبيعة',
    icon: 'sun',
    bgClass: 'bg-emerald-400',
    borderClass: 'border-emerald-600',
    softBgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    hex: '#34D399',
    gradientFrom: '#4ADE80',
    gradientTo: '#059669',
  },
  {
    id: CategoryType.COLORS,
    label: 'Colors',
    darija: 'L-Alwan',
    arabic: 'الألوان',
    icon: 'purple',
    bgClass: 'bg-violet-400',
    borderClass: 'border-violet-600',
    softBgClass: 'bg-violet-50',
    textClass: 'text-violet-700',
    hex: '#A78BFA',
    gradientFrom: '#C084FC',
    gradientTo: '#7C3AED',
  },
  {
    id: CategoryType.BODY,
    label: 'My Body',
    darija: 'L-Jism',
    arabic: 'الجسم',
    icon: 'hands',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-600',
    softBgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    hex: '#FBBF24',
    gradientFrom: '#FCD34D',
    gradientTo: '#D97706',
  },
  {
    id: CategoryType.NUMBERS,
    label: '1-2-3 Count',
    darija: 'L-Arqam',
    arabic: 'الأرقام',
    icon: 'num_1',
    bgClass: 'bg-teal-400',
    borderClass: 'border-teal-600',
    softBgClass: 'bg-teal-50',
    textClass: 'text-teal-700',
    hex: '#2DD4BF',
    gradientFrom: '#38E8D0',
    gradientTo: '#0F766E',
  },
];

export const WORDS: Word[] = [
  // Animals (8)
  { id: 'cat', english: 'Cat', darija: 'Mouch', arabic: 'موش', phonetics: 'Moo-sh', category: CategoryType.ANIMALS, bgHex: '#FFF3E0', accentHex: '#EA580C', funCue: 'Meow!' },
  { id: 'dog', english: 'Dog', darija: 'Kelb', arabic: 'كلب', phonetics: 'Kel-b', category: CategoryType.ANIMALS, bgHex: '#FEF3C7', accentHex: '#B45309', funCue: 'Woof!' },
  { id: 'lion', english: 'Lion', darija: 'Sba3', arabic: 'سبع', phonetics: 'S-baa', category: CategoryType.ANIMALS, bgHex: '#FFEDD5', accentHex: '#C2410C', funCue: 'Roar!' },
  { id: 'cow', english: 'Cow', darija: 'Begra', arabic: 'بقرة', phonetics: 'Beg-ra', category: CategoryType.ANIMALS, bgHex: '#ECFDF5', accentHex: '#059669', funCue: 'Mooo!' },
  { id: 'bird', english: 'Bird', darija: 'Tir', arabic: 'طير', phonetics: 'Teer', category: CategoryType.ANIMALS, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: 'Tweet!' },
  { id: 'rabbit', english: 'Rabbit', darija: 'Gnina', arabic: 'قنينة', phonetics: 'G-nee-na', category: CategoryType.ANIMALS, bgHex: '#FCE7F3', accentHex: '#DB2777', funCue: 'Hop hop!' },
  { id: 'fish', english: 'Fish', darija: 'Houta', arabic: 'حوتة', phonetics: 'Hoo-ta', category: CategoryType.ANIMALS, bgHex: '#CFFAFE', accentHex: '#0891B2', funCue: 'Blub blub!' },
  { id: 'elephant', english: 'Elephant', darija: 'Fil', arabic: 'فيل', phonetics: 'Feel', category: CategoryType.ANIMALS, bgHex: '#EDE9FE', accentHex: '#6D28D9', funCue: 'Toot!' },

  // Food (8)
  { id: 'apple', english: 'Apple', darija: 'Tefa7a', arabic: 'تفاحة', phonetics: 'Tef-fa-ha', category: CategoryType.FOOD, bgHex: '#FFE4E6', accentHex: '#E11D48', funCue: 'Crunch!' },
  { id: 'milk', english: 'Milk', darija: 'Hlib', arabic: 'حليب', phonetics: 'H-leeb', category: CategoryType.FOOD, bgHex: '#EFF6FF', accentHex: '#2563EB', funCue: 'Yum!' },
  { id: 'water', english: 'Water', darija: 'L-Ma', arabic: 'الما', phonetics: 'El-ma', category: CategoryType.FOOD, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: 'Splash!' },
  { id: 'bread', english: 'Bread', darija: 'Khobz', arabic: 'خبز', phonetics: 'Khob-z', category: CategoryType.FOOD, bgHex: '#FEF3C7', accentHex: '#B45309', funCue: 'Warm!' },
  { id: 'banana', english: 'Banana', darija: 'Banan', arabic: 'بنان', phonetics: 'Ba-nan', category: CategoryType.FOOD, bgHex: '#FEF9C3', accentHex: '#CA8A04', funCue: 'Peel!' },
  { id: 'egg', english: 'Egg', darija: 'Bayda', arabic: 'بيضة', phonetics: 'Bay-da', category: CategoryType.FOOD, bgHex: '#FFFBEB', accentHex: '#D97706', funCue: 'Tap tap!' },
  { id: 'orange', english: 'Orange', darija: 'Limouna', arabic: 'ليمونة', phonetics: 'Lee-moo-na', category: CategoryType.FOOD, bgHex: '#FFEDD5', accentHex: '#EA580C', funCue: 'Juicy!' },
  { id: 'grapes', english: 'Grapes', darija: '3neb', arabic: 'عنب', phonetics: 'Aa-neb', category: CategoryType.FOOD, bgHex: '#F3E8FF', accentHex: '#9333EA', funCue: 'Pop!' },

  // Family (8)
  { id: 'mama', english: 'Mama', darija: 'Mama', arabic: 'ماما', phonetics: 'Ma-ma', category: CategoryType.FAMILY, bgHex: '#FCE7F3', accentHex: '#DB2777', funCue: 'Hug!' },
  { id: 'baba', english: 'Baba', darija: 'Baba', arabic: 'بابا', phonetics: 'Ba-ba', category: CategoryType.FAMILY, bgHex: '#DBEAFE', accentHex: '#1D4ED8', funCue: 'Hi!' },
  { id: 'brother', english: 'Brother', darija: 'Khoya', arabic: 'خويا', phonetics: 'Kho-ya', category: CategoryType.FAMILY, bgHex: '#CCFBF1', accentHex: '#0D9488', funCue: 'Play!' },
  { id: 'sister', english: 'Sister', darija: 'Khti', arabic: 'ختي', phonetics: 'Kh-tee', category: CategoryType.FAMILY, bgHex: '#FAE8FF', accentHex: '#C026D3', funCue: 'Giggle!' },
  { id: 'grandpa', english: 'Grandpa', darija: 'Jedi', arabic: 'جدي', phonetics: 'Je-dee', category: CategoryType.FAMILY, bgHex: '#FEF3C7', accentHex: '#B45309', funCue: 'Stories!' },
  { id: 'grandma', english: 'Grandma', darija: 'Jedati', arabic: 'جداتي', phonetics: 'Je-da-tee', category: CategoryType.FAMILY, bgHex: '#FFE4E6', accentHex: '#E11D48', funCue: 'Kisses!' },
  { id: 'baby', english: 'Baby', darija: 'Bebi', arabic: 'بيبي', phonetics: 'Be-bee', category: CategoryType.FAMILY, bgHex: '#E0E7FF', accentHex: '#4F46E5', funCue: 'Goo-goo!' },
  { id: 'friend', english: 'Friend', darija: 'Sahbi', arabic: 'صاحبي', phonetics: 'Sah-bee', category: CategoryType.FAMILY, bgHex: '#DCFCE7', accentHex: '#16A34A', funCue: 'High five!' },

  // Vehicles (5) — Bespoke multi-part animated 3D vehicles!
  { id: 'car', english: 'Car', darija: 'Tonobil', arabic: 'طوموبيل', phonetics: 'To-no-beel', category: CategoryType.VEHICLES, bgHex: '#DBEAFE', accentHex: '#2563EB', funCue: 'Beep beep!' },
  { id: 'bus', english: 'Bus', darija: 'Tobis', arabic: 'طوبيس', phonetics: 'To-bees', category: CategoryType.VEHICLES, bgHex: '#FEF9C3', accentHex: '#D97706', funCue: 'Honk honk!' },
  { id: 'plane', english: 'Airplane', darija: 'Tiyara', arabic: 'طيارة', phonetics: 'Tee-ya-ra', category: CategoryType.VEHICLES, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: 'Zoom!' },
  { id: 'boat', english: 'Boat', darija: 'Bato', arabic: 'باطو', phonetics: 'Ba-to', category: CategoryType.VEHICLES, bgHex: '#CFFAFE', accentHex: '#0891B2', funCue: 'Splash!' },
  { id: 'train', english: 'Train', darija: 'Tran', arabic: 'تران', phonetics: 'Tran', category: CategoryType.VEHICLES, bgHex: '#DCFCE7', accentHex: '#15803D', funCue: 'Choo-choo!' },

  // Around Me / Home (7)
  { id: 'ball', english: 'Ball', darija: 'Koura', arabic: 'كورة', phonetics: 'Koo-ra', category: CategoryType.HOME, bgHex: '#FEF2F2', accentHex: '#EF4444', funCue: 'Bounce!' },
  { id: 'house', english: 'House', darija: 'Dar', arabic: 'دار', phonetics: 'Dar', category: CategoryType.HOME, bgHex: '#FFEDD5', accentHex: '#EA580C', funCue: 'Home!' },
  { id: 'bed', english: 'Bed', darija: 'Namoussiya', arabic: 'ناموسية', phonetics: 'Na-moo-see-ya', category: CategoryType.HOME, bgHex: '#EDE9FE', accentHex: '#7C3AED', funCue: 'Night-night!' },
  { id: 'chair', english: 'Chair', darija: 'Koursi', arabic: 'كرسي', phonetics: 'Koor-see', category: CategoryType.HOME, bgHex: '#FEF3C7', accentHex: '#B45309', funCue: 'Sit!' },
  { id: 'book', english: 'Book', darija: 'Ktab', arabic: 'كتاب', phonetics: 'K-tab', category: CategoryType.HOME, bgHex: '#CCFBF1', accentHex: '#0F766E', funCue: 'Read!' },
  { id: 'key', english: 'Key', darija: 'Sarout', arabic: 'ساروت', phonetics: 'Sa-root', category: CategoryType.HOME, bgHex: '#FEF9C3', accentHex: '#CA8A04', funCue: 'Jingle!' },
  { id: 'table', english: 'Table', darija: 'Tabla', arabic: 'طبلة', phonetics: 'Tab-la', category: CategoryType.HOME, bgHex: '#F3E8FF', accentHex: '#7E22CE', funCue: 'Tap!' },

  // Nature & Sky (6)
  { id: 'sun', english: 'Sun', darija: 'Chems', arabic: 'شمس', phonetics: 'Shem-s', category: CategoryType.NATURE, bgHex: '#FEF9C3', accentHex: '#D97706', funCue: 'Shine!' },
  { id: 'moon', english: 'Moon', darija: 'Gmer', arabic: 'قمر', phonetics: 'G-mer', category: CategoryType.NATURE, bgHex: '#E0E7FF', accentHex: '#4338CA', funCue: 'Twinkle!' },
  { id: 'star', english: 'Star', darija: 'Nejma', arabic: 'نجمة', phonetics: 'Nej-ma', category: CategoryType.NATURE, bgHex: '#FEF3C7', accentHex: '#D97706', funCue: 'Sparkle!' },
  { id: 'tree', english: 'Tree', darija: 'Chejra', arabic: 'شجرة', phonetics: 'Shej-ra', category: CategoryType.NATURE, bgHex: '#DCFCE7', accentHex: '#15803D', funCue: 'Whoosh!' },
  { id: 'flower', english: 'Flower', darija: 'Werda', arabic: 'وردة', phonetics: 'Wer-da', category: CategoryType.NATURE, bgHex: '#FCE7F3', accentHex: '#DB2777', funCue: 'Sniff!' },
  { id: 'cloud', english: 'Cloud', darija: 'S7aba', arabic: 'سحابة', phonetics: 'S-ha-ba', category: CategoryType.NATURE, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: 'Float!' },

  // Colors (6)
  { id: 'red', english: 'Red', darija: 'Hmer', arabic: 'حمر', phonetics: 'H-mer', category: CategoryType.COLORS, bgHex: '#FEE2E2', accentHex: '#DC2626' },
  { id: 'blue', english: 'Blue', darija: 'Zreq', arabic: 'زرق', phonetics: 'Z-req', category: CategoryType.COLORS, bgHex: '#DBEAFE', accentHex: '#1D5FD1' },
  { id: 'yellow', english: 'Yellow', darija: 'Sfer', arabic: 'صفر', phonetics: 'S-fer', category: CategoryType.COLORS, bgHex: '#FEF9C3', accentHex: '#CA8A04' },
  { id: 'green', english: 'Green', darija: 'Khder', arabic: 'خضر', phonetics: 'Kh-der', category: CategoryType.COLORS, bgHex: '#DCFCE7', accentHex: '#16A34A' },
  { id: 'orange_color', english: 'Orange', darija: 'Limouni', arabic: 'ليموني', phonetics: 'Lee-moo-nee', category: CategoryType.COLORS, bgHex: '#FFEDD5', accentHex: '#EA580C' },
  { id: 'purple', english: 'Purple', darija: 'Mouve', arabic: 'موف', phonetics: 'Moov', category: CategoryType.COLORS, bgHex: '#F3E8FF', accentHex: '#9333EA' },

  // Body Parts (10) — Super interactive for 2yo & 4yo!
  { id: 'head', english: 'Head', darija: 'Ras', arabic: 'راس', phonetics: 'Ras', category: CategoryType.BODY, bgHex: '#FEF3C7', accentHex: '#D97706', funCue: 'Nod nod!' },
  { id: 'eyes', english: 'Eyes', darija: '3inin', arabic: 'عينين', phonetics: 'Aa-neen', category: CategoryType.BODY, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: 'Blink!' },
  { id: 'nose', english: 'Nose', darija: 'Nif', arabic: 'نيف', phonetics: 'Neef', category: CategoryType.BODY, bgHex: '#FCE7F3', accentHex: '#DB2777', funCue: 'Boop!' },
  { id: 'mouth', english: 'Mouth', darija: 'Fomm', arabic: 'فم', phonetics: 'Fom', category: CategoryType.BODY, bgHex: '#FFE4E6', accentHex: '#E11D48', funCue: 'Smile!' },
  { id: 'ears', english: 'Ears', darija: 'Wednin', arabic: 'ودنين', phonetics: 'Wed-neen', category: CategoryType.BODY, bgHex: '#FFEDD5', accentHex: '#EA580C', funCue: 'Listen!' },
  { id: 'hands', english: 'Hands', darija: 'Yeddin', arabic: 'يدين', phonetics: 'Yed-deen', category: CategoryType.BODY, bgHex: '#FEF9C3', accentHex: '#CA8A04', funCue: 'Clap clap!' },
  { id: 'feet', english: 'Feet', darija: 'Rejlin', arabic: 'رجلين', phonetics: 'Rej-leen', category: CategoryType.BODY, bgHex: '#DCFCE7', accentHex: '#16A34A', funCue: 'Stomp!' },
  { id: 'belly', english: 'Belly', darija: 'Kerch', arabic: 'كرش', phonetics: 'Ker-sh', category: CategoryType.BODY, bgHex: '#EDE9FE', accentHex: '#7C3AED', funCue: 'Tickle!' },
  { id: 'hair', english: 'Hair', darija: 'Ch3er', arabic: 'شعر', phonetics: 'Sh-aar', category: CategoryType.BODY, bgHex: '#FEF3C7', accentHex: '#92400E', funCue: 'Brush!' },
  { id: 'teeth', english: 'Teeth', darija: 'Sennin', arabic: 'سنان', phonetics: 'Sen-neen', category: CategoryType.BODY, bgHex: '#ECFEFF', accentHex: '#0891B2', funCue: 'Sparkle!' },

  // Numbers 1-10 (10)
  { id: 'num_1', english: 'One (1)', darija: 'Wa7ed', arabic: 'واحد', phonetics: 'Wa-hed', category: CategoryType.NUMBERS, bgHex: '#FEE2E2', accentHex: '#DC2626', funCue: '1!' },
  { id: 'num_2', english: 'Two (2)', darija: 'Jouj', arabic: 'جوج', phonetics: 'Jooj', category: CategoryType.NUMBERS, bgHex: '#FFEDD5', accentHex: '#EA580C', funCue: '1, 2!' },
  { id: 'num_3', english: 'Three (3)', darija: 'Tlata', arabic: 'ثلاثة', phonetics: 'Tla-ta', category: CategoryType.NUMBERS, bgHex: '#FEF9C3', accentHex: '#CA8A04', funCue: '1, 2, 3!' },
  { id: 'num_4', english: 'Four (4)', darija: 'Reb3a', arabic: 'ربعة', phonetics: 'Reb-aa', category: CategoryType.NUMBERS, bgHex: '#DCFCE7', accentHex: '#16A34A', funCue: '4!' },
  { id: 'num_5', english: 'Five (5)', darija: 'Khemsa', arabic: 'خمسة', phonetics: 'Khem-sa', category: CategoryType.NUMBERS, bgHex: '#CCFBF1', accentHex: '#0D9488', funCue: 'High 5!' },
  { id: 'num_6', english: 'Six (6)', darija: 'Setta', arabic: 'ستة', phonetics: 'Set-ta', category: CategoryType.NUMBERS, bgHex: '#E0F2FE', accentHex: '#0284C7', funCue: '6!' },
  { id: 'num_7', english: 'Seven (7)', darija: 'Seb3a', arabic: 'سبعة', phonetics: 'Seb-aa', category: CategoryType.NUMBERS, bgHex: '#DBEAFE', accentHex: '#1D4ED8', funCue: '7!' },
  { id: 'num_8', english: 'Eight (8)', darija: 'Tmenya', arabic: 'تمنية', phonetics: 'Tmen-ya', category: CategoryType.NUMBERS, bgHex: '#EDE9FE', accentHex: '#7C3AED', funCue: '8!' },
  { id: 'num_9', english: 'Nine (9)', darija: 'Tes3oud', arabic: 'تسعود', phonetics: 'Tes-ood', category: CategoryType.NUMBERS, bgHex: '#FAE8FF', accentHex: '#C026D3', funCue: '9!' },
  { id: 'num_10', english: 'Ten (10)', darija: '3echra', arabic: 'عشرة', phonetics: 'Aash-ra', category: CategoryType.NUMBERS, bgHex: '#FCE7F3', accentHex: '#DB2777', funCue: '10 fingers!' },
];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(
  WORDS.map((w) => [w.id, w])
);

export const CATEGORY_BY_ID: Record<CategoryType, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryType, CategoryMeta>;

/** Unbiased Fisher-Yates shuffle returning a new array */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const PRAISE_PHRASES = [
  { darija: 'Bravo!', arabic: 'برافو!', english: 'Great job!' },
  { darija: 'Tbarkellah!', arabic: 'تبارك الله!', english: 'Amazing!' },
  { darija: 'Bessa7a!', arabic: 'بالصحة!', english: 'Awesome!' },
  { darija: 'Zwin bezzaf!', arabic: 'زوين بزاف!', english: 'So good!' },
];
