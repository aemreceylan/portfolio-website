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

export const MarkdownViewerAppComponent = lazy(() =>
  import('#apps/markdown/MarkdownViewerApp').then((m) => ({ default: m.MarkdownViewerApp }))
);

export const JsIdeAppComponent = lazy(() =>
  import('#apps/ide/JsIdeApp').then((m) => ({ default: m.JsIdeApp }))
);

/**
 * Core Terminal application manifest
 */
export const terminalManifest: AppManifest = {
  id: 'terminal',
  name: 'Terminal CLI',
  description: 'Interactive Linux command-line interface with VFS and GNU nano',
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
  description: 'System preferences, wallpapers, accent colors and 7-language localization',
  iconName: 'Settings',
  category: 'system',
  defaultSize: { width: 680, height: 500 },
  minSize: { width: 360, height: 280 },
  resizable: true,
  singleton: true,
};

/**
 * Markdown & Document Editor application manifest
 */
export const markdownViewerManifest: AppManifest = {
  id: 'markdown-viewer',
  name: 'Markdown Editörü',
  description: 'Zengin Markdown ve metin belgesi editörü (canlı önizleme ve düzenleme)',
  iconName: 'FileText',
  category: 'utilities',
  defaultSize: { width: 760, height: 540 },
  minSize: { width: 380, height: 280 },
  resizable: true,
  singleton: true,
};

/**
 * JavaScript IDE & Code Studio application manifest
 */
export const jsIdeManifest: AppManifest = {
  id: 'js-ide',
  name: 'JavaScript IDE',
  description: 'Code editor with sandboxed execution and real-time console output',
  iconName: 'Code2',
  category: 'utilities',
  defaultSize: { width: 800, height: 580 },
  minSize: { width: 420, height: 320 },
  resizable: true,
  singleton: true,
};

/**
 * Central registry of all active applications available in AEC Desktop.
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
  'markdown-viewer': {
    manifest: markdownViewerManifest,
    component: () => <MarkdownViewerAppComponent />,
  },
  'js-ide': {
    manifest: jsIdeManifest,
    component: () => <JsIdeAppComponent />,
  },
};
