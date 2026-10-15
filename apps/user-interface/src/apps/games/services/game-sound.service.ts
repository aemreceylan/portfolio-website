/**
 * Pure Web Audio API procedural sound synthesis engine for Arcade Game Hub.
 * Generates zero-asset, zero-latency, theme-reactive retro and modern sound effects.
 */

export type GameSoundType =
  | 'snake-move'
  | 'snake-eat'
  | 'snake-bonus'
  | 'snake-die'
  | 'paddle-bounce'
  | 'brick-hit'
  | 'life-lost'
  | 'level-clear'
  | 'laser-shoot'
  | 'alien-hit'
  | 'alien-explode'
  | 'player-hit'
  | 'wave-clear'
  | 'ui-click'
  | 'game-start'
  | 'game-over'
  | 'high-score'
  | 'pause-toggle';

interface AudioTone {
  freqStart: number;
  freqEnd: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  delayMs?: number;
}

type SoundPresetMap = Record<GameSoundType, AudioTone[]>;

/**
 * Sound profiles tailored by active desktop theme
 */
const THEME_PRESETS: Record<string, Partial<SoundPresetMap>> = {
  // 1. Classic Mac (8-bit NES / Chiptune Square Waves)
  'classic-mac': {
    'snake-move': [
      { freqStart: 220, freqEnd: 220, duration: 0.015, type: 'square', gain: 0.08 },
    ],
    'snake-eat': [
      { freqStart: 587.33, freqEnd: 587.33, duration: 0.04, type: 'square', gain: 0.2 },
      { freqStart: 880, freqEnd: 880, duration: 0.06, type: 'square', gain: 0.25, delayMs: 35 },
    ],
    'snake-bonus': [
      { freqStart: 523.25, freqEnd: 659.25, duration: 0.05, type: 'square', gain: 0.2 },
      { freqStart: 783.99, freqEnd: 1046.5, duration: 0.08, type: 'square', gain: 0.25, delayMs: 40 },
    ],
    'snake-die': [
      { freqStart: 440, freqEnd: 220, duration: 0.12, type: 'square', gain: 0.25 },
      { freqStart: 220, freqEnd: 110, duration: 0.18, type: 'square', gain: 0.25, delayMs: 100 },
    ],
    'paddle-bounce': [
      { freqStart: 440, freqEnd: 440, duration: 0.025, type: 'square', gain: 0.18 },
    ],
    'brick-hit': [
      { freqStart: 660, freqEnd: 880, duration: 0.035, type: 'square', gain: 0.2 },
    ],
    'life-lost': [
      { freqStart: 330, freqEnd: 165, duration: 0.15, type: 'square', gain: 0.25 },
    ],
    'level-clear': [
      { freqStart: 523, freqEnd: 523, duration: 0.06, type: 'square', gain: 0.2 },
      { freqStart: 659, freqEnd: 659, duration: 0.06, type: 'square', gain: 0.2, delayMs: 50 },
      { freqStart: 784, freqEnd: 784, duration: 0.06, type: 'square', gain: 0.22, delayMs: 100 },
      { freqStart: 1046, freqEnd: 1046, duration: 0.12, type: 'square', gain: 0.25, delayMs: 150 },
    ],
    'laser-shoot': [
      { freqStart: 987, freqEnd: 246, duration: 0.04, type: 'square', gain: 0.18 },
    ],
    'alien-hit': [
      { freqStart: 350, freqEnd: 120, duration: 0.05, type: 'square', gain: 0.22 },
    ],
    'alien-explode': [
      { freqStart: 250, freqEnd: 70, duration: 0.09, type: 'square', gain: 0.25 },
      { freqStart: 120, freqEnd: 50, duration: 0.1, type: 'triangle', gain: 0.25, delayMs: 30 },
    ],
    'player-hit': [
      { freqStart: 300, freqEnd: 100, duration: 0.18, type: 'square', gain: 0.3 },
    ],
    'wave-clear': [
      { freqStart: 440, freqEnd: 660, duration: 0.06, type: 'square', gain: 0.2 },
      { freqStart: 880, freqEnd: 1100, duration: 0.12, type: 'square', gain: 0.25, delayMs: 60 },
    ],
    'ui-click': [
      { freqStart: 600, freqEnd: 400, duration: 0.02, type: 'square', gain: 0.15 },
    ],
    'game-start': [
      { freqStart: 440, freqEnd: 660, duration: 0.05, type: 'square', gain: 0.2 },
      { freqStart: 880, freqEnd: 880, duration: 0.08, type: 'square', gain: 0.25, delayMs: 40 },
    ],
    'game-over': [
      { freqStart: 440, freqEnd: 330, duration: 0.1, type: 'square', gain: 0.25 },
      { freqStart: 330, freqEnd: 220, duration: 0.12, type: 'square', gain: 0.25, delayMs: 90 },
      { freqStart: 220, freqEnd: 110, duration: 0.2, type: 'square', gain: 0.25, delayMs: 190 },
    ],
    'high-score': [
      { freqStart: 523, freqEnd: 659, duration: 0.06, type: 'square', gain: 0.2 },
      { freqStart: 784, freqEnd: 1046, duration: 0.08, type: 'square', gain: 0.25, delayMs: 50 },
      { freqStart: 1318, freqEnd: 1568, duration: 0.15, type: 'square', gain: 0.3, delayMs: 120 },
    ],
    'pause-toggle': [
      { freqStart: 440, freqEnd: 550, duration: 0.04, type: 'square', gain: 0.18 },
    ],
  },

  // 2. Cyberpunk Neon (Aggressive Sawtooth / FM Cybernetics)
  'cyberpunk-neon': {
    'snake-move': [
      { freqStart: 600, freqEnd: 300, duration: 0.015, type: 'sawtooth', gain: 0.07 },
    ],
    'snake-eat': [
      { freqStart: 880, freqEnd: 1760, duration: 0.05, type: 'sawtooth', gain: 0.18 },
      { freqStart: 1760, freqEnd: 2200, duration: 0.06, type: 'sine', gain: 0.2, delayMs: 30 },
    ],
    'snake-bonus': [
      { freqStart: 700, freqEnd: 1400, duration: 0.05, type: 'sawtooth', gain: 0.2 },
      { freqStart: 1400, freqEnd: 2800, duration: 0.08, type: 'sawtooth', gain: 0.22, delayMs: 35 },
    ],
    'snake-die': [
      { freqStart: 900, freqEnd: 120, duration: 0.2, type: 'sawtooth', gain: 0.25 },
      { freqStart: 150, freqEnd: 40, duration: 0.25, type: 'sawtooth', gain: 0.3, delayMs: 80 },
    ],
    'paddle-bounce': [
      { freqStart: 650, freqEnd: 250, duration: 0.035, type: 'sawtooth', gain: 0.18 },
    ],
    'brick-hit': [
      { freqStart: 1100, freqEnd: 1600, duration: 0.04, type: 'sawtooth', gain: 0.2 },
    ],
    'life-lost': [
      { freqStart: 500, freqEnd: 100, duration: 0.18, type: 'sawtooth', gain: 0.25 },
    ],
    'level-clear': [
      { freqStart: 440, freqEnd: 880, duration: 0.05, type: 'sawtooth', gain: 0.18 },
      { freqStart: 880, freqEnd: 1760, duration: 0.06, type: 'sawtooth', gain: 0.2, delayMs: 40 },
      { freqStart: 1760, freqEnd: 2640, duration: 0.12, type: 'sawtooth', gain: 0.24, delayMs: 90 },
    ],
    'laser-shoot': [
      { freqStart: 1600, freqEnd: 300, duration: 0.045, type: 'sawtooth', gain: 0.18 },
    ],
    'alien-hit': [
      { freqStart: 800, freqEnd: 200, duration: 0.05, type: 'sawtooth', gain: 0.2 },
    ],
    'alien-explode': [
      { freqStart: 450, freqEnd: 60, duration: 0.12, type: 'sawtooth', gain: 0.28 },
      { freqStart: 100, freqEnd: 30, duration: 0.18, type: 'sawtooth', gain: 0.3, delayMs: 40 },
    ],
    'player-hit': [
      { freqStart: 800, freqEnd: 100, duration: 0.2, type: 'sawtooth', gain: 0.3 },
    ],
    'wave-clear': [
      { freqStart: 600, freqEnd: 1200, duration: 0.05, type: 'sawtooth', gain: 0.2 },
      { freqStart: 1200, freqEnd: 2400, duration: 0.1, type: 'sawtooth', gain: 0.25, delayMs: 45 },
    ],
    'ui-click': [
      { freqStart: 950, freqEnd: 650, duration: 0.025, type: 'sawtooth', gain: 0.14 },
    ],
    'game-start': [
      { freqStart: 400, freqEnd: 800, duration: 0.04, type: 'sawtooth', gain: 0.18 },
      { freqStart: 800, freqEnd: 1600, duration: 0.07, type: 'sawtooth', gain: 0.22, delayMs: 30 },
    ],
    'game-over': [
      { freqStart: 600, freqEnd: 200, duration: 0.12, type: 'sawtooth', gain: 0.25 },
      { freqStart: 250, freqEnd: 60, duration: 0.25, type: 'sawtooth', gain: 0.3, delayMs: 100 },
    ],
    'high-score': [
      { freqStart: 550, freqEnd: 1100, duration: 0.06, type: 'sawtooth', gain: 0.2 },
      { freqStart: 1100, freqEnd: 2200, duration: 0.08, type: 'sawtooth', gain: 0.25, delayMs: 50 },
      { freqStart: 2200, freqEnd: 3300, duration: 0.16, type: 'sawtooth', gain: 0.28, delayMs: 120 },
    ],
    'pause-toggle': [
      { freqStart: 700, freqEnd: 900, duration: 0.035, type: 'sawtooth', gain: 0.16 },
    ],
  },

  // 3. Swiss Industrial (Crisp Precision Triangle & Tactile Clicks)
  'swiss-industrial': {
    'snake-move': [
      { freqStart: 180, freqEnd: 90, duration: 0.012, type: 'triangle', gain: 0.1 },
    ],
    'snake-eat': [
      { freqStart: 440, freqEnd: 660, duration: 0.035, type: 'triangle', gain: 0.24 },
    ],
    'snake-bonus': [
      { freqStart: 350, freqEnd: 700, duration: 0.04, type: 'triangle', gain: 0.24 },
      { freqStart: 700, freqEnd: 1050, duration: 0.05, type: 'triangle', gain: 0.26, delayMs: 30 },
    ],
    'snake-die': [
      { freqStart: 220, freqEnd: 55, duration: 0.1, type: 'triangle', gain: 0.28 },
    ],
    'paddle-bounce': [
      { freqStart: 320, freqEnd: 120, duration: 0.02, type: 'triangle', gain: 0.22 },
    ],
    'brick-hit': [
      { freqStart: 500, freqEnd: 750, duration: 0.025, type: 'triangle', gain: 0.24 },
    ],
    'life-lost': [
      { freqStart: 240, freqEnd: 60, duration: 0.12, type: 'triangle', gain: 0.26 },
    ],
    'level-clear': [
      { freqStart: 300, freqEnd: 450, duration: 0.04, type: 'triangle', gain: 0.22 },
      { freqStart: 450, freqEnd: 600, duration: 0.04, type: 'triangle', gain: 0.24, delayMs: 35 },
      { freqStart: 600, freqEnd: 900, duration: 0.08, type: 'triangle', gain: 0.28, delayMs: 70 },
    ],
    'laser-shoot': [
      { freqStart: 700, freqEnd: 200, duration: 0.025, type: 'triangle', gain: 0.2 },
    ],
    'alien-hit': [
      { freqStart: 400, freqEnd: 150, duration: 0.035, type: 'triangle', gain: 0.24 },
    ],
    'alien-explode': [
      { freqStart: 180, freqEnd: 40, duration: 0.08, type: 'triangle', gain: 0.28 },
    ],
    'player-hit': [
      { freqStart: 250, freqEnd: 50, duration: 0.12, type: 'triangle', gain: 0.3 },
    ],
    'wave-clear': [
      { freqStart: 400, freqEnd: 800, duration: 0.05, type: 'triangle', gain: 0.25 },
    ],
    'ui-click': [
      { freqStart: 280, freqEnd: 140, duration: 0.018, type: 'triangle', gain: 0.2 },
    ],
    'game-start': [
      { freqStart: 220, freqEnd: 440, duration: 0.04, type: 'triangle', gain: 0.22 },
      { freqStart: 440, freqEnd: 660, duration: 0.05, type: 'triangle', gain: 0.26, delayMs: 30 },
    ],
    'game-over': [
      { freqStart: 220, freqEnd: 80, duration: 0.15, type: 'triangle', gain: 0.28 },
    ],
    'high-score': [
      { freqStart: 330, freqEnd: 440, duration: 0.04, type: 'triangle', gain: 0.22 },
      { freqStart: 440, freqEnd: 660, duration: 0.05, type: 'triangle', gain: 0.26, delayMs: 35 },
      { freqStart: 660, freqEnd: 990, duration: 0.1, type: 'triangle', gain: 0.3, delayMs: 80 },
    ],
    'pause-toggle': [
      { freqStart: 300, freqEnd: 300, duration: 0.025, type: 'triangle', gain: 0.2 },
    ],
  },

  // 4. Spatial Glass (Default: Pure Sine Waves, Resonant Chimes)
  'spatial-glass': {
    'snake-move': [
      { freqStart: 400, freqEnd: 320, duration: 0.015, type: 'sine', gain: 0.08 },
    ],
    'snake-eat': [
      { freqStart: 523.25, freqEnd: 659.25, duration: 0.04, type: 'sine', gain: 0.2 },
      { freqStart: 659.25, freqEnd: 1046.5, duration: 0.06, type: 'sine', gain: 0.22, delayMs: 30 },
    ],
    'snake-bonus': [
      { freqStart: 659.25, freqEnd: 880, duration: 0.04, type: 'sine', gain: 0.22 },
      { freqStart: 880, freqEnd: 1318.5, duration: 0.08, type: 'sine', gain: 0.25, delayMs: 35 },
    ],
    'snake-die': [
      { freqStart: 440, freqEnd: 160, duration: 0.15, type: 'sine', gain: 0.25 },
    ],
    'paddle-bounce': [
      { freqStart: 520, freqEnd: 380, duration: 0.025, type: 'sine', gain: 0.2 },
    ],
    'brick-hit': [
      { freqStart: 700, freqEnd: 950, duration: 0.035, type: 'sine', gain: 0.22 },
    ],
    'life-lost': [
      { freqStart: 380, freqEnd: 120, duration: 0.14, type: 'sine', gain: 0.25 },
    ],
    'level-clear': [
      { freqStart: 440, freqEnd: 554.37, duration: 0.05, type: 'sine', gain: 0.2 },
      { freqStart: 554.37, freqEnd: 659.25, duration: 0.05, type: 'sine', gain: 0.22, delayMs: 40 },
      { freqStart: 659.25, freqEnd: 880, duration: 0.1, type: 'sine', gain: 0.25, delayMs: 80 },
    ],
    'laser-shoot': [
      { freqStart: 1100, freqEnd: 440, duration: 0.035, type: 'sine', gain: 0.18 },
    ],
    'alien-hit': [
      { freqStart: 600, freqEnd: 240, duration: 0.04, type: 'sine', gain: 0.22 },
    ],
    'alien-explode': [
      { freqStart: 320, freqEnd: 80, duration: 0.1, type: 'sine', gain: 0.25 },
      { freqStart: 120, freqEnd: 40, duration: 0.12, type: 'triangle', gain: 0.2, delayMs: 25 },
    ],
    'player-hit': [
      { freqStart: 400, freqEnd: 90, duration: 0.16, type: 'sine', gain: 0.28 },
    ],
    'wave-clear': [
      { freqStart: 523, freqEnd: 784, duration: 0.05, type: 'sine', gain: 0.22 },
      { freqStart: 784, freqEnd: 1046, duration: 0.1, type: 'sine', gain: 0.25, delayMs: 45 },
    ],
    'ui-click': [
      { freqStart: 480, freqEnd: 240, duration: 0.02, type: 'sine', gain: 0.16 },
    ],
    'game-start': [
      { freqStart: 440, freqEnd: 550, duration: 0.04, type: 'sine', gain: 0.2 },
      { freqStart: 660, freqEnd: 880, duration: 0.07, type: 'sine', gain: 0.24, delayMs: 30 },
    ],
    'game-over': [
      { freqStart: 440, freqEnd: 260, duration: 0.1, type: 'sine', gain: 0.22 },
      { freqStart: 260, freqEnd: 130, duration: 0.18, type: 'sine', gain: 0.25, delayMs: 80 },
    ],
    'high-score': [
      { freqStart: 523, freqEnd: 659, duration: 0.05, type: 'sine', gain: 0.2 },
      { freqStart: 659, freqEnd: 784, duration: 0.06, type: 'sine', gain: 0.22, delayMs: 40 },
      { freqStart: 784, freqEnd: 1046, duration: 0.12, type: 'sine', gain: 0.26, delayMs: 90 },
    ],
    'pause-toggle': [
      { freqStart: 480, freqEnd: 600, duration: 0.03, type: 'sine', gain: 0.18 },
    ],
  },
};

