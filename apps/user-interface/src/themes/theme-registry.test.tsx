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

const CustomMatrixIcon: React.FC<ThemeIconProps> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-label="Matrix Terminal">
    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
  </svg>
);

const matrixTheme: ThemeDefinition = {
  id: 'matrix-green',
  name: 'Matrix Green',
  subtitle: 'Digital Rain Terminal',
  description: 'Pure green phosphor phosphor CRT digital stream.',
  colors: {
    accentColor: '#22c55e',
    accentRgb: '34, 197, 94',
    wallpaperBackground: '#010b04',
    extraCssVariables: {
      '--matrix-glow': '0 0 12px #22c55e',
    },
  },
  typography: {
    fontSans: "'JetBrains Mono', monospace",
    fontMono: "'JetBrains Mono', monospace",
  },
  icons: {
    appIcons: {
      terminal: CustomMatrixIcon,
    },
    fileIcons: {},
    brandIcon: CustomMatrixIcon,
    fallbackAppIcon: CustomMatrixIcon,
    fallbackFileIcon: CustomMatrixIcon,
  },
};

describe('ThemeRegistry Engine', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes with default built-in themes: spatial-glass, swiss-industrial, cyberpunk-neon, and classic-mac', () => {
    expect(hasTheme('spatial-glass')).toBe(true);
    expect(hasTheme('swiss-industrial')).toBe(true);
    expect(hasTheme('cyberpunk-neon')).toBe(true);
    expect(hasTheme('classic-mac')).toBe(true);
    expect(getAllThemes().length).toBeGreaterThanOrEqual(4);
  });

  it('retrieves theme definitions correctly', () => {
    const spatial = getTheme('spatial-glass');
    expect(spatial.id).toBe('spatial-glass');
    expect(spatial.colors.accentColor).toBe('#38bdf8');

    const swiss = getTheme('swiss-industrial');
    expect(swiss.id).toBe('swiss-industrial');
    expect(swiss.colors.accentColor).toBe('#ff5500');

    const cyber = getTheme('cyberpunk-neon');
    expect(cyber.id).toBe('cyberpunk-neon');
    expect(cyber.colors.accentColor).toBe('#f43f5e');

    const mac = getTheme('classic-mac');
    expect(mac.id).toBe('classic-mac');
    expect(mac.colors.accentColor).toBe('#000080');
  });

  it('gracefully falls back to DEFAULT_THEME for non-existent theme IDs', () => {
    const unknown = getTheme('non-existent-theme-xyz');
    expect(unknown.id).toBe(DEFAULT_THEME);
  });

  it('applies theme attributes and CSS variables onto document.documentElement', () => {
    applyThemeToDom('cyberpunk-neon');

    expect(document.documentElement.getAttribute('data-theme')).toBe('cyberpunk-neon');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#f43f5e');
    expect(document.documentElement.style.getPropertyValue('--color-accent-secondary')).toBe('#facc15');
  });

  it('allows registering a new custom theme without breaking existing system', () => {
    registerTheme(matrixTheme);

    expect(hasTheme('matrix-green')).toBe(true);
    const retrieved = getTheme('matrix-green');
    expect(retrieved.name).toBe('Matrix Green');

    applyThemeToDom('matrix-green');
    expect(document.documentElement.getAttribute('data-theme')).toBe('matrix-green');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#22c55e');
    expect(document.documentElement.style.getPropertyValue('--matrix-glow')).toBe('0 0 12px #22c55e');
  });

  it('renders custom theme icons dynamically via AppIconResolver without hardcoded conditionals', () => {
    registerTheme(matrixTheme);
    useThemeStore.getState().setTheme('matrix-green');

    const { container } = render(<AppIconResolver appId="terminal" size={28} />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Matrix Terminal');
  });

  it('generates metadata list correctly for theme selectors', () => {
    const metaList = getThemeMetaList();
    const ids = metaList.map((m) => m.id);
    expect(ids).toContain('spatial-glass');
    expect(ids).toContain('swiss-industrial');
    expect(ids).toContain('cyberpunk-neon');
    expect(ids).toContain('classic-mac');
  });
});
