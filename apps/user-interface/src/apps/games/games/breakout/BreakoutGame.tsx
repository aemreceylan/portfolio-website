import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Play, Pause, Heart } from 'lucide-react';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from '../../services/game-sound.service';
import { getGameThemeStyle } from '../../types';
import { getRandomSpread, getRandomSign, getRandomFloat } from '../../utils/random';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  hits: number;
  maxHits: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;

export const BreakoutGame: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeStyle = getGameThemeStyle(currentTheme);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aec_game_breakout_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'game-over' | 'victory'>('idle');

  // Internal physics and mutable refs
  const paddleXRef = useRef<number>(160);
  const ballPosRef = useRef<{ x: number; y: number }>({ x: 200, y: 320 });
  const ballVelRef = useRef<{ vx: number; vy: number }>({ vx: 3, vy: -3.5 });
  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const livesRef = useRef<number>(3);
  const scoreRef = useRef<number>(0);
  const keysDownRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Initialize Bricks Layout
  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const brickWidth = 44;
    const brickHeight = 16;
    const padding = 5;
    const offsetX = 8;
    const offsetY = 35;

    const rowColors = [
      currentTheme === 'cyberpunk-neon' ? '#f43f5e' : '#ef4444',
      currentTheme === 'cyberpunk-neon' ? '#facc15' : '#f59e0b',
      currentTheme === 'cyberpunk-neon' ? '#06b6d4' : '#38bdf8',
      currentTheme === 'cyberpunk-neon' ? '#a855f7' : '#10b981',
    ];

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: offsetX + c * (brickWidth + padding),
          y: offsetY + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          color: rowColors[r % rowColors.length],
          points: (BRICK_ROWS - r) * 15,
          hits: 1,
          maxHits: 1,
          alive: true,
        });
      }
    }
    return bricks;
  }, [currentTheme]);

  const startGame = useCallback(() => {
    paddleXRef.current = 160;
    ballPosRef.current = { x: 200, y: 320 };
    ballVelRef.current = { vx: getRandomSign() * 3, vy: -3.5 };
    bricksRef.current = initBricks();
    particlesRef.current = [];
    livesRef.current = 3;
    scoreRef.current = 0;
    setLives(3);
    setScore(0);
    setGameState('playing');
    gameSoundService.play('game-start', currentTheme);
  }, [currentTheme, initBricks]);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        } else if (gameState === 'idle' || gameState === 'game-over' || gameState === 'victory') {
          startGame();
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
  }, [gameState, togglePause, startGame]);

  // Pointer / Mouse move controls on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    paddleXRef.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, canvasX - PADDLE_WIDTH / 2));
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: getRandomSpread(6),
        vy: getRandomSpread(6),
        color,
        alpha: 1,
        size: getRandomFloat() * 3 + 2,
      });
    }
  };

  const updatePaddleMovement = (width: number) => {
    if (keysDownRef.current.left) {
      paddleXRef.current = Math.max(0, paddleXRef.current - 6.5);
    }
    if (keysDownRef.current.right) {
      paddleXRef.current = Math.min(width - PADDLE_WIDTH, paddleXRef.current + 6.5);
    }
  };

  const updateBallWallAndCeilingBounce = (width: number) => {
    const ball = ballPosRef.current;
    const vel = ballVelRef.current;

    // Side wall collisions
    if (ball.x - BALL_RADIUS <= 0) {
      ball.x = BALL_RADIUS;
      vel.vx = Math.abs(vel.vx);
      gameSoundService.play('paddle-bounce', currentTheme);
    } else if (ball.x + BALL_RADIUS >= width) {
      ball.x = width - BALL_RADIUS;
      vel.vx = -Math.abs(vel.vx);
      gameSoundService.play('paddle-bounce', currentTheme);
    }

    // Top ceiling collision
    if (ball.y - BALL_RADIUS <= 0) {
      ball.y = BALL_RADIUS;
      vel.vy = Math.abs(vel.vy);
      gameSoundService.play('paddle-bounce', currentTheme);
    }
  };

  const updatePaddleBounce = (height: number) => {
    const ball = ballPosRef.current;
    const vel = ballVelRef.current;
    const paddleY = height - 30;

    if (
      ball.y + BALL_RADIUS >= paddleY &&
      ball.y - BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
      ball.x >= paddleXRef.current &&
      ball.x <= paddleXRef.current + PADDLE_WIDTH &&
      vel.vy > 0
    ) {
      vel.vy = -Math.abs(vel.vy);
      const hitOffset = (ball.x - (paddleXRef.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      vel.vx = hitOffset * 4.5;
      gameSoundService.play('paddle-bounce', currentTheme);
    }
  };

  const handleBallLossAndFloor = (height: number): boolean => {
    const ball = ballPosRef.current;
    const vel = ballVelRef.current;

    if (ball.y - BALL_RADIUS <= height) return true;

    livesRef.current -= 1;
    setLives(livesRef.current);
    gameSoundService.play('life-lost', currentTheme);

    if (livesRef.current <= 0) {
      setGameState('game-over');
      gameSoundService.play('game-over', currentTheme);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('aec_game_breakout_highscore', scoreRef.current.toString());
        } catch {
          // ignore
        }
      }
      return false;
    }

    // Reset ball position on paddle
    ball.x = paddleXRef.current + PADDLE_WIDTH / 2;
    ball.y = height - 45;
    vel.vx = getRandomSign() * 3;
    vel.vy = -3.5;
    return true;
  };

  const updateBrickCollisionsAndVictory = () => {
    const ball = ballPosRef.current;
    const vel = ballVelRef.current;
    let remainingBricks = 0;

    bricksRef.current.forEach((brick) => {
      if (!brick.alive) return;
      remainingBricks += 1;

      // Simple AABB collision
      if (
        ball.x + BALL_RADIUS >= brick.x &&
        ball.x - BALL_RADIUS <= brick.x + brick.width &&
        ball.y + BALL_RADIUS >= brick.y &&
        ball.y - BALL_RADIUS <= brick.y + brick.height
      ) {
        brick.alive = false;
        vel.vy = -vel.vy;
        const newScore = scoreRef.current + brick.points;
        scoreRef.current = newScore;
        setScore(newScore);
        spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
        gameSoundService.play('brick-hit', currentTheme);
      }
    });

    if (remainingBricks === 0) {
      setGameState('victory');
      gameSoundService.play('level-clear', currentTheme);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('aec_game_breakout_highscore', scoreRef.current.toString());
        } catch {
          // ignore
        }
      }
    }
  };

  // Main game loop (physics + animation frame)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Update positions if playing
      if (gameState === 'playing') {
        updatePaddleMovement(width);

        // Ball movement
        ballPosRef.current.x += ballVelRef.current.vx;
        ballPosRef.current.y += ballVelRef.current.vy;

        updateBallWallAndCeilingBounce(width);
        updatePaddleBounce(height);

        const isStillAlive = handleBallLossAndFloor(height);
        if (!isStillAlive) return;

        updateBrickCollisionsAndVictory();

        // Update particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.035;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
      }

      // ---------------- RENDER PASS ----------------
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = themeStyle.background;
      ctx.fillRect(0, 0, width, height);

      // Bricks
      bricksRef.current.forEach((brick) => {
        if (!brick.alive) return;

        if (themeStyle.isRetroPixel) {
          // Classic Mac 1-bit brick with 3D drop bevel
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
          ctx.fillStyle = '#111827';
          ctx.fillRect(brick.x + 3, brick.y + 3, brick.width - 6, brick.height - 6);
        } else if (currentTheme === 'cyberpunk-neon') {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = brick.color;
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, 2);
          ctx.restore();
        } else if (currentTheme === 'swiss-industrial') {
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        } else {
          // Spatial Glass
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = brick.color;
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3);
          ctx.fill();
          ctx.restore();
        }
      });

      // Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      // Paddle
      const px = paddleXRef.current;
      const py = height - 30;

      if (themeStyle.isRetroPixel) {
        // Classic Mac 3D button paddle
        ctx.fillStyle = '#dcdfe5';
        ctx.fillRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT);
      } else if (currentTheme === 'cyberpunk-neon') {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = themeStyle.secondary;
        ctx.fillStyle = themeStyle.secondary;
        ctx.fillRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(px + PADDLE_WIDTH / 2 - 4, py + 2, 8, PADDLE_HEIGHT - 4);
        ctx.restore();
      } else if (currentTheme === 'swiss-industrial') {
        ctx.fillStyle = themeStyle.primary;
        ctx.fillRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + PADDLE_WIDTH / 2 - 2, py + 2, 4, PADDLE_HEIGHT - 4);
      } else {
        // Spatial Glass
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = themeStyle.primary;
        ctx.fillStyle = themeStyle.primary;
        ctx.beginPath();
        ctx.roundRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
        ctx.fill();
        ctx.restore();
      }

      // Ball
      const ball = ballPosRef.current;
      if (themeStyle.isRetroPixel) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(ball.x - BALL_RADIUS, ball.y - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2);
      } else if (currentTheme === 'cyberpunk-neon') {
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = themeStyle.accent;
        ctx.fillStyle = themeStyle.accent;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (currentTheme === 'swiss-industrial') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spatial Glass
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, themeStyle, currentTheme, highScore]);

  return (
    <div className="arcade-game-container breakout-container" data-testid="breakout-game-view">
      {/* HUD Bar */}
      <div className="game-hud-bar">
        <div className="hud-metric">
          <span className="hud-label">SKOR</span>
          <span className="hud-val">{score}</span>
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
          onPointerMove={handlePointerMove}
          data-testid="breakout-canvas"
        />

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="arcade-overlay">
            <h3>BRICK BREAKER</h3>
            <p>Fareyi hareket ettir veya Ok tuşlarını kullanarak tuğlaları kır!</p>
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="breakout-start-btn"
            >
              <Play size={16} /> Oyunu Başlat
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
              data-testid="breakout-resume-btn"
            >
              <Play size={16} /> Devam Et
            </button>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="arcade-overlay victory">
            <h3>TEBRİKLER! 🌟</h3>
            <p className="final-score">Tüm tuğlaları kırdınız! Skor: {score}</p>
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="breakout-restart-btn"
            >
              <RotateCcw size={16} /> Tekrar Oyna
            </button>
          </div>
        )}

        {gameState === 'game-over' && (
          <div className="arcade-overlay game-over">
            <h3>OYUN BİTTİ</h3>
            <p className="final-score">Skorunuz: {score}</p>
            {score >= highScore && score > 0 && (
              <span className="new-record-pill">YENİ REKOR! 🏆</span>
            )}
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="breakout-restart-btn"
            >
              <RotateCcw size={16} /> Tekrar Oyna
            </button>
          </div>
        )}
      </div>

      {/* Controls Bar for Touch */}
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
          aria-label="Sola Hareket"
        >
          <ArrowLeft size={18} /> Sol
        </button>
        <button
          type="button"
          className="arcade-ctrl-btn action"
          onClick={togglePause}
          aria-label="Duraklat"
        >
          {gameState === 'paused' ? <Play size={16} /> : <Pause size={16} />}
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
          aria-label="Sağa Hareket"
        >
          Sağ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
