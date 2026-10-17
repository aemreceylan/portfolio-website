import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SoundControl } from './SoundControl';
import { useSoundStore } from '#stores/sound.store';
import { useViewportStore } from '#stores/viewport.store';

describe('SoundControl Component', () => {
  beforeEach(() => {
    useSoundStore.getState().reset();
    useViewportStore.getState().reset();
    vi.clearAllMocks();
  });

  it('renders correctly with default volume on desktop', () => {
    render(<SoundControl />);
    expect(screen.getByTestId('statusbar-sound-control')).toBeInTheDocument();
    expect(screen.getByTestId('sound-toggle-btn')).toBeInTheDocument();
    const slider = screen.getByTestId('sound-volume-slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.value).toBe('40');
    expect(screen.queryByTestId('sound-popover-capsule')).not.toBeInTheDocument();
  });

  it('toggles mute on button click on desktop', () => {
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

  describe('Mobile Spatial Volume Popover Capsule', () => {
    beforeEach(() => {
      // Simulate mobile viewport (<768px)
      useViewportStore.getState().setDimensions(390, 844);
    });

    it('opens and closes vertical volume popover on mobile sound button click', () => {
      render(<SoundControl />);
      const toggleBtn = screen.getByTestId('sound-toggle-btn');

      expect(screen.queryByTestId('sound-popover-capsule')).not.toBeInTheDocument();

      // Open popover
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('sound-popover-capsule')).toBeInTheDocument();
      expect(screen.getByTestId('sound-popover-percent')).toHaveTextContent('40%');
      expect(screen.getByTestId('sound-popover-track')).toBeInTheDocument();
      expect(screen.getByTestId('sound-popover-mute-btn')).toBeInTheDocument();

      // Close popover
      fireEvent.click(toggleBtn);
      expect(screen.queryByTestId('sound-popover-capsule')).not.toBeInTheDocument();
    });

    it('toggles mute via popover mute button', () => {
      render(<SoundControl />);
      const toggleBtn = screen.getByTestId('sound-toggle-btn');
      fireEvent.click(toggleBtn);

      const muteBtn = screen.getByTestId('sound-popover-mute-btn');
      fireEvent.click(muteBtn);

      expect(useSoundStore.getState().isMuted).toBe(true);

      fireEvent.click(muteBtn);
      expect(useSoundStore.getState().isMuted).toBe(false);
    });

    it('always displays percentage in header even when muted to prevent layout shifts', () => {
      render(<SoundControl />);
      const toggleBtn = screen.getByTestId('sound-toggle-btn');
      fireEvent.click(toggleBtn);

      const percent = screen.getByTestId('sound-popover-percent');
      expect(percent).toHaveTextContent('40%');

      const muteBtn = screen.getByTestId('sound-popover-mute-btn');
      fireEvent.click(muteBtn);

      expect(useSoundStore.getState().isMuted).toBe(true);
      expect(percent).toHaveTextContent('0%');
    });

    it('supports keyboard navigation on vertical track', () => {
      render(<SoundControl />);
      fireEvent.click(screen.getByTestId('sound-toggle-btn'));

      const track = screen.getByTestId('sound-popover-track');

      fireEvent.keyDown(track, { key: 'ArrowUp' });
      expect(useSoundStore.getState().volume).toBeCloseTo(0.45, 2);

      fireEvent.keyDown(track, { key: 'ArrowDown' });
      expect(useSoundStore.getState().volume).toBeCloseTo(0.40, 2);

      fireEvent.keyDown(track, { key: 'Home' });
      expect(useSoundStore.getState().volume).toBe(0);

      fireEvent.keyDown(track, { key: 'End' });
      expect(useSoundStore.getState().volume).toBe(1);
    });

    it('closes popover on Escape key', () => {
      render(<SoundControl />);
      fireEvent.click(screen.getByTestId('sound-toggle-btn'));
      expect(screen.getByTestId('sound-popover-capsule')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('sound-popover-capsule')).not.toBeInTheDocument();
    });

    it('closes popover on outside pointer down', () => {
      render(<SoundControl />);
      fireEvent.click(screen.getByTestId('sound-toggle-btn'));
      expect(screen.getByTestId('sound-popover-capsule')).toBeInTheDocument();

      fireEvent.pointerDown(document.body);
      expect(screen.queryByTestId('sound-popover-capsule')).not.toBeInTheDocument();
    });
  });
});
