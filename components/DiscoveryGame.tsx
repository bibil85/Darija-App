
import React, { useState, useEffect, useMemo } from 'react';
import { Word } from '../types';
import { INITIAL_WORDS } from '../constants';
import { generateDarijaAudio, playPCM } from '../services/geminiService';
import { playSuccessSound, playErrorSound } from '../services/soundService';

interface DiscoveryGameProps {
  onComplete: () => void;
}

export const DiscoveryGame: React.FC<DiscoveryGameProps> = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const totalRounds = 5;

  const startNewRound = () => {
    const shuffled = [...INITIAL_WORDS].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const choices = shuffled.slice(0, 4).sort(() => 0.5 - Math.random());
    
    setTargetWord(target);
    setOptions(choices);
    setFeedback(null);
    
    setTimeout(() => playTargetAudio(target.darija), 500);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  const playTargetAudio = async (text: string) => {
    const audioData = await generateDarijaAudio(text);
    if (audioData) playPCM(audioData);
  };

  const handleChoice = (wordId: string) => {
    if (feedback === 'correct' || isFinished) return;

    if (wordId === targetWord?.id) {
      setFeedback('correct');
      playSuccessSound();
      
      if (round + 1 >= totalRounds) {
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(onComplete, 2500);
        }, 1000);
      } else {
        setTimeout(() => {
          setRound(prev => prev + 1);
          startNewRound();
        }, 1500);
      }
    } else {
      setFeedback('wrong');
      playErrorSound();
      setTimeout(() => setFeedback(null), 500);
    }
  };

  if (!targetWord) return null;

  return (
    <div className="flex flex-col gap-6 items-center w-full animate-in fade-in duration-500 relative">
      <div className="text-center">
        <h2 className="text-2xl font-kids text-indigo-600">Listen & Find! 👂</h2>
        <div className="flex items-center justify-center gap-4 mt-2">
          <button 
            onClick={() => playTargetAudio(targetWord.darija)}
            className="bg-indigo-500 p-4 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <span className="text-xl font-bold text-gray-500">Tap to hear again</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleChoice(opt.id)}
            className={`
              aspect-square rounded-3xl border-8 p-2 overflow-hidden transition-all transform active:scale-95
              ${feedback === 'correct' && opt.id === targetWord.id ? 'border-green-400 scale-105 shadow-xl rotate-3' : 
                feedback === 'wrong' && opt.id !== targetWord.id ? 'border-red-300 opacity-50' : 'border-white shadow-md'}
            `}
          >
            <img src={opt.imageUrl} alt="choice" className="w-full h-full object-cover rounded-2xl" />
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} className={`h-4 w-4 rounded-full ${i <= round ? 'bg-indigo-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {feedback === 'correct' && !isFinished && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-ping text-9xl">🌟</div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 pointer-events-none transition-all animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="text-9xl mb-4 animate-bounce">🎈🏆🎈</div>
            <h2 className="text-5xl font-kids text-indigo-600 mb-2">Mbraaaaak!</h2>
            <p className="text-2xl font-bold text-indigo-400">You found them all!</p>
            <div className="flex justify-center gap-4 mt-8">
              <span className="text-4xl animate-pulse delay-75">⭐</span>
              <span className="text-4xl animate-pulse delay-150">⭐</span>
              <span className="text-4xl animate-pulse delay-300">⭐</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
