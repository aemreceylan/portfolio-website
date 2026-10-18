import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowFrame, clampWindowDragPosition, clampWindowResizeBounds } from './WindowFrame';
import { useWindowManager } from '#stores/window-manager.store';
import { useI18nStore } from '#i18n/i18n.store';
import { useViewportStore } from '#stores/viewport.store';
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
    useViewportStore.getState().setDimensions(1200, 800);
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

  describe('Mobile Sheet Mode Adaptations', () => {
    it('should adapt to mobile sheet mode when isMobile is true', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(
        <WindowFrame window={mockWindowState}>
          <div>Mobile Sheet Content</div>
        </WindowFrame>
      );

      const windowContainer = screen.getByTestId('window-test-app');
      expect(windowContainer).toHaveClass('is-mobile');

      // Resize handles should not be rendered in mobile sheet mode
      expect(document.querySelector('.resize-handle')).not.toBeInTheDocument();

      // Mobile indicator bar should be present
      expect(document.querySelector('.window-mobile-indicator-bar')).toBeInTheDocument();
    });

    it('should suppress desktop pointer dragging on mobile viewports', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(
        <WindowFrame window={mockWindowState}>
          <div>Mobile Sheet Content</div>
        </WindowFrame>
      );

      const titlebar = screen.getByLabelText('Test Application Titlebar');
      fireEvent.pointerDown(titlebar, { button: 0, clientX: 50, clientY: 50 });

      // Move pointer
      fireEvent.pointerMove(document, { clientX: 100, clientY: 100 });
      fireEvent.pointerUp(document);

      // Coordinates should remain untouched because dragging is suppressed on mobile
      expect(useWindowManager.getState().windows['test-app'].bounds.x).toBe(100);
      expect(useWindowManager.getState().windows['test-app'].bounds.y).toBe(100);
    });

    it('should minimize window when swiping down past threshold on mobile titlebar', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(
        <WindowFrame window={mockWindowState}>
          <div>Mobile Sheet Content</div>
        </WindowFrame>
      );

      const titlebar = screen.getByLabelText('Test Application Titlebar');
      const windowContainer = screen.getByTestId('window-test-app');

      // Pointer down on titlebar
      fireEvent.pointerDown(titlebar, { button: 0, clientY: 50 });
      expect(windowContainer).toHaveClass('is-swiping');

      // Swipe down past threshold (deltaY = 130 > 110)
      fireEvent.pointerMove(document, { clientY: 180 });
      fireEvent.pointerUp(document);

      expect(useWindowManager.getState().windows['test-app'].isMinimized).toBe(true);
    });

    it('should snap back and not minimize when swipe down is below threshold', () => {
      useViewportStore.getState().setDimensions(375, 667);

      render(
        <WindowFrame window={mockWindowState}>
          <div>Mobile Sheet Content</div>
        </WindowFrame>
      );

      const titlebar = screen.getByLabelText('Test Application Titlebar');
      const windowContainer = screen.getByTestId('window-test-app');

      fireEvent.pointerDown(titlebar, { button: 0, clientY: 50 });
      expect(windowContainer).toHaveClass('is-swiping');

      // Minor drag (deltaY = 40 <= 110)
      fireEvent.pointerMove(document, { clientY: 90 });
      fireEvent.pointerUp(document);

      expect(windowContainer).not.toHaveClass('is-swiping');
      expect(useWindowManager.getState().windows['test-app'].isMinimized).toBe(false);
    });

    it('should clamp window dragging so the titlebar cannot be dragged under the top status bar', () => {
      render(
        <WindowFrame window={mockWindowState}>
          <div>Drag Content</div>
        </WindowFrame>
      );

      const titlebar = screen.getByLabelText('Test Application Titlebar');

      // Drag aggressively upwards: initialY is 100, drag deltaY = -300
      fireEvent.pointerDown(titlebar, { button: 0, clientX: 200, clientY: 200, pointerId: 1 });
      fireEvent.pointerMove(document, { clientX: 200, clientY: -100, pointerId: 1 });
      fireEvent.pointerUp(document, { pointerId: 1 });

      const updatedWindow = useWindowManager.getState().windows['test-app'];
      // Must be clamped to STATUSBAR_HEIGHT (42), never below!
      expect(updatedWindow.bounds.y).toBe(42);
    });

    it('should clamp north resize so window titlebar cannot resize into the top status bar', () => {
      const { container } = render(
        <WindowFrame window={mockWindowState}>
          <div>Resize Content</div>
        </WindowFrame>
      );

      const northHandle = container.querySelector('.resize-handle.n');
      expect(northHandle).toBeInTheDocument();

      // Resize upwards into statusbar area
      fireEvent.pointerDown(northHandle!, { clientX: 200, clientY: 100, pointerId: 1 });
      fireEvent.pointerMove(document, { clientX: 200, clientY: 0, pointerId: 1 });
      fireEvent.pointerUp(document, { pointerId: 1 });

      const updatedWindow = useWindowManager.getState().windows['test-app'];
      expect(updatedWindow.bounds.y).toBeGreaterThanOrEqual(42);
    });

    it('should clamp window dragging to the right and bottom screen edges', () => {
      // Screen: 1200x800, Window: width 600, height 400, initialX: 100, initialY: 100
      render(
        <WindowFrame window={mockWindowState}>
          <div>Drag Content</div>
        </WindowFrame>
      );

      const titlebar = screen.getByLabelText('Test Application Titlebar');

      // Drag aggressively to the right and bottom: deltaX = +2000, deltaY = +2000
      fireEvent.pointerDown(titlebar, { button: 0, clientX: 200, clientY: 200, pointerId: 1 });
      fireEvent.pointerMove(document, { clientX: 2200, clientY: 2200, pointerId: 1 });
      fireEvent.pointerUp(document, { pointerId: 1 });

      const updatedWindow = useWindowManager.getState().windows['test-app'];
      // Max X is 1200 - 600 = 600
      expect(updatedWindow.bounds.x).toBe(600);
      // Max Y is 800 - 400 = 400
      expect(updatedWindow.bounds.y).toBe(400);
    });

    it('should clamp east and south resize so window cannot resize past right and bottom screen edges', () => {
      // Screen: 1200x800, Window: initialX: 100, initialY: 100, width: 600, height: 400
      const { container } = render(
        <WindowFrame window={mockWindowState}>
          <div>Resize Content</div>
        </WindowFrame>
      );

      // 1. Southeast resize handle ('se')
      const seHandle = container.querySelector('.resize-handle.se');
      expect(seHandle).toBeInTheDocument();

      // Drag aggressively past screen width and height
      fireEvent.pointerDown(seHandle!, { clientX: 700, clientY: 500, pointerId: 1 });
      fireEvent.pointerMove(document, { clientX: 3000, clientY: 3000, pointerId: 1 });
      fireEvent.pointerUp(document, { pointerId: 1 });

      const updatedWindow = useWindowManager.getState().windows['test-app'];
      // Max width is 1200 - initialX(100) = 1100
      expect(updatedWindow.bounds.width).toBe(1100);
      // Max height is 800 - initialY(100) = 700
      expect(updatedWindow.bounds.height).toBe(700);
    });
  });

  describe('Pure Clamping Functions', () => {
    it('clampWindowDragPosition correctly bounds all 4 coordinates', () => {
      // Normal within screen
      const normal = clampWindowDragPosition(100, 100, 50, 50, 600, 400, 1200, 800);
      expect(normal).toEqual({ x: 150, y: 150 });

      // Out of bounds top and left
      const topAndLeft = clampWindowDragPosition(100, 100, -200, -200, 600, 400, 1200, 800);
      expect(topAndLeft).toEqual({ x: 0, y: 42 });

      // Out of bounds bottom and right
      const bottomAndRight = clampWindowDragPosition(100, 100, 2000, 2000, 600, 400, 1200, 800);
      expect(bottomAndRight).toEqual({ x: 600, y: 400 });
    });

    it('clampWindowResizeBounds correctly bounds east, south, west, north', () => {
      const minSize = { width: 300, height: 200 };
      const screen = { width: 1200, height: 800 };

      // East resize past screen
      const east = clampWindowResizeBounds(
        'e',
        { initialWidth: 600, initialHeight: 400, initialX: 100, initialY: 100, deltaX: 2000, deltaY: 0 },
        minSize,
        screen
      );
      expect(east.width).toBe(1100); // 1200 - 100

      // South resize past screen
      const south = clampWindowResizeBounds(
        's',
        { initialWidth: 600, initialHeight: 400, initialX: 100, initialY: 100, deltaX: 0, deltaY: 2000 },
        minSize,
        screen
      );
      expect(south.height).toBe(700); // 800 - 100

      // West resize past left screen edge
      const west = clampWindowResizeBounds(
        'w',
        { initialWidth: 600, initialHeight: 400, initialX: 100, initialY: 100, deltaX: -500, deltaY: 0 },
        minSize,
        screen
      );
      expect(west.x).toBe(0);
      expect(west.width).toBe(700); // initialX(100) + initialWidth(600) - 0 = 700

      // North resize past status bar
      const north = clampWindowResizeBounds(
        'n',
        { initialWidth: 600, initialHeight: 400, initialX: 100, initialY: 100, deltaX: 0, deltaY: -200 },
        minSize,
        screen
      );
      expect(north.y).toBe(42);
    });
  });
});


