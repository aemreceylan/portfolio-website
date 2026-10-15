import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSoundStore, SOUND_MUTED_STORAGE_KEY, SOUND_VOLUME_STORAGE_KEY } from './sound.store';
import { soundService } from '#services/sound.service';

vi.mock('#services/sound.service', () => ({
  soundService: {
    play: vi.fn(),
  },
}));

describe('useSoundStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSoundStore.getState().reset();
    vi.clearAllMocks();
  });

  it('initializes with default volume and unmuted state', () => {
    const state = useSoundStore.getState();
    expect(state.isMuted).toBe(false);
    expect(state.volume).toBeCloseTo(0.4, 2);
  });

  it('toggles mute on and off and updates localStorage', () => {
    useSoundStore.getState().toggleMute();
    expect(useSoundStore.getState().isMuted).toBe(true);
    expect(localStorage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('true');

    useSoundStore.getState().toggleMute();
    expect(useSoundStore.getState().isMuted).toBe(false);
    expect(localStorage.getItem(SOUND_MUTED_STORAGE_KEY)).toBe('false');
  });

  it('adjusts volume and un-mutes if volume dragged from 0', () => {
    useSoundStore.getState().setMuted(true);
    expect(useSoundStore.getState().isMuted).toBe(true);

    useSoundStore.getState().setVolume(0.8);
    expect(useSoundStore.getState().volume).toBeCloseTo(0.8, 2);
    expect(useSoundStore.getState().isMuted).toBe(false);
    expect(localStorage.getItem(SOUND_VOLUME_STORAGE_KEY)).toBe('0.80');
  });

  it('auto-mutes when volume is set to 0', () => {
    useSoundStore.getState().setVolume(0);
    expect(useSoundStore.getState().volume).toBe(0);
    expect(useSoundStore.getState().isMuted).toBe(true);
  });

  it('clamps volume between 0 and 1', () => {
    useSoundStore.getState().setVolume(1.5);
    expect(useSoundStore.getState().volume).toBe(1);

    useSoundStore.getState().setVolume(-0.5);
    expect(useSoundStore.getState().volume).toBe(0);
  });

  it('plays volume preview tick if previewSound is true and unmuted', () => {
    useSoundStore.getState().setVolume(0.7, true);
    expect(soundService.play).toHaveBeenCalledWith('volume-tick', expect.any(String), 0.7);
  });

  it('plays sounds when unmuted and does not play when muted', () => {
    useSoundStore.getState().playSound('click');
    expect(soundService.play).toHaveBeenCalledWith('click', expect.any(String), 0.4);

    vi.clearAllMocks();
    useSoundStore.getState().setMuted(true);
    useSoundStore.getState().playSound('click');
    expect(soundService.play).not.toHaveBeenCalled();
  });
});
