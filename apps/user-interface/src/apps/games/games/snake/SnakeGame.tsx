import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Play, Pause } from 'lucide-react';
import { useThemeStore } from '#stores/theme.store';
import { gameSoundService } from '../../services/game-sound.service';
import { getGameThemeStyle } from '../../types';

interface Point {
  x: number;
  y: number;
}

interface BonusFood extends Point {
  timer: number;
  maxTimer: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 140; // ms per tick
const SPEED_STEP = 3;
const MIN_SPEED = 65;

export const SnakeGame: React.FC = () => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const themeStyle = getGameThemeStyle(currentTheme);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aec_game_snake_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'game-over'>('idle');

  // Game internal state kept in refs to avoid timer closures
  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const bonusFoodRef = useRef<BonusFood | null>(null);
  const foodEatenCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const spawnFood = (snake: Point[]): Point => {
    let newFood: Point;
    let collision: boolean;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      collision = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    } while (collision);
    return newFood;
  };

  const spawnBonusFood = (snake: Point[], regularFood: Point): BonusFood => {
    let newFood: Point;
    let collision: boolean;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      collision =
        snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
        (regularFood.x === newFood.x && regularFood.y === newFood.y);
    } while (collision);
    return { ...newFood, timer: 60, maxTimer: 60 };
  };

  const startGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = spawnFood(snakeRef.current);
    bonusFoodRef.current = null;
    foodEatenCountRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setGameState('playing');
    gameSoundService.play('game-start', currentTheme);
  }, [currentTheme]);

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

  const changeDirection = useCallback((dx: number, dy: number) => {
    const cur = dirRef.current;
    // Disallow 180-degree immediate turns
    if (cur.x + dx === 0 && cur.y + dy === 0) return;
    nextDirRef.current = { x: dx, y: dy };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing' || gameState === 'paused') {
          togglePause();
        } else if (gameState === 'idle' || gameState === 'game-over') {
          startGame();
        }
        return;
      }

      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          changeDirection(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          changeDirection(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          changeDirection(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          changeDirection(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, changeDirection, togglePause, startGame]);

  // Touch swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing') return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) changeDirection(1, 0);
      else if (dx < -20) changeDirection(-1, 0);
    } else {
      if (dy > 20) changeDirection(0, 1);
      else if (dy < -20) changeDirection(0, -1);
    }
  };

  // Main game tick loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const currentSpeed = Math.max(
      MIN_SPEED,
      INITIAL_SPEED - Math.floor(scoreRef.current / 40) * SPEED_STEP
    );

    const interval = setInterval(() => {
      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead: Point = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };

      // Boundary collision check
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        handleGameOver();
        return;
      }

      // Self collision check
      if (snakeRef.current.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        handleGameOver();
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];

      // Check regular food consumption
      let ateFood = false;
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        ateFood = true;
        foodEatenCountRef.current += 1;
        const newScore = scoreRef.current + 10;
        scoreRef.current = newScore;
        setScore(newScore);
        gameSoundService.play('snake-eat', currentTheme);

        foodRef.current = spawnFood(newSnake);

        // Spawn bonus food every 5 food items
        if (foodEatenCountRef.current % 5 === 0 && !bonusFoodRef.current) {
          bonusFoodRef.current = spawnBonusFood(newSnake, foodRef.current);
        }
      }

      // Check bonus food consumption
      if (
        bonusFoodRef.current &&
        newHead.x === bonusFoodRef.current.x &&
        newHead.y === bonusFoodRef.current.y
      ) {
        ateFood = true;
        const bonusPoints = 50 + bonusFoodRef.current.timer;
        const newScore = scoreRef.current + bonusPoints;
        scoreRef.current = newScore;
        setScore(newScore);
        gameSoundService.play('snake-bonus', currentTheme);
        bonusFoodRef.current = null;
      }

      // Tick bonus food countdown
      if (bonusFoodRef.current) {
        bonusFoodRef.current.timer -= 1;
        if (bonusFoodRef.current.timer <= 0) {
          bonusFoodRef.current = null;
        }
      }

      if (!ateFood) {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
    }, currentSpeed);

    return () => clearInterval(interval);
  }, [gameState, currentTheme]);

  const handleGameOver = () => {
    setGameState('game-over');
    gameSoundService.play('snake-die', currentTheme);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      try {
        localStorage.setItem('aec_game_snake_highscore', scoreRef.current.toString());
      } catch {
        // ignore storage errors
      }
      setTimeout(() => {
        gameSoundService.play('high-score', currentTheme);
      }, 350);
    }
  };

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = themeStyle.background;
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = themeStyle.gridLine;
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Regular food
      const food = foodRef.current;
      const fx = food.x * cellSize;
      const fy = food.y * cellSize;

      if (themeStyle.isRetroPixel) {
        // Classic Mac 1-bit pixel apple
        ctx.fillStyle = '#111827';
        ctx.fillRect(fx + 2, fy + 2, cellSize - 4, cellSize - 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx + 4, fy + 4, cellSize - 8, cellSize - 8);
        ctx.fillStyle = '#111827';
        ctx.fillRect(fx + 6, fy + 6, cellSize - 12, cellSize - 12);
      } else if (currentTheme === 'cyberpunk-neon') {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = themeStyle.accent;
        ctx.fillStyle = themeStyle.accent;
        ctx.beginPath();
        ctx.arc(fx + cellSize / 2, fy + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (currentTheme === 'swiss-industrial') {
        ctx.fillStyle = themeStyle.primary;
        ctx.fillRect(fx + 2, fy + 2, cellSize - 4, cellSize - 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx + cellSize / 2 - 1, fy + 4, 2, cellSize - 8);
        ctx.fillRect(fx + 4, fy + cellSize / 2 - 1, cellSize - 8, 2);
      } else {
        // Spatial Glass
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = themeStyle.primary;
        const grad = ctx.createRadialGradient(
          fx + cellSize / 2,
          fy + cellSize / 2,
          1,
          fx + cellSize / 2,
          fy + cellSize / 2,
          cellSize / 2
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, themeStyle.primary);
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fx + cellSize / 2, fy + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Bonus Food (Golden Apple with countdown ring)
      if (bonusFoodRef.current) {
        const bf = bonusFoodRef.current;
        const bx = bf.x * cellSize;
        const by = bf.y * cellSize;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#eab308';
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(bx + cellSize / 2, by + cellSize / 2, cellSize / 2 - 1, 0, Math.PI * 2);
        ctx.fill();

        // Progress countdown arc
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const progress = bf.timer / bf.maxTimer;
        ctx.arc(
          bx + cellSize / 2,
          by + cellSize / 2,
          cellSize / 2 + 2,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * progress
        );
        ctx.stroke();
        ctx.restore();
      }

      // Snake Body
      const snake = snakeRef.current;
      snake.forEach((seg, idx) => {
        const sx = seg.x * cellSize;
        const sy = seg.y * cellSize;
        const isHead = idx === 0;

        if (themeStyle.isRetroPixel) {
          // Classic Mac 1984 dither
          ctx.fillStyle = isHead ? '#000080' : idx % 2 === 0 ? '#1e293b' : '#475569';
          ctx.fillRect(sx + 1, sy + 1, cellSize - 2, cellSize - 2);
          if (isHead) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + 4, sy + 4, 3, 3);
          }
        } else if (currentTheme === 'cyberpunk-neon') {
          ctx.save();
          ctx.shadowBlur = isHead ? 14 : 8;
          ctx.shadowColor = isHead ? themeStyle.secondary : themeStyle.primary;
          ctx.fillStyle = isHead ? themeStyle.secondary : themeStyle.primary;
          ctx.fillRect(sx + 1.5, sy + 1.5, cellSize - 3, cellSize - 3);

          if (isHead) {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(sx + cellSize / 2 - 1.5, sy + cellSize / 2 - 1.5, 3, 3);
          }
          ctx.restore();
        } else if (currentTheme === 'swiss-industrial') {
          ctx.fillStyle = isHead ? '#ffffff' : '#94a3b8';
          ctx.fillRect(sx + 1, sy + 1, cellSize - 2, cellSize - 2);
          if (isHead) {
            ctx.fillStyle = themeStyle.primary;
            ctx.fillRect(sx + cellSize / 2 - 2, sy + cellSize / 2 - 2, 4, 4);
          }
        } else {
          // Spatial Glass
          ctx.save();
          ctx.shadowBlur = isHead ? 12 : 4;
          ctx.shadowColor = themeStyle.primary;
          ctx.fillStyle = isHead ? themeStyle.primary : 'rgba(56, 189, 248, 0.75)';
          const r = isHead ? 6 : 4;

          ctx.beginPath();
          ctx.roundRect(sx + 1.5, sy + 1.5, cellSize - 3, cellSize - 3, r);
          ctx.fill();

          if (isHead) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sx + cellSize / 2, sy + cellSize / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [themeStyle, currentTheme]);

  return (
    <div className="arcade-game-container snake-container" data-testid="snake-game-view">
      {/* HUD Info */}
      <div className="game-hud-bar">
        <div className="hud-metric">
          <span className="hud-label">SKOR</span>
          <span className="hud-val">{score}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-label">EN YÜKSEK</span>
          <span className="hud-val highlight">{highScore}</span>
        </div>
        <div className="hud-metric">
          <span className="hud-label">DURUM</span>
          <span className="hud-badge">{gameState.toUpperCase()}</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="game-canvas-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="arcade-canvas"
          data-testid="snake-canvas"
        />

        {/* Overlay States */}
        {gameState === 'idle' && (
          <div className="arcade-overlay">
            <h3>NEON SNAKE</h3>
            <p>Ok tuşları veya WASD ile yılanı yönlendir, yemleri toplayarak büyü!</p>
            <button
              type="button"
              className="arcade-btn primary"
              onClick={startGame}
              data-testid="snake-start-btn"
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
              data-testid="snake-resume-btn"
            >
              <Play size={16} /> Devam Et
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
              data-testid="snake-restart-btn"
            >
              <RotateCcw size={16} /> Tekrar Oyna
            </button>
          </div>
        )}
      </div>

      {/* Virtual D-Pad / Touch Controls */}
      <div className="arcade-touch-dpad">
        <div className="dpad-row">
          <button
            type="button"
            className="dpad-btn up"
            onClick={() => changeDirection(0, -1)}
            aria-label="Yukarı"
          >
            <ArrowUp size={20} />
          </button>
        </div>
        <div className="dpad-row middle">
          <button
            type="button"
            className="dpad-btn left"
            onClick={() => changeDirection(-1, 0)}
            aria-label="Sol"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            type="button"
            className="dpad-btn action"
            onClick={togglePause}
            aria-label="Duraklat"
          >
            {gameState === 'paused' ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            type="button"
            className="dpad-btn right"
            onClick={() => changeDirection(1, 0)}
            aria-label="Sağ"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="dpad-row">
          <button
            type="button"
            className="dpad-btn down"
            onClick={() => changeDirection(0, 1)}
            aria-label="Aşağı"
          >
            <ArrowDown size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
