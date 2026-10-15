import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundControl } from './SoundControl';
import { useSoundStore } from '#stores/sound.store';

describe('SoundControl Component', () => {
  beforeEach(() => {
    useSoundStore.getState().reset();
    vi.clearAllMocks();
  });

  it('renders correctly with default volume', () => {
    render(<SoundControl />);
    expect(screen.getByTestId('statusbar-sound-control')).toBeInTheDocument();
    expect(screen.getByTestId('sound-toggle-btn')).toBeInTheDocument();
    const slider = screen.getByTestId('sound-volume-slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe('40');
  });

  it('toggles mute on button click', () => {
    render(<SoundControl />);
    const toggleBtn = screen.getByTestId('sound-toggle-btn');

    fireEvent.click(toggleBtn);
    expect(useSoundStore.getState().isMuted).toBe(true);

    const slider = screen.getByTestId('sound-volume-slider') as HTMLInputElement;
    expect(slider.value).toBe('0');

    fireEvent.click(toggleBtn);
    expect(useSoundStore.getState().isMuted).toBe(false);
    expect(slider.value).toBe('40');
  });

  it('adjusts volume when slider changes', () => {
    render(<SoundControl />);
    const slider = screen.getByTestId('sound-volume-slider') as HTMLInputElement;

    fireEvent.change(slider, { target: { value: '85' } });
    expect(useSoundStore.getState().volume).toBeCloseTo(0.85, 2);
    expect(slider.value).toBe('85');
  });

  it('plays volume tick preview on pointer up if unmuted', () => {
    const playSpy = vi.spyOn(useSoundStore.getState(), 'playSound');
    render(<SoundControl />);
    const slider = screen.getByTestId('sound-volume-slider');

    fireEvent.pointerUp(slider);
    expect(playSpy).toHaveBeenCalledWith('volume-tick');
  });
});
