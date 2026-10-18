import React from 'react';
import { Terminal, Settings, FileText, Code2, BookOpen, Gamepad2, MessageSquare } from 'lucide-react';
import { ThemeDefinition, ThemeIconProps } from './theme.types';

const SpatialTerminalIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <Terminal size={size} className={className} />
);

const SpatialSettingsIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <Settings size={size} className={className} />
);

const SpatialMarkdownIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <FileText size={size} className={className} />
);

const SpatialJsIdeIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <Code2 size={size} className={className} />
);

const SpatialGameHubIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <Gamepad2 size={size} className={className} />
);

const SpatialBandIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <MessageSquare size={size} className={className} />
);

const SpatialTxtFileIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <FileText size={size} className={className} />
);

const SpatialMdFileIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <BookOpen size={size} className={className} />
);

const SpatialJsFileIcon: React.FC<ThemeIconProps> = ({ size = 24, className = '' }) => (
  <Code2 size={size} className={className} />
);

const SpatialBrandIcon: React.FC<ThemeIconProps> = ({ size = 20, className = '' }) => (
  <Terminal size={size} className={className} />
);

export const spatialGlassTheme: ThemeDefinition = {
  id: 'spatial-glass',
  name: 'Spatial Dark Glass',
  subtitle: 'VisionOS & Modern Spatial UI',
  description: 'Yarı saydam buzlu cam (24px blur), aurora neon ışıltısı ve akıcı mikro-interaksiyonlar.',
  colors: {
    accentColor: '#38bdf8',
    accentRgb: '56, 189, 248',
    wallpaperBackground:
      'radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.16) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.14) 0%, transparent 50%), #06070a',
  },
  typography: {
    fontSans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
  },
  icons: {
    appIcons: {
      terminal: SpatialTerminalIcon,
      'markdown-viewer': SpatialMarkdownIcon,
      'js-ide': SpatialJsIdeIcon,
      settings: SpatialSettingsIcon,
      'game-hub': SpatialGameHubIcon,
      band: SpatialBandIcon,
    },
    fileIcons: {
      txt: SpatialTxtFileIcon,
      md: SpatialMdFileIcon,
      js: SpatialJsFileIcon,
    },
    brandIcon: SpatialBrandIcon,
    fallbackAppIcon: SpatialTerminalIcon,
    fallbackFileIcon: SpatialTxtFileIcon,
  },
};