export class GameSoundService {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.5;

  /**
   * Lazily initializes AudioContext upon first user interaction
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.ctx = new AudioCtxClass();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Synthesizes and plays a single tone
   */
  private playTone(
    ctx: AudioContext,
    tone: AudioTone,
    masterVolume: number,
    baseTime: number
  ): void {
    const startTime = baseTime + (tone.delayMs ? tone.delayMs / 1000 : 0);
    const stopTime = startTime + tone.duration;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = tone.type;
    osc.frequency.setValueAtTime(tone.freqStart, startTime);

    if (tone.freqEnd !== tone.freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.freqEnd), stopTime);
    }

    const peakGain = Math.max(0.0001, tone.gain * masterVolume);
    gainNode.gain.setValueAtTime(peakGain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(stopTime);
  }

  /**
   * Plays a procedural sound effect matching the given type and active theme.
   */
  public play(
    type: GameSoundType,
    theme = 'spatial-glass',
    customVolume?: number
  ): void {
    if (this.muted) return;
    const effectiveVol = customVolume !== undefined ? customVolume : this.volume;
    if (effectiveVol <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const themeMap = THEME_PRESETS[theme] || THEME_PRESETS['spatial-glass'] || {};
    const fallbackMap = THEME_PRESETS['spatial-glass'] || {};
    const tones = themeMap[type] || fallbackMap[type];

    if (!tones || tones.length === 0) return;

    const now = ctx.currentTime;
    tones.forEach((tone) => {
      this.playTone(ctx, tone, effectiveVol, now);
    });
  }
}

export const gameSoundService = new GameSoundService();
