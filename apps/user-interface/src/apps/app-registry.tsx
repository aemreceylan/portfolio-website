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

export const GameHubAppComponent = lazy(() =>
  import('#apps/games/GameHubApp').then((m) => ({ default: m.GameHubApp }))
);

export const BandAppComponent = lazy(() =>
  import('#apps/band/BandApp').then((m) => ({ default: m.BandApp }))
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
  singleton: false,
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
  singleton: false,
};

/**
 * Arcade Game Hub & Retro Gaming Suite manifest
 */
export const gameHubManifest: AppManifest = {
  id: 'game-hub',
  name: 'Oyun Merkezi',
  description: 'Retro arcade games suite with theme-reactive visual styling and Web Audio procedural SFX',
  iconName: 'Gamepad2',
  category: 'utilities',
  defaultSize: { width: 760, height: 560 },
  minSize: { width: 440, height: 380 },
  resizable: true,
  singleton: false,
};

/**
 * BAND (Band Absolutely Not Discord) community platform manifest
 */
export const bandManifest: AppManifest = {
  id: 'band',
  name: 'BAND',
  description: 'Kişisel barındırmalı (self-hosted), güvenli ve gerçek zamanlı Mediasoup WebRTC SFU topluluk platformu',
  iconName: 'MessageSquare',
  category: 'projects',
  defaultSize: { width: 1040, height: 680 },
  minSize: { width: 560, height: 420 },
  resizable: true,
  singleton: false,
  metadata: {
    techStack: [
      'React 18',
      'Vite 6',
      'Mediasoup SFU v3',
      'Socket.IO 4',
      'MongoDB 8',
      'Express.js 5',
      'Argon2',
    ],
    githubUrl: 'https://github.com/aemreceylan/BAND',
    isSelfHosted: true,
    architectureOverview:
      'High-performance SFU (Selective Forwarding Unit) WebRTC pipeline with multi-core C++ worker routers and hierarchical in-memory cloud file system.',
  },
  container: {
    entryUrl: '/apps/band/index.html',
    enableDeviceSimulator: true,
    allowSameOrigin: true,
    allowHardware: { camera: true, microphone: true, displayCapture: true },
  },
};

/**
 * Central registry of all active applications available in AEC Desktop.
 */
export const APP_REGISTRY: Record<
  string,
  {
    manifest: AppManifest;
    component: React.ComponentType<{ manifest: AppManifest; windowId?: string }>;
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
  'game-hub': {
    manifest: gameHubManifest,
    component: () => <GameHubAppComponent />,
  },
  band: {
    manifest: bandManifest,
    component: (props) => <BandAppComponent {...props} />,
  },
};

