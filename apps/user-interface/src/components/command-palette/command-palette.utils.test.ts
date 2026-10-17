import { describe, it, expect } from 'vitest';
import {
  filterCommandPaletteItems,
  getNextSelectedIndex,
  isApplePlatform,
  getSpotlightShortcutLabel,
} from './command-palette.utils';
import { CommandPaletteItem } from './command-palette.types';

describe('command-palette.utils', () => {
  const dummyItems: CommandPaletteItem[] = [
    {
      id: 'app-terminal',
      title: 'Terminal CLI',
      description: 'Linux shell interface',
      category: 'apps',
      categoryLabel: 'Applications',
      onSelect: () => {},
    },
    {
      id: 'file-bio',
      title: 'bio.md',
      description: 'Curriculum Vitae',
      category: 'files',
      categoryLabel: 'Files',
      onSelect: () => {},
    },
    {
      id: 'theme-cyberpunk',
      title: 'Cyberpunk Neon',
      description: 'High voltage futuristic HUD',
      category: 'themes',
      categoryLabel: 'Themes',
      onSelect: () => {},
    },
  ];

  describe('filterCommandPaletteItems', () => {
    it('returns all items when query is empty or whitespace', () => {
      expect(filterCommandPaletteItems(dummyItems, '')).toHaveLength(3);
      expect(filterCommandPaletteItems(dummyItems, '   ')).toHaveLength(3);
    });

    it.each([
      { query: 'terminal', expectedId: 'app-terminal' },
      { query: 'futuristic', expectedId: 'theme-cyberpunk' },
      { query: 'Files', expectedId: 'file-bio' },
    ])('matches "$query" and resolves item "$expectedId"', ({ query, expectedId }) => {
      const results = filterCommandPaletteItems(dummyItems, query);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(expectedId);
    });

    it('returns empty array when nothing matches', () => {
      expect(filterCommandPaletteItems(dummyItems, 'nonexistent')).toHaveLength(0);
    });
  });

  describe('getNextSelectedIndex', () => {
    it('returns 0 if totalItems is 0', () => {
      expect(getNextSelectedIndex(0, 1, 0)).toBe(0);
    });

    it('navigates forward with wrap-around', () => {
      expect(getNextSelectedIndex(0, 1, 3)).toBe(1);
      expect(getNextSelectedIndex(1, 1, 3)).toBe(2);
      expect(getNextSelectedIndex(2, 1, 3)).toBe(0);
    });

    it('navigates backward with wrap-around', () => {
      expect(getNextSelectedIndex(0, -1, 3)).toBe(2);
      expect(getNextSelectedIndex(2, -1, 3)).toBe(1);
      expect(getNextSelectedIndex(1, -1, 3)).toBe(0);
    });
  });

  describe('isApplePlatform & getSpotlightShortcutLabel', () => {
    it.each([
      { platform: 'MacIntel', isApple: true, expectedKey: '⌘K' },
      { platform: 'Macintosh; Intel Mac OS X 10_15_7', isApple: true, expectedKey: '⌘K' },
      { platform: 'iPhone', isApple: true, expectedKey: '⌘K' },
      { platform: 'iPad', isApple: true, expectedKey: '⌘K' },
      { platform: 'Win32', isApple: false, expectedKey: 'Ctrl+K' },
      { platform: 'Windows NT 10.0; Win64; x64', isApple: false, expectedKey: 'Ctrl+K' },
      { platform: 'Linux x86_64', isApple: false, expectedKey: 'Ctrl+K' },
      { platform: 'Android', isApple: false, expectedKey: 'Ctrl+K' },
    ])('returns isApple=$isApple and key="$expectedKey" for platform "$platform"', ({ platform, isApple, expectedKey }) => {
      expect(isApplePlatform(platform)).toBe(isApple);
      expect(getSpotlightShortcutLabel(platform)).toBe(expectedKey);
    });

    it('falls back safely to default environment when no custom string provided', () => {
      const label = getSpotlightShortcutLabel();
      expect(['⌘K', 'Ctrl+K']).toContain(label);
    });
  });
});
