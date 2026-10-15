import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { soundService, SoundType } from './sound.service';

describe('SoundService', () => {
  let mockOscillator: {
    type: string;
    frequency: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  let mockGainNode: {
    gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
  };

  let mockAudioContext: {
    state: string;
    currentTime: number;
    destination: Record<string, unknown>;
    resume: ReturnType<typeof vi.fn>;
    createOscillator: ReturnType<typeof vi.fn>;
    createGain: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
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

    mockAudioContext = {
      state: 'suspended',
      currentTime: 10,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn().mockReturnValue(mockOscillator),
      createGain: vi.fn().mockReturnValue(mockGainNode),
    };

    // Reset singleton internal context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (soundService as any).ctx = null;

    // Use regular function so it can be called with `new`
    function MockAudioContext() {
      return mockAudioContext;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AudioContext = vi.fn().mockImplementation(MockAudioContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
  });

  it('resumes suspended audio context and plays click sound in spatial-glass theme', () => {
    soundService.play('click', 'spatial-glass', 0.5);

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('does not play when masterVolume is 0', () => {
    soundService.play('click', 'spatial-glass', 0);
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('plays different sound types across themes', () => {
    const soundTypes: SoundType[] = [
      'click',
      'window-open',
      'window-close',
      'window-minimize',
      'window-maximize',
      'window-restore',
      'volume-tick',
      'theme-switch',
    ];

    soundTypes.forEach((type) => {
      soundService.play(type, 'swiss-industrial', 0.4);
      soundService.play(type, 'cyberpunk-neon', 0.4);
      soundService.play(type, 'classic-mac', 0.4);
    });

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
  });

  it('falls back to spatial-glass if unknown theme provided', () => {
    soundService.play('click', 'unknown-theme', 0.5);
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.type).toBe('sine');
  });

  it('gracefully handles missing AudioContext', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).webkitAudioContext;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (soundService as any).ctx = null;

    expect(() => {
      soundService.play('click', 'spatial-glass', 0.5);
    }).not.toThrow();
  });
});
