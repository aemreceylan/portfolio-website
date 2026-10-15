import React, { useId } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useSoundStore } from '#stores/sound.store';
import { useTranslation } from '#i18n/i18n.store';

/**
 * Sound control widget placed directly on the top status bar.
 * Supports quick mute/unmute toggle and draggable volume slider.
 */
export const SoundControl: React.FC = () => {
  const { isMuted, volume, toggleMute, setVolume } = useSoundStore();
  const { t } = useTranslation();
  const sliderId = useId();

  const currentPercent = isMuted ? 0 : Math.round(volume * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = Number(e.target.value) / 100;
    setVolume(nextVal, false);
  };

  const handleSliderPointerUp = () => {
    if (!isMuted && volume > 0) {
      useSoundStore.getState().playSound('volume-tick');
    }
  };

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX size={14} className="sound-icon muted" />;
    }
    if (volume < 0.5) {
      return <Volume1 size={14} className="sound-icon low" />;
    }
    return <Volume2 size={14} className="sound-icon normal" />;
  };

  return (
    <div
      className="statusbar-sound-control"
      data-testid="statusbar-sound-control"
      role="region"
      aria-label={t('sound_volume')}
    >
      <button
        type="button"
        className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
        onClick={toggleMute}
        title={isMuted ? t('sound_unmute') : t('sound_mute')}
        aria-label={isMuted ? t('sound_unmute') : t('sound_mute')}
        data-testid="sound-toggle-btn"
      >
        {renderVolumeIcon()}
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
    </div>
  );
};
