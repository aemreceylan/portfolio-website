import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMusicStore, resolveTrack } from './music.store';
import { musicService } from '#services/music.service';

vi.mock('#services/music.service', () => {
  const dummyTracks = {
    'spatial-glass': [
      { id: 'spatial-1', title: 'Spatial One', themeId: 'spatial-glass', bpm: 80, leadType: 'sine', leadNotes: [440] },
      { id: 'spatial-2', title: 'Spatial Two', themeId: 'spatial-glass', bpm: 90, leadType: 'sine', leadNotes: [523] },
    ],
    'cyberpunk-neon': [
      { id: 'cyber-1', title: 'Cyber One', themeId: 'cyberpunk-neon', bpm: 120, leadType: 'sawtooth', leadNotes: [330] },
      { id: 'cyber-2', title: 'Cyber Two', themeId: 'cyberpunk-neon', bpm: 130, leadType: 'sawtooth', leadNotes: [660] },
    ],
  };

  return {
    THEME_TRACKS: dummyTracks,
    musicService: {
      start: vi.fn(),
      stop: vi.fn(),
      setVolume: vi.fn(),
      getCurrentTrack: vi.fn(),
      getIsPlaying: vi.fn(),
    },
  };
});

describe('useMusicStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMusicStore.getState().reset();
  });

  afterEach(() => {
    useMusicStore.getState().reset();
  });

  it('initializes with default track and idle playing state', () => {
    const state = useMusicStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTrackIndex).toBe(0);
    expect(state.currentTrack.id).toBe('spatial-1');
  });

  it('toggles play and pause correctly', () => {
    // Start play
    useMusicStore.getState().togglePlay();
    expect(useMusicStore.getState().isPlaying).toBe(true);
    expect(musicService.start).toHaveBeenCalledWith(expect.objectContaining({ id: 'spatial-1' }));

    // Pause play
    useMusicStore.getState().togglePlay();
    expect(useMusicStore.getState().isPlaying).toBe(false);
    expect(musicService.stop).toHaveBeenCalled();
  });

  it('cycles to next track and starts playback if currently playing', () => {
    useMusicStore.getState().togglePlay();
    expect(useMusicStore.getState().isPlaying).toBe(true);

    useMusicStore.getState().nextTrack();
    expect(useMusicStore.getState().currentTrackIndex).toBe(1);
    expect(useMusicStore.getState().currentTrack.id).toBe('spatial-2');
    expect(musicService.start).toHaveBeenCalledWith(expect.objectContaining({ id: 'spatial-2' }));

    // Cycles back to 0
    useMusicStore.getState().nextTrack();
    expect(useMusicStore.getState().currentTrackIndex).toBe(0);
    expect(useMusicStore.getState().currentTrack.id).toBe('spatial-1');
  });

  it('switches theme and updates track', () => {
    useMusicStore.getState().setTheme('cyberpunk-neon');
    expect(useMusicStore.getState().activeThemeId).toBe('cyberpunk-neon');
    expect(useMusicStore.getState().currentTrack.id).toBe('cyber-1');
  });

  it('switches theme and automatically restarts track when playing', () => {
    useMusicStore.getState().togglePlay();
    useMusicStore.getState().setTheme('cyberpunk-neon');

    expect(useMusicStore.getState().activeThemeId).toBe('cyberpunk-neon');
    expect(useMusicStore.getState().currentTrack.id).toBe('cyber-1');
    expect(musicService.start).toHaveBeenCalledWith(expect.objectContaining({ id: 'cyber-1' }));
  });

  it('resolves track with fallback when unknown theme is requested', () => {
    const track = resolveTrack('unknown-theme', 0);
    expect(track.id).toBe('spatial-1');
  });

  it('stops and resets state cleanly', () => {
    useMusicStore.getState().togglePlay();
    useMusicStore.getState().stop();
    expect(useMusicStore.getState().isPlaying).toBe(false);

    useMusicStore.getState().reset();
    expect(useMusicStore.getState().currentTrackIndex).toBe(0);
    expect(useMusicStore.getState().activeThemeId).toBe('spatial-glass');
  });
});
