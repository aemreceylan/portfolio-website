import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';
import { useCommandPaletteStore } from '#stores/command-palette.store';
import { useWindowManager } from '#stores/window-manager.store';
import { useThemeStore } from '#stores/theme.store';
import { useFileSystemStore } from '#stores/filesystem.store';
import { useI18nStore } from '#i18n/i18n.store';

describe('CommandPalette Component', () => {
  beforeEach(() => {
    useCommandPaletteStore.getState().reset();
    useWindowManager.getState().reset();
    useFileSystemStore.getState().reset();
    useThemeStore.getState().setTheme('spatial-glass');
    useI18nStore.getState().setLanguage('en');
    vi.clearAllMocks();
  });

  it('does not render dialog when closed', () => {
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog', { name: /Spotlight Command Palette/i })).not.toBeInTheDocument();
  });

  it('renders modal with search input when open', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    expect(screen.getByRole('dialog', { name: /Spotlight Command Palette/i })).toBeInTheDocument();
    expect(screen.getByTestId('command-palette-input')).toBeInTheDocument();
    expect(screen.getByText('Terminal CLI')).toBeInTheDocument();
    expect(screen.getByTestId('command-palette-footer')).toBeInTheDocument();
    expect(screen.getByLabelText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('toggles open state via global Cmd+K / Ctrl+K keyboard shortcut', () => {
    render(<CommandPalette />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Trigger Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Trigger Cmd+K again to close
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when pressing Escape key', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when clicking backdrop overlay', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const backdrop = screen.getByTestId('command-palette-backdrop');
    fireEvent.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters items dynamically based on search query', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'terminal' } });

    expect(screen.getByText('Terminal CLI')).toBeInTheDocument();
    expect(screen.queryByText('Game Hub')).not.toBeInTheDocument();
  });

  it('displays empty state when no commands match query', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });

    expect(screen.getByTestId('command-palette-empty')).toBeInTheDocument();
    expect(screen.getByText('No matching commands or files found')).toBeInTheDocument();
  });

  it('navigates through items with ArrowDown and ArrowUp', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    const items = screen.getAllByRole('option');

    // First item is selected initially
    expect(items[0]).toHaveClass('is-selected');

    // Arrow down moves to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(items[1]).toHaveClass('is-selected');

    // Arrow up returns to first item
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(items[0]).toHaveClass('is-selected');
  });

  it('launches application window and closes palette when Enter is pressed', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'Terminal CLI' } });

    fireEvent.keyDown(input, { key: 'Enter' });

    // Palette closes
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Window manager has opened terminal
    expect(useWindowManager.getState().windows['terminal']).toBeDefined();
    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(true);
  });

  it('opens VFS file in Markdown viewer when selected', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'bio.md' } });

    const bioOption = screen.getByTestId('command-palette-item-file-sys-bio');
    expect(bioOption).toHaveTextContent('MD');
    expect(bioOption).not.toHaveTextContent('(MD)');
    fireEvent.click(bioOption);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useWindowManager.getState().windows['markdown-viewer']).toBeDefined();
    expect(useWindowManager.getState().windows['markdown-viewer'].isOpen).toBe(true);
  });

  it('switches theme when theme option is selected', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'Cyberpunk Neon' } });

    const cyberpunkOption = screen.getByTestId('command-palette-item-theme-cyberpunk-neon');
    fireEvent.click(cyberpunkOption);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useThemeStore.getState().currentTheme).toBe('cyberpunk-neon');
  });

  it('adapts visually across themes and renders with correct data attributes', () => {
    useCommandPaletteStore.getState().open();
    const { rerender } = render(<CommandPalette />);

    expect(screen.getByTestId('command-palette-modal')).toBeInTheDocument();

    // Switch theme to swiss-industrial
    act(() => {
      useThemeStore.getState().setTheme('swiss-industrial');
    });
    rerender(<CommandPalette />);
    expect(screen.getByTestId('command-palette-modal')).toBeInTheDocument();

    // Switch theme to classic-mac
    act(() => {
      useThemeStore.getState().setTheme('classic-mac');
    });
    rerender(<CommandPalette />);
    expect(screen.getByTestId('command-palette-modal')).toBeInTheDocument();
  });

  it('searches and opens BAND app from command palette', () => {
    useCommandPaletteStore.getState().open();
    render(<CommandPalette />);

    const input = screen.getByTestId('command-palette-input');
    fireEvent.change(input, { target: { value: 'BAND' } });

    expect(screen.getByText('BAND')).toBeInTheDocument();
    fireEvent.click(screen.getByText('BAND'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useWindowManager.getState().windows['band']).toBeDefined();
    expect(useWindowManager.getState().windows['band'].isOpen).toBe(true);
  });
});
