import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWindowManager, STATUSBAR_HEIGHT } from './window-manager.store';
import { useSoundStore } from '#stores/sound.store';
import { AppManifest } from '@personal-os/shared';

const mockApp: AppManifest = {
  id: 'terminal',
  name: 'Terminal CLI',
  description: 'Command line interface',
  iconName: 'Terminal',
  category: 'system',
  defaultSize: { width: 700, height: 450 },
  minSize: { width: 350, height: 250 },
  resizable: true,
  singleton: true,
};

const mockSettingsApp: AppManifest = {
  id: 'settings',
  name: 'Ayarlar',
  description: 'Settings App',
  iconName: 'Settings',
  category: 'system',
  defaultSize: { width: 660, height: 480 },
  minSize: { width: 360, height: 280 },
  resizable: true,
  singleton: true,
};

describe('Window Manager Store (Zustand)', () => {
  beforeEach(() => {
    // Reset state before each test
    useWindowManager.getState().reset();
  });

  it('should initialize with empty windows and base zIndex', () => {
    const state = useWindowManager.getState();
    expect(state.windows).toEqual({});
    expect(state.activeWindowId).toBeNull();
    expect(state.highestZIndex).toBe(100);
  });

  it('should open a new window and bring it into focus', () => {
    const store = useWindowManager.getState();
    store.openWindow(mockApp);

    const updated = useWindowManager.getState();
    const window = updated.windows['terminal'];

    expect(window).toBeDefined();
    expect(window.isOpen).toBe(true);
    expect(window.isMinimized).toBe(false);
    expect(window.isMaximized).toBe(false);
    expect(window.zIndex).toBe(101);
    expect(updated.activeWindowId).toBe('terminal');
    expect(window.bounds.width).toBe(mockApp.defaultSize.width);
    expect(window.bounds.height).toBe(mockApp.defaultSize.height);
  });

  it('should focus and un-minimize if opening an already open singleton window', () => {
    const store = useWindowManager.getState();
    store.openWindow(mockApp);
    store.minimizeWindow('terminal');

    expect(useWindowManager.getState().windows['terminal'].isMinimized).toBe(true);

    // Re-opening should restore and focus it
    store.openWindow(mockApp);
    const updated = useWindowManager.getState();
    expect(updated.windows['terminal'].isMinimized).toBe(false);
    expect(updated.activeWindowId).toBe('terminal');
  });

  it('should correctly close a window', () => {
    const store = useWindowManager.getState();
    store.openWindow(mockApp);
    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(true);

    store.closeWindow('terminal');
    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(false);
    expect(useWindowManager.getState().activeWindowId).toBeNull();
  });

  it('should layer z-indices when opening multiple windows', () => {
    const store = useWindowManager.getState();
    store.openWindow(mockApp);
    store.openWindow(mockSettingsApp);

    const updated = useWindowManager.getState();
    expect(updated.windows['terminal'].zIndex).toBe(101);
    expect(updated.windows['settings'].zIndex).toBe(102);
    expect(updated.activeWindowId).toBe('settings');

    // Focusing the first window should bring its zIndex above the second
    store.focusWindow('terminal');
    const focused = useWindowManager.getState();
    expect(focused.windows['terminal'].zIndex).toBe(103);
    expect(focused.activeWindowId).toBe('terminal');
  });

  it('should toggle maximize and place window directly beneath statusbar without overlap and play sounds', () => {
    const playSpy = vi.spyOn(useSoundStore.getState(), 'playSound');
    const store = useWindowManager.getState();
    store.openWindow(mockApp);

    const initialBounds = { ...useWindowManager.getState().windows['terminal'].bounds };
    const screenBounds = { width: 1920, height: 1080 };

    store.maximizeWindow('terminal', screenBounds);
    const maximized = useWindowManager.getState().windows['terminal'];
    expect(maximized.isMaximized).toBe(true);
    expect(maximized.bounds.x).toBe(0);
    expect(maximized.bounds.y).toBe(STATUSBAR_HEIGHT);
    expect(maximized.bounds.width).toBe(1920);
    expect(maximized.bounds.height).toBe(1080 - STATUSBAR_HEIGHT);
    expect(maximized.previousBounds).toEqual(initialBounds);
    expect(playSpy).toHaveBeenCalledWith('window-maximize');

    // Restoring
    store.maximizeWindow('terminal');
    const restored = useWindowManager.getState().windows['terminal'];
    expect(restored.isMaximized).toBe(false);
    expect(restored.bounds).toEqual(initialBounds);
    expect(playSpy).toHaveBeenCalledWith('window-restore');
  });

  it('should update window bounds while enforcing minSize constraints', () => {
    const store = useWindowManager.getState();
    store.openWindow(mockApp);

    // Attempting to resize smaller than minSize
    store.updateBounds('terminal', { width: 100, height: 50 });
    const constrained = useWindowManager.getState().windows['terminal'].bounds;
    expect(constrained.width).toBe(mockApp.minSize.width);
    expect(constrained.height).toBe(mockApp.minSize.height);

    // Valid resize and move
    store.updateBounds('terminal', { x: 250, y: 150, width: 800, height: 500 });
    const moved = useWindowManager.getState().windows['terminal'].bounds;
    expect(moved.x).toBe(250);
    expect(moved.y).toBe(150);
    expect(moved.width).toBe(800);
    expect(moved.height).toBe(500);
  });
});
