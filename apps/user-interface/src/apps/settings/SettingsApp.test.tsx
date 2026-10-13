import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsApp } from './SettingsApp';
import { useI18nStore } from '#i18n/i18n.store';
import { useThemeStore } from '#stores/theme.store';
import { useFileSystemStore } from '#stores/filesystem.store';

describe('SettingsApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useThemeStore.getState().setWallpaper('deep-space');
    useFileSystemStore.getState().reset();
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

  it('should render factory reset section and trigger reset on confirmation', () => {
    // 1. Modify some state
    useThemeStore.getState().setWallpaper('cyberpunk');
    useFileSystemStore.getState().createFile('temp-note.txt', 'test');

    render(<SettingsApp />);

    expect(screen.getByText('Factory Reset')).toBeInTheDocument();
    const resetTrigger = screen.getByTestId('settings-reset-button');
    expect(resetTrigger).toBeInTheDocument();
    expect(resetTrigger).toHaveTextContent('Reset to Defaults');
    expect(resetTrigger).not.toHaveTextContent(/\(sudo rm -rf\)/);

    // Click reset trigger to open confirm box
    fireEvent.click(resetTrigger);

    expect(screen.getByTestId('settings-reset-confirm-box')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to reset\?/i)).toBeInTheDocument();

    // Click confirm execute button
    const confirmBtn = screen.getByTestId('settings-reset-execute-button');
    fireEvent.click(confirmBtn);

    // Verify reset executed
    expect(useThemeStore.getState().wallpaper).toBe('deep-space');
    expect(useFileSystemStore.getState().getFile('temp-note.txt')).toBeUndefined();
    expect(screen.getByTestId('settings-reset-success-alert')).toBeInTheDocument();
  });

  it('should allow cancelling factory reset confirmation', () => {
    render(<SettingsApp />);

    const resetTrigger = screen.getByTestId('settings-reset-button');
    fireEvent.click(resetTrigger);

    expect(screen.getByTestId('settings-reset-confirm-box')).toBeInTheDocument();

    const cancelBtn = screen.getByTestId('settings-reset-cancel-button');
    fireEvent.click(cancelBtn);

    expect(screen.queryByTestId('settings-reset-confirm-box')).not.toBeInTheDocument();
  });
});

