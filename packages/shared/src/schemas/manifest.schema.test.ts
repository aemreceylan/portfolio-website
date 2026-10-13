import { describe, it, expect } from 'vitest';
import { appManifestSchema } from './manifest.schema';

describe('AppManifest Zod Schema Validation', () => {
  it('should successfully validate a correct app manifest', () => {
    const validManifest = {
      id: 'terminal',
      name: 'Terminal CLI',
      description: 'Zsh-like interactive command-line interface',
      iconName: 'Terminal',
      category: 'system' as const,
      defaultSize: { width: 700, height: 450 },
      minSize: { width: 350, height: 250 },
      resizable: true,
      singleton: true,
    };

    const result = appManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it('should validate a full project app manifest with metadata', () => {
    const projectManifest = {
      id: 'crypto-dash',
      name: 'Crypto Dashboard SPA',
      description: 'Real-time WebSocket analytics dashboard',
      iconName: 'Activity',
      category: 'projects' as const,
      defaultSize: { width: 900, height: 600 },
      minSize: { width: 400, height: 300 },
      resizable: true,
      singleton: true,
      metadata: {
        techStack: ['React', 'TypeScript', 'WebSockets'],
        liveUrl: 'https://crypto.example.com',
        githubUrl: 'https://github.com/user/crypto-dash',
        lighthouseScore: {
          performance: 98,
          accessibility: 100,
          bestPractices: 100,
          seo: 95,
        },
      },
    };

    const result = appManifestSchema.safeParse(projectManifest);
    expect(result.success).toBe(true);
  });

  it('should reject manifest with invalid characters in id', () => {
    const invalidManifest = {
      id: 'INVALID_ID_WITH_CAPS!',
      name: 'Invalid App',
      description: 'Test description',
      iconName: 'App',
      category: 'utilities' as const,
      defaultSize: { width: 500, height: 400 },
      minSize: { width: 300, height: 200 },
    };

    const result = appManifestSchema.safeParse(invalidManifest);
    expect(result.success).toBe(false);
  });

  it('should reject manifest with negative or invalid window bounds', () => {
    const invalidBounds = {
      id: 'broken-window',
      name: 'Broken Window App',
      description: 'Test description',
      iconName: 'App',
      category: 'utilities' as const,
      defaultSize: { width: -100, height: 0 },
      minSize: { width: 100, height: 100 },
    };

    const result = appManifestSchema.safeParse(invalidBounds);
    expect(result.success).toBe(false);
  });
});
