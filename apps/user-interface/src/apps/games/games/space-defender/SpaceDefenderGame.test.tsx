import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SpaceDefenderGame } from './SpaceDefenderGame';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from '../../services/game-sound.service';

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
    closePath: vi.fn(),
  });

  vi.spyOn(gameSoundService, 'play').mockImplementation(() => {});
});

describe('SpaceDefenderGame', () => {
  beforeEach(() => {
    useThemeStore.setState({ currentTheme: 'spatial-glass' });
    localStorage.clear();
  });

  it('renders Space Defender view, canvas, and mission start overlay', () => {
    render(<SpaceDefenderGame />);

    expect(screen.getByTestId('space-defender-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('space-canvas')).toBeInTheDocument();
    expect(screen.getByText('SPACE DEFENDER')).toBeInTheDocument();
    expect(screen.getByTestId('space-start-btn')).toBeInTheDocument();
  });

  it('starts mission and transitions to active battle state', () => {
    render(<SpaceDefenderGame />);

    const startBtn = screen.getByTestId('space-start-btn');
    fireEvent.click(startBtn);

    expect(gameSoundService.play).toHaveBeenCalledWith('game-start', 'spatial-glass');
    expect(screen.queryByTestId('space-start-btn')).not.toBeInTheDocument();
  });

  it('supports shooting laser via fire button', () => {
    render(<SpaceDefenderGame />);

    const startBtn = screen.getByTestId('space-start-btn');
    fireEvent.click(startBtn);

    const shootBtn = screen.getByLabelText('Ateş Et');
    expect(shootBtn).toBeInTheDocument();

    fireEvent.click(shootBtn);
    expect(gameSoundService.play).toHaveBeenCalledWith('laser-shoot', 'spatial-glass');
  });
});
