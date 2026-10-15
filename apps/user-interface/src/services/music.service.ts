/**
 * Procedural Web Audio Music Sequencer.
 * Synthesizes zero-asset, theme-adaptive generative ambient and chiptune tracks.
 */

export interface TrackDefinition {
  id: string;
  title: string;
  themeId: string;
  bpm: number;
  leadType: OscillatorType;
  leadNotes: number[];
  bassType?: OscillatorType;
  bassNotes?: number[];
  filterFreq?: number;
}

// Common Musical Frequencies (Hz)
const N = {
  REST: 0,
  // Octave 2
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  // Octave 3
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  Fs3: 185.0,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  // Octave 4
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  // Octave 5
  C5: 523.25,
  Cs5: 554.37,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  Fs5: 739.99,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
};

/**
 * 8 Procedural Theme Tracks (2 per theme)
 */
export const THEME_TRACKS: Record<string, [TrackDefinition, TrackDefinition]> = {
  'spatial-glass': [
    {
      id: 'spatial-ethereal',
      title: 'Ethereal Orbit',
      themeId: 'spatial-glass',
      bpm: 78,
      leadType: 'sine',
      leadNotes: [
        N.A4, N.C5, N.E5, N.G5, N.E5, N.C5, N.D5, N.REST,
        N.F5, N.A5, N.E5, N.C5, N.B4, N.G4, N.A4, N.REST,
      ],
      bassType: 'sine',
      bassNotes: [
        N.A3, N.A3, N.C4, N.C4, N.D4, N.D4, N.E4, N.E4,
        N.F3, N.F3, N.G3, N.G3, N.A3, N.A3, N.E3, N.E3,
      ],
      filterFreq: 1800,
    },
    {
      id: 'spatial-starlight',
      title: 'Starlight Float',
      themeId: 'spatial-glass',
      bpm: 84,
      leadType: 'sine',
      leadNotes: [
        N.D4, N.F4, N.A4, N.C5, N.D5, N.C5, N.A4, N.F4,
        N.G4, N.Bb4, N.D5, N.F5, N.E5, N.D5, N.A4, N.REST,
      ],
      bassType: 'sine',
      bassNotes: [
        N.D3, N.D3, N.A3, N.A3, N.G3, N.G3, N.Bb3, N.Bb3,
        N.C4, N.C4, N.F3, N.F3, N.D3, N.D3, N.A3, N.A3,
      ],
      filterFreq: 2200,
    },
  ],
  'swiss-industrial': [
    {
      id: 'swiss-kalkul',
      title: 'Kalkül 1960',
      themeId: 'swiss-industrial',
      bpm: 112,
      leadType: 'triangle',
      leadNotes: [
        N.C4, N.REST, N.C4, N.G4, N.Eb4, N.REST, N.F4, N.G4,
        N.C4, N.Eb4, N.G4, N.REST, N.Bb4, N.G4, N.Eb4, N.C4,
      ],
      bassType: 'triangle',
      bassNotes: [
        N.C3, N.C3, N.G3, N.C3, N.C3, N.Eb3, N.F3, N.G3,
        N.C3, N.C3, N.G3, N.C3, N.Bb2, N.C3, N.Eb3, N.G3,
      ],
      filterFreq: 2800,
    },
    {
      id: 'swiss-raster',
      title: 'Raster & Modul',
      themeId: 'swiss-industrial',
      bpm: 100,
      leadType: 'triangle',
      leadNotes: [
        N.A3, N.C4, N.E4, N.A4, N.REST, N.E4, N.C4, N.B3,
        N.G3, N.B3, N.D4, N.G4, N.REST, N.D4, N.B3, N.A3,
      ],
      bassType: 'triangle',
      bassNotes: [
        N.A2, N.A2, N.E3, N.A2, N.G2, N.G2, N.D3, N.G2,
        N.F3, N.F3, N.C3, N.F3, N.E3, N.E3, N.B2, N.E3,
      ],
      filterFreq: 2600,
    },
  ],
  'cyberpunk-neon': [
    {
      id: 'cyber-night-city',
      title: 'Night City Drive',
      themeId: 'cyberpunk-neon',
      bpm: 122,
      leadType: 'sawtooth',
      leadNotes: [
        N.Fs4, N.Fs4, N.A4, N.Cs5, N.E5, N.Cs5, N.A4, N.Fs4,
        N.B4, N.Cs5, N.E5, N.Fs5, N.E5, N.Cs5, N.B4, N.A4,
      ],
      bassType: 'sawtooth',
      bassNotes: [
        N.Fs3, N.Fs3, N.Fs3, N.A3, N.B3, N.B3, N.Cs4, N.Cs4,
        N.D4, N.D4, N.Cs4, N.Cs4, N.B3, N.B3, N.A3, N.Fs3,
      ],
      filterFreq: 2400,
    },
    {
      id: 'cyber-neon-horizon',
      title: 'Neon Horizon',
      themeId: 'cyberpunk-neon',
      bpm: 110,
      leadType: 'sawtooth',
      leadNotes: [
        N.E4, N.G4, N.B4, N.D5, N.E5, N.D5, N.B4, N.G4,
        N.A4, N.C5, N.E5, N.G5, N.Fs5, N.E5, N.B4, N.REST,
      ],
      bassType: 'sawtooth',
      bassNotes: [
        N.E3, N.E3, N.B3, N.E3, N.C3, N.C3, N.G3, N.C3,
        N.D3, N.D3, N.A3, N.D3, N.B2, N.B2, N.Fs3, N.B2,
      ],
      filterFreq: 2200,
    },
  ],
  'classic-mac': [
    {
      id: 'mac-silicon-valley',
      title: 'Silicon Valley 1984',
      themeId: 'classic-mac',
      bpm: 128,
      leadType: 'square',
      leadNotes: [
        N.C4, N.E4, N.G4, N.C5, N.B4, N.G4, N.A4, N.F4,
        N.G4, N.E4, N.F4, N.D4, N.C4, N.E4, N.G4, N.REST,
      ],
      bassType: 'square',
      bassNotes: [
        N.C3, N.REST, N.G3, N.REST, N.F3, N.REST, N.C3, N.REST,
        N.G3, N.REST, N.G2, N.REST, N.C3, N.REST, N.C3, N.REST,
      ],
      filterFreq: 4000,
    },
    {
      id: 'mac-pixel-dream',
      title: 'Pixel Dream',
      themeId: 'classic-mac',
      bpm: 106,
      leadType: 'square',
      leadNotes: [
        N.G4, N.B4, N.D5, N.G5, N.Fs5, N.D5, N.E5, N.C5,
        N.D5, N.B4, N.C5, N.A4, N.B4, N.G4, N.A4, N.D4,
      ],
      bassType: 'square',
      bassNotes: [
        N.G3, N.G3, N.D3, N.G3, N.C3, N.C3, N.G3, N.C3,
        N.D3, N.D3, N.A3, N.D3, N.G2, N.G2, N.D3, N.G2,
      ],
      filterFreq: 3800,
    },
  ],
};

