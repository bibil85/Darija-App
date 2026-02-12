
import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Flashcard } from './components/Flashcard';
import { MatchingGame } from './components/MatchingGame';
import { DiscoveryGame } from './components/DiscoveryGame';
import { NamingGame } from './components/NamingGame';
import { CATEGORIES, INITIAL_WORDS } from './constants';
import { CategoryType, AppView } from './types';
import { playClickSound } from './services/soundService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [wordIndex, setWordIndex] = useState(0);

  const filteredWords = useMemo(() => {
    if (!currentCategory) return [];
    return INITIAL_WORDS.filter(w => w.category === currentCategory);
  }, [currentCategory]);

  const handleCategorySelect = (category: CategoryType) => {
    playClickSound();
    setCurrentCategory(category);
    setWordIndex(0);
    setView('learn');
  };

  const handleNext = () => {
    playClickSound();
    setWordIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handlePrev = () => {
    playClickSound();
    setWordIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  const handleHome = () => {
    playClickSound();
    setView('home');
    setCurrentCategory(null);
    setWordIndex(0);
  };

  const navigateToGame = (gameView: AppView) => {
    playClickSound();
    setView(gameView);
  };

  return (
    <Layout onHomeClick={handleHome} showBackButton={view !== 'home'}>
      {view === 'home' && (
        <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-10 duration-500 pb-10">
          <div className="text-center">
            <h2 className="text-4xl font-kids text-amber-600 mb-2 animate-pop">Marhaba! 👋</h2>
            <p className="text-lg font-bold text-gray-500">Pick an activity!</p>
          </div>
          
          <div className="flex flex-col gap-6">
            {/* SCHOOL SECTION */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-2">School 📚</h3>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`${cat.color} p-4 rounded-3xl shadow-lg transform transition-all hover:scale-110 hover:shadow-2xl hover-wiggle active:scale-95 flex flex-col items-center justify-center gap-2 border-b-8 border-black border-opacity-10`}
                  >
                    <span className="text-4xl transition-transform duration-300 transform group-hover:scale-125">{cat.icon}</span>
                    <span className="text-white font-kids text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PLAYGROUND SECTION */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-2">Playground 🎡</h3>
              <div className="grid gap-4">
                <button
                  onClick={() => navigateToGame('match')}
                  className="group bg-green-400 p-6 rounded-3xl shadow-xl flex items-center justify-between border-b-8 border-green-600 border-opacity-20 active:translate-y-1 active:border-b-0 transition-all hover:bg-green-300"
                >
                  <div className="text-left">
                    <span className="text-white font-kids text-2xl block">Pairs Match</span>
                    <span className="text-green-800 font-bold text-xs uppercase">Find the 2 same things!</span>
                  </div>
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-300">🧩</span>
                </button>

                <button
                  onClick={() => navigateToGame('discovery')}
                  className="group bg-indigo-400 p-6 rounded-3xl shadow-xl flex items-center justify-between border-b-8 border-indigo-600 border-opacity-20 active:translate-y-1 active:border-b-0 transition-all hover:bg-indigo-300"
                >
                  <div className="text-left">
                    <span className="text-white font-kids text-2xl block">Listen & Find</span>
                    <span className="text-indigo-800 font-bold text-xs uppercase">Where is the sound?</span>
                  </div>
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-300">👂</span>
                </button>

                <button
                  onClick={() => navigateToGame('naming')}
                  className="group bg-rose-400 p-6 rounded-3xl shadow-xl flex items-center justify-between border-b-8 border-rose-600 border-opacity-20 active:translate-y-1 active:border-b-0 transition-all hover:bg-rose-300"
                >
                  <div className="text-left">
                    <span className="text-white font-kids text-2xl block">What's the Word?</span>
                    <span className="text-rose-800 font-bold text-xs uppercase">Tap the name!</span>
                  </div>
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-300">🧸</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border-4 border-amber-100 flex items-center gap-4 group cursor-pointer hover:border-amber-300 transition-colors">
            <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-3xl bounce-subtle group-hover:animate-bounce">🦁</div>
            <div>
              <p className="font-bold text-amber-800 group-hover:text-amber-600 transition-colors">Learning Moroccan</p>
              <p className="text-xs text-gray-500">Fun games to help your kids recognize sounds and images!</p>
            </div>
          </div>
        </div>
      )}

      {view === 'learn' && currentCategory && (
        <div className="h-full flex flex-col">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl animate-pop">{CATEGORIES.find(c => c.id === currentCategory)?.icon}</span>
            <span className="text-xl font-kids text-amber-600">{currentCategory}</span>
            <span className="ml-auto text-amber-400 font-bold">{wordIndex + 1} / {filteredWords.length}</span>
          </div>
          <Flashcard 
            word={filteredWords[wordIndex]} 
            onNext={handleNext} 
            onPrev={handlePrev} 
          />
        </div>
      )}

      {view === 'match' && <MatchingGame onComplete={handleHome} />}
      {view === 'discovery' && <DiscoveryGame onComplete={handleHome} />}
      {view === 'naming' && <NamingGame onComplete={handleHome} />}
    </Layout>
  );
};

export default App;
