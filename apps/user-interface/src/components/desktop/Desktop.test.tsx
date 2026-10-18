import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Desktop } from './Desktop';
import { useWindowManager } from '#stores/window-manager.store';
import { useI18nStore } from '#i18n/i18n.store';
import { useFileSystemStore } from '#stores/filesystem.store';
import { useViewportStore } from '#stores/viewport.store';

describe('Desktop Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useViewportStore.getState().setDimensions(1200, 800);
    useI18nStore.getState().setLanguage('en');
    useWindowManager.getState().reset();
    useFileSystemStore.getState().reset();
  });

  it('should render status bar with AEC brand, clock, and app icons', () => {
    render(<Desktop />);

    expect(screen.getByText('AEC')).toBeInTheDocument();
    expect(screen.getByText('Terminal CLI')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('BAND')).toBeInTheDocument();
  });

  it('should open window when clicking a desktop app icon', () => {
    render(<Desktop />);

    const terminalIcon = screen.getByTestId('desktop-app-terminal');
    fireEvent.click(terminalIcon);

    expect(useWindowManager.getState().windows['terminal']).toBeDefined();
    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(true);
  });

  it('should open BAND window when clicking BAND desktop icon', () => {
    render(<Desktop />);

    const bandIcon = screen.getByTestId('desktop-app-band');
    fireEvent.click(bandIcon);

    expect(useWindowManager.getState().windows['band']).toBeDefined();
    expect(useWindowManager.getState().windows['band'].isOpen).toBe(true);
  });

  it('should render virtual desktop files from VFS store', () => {
    render(<Desktop />);

    expect(screen.getByTestId('desktop-file-bio.md')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-file-skills.md')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-file-demo.js')).toBeInTheDocument();
  });

  it('should open Markdown Viewer when single-clicking a markdown file', () => {
    render(<Desktop />);

    const bioFile = screen.getByTestId('desktop-file-bio.md');
    fireEvent.click(bioFile);

    expect(useWindowManager.getState().windows['markdown-viewer']).toBeDefined();
    expect(useWindowManager.getState().windows['markdown-viewer'].isOpen).toBe(true);
  });

  it('should open JS IDE when single-clicking a js file', () => {
    render(<Desktop />);

    const jsFile = screen.getByTestId('desktop-file-demo.js');
    fireEvent.click(jsFile);

    expect(useWindowManager.getState().windows['js-ide']).toBeDefined();
    expect(useWindowManager.getState().windows['js-ide'].isOpen).toBe(true);
  });

  it('should open context menu on right click and display Spatial Alert modal when attempting to delete protected system file', () => {
    render(<Desktop />);

    const bioFile = screen.getByTestId('desktop-file-bio.md');
    fireEvent.contextMenu(bioFile);

    expect(screen.getByRole('menu', { name: /Desktop Context Menu/i })).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();

    const deleteMenuItem = screen.getByText('Delete');
    fireEvent.click(deleteMenuItem);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/Sistem Dosyası Korunuyor/i)).toBeInTheDocument();
    expect(screen.getByText(/işletim sistemi için temel bir bileşendir/i)).toBeInTheDocument();

    const okBtn = screen.getByRole('button', { name: /Tamam/i });
    fireEvent.click(okBtn);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should show empty desktop context menu with new file actions without upload option', () => {
    render(<Desktop />);

    const desktopViewport = screen.getByTestId('desktop-viewport');
    fireEvent.contextMenu(desktopViewport);

    expect(screen.getByText('New Text Document (.txt)')).toBeInTheDocument();
    expect(screen.getByText('New Markdown Document (.md)')).toBeInTheDocument();
    expect(screen.getByText('New JavaScript File (.js)')).toBeInTheDocument();
    expect(screen.queryByText('Upload File')).not.toBeInTheDocument();
  });

  it('should not open desktop context menu when right clicking inside an open window', () => {
    useWindowManager.getState().openWindow({
      id: 'terminal',
      name: 'Terminal CLI',
      description: 'Test',
      iconName: 'Terminal',
      category: 'system',
      defaultSize: { width: 400, height: 300 },
      minSize: { width: 200, height: 150 },
      resizable: true,
      singleton: true,
    });

    render(<Desktop />);

    const windowEl = screen.getByTestId('window-terminal');
    fireEvent.contextMenu(windowEl);

    expect(screen.queryByRole('menu', { name: /Desktop Context Menu/i })).not.toBeInTheDocument();
  });

  it('should support pointer-based dragging and repositioning of desktop icons', () => {
    render(<Desktop />);

    const appIcon = screen.getByTestId('desktop-app-terminal');
    const initialStyle = appIcon.getAttribute('style');

    act(() => {
      fireEvent.pointerDown(appIcon, { clientX: 24, clientY: 62, button: 0 });
      fireEvent.pointerMove(window, { clientX: 220, clientY: 260 });
      fireEvent.pointerUp(window, { clientX: 220, clientY: 260 });
    });

    const updatedIcon = screen.getByTestId('desktop-app-terminal');
    expect(updatedIcon.getAttribute('style')).not.toBe(initialStyle);
  });

  it('should prevent dropping icons on top of each other and resolve collision to unoccupied slot', () => {
    render(<Desktop />);

    const terminalIcon = screen.getByTestId('desktop-app-terminal');
    const settingsIcon = screen.getByTestId('desktop-app-settings');

    const settingsStyleBefore = settingsIcon.getAttribute('style');
    // Settings is at row 1 (clientY: 162)
    expect(settingsStyleBefore).toContain('top: 162px');

    // Attempt to drop Terminal directly on top of Settings (24, 162)
    act(() => {
      fireEvent.pointerDown(terminalIcon, { clientX: 24, clientY: 62, button: 0 });
      fireEvent.pointerMove(window, { clientX: 24, clientY: 162 });
      fireEvent.pointerUp(window, { clientX: 24, clientY: 162 });
    });

    const updatedTerminal = screen.getByTestId('desktop-app-terminal');
    const updatedSettings = screen.getByTestId('desktop-app-settings');

    // Settings must remain in place and not be overwritten
    expect(updatedSettings.getAttribute('style')).toBe(settingsStyleBefore);

    // Terminal must NOT be placed at the exact same coordinates as Settings
    expect(updatedTerminal.getAttribute('style')).not.toBe(updatedSettings.getAttribute('style'));
  });

  it('should spawn newly created file at exact right-click grid position', () => {
    render(<Desktop />);

    const desktopViewport = screen.getByTestId('desktop-viewport');
    // Right-click at col: 3 (START_X + 3 * 96 = 312), row: 1 (START_Y + 1 * 100 = 162)
    fireEvent.contextMenu(desktopViewport, { clientX: 312, clientY: 162 });

    const newMdOption = screen.getByText('New Markdown Document (.md)');
    fireEvent.click(newMdOption);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'rightclick.md' } });
    fireEvent.submit(input.closest('form')!);

    const newFileIcon = screen.getByTestId('desktop-file-rightclick.md');
    expect(newFileIcon).toBeInTheDocument();
    expect(newFileIcon.getAttribute('style')).toContain('left: 312px');
    expect(newFileIcon.getAttribute('style')).toContain('top: 162px');
  });

  it('should place file created from terminal/IDE into the first available empty slot on the grid', () => {
    render(<Desktop />);

    const terminalIcon = screen.getByTestId('desktop-app-terminal');
    // Move Terminal from (24, 62) to (312, 362), vacating slot (24, 62)
    act(() => {
      fireEvent.pointerDown(terminalIcon, { clientX: 24, clientY: 62, button: 0 });
      fireEvent.pointerMove(window, { clientX: 312, clientY: 362 });
      fireEvent.pointerUp(window, { clientX: 312, clientY: 362 });
    });

    // Simulate Terminal / IDE creating a file without right-click coordinates
    act(() => {
      useFileSystemStore.getState().createFile('from-cli.txt', 'hello from cli');
    });

    const cliFileIcon = screen.getByTestId('desktop-file-from-cli.txt');
    expect(cliFileIcon).toBeInTheDocument();
    // Must fill the first available hole at (24, 62)
    expect(cliFileIcon.getAttribute('style')).toContain('left: 24px');
    expect(cliFileIcon.getAttribute('style')).toContain('top: 62px');
  });

  it('should open markdown file in preview mode when directly clicked from desktop', () => {
    render(<Desktop />);

    const bioFile = screen.getByTestId('desktop-file-bio.md');
    fireEvent.click(bioFile);

    expect(useFileSystemStore.getState().activeViewerFileId).toBe('sys-bio');
    expect(useFileSystemStore.getState().viewerMode).toBe('preview');
    expect(useWindowManager.getState().windows['markdown-viewer'].isOpen).toBe(true);
  });

  it('should open markdown editor in edit mode when directly clicked from desktop app icons', () => {
    // Put viewer in preview mode first
    useFileSystemStore.getState().setViewerMode('preview');

    render(<Desktop />);

    const mdAppIcon = screen.getByTestId('desktop-app-markdown-viewer');
    fireEvent.click(mdAppIcon);

    expect(useFileSystemStore.getState().viewerMode).toBe('edit');
    expect(useWindowManager.getState().windows['markdown-viewer'].isOpen).toBe(true);
  });

  describe('Mobile Springboard Mode', () => {
    it('should render mobile springboard section headers and is-mobile viewport class', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const viewport = screen.getByTestId('desktop-viewport');
      expect(viewport).toHaveClass('is-mobile');

      expect(screen.getByTestId('mobile-section-apps')).toBeInTheDocument();
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-section-files')).toBeInTheDocument();
      expect(screen.getByText('Files')).toBeInTheDocument();
    });

    it('should launch application from mobile springboard when tapped', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const terminalBtn = screen.getByTestId('desktop-app-terminal');
      fireEvent.click(terminalBtn);

      expect(useWindowManager.getState().windows['terminal']).toBeDefined();
      expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(true);
    });

    it('should open desktop context menu on mobile long-press (500ms)', () => {
      vi.useFakeTimers();
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const desktopViewport = screen.getByTestId('desktop-viewport');
      expect(screen.queryByLabelText('Desktop Context Menu')).not.toBeInTheDocument();

      fireEvent.pointerDown(desktopViewport, { clientX: 100, clientY: 200 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByLabelText('Desktop Context Menu')).toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should cancel long-press if pointer moves beyond tolerance threshold', () => {
      vi.useFakeTimers();
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const desktopViewport = screen.getByTestId('desktop-viewport');

      fireEvent.pointerDown(desktopViewport, { clientX: 100, clientY: 200 });
      // Move 20px (beyond 10px tolerance)
      fireEvent.pointerMove(desktopViewport, { clientX: 120, clientY: 200 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.queryByLabelText('Desktop Context Menu')).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it('should open file context menu on mobile file card long-press and not switch to desktop menu on extended hold', () => {
      vi.useFakeTimers();
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const fileCard = screen.getByTestId('desktop-file-bio.md');
      fireEvent.pointerDown(fileCard, { clientX: 100, clientY: 250 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByLabelText('Desktop Context Menu')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.queryByText('New Text Document (.txt)')).not.toBeInTheDocument();

      // Extended hold with synthetic contextmenu from browser
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.contextMenu(fileCard);

      // Verify file menu is still intact and did NOT switch to desktop context menu
      expect(screen.getByText('Rename')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.queryByText('New Text Document (.txt)')).not.toBeInTheDocument();

      // Lifting finger should not trigger open window
      fireEvent.pointerUp(fileCard);
      fireEvent.click(fileCard);

      expect(useWindowManager.getState().windows['markdown-viewer']).toBeUndefined();
      vi.useRealTimers();
    });

    it('should open app context menu on mobile app card long-press and retain it on extended hold', () => {
      vi.useFakeTimers();
      useViewportStore.getState().setDimensions(375, 667);

      render(<Desktop />);

      const appCard = screen.getByTestId('desktop-app-terminal');
      fireEvent.pointerDown(appCard, { clientX: 100, clientY: 100 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByLabelText('Desktop Context Menu')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.queryByText('New Text Document (.txt)')).not.toBeInTheDocument();

      // Extended hold with synthetic contextmenu from browser
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.contextMenu(appCard);

      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.queryByText('New Text Document (.txt)')).not.toBeInTheDocument();

      // Lifting finger should not launch app
      fireEvent.pointerUp(appCard);
      fireEvent.click(appCard);

      expect(useWindowManager.getState().windows['terminal']).toBeUndefined();
      vi.useRealTimers();
    });

    it('opens Spotlight Command Palette when clicking the statusbar spotlight button', () => {
      render(<Desktop />);

      expect(screen.queryByRole('dialog', { name: /Spotlight Command Palette/i })).not.toBeInTheDocument();

      const spotlightBtn = screen.getByTestId('statusbar-spotlight-btn');
      expect(spotlightBtn).toBeInTheDocument();
      expect(spotlightBtn.querySelector('.spotlight-kbd-chip')).toBeInTheDocument();

      fireEvent.click(spotlightBtn);

      expect(screen.getByRole('dialog', { name: /Spotlight Command Palette/i })).toBeInTheDocument();
    });

    it('rejects oversized file uploads (>512 KB) with a GUI warning (DoS prevention)', async () => {
      render(<Desktop />);

      const fileInput = screen.getByTestId('file-upload-input');
      // Create a mock File exceeding 512 KB
      const bigContent = 'x'.repeat(600 * 1024);
      const bigFile = new File([bigContent], 'huge-file.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [bigFile] } });

      expect(screen.getByText(/Dosya Boyutu Sınırı Aşıldı/i)).toBeInTheDocument();
      expect(useFileSystemStore.getState().getFile('huge-file.txt')).toBeUndefined();
    });

    it('shows New Window option in desktop app context menu for non-system apps and opens new instance', () => {
      render(<Desktop />);

      const bandAppIcon = screen.getByTestId('desktop-app-band');
      fireEvent.contextMenu(bandAppIcon);

      const newWindowBtn = screen.getByTestId('ctx-menu-new-window-btn');
      expect(newWindowBtn).toBeInTheDocument();

      fireEvent.click(newWindowBtn);

      const windows = useWindowManager.getState().windows;
      expect(windows['band']).toBeDefined();
      expect(windows['band'].isOpen).toBe(true);
    });
  });
});



