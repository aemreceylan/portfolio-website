import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AecBrandLogo,
  TerminalAppLogo,
  SettingsAppLogo,
  MarkdownAppLogo,
  JsIdeAppLogo,
  TextFileLogo,
  MdFileLogo,
  JsFileLogo,
} from './AppLogos';

describe('AppLogos Components', () => {
  it('should render AEC Brand Logo with proper aria label and svg paths', () => {
    render(<AecBrandLogo size={24} />);
    expect(screen.getByLabelText('AEC System Logo')).toBeInTheDocument();
  });

  it('should render Terminal, Settings, Markdown, and JS IDE application logos', () => {
    render(
      <div>
        <TerminalAppLogo />
        <SettingsAppLogo />
        <MarkdownAppLogo />
        <JsIdeAppLogo />
      </div>
    );

    expect(screen.getByLabelText('Terminal Logo')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings Logo')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown Logo')).toBeInTheDocument();
    expect(screen.getByLabelText('JavaScript IDE Logo')).toBeInTheDocument();
  });

  it('should render distinct VFS file document icons for txt, md, and js files', () => {
    render(
      <div>
        <TextFileLogo />
        <MdFileLogo />
        <JsFileLogo />
      </div>
    );

    expect(screen.getByLabelText('Text File Icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown File Icon')).toBeInTheDocument();
    expect(screen.getByLabelText('JavaScript File Icon')).toBeInTheDocument();
  });
});
