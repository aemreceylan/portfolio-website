import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SnakeGame } from './SnakeGame';
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
    createRadialGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  });

  vi.spyOn(gameSoundService, 'play').mockImplementation(() => {});
});

describe('SnakeGame', () => {
  beforeEach(() => {
    useThemeStore.setState({ currentTheme: 'spatial-glass' });
    localStorage.clear();
  });

  it('renders Snake game canvas and initial start overlay', () => {
    render(<SnakeGame />);

    expect(screen.getByTestId('snake-game-view')).toBeInTheDocument();
    expect(screen.getByTestId('snake-canvas')).toBeInTheDocument();
    expect(screen.getByText('NEON SNAKE')).toBeInTheDocument();
    expect(screen.getByTestId('snake-start-btn')).toBeInTheDocument();
  });

  it('starts game when start button is clicked and plays sound', () => {
    render(<SnakeGame />);

    const startBtn = screen.getByTestId('snake-start-btn');
    fireEvent.click(startBtn);

    expect(gameSoundService.play).toHaveBeenCalledWith('game-start', 'spatial-glass');
    expect(screen.queryByTestId('snake-start-btn')).not.toBeInTheDocument();
  });

  it('supports D-pad button navigation controls', () => {
    render(<SnakeGame />);

    const upBtn = screen.getByLabelText('Yukarı');
    const downBtn = screen.getByLabelText('Aşağı');
    const leftBtn = screen.getByLabelText('Sol');
    const rightBtn = screen.getByLabelText('Sağ');

    expect(upBtn).toBeInTheDocument();
    expect(downBtn).toBeInTheDocument();
    expect(leftBtn).toBeInTheDocument();
    expect(rightBtn).toBeInTheDocument();

    fireEvent.click(upBtn);
    fireEvent.click(leftBtn);
    fireEvent.click(downBtn);
    fireEvent.click(rightBtn);
  });
});
