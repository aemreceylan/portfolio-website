import { create } from 'zustand';
import { soundService, SoundType } from '#services/sound.service';

export const SOUND_MUTED_STORAGE_KEY = 'aec_portfolio_sound_muted';
export const SOUND_VOLUME_STORAGE_KEY = 'aec_portfolio_sound_volume';

const DEFAULT_VOLUME = 0.4;

export interface SoundStoreState {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (val: number, previewSound?: boolean) => void;
  playSound: (type: SoundType) => void;
  reset: () => void;
}

/**
 * Safely resolves initial muted state from localStorage
 */
function resolveInitialMuted(): boolean {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(SOUND_MUTED_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // Ignore localStorage access errors
    }
  }
  return false;
}

/**
 * Safely resolves initial volume level from localStorage
 */
function resolveInitialVolume(): number {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(SOUND_VOLUME_STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }
  return DEFAULT_VOLUME;
}

export const useSoundStore = create<SoundStoreState>((set, get) => ({
  isMuted: resolveInitialMuted(),
  volume: resolveInitialVolume(),

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });
    try {
      localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(nextMuted));
    } catch {
      // Ignore storage errors
    }
    if (!nextMuted) {
      get().playSound('volume-tick');
    }
  },

  setMuted: (muted: boolean) => {
    set({ isMuted: muted });
    try {
      localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(muted));
    } catch {
      // Ignore storage errors
    }
  },

  setVolume: (val: number, previewSound = false) => {
    const clamped = Math.max(0, Math.min(1, val));
    const shouldUnmute = clamped > 0 && get().isMuted;
    const shouldMute = clamped === 0;

    const nextMuted = shouldMute || (shouldUnmute ? false : get().isMuted);

    set({ volume: clamped, isMuted: nextMuted });

    try {
      localStorage.setItem(SOUND_VOLUME_STORAGE_KEY, clamped.toFixed(2));
      localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(nextMuted));
    } catch {
      // Ignore storage errors
    }

    if (previewSound && !nextMuted && clamped > 0) {
      const currentTheme =
        (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) ||
        'spatial-glass';
      soundService.play('volume-tick', currentTheme, clamped);
    }
  },

  playSound: (type: SoundType) => {
    const { isMuted, volume } = get();
    if (isMuted || volume <= 0) return;

    const currentTheme =
      (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) ||
      'spatial-glass';
    soundService.play(type, currentTheme, volume);
  },

  reset: () => {
    set({ isMuted: false, volume: DEFAULT_VOLUME });
    try {
      localStorage.removeItem(SOUND_MUTED_STORAGE_KEY);
      localStorage.removeItem(SOUND_VOLUME_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  },
}));
