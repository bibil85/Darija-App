import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, CHILD_PROFILES, WORD_BY_ID, WORDS, shuffleArray } from './constants.ts';
import {
  AgeMode,
  AppView,
  CategoryType,
  DifficultyLevel,
  ParentSettings,
  ProgressData,
  Word,
} from './types.ts';
import { SceneManager } from './engine/SceneManager.ts';
import { HomeWorldScene } from './engine/scenes/HomeWorldScene.ts';
import { Stage3D } from './components/Stage3D.tsx';
import { Layout } from './components/Layout.tsx';
import { GameIcon } from './components/GameIcons.tsx';
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
import { speakShortPhrase, speakWord } from './services/audioService.ts';
import {
  playClickSound,
  setSoundEffectsEnabled,
} from './services/soundService.ts';
import { ToddlerUXGuard } from './src/ux/ToddlerUXGuard.ts';

const VIEW_TITLES: Record<AppView, string> = {
  home: '',
  explore: '3D Picture Book',
  bubbles: 'Pop 3D Bubbles!',
  peekaboo: '3D Peek-a-Boo!',
  feed: 'Feed 3D Sba3!',
  discovery: 'Listen & Find!',
  memory: '3D Memory Flip!',
  sorting: 'Sort 3D Baskets!',
  stickers: '3D Toy Oasis',
  parent: 'Parent Studio',
};

