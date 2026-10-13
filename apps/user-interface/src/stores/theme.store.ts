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
    background:
      'radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.16) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.14) 0%, transparent 50%), #06070a',
    defaultAccent: 'cyan',
    previewGradient: 'linear-gradient(135deg, #06b6d4, #6366f1, #06070a)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    background:
      'radial-gradient(ellipse at 20% 30%, rgba(168, 85, 247, 0.22) 0%, transparent 50%), radial-gradient(ellipse at 75% 70%, rgba(236, 72, 153, 0.16) 0%, transparent 50%), #08070d',
    defaultAccent: 'purple',
    previewGradient: 'linear-gradient(135deg, #a855f7, #ec4899, #08070d)',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    background:
      'radial-gradient(ellipse at 30% 25%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(20, 184, 166, 0.16) 0%, transparent 50%), #060908',
    defaultAccent: 'emerald',
    previewGradient: 'linear-gradient(135deg, #10b981, #14b8a6, #060908)',
  },
  {
    id: 'obsidian-minimal',
    name: 'Obsidian Minimal',
    background:
      'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 60%), #050607',
    defaultAccent: 'rose',
    previewGradient: 'linear-gradient(135deg, #475569, #1e293b, #050607)',
  },
];

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: 'cyan', name: 'Aurora Cyan', hex: '#22d3ee', rgb: '34, 211, 238' },
  { id: 'purple', name: 'Neon Purple', hex: '#a855f7', rgb: '168, 85, 247' },
  { id: 'emerald', name: 'Matrix Emerald', hex: '#10b981', rgb: '16, 185, 129' },
  { id: 'amber', name: 'Sunset Amber', hex: '#f59e0b', rgb: '245, 158, 11' },
  { id: 'rose', name: 'Cyber Rose', hex: '#f43f5e', rgb: '244, 63, 94' },
];

const THEME_STORAGE_KEY = 'aec_portfolio_theme';

interface ThemeStoreState {
  wallpaper: WallpaperId;
  accent: AccentColorId;
  isAutoAccent: boolean;

  setWallpaper: (wallpaper: WallpaperId) => void;
  setAccent: (accent: AccentColorId) => void;
  setAutoAccent: (isAuto: boolean) => void;
}

/**
 * Applies CSS variable tokens to document element root
 */
function applyThemeToDom(wallpaperId: WallpaperId, accentId: AccentColorId) {
  if (typeof document === 'undefined') return;

  const wp = WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId) || WALLPAPER_OPTIONS[0];
  const ac = ACCENT_COLOR_OPTIONS.find((a) => a.id === accentId) || ACCENT_COLOR_OPTIONS[0];

  document.documentElement.style.setProperty('--wallpaper-bg', wp.background);
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
  };
});
