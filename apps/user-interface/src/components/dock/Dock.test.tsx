import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dock } from './Dock';
import { useWindowManager } from '#stores/window-manager.store';
import { terminalManifest } from '#apps/app-registry';
import { useI18nStore } from '#i18n/i18n.store';

describe('Dock Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useWindowManager.getState().reset();
  });

  it('should not render dock when no applications are open', () => {
    const { container } = render(<Dock />);
    expect(container.firstChild).toBeNull();
  });

  it('should render dock item only when an application is open', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    expect(screen.getByLabelText(/Terminal CLI - Manage window/i)).toBeInTheDocument();
  });

  it('should minimize active window when dock item is clicked, and restore on subsequent click', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByLabelText(/Terminal CLI - Manage window/i);

    // Window is active, clicking should minimize it
    fireEvent.click(dockItem);
    expect(useWindowManager.getState().windows['terminal'].isMinimized).toBe(true);

    // Window is minimized, clicking should restore it
    fireEvent.click(dockItem);
    expect(useWindowManager.getState().windows['terminal'].isMinimized).toBe(false);
  });

  it('should open dock context menu on right click and prevent default browser menu', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByTestId('dock-item-terminal');
    const ctxEvent = fireEvent.contextMenu(dockItem);
    expect(ctxEvent).toBe(false); // Browser default was prevented

    expect(screen.getByTestId('dock-context-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dock-menu-close-btn')).toBeInTheDocument();
    expect(screen.getByTestId('dock-menu-toggle-btn')).toBeInTheDocument();
  });

  it('should close application when clicking Close in the dock context menu', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByTestId('dock-item-terminal');
    fireEvent.contextMenu(dockItem);

    const closeBtn = screen.getByTestId('dock-menu-close-btn');
    fireEvent.click(closeBtn);

    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(false);
    expect(screen.queryByTestId('dock-context-menu')).not.toBeInTheDocument();
  });

  it('should toggle minimize/restore from dock context menu', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByTestId('dock-item-terminal');
    fireEvent.contextMenu(dockItem);

    const toggleBtn = screen.getByTestId('dock-menu-toggle-btn');
    fireEvent.click(toggleBtn);

    expect(useWindowManager.getState().windows['terminal'].isMinimized).toBe(true);
    expect(screen.queryByTestId('dock-context-menu')).not.toBeInTheDocument();
  });

  it('should dismiss dock context menu when pressing Escape key', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByTestId('dock-item-terminal');
    fireEvent.contextMenu(dockItem);
    expect(screen.getByTestId('dock-context-menu')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('dock-context-menu')).not.toBeInTheDocument();
  });

  it('should dismiss dock context menu when clicking outside', () => {
    useWindowManager.getState().openWindow(terminalManifest);

    render(<Dock />);

    const dockItem = screen.getByTestId('dock-item-terminal');
    fireEvent.contextMenu(dockItem);
    expect(screen.getByTestId('dock-context-menu')).toBeInTheDocument();

    fireEvent.click(document.body);
    expect(screen.queryByTestId('dock-context-menu')).not.toBeInTheDocument();
  });
});

