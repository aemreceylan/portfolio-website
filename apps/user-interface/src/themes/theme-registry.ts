import { ThemeDefinition, ThemeId, ThemeMeta } from './theme.types';
import { spatialGlassTheme } from './spatial-glass.theme';
import { swissIndustrialTheme } from './swiss-industrial.theme';
import { cyberpunkNeonTheme } from './cyberpunk-neon.theme';
import { classicMacTheme } from './classic-mac.theme';

export const DEFAULT_THEME: ThemeId = 'spatial-glass';

class ThemeRegistry {
  private themes: Map<string, ThemeDefinition> = new Map();

  constructor() {
    this.registerTheme(spatialGlassTheme);
    this.registerTheme(swissIndustrialTheme);
    this.registerTheme(cyberpunkNeonTheme);
    this.registerTheme(classicMacTheme);
  }

  /**
   * Registers a new or custom theme into the global OS theme system.
   * If a theme with the same ID already exists, it will be safely replaced.
   */
  public registerTheme(theme: ThemeDefinition): void {
    if (!theme || !theme.id) {
      throw new Error('Invalid theme definition: id is required.');
    }
    this.themes.set(theme.id, theme);
  }

  /**
   * Retrieves a theme by its unique ID.
   * Falls back gracefully to DEFAULT_THEME if the requested theme is not found.
   */
  public getTheme(id?: string): ThemeDefinition {
    if (id && this.themes.has(id)) {
      return this.themes.get(id)!;
    }
    const defaultTheme = this.themes.get(DEFAULT_THEME);
    if (!defaultTheme) {
      return spatialGlassTheme;
    }
    return defaultTheme;
  }

  /**
   * Checks whether a theme ID is registered.
   */
  public hasTheme(id?: string): boolean {
    if (!id) return false;
    return this.themes.has(id);
  }

  /**
   * Returns all registered themes.
   */
  public getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /**
   * Returns metadata list for all registered themes (suitable for UI selectors & settings).
   */
  public getThemeMetaList(): ThemeMeta[] {
    return this.getAllThemes().map((t) => ({
      id: t.id,
      name: t.name,
      subtitle: t.subtitle,
      description: t.description,
      accentColor: t.colors.accentColor,
      accentRgb: t.colors.accentRgb,
      wallpaperBackground: t.colors.wallpaperBackground,
    }));
  }

  /**
   * Applies the theme styles, attributes, and CSS variables to document.documentElement.
   */
  public applyThemeToDom(themeId?: string): void {
    if (typeof document === 'undefined') return;

    const theme = this.getTheme(themeId);
    const root = document.documentElement;

    root.setAttribute('data-theme', theme.id);
    root.style.setProperty('--wallpaper-bg', theme.colors.wallpaperBackground);
    root.style.setProperty('--color-accent', theme.colors.accentColor);
    root.style.setProperty('--color-accent-subtle', `rgba(${theme.colors.accentRgb}, 0.12)`);
    root.style.setProperty('--color-accent-border', `rgba(${theme.colors.accentRgb}, 0.35)`);
    root.style.setProperty('--aurora-cyan', theme.colors.accentColor);
    root.style.setProperty('--accent-color', theme.colors.accentColor);
    root.style.setProperty('--accent-rgb', theme.colors.accentRgb);

    if (theme.typography?.fontSans) {
      root.style.setProperty('--font-sans', theme.typography.fontSans);
    }
    if (theme.typography?.fontMono) {
      root.style.setProperty('--font-mono', theme.typography.fontMono);
    }

    if (theme.colors.extraCssVariables) {
      Object.entries(theme.colors.extraCssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }
}

export const themeRegistry = new ThemeRegistry();

export const registerTheme = (theme: ThemeDefinition): void => themeRegistry.registerTheme(theme);
export const getTheme = (id?: string): ThemeDefinition => themeRegistry.getTheme(id);
export const getAllThemes = (): ThemeDefinition[] => themeRegistry.getAllThemes();
export const hasTheme = (id?: string): boolean => themeRegistry.hasTheme(id);
export const applyThemeToDom = (themeId?: string): void => themeRegistry.applyThemeToDom(themeId);
export const getThemeMetaList = (): ThemeMeta[] => themeRegistry.getThemeMetaList();
