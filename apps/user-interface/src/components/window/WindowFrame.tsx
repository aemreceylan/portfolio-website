import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { WindowState } from '@personal-os/shared';
import { useWindowManager } from '#stores/window-manager.store';
import { useTranslation } from '#i18n/i18n.store';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

/**
 * Spatial Glass Window Frame component providing:
 * - 8-directional fluid resizing (N, S, E, W, NE, NW, SE, SW) with minimum dimension constraints
 * - Native pointer events dragging with GPU-accelerated translate3d transforms
 * - Window controls (Close, Minimize, Maximize / Restore) with localized tooltips
 * - Double-click on titlebar to toggle maximize / restore
 * - Titlebar right-click context menu (Close, Minimize, Maximize / Restore)
 * - Isolated window-content context handling (native browser menu preserved for text copy/paste)
 * - Cross-browser backdrop blur and touch/pointer handling (Safari, Firefox, Chromium)
 */
export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const { activeWindowId, focusWindow, closeWindow, minimizeWindow, maximizeWindow, updateBounds } =
    useWindowManager();
  const { t } = useTranslation();

  const isActive = activeWindowId === win.id;
  const isMinimized = win.isMinimized;
  const isMaximized = win.isMaximized;

  const [titlebarMenu, setTitlebarMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!titlebarMenu.isOpen) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.window-titlebar-context-menu')) return;
      setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      // If right-clicking anywhere outside this window's titlebar, close menu
      if (!(e.target as HTMLElement).closest('.window-titlebar')) {
        setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [titlebarMenu.isOpen]);

  const handleTitlebarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTitlebarMenu({
      isOpen: true,
      x: Math.min(e.clientX, window.innerWidth - 210),
      y: Math.min(e.clientY, window.innerHeight - 150),
    });
  };

  // Track initial pointer coordinates and window position during drag
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(
    null
  );

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
   * Initiates window dragging across the desktop viewport
   */
  const handleTitlebarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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
      const deltaX = moveEvent.clientX - dragStartRef.current.startX;
      const deltaY = moveEvent.clientY - dragStartRef.current.startY;

      const newX = Math.max(0, dragStartRef.current.initialX + deltaX);
      const newY = Math.max(0, dragStartRef.current.initialY + deltaY);

      updateBounds(win.id, { x: newX, y: newY });
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
      const { direction, startX, startY, initialWidth, initialHeight, initialX, initialY } =
        resizeStartRef.current;
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const partial: { x?: number; y?: number; width?: number; height?: number } = {};

      // Horizontal Resize calculation
      if (direction.includes('e')) {
        partial.width = Math.max(win.minSize.width, initialWidth + deltaX);
      } else if (direction.includes('w')) {
        const clampedWidth = Math.max(win.minSize.width, initialWidth - deltaX);
        partial.width = clampedWidth;
        partial.x = initialX + (initialWidth - clampedWidth);
      }

      // Vertical Resize calculation
      if (direction.includes('s')) {
        partial.height = Math.max(win.minSize.height, initialHeight + deltaY);
      } else if (direction.includes('n')) {
        const clampedHeight = Math.max(win.minSize.height, initialHeight - deltaY);
        partial.height = clampedHeight;
        partial.y = initialY + (initialHeight - clampedHeight);
      }

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

  const containerStyle: React.CSSProperties = {
    zIndex: win.zIndex,
    transform: `translate3d(${win.bounds.x}px, ${win.bounds.y}px, 0)`,
    width: `${win.bounds.width}px`,
    height: `${win.bounds.height}px`,
  };

  const closeLabel = t('window_close');
  const minimizeLabel = t('window_minimize');
  const maximizeLabel = isMaximized ? t('window_restore') : t('window_maximize');

  return (
    <div
      className={`window-container ${isActive ? 'active' : ''} ${isMinimized ? 'minimized' : ''} ${
        isMaximized ? 'maximized' : ''
      }`}
      style={containerStyle}
      onPointerDown={handleWindowPointerDown}
      data-testid={`window-${win.id}`}
      role="dialog"
      aria-label={win.title}
    >
      {/* Titlebar with double-click maximize toggle and right-click context menu */}
      <div
        className="window-titlebar"
        onPointerDown={handleTitlebarPointerDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        onContextMenu={handleTitlebarContextMenu}
      >
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
      </div>

      {/* Titlebar Context Menu (rendered in document.body to avoid parent transform offsets) */}
      {titlebarMenu.isOpen &&
        createPortal(
          <div
            className="window-titlebar-context-menu"
            style={{ left: titlebarMenu.x, top: titlebarMenu.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              type="button"
              className="window-titlebar-context-item danger"
              onClick={() => {
                setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
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
                setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
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
                setTitlebarMenu((prev) => ({ ...prev, isOpen: false }));
                maximizeWindow(win.id);
              }}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isMaximized ? t('window_ctx_restore') : t('window_ctx_maximize')}</span>
            </button>
          </div>,
          document.body
        )}

      {/* Content Area with custom Spatial Glass scrollbars (isolates right-click for native browser menu) */}
      <div
        className="window-content"
        onContextMenu={(e) => {
          // Prevent bubbling to desktop viewport so desktop menu never triggers here,
          // but do NOT call preventDefault so native browser context menu (Copy/Paste/Inspect) is available!
          e.stopPropagation();
        }}
      >
        {children}
      </div>

      {/* 8-Directional Resize Handles */}
      {win.resizable && !isMaximized && (
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
    </div>
  );
};
