import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LanguageFlag } from './LanguageFlag';
import type { SupportedLanguage } from '#i18n/translations';

describe('LanguageFlag Component', () => {
  const supportedLocales: SupportedLanguage[] = ['en', 'tr', 'de', 'fr', 'es', 'ru', 'ja'];

  it.each(supportedLocales)('should render valid SVG flag for locale "%s"', (locale) => {
    const { container } = render(<LanguageFlag code={locale} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 60 40');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should support custom width, height, and className', () => {
    const { container } = render(
      <LanguageFlag code="tr" width={32} height={22} className="custom-flag" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '22');
    expect(svg).toHaveClass('custom-flag');
  });
});
