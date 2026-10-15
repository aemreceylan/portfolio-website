import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Volume2,
  VolumeX,
  ArrowLeft,
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from './services/game-sound.service';
import { GameId, getGameThemeStyle } from './types';
import { SnakeGame } from './games/snake/SnakeGame';
import { BreakoutGame } from './games/breakout/BreakoutGame';
import { SpaceDefenderGame } from './games/space-defender/SpaceDefenderGame';
import '#styles/game-hub.css';

interface GameMetadata {
  id: GameId;
  name: string;
  badge: string;
  desc: string;
  controls: string;
  icon: string;
}

const GAMES_LIST: GameMetadata[] = [
  {
    id: 'snake',
    name: 'Neon Snake',
    badge: 'Retro Klasik',
    desc: 'Yılanı yönlendir, yemleri toplayarak uzat ve altın elmaları yakala! Duvarlara veya kendine çarpma.',
    controls: 'Ok Tuşları / WASD / Ekran D-Pad',
    icon: '🐍',
  },
  {
    id: 'breakout',
    name: 'Brick Breaker',
    badge: 'Refleks & Fizik',
    desc: 'Paleti yönet, topu karşıla ve tüm tuğlaları parçala! Açılı vuruşlarla yüksek kombolar yap.',
    controls: 'Fare / Dokunma / Sol-Sağ Tuşları',
    icon: '🧱',
  },
  {
    id: 'space-defender',
    name: 'Space Defender',
    badge: 'Galaktik Savunma',
    desc: 'İstilacı uzay filolarını püskürt, lazerleri ateşle ve gezegeni savun! Her dalga daha hızlı.',
    controls: 'Boşluk (Space) / Ok Tuşları / Ateş Butonu',
    icon: '🚀',
  },
];

