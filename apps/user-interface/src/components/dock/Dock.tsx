import React from 'react';
import { useWindowManager } from '#stores/window-manager.store';
import { useSoundStore } from '#stores/sound.store';
import { useTranslation } from '#i18n/i18n.store';
import { AppIconResolver } from '#components/icons/AppIconResolver';
import '#styles/dock.css';

/**
 * Dynamic Dock component that functions strictly as an Active Taskbar.
 * Displays only currently open or minimized applications. When all windows are closed,
 * the dock automatically stays hidden to maintain a clutter-free desktop.
 */
export const Dock: React.FC = () => {
  const { windows, activeWindowId, minimizeWindow, focusWindow } = useWindowManager();
  const { t } = useTranslation();

  // Filter and display strictly open (active or minimized) windows
  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  // Return null if no windows are open, keeping the desktop interface pristine
  if (openWindows.length === 0) {
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

  return (
    <nav className="spatial-dock-container" aria-label="Açık Uygulamalar Çubuğu">
      {openWindows.map((win) => {
        const titleKey = win.id === 'settings' ? 'appName_settings' : 'appName_terminal';
        const localizedTitle = t(titleKey);
        const isActive = activeWindowId === win.id && !win.isMinimized;

        return (
          <button
            key={win.id}
            type="button"
            className={`dock-item ${isActive ? 'active' : ''}`}
            onClick={() => handleDockItemClick(win.id)}
            aria-label={`${localizedTitle} - ${t('dock_manage_window')}`}
            title={localizedTitle}
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
  );
};
