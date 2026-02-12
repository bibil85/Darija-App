
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Word } from '../types';
import { INITIAL_WORDS } from '../constants';
import { generateDarijaAudio, playPCM } from '../services/geminiService';
import { playSuccessSound, playErrorSound, playClickSound } from '../services/soundService';

interface NamingGameProps {
  onComplete: () => void;
}

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const NamingGame: React.FC<NamingGameProps> = ({ onComplete }) => {
  const [round, setRound] = useState(0);
  const [targetWord, setTargetWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const totalRounds = 5;

  const startNewRound = () => {
    const shuffled = [...INITIAL_WORDS].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const choices = shuffled.slice(0, 3).sort(() => 0.5 - Math.random());
    
    if (!choices.find(c => c.id === target.id)) {
        choices[Math.floor(Math.random() * choices.length)] = target;
    }
    
    setTargetWord(target);
    setOptions(choices);
    setFeedback(null);
    setTranscription('');
  };

  useEffect(() => {
    startNewRound();
    return () => stopListening();
  }, []);

  const stopListening = () => {
    setIsListening(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    playClickSound();
    setIsListening(true);
    setTranscription('Listening...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => (prev === 'Listening...' ? text : prev + text));
              
              // Simple normalization for basic Darija check
              const normalizedInput = text.toLowerCase().trim();
              const targetLower = targetWord?.darija.toLowerCase().trim() || '';
              const englishLower = targetWord?.english.toLowerCase().trim() || '';
              
              if (normalizedInput.includes(targetLower) || normalizedInput.includes(englishLower)) {
                handleVoiceCorrect();
                stopListening();
              }
            }
            if (message.serverContent?.turnComplete) {
                // If it wasn't correct by now, it might be wrong
                // but let's give the toddler a bit more time or let them try again
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            stopListening();
          },
          onclose: () => setIsListening(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: `You are a Moroccan Darija learning assistant. The user is a toddler trying to pronounce the word: "${targetWord?.darija}" (${targetWord?.english}). Please transcribe their speech accurately.`,
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Mic access denied", err);
      setIsListening(false);
      setTranscription('Mic error!');
    }
  };

  const handleVoiceCorrect = () => {
    if (feedback === 'correct') return;
    setFeedback('correct');
    playSuccessSound();
    proceedToNext();
  };

  const handleChoice = async (word: Word) => {
    if (feedback === 'correct' || isFinished) return;
    stopListening();

    const audioData = await generateDarijaAudio(word.darija);
    if (audioData) playPCM(audioData);

    if (word.id === targetWord?.id) {
      setFeedback('correct');
      playSuccessSound();
      proceedToNext();
    } else {
      setFeedback('wrong');
      playErrorSound();
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const proceedToNext = () => {
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
  };

  if (!targetWord) return null;

  return (
    <div className="flex flex-col gap-6 items-center w-full animate-in fade-in duration-500 relative">
      <div className="text-center">
        <h2 className="text-2xl font-kids text-rose-500">What's this? 🤔</h2>
      </div>

      <div className="w-full aspect-video bg-white rounded-3xl border-8 border-rose-100 overflow-hidden shadow-lg mb-2 relative group">
        <img src={targetWord.imageUrl} alt="target" className="w-full h-full object-cover" />
        
        {/* Voice Guess Button */}
        <button 
          onClick={startListening}
          className={`
            absolute bottom-4 right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90
            ${isListening ? 'bg-red-500 animate-pulse ring-4 ring-red-200' : 'bg-rose-500 hover:bg-rose-600'}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {isListening && (
        <div className="bg-rose-100 px-4 py-2 rounded-full animate-bounce">
          <p className="text-rose-600 font-bold text-sm">Say: <span className="font-kids">{targetWord.darija}</span>!</p>
        </div>
      )}

      {transcription && !feedback && (
        <div className="text-rose-400 font-bold italic animate-pop">
           "{transcription}"
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => handleChoice(opt)}
            className={`
              w-full py-5 rounded-2xl border-b-8 font-kids text-2xl transition-all active:translate-y-1 active:border-b-0
              ${feedback === 'correct' && opt.id === targetWord.id ? 'bg-green-400 border-green-600 text-white' : 
                feedback === 'wrong' && opt.id !== targetWord.id ? 'bg-gray-100 border-gray-300 text-gray-400' : 
                'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'}
            `}
          >
            {opt.darija}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} className={`h-3 w-8 rounded-full ${i <= round ? 'bg-rose-400' : 'bg-rose-50'}`} />
        ))}
      </div>

      {isFinished && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 pointer-events-none transition-all animate-in fade-in scale-100 duration-500">
          <div className="text-center">
            <div className="text-9xl mb-4 animate-bounce">🎨✨🌈</div>
            <h2 className="text-5xl font-kids text-rose-500 mb-2">Mbraaaaak!</h2>
            <p className="text-2xl font-bold text-rose-400">Excellent Work!</p>
            <div className="mt-10 flex justify-center gap-6">
               <div className="w-12 h-12 bg-yellow-400 rounded-full animate-ping shadow-lg"></div>
               <div className="w-12 h-12 bg-rose-400 rounded-full animate-ping delay-100 shadow-lg"></div>
               <div className="w-12 h-12 bg-indigo-400 rounded-full animate-ping delay-200 shadow-lg"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