const App: React.FC = () => {
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [view, setView] = useState<AppView>('home');
  const [exploreCategory, setExploreCategory] = useState<CategoryType>(CategoryType.ANIMALS);
  const [settings, setSettings] = useState<ParentSettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress());
  const [homeToast, setHomeToast] = useState<Word | null>(null);

  // Install global iPad Safari gesture lockdown (suppress pinch-zoom, double-tap zoom, callouts)
  useEffect(() => {
    return ToddlerUXGuard.installViewportLock();
  }, []);

  useEffect(() => {
    setSoundEffectsEnabled(settings.soundEffects);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const activeProfile = CHILD_PROFILES[settings.ageMode];

  // Mount live 3D Home Courtyard World whenever view === 'home' or 'parent'
  useEffect(() => {
    if (!sceneManager) return;
    if (view !== 'home' && view !== 'parent') return;

    const scene = new HomeWorldScene({
      onSba3Tap: () => {
        speakShortPhrase(`Marhaba ${activeProfile.name}!`, 'مرحبا!');
      },
      onPropTap: (wordId) => {
        const w = WORD_BY_ID[wordId];
        if (w) {
          setHomeToast(w);
          speakWord(w);
          window.setTimeout(() => setHomeToast(null), 1600);
        }
      },
    });
    sceneManager.setScene(scene);
  }, [sceneManager, view, activeProfile.name]);

  const handleProfileSelect = (ageMode: AgeMode, difficulty: DifficultyLevel) => {
    setSettings((prev) => ({ ...prev, ageMode, difficulty }));
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    setSettings((prev) => ({
      ...prev,
      difficulty,
      ageMode: difficulty === 1 ? 'little' : 'big',
    }));
  };

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
          x: 18 + Math.random() * 64,
          y: 26 + Math.random() * 52,
          scale: 1,
        },
      ],
    }));
  };

  const handleMoveSticker = useCallback((uid: string, x: number, y: number) => {
    setProgress((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((s) => (s.uid === uid ? { ...s, x, y } : s)),
    }));
  }, []);

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
          x: 28 + Math.random() * 44,
          y: 35 + Math.random() * 30,
          scale: 1,
        },
      ],
    }));
    return chosen;
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
    gradient: string;
    border: string;
    badge?: string;
  }> = [
    { view: 'explore', title: 'Picture Book', gradient: 'from-amber-400 to-orange-500', border: 'border-orange-600', badge: `${WORDS.length}` },
    { view: 'peekaboo', title: 'Peek-a-Boo!', gradient: 'from-violet-400 to-indigo-600', border: 'border-indigo-700' },
    { view: 'feed', title: 'Feed Sba3!', gradient: 'from-rose-400 to-pink-600', border: 'border-pink-700' },
    { view: 'bubbles', title: 'Pop Bubbles', gradient: 'from-sky-400 to-cyan-600', border: 'border-cyan-700' },
    { view: 'discovery', title: 'Listen & Find', gradient: 'from-blue-500 to-majorelle-600', border: 'border-blue-800' },
    { view: 'memory', title: 'Memory Flip', gradient: 'from-teal-400 to-minttile-600', border: 'border-teal-700' },
    { view: 'sorting', title: 'Sort Baskets', gradient: 'from-orange-400 to-terracotta-600', border: 'border-terracotta-600' },
    { view: 'stickers', title: '3D Toy Oasis', gradient: 'from-pink-400 to-fuchsia-600', border: 'border-fuchsia-700', badge: `${progress.unlockedWordIds.length}/${WORDS.length}` },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Persistent 60fps Three.js 3D WebGL Playworld */}
      <Stage3D onManagerReady={setSceneManager} />

      <Layout
        title={VIEW_TITLES[view]}
        showHomeButton={view !== 'home'}
        stars={progress.stars}
        ageMode={settings.ageMode}
        difficulty={settings.difficulty}
        showGyroButton={SceneManager.needsGyroPermission()}
        gyroEnabled={gyroEnabled}
        onEnableGyro={async () => {
          if (!sceneManager) return;
          const res = await sceneManager.enableGyroscope();
          if (res === 'granted') setGyroEnabled(true);
        }}
        sfxEnabled={settings.soundEffects}
        onToggleSfx={() => {
          setSettings((prev) => {
            const next = !prev.soundEffects;
            setSoundEffectsEnabled(next);
            if (next) playClickSound();
            return { ...prev, soundEffects: next };
          });
        }}
        onHomeClick={() => openView('home')}
        onProfileSelect={handleProfileSelect}
        onDifficultyChange={handleDifficultyChange}
        onStickersClick={() => openView('stickers')}
        onParentOpen={() => setView('parent')}
        hideChromeControls={view === 'parent'}
      >
        {view === 'home' && (
          <div className="pointer-events-none h-full flex flex-col justify-between gap-2">
            {/* Compact Top Greeting Pill — leaves the 3D Moroccan Courtyard & 3D Sba3 wide open! */}
            <div className="pointer-events-none flex flex-col items-center gap-1.5">
              <div className="bg-white/85 backdrop-blur-md border-2 border-white rounded-full px-5 py-1.5 shadow-lg flex items-center gap-3">
                <span className="font-kids text-xl sm:text-2xl text-terracotta-600">
                  Marhaba, {activeProfile.name}!
                </span>
                {settings.showArabic && (
                  <span className="font-arabic text-xl sm:text-2xl font-bold text-majorelle-500" dir="rtl">
                    مرحبا!
                  </span>
                )}
                <span className="hidden md:inline text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Tap 3D Sba3 or toys!
                </span>
              </div>

              {homeToast && (
                <div className="bg-saffron-400 text-amber-950 font-kids text-lg px-4 py-1 rounded-full shadow-md animate-pop">
                  {homeToast.darija} {settings.showArabic ? `• ${homeToast.arabic}` : ''}
                </div>
              )}
            </div>

            {/* Open 3D Stage Window in the middle — kids tap Sba3 & orbiting 3D toys directly! */}
            <div className="pointer-events-none flex-1" />

            {/* Sleek Bottom Game & Category Launcher Dock */}
            <div className="pointer-events-auto bg-white/80 backdrop-blur-md border-2 border-white rounded-[2rem] p-3 shadow-2xl flex flex-col gap-2.5">
              {/* 8 3D Game Mode Cards */}
              <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                {GAMES.map((game) => (
                  <button
                    key={game.view}
                    type="button"
                    onClick={() => openView(game.view)}
                    className={`group relative bg-gradient-to-br ${game.gradient} ${game.border} border-b-4 rounded-2xl p-2 text-white shadow-md hover:brightness-105 active:translate-y-0.5 active:border-b-0 transition-all flex flex-col items-center justify-center gap-1`}
                  >
                    {game.badge && (
                      <span className="absolute top-1 right-1 bg-white/95 text-slate-800 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full">
                        {game.badge}
                      </span>
                    )}
                    <GameIcon view={game.view} className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform" />
                    <span className="font-kids text-[11px] sm:text-xs leading-tight text-center drop-shadow-sm">
                      {game.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* 8 Quick-Jump 3D Word Categories */}
              <div className="allow-scroll-x flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800/80 px-1.5 whitespace-nowrap">
                  {WORDS.length} Words:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => openCategory(cat.id)}
                    className={`${cat.borderClass} border-b-2 rounded-xl px-3 py-1 text-white font-kids text-xs whitespace-nowrap shadow-sm hover:brightness-105 active:translate-y-0.5 transition-all flex-shrink-0`}
                    style={{
                      background: `linear-gradient(135deg, ${cat.gradientFrom}, ${cat.gradientTo})`,
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'explore' && (
          <ExploreBook
            sceneManager={sceneManager}
            initialCategory={exploreCategory}
            settings={settings}
          />
        )}

        {view === 'peekaboo' && (
          <PeekabooGame
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'feed' && (
          <FeedSba3Game
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'bubbles' && (
          <BubblePopGame
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'discovery' && (
          <DiscoveryGame
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'memory' && (
          <MemoryGame
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'sorting' && (
          <SortingGame
            sceneManager={sceneManager}
            difficulty={settings.difficulty}
            settings={settings}
            onReward={handleReward}
            onHome={() => openView('home')}
          />
        )}

        {view === 'stickers' && (
          <StickerOasis
            sceneManager={sceneManager}
            progress={progress}
            settings={settings}
            onPlaceSticker={handlePlaceSticker}
            onMoveSticker={handleMoveSticker}
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
    </div>
  );
};

export default App;
