import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsApp } from './SettingsApp';
import { useI18nStore } from '#i18n/i18n.store';
import { useThemeStore } from '#stores/theme.store';
import { useFileSystemStore } from '#stores/filesystem.store';

describe('SettingsApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useThemeStore.getState().reset();
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

  it('should render dual-engine theme options and switch theme on card click', () => {
    render(<SettingsApp />);

    expect(screen.getByText('Spatial Dark Glass')).toBeInTheDocument();
    expect(screen.getByText('Swiss Industrial')).toBeInTheDocument();

    const swissCard = screen.getByTestId('theme-card-swiss-industrial');
    expect(swissCard).toBeInTheDocument();

    fireEvent.click(swissCard);
    expect(useThemeStore.getState().currentTheme).toBe('swiss-industrial');
    expect(document.documentElement.getAttribute('data-theme')).toBe('swiss-industrial');
  });

  it('should toggle back to spatial-glass theme on card click', () => {
    useThemeStore.getState().setTheme('swiss-industrial');

    render(<SettingsApp />);

    const spatialCard = screen.getByTestId('theme-card-spatial-glass');
    expect(spatialCard).toBeInTheDocument();

    fireEvent.click(spatialCard);
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
    expect(document.documentElement.getAttribute('data-theme')).toBe('spatial-glass');
  });

  it('should dynamically update selected theme info title and description when theme changes', () => {
    render(<SettingsApp />);

    // Default theme: Spatial Dark Glass
    expect(screen.getByText('Spatial Dark Glass Theme')).toBeInTheDocument();
    const desc = screen.getByTestId('settings-theme-description');
    expect(desc).toHaveTextContent('Hardware accelerated frosted glass, glowing borders and fluid spring physics.');

    // Switch to Swiss Industrial
    const swissCard = screen.getByTestId('theme-card-swiss-industrial');
    fireEvent.click(swissCard);

    expect(screen.getByText('Swiss Industrial Theme')).toBeInTheDocument();
    expect(desc).toHaveTextContent('Solid matte graphite chassis, Dieter Rams functionalism and safety orange accents.');

    // Switch to Cyberpunk Neon
    const cyberpunkCard = screen.getByTestId('theme-card-cyberpunk-neon');
    fireEvent.click(cyberpunkCard);

    expect(screen.getByText('Cyberpunk Neon Theme')).toBeInTheDocument();
    expect(desc).toHaveTextContent('High-voltage neon glow, deep OLED obsidian surfaces and cybernetic HUD telemetry.');

    // Switch to Classic Macintosh
    const macCard = screen.getByTestId('theme-card-classic-mac');
    fireEvent.click(macCard);

    expect(screen.getByText('Classic Macintosh Theme')).toBeInTheDocument();
    expect(desc).toHaveTextContent('Nostalgic 1984 platinum chassis, pinstripe titlebars and Susan Kare pixel aesthetics.');
  });

  it('should update theme title and description dynamically in Turkish localization', () => {
    useI18nStore.getState().setLanguage('tr');
    render(<SettingsApp />);

    expect(screen.getByText('Spatial Dark Glass Teması')).toBeInTheDocument();
    const desc = screen.getByTestId('settings-theme-description');
    expect(desc).toHaveTextContent('Donanım hızlandırmalı buzlu cam, parıldayan kenarlıklar ve akıcı yay fiziği.');

    const swissCard = screen.getByTestId('theme-card-swiss-industrial');
    fireEvent.click(swissCard);

    expect(screen.getByText('Swiss Industrial Teması')).toBeInTheDocument();
    expect(desc).toHaveTextContent('Masif mat grafit şasi, Dieter Rams fonksiyonalizmi ve emniyet turuncusu vurgusu.');
  });

  it('should render factory reset section and trigger reset on confirmation', () => {
    // 1. Modify some state
    useThemeStore.getState().setTheme('swiss-industrial');
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
    expect(useThemeStore.getState().currentTheme).toBe('spatial-glass');
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
