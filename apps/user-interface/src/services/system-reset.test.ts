import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performSystemReset } from './system-reset';
import { useFileSystemStore } from '#stores/filesystem.store';
import { useThemeStore } from '#stores/theme.store';

describe('System Reset Service', () => {
  beforeEach(() => {
    localStorage.clear();
    useFileSystemStore.getState().reset();
    useThemeStore.getState().reset();
  });

  it('should reset Virtual File System to initial files and wipe custom files', () => {
    // Create custom user file
    useFileSystemStore.getState().createFile('temp-calc.js', 'console.log(123);');
    expect(useFileSystemStore.getState().getFile('temp-calc.js')).toBeDefined();

    // Perform system reset
    performSystemReset();

    // Custom file should be gone
    expect(useFileSystemStore.getState().getFile('temp-calc.js')).toBeUndefined();

    // Default system files should exist
    expect(useFileSystemStore.getState().getFile('bio.md')).toBeDefined();
    expect(useFileSystemStore.getState().getFile('skills.md')).toBeDefined();
    expect(useFileSystemStore.getState().getFile('contact.md')).toBeDefined();
    expect(useFileSystemStore.getState().getFile('welcome.txt')).toBeDefined();
    expect(useFileSystemStore.getState().getFile('demo.js')).toBeDefined();
  });

  it('should restore theme to default spatial-glass on system reset', () => {
    // Change theme to swiss-industrial
    useThemeStore.getState().setTheme('swiss-industrial');
    expect(useThemeStore.getState().currentTheme).toBe('swiss-industrial');

    // Perform reset
    performSystemReset();

    // Theme must be restored to default spatial-glass
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
    expect(document.documentElement.getAttribute('data-theme')).toBe('spatial-glass');
  });

  it('should clear custom desktop positions from localStorage and dispatch aec-system-reset event', () => {
    localStorage.setItem('aec-desktop-icon-positions', JSON.stringify({ 'app-terminal': { x: 300, y: 300 } }));
    expect(localStorage.getItem('aec-desktop-icon-positions')).toBeDefined();

    const eventListener = vi.fn();
    window.addEventListener('aec-system-reset', eventListener);

    performSystemReset();

    expect(localStorage.getItem('aec-desktop-icon-positions')).toBeNull();
    expect(eventListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('aec-system-reset', eventListener);
  });
});
