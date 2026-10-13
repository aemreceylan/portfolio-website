import { Terminal, Settings, AppWindow, FileText, Code2 } from 'lucide-react';
import { useWindowManager } from '#stores/window-manager.store';
import { APP_REGISTRY } from '#apps/app-registry';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/dock.css';

/**
 * Maps application iconName to corresponding Lucide icon component.
 * Guaranteed to only use non-deprecated standard geometric Lucide icons.
 */
const renderAppIcon = (iconName: string, size = 20) => {
  switch (iconName) {
    case 'Terminal':
      return <Terminal size={size} />;
    case 'Settings':
      return <Settings size={size} />;
    case 'FileText':
      return <FileText size={size} />;
    case 'Code2':
      return <Code2 size={size} />;
    default:
      return <AppWindow size={size} />;
  }
};

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
        const appEntry = APP_REGISTRY[win.id];
        const titleKey = win.id === 'settings' ? 'appName_settings' : 'appName_terminal';
        const localizedTitle = t(titleKey);
        const iconName = appEntry ? appEntry.manifest.iconName : win.iconName;
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
            {renderAppIcon(iconName)}
            <span className="dock-tooltip">{localizedTitle}</span>
            <span
              className="dock-dot"
              style={{
                background: isActive ? 'var(--aurora-cyan)' : 'var(--text-muted)',
                boxShadow: isActive ? '0 0 6px var(--aurora-cyan)' : 'none',
              }}
              data-testid={`dock-dot-${win.id}`}
            />
          </button>
        );
      })}
    </nav>
  );
};
