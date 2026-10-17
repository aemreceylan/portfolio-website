import React from 'react';
import { Play, Pause, SkipForward, Loader2 } from 'lucide-react';
import { useMusicStore } from '#stores/music.store';
import { useTranslation } from '#i18n/i18n.store';

/**
 * Topbar Music Player with loading state indicator and animated equalizer bars.
 */
export const MusicPlayer: React.FC = () => {
  const { isPlaying, isLoading, currentTrack, togglePlay, nextTrack } = useMusicStore();
  const { t } = useTranslation();

  const getButtonLabel = () => {
    if (isLoading) return t('music_loading');
    if (isPlaying) return t('music_pause');
    return t('music_play');
  };

  const renderPlayIcon = () => {
    if (isLoading) {
      return (
        <Loader2
          size={13}
          className="music-player-spinner"
          data-testid="music-loading-spinner"
        />
      );
    }
    if (isPlaying) {
      return <Pause size={13} />;
    }
    return <Play size={13} />;
  };

  return (
    <div
      className={`statusbar-music-player ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
      data-testid="statusbar-music-player"
      role="region"
      aria-label="Music Player"
      title={`${currentTrack.title} (${currentTrack.bpm} BPM)`}
    >
      <button
        type="button"
        className={`music-player-btn play-pause-btn ${isLoading ? 'loading' : ''}`}
        onClick={togglePlay}
        title={getButtonLabel()}
        aria-label={getButtonLabel()}
        data-testid="music-play-btn"
      >
        {renderPlayIcon()}
      </button>

      <div
        className="music-eq-visualizer"
        aria-hidden="true"
        data-testid="music-eq"
      >
        <span className="eq-bar bar-1" />
        <span className="eq-bar bar-2" />
        <span className="eq-bar bar-3" />
        <span className="eq-bar bar-4" />
      </div>

      <span
        className="music-player-title"
        data-testid="music-title"
        title={`${currentTrack.title} (${currentTrack.bpm} BPM)`}
      >
        {currentTrack.title}
      </span>

      <button
        type="button"
        className="music-player-btn next-track-btn"
        onClick={nextTrack}
        title={t('music_next')}
        aria-label={t('music_next')}
        data-testid="music-next-btn"
      >
        <SkipForward size={13} />
      </button>
    </div>
  );
};
