import React from 'react';
import {
  Terminal,
  Settings,
  FileText,
  Code2,
  Gamepad2,
  Palette,
  Music,
  Volume2,
  VolumeX,
  Minimize2,
} from 'lucide-react';
import { CommandPaletteItem } from './command-palette.types';
import {
  terminalManifest,
  settingsManifest,
  markdownViewerManifest,
  jsIdeManifest,
  gameHubManifest,
} from '#apps/app-registry';
import { useWindowManager } from '#stores/window-manager.store';
import { useFileSystemStore, VFSFile } from '#stores/filesystem.store';
import { useThemeStore } from '#stores/theme.store';
import { useMusicStore } from '#stores/music.store';
import { useSoundStore } from '#stores/sound.store';
import { useTranslation } from '#i18n/i18n.store';
import { Translations } from '#i18n/translations';
import { useCommandPaletteStore } from '#stores/command-palette.store';

type TranslateFn = (key: keyof Translations, params?: Record<string, string | number>) => string;

/**
 * Builds application launch items for command palette
 */
function buildAppItems(
  openWindow: ReturnType<typeof useWindowManager.getState>['openWindow'],
  closePalette: () => void,
  t: TranslateFn
): CommandPaletteItem[] {
  return [
    {
      id: 'app-terminal',
      title: t('appName_terminal'),
      description: t('appDesc_terminal'),
      category: 'apps',
      categoryLabel: t('spotlight_category_apps'),
      icon: <Terminal size={18} aria-hidden="true" />,
      onSelect: () => {
        openWindow(terminalManifest);
        closePalette();
      },
    },
    {
      id: 'app-settings',
      title: t('appName_settings'),
      description: t('appDesc_settings'),
      category: 'apps',
      categoryLabel: t('spotlight_category_apps'),
      icon: <Settings size={18} aria-hidden="true" />,
      onSelect: () => {
        openWindow(settingsManifest);
        closePalette();
      },
    },
    {
      id: 'app-markdown',
      title: t('appName_markdown'),
      description: t('appDesc_markdown'),
      category: 'apps',
      categoryLabel: t('spotlight_category_apps'),
      icon: <FileText size={18} aria-hidden="true" />,
      onSelect: () => {
        openWindow(markdownViewerManifest);
        closePalette();
      },
    },
    {
      id: 'app-ide',
      title: t('appName_ide'),
      description: t('appDesc_ide'),
      category: 'apps',
      categoryLabel: t('spotlight_category_apps'),
      icon: <Code2 size={18} aria-hidden="true" />,
      onSelect: () => {
        openWindow(jsIdeManifest);
        closePalette();
      },
    },
    {
      id: 'app-games',
      title: t('appName_game_hub'),
      description: t('appDesc_game_hub'),
      category: 'apps',
      categoryLabel: t('spotlight_category_apps'),
      icon: <Gamepad2 size={18} aria-hidden="true" />,
      onSelect: () => {
        openWindow(gameHubManifest);
        closePalette();
      },
    },
  ];
}

/**
 * Builds virtual file opening items for command palette
 */
function buildFileItems(
  files: Record<string, VFSFile>,
  openInViewer: (id: string, mode: 'preview') => void,
  openInIde: (id: string) => void,
  openWindow: ReturnType<typeof useWindowManager.getState>['openWindow'],
  closePalette: () => void,
  t: TranslateFn
): CommandPaletteItem[] {
  return Object.values(files).map((file) => ({
    id: `file-${file.id}`,
    title: file.name,
    description: t('spotlight_category_files'),
    category: 'files',
    categoryLabel: t('spotlight_category_files'),
    icon: file.extension === 'js' ? <Code2 size={18} /> : <FileText size={18} />,
    badge: file.extension.toUpperCase(),
    onSelect: () => {
      if (file.extension === 'js') {
        openInIde(file.id);
        openWindow(jsIdeManifest);
      } else {
        openInViewer(file.id, 'preview');
        openWindow(markdownViewerManifest);
      }
      closePalette();
    },
  }));
}

