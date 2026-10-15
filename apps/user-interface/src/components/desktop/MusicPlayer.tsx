import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { useMusicStore } from '#stores/music.store';
import { useTranslation } from '#i18n/i18n.store';

/**
 * Procedural Web Audio Topbar Music Player.
 * Features track playback controls, track title display, and animated equalizer bars.
 */
export const MusicPlayer: React.FC = () => {
  const { isPlaying, currentTrack, togglePlay, nextTrack } = useMusicStore();
  const { t } = useTranslation();

  return (
    <div
      className={`statusbar-music-player ${isPlaying ? 'playing' : ''}`}
      data-testid="statusbar-music-player"
      role="region"
      aria-label="Music Player"
    >
      <button
        type="button"
        className="music-player-btn play-pause-btn"
        onClick={togglePlay}
        title={isPlaying ? t('music_pause') : t('music_play')}
        aria-label={isPlaying ? t('music_pause') : t('music_play')}
        data-testid="music-play-btn"
      >
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
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