/**
 * Procedural Music Engine class managing scheduling and step synthesis.
 */
class MusicService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private currentTrack: TrackDefinition | null = null;
  private isPlaying = false;
  private stepIndex = 0;
  private intervalTimer: number | null = null;
  private masterVolume = 0.4;
  private isMuted = false;

  private initContext(): boolean {
    if (typeof window === 'undefined') return false;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return false;

      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.filterNode = this.ctx.createBiquadFilter();

      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(3000, this.ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    this.updateGainLevel();
    return true;
  }

  private updateGainLevel(): void {
    if (!this.masterGain || !this.ctx) return;
    const effective = this.isMuted ? 0 : Math.max(0, this.masterVolume * 0.22);
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(effective, now);
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    time: number,
    gainMultiplier = 0.15
  ): void {
    if (!this.ctx || !this.filterNode || freq <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainMultiplier, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  private scheduleNextStep(): void {
    if (!this.isPlaying || !this.currentTrack || !this.ctx) return;

    const stepDuration = 60 / this.currentTrack.bpm / 2; // Eighth-notes
    const now = this.ctx.currentTime;
    const leadFreq = this.currentTrack.leadNotes[this.stepIndex % this.currentTrack.leadNotes.length];

    if (leadFreq && leadFreq > 0) {
      this.playTone(leadFreq, this.currentTrack.leadType, stepDuration * 0.9, now, 0.18);
    }

    if (this.currentTrack.bassNotes && this.currentTrack.bassType) {
      const bassFreq =
        this.currentTrack.bassNotes[this.stepIndex % this.currentTrack.bassNotes.length];
      if (bassFreq && bassFreq > 0) {
        this.playTone(bassFreq, this.currentTrack.bassType, stepDuration * 0.85, now, 0.14);
      }
    }

    this.stepIndex++;
  }

  public start(track: TrackDefinition): void {
    this.stop();
    this.currentTrack = track;
    this.stepIndex = 0;

    const ready = this.initContext();
    if (!ready || !this.ctx) return;

    if (this.filterNode && track.filterFreq) {
      this.filterNode.frequency.setValueAtTime(track.filterFreq, this.ctx.currentTime);
    }

    this.isPlaying = true;
    const stepIntervalMs = Math.round((60 / track.bpm / 2) * 1000);

    this.scheduleNextStep();
    this.intervalTimer = window.setInterval(() => {
      this.scheduleNextStep();
    }, stepIntervalMs);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public setVolume(volume: number, isMuted: boolean): void {
    this.masterVolume = volume;
    this.isMuted = isMuted;
    this.updateGainLevel();
  }

  public getCurrentTrack(): TrackDefinition | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const musicService = new MusicService();
