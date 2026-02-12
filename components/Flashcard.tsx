
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { generateDarijaAudio, playPCM } from '../services/geminiService';

interface FlashcardProps {
  word: Word;
  onNext: () => void;
  onPrev: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ word, onNext, onPrev }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Reset sparkles on word change
    setShowSparkles(false);
    const timer = setTimeout(() => setShowSparkles(true), 100);
    return () => clearTimeout(timer);
  }, [word]);

  const handlePlayAudio = async () => {
    if (isLoadingAudio) return;
    setIsLoadingAudio(true);
    setIsPlaying(true);
    setShowSparkles(true);
    
    try {
      const audioData = await generateDarijaAudio(word.darija);
      if (audioData) {
        await playPCM(audioData);
      }
    } catch (error) {
      console.error("Audio playback error", error);
    } finally {
      setIsLoadingAudio(false);
      // Give some visual feedback duration
      setTimeout(() => {
        setIsPlaying(false);
        setShowSparkles(false);
      }, 1000);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center gap-8 animate-in fade-in zoom-in duration-500">
      {/* The Card */}
      <div className="w-full aspect-square bg-white rounded-3xl shadow-xl border-8 border-amber-200 p-6 flex flex-col items-center justify-between relative group overflow-hidden">
        {/* Sparkle Emojis */}
        {showSparkles && (
          <>
            <div className="absolute top-10 left-10 text-2xl animate-sparkle pointer-events-none">✨</div>
            <div className="absolute top-20 right-10 text-3xl animate-sparkle delay-75 pointer-events-none">🌟</div>
            <div className="absolute bottom-20 left-12 text-2xl animate-sparkle delay-150 pointer-events-none">⭐</div>
            <div className="absolute top-1/2 right-12 text-2xl animate-sparkle delay-200 pointer-events-none">✨</div>
          </>
        )}

        {/* Decorative corner stars */}
        <div className="absolute top-2 left-2 text-xl opacity-20">✨</div>
        <div className="absolute bottom-2 right-2 text-xl opacity-20">✨</div>

        <div className="w-full flex-grow flex items-center justify-center overflow-hidden rounded-2xl mb-4">
          <img 
            src={word.imageUrl} 
            alt={word.english} 
            className={`max-h-full max-w-full object-contain rounded-xl transition-all duration-500 ${isPlaying ? 'scale-110 rotate-1' : 'scale-100 rotate-0'}`}
          />
        </div>

        <div className="text-center w-full">
          <h2 className="text-4xl font-kids text-amber-600 mb-2 animate-pop">{word.english}</h2>
          <div className="flex flex-col items-center gap-1">
             <span className={`text-5xl font-kids transition-all duration-300 ${isPlaying ? 'text-indigo-600 scale-110' : 'text-amber-500 scale-100'}`}>
                {word.darija}
             </span>
             <span className="text-2xl font-medium text-gray-400 italic">
                {word.phonetics}
             </span>
          </div>
        </div>
      </div>

      {/* Audio & Interaction Buttons */}
      <div className="flex flex-col items-center w-full gap-8">
        <button
          onClick={handlePlayAudio}
          disabled={isLoadingAudio}
          className={`
            w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-90
            ${isPlaying ? 'bg-indigo-600 scale-110 shadow-indigo-200' : 'bg-indigo-500 hover:bg-indigo-600 hover:scale-105 shadow-indigo-100'}
            ${isLoadingAudio ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoadingAudio ? (
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 text-white transition-transform ${isPlaying ? 'scale-125' : 'scale-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        <div className="flex w-full justify-between items-center px-4">
          <button 
            onClick={onPrev}
            className="bg-amber-400 text-white font-kids px-6 py-3 rounded-2xl shadow-md active:bg-amber-500 transition-all hover:scale-105"
          >
            Back
          </button>
          <div className="flex gap-2">
            <span className={`w-3 h-3 rounded-full transition-all duration-300 ${isPlaying ? 'bg-indigo-400 scale-125' : 'bg-amber-400 scale-100'}`}></span>
            <span className="w-3 h-3 rounded-full bg-amber-200"></span>
            <span className="w-3 h-3 rounded-full bg-amber-200"></span>
          </div>
          <button 
            onClick={onNext}
            className="bg-green-500 text-white font-kids px-6 py-3 rounded-2xl shadow-md active:bg-green-600 transition-all hover:scale-105"
          >
            Next!
          </button>
        </div>
      </div>
    </div>
  );
};