/**
 * Builds theme switching items for command palette
 */
function buildThemeItems(
  currentTheme: string,
  setTheme: (id: string) => void,
  closePalette: () => void,
  t: TranslateFn
): CommandPaletteItem[] {
  const themeList = [
    { id: 'spatial-glass', name: 'Spatial Dark Glass', desc: t('settings_theme_desc_spatial_glass') },
    { id: 'swiss-industrial', name: 'Swiss Industrial', desc: t('settings_theme_desc_swiss_industrial') },
    { id: 'cyberpunk-neon', name: 'Cyberpunk Neon', desc: t('settings_theme_desc_cyberpunk_neon') },
    { id: 'classic-mac', name: 'Classic Macintosh', desc: t('settings_theme_desc_classic_mac') },
  ];

  return themeList.map((theme) => {
    const isActive = currentTheme === theme.id;
    return {
      id: `theme-${theme.id}`,
      title: theme.name,
      description: theme.desc,
      category: 'themes',
      categoryLabel: t('spotlight_category_themes'),
      icon: <Palette size={18} aria-hidden="true" />,
      badge: isActive ? t('settings_active_badge') : undefined,
      onSelect: () => {
        setTheme(theme.id);
        closePalette();
      },
    };
  });
}

/**
 * Builds system action items (music, sound, window minimization)
 */
function buildActionItems(
  isPlaying: boolean,
  togglePlay: () => void,
  isMuted: boolean,
  toggleMute: () => void,
  minimizeAll: () => void,
  closePalette: () => void,
  t: TranslateFn
): CommandPaletteItem[] {
  return [
    {
      id: 'action-toggle-music',
      title: t('spotlight_action_toggle_music'),
      description: isPlaying ? t('music_pause') : t('music_play'),
      category: 'actions',
      categoryLabel: t('spotlight_category_actions'),
      icon: <Music size={18} aria-hidden="true" />,
      badge: isPlaying ? 'ON' : 'OFF',
      onSelect: () => {
        togglePlay();
        closePalette();
      },
    },
    {
      id: 'action-toggle-sound',
      title: t('spotlight_action_toggle_sound'),
      description: isMuted ? t('sound_unmute') : t('sound_mute'),
      category: 'actions',
      categoryLabel: t('spotlight_category_actions'),
      icon: isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />,
      badge: isMuted ? 'MUTED' : 'ACTIVE',
      onSelect: () => {
        toggleMute();
        closePalette();
      },
    },
    {
      id: 'action-minimize-all',
      title: t('spotlight_action_minimize_all'),
      description: t('window_minimize'),
      category: 'actions',
      categoryLabel: t('spotlight_category_actions'),
      icon: <Minimize2 size={18} aria-hidden="true" />,
      onSelect: () => {
        minimizeAll();
        closePalette();
      },
    },
  ];
}

/**
 * Custom hook resolving all actionable items for the Spotlight Command Palette.
 */
export function useCommandPaletteItems(): CommandPaletteItem[] {
  const { openWindow, windows, minimizeWindow } = useWindowManager();
  const { files, openInViewer, openInIde } = useFileSystemStore();
  const { currentTheme, setTheme } = useThemeStore();
  const { isPlaying, togglePlay } = useMusicStore();
  const { isMuted, toggleMute } = useSoundStore();
  const { t } = useTranslation();
  const { close } = useCommandPaletteStore();

  const handleMinimizeAll = () => {
    Object.keys(windows).forEach((id) => {
      if (windows[id]?.isOpen && !windows[id]?.isMinimized) {
        minimizeWindow(id);
      }
    });
  };

  const appItems = buildAppItems(openWindow, close, t);
  const fileItems = buildFileItems(files, openInViewer, openInIde, openWindow, close, t);
  const themeItems = buildThemeItems(currentTheme, setTheme, close, t);
  const actionItems = buildActionItems(
    isPlaying,
    togglePlay,
    isMuted,
    toggleMute,
    handleMinimizeAll,
    close,
    t
  );

  return [...appItems, ...fileItems, ...themeItems, ...actionItems];
}
