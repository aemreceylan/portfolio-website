import React, { lazy } from 'react';
import { AppManifest } from '@personal-os/shared';

/**
 * Dynamically lazy-loaded application components to ensure minimal initial bundle size
 */
export const TerminalAppComponent = lazy(() =>
  import('#apps/terminal/TerminalApp').then((m) => ({ default: m.TerminalApp }))
);

export const SettingsAppComponent = lazy(() =>
  import('#apps/settings/SettingsApp').then((m) => ({ default: m.SettingsApp }))
);

/**
 * Core Terminal application manifest
 */
export const terminalManifest: AppManifest = {
  id: 'terminal',
  name: 'Terminal CLI',
  description: 'Interactive Unix-like command-line interface',
  iconName: 'Terminal',
  category: 'system',
  defaultSize: { width: 720, height: 460 },
  minSize: { width: 360, height: 260 },
  resizable: true,
  singleton: true,
};

/**
 * System Settings application manifest
 */
export const settingsManifest: AppManifest = {
  id: 'settings',
  name: 'Ayarlar',
  description: 'System preferences, language localization and options',
  iconName: 'Settings',
  category: 'system',
  defaultSize: { width: 660, height: 480 },
  minSize: { width: 360, height: 280 },
  resizable: true,
  singleton: true,
};

/**
 * Central registry of all active applications available in AEC Desktop.
 * Scoped strictly to Terminal and Settings as requested.
 */
export const APP_REGISTRY: Record<
  string,
  {
    manifest: AppManifest;
    component: React.ComponentType<{ manifest: AppManifest }>;
  }
> = {
  terminal: {
    manifest: terminalManifest,
    component: () => <TerminalAppComponent />,
  },
  settings: {
    manifest: settingsManifest,
    component: () => <SettingsAppComponent />,
  },
};
