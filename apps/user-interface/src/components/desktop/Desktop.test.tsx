import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Desktop } from './Desktop';
import { useWindowManager } from '#stores/window-manager.store';
import { useI18nStore } from '#i18n/i18n.store';

describe('Desktop Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
    useWindowManager.getState().reset();
  });

  it('should render status bar with AEC brand and clock', () => {
    render(<Desktop />);

    expect(screen.getByText('AEC')).toBeInTheDocument();
    expect(screen.getByText('Terminal CLI')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should open window when clicking a desktop app icon', () => {
    render(<Desktop />);

    const terminalIcon = screen.getByTestId('desktop-app-terminal');
    fireEvent.click(terminalIcon);

    expect(useWindowManager.getState().windows['terminal']).toBeDefined();
    expect(useWindowManager.getState().windows['terminal'].isOpen).toBe(true);
  });
});
