
export enum CategoryType {
  ANIMALS = 'Animals',
  FOOD = 'Food',
  FAMILY = 'Family',
  OBJECTS = 'Objects',
  COLORS = 'Colors',
  BODY = 'Body Parts',
  NUMBERS = 'Numbers'
}

export type AppView = 'home' | 'learn' | 'match' | 'discovery' | 'naming' | 'memory';

export interface Word {
  id: string;
  english: string;
  darija: string;
  phonetics: string;
  category: CategoryType;
  imageUrl: string;
  emoji: string;
}

export interface AppState {
  view: AppView;
  currentCategory: CategoryType | null;
  score: number;
}
