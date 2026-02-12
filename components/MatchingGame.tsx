
import React, { useState, useEffect, useMemo } from 'react';
import { Word } from '../types';
import { INITIAL_WORDS } from '../constants';
import { generateDarijaAudio, playPCM } from '../services/geminiService';
import { playSuccessSound, playErrorSound } from '../services/soundService';

interface MatchingGameProps {
  onComplete: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ onComplete }) => {
  const gameWords = useMemo(() => {
    return [...INITIAL_WORDS].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [lastMatch, setLastMatch] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const shuffledWords = useMemo(() => {
    return [...gameWords].sort(() => 0.5 - Math.random());
  }, [gameWords]);

  useEffect(() => {
    if (selectedImage && selectedWord) {
      if (selectedImage === selectedWord) {
        setMatches(prev => [...prev, selectedImage]);
        setLastMatch(selectedImage);
        playSuccessSound();
        setSelectedImage(null);
        setSelectedWord(null);
        // Reset last match after animation
        setTimeout(() => setLastMatch(null), 1000);
      } else {
        setShake(true);
        playErrorSound();
        setTimeout(() => {
          setShake(false);
          setSelectedImage(null);
          setSelectedWord(null);
        }, 500);
      }
    }
  }, [selectedImage, selectedWord]);

  useEffect(() => {
    if (matches.length === gameWords.length && gameWords.length > 0) {
      setTimeout(() => {
        setIsFinished(true);
        setTimeout(onComplete, 2500);
      }, 1000);
    }
  }, [matches, gameWords, onComplete]);

  const handleWordClick = async (word: Word) => {
    setSelectedWord(word.id);
    const audioData = await generateDarijaAudio(word.darija);
    if (audioData) playPCM(audioData);
  };

  return (
    <div className={`flex flex-col gap-6 items-center w-full animate-in fade-in duration-500 ${shake ? 'animate-bounce' : ''}`}>
      <div className="text-center">
        <h2 className="text-2xl font-kids text-indigo-600 animate-pop">Match the Pairs!</h2>
        <p className="text-gray-500 font-bold">Tap an image, then the word!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-4">
          {gameWords.map(word => (
            <button
              key={`img-${word.id}`}
              disabled={matches.includes(word.id)}
              onClick={() => setSelectedImage(word.id)}
              className={`
                aspect-square rounded-2xl border-4 transition-all overflow-hidden relative
                ${matches.includes(word.id) ? 'border-green-400 opacity-50 grayscale' : 
                  selectedImage === word.id ? 'border-indigo-500 scale-105 shadow-xl rotate-1' : 'border-white shadow-md hover:border-amber-200'}
                ${lastMatch === word.id ? 'animate-pop ring-4 ring-green-400 ring-offset-2' : ''}
              `}
            >
              <img src={word.imageUrl} alt={word.english} className="w-full h-full object-cover" />
              {matches.includes(word.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-400 bg-opacity-20">
                  <span className="text-4xl animate-pop">✅</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {shuffledWords.map(word => (
            <button
              key={`word-${word.id}`}
              disabled={matches.includes(word.id)}
              onClick={() => handleWordClick(word)}
              className={`
                flex-grow rounded-2xl border-4 p-4 transition-all flex flex-col items-center justify-center min-h-[80px]
                ${matches.includes(word.id) ? 'bg-green-100 border-green-400 text-green-700' : 
                  selectedWord === word.id ? 'bg-indigo-100 border-indigo-500 text-indigo-700 scale-105 shadow-lg -rotate-1' : 'bg-white border-white shadow-md text-amber-700 hover:border-amber-200'}
                ${lastMatch === word.id ? 'animate-pop ring-4 ring-green-400 ring-offset-2' : ''}
              `}
            >
              <span className="text-2xl font-kids">{word.darija}</span>
              <span className="text-xs font-bold opacity-60">({word.phonetics})</span>
            </button>
          ))}
        </div>
      </div>

      {isFinished && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 pointer-events-none transition-all animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="text-9xl mb-4 animate-bounce">🧩🏆🎉</div>
            <h2 className="text-5xl font-kids text-green-500 mt-4 animate-pop">Mbraaaaak!</h2>
            <p className="text-2xl font-bold text-green-400">Great matching!</p>
            <div className="flex justify-center gap-2 mt-8">
               <div className="w-4 h-4 rounded-full bg-green-400 animate-ping"></div>
               <div className="w-4 h-4 rounded-full bg-green-400 animate-ping delay-75"></div>
               <div className="w-4 h-4 rounded-full bg-green-400 animate-ping delay-150"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
