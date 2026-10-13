import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useI18nStore } from '#i18n/i18n.store';

describe('Root App Component', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('en');
  });

  it('should render the Desktop and boot terminal automatically', () => {
    render(<App />);

    expect(screen.getByText('AEC')).toBeInTheDocument();
    expect(screen.getByTestId('window-terminal')).toBeInTheDocument();
  });
});
