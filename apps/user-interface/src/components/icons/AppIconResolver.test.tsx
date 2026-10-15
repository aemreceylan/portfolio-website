import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { AppIconResolver } from './AppIconResolver';
import { useThemeStore } from '#stores/theme.store';

describe('AppIconResolver', () => {
  beforeEach(() => {
    act(() => {
      useThemeStore.getState().reset();
    });
  });

  it('renders Lucide icons in spatial-glass theme', () => {
    act(() => {
      useThemeStore.getState().setTheme('spatial-glass');
    });
    const { container } = render(<AppIconResolver appId="terminal" size={24} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('lucide-terminal');
  });

  it('renders custom SVG vector logos in swiss-industrial theme', () => {
    act(() => {
      useThemeStore.getState().setTheme('swiss-industrial');
    });
    const { container } = render(<AppIconResolver appId="terminal" size={24} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Terminal Logo');
  });

  it('renders file logos appropriately for text, markdown and js in swiss-industrial theme', () => {
    act(() => {
      useThemeStore.getState().setTheme('swiss-industrial');
    });

    const { container: txtContainer } = render(<AppIconResolver fileExtension="txt" size={24} />);
    expect(txtContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Text File Icon');

    const { container: mdContainer } = render(<AppIconResolver fileExtension="md" size={24} />);
    expect(mdContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Markdown File Icon');

    const { container: jsContainer } = render(<AppIconResolver fileExtension="js" size={24} />);
    expect(jsContainer.querySelector('svg')).toHaveAttribute('aria-label', 'JavaScript File Icon');
  });

  it('renders Lucide file icons in spatial-glass theme', () => {
    act(() => {
      useThemeStore.getState().setTheme('spatial-glass');
    });

    const { container: txtContainer } = render(<AppIconResolver fileExtension="txt" size={24} />);
    expect(txtContainer.querySelector('svg')).toHaveClass('lucide-file-text');

    const { container: mdContainer } = render(<AppIconResolver fileExtension="md" size={24} />);
    expect(mdContainer.querySelector('svg')).toHaveClass('lucide-book-open');

    const { container: jsContainer } = render(<AppIconResolver fileExtension="js" size={24} />);
    expect(jsContainer.querySelector('svg')?.getAttribute('class')).toMatch(/lucide-code/);
  });

  it('renders brand logo appropriately across themes', () => {
    act(() => {
      useThemeStore.getState().setTheme('spatial-glass');
    });
    const { container: glassBrand } = render(<AppIconResolver variant="brand" size={24} />);
    expect(glassBrand.querySelector('svg')).toHaveClass('lucide-terminal');

    act(() => {
      useThemeStore.getState().setTheme('swiss-industrial');
    });
    const { container: swissBrand } = render(<AppIconResolver variant="brand" size={24} />);
    expect(swissBrand.querySelector('svg')).toHaveAttribute('aria-label', 'AEC System Logo');

    act(() => {
      useThemeStore.getState().setTheme('classic-mac');
    });
    const { container: macBrand } = render(<AppIconResolver variant="brand" size={24} />);
    expect(macBrand.querySelector('svg')).toHaveAttribute('aria-label', 'Happy Mac Logo');
  });

  it('renders custom Classic Mac icons for terminal and files', () => {
    act(() => {
      useThemeStore.getState().setTheme('classic-mac');
    });

    const { container: termContainer } = render(<AppIconResolver appId="terminal" size={24} />);
    expect(termContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Terminal Logo');

    const { container: txtContainer } = render(<AppIconResolver fileExtension="txt" size={24} />);
    expect(txtContainer.querySelector('svg')).toHaveAttribute('aria-label', 'TXT File Logo');
  });
});
