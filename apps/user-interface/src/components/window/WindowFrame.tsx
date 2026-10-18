import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { WindowState, WindowSize } from '@personal-os/shared';
import { useWindowManager, STATUSBAR_HEIGHT } from '#stores/window-manager.store';
import { useTranslation } from '#i18n/i18n.store';
import { useViewport, useViewportStore } from '#stores/viewport.store';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

interface SheetSwipeListenerOptions {
  startY: number;
  onMove: (deltaY: number) => void;
  onEnd: (deltaY: number) => void;
}

/**
 * Attaches pointer move and up listeners for mobile bottom sheet swipe gesture
 */
const setupSheetSwipeListener = (options: SheetSwipeListenerOptions) => {
  let latestDeltaY = 0;
  const onPointerMove = (moveEvent: PointerEvent) => {
    latestDeltaY = Math.max(0, moveEvent.clientY - options.startY);
    options.onMove(latestDeltaY);
  };

  const onPointerUp = () => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    options.onEnd(latestDeltaY);
  };

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);
};

/**
 * Computes opacity for mobile bottom sheet based on swipe offset
 */
const getMobileSheetOpacity = (isMinimized: boolean, sheetOffsetY: number): number => {
  if (isMinimized) return 0;
  if (sheetOffsetY > 0) return Math.max(0.4, 1 - sheetOffsetY / 500);
  return 1;
};

/**
 * Clamps window drag position to prevent frames from sliding beyond screen boundaries:
 * - Left: x >= 0 (cannot slide off-screen to the left)
 * - Top: y >= STATUSBAR_HEIGHT (cannot slide beneath top status bar)
 * - Right: x <= screenWidth - windowWidth (cannot slide off-screen to the right)
 * - Bottom: y <= screenHeight - windowHeight (cannot slide off-screen to the bottom)
 */
export function clampWindowDragPosition(
  initialX: number,
  initialY: number,
  deltaX: number,
  deltaY: number,
  windowWidth: number,
  windowHeight: number,
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } {
  const maxX = Math.max(0, screenWidth - windowWidth);
  const maxY = Math.max(STATUSBAR_HEIGHT, screenHeight - windowHeight);

  const x = Math.min(maxX, Math.max(0, initialX + deltaX));
  const y = Math.min(maxY, Math.max(STATUSBAR_HEIGHT, initialY + deltaY));

  return { x, y };
}

/**
 * Clamps window resize dimensions and position to prevent frames from resizing beyond screen boundaries:
 * - North: y cannot be smaller than STATUSBAR_HEIGHT
 * - West: x cannot be smaller than 0
 * - East: right boundary cannot exceed screenWidth
 * - South: bottom boundary cannot exceed screenHeight
 */
export function clampWindowResizeBounds(
  direction: string,
  start: {
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
    deltaX: number;
    deltaY: number;
  },
  minSize: WindowSize,
  screen: { width: number; height: number }
): { x?: number; y?: number; width?: number; height?: number } {
  const partial: { x?: number; y?: number; width?: number; height?: number } = {};

  if (direction.includes('e')) {
    const maxWidth = Math.max(minSize.width, screen.width - start.initialX);
    partial.width = Math.min(maxWidth, Math.max(minSize.width, start.initialWidth + start.deltaX));
  } else if (direction.includes('w')) {
    const clampedWidth = Math.max(minSize.width, start.initialWidth - start.deltaX);
    const desiredX = start.initialX + (start.initialWidth - clampedWidth);
    const clampedX = Math.max(0, desiredX);
    partial.x = clampedX;
    partial.width = start.initialX + start.initialWidth - clampedX;
  }

  if (direction.includes('s')) {
    const maxHeight = Math.max(minSize.height, screen.height - start.initialY);
    partial.height = Math.min(maxHeight, Math.max(minSize.height, start.initialHeight + start.deltaY));
  } else if (direction.includes('n')) {
    const potentialY = start.initialY + start.deltaY;
    const clampedY = Math.max(STATUSBAR_HEIGHT, potentialY);
    const effectiveDeltaY = clampedY - start.initialY;
    const clampedHeight = Math.max(minSize.height, start.initialHeight - effectiveDeltaY);
    partial.height = clampedHeight;
    partial.y = start.initialY + (start.initialHeight - clampedHeight);
  }

  return partial;
}

