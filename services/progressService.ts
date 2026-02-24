
const STORAGE_KEY = 'darija-progress';

interface Progress {
  gamesCompleted: number;
  wordsLearned: string[];
  stars: number;
}

function getProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { gamesCompleted: 0, wordsLearned: [], stars: 0 };
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export function addStar(): number {
  const progress = getProgress();
  progress.stars += 1;
  progress.gamesCompleted += 1;
  saveProgress(progress);
  return progress.stars;
}

export function getStars(): number {
  return getProgress().stars;
}

export function markWordLearned(wordId: string) {
  const progress = getProgress();
  if (!progress.wordsLearned.includes(wordId)) {
    progress.wordsLearned.push(wordId);
    saveProgress(progress);
  }
}

export function getWordsLearnedCount(): number {
  return getProgress().wordsLearned.length;
}
