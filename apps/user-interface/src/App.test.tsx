import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { App } from './App';
import { useI18nStore } from '#i18n/i18n.store';

describe('Root App Component', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="description" content="" />
      <meta property="og:title" content="" />
      <meta property="og:description" content="" />
      <meta property="og:locale" content="" />
      <meta name="twitter:title" content="" />
      <meta name="twitter:description" content="" />
    `;
    useI18nStore.getState().setLanguage('en');
  });

  it('should render the Desktop and boot terminal automatically', () => {
    render(<App />);

    expect(screen.getByText('AEC')).toBeInTheDocument();
    expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
  });

  it('should synchronize document.documentElement.lang, title and meta tags with active language', () => {
    render(<App />);

    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('AEC — Application Portfolio');

    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(metaDesc).toContain('AEC portfolio experience');

    const ogLocale = document.querySelector('meta[property="og:locale"]')?.getAttribute('content');
    expect(ogLocale).toBe('en_US');
  });

  it('should update DOM head metadata dynamically when language changes', () => {
    render(<App />);

    act(() => {
      useI18nStore.getState().setLanguage('tr');
    });

    expect(document.documentElement.lang).toBe('tr');
    expect(document.title).toBe('AEC — Uygulama Portfolyosu');

    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(metaDesc).toContain('AEC portfolyo deneyimi');

    const ogLocale = document.querySelector('meta[property="og:locale"]')?.getAttribute('content');
    expect(ogLocale).toBe('tr_TR');
  });
});

