import { ThemeId } from '#themes/theme.types';

export type GameId = 'snake' | 'breakout' | 'space-defender';

export interface GameThemeStyle {
  background: string;
  gridLine: string;
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  glowColor: string;
  fontFamily: string;
  isRetroPixel?: boolean;
}

/**
 * Returns tailored visual styling parameters for game canvases and UI based on current theme.
 */
export function getGameThemeStyle(themeId: ThemeId | string): GameThemeStyle {
  switch (themeId) {
    case 'cyberpunk-neon':
      return {
        background: '#040711',
        gridLine: 'rgba(6, 182, 212, 0.12)',
        primary: '#f43f5e', // Neon Pink
        secondary: '#06b6d4', // Cyber Cyan
        accent: '#facc15', // High Voltage Yellow
        textColor: '#f1f5f9',
        textMuted: '#94a3b8',
        cardBg: 'rgba(9, 13, 22, 0.85)',
        cardBorder: 'rgba(244, 63, 94, 0.35)',
        badgeBg: 'rgba(244, 63, 94, 0.18)',
        glowColor: 'rgba(244, 63, 94, 0.65)',
        fontFamily: "'JetBrains Mono', monospace",
        isRetroPixel: false,
      };

    case 'swiss-industrial':
      return {
        background: '#0e1015',
        gridLine: 'rgba(255, 255, 255, 0.08)',
        primary: '#ff5500', // Safety Orange
        secondary: '#e2e8f0', // Crisp White
        accent: '#ff5500',
        textColor: '#f8fafc',
        textMuted: '#64748b',
        cardBg: '#15181f',
        cardBorder: '#2e3440',
        badgeBg: 'rgba(255, 85, 0, 0.15)',
        glowColor: 'rgba(255, 85, 0, 0.3)',
        fontFamily: "'JetBrains Mono', monospace",
        isRetroPixel: false,
      };

    case 'classic-mac':
      return {
        background: '#ffffff',
        gridLine: '#d1d5db',
        primary: '#000080', // Classic Mac Navy
        secondary: '#111827',
        accent: '#2563eb',
        textColor: '#111827',
        textMuted: '#4b5563',
        cardBg: '#dcdfe5',
        cardBorder: '#111827',
        badgeBg: '#cbd5e1',
        glowColor: 'transparent',
        fontFamily: "'Geneva', 'Chicago', monospace",
        isRetroPixel: true,
      };

    case 'spatial-glass':
    default:
      return {
        background: 'rgba(8, 12, 22, 0.95)',
        gridLine: 'rgba(56, 189, 248, 0.08)',
        primary: '#38bdf8', // Aurora Cyan
        secondary: '#818cf8', // Indigo Glow
        accent: '#38bdf8',
        textColor: '#f8fafc',
        textMuted: '#94a3b8',
        cardBg: 'rgba(15, 23, 42, 0.65)',
        cardBorder: 'rgba(56, 189, 248, 0.25)',
        badgeBg: 'rgba(56, 189, 248, 0.15)',
        glowColor: 'rgba(56, 189, 248, 0.5)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        isRetroPixel: false,
      };
  }
}

export interface GameInfo {
  id: GameId;
  title: string;
  badge: string;
  description: string;
  controlsHelp: string;
  accentColor: string;
}
