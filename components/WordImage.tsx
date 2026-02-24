
import React, { useState } from 'react';
import { Word } from '../types';

interface WordImageProps {
  word: Word;
  className?: string;
  emojiClassName?: string;
}

export const WordImage: React.FC<WordImageProps> = ({ word, className = '', emojiClassName = 'text-8xl' }) => {
  const [error, setError] = useState(false);

  if (error) {
    return <span className={emojiClassName}>{word.emoji}</span>;
  }

  return (
    <img
      src={word.imageUrl}
      alt={word.english}
      onError={() => setError(true)}
      className={className}
    />
  );
};
