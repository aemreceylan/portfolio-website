import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppSandbox } from './AppSandbox';

describe('AppSandbox Container Runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sandboxed container with default desktop viewport and toolbar', () => {
    render(
      <AppSandbox
        appId="test-app"
        entryUrl="/apps/test/index.html"
        title="Test Application"
        customToolbarLeft={<span data-testid="custom-title">Özel Başlık</span>}
      />
    );

    expect(screen.getByTestId('app-sandbox-test-app')).toBeInTheDocument();
    expect(screen.getByTestId('sandbox-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();

    const iframe = screen.getByTestId('sandbox-iframe-test-app');
    expect(iframe).toHaveAttribute('src', '/apps/test/index.html');
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin'
    );
  });

  it('applies hardware permissions when specified', () => {
    render(
      <AppSandbox
        appId="media-app"
        entryUrl="/apps/media/index.html"
        allowHardware={{ camera: true, microphone: true, displayCapture: true }}
      />
    );

    const iframe = screen.getByTestId('sandbox-iframe-media-app');
    expect(iframe).toHaveAttribute('allow', 'camera; microphone; display-capture');
  });

  it('toggles between desktop, tablet, and mobile viewport modes', () => {
    render(
      <AppSandbox
        appId="responsive-app"
        entryUrl="/apps/responsive/index.html"
        initialViewport="desktop"
      />
    );

    const stage = screen.getByTestId('app-sandbox-responsive-app').querySelector('.sandbox-stage');
    expect(stage).toHaveClass('viewport-desktop');

    // Switch to tablet
    const tabletBtn = screen.getByLabelText('Tablet view');
    fireEvent.click(tabletBtn);
    expect(stage).toHaveClass('viewport-tablet');

    // Switch to mobile
    const mobileBtn = screen.getByLabelText('Mobile view');
    fireEvent.click(mobileBtn);
    expect(stage).toHaveClass('viewport-mobile');

    // Switch back to desktop
    const desktopBtn = screen.getByLabelText('Desktop view');
    fireEvent.click(desktopBtn);
    expect(stage).toHaveClass('viewport-desktop');
  });

  it('hides device simulator viewport controls when enableDeviceSimulator is false', () => {
    render(
      <AppSandbox
        appId="no-sim-app"
        entryUrl="/apps/test/index.html"
        enableDeviceSimulator={false}
      />
    );

    expect(screen.queryByTestId('sandbox-viewport-controls')).not.toBeInTheDocument();
    expect(screen.getByTestId('sandbox-toolbar')).toBeInTheDocument();
  });

  it('handles iframe load event to dismiss loading overlay', () => {
    render(
      <AppSandbox
        appId="loading-app"
        entryUrl="/apps/loading/index.html"
        title="Loading Test"
      />
    );

    // Initial loading indicator
    expect(screen.getByTestId('sandbox-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading Test başlatılıyor...')).toBeInTheDocument();

    // Trigger iframe onLoad
    const iframe = screen.getByTestId('sandbox-iframe-loading-app');
    fireEvent.load(iframe);

    // Loading overlay should be dismissed
    expect(screen.queryByTestId('sandbox-loading')).not.toBeInTheDocument();
  });

  it('handles reload button interaction', () => {
    render(
      <AppSandbox
        appId="reload-app"
        entryUrl="/apps/reload/index.html"
      />
    );

    const reloadBtn = screen.getByLabelText('Reload app');
    fireEvent.click(reloadBtn);

    // Iframe re-renders with loading overlay
    expect(screen.getByTestId('sandbox-loading')).toBeInTheDocument();
  });

  it('opens application in an external window/tab on external link click', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <AppSandbox
        appId="ext-app"
        entryUrl="/apps/ext/index.html"
      />
    );

    const extBtn = screen.getByLabelText('Open in external tab');
    fireEvent.click(extBtn);

    expect(openSpy).toHaveBeenCalledWith(
      '/apps/ext/index.html',
      '_blank',
      'noopener,noreferrer'
    );

    openSpy.mockRestore();
  });

  it('renders crash fallback boundary when error message is received and allows restart', () => {
    const onCrashMock = vi.fn();

    render(
      <AppSandbox
        appId="crash-app"
        entryUrl="/apps/crash/index.html"
        onCrash={onCrashMock}
      />
    );

    const iframe = screen.getByTestId('sandbox-iframe-crash-app') as HTMLIFrameElement;

    // Simulate guest crash event via window message
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        data: {
          source: 'aec-webos-guest',
          targetAppId: 'crash-app',
          timestamp: Date.now(),
          payload: {
            type: 'WEBOS_CRASH_REPORT',
            message: 'Uncaught TypeError: Cannot read properties of undefined',
          },
        },
        source: iframe.contentWindow,
      })
    );

    // Crash fallback should be displayed
    expect(screen.getByTestId('sandbox-crash')).toBeInTheDocument();
    expect(
      screen.getByText('Uygulama Beklenmedik Bir Hatayla Karşılaştı')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cannot read properties of undefined/)
    ).toBeInTheDocument();
    expect(onCrashMock).toHaveBeenCalled();

    // Click restart button
    const restartBtn = screen.getByText('Uygulamayı Yeniden Başlat');
    fireEvent.click(restartBtn);

    // Should recover and display loading state again
    expect(screen.queryByTestId('sandbox-crash')).not.toBeInTheDocument();
    expect(screen.getByTestId('sandbox-loading')).toBeInTheDocument();
  });
});
