import { create } from 'zustand';
import { musicService, THEME_TRACKS, TrackDefinition } from '#services/music.service';
import { useSoundStore } from '#stores/sound.store';
import { useThemeStore } from '#stores/theme.store';

export interface MusicStoreState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrackIndex: number;
  activeThemeId: string;
  currentTrack: TrackDefinition;
  togglePlay: () => void;
  nextTrack: () => void;
  setTheme: (themeId: string) => void;
  stop: () => void;
  reset: () => void;
}

/**
 * Resolves track definition safely with fallback to spatial-glass track 0
 */
export function resolveTrack(themeId: string, trackIndex: number): TrackDefinition {
  const tracks = THEME_TRACKS[themeId] || THEME_TRACKS['spatial-glass'];
  const safeIndex = Math.abs(trackIndex) % tracks.length;
  return tracks[safeIndex];
}

const initialTheme = typeof document !== 'undefined'
  ? document.documentElement.getAttribute('data-theme') || 'spatial-glass'
  : 'spatial-glass';

export const useMusicStore = create<MusicStoreState>((set, get) => ({
  isPlaying: false,
  isLoading: false,
  currentTrackIndex: 0,
  activeThemeId: initialTheme,
  currentTrack: resolveTrack(initialTheme, 0),

  togglePlay: () => {
    const { isPlaying, isLoading, activeThemeId, currentTrackIndex } = get();
    const soundStore = useSoundStore.getState();

    if (isPlaying || isLoading) {
      musicService.stop();
      set({ isPlaying: false, isLoading: false });
    } else {
      const track = resolveTrack(activeThemeId, currentTrackIndex);
      musicService.setVolume(soundStore.volume, soundStore.isMuted);
      set({ isPlaying: true, isLoading: Boolean(track.src), currentTrack: track });
      musicService.start(track);
    }
  },

  nextTrack: () => {
    const { isPlaying, activeThemeId, currentTrackIndex } = get();
    const nextIndex = (currentTrackIndex + 1) % 2;
    const nextTrackDef = resolveTrack(activeThemeId, nextIndex);

    set({
      currentTrackIndex: nextIndex,
      currentTrack: nextTrackDef,
      isLoading: isPlaying && Boolean(nextTrackDef.src),
    });

    if (isPlaying) {
      const soundStore = useSoundStore.getState();
      musicService.setVolume(soundStore.volume, soundStore.isMuted);
      musicService.start(nextTrackDef);
    }
  },

  setTheme: (themeId: string) => {
    const { isPlaying, currentTrackIndex } = get();
    const newTrack = resolveTrack(themeId, currentTrackIndex);

    set({
      activeThemeId: themeId,
      currentTrack: newTrack,
      isLoading: isPlaying && Boolean(newTrack.src),
    });

    if (isPlaying) {
      const soundStore = useSoundStore.getState();
      musicService.setVolume(soundStore.volume, soundStore.isMuted);
      musicService.start(newTrack);
    }
  },

  stop: () => {
    musicService.stop();
    set({ isPlaying: false, isLoading: false });
  },

  reset: () => {
    musicService.stop();
    const defaultTrack = resolveTrack('spatial-glass', 0);
    set({
      isPlaying: false,
      isLoading: false,
      currentTrackIndex: 0,
      activeThemeId: 'spatial-glass',
      currentTrack: defaultTrack,
    });
  },
}));

// Sync playback status (playing/loading) from musicService events
musicService.subscribe(({ isPlaying, isLoading }) => {
  useMusicStore.setState({ isPlaying, isLoading });
});

// Sync volume and mute changes with music service
useSoundStore.subscribe((state) => {
  musicService.setVolume(state.volume, state.isMuted);
});

// Sync active theme changes from useThemeStore
useThemeStore.subscribe((state) => {
  const currentMusicTheme = useMusicStore.getState().activeThemeId;
  if (state.currentTheme !== currentMusicTheme) {
    useMusicStore.getState().setTheme(state.currentTheme);
  }
});
