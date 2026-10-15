/**
 * Sound synthesis engine using pure Web Audio API.
 * Provides zero-asset, zero-latency procedural UI sound generation for NovaOS/AEC WebOS.
 */

export type SoundType =
  | 'click'
  | 'window-open'
  | 'window-close'
  | 'window-minimize'
  | 'window-maximize'
  | 'window-restore'
  | 'volume-tick'
  | 'theme-switch';

interface ToneSpec {
  freqStart: number;
  freqEnd: number;
  duration: number;
  type: OscillatorType;
  relativeGain: number;
  delayMs?: number;
}

/**
 * Sound profile specifications per theme and sound type
 */
const SOUND_PROFILES: Record<string, Record<SoundType, ToneSpec[]>> = {
  'spatial-glass': {
    click: [
      { freqStart: 480, freqEnd: 240, duration: 0.025, type: 'sine', relativeGain: 0.25 },
    ],
    'window-open': [
      { freqStart: 440, freqEnd: 550, duration: 0.04, type: 'sine', relativeGain: 0.2 },
      { freqStart: 660, freqEnd: 880, duration: 0.05, type: 'sine', relativeGain: 0.22, delayMs: 25 },
    ],
    'window-close': [
      { freqStart: 520, freqEnd: 220, duration: 0.04, type: 'sine', relativeGain: 0.22 },
    ],
    'window-minimize': [
      { freqStart: 400, freqEnd: 150, duration: 0.05, type: 'sine', relativeGain: 0.2 },
    ],
    'window-maximize': [
      { freqStart: 380, freqEnd: 580, duration: 0.045, type: 'sine', relativeGain: 0.22 },
      { freqStart: 600, freqEnd: 920, duration: 0.06, type: 'sine', relativeGain: 0.25, delayMs: 25 },
    ],
    'window-restore': [
      { freqStart: 720, freqEnd: 420, duration: 0.04, type: 'sine', relativeGain: 0.22 },
      { freqStart: 360, freqEnd: 200, duration: 0.035, type: 'sine', relativeGain: 0.2, delayMs: 20 },
    ],
    'volume-tick': [
      { freqStart: 520, freqEnd: 480, duration: 0.02, type: 'sine', relativeGain: 0.3 },
    ],
    'theme-switch': [
      { freqStart: 329, freqEnd: 329, duration: 0.05, type: 'sine', relativeGain: 0.2 },
      { freqStart: 440, freqEnd: 440, duration: 0.06, type: 'sine', relativeGain: 0.22, delayMs: 35 },
      { freqStart: 659, freqEnd: 659, duration: 0.08, type: 'sine', relativeGain: 0.25, delayMs: 70 },
    ],
  },
  'swiss-industrial': {
    click: [
      { freqStart: 280, freqEnd: 60, duration: 0.018, type: 'triangle', relativeGain: 0.35 },
    ],
    'window-open': [
      { freqStart: 180, freqEnd: 240, duration: 0.025, type: 'triangle', relativeGain: 0.25 },
      { freqStart: 320, freqEnd: 420, duration: 0.035, type: 'triangle', relativeGain: 0.28, delayMs: 20 },
    ],
    'window-close': [
      { freqStart: 240, freqEnd: 70, duration: 0.03, type: 'triangle', relativeGain: 0.3 },
    ],
    'window-minimize': [
      { freqStart: 180, freqEnd: 70, duration: 0.035, type: 'triangle', relativeGain: 0.25 },
    ],
    'window-maximize': [
      { freqStart: 180, freqEnd: 300, duration: 0.03, type: 'triangle', relativeGain: 0.3 },
      { freqStart: 360, freqEnd: 540, duration: 0.04, type: 'triangle', relativeGain: 0.32, delayMs: 20 },
    ],
    'window-restore': [
      { freqStart: 440, freqEnd: 220, duration: 0.035, type: 'triangle', relativeGain: 0.3 },
      { freqStart: 180, freqEnd: 70, duration: 0.03, type: 'triangle', relativeGain: 0.28, delayMs: 15 },
    ],
    'volume-tick': [
      { freqStart: 300, freqEnd: 100, duration: 0.015, type: 'triangle', relativeGain: 0.35 },
    ],
    'theme-switch': [
      { freqStart: 110, freqEnd: 110, duration: 0.04, type: 'triangle', relativeGain: 0.25 },
      { freqStart: 220, freqEnd: 220, duration: 0.04, type: 'triangle', relativeGain: 0.28, delayMs: 30 },
      { freqStart: 440, freqEnd: 440, duration: 0.06, type: 'triangle', relativeGain: 0.3, delayMs: 60 },
    ],
  },
  'cyberpunk-neon': {
    click: [
      { freqStart: 1100, freqEnd: 550, duration: 0.03, type: 'sawtooth', relativeGain: 0.16 },
    ],
    'window-open': [
      { freqStart: 600, freqEnd: 950, duration: 0.035, type: 'sawtooth', relativeGain: 0.15 },
      { freqStart: 950, freqEnd: 1450, duration: 0.045, type: 'sawtooth', relativeGain: 0.18, delayMs: 25 },
    ],
    'window-close': [
      { freqStart: 900, freqEnd: 300, duration: 0.045, type: 'sawtooth', relativeGain: 0.18 },
    ],
    'window-minimize': [
      { freqStart: 1200, freqEnd: 400, duration: 0.05, type: 'sawtooth', relativeGain: 0.16 },
    ],
    'window-maximize': [
      { freqStart: 550, freqEnd: 1100, duration: 0.04, type: 'sawtooth', relativeGain: 0.16 },
      { freqStart: 1100, freqEnd: 1800, duration: 0.055, type: 'sawtooth', relativeGain: 0.18, delayMs: 20 },
    ],
    'window-restore': [
      { freqStart: 1400, freqEnd: 700, duration: 0.04, type: 'sawtooth', relativeGain: 0.18 },
      { freqStart: 700, freqEnd: 350, duration: 0.035, type: 'sawtooth', relativeGain: 0.16, delayMs: 15 },
    ],
    'volume-tick': [
      { freqStart: 880, freqEnd: 720, duration: 0.02, type: 'sawtooth', relativeGain: 0.2 },
    ],
    'theme-switch': [
      { freqStart: 440, freqEnd: 440, duration: 0.04, type: 'sawtooth', relativeGain: 0.15 },
      { freqStart: 880, freqEnd: 880, duration: 0.05, type: 'sawtooth', relativeGain: 0.18, delayMs: 30 },
      { freqStart: 1320, freqEnd: 1320, duration: 0.08, type: 'sawtooth', relativeGain: 0.2, delayMs: 65 },
    ],
  },
  'classic-mac': {
    click: [
      { freqStart: 880, freqEnd: 440, duration: 0.022, type: 'square', relativeGain: 0.16 },
    ],
    'window-open': [
      { freqStart: 523, freqEnd: 523, duration: 0.035, type: 'square', relativeGain: 0.15 },
      { freqStart: 659, freqEnd: 659, duration: 0.045, type: 'square', relativeGain: 0.18, delayMs: 25 },
    ],
    'window-close': [
      { freqStart: 440, freqEnd: 220, duration: 0.035, type: 'square', relativeGain: 0.18 },
    ],
    'window-minimize': [
      { freqStart: 600, freqEnd: 200, duration: 0.035, type: 'square', relativeGain: 0.16 },
    ],
    'window-maximize': [
      { freqStart: 523, freqEnd: 523, duration: 0.035, type: 'square', relativeGain: 0.15 },
      { freqStart: 659, freqEnd: 659, duration: 0.04, type: 'square', relativeGain: 0.17, delayMs: 20 },
      { freqStart: 880, freqEnd: 880, duration: 0.05, type: 'square', relativeGain: 0.19, delayMs: 40 },
    ],
    'window-restore': [
      { freqStart: 784, freqEnd: 784, duration: 0.035, type: 'square', relativeGain: 0.18 },
      { freqStart: 523, freqEnd: 523, duration: 0.04, type: 'square', relativeGain: 0.16, delayMs: 20 },
    ],
    'volume-tick': [
      { freqStart: 660, freqEnd: 660, duration: 0.018, type: 'square', relativeGain: 0.2 },
    ],
    'theme-switch': [
      { freqStart: 523, freqEnd: 523, duration: 0.05, type: 'square', relativeGain: 0.15 },
      { freqStart: 659, freqEnd: 659, duration: 0.05, type: 'square', relativeGain: 0.17, delayMs: 35 },
      { freqStart: 784, freqEnd: 784, duration: 0.08, type: 'square', relativeGain: 0.2, delayMs: 70 },
    ],
  },
};

