import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameSoundService, gameSoundService } from './game-sound.service';

describe('GameSoundService', () => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gameSoundService as any).ctx = null;
    gameSoundService.setMuted(false);
    gameSoundService.setVolume(0.5);

    function MockAudioContext() {
      return mockAudioContext;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AudioContext = vi.fn().mockImplementation(MockAudioContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
  });

  it('resumes suspended context and plays tone on sound request', () => {
    gameSoundService.play('snake-eat', 'spatial-glass');

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it('does not play when muted or volume is zero', () => {
    gameSoundService.setMuted(true);
    gameSoundService.play('snake-eat', 'spatial-glass');

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();

    gameSoundService.setMuted(false);
    gameSoundService.setVolume(0);
    gameSoundService.play('snake-eat', 'spatial-glass');

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  it('correctly adapts sound waveform across different themes', () => {
    // Cyberpunk Neon -> Sawtooth
    gameSoundService.play('laser-shoot', 'cyberpunk-neon');
    expect(mockOscillator.type).toBe('sawtooth');

    // Classic Mac -> Square Wave Chiptune
    gameSoundService.play('snake-eat', 'classic-mac');
    expect(mockOscillator.type).toBe('square');

    // Swiss Industrial -> Triangle Wave
    gameSoundService.play('paddle-bounce', 'swiss-industrial');
    expect(mockOscillator.type).toBe('triangle');

    // Spatial Glass -> Sine Wave
    gameSoundService.play('high-score', 'spatial-glass');
    expect(mockOscillator.type).toBe('sine');
  });

  it('supports volume and mute status getters and clamps volume properly', () => {
    gameSoundService.setVolume(1.5);
    expect(gameSoundService.getVolume()).toBe(1.0);

    gameSoundService.setVolume(-0.5);
    expect(gameSoundService.getVolume()).toBe(0.0);

    gameSoundService.setMuted(true);
    expect(gameSoundService.isMuted()).toBe(true);
  });

  it('handles environment without AudioContext gracefully without crashing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).webkitAudioContext;

    const isolatedService = new GameSoundService();
    expect(() => isolatedService.play('snake-eat')).not.toThrow();
  });
});
