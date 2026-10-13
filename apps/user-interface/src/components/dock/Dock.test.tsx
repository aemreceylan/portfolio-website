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
});
