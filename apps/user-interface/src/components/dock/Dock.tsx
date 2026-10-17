import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useWindowManager } from '#stores/window-manager.store';
import { useSoundStore } from '#stores/sound.store';
import { useTranslation } from '#i18n/i18n.store';
import type { Translations } from '#i18n/translations';
import { AppIconResolver } from '#components/icons/AppIconResolver';
import { useViewport } from '#stores/viewport.store';
import '#styles/dock.css';

interface DockMenuState {
  isOpen: boolean;
  appId: string | null;
  x: number;
  y: number;
}

/**
 * Returns localized window title based on standard app identifier
 */
const getLocalizedTitle = (
  appId: string,
  defaultTitle: string,
  t: (key: keyof Translations) => string
): string => {
  if (appId === 'settings') return t('appName_settings');
  if (appId === 'terminal') return t('appName_terminal');
  if (appId === 'markdown-viewer') return t('appName_markdown');
  if (appId === 'js-ide') return t('appName_ide');
  if (appId === 'game-hub') return t('appName_game_hub');
  return defaultTitle;
};

/**
 * Dynamic Dock component that functions strictly as an Active Taskbar.
 * Displays only currently open or minimized applications. When all windows are closed,
 * the dock automatically stays hidden to maintain a clutter-free desktop.
 * On mobile viewports, docks safely on the home screen when windows are minimized.
 * Provides a context menu on right-click to close or minimize/restore open applications.
 */
export const Dock: React.FC = () => {
  const { windows, activeWindowId, minimizeWindow, focusWindow, closeWindow } = useWindowManager();
  const { t } = useTranslation();
  const { isMobile } = useViewport();
  const [dockMenu, setDockMenu] = useState<DockMenuState>({
    isOpen: false,
    appId: null,
    x: 0,
    y: 0,
  });

  // Filter and display strictly open (active or minimized) windows
  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  // Close context menu if target window is closed
  useEffect(() => {
    if (dockMenu.isOpen && dockMenu.appId) {
      const target = windows[dockMenu.appId];
      if (!target?.isOpen) {
        setDockMenu({ isOpen: false, appId: null, x: 0, y: 0 });
      }
    }
  }, [windows, dockMenu.isOpen, dockMenu.appId]);

  // Close context menu on global click outside, global contextmenu outside dock, or Escape key
  useEffect(() => {
    if (!dockMenu.isOpen) return;

    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.dock-context-menu')) return;
      setDockMenu((prev) => ({ ...prev, isOpen: false, appId: null }));
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.dock-item')) {
        setDockMenu((prev) => ({ ...prev, isOpen: false, appId: null }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDockMenu((prev) => ({ ...prev, isOpen: false, appId: null }));
      }
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dockMenu.isOpen]);

  // On mobile viewports, when a window is currently active and open in full-screen sheet mode,
  // tuck the dock away to maximize mobile touch work area. Reappears on mobile home screen when minimized.
  const isMobileWindowActive =
    isMobile && activeWindowId && windows[activeWindowId]?.isOpen && !windows[activeWindowId]?.isMinimized;

  // Return null if no windows are open, or if an active mobile full-screen app is running
  if (openWindows.length === 0 || isMobileWindowActive) {
    return null;
  }

  /**
   * Handles user interaction with a dock icon
   * - If minimized: restores and focuses window
   * - If active: minimizes it to dock
   * - If backgrounded: brings it to the top focus
   */
  const handleDockItemClick = (appId: string) => {
    useSoundStore.getState().playSound('click');
    const win = windows[appId];
    if (!win) return;

    if (win.isMinimized) {
      focusWindow(appId);
    } else if (activeWindowId === appId) {
      minimizeWindow(appId);
    } else {
      focusWindow(appId);
    }
  };

  /**
   * Opens OS context menu positioned above the right-clicked dock icon
   */
  const handleDockItemContextMenu = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();
    useSoundStore.getState().playSound('click');

    const menuWidth = 190;
    const menuHeight = 110;
    const x = Math.min(Math.max(10, e.clientX - menuWidth / 2), window.innerWidth - menuWidth - 10);
    const y = Math.max(10, e.clientY - menuHeight - 12);

    setDockMenu({
      isOpen: true,
      appId,
      x,
      y,
    });
  };

  /**
   * Closes application directly from dock context menu
   */
  const handleCloseFromDock = (appId: string) => {
    useSoundStore.getState().playSound('click');
    setDockMenu({ isOpen: false, appId: null, x: 0, y: 0 });
    closeWindow(appId);
  };

  return (
    <>
      <nav
        className="spatial-dock-container"
        aria-label="Açık Uygulamalar Çubuğu"
        onContextMenu={(e) => e.preventDefault()}
      >
        {openWindows.map((win) => {
          const localizedTitle = getLocalizedTitle(win.id, win.title, t);
          const isActive = activeWindowId === win.id && !win.isMinimized;
          const isMenuTarget = dockMenu.isOpen && dockMenu.appId === win.id;

          return (
            <button
              key={win.id}
              type="button"
              className={`dock-item ${isActive ? 'active' : ''} ${isMenuTarget ? 'menu-open' : ''}`}
              onClick={() => handleDockItemClick(win.id)}
              onContextMenu={(e) => handleDockItemContextMenu(e, win.id)}
              aria-label={`${localizedTitle} - ${t('dock_manage_window')}`}
              title={localizedTitle}
              data-testid={`dock-item-${win.id}`}
            >
              <AppIconResolver appId={win.id} size={24} />
              <span className="dock-tooltip">{localizedTitle}</span>
              <span
                className="dock-dot"
                data-testid={`dock-dot-${win.id}`}
                style={{
                  opacity: isActive ? 1 : 0.4,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Dock Context Menu (rendered in document.body to prevent layout clipping) */}
      {dockMenu.isOpen && dockMenu.appId && windows[dockMenu.appId] &&
        createPortal(
          <div
            role="menu"
            tabIndex={-1}
            className="window-titlebar-context-menu dock-context-menu"
            style={{ left: dockMenu.x, top: dockMenu.y }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDockMenu({ isOpen: false, appId: null, x: 0, y: 0 });
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
            data-testid="dock-context-menu"
          >
            <div className="dock-context-header">
              <span>{getLocalizedTitle(dockMenu.appId, windows[dockMenu.appId].title, t)}</span>
            </div>
            <button
              type="button"
              className="window-titlebar-context-item danger"
              data-testid="dock-menu-close-btn"
              onClick={() => handleCloseFromDock(dockMenu.appId!)}
            >
              <X size={14} />
              <span>{t('window_ctx_close')}</span>
            </button>
            <button
              type="button"
              className="window-titlebar-context-item"
              data-testid="dock-menu-toggle-btn"
              onClick={() => {
                const targetWin = windows[dockMenu.appId!];
                setDockMenu({ isOpen: false, appId: null, x: 0, y: 0 });
                if (targetWin?.isMinimized) {
                  focusWindow(dockMenu.appId!);
                } else {
                  minimizeWindow(dockMenu.appId!);
                }
              }}
            >
              {windows[dockMenu.appId].isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
              <span>
                {windows[dockMenu.appId].isMinimized ? t('window_ctx_restore') : t('window_ctx_minimize')}
              </span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
};
