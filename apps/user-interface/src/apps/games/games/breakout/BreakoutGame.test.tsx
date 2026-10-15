import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BreakoutGame } from './BreakoutGame';
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
  });

  vi.spyOn(gameSoundService, 'play').mockImplementation(() => {});
});

describe('BreakoutGame', () => {
  beforeEach(() => {
    useThemeStore.setState({ currentTheme: 'spatial-glass' });
    localStorage.clear();
  });

  it('renders Breakout game view, canvas, and start overlay', () => {
    render(<BreakoutGame />);

    expect(screen.getByTestId('breakout-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('breakout-canvas')).toBeInTheDocument();
    expect(screen.getByText('BRICK BREAKER')).toBeInTheDocument();
    expect(screen.getByTestId('breakout-start-btn')).toBeInTheDocument();
  });

  it('starts game and transitions to active play state', () => {
    render(<BreakoutGame />);

    const startBtn = screen.getByTestId('breakout-start-btn');
    fireEvent.click(startBtn);

    expect(gameSoundService.play).toHaveBeenCalledWith('game-start', 'spatial-glass');
    expect(screen.queryByTestId('breakout-start-btn')).not.toBeInTheDocument();
  });

  it('provides horizontal touch controls for paddle movement', () => {
    render(<BreakoutGame />);

    const leftCtrl = screen.getByLabelText('Sola Hareket');
    const rightCtrl = screen.getByLabelText('Sağa Hareket');

    expect(leftCtrl).toBeInTheDocument();
    expect(rightCtrl).toBeInTheDocument();

    fireEvent.pointerDown(leftCtrl);
    fireEvent.pointerUp(leftCtrl);
    fireEvent.pointerDown(rightCtrl);
    fireEvent.pointerUp(rightCtrl);
  });
});
