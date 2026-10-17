import React, { useId, useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useSoundStore } from '#stores/sound.store';
import { useTranslation } from '#i18n/i18n.store';
import { useViewport } from '#stores/viewport.store';

/**
 * Pure helper to resolve button accessible tooltip and label without nested ternaries
 */
function getSoundButtonLabel(isMobile: boolean, isMuted: boolean, t: (key: 'sound_volume' | 'sound_unmute' | 'sound_mute') => string): string {
  if (isMobile) {
    return t('sound_volume');
  }
  return isMuted ? t('sound_unmute') : t('sound_mute');
}

/**
 * Pure helper to compute next volume on keyboard slider navigation
 */
function getNextVolumeFromKey(key: string, currentVolume: number): number | null {
  if (key === 'ArrowUp' || key === 'ArrowRight') {
    return Math.min(1, currentVolume + 0.05);
  }
  if (key === 'ArrowDown' || key === 'ArrowLeft') {
    return Math.max(0, currentVolume - 0.05);
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return 1;
  }
  return null;
}

/**
 * Renders appropriate Lucide volume icon based on level and muted status
 */
function VolumeIcon({ isMuted, volume, size = 14 }: { isMuted: boolean; volume: number; size?: number }) {
  if (isMuted || volume === 0) {
    return <VolumeX size={size} className="sound-icon muted" />;
  }
  if (volume < 0.5) {
    return <Volume1 size={size} className="sound-icon low" />;
  }
  return <Volume2 size={size} className="sound-icon normal" />;
}

/**
 * Sound control widget placed directly on the top status bar.
 * - On desktop: Displays a compact horizontal slider with quick mute toggle.
 * - On mobile: Tapping opens a thumb-friendly Spatial Vertical Volume Popover Capsule.
 */
export const SoundControl: React.FC = () => {
  const { isMuted, volume, toggleMute, setVolume } = useSoundStore();
  const { t } = useTranslation();
  const { isMobile } = useViewport();
  const sliderId = useId();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const currentPercent = isMuted ? 0 : Math.round(volume * 100);
  const buttonLabel = getSoundButtonLabel(isMobile, isMuted, t);

  // Close popover when switching viewport to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsPopoverOpen(false);
    }
  }, [isMobile]);

  // Click outside and Escape key handler for mobile volume popover
  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleClickOutside = (e: Event) => {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        controlRef.current &&
        !controlRef.current.contains(target)
      ) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPopoverOpen]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = Number(e.target.value) / 100;
    setVolume(nextVal, false);
  };

  const handleSliderPointerUp = () => {
    if (!isMuted && volume > 0) {
      useSoundStore.getState().playSound('volume-tick');
    }
  };

  const handleSoundBtnClick = () => {
    if (isMobile) {
      setIsPopoverOpen((prev) => !prev);
    } else {
      toggleMute();
    }
  };

  const calculateVolumeFromClientY = useCallback(
    (clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = (rect.bottom - clientY) / rect.height;
      const clamped = Math.max(0, Math.min(1, ratio));
      setVolume(clamped, false);
    },
    [setVolume]
  );

  const handleVerticalPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    calculateVolumeFromClientY(e.clientY);
  };

  const handleVerticalPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      calculateVolumeFromClientY(e.clientY);
    }
  };

  const handleVerticalPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may already have been released
      }
      if (!isMuted && volume > 0) {
        useSoundStore.getState().playSound('volume-tick');
      }
    }
  };

  const handleVerticalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const next = getNextVolumeFromKey(e.key, volume);
    if (next !== null) {
      e.preventDefault();
      setVolume(next, true);
    }
  };

  return (
    <div
      ref={controlRef}
      className={`statusbar-sound-control ${isPopoverOpen ? 'popover-active' : ''}`}
      data-testid="statusbar-sound-control"
      role="region"
      aria-label={t('sound_volume')}
    >
      <button
        type="button"
        className={`sound-toggle-btn ${isMuted ? 'muted' : ''} ${isPopoverOpen ? 'active' : ''}`}
        onClick={handleSoundBtnClick}
        title={buttonLabel}
        aria-label={buttonLabel}
        aria-expanded={isMobile ? isPopoverOpen : undefined}
        aria-haspopup={isMobile ? 'dialog' : undefined}
        data-testid="sound-toggle-btn"
      >
        <VolumeIcon isMuted={isMuted} volume={volume} size={14} />
      </button>

      <div className="sound-slider-wrapper">
        <label htmlFor={sliderId} className="sr-only">
          {t('sound_volume')}
        </label>
        <input
          id={sliderId}
          type="range"
          min="0"
          max="100"
          step="1"
          value={currentPercent}
          onChange={handleSliderChange}
          onPointerUp={handleSliderPointerUp}
          className="sound-volume-slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={currentPercent}
          aria-label={t('sound_volume')}
          title={`${t('sound_volume')}: ${currentPercent}%`}
          data-testid="sound-volume-slider"
          style={{
            backgroundSize: `${currentPercent}% 100%`,
          }}
        />
      </div>

      {/* Mobile Spatial Vertical Volume Capsule */}
      {isMobile && isPopoverOpen && (
        <div
          ref={popoverRef}
          className="sound-popover-capsule"
          data-testid="sound-popover-capsule"
          role="dialog"
          aria-label={t('sound_volume')}
        >
          <div className="sound-popover-header" data-testid="sound-popover-percent">
            {currentPercent}%
          </div>

          <div
            ref={trackRef}
            className="sound-popover-track"
            data-testid="sound-popover-track"
            role="slider"
            tabIndex={0}
            aria-label={t('sound_volume')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={currentPercent}
            onPointerDown={handleVerticalPointerDown}
            onPointerMove={handleVerticalPointerMove}
            onPointerUp={handleVerticalPointerUp}
            onPointerCancel={handleVerticalPointerUp}
            onKeyDown={handleVerticalKeyDown}
          >
            <div
              className="sound-popover-fill"
              data-testid="sound-popover-fill"
              style={{ height: `${currentPercent}%` }}
            />
            <div className="sound-popover-icon-wrapper" aria-hidden="true">
              <VolumeIcon isMuted={isMuted} volume={volume} size={18} />
            </div>
          </div>

          <button
            type="button"
            className={`sound-popover-mute-btn ${isMuted ? 'muted' : ''}`}
            onClick={toggleMute}
            data-testid="sound-popover-mute-btn"
          >
            {isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{isMuted ? t('sound_unmute') : t('sound_mute')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
