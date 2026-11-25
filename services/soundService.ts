// Shared iOS-friendly Web Audio API sound effects engine (single AudioContext)

let sharedCtx: AudioContext | null = null;
let sfxEnabled = true;

export function setSoundEffectsEnabled(enabled: boolean) {
  sfxEnabled = enabled;
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function playTone(
  freq: number,
  duration: number,
  startOffset = 0,
  volume = 0.08,
  type: OscillatorType = 'sine',
  endFreq?: number
) {
  if (!sfxEnabled) return;
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    // Ignore audio context edge errors
  }
}

/** Soft wooden tap for toddler buttons */
export const playClickSound = () => {
  playTone(680, 0.06, 0, 0.055, 'triangle', 920);
};

/** Playful soap bubble pop */
export const playPopSound = () => {
  playTone(320, 0.09, 0, 0.09, 'sine', 980);
  playTone(1100, 0.05, 0.04, 0.04, 'triangle', 1500);
};

/** Card flip whoosh/tick */
export const playFlipSound = () => {
  playTone(420, 0.07, 0, 0.05, 'sine', 640);
};

/** Cheerful marimba arpeggio on right answer */
export const playSuccessSound = () => {
  playTone(523.25, 0.14, 0, 0.09, 'triangle'); // C5
  playTone(659.25, 0.14, 0.08, 0.09, 'triangle'); // E5
  playTone(783.99, 0.2, 0.16, 0.1, 'triangle'); // G5
  playTone(1046.5, 0.28, 0.24, 0.09, 'sine'); // C6
};

/** Gentle playful "boing" (never harsh buzz) for wrong tap */
export const playGentleBoing = () => {
  playTone(280, 0.14, 0, 0.06, 'sine', 195);
  playTone(195, 0.16, 0.11, 0.05, 'sine', 240);
};

/** Keep backwards-compatible export name */
export const playErrorSound = playGentleBoing;

/** Celebratory fanfare at end of round/game */
export const playFanfareSound = () => {
  const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
  const offsets = [0, 0.1, 0.2, 0.3, 0.45, 0.56];
  const durations = [0.12, 0.12, 0.12, 0.16, 0.12, 0.38];
  notes.forEach((n, i) => {
    playTone(n, durations[i], offsets[i], 0.095, 'triangle');
  });
};
