import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  registerTheme,
  getTheme,
  getAllThemes,
  hasTheme,
  getThemeMetaList,
  applyThemeToDom,
  DEFAULT_THEME,
  ThemeDefinition,
  ThemeIconProps,
} from './index';
import { AppIconResolver } from '#components/icons/AppIconResolver';
import { useThemeStore } from '#stores/theme.store';

const CustomCyberpunkIcon: React.FC<ThemeIconProps> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Cyberpunk Terminal">
    <circle cx="12" cy="12" r="10" stroke="#f43f5e" strokeWidth="2" />
  </svg>
);

const cyberpunkTheme: ThemeDefinition = {
  id: 'cyberpunk-neon',
  name: 'Cyberpunk Neon',
  subtitle: 'Night City Syndicate',
  description: 'High-tech, low-life high-voltage neon styling.',
  colors: {
    accentColor: '#f43f5e',
    accentRgb: '244, 63, 94',
    wallpaperBackground: '#020617',
    extraCssVariables: {
      '--cyber-glow': '0 0 12px #f43f5e',
    },
  },
  typography: {
    fontSans: "'Oxanium', sans-serif",
    fontMono: "'Share Tech Mono', monospace",
  },
  icons: {
    appIcons: {
      terminal: CustomCyberpunkIcon,
    },
    fileIcons: {},
    brandIcon: CustomCyberpunkIcon,
    fallbackAppIcon: CustomCyberpunkIcon,
    fallbackFileIcon: CustomCyberpunkIcon,
  },
};

describe('ThemeRegistry Engine', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes with default built-in themes: spatial-glass and swiss-industrial', () => {
    expect(hasTheme('spatial-glass')).toBe(true);
    expect(hasTheme('swiss-industrial')).toBe(true);
    expect(getAllThemes().length).toBeGreaterThanOrEqual(2);
  });

  it('retrieves theme definitions correctly', () => {
    const spatial = getTheme('spatial-glass');
    expect(spatial.id).toBe('spatial-glass');
    expect(spatial.colors.accentColor).toBe('#38bdf8');

    const swiss = getTheme('swiss-industrial');
    expect(swiss.id).toBe('swiss-industrial');
    expect(swiss.colors.accentColor).toBe('#ff5500');
  });

  it('gracefully falls back to DEFAULT_THEME for non-existent theme IDs', () => {
    const unknown = getTheme('non-existent-theme-xyz');
    expect(unknown.id).toBe(DEFAULT_THEME);
  });

  it('applies theme attributes and CSS variables onto document.documentElement', () => {
    applyThemeToDom('swiss-industrial');

    expect(document.documentElement.getAttribute('data-theme')).toBe('swiss-industrial');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#ff5500');
    expect(document.documentElement.style.getPropertyValue('--wallpaper-bg')).toBe('#0a0b0d');
  });

  it('allows registering a new custom theme without breaking existing system', () => {
    registerTheme(cyberpunkTheme);

    expect(hasTheme('cyberpunk-neon')).toBe(true);
    const retrieved = getTheme('cyberpunk-neon');
    expect(retrieved.name).toBe('Cyberpunk Neon');

    applyThemeToDom('cyberpunk-neon');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk-neon');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#f43f5e');
    expect(document.documentElement.style.getPropertyValue('--cyber-glow')).toBe('0 0 12px #f43f5e');
  });

  it('renders custom theme icons dynamically via AppIconResolver without hardcoded conditionals', () => {
    registerTheme(cyberpunkTheme);
    useThemeStore.getState().setTheme('cyberpunk-neon');

    const { container } = render(<AppIconResolver appId="terminal" size={28} />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Cyberpunk Terminal');
  });

  it('generates metadata list correctly for theme selectors', () => {
    const metaList = getThemeMetaList();
    const ids = metaList.map((m) => m.id);
    expect(ids).toContain('spatial-glass');
    expect(ids).toContain('swiss-industrial');
  });
});
