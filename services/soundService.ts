import { SoundFXEngine } from '../src/audio/SoundFXEngine.ts';

// Clean facade delegating all sound calls to the master compressed SoundFXEngine
export function setSoundEffectsEnabled(enabled: boolean) {
  SoundFXEngine.setEnabled(enabled);
}

export function getSharedAudioContext(): AudioContext | null {
  return SoundFXEngine.getContext();
}

export const playClickSound = (panX = 0) => SoundFXEngine.playClick(panX);
export const playPopSound = (scale = 1, panX = 0) => SoundFXEngine.playBubblePop(scale, panX);
export const playFlipSound = (direction: -1 | 1 = 1) => SoundFXEngine.playWhoosh(direction);
export const playSuccessSound = (comboIndex = 0, panX = 0) => SoundFXEngine.playSparkleCascade(comboIndex, panX);
export const playGentleBoing = (panX = 0) => SoundFXEngine.playSoftWoodblock(panX);
export const playSpringBoing = (velocity = 1, panX = 0) => SoundFXEngine.playSpringBoing(velocity, panX);
export const playErrorSound = playGentleBoing;
export const playFanfareSound = () => SoundFXEngine.playFanfare();