export const GameHubApp: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeStyle = getGameThemeStyle(currentTheme);

  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => gameSoundService.isMuted());
  const [volume, setVolume] = useState<number>(() => gameSoundService.getVolume());

  // High scores tracking
  const [highScores, setHighScores] = useState<Record<GameId, number>>({
    snake: 0,
    breakout: 0,
    'space-defender': 0,
  });

  const loadHighScores = () => {
    try {
      const snake = parseInt(localStorage.getItem('aec_game_snake_highscore') || '0', 10) || 0;
      const breakout = parseInt(localStorage.getItem('aec_game_breakout_highscore') || '0', 10) || 0;
      const space =
        parseInt(localStorage.getItem('aec_game_spacedefender_highscore') || '0', 10) || 0;
      setHighScores({
        snake,
        breakout,
        'space-defender': space,
      });
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    loadHighScores();
  }, [activeGame]);

  const toggleSoundMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    gameSoundService.setMuted(nextMuted);
    if (!nextMuted) {
      gameSoundService.play('ui-click', currentTheme);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    gameSoundService.setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
      gameSoundService.setMuted(false);
    }
  };

  const testSoundEffect = () => {
    gameSoundService.play('high-score', currentTheme);
  };

  const handleSelectGame = (gameId: GameId) => {
    gameSoundService.play('ui-click', currentTheme);
    setActiveGame(gameId);
  };

  const handleBackToLobby = () => {
    gameSoundService.play('ui-click', currentTheme);
    setActiveGame(null);
    loadHighScores();
  };

  const resetAllHighScores = () => {
    try {
      localStorage.removeItem('aec_game_snake_highscore');
      localStorage.removeItem('aec_game_breakout_highscore');
      localStorage.removeItem('aec_game_spacedefender_highscore');
      setHighScores({ snake: 0, breakout: 0, 'space-defender': 0 });
      gameSoundService.play('ui-click', currentTheme);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className="game-hub-container"
      data-testid="game-hub-app"
      style={{
        '--game-primary': themeStyle.primary,
        '--game-secondary': themeStyle.secondary,
        '--game-accent': themeStyle.accent,
        '--game-glow': themeStyle.glowColor,
      } as React.CSSProperties}
    >
      {/* Top Header / Bar */}
      <header className="game-hub-topbar">
        {activeGame ? (
          <div className="topbar-active-game">
            <button
              type="button"
              className="hub-back-btn"
              onClick={handleBackToLobby}
              data-testid="hub-back-to-lobby-btn"
            >
              <ArrowLeft size={16} /> Oyunlar
            </button>
            <span className="active-game-title">
              {GAMES_LIST.find((g) => g.id === activeGame)?.name}
            </span>
          </div>
        ) : (
          <div className="topbar-branding">
            <Gamepad2 size={20} className="topbar-icon" />
            <span className="topbar-title">Arcade Game Hub</span>
            <span className="theme-badge" title="Aktif Masaüstü Teması">
              {currentTheme}
            </span>
          </div>
        )}

        {/* Global Sound Controls */}
        <div className="game-audio-controls">
          <button
            type="button"
            className={`audio-btn ${isMuted ? 'muted' : ''}`}
            onClick={toggleSoundMute}
            aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            data-testid="game-sound-toggle-btn"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="game-volume-slider"
            aria-label="Oyun Ses Seviyesi"
            title={`Ses: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
          <button
            type="button"
            className="audio-test-btn"
            onClick={testSoundEffect}
            title="Temaya Uygun Ses Efektini Test Et"
            data-testid="game-sound-test-btn"
          >
            <Sparkles size={13} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="game-hub-body">
        {activeGame === null ? (
          <div className="game-lobby" data-testid="game-lobby">
            {/* Hero / Banner */}
            <section className="lobby-hero">
              <div className="hero-content">
                <h2>RETRO & CYBER ARCADE</h2>
                <p>
                  Temaya duyarlı renk paletleri ve saf Web Audio API sentezleyici ses efektleri ile
                  nostaljik işletim sistemi oyunları.
                </p>
              </div>

              {/* High Scores Summary */}
              <div className="lobby-score-summary">
                <div className="score-pill">
                  <span className="pill-icon">🐍</span>
                  <div className="pill-info">
                    <span className="pill-name">Snake</span>
                    <span className="pill-val">{highScores.snake}</span>
                  </div>
                </div>
                <div className="score-pill">
                  <span className="pill-icon">🧱</span>
                  <div className="pill-info">
                    <span className="pill-name">Breakout</span>
                    <span className="pill-val">{highScores.breakout}</span>
                  </div>
                </div>
                <div className="score-pill">
                  <span className="pill-icon">🚀</span>
                  <div className="pill-info">
                    <span className="pill-name">Defender</span>
                    <span className="pill-val">{highScores['space-defender']}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Games Grid */}
            <section className="games-grid" aria-label="Arcade Oyun Listesi">
              {GAMES_LIST.map((game) => {
                const gameScore = highScores[game.id];
                return (
                  <div
                    key={game.id}
                    className="game-card"
                    data-testid={`game-card-${game.id}`}
                  >
                    <div className="card-top">
                      <span className="card-badge">{game.badge}</span>
                      <span className="card-icon">{game.icon}</span>
                    </div>

                    <h3 className="card-title">{game.name}</h3>
                    <p className="card-desc">{game.desc}</p>

                    <div className="card-controls-info">
                      <span className="ctrl-label">Kontrol:</span>
                      <span className="ctrl-val">{game.controls}</span>
                    </div>

                    <div className="card-footer">
                      <div className="card-high-score">
                        <Trophy size={14} className="trophy-icon" />
                        <span>En İyi: {gameScore}</span>
                      </div>
                      <button
                        type="button"
                        className="play-game-btn"
                        onClick={() => handleSelectGame(game.id)}
                        data-testid={`play-btn-${game.id}`}
                      >
                        <Play size={14} /> Oyna
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Lobby Footer */}
            <footer className="lobby-footer">
              <span className="footer-tip">
                💡 İpucu: Temanızı <strong>Ayarlar</strong> uygulamasından (Classic Macintosh,
                Cyberpunk Neon, Swiss Industrial, Spatial Glass) değiştirdiğinizde oyunların görseli
                ve ses sentezleyici motoru anında adapte olur!
              </span>
              <button
                type="button"
                className="reset-scores-btn"
                onClick={resetAllHighScores}
                title="Tüm rekorları sıfırla"
              >
                <RotateCcw size={12} /> Rekorları Sıfırla
              </button>
            </footer>
          </div>
        ) : (
          <div className="active-game-viewport">
            {activeGame === 'snake' && <SnakeGame />}
            {activeGame === 'breakout' && <BreakoutGame />}
            {activeGame === 'space-defender' && <SpaceDefenderGame />}
          </div>
        )}
      </main>
    </div>
  );
};
export default GameHubApp;
