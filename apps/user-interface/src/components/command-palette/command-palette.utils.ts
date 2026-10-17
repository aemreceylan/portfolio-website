import { CommandPaletteItem } from './command-palette.types';

/**
 * Filters command palette items using a case-insensitive multi-field search (title, description, categoryLabel).
 */
export function filterCommandPaletteItems(
  items: CommandPaletteItem[],
  query: string
): CommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(normalized);
    const descMatch = item.description.toLowerCase().includes(normalized);
    const categoryMatch = item.categoryLabel.toLowerCase().includes(normalized);
    return titleMatch || descMatch || categoryMatch;
  });
}

/**
 * Calculates next selected index with circular wrapping.
 */
export function getNextSelectedIndex(
  currentIndex: number,
  delta: number,
  totalItems: number
): number {
  if (totalItems <= 0) return 0;
  return (currentIndex + delta + totalItems) % totalItems;
}

/**
 * Detects whether the client is running on an Apple platform (macOS, iOS, iPadOS).
 * Accepts an optional override string for deterministic testing and SSR safety.
 */
export function isApplePlatform(customPlatformOrUa?: string): boolean {
  if (customPlatformOrUa !== undefined) {
    return /mac|iphone|ipad|ipod/i.test(customPlatformOrUa);
  }

  if (typeof navigator === 'undefined') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Returns the platform-appropriate keyboard shortcut label for the Spotlight command palette.
 * Returns '⌘K' for Apple platforms (macOS / iOS / iPadOS) and 'Ctrl+K' for Windows, Linux, and others.
 */
export function getSpotlightShortcutLabel(customPlatformOrUa?: string): string {
  return isApplePlatform(customPlatformOrUa) ? '⌘K' : 'Ctrl+K';
}
