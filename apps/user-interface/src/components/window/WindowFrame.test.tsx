import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowFrame } from './WindowFrame';
import { useWindowManager } from '#stores/window-manager.store';
import { useI18nStore } from '#i18n/i18n.store';
import { WindowState } from '@personal-os/shared';

const mockWindowState: WindowState = {
  id: 'test-app',
  title: 'Test Application',
  iconName: 'Terminal',
  isOpen: true,
  isMinimized: false,
  isMaximized: false,
  zIndex: 101,
  bounds: { x: 100, y: 100, width: 600, height: 400 },
  minSize: { width: 300, height: 200 },
  resizable: true,
};

describe('WindowFrame Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useWindowManager.getState().reset();
    useWindowManager.setState({
      windows: { 'test-app': mockWindowState },
      activeWindowId: 'test-app',
      highestZIndex: 101,
    });
  });

  it('should render window title and control buttons with icons', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Window Content Inside</div>
      </WindowFrame>
    );

    expect(screen.getByText('Test Application')).toBeInTheDocument();
    expect(screen.getByText('Window Content Inside')).toBeInTheDocument();
    expect(screen.getByLabelText('Close Window')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimize Window')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximize Window')).toBeInTheDocument();
  });

  it('should toggle maximize on titlebar double click', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    fireEvent.doubleClick(screen.getByText('Test Application'));
    expect(useWindowManager.getState().windows['test-app'].isMaximized).toBe(true);
  });

  it('should switch maximize button label to "Restore Window" when maximized', () => {
    const maximizedState: WindowState = {
      ...mockWindowState,
      isMaximized: true,
    };
    useWindowManager.setState({
      windows: { 'test-app': maximizedState },
    });

    render(
      <WindowFrame window={maximizedState}>
        <div>Content</div>
      </WindowFrame>
    );

    expect(screen.getByLabelText('Restore Window')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Restore Window'));
    expect(useWindowManager.getState().windows['test-app'].isMaximized).toBe(false);
  });

  it('should open titlebar context menu with Close, Minimize, Maximize on right click', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const title = screen.getByText('Test Application');
    fireEvent.contextMenu(title);

    expect(screen.getByRole('button', { name: /^Close$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Minimize$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Maximize$/i })).toBeInTheDocument();
  });

  const triggerAuxClick = (element: Element, button = 1) => {
    fireEvent(
      element,
      new MouseEvent('auxclick', {
        bubbles: true,
        cancelable: true,
        button,
      })
    );
  };

  it('should close window when middle-clicking on titlebar', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const titlebar = screen.getByText('Test Application').closest('.window-titlebar')!;
    expect(titlebar).toBeInTheDocument();

    // Middle click is button 1
    triggerAuxClick(titlebar, 1);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(false);
  });

  it('should close window when middle-clicking on title text inside titlebar', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const titleText = screen.getByText('Test Application');
    triggerAuxClick(titleText, 1);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(false);
  });

  it('should not close window when middle-clicking on minimize or maximize buttons', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const minimizeBtn = screen.getByLabelText('Minimize Window');
    triggerAuxClick(minimizeBtn, 1);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(true);

    const maximizeBtn = screen.getByLabelText('Maximize Window');
    triggerAuxClick(maximizeBtn, 1);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(true);
  });

  it('should not close window on auxClick if button is not middle mouse button (button !== 1)', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const titlebar = screen.getByText('Test Application').closest('.window-titlebar')!;
    // Secondary click (button 2)
    triggerAuxClick(titlebar, 2);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(true);

    // Primary click (button 0)
    triggerAuxClick(titlebar, 0);
    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(true);
  });

  it('should prevent default browser autoscroll on titlebar middle pointerdown and mousedown', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div>Content</div>
      </WindowFrame>
    );

    const titlebar = screen.getByText('Test Application').closest('.window-titlebar')!;
    const pointerDownEvent = fireEvent.pointerDown(titlebar, { button: 1 });
    expect(pointerDownEvent).toBe(false); // default was prevented

    const mouseDownEvent = fireEvent.mouseDown(titlebar, { button: 1 });
    expect(mouseDownEvent).toBe(false); // default was prevented
  });

  it('should open window context menu and prevent default browser menu when right clicking window content', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div data-testid="test-content">Inner App Content</div>
      </WindowFrame>
    );

    const content = screen.getByTestId('test-content');
    const ctxEvent = fireEvent.contextMenu(content);
    expect(ctxEvent).toBe(false); // default browser context menu was prevented

    expect(screen.getByTestId('window-context-menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Close$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Minimize$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Maximize$/i })).toBeInTheDocument();
  });

  it('should close window and dismiss menu when clicking Close in the context menu', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div data-testid="test-content">Inner App Content</div>
      </WindowFrame>
    );

    const content = screen.getByTestId('test-content');
    fireEvent.contextMenu(content);

    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);

    expect(useWindowManager.getState().windows['test-app'].isOpen).toBe(false);
    expect(screen.queryByTestId('window-context-menu')).not.toBeInTheDocument();
  });

  it('should close window context menu on Escape key press', () => {
    render(
      <WindowFrame window={mockWindowState}>
        <div data-testid="test-content">Inner App Content</div>
      </WindowFrame>
    );

    const content = screen.getByTestId('test-content');
    fireEvent.contextMenu(content);
    expect(screen.getByTestId('window-context-menu')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('window-context-menu')).not.toBeInTheDocument();
  });
});


