import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CHILD_PROFILES, WORDS, shuffleArray } from './constants.ts';
import {
  AgeMode,
  AppView,
  CategoryType,
  ParentSettings,
  ProgressData,
  Word,
} from './types.ts';
import { Layout } from './components/Layout.tsx';
import { Mascot } from './components/Mascot.tsx';
import { ExplorerAvatar } from './components/ExplorerAvatar.tsx';
import { GameIcon } from './components/GameIcons.tsx';
import { WordIllustration } from './components/WordIllustration.tsx';
import { ExploreBook } from './components/ExploreBook.tsx';
import { BubblePopGame } from './components/BubblePopGame.tsx';
import { PeekabooGame } from './components/PeekabooGame.tsx';
import { FeedSba3Game } from './components/FeedSba3Game.tsx';
import { DiscoveryGame } from './components/DiscoveryGame.tsx';
import { MemoryGame } from './components/MemoryGame.tsx';
import { SortingGame } from './components/SortingGame.tsx';
import { StickerOasis } from './components/StickerOasis.tsx';
import { ParentStudio } from './components/ParentStudio.tsx';
import {
  DEFAULT_PROGRESS,
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
} from './services/storageService.ts';
import { speakShortPhrase } from './services/audioService.ts';
import {
  playClickSound,
  playPopSound,
  setSoundEffectsEnabled,
} from './services/soundService.ts';

