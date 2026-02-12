
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick?: () => void;
  showBackButton?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onHomeClick, showBackButton }) => {
  return (
    <div 
      className="h-screen w-full max-w-lg mx-auto bg-amber-50 shadow-2xl relative overflow-hidden flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Decorative Moroccan Pattern Top */}
      <div className="h-4 w-full bg-repeat-x opacity-20 flex-shrink-0" style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
      
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b-4 border-amber-100 z-10 flex-shrink-0">
        <h1 
          className="text-2xl font-kids text-amber-600 cursor-pointer select-none"
          onClick={onHomeClick}
        >
          Darija Fun! 🦁
        </h1>
        {showBackButton && (
          <button 
            onClick={onHomeClick}
            className="bg-amber-100 p-2 rounded-full hover:bg-amber-200 transition-colors active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        )}
      </header>

      {/* Main Content Area - Scrollable but contained */}
      <main className="flex-grow flex flex-col p-6 overflow-y-auto overflow-x-hidden touch-pan-y">
        {children}
      </main>

      {/* Footer / Score - Resonant with iOS home indicator area */}
      <footer className="p-4 bg-white border-t-4 border-amber-100 flex justify-center items-center gap-2 flex-shrink-0">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-kids text-amber-500">Good Job!</span>
        <span className="text-2xl">⭐</span>
      </footer>
    </div>
  );
};
