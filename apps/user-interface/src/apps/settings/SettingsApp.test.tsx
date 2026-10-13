import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsApp } from './SettingsApp';
import { useI18nStore } from '../../i18n/i18n.store';

describe('SettingsApp Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
  });

  it('should render language selection options including Turkish and English', () => {
    render(<SettingsApp />);

    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Language & Localization')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Türkçe')).toBeInTheDocument();
  });

  it('should switch active language when a language card is clicked', () => {
    render(<SettingsApp />);

    const turkishButton = screen.getByRole('button', { name: /Türkçe/i });
    fireEvent.click(turkishButton);

    expect(useI18nStore.getState().currentLanguage).toBe('tr');
    expect(screen.getByText('Sistem Ayarları')).toBeInTheDocument();
  });
});
