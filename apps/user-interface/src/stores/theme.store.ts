import { create } from 'zustand';

export type WallpaperId = 'deep-space' | 'cyberpunk' | 'emerald-matrix' | 'obsidian-minimal';
export type AccentColorId = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';

export interface WallpaperOption {
  id: WallpaperId;
  name: string;
  background: string;
  defaultAccent: AccentColorId;
  previewGradient: string;
}

export interface AccentColorOption {
  id: AccentColorId;
  name: string;
  hex: string;
  rgb: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'deep-space',
    name: 'Deep Space Nebula',
    background: '#0d0f12',
    defaultAccent: 'cyan',
    previewGradient: 'linear-gradient(180deg, #181b21 0%, #0d0f12 100%)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    background: '#101115',
    defaultAccent: 'purple',
    previewGradient: 'linear-gradient(180deg, #1b1d24 0%, #101115 100%)',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    background: '#0d100e',
    defaultAccent: 'emerald',
    previewGradient: 'linear-gradient(180deg, #151a17 0%, #0d100e 100%)',
  },
  {
    id: 'obsidian-minimal',
    name: 'Obsidian Minimal',
    background: '#08080a',
    defaultAccent: 'rose',
    previewGradient: 'linear-gradient(180deg, #141416 0%, #08080a 100%)',
  },
];

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: 'cyan', name: 'Aurora Cyan', hex: '#ff5500', rgb: '255, 85, 0' },
  { id: 'purple', name: 'Neon Purple', hex: '#71717a', rgb: '113, 113, 122' },
  { id: 'emerald', name: 'Matrix Emerald', hex: '#16a34a', rgb: '22, 163, 74' },
  { id: 'amber', name: 'Sunset Amber', hex: '#d97706', rgb: '217, 119, 6' },
  { id: 'rose', name: 'Cyber Rose', hex: '#dc2626', rgb: '220, 38, 38' },
];

const THEME_STORAGE_KEY = 'aec_portfolio_theme';

interface ThemeStoreState {
  wallpaper: WallpaperId;
  accent: AccentColorId;
  isAutoAccent: boolean;

  setWallpaper: (wallpaper: WallpaperId) => void;
  setAccent: (accent: AccentColorId) => void;
  setAutoAccent: (isAuto: boolean) => void;
  reset: () => void;
}

/**
 * Applies CSS variable tokens to document element root
 */
function applyThemeToDom(wallpaperId: WallpaperId, accentId: AccentColorId) {
  if (typeof document === 'undefined') return;

  const wp = WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId) || WALLPAPER_OPTIONS[0];
  const ac = ACCENT_COLOR_OPTIONS.find((a) => a.id === accentId) || ACCENT_COLOR_OPTIONS[0];

  document.documentElement.style.setProperty('--wallpaper-bg', wp.background);
  document.documentElement.style.setProperty('--color-accent', ac.hex);
  document.documentElement.style.setProperty('--color-accent-subtle', `rgba(${ac.rgb}, 0.12)`);
  document.documentElement.style.setProperty('--color-accent-border', `rgba(${ac.rgb}, 0.35)`);
  document.documentElement.style.setProperty('--aurora-cyan', ac.hex);
  document.documentElement.style.setProperty('--accent-color', ac.hex);
  document.documentElement.style.setProperty('--accent-rgb', ac.rgb);
}

function getInitialTheme(): { wallpaper: WallpaperId; accent: AccentColorId; isAutoAccent: boolean } {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wallpaper && parsed.accent) {
          applyThemeToDom(parsed.wallpaper, parsed.accent);
          return {
            wallpaper: parsed.wallpaper,
            accent: parsed.accent,
            isAutoAccent: parsed.isAutoAccent ?? true,
          };
        }
      }
    } catch {
      // Safe fallback
    }
  }

  applyThemeToDom('deep-space', 'cyan');
  return { wallpaper: 'deep-space', accent: 'cyan', isAutoAccent: true };
}

export const useThemeStore = create<ThemeStoreState>((set, get) => {
  const initial = getInitialTheme();

  return {
    wallpaper: initial.wallpaper,
    accent: initial.accent,
    isAutoAccent: initial.isAutoAccent,

    setWallpaper: (wpId) => {
      const current = get();
      const wp = WALLPAPER_OPTIONS.find((w) => w.id === wpId) || WALLPAPER_OPTIONS[0];
      const nextAccent = current.isAutoAccent ? wp.defaultAccent : current.accent;

      applyThemeToDom(wpId, nextAccent);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify({ wallpaper: wpId, accent: nextAccent, isAutoAccent: current.isAutoAccent })
        );
      }

      set({ wallpaper: wpId, accent: nextAccent });
    },

    setAccent: (acId) => {
      const current = get();
      applyThemeToDom(current.wallpaper, acId);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify({ wallpaper: current.wallpaper, accent: acId, isAutoAccent: false })
        );
      }

      set({ accent: acId, isAutoAccent: false });
    },

    setAutoAccent: (isAuto) => {
      const current = get();
      const wp = WALLPAPER_OPTIONS.find((w) => w.id === current.wallpaper) || WALLPAPER_OPTIONS[0];
      const nextAccent = isAuto ? wp.defaultAccent : current.accent;

      applyThemeToDom(current.wallpaper, nextAccent);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify({ wallpaper: current.wallpaper, accent: nextAccent, isAutoAccent: isAuto })
        );
      }

      set({ isAutoAccent: isAuto, accent: nextAccent });
    },

    reset: () => {
      applyThemeToDom('deep-space', 'cyan');
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(THEME_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      set({ wallpaper: 'deep-space', accent: 'cyan', isAutoAccent: true });
    },
  };
});
