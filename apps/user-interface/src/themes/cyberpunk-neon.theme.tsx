import React from 'react';
import { ThemeDefinition, ThemeIconProps } from './theme.types';

/**
 * Cyberpunk Neon Brand Mark: Futuristic Cybernetic HUD Monogram.
 */
export const CyberBrandLogo: React.FC<ThemeIconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Cyberpunk System Logo"
  >
    {/* Hex HUD base */}
    <path
      d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
      fill="#090d16"
      stroke="#f43f5e"
      strokeWidth="1.4"
    />
    {/* Inner Core Accent */}
    <circle cx="12" cy="12" r="3.2" fill="#facc15" />
    <path d="M12 2V6M12 18V22M3 12H7M17 12H21" stroke="#06b6d4" strokeWidth="1.2" />
  </svg>
);

/**
 * Cyberpunk Terminal Logo: Cyber Command Line Interface with Pulsing Cursor.
 */
export const CyberTerminalLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Terminal Logo"
  >
    {/* HUD Top Corner Marks */}
    <path d="M3 7V4H6M21 7V4H18" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
    {/* Neon Pink Prompt Chevron */}
    <path
      d="M5 8L11 12.5L5 17"
      stroke="#f43f5e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* High Voltage Cyber Yellow Cursor */}
    <rect x="13" y="15.5" width="8" height="3" rx="0.5" fill="#facc15" />
    {/* Tech Status Pips */}
    <circle cx="15" cy="7" r="1.2" fill="#06b6d4" />
    <circle cx="19" cy="7" r="1.2" fill="#f43f5e" />
  </svg>
);

/**
 * Cyberpunk Settings Logo: Hexagonal Cybernetic Quantum Core.
 */
export const CyberSettingsLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Settings Logo"
  >
    {/* Outer Hex Chassis */}
    <path
      d="M12 2.5L20.5 7.4V16.6L12 21.5L3.5 16.6V7.4L12 2.5Z"
      fill="#0c101d"
      stroke="#f43f5e"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Inner Radial Flux Core */}
    <circle cx="12" cy="12" r="5" fill="#141b2d" stroke="#06b6d4" strokeWidth="1.3" />
    {/* Quantum Reactor Node */}
    <circle cx="12" cy="12" r="2.2" fill="#facc15" />
    {/* Power conduits */}
    <line x1="12" y1="2.5" x2="12" y2="7" stroke="#f43f5e" strokeWidth="1.4" />
    <line x1="12" y1="17" x2="12" y2="21.5" stroke="#f43f5e" strokeWidth="1.4" />
    <line x1="3.5" y1="12" x2="7" y2="12" stroke="#06b6d4" strokeWidth="1.4" />
    <line x1="17" y1="12" x2="20.5" y2="12" stroke="#06b6d4" strokeWidth="1.4" />
  </svg>
);

/**
 * Cyberpunk Markdown Logo: Neon Editorial Datastream Module.
 */
export const CyberMarkdownLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Markdown Logo"
  >
    {/* Top HUD Frame Bracket */}
    <path d="M3 6H21" stroke="#06b6d4" strokeWidth="1.3" strokeLinecap="round" />
    {/* High Contrast Neon 'M' Mark */}
    <path
      d="M3 18V9H6L9.5 13.5L13 9H16V18"
      stroke="#f43f5e"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cyber Yellow Downward Datastream Arrow */}
    <path
      d="M19.5 9V18M17 15.5L19.5 18L22 15.5"
      stroke="#facc15"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Base Cyber Bus */}
    <line x1="3" y1="21" x2="21" y2="21" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/**
 * Cyberpunk JavaScript IDE Logo: Neural Compiler Matrix.
 */
export const CyberJsIdeLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="JavaScript IDE Logo"
  >
    {/* Neon Left Code Bracket */}
    <path
      d="M7.5 6L2 12L7.5 18"
      stroke="#f43f5e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Neon Right Code Bracket */}
    <path
      d="M16.5 6L22 12L16.5 18"
      stroke="#f43f5e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* High Voltage Compiler Slash */}
    <line
      x1="14.5"
      y1="4.5"
      x2="9.5"
      y2="19.5"
      stroke="#facc15"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Subnet pips */}
    <circle cx="12" cy="7" r="1" fill="#06b6d4" />
    <circle cx="12" cy="17" r="1" fill="#06b6d4" />
  </svg>
);

