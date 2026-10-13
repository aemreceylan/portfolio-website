import React, { useState, useEffect, Suspense } from 'react';
import { Terminal, Settings, AppWindow } from 'lucide-react';
import { useWindowManager } from '#stores/window-manager.store';
import { APP_REGISTRY } from '#apps/app-registry';
import { WindowFrame } from '#components/window/WindowFrame';
import { SpatialSuspenseSkeleton } from '#components/window/SpatialSuspenseSkeleton';
import { Dock } from '#components/dock/Dock';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/design-tokens.css';
import '#styles/window.css';
import '#styles/desktop.css';

/**
 * Maps iconName string from manifest to standard Lucide React SVG icon
 */
const renderDesktopIcon = (iconName: string) => {
  switch (iconName) {
    case 'Terminal':
      return <Terminal size={24} />;
    case 'Settings':
      return <Settings size={24} />;
    default:
      return <AppWindow size={24} />;
  }
};

/**
 * Primary Desktop Workspace Viewport orchestrating:
 * - Top spatial status bar (Brand logo, localized active window indicator, live digital clock)
 * - Desktop shortcuts grid (Terminal and Settings)
 * - Active floating windows rendered with 8-directional resizing
 * - Dynamic bottom taskbar dock (open apps only)
 */
export const Desktop: React.FC = () => {
  const { windows, activeWindowId, openWindow } = useWindowManager();
  const { t, currentLanguage } = useTranslation();
  const [timeString, setTimeString] = useState<string>('');

  // Update live clock every 10 seconds based on localized region
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [currentLanguage]);

  const activeWindow = activeWindowId ? windows[activeWindowId] : null;

  return (
    <main className="desktop-viewport">
      {/* Top Status Bar with enhanced thickness */}
      <header className="spatial-statusbar" role="banner">
        <div className="statusbar-left">
          <div className="os-brand">
            <span className="os-brand-icon" aria-hidden="true" />
            <span>AEC</span>
          </div>
          {activeWindow && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              / {activeWindow.title}
            </span>
          )}
        </div>

        <div className="statusbar-right">
          <time>{timeString}</time>
        </div>
      </header>

      {/* Desktop App Shortcuts (Terminal & Settings) */}
      <section className="desktop-apps-grid" aria-label="Desktop Applications">
        {Object.values(APP_REGISTRY).map(({ manifest }) => {
          const appName =
            manifest.id === 'settings' ? t('appName_settings') : t('appName_terminal');

          return (
            <div
              key={manifest.id}
              className="desktop-app-card"
              onClick={() => openWindow(manifest)}
              data-testid={`desktop-app-${manifest.id}`}
              role="button"
              tabIndex={0}
              aria-label={appName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') openWindow(manifest);
              }}
            >
              <div className="desktop-app-icon">{renderDesktopIcon(manifest.iconName)}</div>
              <span className="desktop-app-label">{appName}</span>
            </div>
          );
        })}
      </section>

      {/* Render Open Windows */}
      {Object.values(windows).map((win) => {
        if (!win.isOpen) return null;
        const appEntry = APP_REGISTRY[win.id];
        if (!appEntry) return null;

        const AppComponent = appEntry.component;

        return (
          <WindowFrame key={win.id} window={win}>
            <Suspense fallback={<SpatialSuspenseSkeleton appTitle={win.title} />}>
              <AppComponent manifest={appEntry.manifest} />
            </Suspense>
          </WindowFrame>
        );
      })}

      {/* Bottom Spatial Dock (Shows open applications only) */}
      <Dock />
    </main>
  );
};
