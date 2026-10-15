import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Zap, RotateCcw, Play, Heart } from 'lucide-react';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from '../../services/game-sound.service';
import { getGameThemeStyle } from '../../types';
import { getRandomSpread, getRandomFloat } from '../../utils/random';

interface Alien {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  alive: boolean;
  type: number;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
  isAlien?: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 16;
const ALIEN_ROWS = 3;
const ALIEN_COLS = 6;

export const SpaceDefenderGame: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeStyle = getGameThemeStyle(currentTheme);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aec_game_spacedefender_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'game-over'>('idle');

  // Internal mutable state
  const playerXRef = useRef<number>(180);
  const bulletsRef = useRef<Bullet[]>([]);
  const aliensRef = useRef<Alien[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const alienDirRef = useRef<number>(1);
  const alienSpeedRef = useRef<number>(1.2);
  const waveRef = useRef<number>(1);
  const livesRef = useRef<number>(3);
  const scoreRef = useRef<number>(0);
  const keysDownRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({
    left: false,
    right: false,
    shoot: false,
  });
  const lastShotTimeRef = useRef<number>(0);

  const initAliens = useCallback((currentWave: number) => {
    const aliens: Alien[] = [];
    const alienWidth = 30;
    const alienHeight = 18;
    const paddingX = 22;
    const paddingY = 16;
    const startX = 35;
    const startY = 30;

    const colors = [
      currentTheme === 'cyberpunk-neon' ? '#f43f5e' : '#f59e0b',
      currentTheme === 'cyberpunk-neon' ? '#facc15' : '#10b981',
      currentTheme === 'cyberpunk-neon' ? '#06b6d4' : '#38bdf8',
    ];

    for (let r = 0; r < ALIEN_ROWS; r++) {
      for (let c = 0; c < ALIEN_COLS; c++) {
        aliens.push({
          x: startX + c * (alienWidth + paddingX),
          y: startY + r * (alienHeight + paddingY),
          width: alienWidth,
          height: alienHeight,
          color: colors[r % colors.length],
          alive: true,
          type: r,
        });
      }
    }

    alienSpeedRef.current = 1.0 + currentWave * 0.25;
    alienDirRef.current = 1;
    return aliens;
  }, [currentTheme]);

  const startGame = useCallback(() => {
    playerXRef.current = 180;
    bulletsRef.current = [];
    sparksRef.current = [];
    livesRef.current = 3;
    scoreRef.current = 0;
    waveRef.current = 1;
    aliensRef.current = initAliens(1);
    setLives(3);
    setScore(0);
    setWave(1);
    setGameState('playing');
    gameSoundService.play('game-start', currentTheme);
  }, [currentTheme, initAliens]);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'playing') {
        gameSoundService.play('pause-toggle', currentTheme);
        return 'paused';
      }
      if (prev === 'paused') {
        gameSoundService.play('pause-toggle', currentTheme);
        return 'playing';
      }
      return prev;
    });
  }, [currentTheme]);

  const shootLaser = useCallback(() => {
    const now = performance.now();
    if (now - lastShotTimeRef.current < 250) return; // cooldown
    lastShotTimeRef.current = now;

    bulletsRef.current.push({
      x: playerXRef.current + PLAYER_WIDTH / 2,
      y: 350,
      vy: -7,
      isAlien: false,
    });
    gameSoundService.play('laser-shoot', currentTheme);
  }, [currentTheme]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        }
        return;
      }

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (gameState === 'idle' || gameState === 'game-over') {
          startGame();
        } else if (gameState === 'playing') {
          shootLaser();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysDownRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysDownRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysDownRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysDownRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause, startGame, shootLaser]);

  const spawnSparks = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      sparksRef.current.push({
        x,
        y,
        vx: getRandomSpread(6),
        vy: getRandomSpread(6),
        color,
        alpha: 1,
      });
    }
  };

  const updateAlienBulletsAndMovement = (width: number, height: number): boolean => {
    let shouldReverse = false;
    let lowestAlienY = 0;

    aliensRef.current.forEach((alien) => {
      if (!alien.alive) return;
      alien.x += alienDirRef.current * alienSpeedRef.current;
      if (alien.x <= 10 || alien.x + alien.width >= width - 10) {
        shouldReverse = true;
      }
      if (alien.y + alien.height > lowestAlienY) {
        lowestAlienY = alien.y + alien.height;
      }

      // Cryptographically secure alien firing
      if (getRandomFloat() < 0.002 * waveRef.current) {
        bulletsRef.current.push({
          x: alien.x + alien.width / 2,
          y: alien.y + alien.height,
          vy: 3.5,
          isAlien: true,
        });
      }
    });

    if (shouldReverse) {
      alienDirRef.current *= -1;
      aliensRef.current.forEach((alien) => {
        alien.y += 12;
      });
    }

    // Alien landing on player base
    if (lowestAlienY >= height - 55) {
      livesRef.current = 0;
      setLives(0);
      setGameState('game-over');
      gameSoundService.play('game-over', currentTheme);
      return false;
    }
    return true;
  };

  const checkPlayerBulletsVsAliens = () => {
    let liveAliensCount = 0;
    aliensRef.current.forEach((alien) => {
      if (!alien.alive) return;
      liveAliensCount += 1;

      bulletsRef.current.forEach((bullet) => {
        if (bullet.isAlien) return;
        if (
          bullet.x >= alien.x &&
          bullet.x <= alien.x + alien.width &&
          bullet.y >= alien.y &&
          bullet.y <= alien.y + alien.height
        ) {
          alien.alive = false;
          bullet.y = -100; // remove bullet
          const points = (3 - alien.type) * 20;
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);
          spawnSparks(alien.x + alien.width / 2, alien.y + alien.height / 2, alien.color);
          gameSoundService.play('alien-explode', currentTheme);
        }
      });
    });

    // Wave cleared
    if (liveAliensCount === 0) {
      waveRef.current += 1;
      setWave(waveRef.current);
      aliensRef.current = initAliens(waveRef.current);
      gameSoundService.play('wave-clear', currentTheme);
    }
  };

  const checkAlienBulletsVsPlayer = (height: number) => {
    const px = playerXRef.current;
    const py = height - 40;

    bulletsRef.current.forEach((bullet) => {
      if (!bullet.isAlien) return;
      if (
        bullet.x >= px &&
        bullet.x <= px + PLAYER_WIDTH &&
        bullet.y >= py &&
        bullet.y <= py + PLAYER_HEIGHT
      ) {
        bullet.y = height + 100; // remove bullet
        livesRef.current -= 1;
        setLives(livesRef.current);
        spawnSparks(px + PLAYER_WIDTH / 2, py, '#ef4444');
        gameSoundService.play('player-hit', currentTheme);

        if (livesRef.current <= 0) {
          setGameState('game-over');
          gameSoundService.play('game-over', currentTheme);
          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            try {
              localStorage.setItem('aec_game_spacedefender_highscore', scoreRef.current.toString());
            } catch {
              // ignore
            }
          }
        }
      }
    });
  };

  // Main game physics & rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const width = canvas.width;
      const height = canvas.height;

      if (gameState === 'playing') {
        // Player movement
        if (keysDownRef.current.left) {
          playerXRef.current = Math.max(10, playerXRef.current - 5);
        }
        if (keysDownRef.current.right) {
          playerXRef.current = Math.min(width - PLAYER_WIDTH - 10, playerXRef.current + 5);
        }

        // Bullets physics
        bulletsRef.current.forEach((b) => {
          b.y += b.vy;
        });
        bulletsRef.current = bulletsRef.current.filter((b) => b.y > 0 && b.y < height);

        const aliensStillActive = updateAlienBulletsAndMovement(width, height);
        if (!aliensStillActive) return;

        checkPlayerBulletsVsAliens();
        checkAlienBulletsVsPlayer(height);

        // Sparks physics
        sparksRef.current.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.alpha -= 0.04;
        });
        sparksRef.current = sparksRef.current.filter((s) => s.alpha > 0);
      }

      // ---------------- RENDER PASS ----------------
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = themeStyle.background;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = themeStyle.gridLine;
      for (let i = 0; i < 25; i++) {
        const sx = ((i * 73 + 17) % width);
        const sy = ((i * 47 + 29) % height);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Aliens
      aliensRef.current.forEach((alien) => {
        if (!alien.alive) return;

        if (themeStyle.isRetroPixel) {
          // Classic Mac 8-bit invader sprite
          ctx.fillStyle = '#111827';
          ctx.fillRect(alien.x + 4, alien.y, alien.width - 8, alien.height);
          ctx.fillRect(alien.x, alien.y + 4, alien.width, alien.height - 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(alien.x + 6, alien.y + 5, 4, 4);
          ctx.fillRect(alien.x + alien.width - 10, alien.y + 5, 4, 4);
        } else if (currentTheme === 'cyberpunk-neon') {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = alien.color;
          ctx.fillStyle = alien.color;
          // Cyber angular ship shape
          ctx.beginPath();
          ctx.moveTo(alien.x + alien.width / 2, alien.y + alien.height);
          ctx.lineTo(alien.x + alien.width, alien.y);
          ctx.lineTo(alien.x + alien.width * 0.7, alien.y + 4);
          ctx.lineTo(alien.x + alien.width * 0.3, alien.y + 4);
          ctx.lineTo(alien.x, alien.y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (currentTheme === 'swiss-industrial') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(alien.x, alien.y, alien.width, alien.height);
          ctx.fillStyle = alien.color;
          ctx.fillRect(alien.x + 4, alien.y + 4, alien.width - 8, alien.height - 8);
        } else {
          // Spatial Glass
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = alien.color;
          ctx.fillStyle = alien.color;
          ctx.beginPath();
          ctx.roundRect(alien.x, alien.y, alien.width, alien.height, 4);
          ctx.fill();
          ctx.restore();
        }
      });

      // Bullets
      bulletsRef.current.forEach((b) => {
        if (b.isAlien) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(b.x - 1.5, b.y, 3, 7);
        } else {
          if (currentTheme === 'cyberpunk-neon') {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#06b6d4';
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(b.x - 1.5, b.y, 3, 9);
            ctx.restore();
          } else if (currentTheme === 'swiss-industrial') {
            ctx.fillStyle = themeStyle.primary;
            ctx.fillRect(b.x - 1.5, b.y, 3, 8);
          } else {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(b.x - 1.5, b.y, 3, 8);
          }
        }
      });

      // Sparks
      sparksRef.current.forEach((s) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, 2.5, 2.5);
        ctx.restore();
      });

      // Player Ship
      const px = playerXRef.current;
      const py = height - 40;

      if (themeStyle.isRetroPixel) {
        // Classic Mac 8-bit ship
        ctx.fillStyle = '#111827';
        ctx.fillRect(px + 4, py + 8, PLAYER_WIDTH - 8, PLAYER_HEIGHT - 8);
        ctx.fillRect(px + PLAYER_WIDTH / 2 - 3, py, 6, PLAYER_HEIGHT);
      } else if (currentTheme === 'cyberpunk-neon') {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = themeStyle.secondary;
        ctx.fillStyle = themeStyle.secondary;
        ctx.beginPath();
        ctx.moveTo(px + PLAYER_WIDTH / 2, py);
        ctx.lineTo(px + PLAYER_WIDTH, py + PLAYER_HEIGHT);
        ctx.lineTo(px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT - 4);
        ctx.lineTo(px, py + PLAYER_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (currentTheme === 'swiss-industrial') {
        ctx.fillStyle = themeStyle.primary;
        ctx.beginPath();
        ctx.moveTo(px + PLAYER_WIDTH / 2, py);
        ctx.lineTo(px + PLAYER_WIDTH, py + PLAYER_HEIGHT);
        ctx.lineTo(px, py + PLAYER_HEIGHT);
        ctx.closePath();
        ctx.fill();
      } else {
        // Spatial Glass
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = themeStyle.primary;
        ctx.fillStyle = themeStyle.primary;
        ctx.beginPath();
        ctx.moveTo(px + PLAYER_WIDTH / 2, py);
        ctx.lineTo(px + PLAYER_WIDTH, py + PLAYER_HEIGHT);
        ctx.lineTo(px + PLAYER_WIDTH / 2, py + PLAYER_HEIGHT - 3);
        ctx.lineTo(px, py + PLAYER_HEIGHT);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, themeStyle, currentTheme, initAliens, highScore]);

  return (
    <div className="arcade-game-container space-container" data-testid="space-defender-game-view">
      {/* HUD Bar */}
      <div className="game-hud-bar">
        <div className="hud-metric">
          <span className="hud-label">SKOR</span>
          <span className="hud-val">{score}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-label">DALGA</span>
          <span className="hud-val highlight">W{wave}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-label">CAN</span>
          <div className="hud-lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                size={14}
                className={i < lives ? 'heart-active' : 'heart-empty'}
              />
            ))}
          </div>
        </div>
        <div className="hud-metric">
          <span className="hud-label">EN YÜKSEK</span>
          <span className="hud-val highlight">{highScore}</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="game-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="arcade-canvas"
          data-testid="space-canvas"
        />

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="arcade-overlay">
            <h3>SPACE DEFENDER</h3>
            <p>Ok tuşları ile gemiyi yönet, Boşluk (Space) tuşu ile lazerleri ateşle!</p>
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="space-start-btn"
            >
              <Play size={16} /> Göreve Başla
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="arcade-overlay">
            <h3>DURAKLATILDI</h3>
            <button
              type="button"
              className="arcade-btn primary"
              onClick={togglePause}
              data-testid="space-resume-btn"
            >
              <Play size={16} /> Devam Et
            </button>
          </div>
        )}

        {gameState === 'game-over' && (
          <div className="arcade-overlay game-over">
            <h3>GÖREV BAŞARISIZ</h3>
            <p className="final-score">Ulaşılan Dalga: W{wave} | Skor: {score}</p>
            {score >= highScore && score > 0 && (
              <span className="new-record-pill">YENİ REKOR! 🏆</span>
            )}
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="space-restart-btn"
            >
              <RotateCcw size={16} /> Tekrar Dene
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="arcade-horizontal-controls">
        <button
          type="button"
          className="arcade-ctrl-btn"
          onPointerDown={() => {
            keysDownRef.current.left = true;
          }}
          onPointerUp={() => {
            keysDownRef.current.left = false;
          }}
          aria-label="Sola Uç"
        >
          <ArrowLeft size={18} /> Sol
        </button>
        <button
          type="button"
          className="arcade-ctrl-btn shoot-btn"
          onClick={shootLaser}
          aria-label="Ateş Et"
        >
          <Zap size={18} /> ATEŞ
        </button>
        <button
          type="button"
          className="arcade-ctrl-btn"
          onPointerDown={() => {
            keysDownRef.current.right = true;
          }}
          onPointerUp={() => {
            keysDownRef.current.right = false;
          }}
          aria-label="Sağa Uç"
        >
          Sağ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
