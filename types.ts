
export enum CategoryType {
  ANIMALS = 'Animals',
  FOOD = 'Food',
  FAMILY = 'Family',
  OBJECTS = 'Objects'
}

export type AppView = 'home' | 'learn' | 'match' | 'discovery' | 'naming';

export interface Word {
  id: string;
  english: string;
  darija: string;
  phonetics: string;
  category: CategoryType;
  imageUrl: string;
}

export interface AppState {
  view: AppView;
  currentCategory: CategoryType | null;
  score: number;
}