/**
 * Cyberpunk Plain Text File (.txt): Encrypted Datapad with Cyan/Pink Badge.
 */
export const CyberTextFileLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Text File Icon"
  >
    {/* Chamfered Tech Card Base */}
    <path
      d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
      fill="#070a13"
      stroke="#334155"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M14.5 2.5V8H20" stroke="#f43f5e" strokeWidth="1.5" fill="#121829" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
    {/* Neon Rose Inset Badge */}
    <rect x="4.8" y="8.8" width="14.4" height="11" rx="2" fill="#111827" stroke="#f43f5e" strokeWidth="1.3" />
    <text
      x="12"
      y="16.9"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', monospace"
      fontSize="6.8"
      fontWeight="900"
      fill="#f8fafc"
      letterSpacing="-0.02em"
    >
      TXT
    </text>
  </svg>
);

/**
 * Cyberpunk Markdown File (.md): Neural Document Sheet with Pink/Yellow Badge.
 */
export const CyberMdFileLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Markdown File Icon"
  >
    <path
      d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
      fill="#070a13"
      stroke="#334155"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M14.5 2.5V8H20" stroke="#f43f5e" strokeWidth="1.5" fill="#121829" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#facc15" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="4.8" y="8.8" width="14.4" height="11" rx="2" fill="#111827" stroke="#f43f5e" strokeWidth="1.3" />
    <path
      d="M6.3 17.5V10.8H8.1L10 14L11.9 10.8H13.7V17.5"
      stroke="#f8fafc"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.8 10.8V17.5M14.6 15.2L16.8 17.5L19 15.2"
      stroke="#facc15"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Cyberpunk JavaScript Source File (.js): Cyber Script Module with Yellow Tag.
 */
export const CyberJsFileLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="JavaScript File Icon"
  >
    <path
      d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
      fill="#070a13"
      stroke="#334155"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M14.5 2.5V8H20" stroke="#facc15" strokeWidth="1.5" fill="#1a1c12" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#f43f5e" strokeWidth="1.6" strokeLinecap="round" />
    <rect x="4.8" y="8.8" width="14.4" height="11" rx="2" fill="#181710" stroke="#facc15" strokeWidth="1.3" />
    <text
      x="12"
      y="17.1"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', monospace"
      fontSize="7.8"
      fontWeight="900"
      fill="#facc15"
      letterSpacing="-0.02em"
    >
      JS
    </text>
  </svg>
);

export const cyberpunkNeonTheme: ThemeDefinition = {
  id: 'cyberpunk-neon',
  name: 'Cyberpunk Neon',
  subtitle: 'Night City & Synthwave HUD',
  description: 'Yüksek voltaj neon ışıltısı, koyu OLED yüzeyler, fütüristik HUD telemetrisi ve sibernetik hatlar.',
  colors: {
    accentColor: '#f43f5e',
    accentRgb: '244, 63, 94',
    wallpaperBackground:
      'radial-gradient(ellipse at 15% 15%, rgba(244, 63, 94, 0.16) 0%, transparent 45%), radial-gradient(ellipse at 85% 85%, rgba(6, 182, 212, 0.15) 0%, transparent 45%), #030712',
    extraCssVariables: {
      '--color-accent-secondary': '#facc15',
      '--color-accent-tertiary': '#06b6d4',
    },
  },
  typography: {
    fontSans: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
    fontMono: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
  },
  icons: {
    appIcons: {
      terminal: CyberTerminalLogo,
      'markdown-viewer': CyberMarkdownLogo,
      'js-ide': CyberJsIdeLogo,
      settings: CyberSettingsLogo,
    },
    fileIcons: {
      txt: CyberTextFileLogo,
      md: CyberMdFileLogo,
      js: CyberJsFileLogo,
    },
    brandIcon: CyberBrandLogo,
    fallbackAppIcon: CyberTerminalLogo,
    fallbackFileIcon: CyberTextFileLogo,
  },
};
