
import React, { useState, useEffect, useMemo } from 'react';
import { Word } from '../types';
import { INITIAL_WORDS } from '../constants';
import { generateDarijaAudio, playPCM } from '../services/geminiService';
import { playSuccessSound, playErrorSound } from '../services/soundService';
import { WordImage } from './WordImage';

interface MemoryGameProps {
  onComplete: () => void;
}

interface MemoryCard {
  id: string;
  word: Word;
  type: 'image' | 'word';
  flipped: boolean;
  matched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const gameWords = useMemo(() => {
    return [...INITIAL_WORDS].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []);

  const cards = useMemo(() => {
    const cardPairs: MemoryCard[] = [];
    gameWords.forEach((word) => {
      cardPairs.push({ id: `img-${word.id}`, word, type: 'image', flipped: false, matched: false });
      cardPairs.push({ id: `word-${word.id}`, word, type: 'word', flipped: false, matched: false });
    });
    return cardPairs.sort(() => 0.5 - Math.random());
  }, [gameWords]);

  const [cardState, setCardState] = useState<MemoryCard[]>(cards);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (flippedIds.length === 2) {
      setIsChecking(true);
      const [first, second] = flippedIds;
      const firstCard = cardState.find(c => c.id === first)!;
      const secondCard = cardState.find(c => c.id === second)!;

      if (firstCard.word.id === secondCard.word.id && firstCard.type !== secondCard.type) {
        // Match found
        setTimeout(() => {
          playSuccessSound();
          playAudio(firstCard.word.darija);
          setCardState(prev => prev.map(c =>
            c.word.id === firstCard.word.id ? { ...c, matched: true, flipped: true } : c
          ));
          setFlippedIds([]);
          setIsChecking(false);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          playErrorSound();
          setCardState(prev => prev.map(c =>
            flippedIds.includes(c.id) && !c.matched ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          setIsChecking(false);
        }, 800);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedIds]);

  useEffect(() => {
    if (cardState.length > 0 && cardState.every(c => c.matched)) {
      setTimeout(() => {
        setIsFinished(true);
        setTimeout(onComplete, 2500);
      }, 500);
    }
  }, [cardState, onComplete]);

  const playAudio = async (text: string) => {
    const audioData = await generateDarijaAudio(text);
    if (audioData) playPCM(audioData);
  };

  const handleCardClick = (cardId: string) => {
    if (isChecking || flippedIds.length >= 2) return;
    const card = cardState.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    setCardState(prev => prev.map(c =>
      c.id === cardId ? { ...c, flipped: true } : c
    ));
    setFlippedIds(prev => [...prev, cardId]);
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-kids text-purple-600 animate-pop">Memory Match!</h2>
        <p className="text-gray-500 font-bold">Flip cards to find pairs!</p>
        <span className="text-sm font-bold text-purple-400">Moves: {moves}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {cardState.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-2xl transition-all duration-300 transform relative
              ${card.flipped || card.matched
                ? 'bg-white border-4 shadow-lg scale-100 ' + (card.matched ? 'border-green-400 opacity-70' : 'border-purple-400')
                : 'bg-gradient-to-br from-purple-400 to-indigo-500 border-4 border-purple-300 shadow-md hover:scale-105 active:scale-95'}
            `}
          >
            {card.flipped || card.matched ? (
              <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden rounded-xl">
                {card.type === 'image' ? (
                  <WordImage word={card.word} className="w-full h-full object-cover rounded-lg" emojiClassName="text-5xl" />
                ) : (
                  <div className="text-center">
                    <span className="text-lg font-kids text-purple-700 block leading-tight">{card.word.darija}</span>
                    <span className="text-xs text-gray-400 block">({card.word.phonetics})</span>
                  </div>
                )}
                {card.matched && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl animate-pop">⭐</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl">❓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {isFinished && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 pointer-events-none transition-all animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="text-9xl mb-4 animate-bounce">🧠🏆✨</div>
            <h2 className="text-5xl font-kids text-purple-600 mt-4 animate-pop">Mbraaaaak!</h2>
            <p className="text-2xl font-bold text-purple-400">Amazing memory!</p>
            <p className="text-lg font-bold text-gray-400 mt-2">Done in {moves} moves!</p>
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-4 h-4 rounded-full bg-purple-400 animate-ping"></div>
              <div className="w-4 h-4 rounded-full bg-purple-400 animate-ping delay-75"></div>
              <div className="w-4 h-4 rounded-full bg-purple-400 animate-ping delay-150"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
