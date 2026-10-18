import { create } from 'zustand';
import { AppManifest, WindowBounds, WindowSize, WindowState } from '@personal-os/shared';
import { useSoundStore } from '#stores/sound.store';

/**
 * Top menu status bar height in pixels.
 * Maximized windows snap directly below this boundary so the top bar is never obstructed.
 */
export const STATUSBAR_HEIGHT = 42;

/**
 * Initial coordinate offset for freshly spawned windows
 */
const INITIAL_OFFSET = 60;

/**
 * Staggering offset distance for subsequent windows
 */
const CASCADE_OFFSET = 30;

/**
 * Base z-index baseline for active window stack
 */
const INITIAL_Z_INDEX = 100;

export interface OpenWindowOptions {
  /** If true, explicitly opens a new window instance for non-system apps */
  newInstance?: boolean;
}

interface WindowManagerStore {
  /** Map of window ID to its current runtime window instance */
  windows: Record<string, WindowState>;
  /** ID of the currently focused active window */
  activeWindowId: string | null;
  /** Monotonically increasing z-index counter */
  highestZIndex: number;

  /** Opens an application window or brings it into focus if already open */
  openWindow: (app: AppManifest, screenBounds?: WindowSize, options?: OpenWindowOptions) => void;
  /** Closes the window and removes it from active taskbar */
  closeWindow: (windowId: string) => void;
  /** Minimizes the window to the dock */
  minimizeWindow: (windowId: string) => void;
  /** Toggles window maximization snapping beneath the top statusbar */
  maximizeWindow: (windowId: string, screenBounds?: WindowSize) => void;
  /** Brings the specified window to top focus */
  focusWindow: (windowId: string) => void;
  /** Updates window position or dimensions while respecting constraints */
  updateBounds: (windowId: string, bounds: Partial<WindowBounds>) => void;
  /** Resets the entire store state (useful for test suites and clean restarts) */
  reset: () => void;
}

