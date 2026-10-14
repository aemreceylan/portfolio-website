import { create } from 'zustand';
import { AppManifest, WindowBounds, WindowSize, WindowState } from '@personal-os/shared';

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

interface WindowManagerStore {
  /** Map of application ID to its current runtime window instance */
  windows: Record<string, WindowState>;
  /** ID of the currently focused active window */
  activeWindowId: string | null;
  /** Monotonically increasing z-index counter */
  highestZIndex: number;

  /** Opens an application window or brings it into focus if already open */
  openWindow: (app: AppManifest, screenBounds?: WindowSize) => void;
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

export const useWindowManager = create<WindowManagerStore>((set, get) => ({
  windows: {},
  activeWindowId: null,
  highestZIndex: INITIAL_Z_INDEX,

  openWindow: (app, screenBounds) => {
    const { windows, highestZIndex } = get();
    const existing = windows[app.id];

    // If window already exists in store
    if (existing) {
      if (existing.isOpen) {
        // If minimized, restore and focus it
        const nextZIndex = highestZIndex + 1;
        set({
          windows: {
            ...windows,
            [app.id]: {
              ...existing,
              isMinimized: false,
              zIndex: nextZIndex,
            },
          },
          activeWindowId: app.id,
          highestZIndex: nextZIndex,
        });
        return;
      }

      // If closed, reopen it
      const nextZIndex = highestZIndex + 1;
      set({
        windows: {
          ...windows,
          [app.id]: {
            ...existing,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZIndex,
          },
        },
        activeWindowId: app.id,
        highestZIndex: nextZIndex,
      });
      return;
    }

    // Calculate intelligent cascaded coordinates
    const openCount = Object.values(windows).filter((w) => w.isOpen).length;
    const defaultX = INITIAL_OFFSET + (openCount % 10) * CASCADE_OFFSET;
    const defaultY = INITIAL_OFFSET + (openCount % 10) * CASCADE_OFFSET;

    const width = app.defaultSize.width;
    const height = app.defaultSize.height;

    // Boundary check if screen dimensions are known
    const adjustedX = screenBounds
      ? Math.min(defaultX, Math.max(10, screenBounds.width - width - 20))
      : defaultX;
    const adjustedY = screenBounds
      ? Math.min(defaultY, Math.max(STATUSBAR_HEIGHT + 10, screenBounds.height - height - 60))
      : defaultY;

    const nextZIndex = highestZIndex + 1;

    const newWindow: WindowState = {
      id: app.id,
      title: app.name,
      iconName: app.iconName,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      bounds: {
        x: adjustedX,
        y: adjustedY,
        width,
        height,
      },
      minSize: app.minSize,
      resizable: app.resizable,
    };

    set({
      windows: {
        ...windows,
        [app.id]: newWindow,
      },
      activeWindowId: app.id,
      highestZIndex: nextZIndex,
    });
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

    const nextX = partialBounds.x !== undefined ? partialBounds.x : target.bounds.x;
    const nextY = partialBounds.y !== undefined ? partialBounds.y : target.bounds.y;

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
