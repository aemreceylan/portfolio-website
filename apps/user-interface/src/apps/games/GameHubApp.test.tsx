import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { GameHubApp } from './GameHubApp';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from './services/game-sound.service';

// Mock canvas getContext for tests
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    roundRect: vi.fn(),
    strokeRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  });

  vi.spyOn(gameSoundService, 'play').mockImplementation(() => {});
});

describe('GameHubApp', () => {
  beforeEach(() => {
    act(() => {
      useThemeStore.setState({ currentTheme: 'spatial-glass' });
    });
    localStorage.clear();
  });

  it('renders Game Hub arcade lobby with all 3 game cards', () => {
    render(<GameHubApp />);

    expect(screen.getByTestId('game-hub-app')).toBeInTheDocument();
    expect(screen.getByTestId('game-lobby')).toBeInTheDocument();
    expect(screen.getByText('RETRO & CYBER ARCADE')).toBeInTheDocument();

    // Game cards exist
    expect(screen.getByTestId('game-card-snake')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-breakout')).toBeInTheDocument();
    expect(screen.getByTestId('game-card-space-defender')).toBeInTheDocument();
  });

  it('can launch Snake game and return back to lobby', () => {
    render(<GameHubApp />);

    const playSnakeBtn = screen.getByTestId('play-btn-snake');
    fireEvent.click(playSnakeBtn);

    // Should switch to Snake game view
    expect(screen.getByTestId('snake-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('hub-back-to-lobby-btn')).toBeInTheDocument();

    // Click back to lobby
    fireEvent.click(screen.getByTestId('hub-back-to-lobby-btn'));
    expect(screen.getByTestId('game-lobby')).toBeInTheDocument();
  });

  it('can launch Breakout game and return back to lobby', () => {
    render(<GameHubApp />);

    const playBreakoutBtn = screen.getByTestId('play-btn-breakout');
    fireEvent.click(playBreakoutBtn);

    expect(screen.getByTestId('breakout-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('hub-back-to-lobby-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('hub-back-to-lobby-btn'));
    expect(screen.getByTestId('game-lobby')).toBeInTheDocument();
  });

  it('can launch Space Defender game and return back to lobby', () => {
    render(<GameHubApp />);

    const playSpaceBtn = screen.getByTestId('play-btn-space-defender');
    fireEvent.click(playSpaceBtn);

    expect(screen.getByTestId('space-defender-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('hub-back-to-lobby-btn')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('hub-back-to-lobby-btn'));
    expect(screen.getByTestId('game-lobby')).toBeInTheDocument();
  });

  it('allows toggling game sound mute and testing sound effect', () => {
    render(<GameHubApp />);

    const soundToggleBtn = screen.getByTestId('game-sound-toggle-btn');
    const testSoundBtn = screen.getByTestId('game-sound-test-btn');

    // Test sound
    fireEvent.click(testSoundBtn);
    expect(gameSoundService.play).toHaveBeenCalledWith('high-score', 'spatial-glass');

    // Toggle mute
    fireEvent.click(soundToggleBtn);
    expect(gameSoundService.isMuted()).toBe(true);

    // Toggle unmute
    fireEvent.click(soundToggleBtn);
    expect(gameSoundService.isMuted()).toBe(false);
  });

  it('adapts styles and colors dynamically when theme changes to cyberpunk-neon', () => {
    const { rerender } = render(<GameHubApp />);

    act(() => {
      useThemeStore.setState({ currentTheme: 'cyberpunk-neon' });
    });
    rerender(<GameHubApp />);

    const appContainer = screen.getByTestId('game-hub-app');
    expect(appContainer).toBeInTheDocument();
    expect(screen.getByText('cyberpunk-neon')).toBeInTheDocument();
  });

  it('adapts styles and colors dynamically when theme changes to classic-mac', () => {
    const { rerender } = render(<GameHubApp />);

    act(() => {
      useThemeStore.setState({ currentTheme: 'classic-mac' });
    });
    rerender(<GameHubApp />);

    expect(screen.getByText('classic-mac')).toBeInTheDocument();
  });

  it('allows resetting all high scores', () => {
    localStorage.setItem('aec_game_snake_highscore', '150');
    localStorage.setItem('aec_game_breakout_highscore', '300');
    localStorage.setItem('aec_game_spacedefender_highscore', '450');

    render(<GameHubApp />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('450')).toBeInTheDocument();

    const resetBtn = screen.getByTitle('Tüm rekorları sıfırla');
    fireEvent.click(resetBtn);

    expect(localStorage.getItem('aec_game_snake_highscore')).toBeNull();
    expect(localStorage.getItem('aec_game_breakout_highscore')).toBeNull();
    expect(localStorage.getItem('aec_game_spacedefender_highscore')).toBeNull();
  });
});