const VIEW_TITLES: Record<AppView, string> = {
  home: '',
  explore: 'Picture Book',
  bubbles: 'Pop the Bubbles!',
  peekaboo: 'Peek-a-Boo!',
  feed: 'Feed Sba3!',
  discovery: 'Listen & Find!',
  memory: 'Memory Flip!',
  sorting: 'Sort the Baskets!',
  stickers: 'Sticker Oasis',
  parent: 'Parent Studio',
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [exploreCategory, setExploreCategory] = useState<CategoryType>(CategoryType.ANIMALS);
  const [settings, setSettings] = useState<ParentSettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress());
  const [sba3Greeting, setSba3Greeting] = useState(false);

  useEffect(() => {
    setSoundEffectsEnabled(settings.soundEffects);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleAgeModeChange = (ageMode: AgeMode) => {
    setSettings((prev) => ({ ...prev, ageMode }));
  };

  /** Award stars & unlock a sticker (returns newly unlocked word if any) */
  const handleReward = useCallback((starsToAdd: number, preferredWordId?: string): Word | null => {
    let newlyUnlocked: Word | null = null;
    setProgress((prev) => {
      const unlockedSet = new Set(prev.unlockedWordIds);
      const lockedWords = WORDS.filter((w) => !unlockedSet.has(w.id));

      if (lockedWords.length > 0) {
        const preferred = lockedWords.find((w) => w.id === preferredWordId);
        newlyUnlocked = preferred || shuffleArray(lockedWords)[0];
        unlockedSet.add(newlyUnlocked.id);
      }

      return {
        ...prev,
        stars: prev.stars + starsToAdd,
        unlockedWordIds: Array.from(unlockedSet),
      };
    });
    return newlyUnlocked;
  }, []);

  const handlePlaceSticker = (wordId: string) => {
    setProgress((prev) => ({
      ...prev,
      placedStickers: [
        ...prev.placedStickers.slice(-17),
        {
          uid: `${wordId}-${Date.now()}-${Math.random()}`,
          wordId,
          x: 16 + Math.random() * 68,
          y: 22 + Math.random() * 62,
          scale: 1,
        },
      ],
    }));
  };

  const handleMoveSticker = (uid: string, x: number, y: number) => {
    setProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((s) =>
        s.uid === uid ? { ...s, x, y } : s
      ),
    }));
  };

  const handleRemoveSticker = (uid: string) => {
    setProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.filter((s) => s.uid !== uid),
    }));
  };

  const handleClearScene = () => {
    setProgress((prev) => ({ ...prev, placedStickers: [] }));
  };

  const handleRedeemSurprise = (): Word | null => {
    if (progress.stars < 3) return null;
    const unlockedSet = new Set(progress.unlockedWordIds);
    const locked = WORDS.filter((w) => !unlockedSet.has(w.id));
    if (locked.length === 0) return null;

    const chosen = shuffleArray(locked)[0];
    setProgress((prev) => ({
      ...prev,
      stars: Math.max(0, prev.stars - 3),
      unlockedWordIds: [...prev.unlockedWordIds, chosen.id],
      placedStickers: [
        ...prev.placedStickers,
        {
          uid: `surprise-${chosen.id}-${Date.now()}`,
          wordId: chosen.id,
          x: 25 + Math.random() * 50,
          y: 35 + Math.random() * 35,
          scale: 1.05,
        },
      ],
    }));
    return chosen;
  };

  const isNora = settings.ageMode === 'little';
  const activeProfile = CHILD_PROFILES[settings.ageMode];

  const handleMascotTap = () => {
    playPopSound();
    setSba3Greeting(true);
    speakShortPhrase(`Marhaba ${activeProfile.name}!`, 'مرحبا!');
    window.setTimeout(() => setSba3Greeting(false), 1200);
  };

  const openCategory = (cat: CategoryType) => {
    playClickSound();
    setExploreCategory(cat);
    setView('explore');
  };

  const openView = (nextView: AppView) => {
    playClickSound();
    setView(nextView);
  };

  const GAMES: Array<{
    view: AppView;
    title: string;
    subtitle: string;
    gradient: string;
    border: string;
    badge?: string;
  }> = [
    {
      view: 'explore',
      title: 'Picture Book',
      subtitle: 'Swipe & hear 64 words!',
      gradient: 'from-amber-400 to-orange-500',
      border: 'border-orange-600',
      badge: '64 Words',
    },
    {
      view: 'peekaboo',
      title: 'Peek-a-Boo!',
      subtitle: isNora ? 'Swipe open magic doors!' : 'Find who is hiding!',
      gradient: 'from-violet-400 to-indigo-600',
      border: 'border-indigo-700',
      badge: 'NEW!',
    },
    {
      view: 'feed',
      title: 'Feed Sba3!',
      subtitle: 'Drag yummy Darija food!',
      gradient: 'from-rose-400 to-pink-600',
      border: 'border-pink-700',
      badge: 'NEW!',
    },
    {
      view: 'bubbles',
      title: 'Pop Bubbles!',
      subtitle: isNora ? 'Pop floating bubbles!' : 'Pop the word you hear!',
      gradient: 'from-sky-400 to-cyan-600',
      border: 'border-cyan-700',
    },
    {
      view: 'discovery',
      title: 'Listen & Find',
      subtitle: isNora ? '2 big picture choices!' : 'Find the picture you hear!',
      gradient: 'from-blue-500 to-majorelle-600',
      border: 'border-blue-800',
    },
    {
      view: 'memory',
      title: 'Memory Flip',
      subtitle: isNora ? '3 easy picture pairs!' : '6 Moroccan tile pairs!',
      gradient: 'from-teal-400 to-minttile-600',
      border: 'border-teal-700',
    },
    {
      view: 'sorting',
      title: 'Sort Baskets',
      subtitle: isNora ? 'Drag: Animals or Food?' : 'Drag into 3 baskets!',
      gradient: 'from-orange-400 to-terracotta-600',
      border: 'border-terracotta-600',
    },
    {
      view: 'stickers',
      title: 'Sticker Oasis',
      subtitle: `${progress.unlockedWordIds.length}/${WORDS.length} stickers`,
      gradient: 'from-pink-400 to-fuchsia-600',
      border: 'border-fuchsia-700',
      badge: `${progress.stars} ⭐`,
    },
  ];

  return (
    <Layout
      title={VIEW_TITLES[view]}
      showHomeButton={view !== 'home'}
      stars={progress.stars}
      ageMode={settings.ageMode}
      onHomeClick={() => openView('home')}
      onAgeModeChange={handleAgeModeChange}
      onStickersClick={() => openView('stickers')}
      onParentOpen={() => setView('parent')}
      hideChromeControls={view === 'parent'}
    >
      {view === 'home' && (
        <div className="flex flex-col gap-3 sm:gap-3.5 pb-2 animate-fade-up">
          {/* Personalized Pixar-Shaded Hero Welcome for Nora & Sophia */}
          <section className="relative bg-gradient-to-r from-amber-100 via-sand-50 to-sky-100 border-4 border-saffron-400/75 rounded-[2rem] px-4 py-3 sm:px-5 sm:py-3.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 overflow-hidden">
            <div className="flex items-center gap-3.5">
              <Mascot
                mood={sba3Greeting ? 'cheering' : 'waving'}
                size={84}
                onClick={handleMascotTap}
              />
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="font-kids text-3xl sm:text-4xl text-terracotta-600 leading-none">
                    Marhaba, {activeProfile.name}!
                  </h2>
                  {settings.showArabic && (
                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-majorelle-500" dir="rtl">
                      مرحبا!
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-extrabold text-amber-800/85 mt-1">
                  {activeProfile.tagline}
                </p>
              </div>
            </div>

            {/* Big Visual Nora / Sophia Switcher with Custom Pixar Avatars */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => {
                  playClickSound();
                  handleAgeModeChange('little');
                }}
                className={`pl-2 pr-4 py-2 rounded-2xl font-kids text-base sm:text-lg border-b-4 transition-all flex items-center gap-2 ${
                  isNora
                    ? 'bg-saffron-400 text-amber-950 border-saffron-600 shadow-md scale-[1.03]'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <ExplorerAvatar profile="little" size={34} />
                <span>Nora</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  handleAgeModeChange('big');
                }}
                className={`pl-2 pr-4 py-2 rounded-2xl font-kids text-base sm:text-lg border-b-4 transition-all flex items-center gap-2 ${
                  !isNora
                    ? 'bg-majorelle-500 text-white border-majorelle-600 shadow-md scale-[1.03]'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <ExplorerAvatar profile="big" size={34} />
                <span>Sophia</span>
              </button>
            </div>
          </section>

          {/* 8 Animated Pixar-Emblem Play Games Grid (4x2 on iPad Landscape, 2x4 on Portrait) */}
          <section>
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="font-kids text-lg sm:text-xl text-amber-800">
                Play &amp; Learn Games
              </h3>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600/80">
                Swipe, drag &amp; tap — no reading needed!
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {GAMES.map((game) => (
                <button
                  key={game.view}
                  type="button"
                  onClick={() => openView(game.view)}
                  className={`group relative bg-gradient-to-br ${game.gradient} ${game.border} border-b-[6px] rounded-[1.75rem] p-3.5 text-left text-white pixar-card-sheen hover:brightness-105 active:translate-y-1 active:border-b-0 transition-all flex flex-col justify-between min-h-[126px] sm:min-h-[136px] overflow-hidden`}
                >
                  {game.badge && (
                    <span className="absolute top-2.5 right-2.5 bg-white/95 text-slate-800 font-extrabold text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                      {game.badge}
                    </span>
                  )}

                  <div className="transition-transform duration-300 group-hover:scale-110 origin-left">
                    <GameIcon view={game.view} className="w-12 h-12 sm:w-14 sm:h-14" />
                  </div>

                  <div className="mt-1">
                    <div className="font-kids text-lg sm:text-xl leading-tight drop-shadow-sm">
                      {game.title}
                    </div>
                    <div className="text-[11px] sm:text-xs font-extrabold text-white/95 mt-0.5 leading-snug">
                      {game.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 8 Quick-Jump Word Topics with Custom Living Pixar Mini Illustrations */}
          <section>
            <h3 className="font-kids text-lg sm:text-xl text-amber-800 px-1 mb-2">
              Explore 64 Darija Words
            </h3>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => openCategory(cat.id)}
                  className={`${cat.borderClass} border-b-4 rounded-2xl p-2 text-white shadow-md hover:scale-[1.04] active:translate-y-0.5 active:border-b-0 transition-all flex flex-col items-center justify-center gap-1`}
                  style={{
                    background: `linear-gradient(145deg, ${cat.gradientFrom}, ${cat.gradientTo})`,
                  }}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/90 p-0.5 shadow-sm">
                    <WordIllustration wordId={cat.icon} animated={false} className="w-full h-full" />
                  </div>
                  <span className="font-kids text-xs leading-tight text-center drop-shadow-sm">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {view === 'explore' && (
        <ExploreBook
          initialCategory={exploreCategory}
          settings={settings}
        />
      )}

      {view === 'peekaboo' && (
        <PeekabooGame
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'feed' && (
        <FeedSba3Game
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'bubbles' && (
        <BubblePopGame
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'discovery' && (
        <DiscoveryGame
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'memory' && (
        <MemoryGame
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'sorting' && (
        <SortingGame
          ageMode={settings.ageMode}
          settings={settings}
          onReward={handleReward}
          onHome={() => openView('home')}
        />
      )}

      {view === 'stickers' && (
        <StickerOasis
          progress={progress}
          settings={settings}
          onPlaceSticker={handlePlaceSticker}
          onMoveSticker={handleMoveSticker}
          onRemoveSticker={handleRemoveSticker}
          onClearScene={handleClearScene}
          onRedeemSurprise={handleRedeemSurprise}
        />
      )}

      {view === 'parent' && (
        <ParentStudio
          settings={settings}
          onUpdateSettings={setSettings}
          onUnlockAllStickers={() =>
            setProgress((prev) => ({
              ...prev,
              unlockedWordIds: WORDS.map((w) => w.id),
            }))
          }
          onResetProgress={() => setProgress(DEFAULT_PROGRESS)}
          onClose={() => openView('home')}
        />
      )}
    </Layout>
  );
};

export default App;
