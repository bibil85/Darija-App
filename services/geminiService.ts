import { getSharedAudioContext } from './soundService.ts';

function getAPIKey(): string {
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  const legacyKey = (window as unknown as { process?: { env?: { API_KEY?: string } } }).process?.env?.API_KEY;
  return (viteKey || legacyKey || '').trim();
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getAPIKey());
}

export async function generateDarijaAudio(darija: string, arabic?: string): Promise<string | null> {
  const apiKey = getAPIKey();
  if (!apiKey) return null;

  try {
    // Dynamic import keeps @google/genai out of the initial JS bundle!
    const { GoogleGenAI, Modality } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const promptText = arabic
      ? `Say this single Moroccan Darija word warmly and clearly for a toddler: "${arabic}" (${darija}). Say only the word.`
      : `Say this single Moroccan Darija word warmly and clearly for a toddler: "${darija}". Say only the word.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.warn('Gemini TTS failed, falling back to browser voice:', error);
    return null;
  }
}

/** Play 24kHz mono 16-bit PCM base64 audio using the shared iOS-safe AudioContext */
export async function playPCM(base64: string): Promise<void> {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataInt16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
  const sampleRate = 24000;
  const frameCount = dataInt16.length;
  const audioBuffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start();
  });
}
