import {
  AecBrandLogo,
  TerminalAppLogo,
  SettingsAppLogo,
  MarkdownAppLogo,
  JsIdeAppLogo,
  TextFileLogo,
  MdFileLogo,
  JsFileLogo,
} from '#components/icons/AppLogos';
import { ThemeDefinition } from './theme.types';

export const swissIndustrialTheme: ThemeDefinition = {
  id: 'swiss-industrial',
  name: 'Swiss Industrial',
  subtitle: 'Dieter Rams & Braun Ekolü',
  description: 'Weniger, aber besser: Masif mat şasi, 32px mimari CAD ızgarası ve tekil emniyet turuncusu.',
  colors: {
    accentColor: '#ff5500',
    accentRgb: '255, 85, 0',
    wallpaperBackground: '#0a0b0d',
  },
  typography: {
    fontSans: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
    fontMono: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
  },
  icons: {
    appIcons: {
      terminal: TerminalAppLogo,
      'markdown-viewer': MarkdownAppLogo,
      'js-ide': JsIdeAppLogo,
      settings: SettingsAppLogo,
    },
    fileIcons: {
      txt: TextFileLogo,
      md: MdFileLogo,
      js: JsFileLogo,
    },
    brandIcon: AecBrandLogo,
    fallbackAppIcon: TerminalAppLogo,
    fallbackFileIcon: TextFileLogo,
  },
};