function resolveScreenDimensions(screenBounds?: WindowSize): { width: number; height: number } {
  if (screenBounds) {
    return { width: screenBounds.width, height: screenBounds.height };
  }
  if (typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return { width: 1200, height: 800 };
}

/**
 * Resolves the next unique window identifier and instance index for an application.
 * If the primary slot (app.id) is not currently open, reuses app.id.
 * Otherwise finds the next incremental suffix (e.g. 'band-2', 'band-3').
 */
function resolveNextWindowId(
  appId: string,
  windows: Record<string, WindowState>
): { id: string; instanceIndex: number } {
  const primary = windows[appId];
  if (!primary || !primary.isOpen) {
    return { id: appId, instanceIndex: 1 };
  }

  let index = 2;
  while (windows[`${appId}-${index}`]?.isOpen) {
    index++;
  }
  return { id: `${appId}-${index}`, instanceIndex: index };
}

function findReusableInstance(
  app: AppManifest,
  windows: Record<string, WindowState>,
  options?: OpenWindowOptions
): WindowState | null {
  const isSystemApp = app.category === 'system' || app.singleton;
  if (isSystemApp) {
    return windows[app.id] ?? null;
  }

  if (options?.newInstance) {
    return null;
  }

  const existingInstances = Object.values(windows).filter(
    (w) => (w.appId ?? w.id) === app.id
  );
  const openInstances = existingInstances.filter((w) => w.isOpen);

  if (openInstances.length === 0) {
    return windows[app.id] ?? null;
  }

  const allMinimized = openInstances.every((w) => w.isMinimized);
  if (allMinimized) {
    const [topmost] = [...openInstances].sort((a, b) => b.zIndex - a.zIndex);
    return topmost ?? null;
  }

  return null;
}

function calculateNewWindowBounds(
  app: AppManifest,
  openCount: number,
  screenBounds?: { width: number; height: number }
): WindowBounds {
  const defaultX = INITIAL_OFFSET + (openCount % 10) * CASCADE_OFFSET;
  const defaultY = STATUSBAR_HEIGHT + 10 + (openCount % 10) * CASCADE_OFFSET;
  const width = app.defaultSize.width;
  const height = app.defaultSize.height;

  const adjustedX = screenBounds
    ? Math.min(defaultX, Math.max(10, screenBounds.width - width - 20))
    : defaultX;
  const adjustedY = screenBounds
    ? Math.min(defaultY, Math.max(STATUSBAR_HEIGHT + 10, screenBounds.height - height - 60))
    : defaultY;

  return { x: adjustedX, y: adjustedY, width, height };
}

export const useWindowManager = create<WindowManagerStore>((set, get) => ({
  windows: {},
  activeWindowId: null,
  highestZIndex: INITIAL_Z_INDEX,

  openWindow: (app, screenBounds, options) => {
    const { windows, highestZIndex } = get();
    const reusableInstance = findReusableInstance(app, windows, options);

    if (reusableInstance) {
      const nextZIndex = highestZIndex + 1;
      set({
        windows: {
          ...windows,
          [reusableInstance.id]: {
            ...reusableInstance,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        },
        activeWindowId: reusableInstance.id,
        highestZIndex: nextZIndex,
      });
      useSoundStore.getState().playSound('window-open');
      return;
    }

    const isSystemApp = app.category === 'system' || app.singleton;
    const { id: targetWindowId, instanceIndex } = isSystemApp
      ? { id: app.id, instanceIndex: 1 }
      : resolveNextWindowId(app.id, windows);

    const openCount = Object.values(windows).filter((w) => w.isOpen).length;
    const bounds = calculateNewWindowBounds(app, openCount, screenBounds);
    const nextZIndex = highestZIndex + 1;
    const title = instanceIndex > 1 ? `${app.name} (${instanceIndex})` : app.name;

    const newWindow: WindowState = {
      id: targetWindowId,
      appId: app.id,
      title,
      iconName: app.iconName,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      bounds,
      minSize: app.minSize,
      resizable: app.resizable,
    };

    set({
      windows: {
        ...windows,
        [targetWindowId]: newWindow,
      },
      activeWindowId: targetWindowId,
      highestZIndex: nextZIndex,
    });
    useSoundStore.getState().playSound('window-open');
  },

  closeWindow: (windowId) => {
    const { windows, activeWindowId } = get();
    const target = windows[windowId];
    if (!target) return;

    const updatedWindows = {
      ...windows,
      [windowId]: {
        ...target,
        isOpen: false,
      },
    };

    // If closing currently active window, shift focus to next highest window
    let nextActiveId: string | null = null;
    if (activeWindowId === windowId) {
      const remainingOpen = Object.values(updatedWindows)
        .filter((w) => w.isOpen && !w.isMinimized && w.id !== windowId)
        .sort((a, b) => b.zIndex - a.zIndex);

      nextActiveId = remainingOpen.length > 0 ? remainingOpen[0].id : null;
    } else {
      nextActiveId = activeWindowId;
    }

    set({
      windows: updatedWindows,
      activeWindowId: nextActiveId,
    });
    useSoundStore.getState().playSound('window-close');
  },

  minimizeWindow: (windowId) => {
    const { windows, activeWindowId } = get();
    const target = windows[windowId];
    if (!target) return;

    const updatedWindows = {
      ...windows,
      [windowId]: {
        ...target,
        isMinimized: true,
      },
    };

    let nextActiveId: string | null = null;
    if (activeWindowId === windowId) {
      const remaining = Object.values(updatedWindows)
        .filter((w) => w.isOpen && !w.isMinimized && w.id !== windowId)
        .sort((a, b) => b.zIndex - a.zIndex);

      nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    } else {
      nextActiveId = activeWindowId;
    }

    set({
      windows: updatedWindows,
      activeWindowId: nextActiveId,
    });
    useSoundStore.getState().playSound('window-minimize');
  },

  maximizeWindow: (windowId, screenBounds) => {
    const { windows, highestZIndex } = get();
    const target = windows[windowId];
    if (!target) return;

    const nextZIndex = highestZIndex + 1;

    if (target.isMaximized) {
      // Restore to previous bounds before maximization
      const restoredBounds = target.previousBounds ?? {
        x: INITIAL_OFFSET,
        y: INITIAL_OFFSET,
        width: target.minSize.width * 1.5,
        height: target.minSize.height * 1.5,
      };

      set({
        windows: {
          ...windows,
          [windowId]: {
            ...target,
            isMaximized: false,
            bounds: restoredBounds,
            previousBounds: undefined,
            zIndex: nextZIndex,
          },
        },
        activeWindowId: windowId,
        highestZIndex: nextZIndex,
      });
      useSoundStore.getState().playSound('window-restore');
    } else {
      // Maximize window directly below the statusbar
      const currentBounds = { ...target.bounds };
      const { width: maximizedWidth, height: screenHeight } = resolveScreenDimensions(screenBounds);

      // Ensure window titlebar sits cleanly right below the 42px top statusbar
      const maximizedHeight = screenHeight - STATUSBAR_HEIGHT;

      set({
        windows: {
          ...windows,
          [windowId]: {
            ...target,
            isMaximized: true,
            previousBounds: currentBounds,
            bounds: {
              x: 0,
              y: STATUSBAR_HEIGHT,
              width: maximizedWidth,
              height: maximizedHeight,
            },
            zIndex: nextZIndex,
          },
        },
        activeWindowId: windowId,
        highestZIndex: nextZIndex,
      });
      useSoundStore.getState().playSound('window-maximize');
    }
  },

  focusWindow: (windowId) => {
    const { windows, highestZIndex, activeWindowId } = get();
    if (activeWindowId === windowId) return;

    const target = windows[windowId];
    if (!target) return;

    const nextZIndex = highestZIndex + 1;

    set({
      windows: {
        ...windows,
        [windowId]: {
          ...target,
          isMinimized: false,
          zIndex: nextZIndex,
        },
      },
      activeWindowId: windowId,
      highestZIndex: nextZIndex,
    });
  },

  updateBounds: (windowId, partialBounds) => {
    const { windows } = get();
    const target = windows[windowId];
    if (!target?.resizable) return;

    const nextWidth =
      partialBounds.width !== undefined
        ? Math.max(target.minSize.width, partialBounds.width)
        : target.bounds.width;

    const nextHeight =
      partialBounds.height !== undefined
        ? Math.max(target.minSize.height, partialBounds.height)
        : target.bounds.height;

    const nextX =
      partialBounds.x !== undefined ? Math.max(0, partialBounds.x) : target.bounds.x;
    const nextY =
      partialBounds.y !== undefined
        ? Math.max(STATUSBAR_HEIGHT, partialBounds.y)
        : target.bounds.y;

    set({
      windows: {
        ...windows,
        [windowId]: {
          ...target,
          bounds: {
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight,
          },
        },
      },
    });
  },

  reset: () => {
    set({
      windows: {},
      activeWindowId: null,
      highestZIndex: INITIAL_Z_INDEX,
    });
  },
}));
