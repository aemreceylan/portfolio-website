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
});
