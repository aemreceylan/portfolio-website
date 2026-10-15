import { describe, it, expect, beforeEach } from 'vitest';
import {
  useThemeStore,
  resolveInitialTheme,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from './theme.store';

describe('theme.store', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().reset();
  });

  it('should initialize with default spatial-glass theme', () => {
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
    expect(document.documentElement.getAttribute('data-theme')).toBe('spatial-glass');
  });

  it('should switch theme to swiss-industrial and persist in localStorage', () => {
    useThemeStore.getState().setTheme('swiss-industrial');

    expect(useThemeStore.getState().currentTheme).toBe('swiss-industrial');
    expect(document.documentElement.getAttribute('data-theme')).toBe('swiss-industrial');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('swiss-industrial');
  });

  it('should switch back to spatial-glass', () => {
    useThemeStore.getState().setTheme('swiss-industrial');
    expect(useThemeStore.getState().currentTheme).toBe('swiss-industrial');

    useThemeStore.getState().setTheme('spatial-glass');
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
    expect(document.documentElement.getAttribute('data-theme')).toBe('spatial-glass');
  });

  it('should reset back to default spatial-glass and remove localStorage key', () => {
    useThemeStore.getState().setTheme('swiss-industrial');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('swiss-industrial');

    useThemeStore.getState().reset();
    expect(useThemeStore.getState().currentTheme).toBe(DEFAULT_THEME);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('resolveInitialTheme should prioritize localStorage over backendDefault', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'swiss-industrial');
    const resolved = resolveInitialTheme('spatial-glass');
    expect(resolved).toBe('swiss-industrial');
  });

  it('resolveInitialTheme should use backendDefault when localStorage is empty', () => {
    const resolved = resolveInitialTheme('swiss-industrial');
    expect(resolved).toBe('swiss-industrial');
  });

  it('resolveInitialTheme should fallback to DEFAULT_THEME when no backend config or invalid config is provided', () => {
    const resolved = resolveInitialTheme('invalid-theme-id');
    expect(resolved).toBe(DEFAULT_THEME);
  });
});
