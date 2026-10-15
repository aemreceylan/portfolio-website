import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { musicService, THEME_TRACKS } from './music.service';

describe('MusicService', () => {
  let mockOscillator: {
    type: string;
    frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  let mockGainNode: {
    gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
  };

  let mockBiquadFilterNode: {
    type: string;
    frequency: { setValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
  };

  let mockAudioContext: {
    state: string;
    currentTime: number;
    destination: Record<string, unknown>;
    resume: ReturnType<typeof vi.fn>;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
    createBiquadFilter: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockBiquadFilterNode = {
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = {
      state: 'suspended',
      currentTime: 10,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGainNode),
      createBiquadFilter: vi.fn().mockReturnValue(mockBiquadFilterNode),
    };

    // Reset internal state
    musicService.stop();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (musicService as any).ctx = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (musicService as any).masterGain = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (musicService as any).filterNode = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (musicService as any).audioElement = null;

    function MockAudioContext() {
      return mockAudioContext;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AudioContext = vi.fn().mockImplementation(MockAudioContext);

    // Mock HTMLMediaElement methods in JSDOM
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    musicService.stop();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
  });

  it('contains 8 valid tracks with requested theme track order', () => {
    const themeKeys = ['spatial-glass', 'swiss-industrial', 'cyberpunk-neon', 'classic-mac'];
    themeKeys.forEach((key) => {
      const tracks = THEME_TRACKS[key];
      expect(tracks).toBeDefined();
      expect(tracks).toHaveLength(2);
      tracks.forEach((track) => {
        expect(track.id).toBeTruthy();
        expect(track.title).toBeTruthy();
        expect(track.src).toBeTruthy();
        expect(track.bpm).toBeGreaterThan(60);
      });
    });

    // Theme 1 & 2 in standard order
    expect(THEME_TRACKS['spatial-glass'][0].title).toBe('Ethereal Orbit');
    expect(THEME_TRACKS['swiss-industrial'][0].title).toBe('Kalkül 1960');

    // Theme 3 & 4 have 2nd track playing first
    expect(THEME_TRACKS['cyberpunk-neon'][0].title).toBe('Neon Horizon');
    expect(THEME_TRACKS['cyberpunk-neon'][1].title).toBe('Night City Drive');
    expect(THEME_TRACKS['classic-mac'][0].title).toBe('Pixel Dream');
    expect(THEME_TRACKS['classic-mac'][1].title).toBe('Silicon Valley 1984');
  });

  it('starts playing an MP3 track using HTMLAudioElement and handles stop', () => {
    const track = THEME_TRACKS['spatial-glass'][0];
    musicService.start(track);

    expect(musicService.getIsPlaying()).toBe(true);
    expect(musicService.getCurrentTrack()?.id).toBe(track.id);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();

    musicService.stop();
    expect(musicService.getIsPlaying()).toBe(false);
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('supports procedural synthesis fallback and advances steps on interval timer', () => {
    const track = THEME_TRACKS['spatial-glass'][0];
    musicService.startProceduralSynth(track);

    expect(musicService.getIsPlaying()).toBe(true);
    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockOscillator.start).toHaveBeenCalled();

    musicService.stop();
    expect(musicService.getIsPlaying()).toBe(false);
  });

  it('updates gain level and audio element volume when volume or mute state changes', () => {
    const track = THEME_TRACKS['cyberpunk-neon'][0];
    musicService.start(track);

    musicService.setVolume(0.8, false);
    musicService.setVolume(0.8, true);
    expect(musicService.getIsPlaying()).toBe(true);
  });

  it('plays bass notes in procedural synthesis', () => {
    const track = THEME_TRACKS['classic-mac'][0];
    musicService.startProceduralSynth(track);

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it('handles environment without AudioContext gracefully in procedural synth', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).webkitAudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (musicService as any).ctx = null;

    expect(() => {
      musicService.startProceduralSynth(THEME_TRACKS['spatial-glass'][0]);
    }).not.toThrow();
    expect(musicService.getIsPlaying()).toBe(false);
  });
});