/**
 * Singleton sound service for synthesizing procedural Web Audio API sounds.
 */
class SoundService {
  private ctx: AudioContext | null = null;

  /**
   * Initializes or unlocks the AudioContext upon user gesture.
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

  /**
   * Synthesizes and plays a single tone with exponential envelope.
   */
  private playTone(
    ctx: AudioContext,
    spec: ToneSpec,
    effectiveVolume: number,
    baseTime: number
  ): void {
    const startTime = baseTime + (spec.delayMs ? spec.delayMs / 1000 : 0);
    const stopTime = startTime + spec.duration;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freqStart, startTime);

    if (spec.freqEnd !== spec.freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, spec.freqEnd), stopTime);
    }

    const peakGain = Math.max(0.0001, spec.relativeGain * effectiveVolume);
    gainNode.gain.setValueAtTime(peakGain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(stopTime);
  }

  /**
   * Plays a procedural sound based on sound type, active theme, and master volume.
   *
   * @param type - Classification of UI sound to play
   * @param theme - Currently active theme ID
   * @param masterVolume - Master volume level between 0.0 and 1.0
   */
  public play(type: SoundType, theme = 'spatial-glass', masterVolume = 0.4): void {
    if (masterVolume <= 0) return;

    const ctx = this.getContext();
    if (!ctx) return;

    const themeProfiles = SOUND_PROFILES[theme] || SOUND_PROFILES['spatial-glass'];
    const specs = themeProfiles[type] || SOUND_PROFILES['spatial-glass'][type];
    if (!specs || specs.length === 0) return;

    const now = ctx.currentTime;
    specs.forEach((spec) => {
      this.playTone(ctx, spec, masterVolume, now);
    });
  }
}

export const soundService = new SoundService();
