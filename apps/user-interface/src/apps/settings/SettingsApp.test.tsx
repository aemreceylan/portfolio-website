import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsApp } from './SettingsApp';
import { useI18nStore } from '#i18n/i18n.store';
import { useThemeStore } from '#stores/theme.store';

describe('SettingsApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useThemeStore.getState().setWallpaper('deep-space');
  });

  it('should render language selection options including Turkish and English', () => {
    render(<SettingsApp />);

    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Language & Localization')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
  });

  it('should switch active language when a language card is clicked', () => {
    render(<SettingsApp />);

    const turkishButton = screen.getByRole('button', { name: /Türkçe/i });
    fireEvent.click(turkishButton);

    expect(useI18nStore.getState().currentLanguage).toBe('tr');
    expect(screen.getByText('Sistem Ayarları')).toBeInTheDocument();
  });

  it('should render wallpaper options and switch wallpaper on click', () => {
    render(<SettingsApp />);

    const cyberpunkWp = screen.getByRole('button', { name: /Wallpaper Cyberpunk Neon/i });
    expect(cyberpunkWp).toBeInTheDocument();

    fireEvent.click(cyberpunkWp);
    expect(useThemeStore.getState().wallpaper).toBe('cyberpunk');
    // Auto accent should update to purple
    expect(useThemeStore.getState().accent).toBe('purple');
  });

  it('should allow manual accent color selection', () => {
    render(<SettingsApp />);

    const emeraldBtn = screen.getByRole('button', { name: /Accent color Matrix Emerald/i });
    fireEvent.click(emeraldBtn);

    expect(useThemeStore.getState().accent).toBe('emerald');
    expect(useThemeStore.getState().isAutoAccent).toBe(false);
  });
});
