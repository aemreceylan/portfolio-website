import { create } from 'zustand';
import { useSoundStore } from '#stores/sound.store';
import {
  ThemeId,
  ThemeMeta,
  DEFAULT_THEME,
  hasTheme,
  applyThemeToDom as applyThemeDom,
  getThemeMetaList,
} from '#themes/index';

export type { ThemeId, ThemeMeta };
export { DEFAULT_THEME };

export const THEME_OPTIONS: ThemeMeta[] = getThemeMetaList();

export const THEME_DEFINITIONS: Record<string, ThemeMeta> = Object.fromEntries(
  getThemeMetaList().map((t) => [t.id, t])
);

export const THEME_STORAGE_KEY = 'aec_portfolio_active_theme';

/**
 * Applies the selected theme attributes and CSS variables to the document element root
 */
export function applyThemeToDom(themeId: string): void {
  applyThemeDom(themeId);
}

/**
 * Resolves initial theme with 3-tier precedence:
 * 1. User saved preference in localStorage (validated against registered themes)
 * 2. Backend provided default configuration (for future server-driven theme defaults)
 * 3. Default fallback theme ('spatial-glass' on develop)
 */
export function resolveInitialTheme(backendDefault?: string): ThemeId {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && hasTheme(saved)) {
        applyThemeToDom(saved);
        return saved;
      }
    } catch {
      // Ignore localStorage access errors (incognito/restricted)
    }
  }

  const selected = backendDefault && hasTheme(backendDefault)
    ? backendDefault
    : DEFAULT_THEME;

  applyThemeToDom(selected);
  return selected;
}

export interface ThemeStoreState {
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  initializeTheme: (backendDefault?: string) => void;
  reset: () => void;
}

export const useThemeStore = create<ThemeStoreState>((set) => {
  const initialTheme = resolveInitialTheme();

  return {
    currentTheme: initialTheme,

    setTheme: (themeId: ThemeId) => {
      const validTheme: ThemeId = hasTheme(themeId) ? themeId : DEFAULT_THEME;
      applyThemeToDom(validTheme);

      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, validTheme);
        } catch {
          // Ignore localStorage errors
        }
      }

      set({ currentTheme: validTheme });
      useSoundStore.getState().playSound('theme-switch');
    },

    initializeTheme: (backendDefault?: string) => {
      const resolved = resolveInitialTheme(backendDefault);
      set({ currentTheme: resolved });
    },

    reset: () => {
      applyThemeToDom(DEFAULT_THEME);
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(THEME_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
      set({ currentTheme: DEFAULT_THEME });
    },
  };
});