/**
 * Spatial Glass Window Frame component providing:
 * - 8-directional fluid resizing (N, S, E, W, NE, NW, SE, SW) with minimum dimension constraints
 * - Native pointer events dragging with GPU-accelerated translate3d transforms
 * - Window controls (Close, Minimize, Maximize / Restore) with localized tooltips
 * - Double-click on titlebar to toggle maximize / restore
 * - Middle-click (scroll wheel) on titlebar to close window (mimicking close button)
 * - Titlebar right-click context menu (Close, Minimize, Maximize / Restore)
 * - Isolated window-content context handling (native browser menu preserved for text copy/paste)
 * - Cross-browser backdrop blur and touch/pointer handling (Safari, Firefox, Chromium)
 */
export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const { activeWindowId, focusWindow, closeWindow, minimizeWindow, maximizeWindow, updateBounds } =
    useWindowManager();
  const { t } = useTranslation();
  const { isMobile } = useViewport();

  const isActive = activeWindowId === win.id;
  const isMinimized = win.isMinimized;
  const isMaximized = win.isMaximized;

  const [windowMenu, setWindowMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!windowMenu.isOpen) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.window-titlebar-context-menu')) return;
      setWindowMenu((prev) => ({ ...prev, isOpen: false }));
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      // If right-clicking anywhere outside this window, close menu
      const target = e.target as HTMLElement | null;
      if (!target?.closest(`[data-window-id="${win.id}"]`)) {
        setWindowMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setWindowMenu((prev) => ({ ...prev, isOpen: false }));
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [windowMenu.isOpen, win.id]);

  /**
   * Handles right click on any part of the window (titlebar or content area),
   * suppressing the browser's default context menu and opening the OS window context menu.
   */
  const handleWindowContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isActive) {
      focusWindow(win.id);
    }
    setWindowMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 210),
      y: Math.min(e.clientY, window.innerHeight - 150),
    });
  };

  /**
   * Closes the window when middle-clicking (mouse button 1 / scroll wheel click) on the titlebar,
   * mimicking the behavior of clicking the close (X) button.
   * Prevents browser default autoscroll/panning behavior and stops event propagation.
   */
  const handleTitlebarAuxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 1) return;

    e.preventDefault();
    e.stopPropagation();

    // Do not trigger close if middle-clicking specifically on minimize or maximize/restore buttons
    if (
      (e.target as HTMLElement).closest(
        '.window-control-btn.minimize, .window-control-btn.maximize, .window-control-btn.restore'
      )
    ) {
      return;
    }

    closeWindow(win.id);
  };

  // Track initial pointer coordinates and window position during drag
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(
    null
  );

  // Mobile sheet swipe down state
  const [sheetOffsetY, setSheetOffsetY] = useState<number>(0);
  const [isSheetSwiping, setIsSheetSwiping] = useState<boolean>(false);

  // Track initial dimensions, position and direction during resize
  const resizeStartRef = useRef<{
    direction: string;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  /**
   * Focuses the window when clicked anywhere on its surface
   */
  const handleWindowPointerDown = () => {
    if (!isActive) {
      focusWindow(win.id);
    }
  };

  /**
   * Handles touch/pointer swipe-down gesture on mobile bottom sheet titlebar
   */
  const handleMobileSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    focusWindow(win.id);
    setIsSheetSwiping(true);

    const target = e.currentTarget;
    if (typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback in non-standard test environments
      }
    }

    setupSheetSwipeListener({
      startY: e.clientY,
      onMove: (deltaY) => setSheetOffsetY(deltaY),
      onEnd: (deltaY) => {
        if (typeof target.releasePointerCapture === 'function') {
          try {
            target.releasePointerCapture(e.pointerId);
          } catch {
            // Safe fallback
          }
        }
        setIsSheetSwiping(false);
        if (deltaY > 110) {
          minimizeWindow(win.id);
        }
        setSheetOffsetY(0);
      },
    });
  };

  /**
   * Initiates window dragging across the desktop viewport
   */
  const handleTitlebarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Middle-click (scroll wheel): prevent default browser autoscroll / panning behavior
    if (e.button === 1) {
      e.preventDefault();
      return;
    }

    if (isMobile) {
      handleMobileSheetPointerDown(e);
      return;
    }

    // Only primary button (left click) initiates window dragging; right click (button === 2) must not capture pointer
    if (e.button !== 0 || (e.target as HTMLElement).closest('.window-controls') || isMaximized) {
      return;
    }

    focusWindow(win.id);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.bounds.x,
      initialY: win.bounds.y,
    };

    const target = e.currentTarget;
    if (typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback in non-standard web environments
      }
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const { width: vpWidth, height: vpHeight } = useViewportStore.getState();
      const screenWidth = vpWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const screenHeight = vpHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);

      const nextPos = clampWindowDragPosition(
        dragStartRef.current.initialX,
        dragStartRef.current.initialY,
        moveEvent.clientX - dragStartRef.current.startX,
        moveEvent.clientY - dragStartRef.current.startY,
        win.bounds.width,
        win.bounds.height,
        screenWidth,
        screenHeight
      );

      updateBounds(win.id, nextPos);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      dragStartRef.current = null;
      if (typeof target.releasePointerCapture === 'function') {
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {
          // Safe fallback
        }
      }
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  /**
   * Initiates 8-directional window resizing with strict minSize bounds clamping
   *
   * @param direction - Direction identifier: 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
   */
  const handleResizePointerDown = (direction: string) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isMaximized || !win.resizable) return;

    focusWindow(win.id);
    resizeStartRef.current = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: win.bounds.width,
      initialHeight: win.bounds.height,
      initialX: win.bounds.x,
      initialY: win.bounds.y,
    };

    const target = e.currentTarget;
    if (typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!resizeStartRef.current) return;
      const { width: vpWidth, height: vpHeight } = useViewportStore.getState();
      const screenWidth = vpWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const screenHeight = vpHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);

      const partial = clampWindowResizeBounds(
        resizeStartRef.current.direction,
        {
          initialWidth: resizeStartRef.current.initialWidth,
          initialHeight: resizeStartRef.current.initialHeight,
          initialX: resizeStartRef.current.initialX,
          initialY: resizeStartRef.current.initialY,
          deltaX: moveEvent.clientX - resizeStartRef.current.startX,
          deltaY: moveEvent.clientY - resizeStartRef.current.startY,
        },
        win.minSize,
        { width: screenWidth, height: screenHeight }
      );

      updateBounds(win.id, partial);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      resizeStartRef.current = null;
      if (typeof target.releasePointerCapture === 'function') {
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {
          // Safe fallback
        }
      }
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  if (!win.isOpen) {
    return null;
  }

  const containerStyle: React.CSSProperties = isMobile
    ? {
        zIndex: win.zIndex,
        ['--sheet-translate-y' as string]: `${sheetOffsetY}px`,
        opacity: getMobileSheetOpacity(isMinimized, sheetOffsetY),
      }
    : {
        zIndex: isMaximized && isActive ? Math.max(win.zIndex, 9990) : win.zIndex,
        transform: `translate3d(${win.bounds.x}px, ${win.bounds.y}px, 0)`,
        width: `${win.bounds.width}px`,
        height: `${win.bounds.height}px`,
      };

  const closeLabel = t('window_close');
  const minimizeLabel = t('window_minimize');
  const maximizeLabel = isMaximized ? t('window_restore') : t('window_maximize');

  return (
    <section
      className={`window-container ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''} ${
        isMaximized ? 'maximized' : ''
      } ${isMobile ? 'is-mobile' : ''} ${isSheetSwiping ? 'is-swiping' : ''}`}
      style={containerStyle}
      onPointerDown={handleWindowPointerDown}
      onContextMenu={handleWindowContextMenu}
      data-testid={`window-${win.id}`}
      data-window-id={win.id}
      aria-label={win.title}
    >
      {/* Titlebar with double-click maximize toggle, middle-click close, and right-click context menu */}
      <header
        role="toolbar"
        aria-label={`${win.title} Titlebar`}
        tabIndex={-1}
        className="window-titlebar"
        onPointerDown={handleTitlebarPointerDown}
        onMouseDown={(e) => {
          if (e.button === 1) {
            e.preventDefault();
          }
        }}
        onAuxClick={handleTitlebarAuxClick}
        onDoubleClick={() => !isMobile && maximizeWindow(win.id)}
        onContextMenu={handleWindowContextMenu}
      >
        {isMobile && <div className="window-mobile-indicator-bar" aria-hidden="true" />}
        <div className="window-controls">
          <button
            type="button"
            className="window-control-btn close"
            aria-label={closeLabel}
            title={closeLabel}
            onClick={() => closeWindow(win.id)}
          >
            <X size={8} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="window-control-btn minimize"
            aria-label={minimizeLabel}
            title={minimizeLabel}
            onClick={() => minimizeWindow(win.id)}
          >
            <Minus size={8} strokeWidth={3} />
          </button>
          <button
            type="button"
            className={`window-control-btn ${isMaximized ? 'restore' : 'maximize'}`}
            aria-label={maximizeLabel}
            title={maximizeLabel}
            onClick={() => maximizeWindow(win.id)}
          >
            {isMaximized ? (
              <Minimize2 size={8} strokeWidth={2.5} />
            ) : (
              <Maximize2 size={8} strokeWidth={2.5} />
            )}
          </button>
        </div>

        <div className="window-title">
          <span>{win.title}</span>
        </div>

        <div style={{ width: 44 }} aria-hidden="true" />
      </header>

      {/* Window Context Menu (rendered in document.body to avoid parent transform offsets) */}
      {windowMenu.isOpen &&
        createPortal(
          <div
            role="menu"
            tabIndex={-1}
            className="window-titlebar-context-menu"
            style={{ left: windowMenu.x, top: windowMenu.y }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setWindowMenu((prev) => ({ ...prev, isOpen: false }));
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            data-testid="window-context-menu"
          >
            <button
              type="button"
              className="window-titlebar-context-item danger"
              onClick={() => {
                setWindowMenu((prev) => ({ ...prev, isOpen: false }));
                closeWindow(win.id);
              }}
            >
              <X size={14} />
              <span>{t('window_ctx_close')}</span>
            </button>
            <button
              type="button"
              className="window-titlebar-context-item"
              onClick={() => {
                setWindowMenu((prev) => ({ ...prev, isOpen: false }));
                minimizeWindow(win.id);
              }}
            >
              <Minus size={14} />
              <span>{t('window_ctx_minimize')}</span>
            </button>
            <button
              type="button"
              className="window-titlebar-context-item"
              onClick={() => {
                setWindowMenu((prev) => ({ ...prev, isOpen: false }));
                maximizeWindow(win.id);
              }}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isMaximized ? t('window_ctx_restore') : t('window_ctx_maximize')}</span>
            </button>
          </div>,
          document.body
        )}

      {/* Content Area with custom Spatial Glass scrollbars */}
      <div
        className="window-content"
        onContextMenu={handleWindowContextMenu}
      >
        {children}
      </div>

      {/* 8-Directional Resize Handles */}
      {win.resizable && !isMaximized && !isMobile && (
        <>
          <div className="resize-handle n" onPointerDown={handleResizePointerDown('n')} />
          <div className="resize-handle s" onPointerDown={handleResizePointerDown('s')} />
          <div className="resize-handle e" onPointerDown={handleResizePointerDown('e')} />
          <div className="resize-handle w" onPointerDown={handleResizePointerDown('w')} />
          <div className="resize-handle ne" onPointerDown={handleResizePointerDown('ne')} />
          <div className="resize-handle nw" onPointerDown={handleResizePointerDown('nw')} />
          <div className="resize-handle se" onPointerDown={handleResizePointerDown('se')} />
          <div className="resize-handle sw" onPointerDown={handleResizePointerDown('sw')} />
        </>
      )}
    </section>
  );
};
