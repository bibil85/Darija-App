export enum CategoryType {
  ANIMALS = 'animals',
  FOOD = 'food',
  FAMILY = 'family',
  HOME = 'home',
  NATURE = 'nature',
  COLORS = 'colors',
  BODY = 'body',
  NUMBERS = 'numbers',
}

export type AgeMode = 'little' | 'big'; // little = Nora (2), big = Sophia (4)

export type AppView =
  | 'home'
  | 'explore'
  | 'bubbles'
  | 'peekaboo'
  | 'feed'
  | 'discovery'
  | 'memory'
  | 'sorting'
  | 'stickers'
  | 'parent';

export type AudioSource = 'parent' | 'gemini' | 'speech' | 'chime';

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  darija: string;
  arabic: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  softBgClass: string;
  textClass: string;
  hex: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface Word {
  id: string;
  english: string;
  darija: string;
  arabic: string;
  phonetics: string;
  category: CategoryType;
  bgHex: string;
  accentHex: string;
  /** Optional playful sound cue for toddlers (e.g., "Meow!", "Beep beep!") */
  funCue?: string;
}

export interface ParentSettings {
  ageMode: AgeMode;
  showArabic: boolean;
  showEnglish: boolean;
  soundEffects: boolean;
  voiceLabel: 'Mama' | 'Baba' | 'Family';
}

export interface PlacedSticker {
  uid: string;
  wordId: string;
  x: number; // percentage 8..92
  y: number; // percentage 14..86
  scale: number;
}

export interface ProgressData {
  stars: number;
  unlockedWordIds: string[];
  placedStickers: PlacedSticker[];
}

export interface ParentRecording {
  wordId: string;
  blob: Blob;
  mimeType: string;
  speakerLabel: string;
  updatedAt: number;
}
