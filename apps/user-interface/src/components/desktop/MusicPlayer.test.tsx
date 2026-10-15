import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MusicPlayer } from './MusicPlayer';
import { useMusicStore } from '#stores/music.store';

vi.mock('#services/music.service', () => ({
  THEME_TRACKS: {
    'spatial-glass': [
      { id: 'track-1', title: 'Orbit One', bpm: 80, leadType: 'sine', leadNotes: [440], src: '/audio/tracks/track1.mp3' },
      { id: 'track-2', title: 'Float Two', bpm: 90, leadType: 'sine', leadNotes: [520], src: '/audio/tracks/track2.mp3' },
    ],
  },
  musicService: {
    start: vi.fn(),
    stop: vi.fn(),
    setVolume: vi.fn(),
    getCurrentTrack: vi.fn(),
    getIsPlaying: vi.fn(),
    getIsLoading: vi.fn().mockReturnValue(false),
    subscribe: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('MusicPlayer Component', () => {
  beforeEach(() => {
    act(() => {
      useMusicStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it('renders correctly with default track title and controls', () => {
    render(<MusicPlayer />);
    expect(screen.getByTestId('statusbar-music-player')).toBeInTheDocument();
    expect(screen.getByTestId('music-play-btn')).toBeInTheDocument();
    expect(screen.getByTestId('music-next-btn')).toBeInTheDocument();
    expect(screen.getByTestId('music-title')).toHaveTextContent('Orbit One');
    expect(screen.getByTestId('music-eq')).toBeInTheDocument();
  });

  it('toggles playback on play button click', () => {
    render(<MusicPlayer />);
    const playBtn = screen.getByTestId('music-play-btn');

    // Click play (starts in loading transition)
    fireEvent.click(playBtn);
    expect(useMusicStore.getState().isPlaying).toBe(true);
    expect(screen.getByTestId('statusbar-music-player')).toHaveClass('playing');

    // Manually complete loading in test
    act(() => {
      useMusicStore.setState({ isLoading: false });
    });
    expect(screen.getByTestId('statusbar-music-player')).not.toHaveClass('loading');

    // Click pause
    fireEvent.click(playBtn);
    expect(useMusicStore.getState().isPlaying).toBe(false);
    expect(screen.getByTestId('statusbar-music-player')).not.toHaveClass('playing');
  });

  it('displays loading spinner and loading class while loading audio', () => {
    render(<MusicPlayer />);
    act(() => {
      useMusicStore.setState({ isLoading: true });
    });

    expect(screen.getByTestId('statusbar-music-player')).toHaveClass('loading');
    expect(screen.getByTestId('music-loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('music-play-btn')).toHaveAttribute('title', 'Loading Music...');

    // When loading finishes and music is playing
    act(() => {
      useMusicStore.setState({ isLoading: false, isPlaying: true });
    });
    expect(screen.getByTestId('statusbar-music-player')).not.toHaveClass('loading');
    expect(screen.getByTestId('statusbar-music-player')).toHaveClass('playing');
    expect(screen.queryByTestId('music-loading-spinner')).not.toBeInTheDocument();
  });

  it('switches to next track on next button click', () => {
    render(<MusicPlayer />);
    const nextBtn = screen.getByTestId('music-next-btn');

    fireEvent.click(nextBtn);
    expect(useMusicStore.getState().currentTrackIndex).toBe(1);
    expect(screen.getByTestId('music-title')).toHaveTextContent('Float Two');
  });
});
