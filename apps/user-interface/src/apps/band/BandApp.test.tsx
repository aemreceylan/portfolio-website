import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BandApp } from './BandApp';
import { bandManifest } from '../app-registry';

describe('BandApp WebOS Application Component', () => {
  it('renders BAND app directly into sandbox container with compact mode summary', () => {
    render(<BandApp manifest={bandManifest} />);

    expect(screen.getByTestId('band-app')).toBeInTheDocument();
    expect(screen.getByTestId('app-sandbox-band')).toBeInTheDocument();
    expect(screen.getByTestId('band-mode-summary')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /offline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /online/i })).toBeInTheDocument();

    const iframe = screen.getByTestId('sandbox-iframe-band');
    expect(iframe).toHaveAttribute('src', '/apps/band/index.html');
  });

  it('toggles backend mode when clicking the mode segmented buttons', () => {
    render(<BandApp manifest={bandManifest} />);

    const onlineBtn = screen.getByRole('button', { name: /online/i });
    const offlineBtn = screen.getByRole('button', { name: /offline/i });

    // Initially standalone (offline) is active
    expect(offlineBtn).toHaveAttribute('aria-pressed', 'true');
    expect(onlineBtn).toHaveAttribute('aria-pressed', 'false');

    // Click online button to switch to connected mode
    fireEvent.click(onlineBtn);
    expect(onlineBtn).toHaveAttribute('aria-pressed', 'true');
    expect(offlineBtn).toHaveAttribute('aria-pressed', 'false');

    const iframe = screen.getByTestId('sandbox-iframe-band');
    expect(iframe).toHaveAttribute('src', 'http://localhost:3000');

    // Click offline button to switch back to standalone mode
    fireEvent.click(offlineBtn);
    expect(offlineBtn).toHaveAttribute('aria-pressed', 'true');
    expect(iframe).toHaveAttribute('src', '/apps/band/index.html');
  });

  it('opens and closes the info modal with GitHub link and backend instructions', () => {
    render(<BandApp manifest={bandManifest} />);

    const infoBtn = screen.getByLabelText('Mode Information');
    fireEvent.click(infoBtn);

    expect(screen.getByText('BAND Çalışma Modu & Sistem Bilgisi')).toBeInTheDocument();

    const githubLink = screen.getByText('GitHub Deposunu İncele').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/aemreceylan/BAND');

    // Close modal
    const closeBtn = screen.getByLabelText('Kapat');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('BAND Çalışma Modu & Sistem Bilgisi')).not.toBeInTheDocument();
  });

  it('conditionally hides device simulator controls when enableDeviceSimulator is false in manifest', () => {
    const customManifest = {
      ...bandManifest,
      container: {
        ...bandManifest.container!,
        enableDeviceSimulator: false,
      },
    };

    render(<BandApp manifest={customManifest} />);

    expect(screen.queryByTestId('sandbox-viewport-controls')).not.toBeInTheDocument();
  });

  it('appends instanceId query parameter when windowId is provided to isolate multiple window environments', () => {
    render(<BandApp manifest={bandManifest} windowId="band-2" />);

    const iframe = screen.getByTestId('sandbox-iframe-band');
    expect(iframe).toHaveAttribute('src', '/apps/band/index.html?instanceId=band-2');

    // Switch to connected mode
    const onlineBtn = screen.getByRole('button', { name: /online/i });
    fireEvent.click(onlineBtn);

    expect(iframe).toHaveAttribute('src', 'http://localhost:3000?instanceId=band-2');
  });

  it('preserves clean URL without query parameter when windowId is omitted', () => {
    render(<BandApp manifest={bandManifest} />);

    const iframe = screen.getByTestId('sandbox-iframe-band');
    expect(iframe).toHaveAttribute('src', '/apps/band/index.html');
  });
});
