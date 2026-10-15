import React from 'react';
import { ThemeDefinition, ThemeIconProps } from './theme.types';

/**
 * Classic Macintosh Brand Mark: The 1984 Smiling "Happy Mac" Computer.
 */
export const MacBrandLogo: React.FC<ThemeIconProps> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Happy Mac Logo"
  >
    {/* Computer Outer Chassis */}
    <rect x="3" y="2.5" width="18" height="19" rx="1.5" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" />
    {/* CRT Monitor Inset Screen */}
    <rect x="5.5" y="4.5" width="13" height="9" rx="1" fill="#ffffff" stroke="#111" strokeWidth="1.2" />
    {/* Smiling Screen Face */}
    <rect x="8" y="7" width="1.6" height="1.6" fill="#111" />
    <rect x="14.4" y="7" width="1.6" height="1.6" fill="#111" />
    <path d="M8.5 10.5C9.5 12 14.5 12 15.5 10.5" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
    {/* Chassis Groove Line */}
    <line x1="3" y1="15" x2="21" y2="15" stroke="#111" strokeWidth="1" />
    {/* 3.5-inch Floppy Disk Drive Slot */}
    <rect x="6.5" y="16.8" width="11" height="1.6" rx="0.4" fill="#111" />
  </svg>
);

/**
 * Classic Macintosh Terminal Logo: Vintage Command Line Shell with Inverted Titlebar.
 */
export const MacTerminalLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Terminal Logo"
  >
    {/* Window Frame */}
    <rect x="2.5" y="3.5" width="19" height="17" rx="1" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
    {/* Inverted Black Titlebar */}
    <rect x="2.5" y="3.5" width="19" height="4.5" fill="#111" />
    {/* Left Go-Away Close Box */}
    <rect x="4" y="4.5" width="2.5" height="2.5" fill="#ffffff" />
    {/* Pinstripe Accents on Titlebar */}
    <line x1="8.5" y1="5.7" x2="19.5" y2="5.7" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="1.5 1" />
    {/* Pixelated Command Prompt Chevron */}
    <path
      d="M5.5 11.5L9 14.5L5.5 17.5"
      stroke="#111"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    {/* Solid Block Cursor */}
    <rect x="11.5" y="14.5" width="5.5" height="3" fill="#000080" />
    {/* Output Scan Line */}
    <line x1="11.5" y1="12" x2="18.5" y2="12" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 1" />
  </svg>
);

/**
 * Classic Macintosh Settings Logo: System 7 Control Panels & Hardware Sliders.
 */
export const MacSettingsLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Settings Logo"
  >
    {/* Beveled Panel Base */}
    <rect x="2.5" y="2.5" width="19" height="19" rx="1" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" />
    {/* Channel Track 1 */}
    <line x1="5.5" y1="6.5" x2="18.5" y2="6.5" stroke="#111" strokeWidth="1.6" />
    {/* Chiseled Knob 1 */}
    <rect x="12" y="4.5" width="4" height="4" fill="#ffffff" stroke="#111" strokeWidth="1.2" />
    <line x1="14" y1="5.2" x2="14" y2="7.8" stroke="#000080" strokeWidth="1" />
    {/* Channel Track 2 */}
    <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="#111" strokeWidth="1.6" />
    {/* Chiseled Knob 2 */}
    <rect x="7.5" y="10" width="4" height="4" fill="#ffffff" stroke="#111" strokeWidth="1.2" />
    <line x1="9.5" y1="10.7" x2="9.5" y2="13.3" stroke="#000080" strokeWidth="1" />
    {/* Toggle Buttons Inset */}
    <rect x="5.5" y="16" width="6" height="3" fill="#ffffff" stroke="#111" strokeWidth="1" />
    <rect x="12.5" y="16" width="6" height="3" fill="#111" stroke="#111" strokeWidth="1" />
  </svg>
);

/**
 * Classic Macintosh Markdown Logo: TeachText / Document Quill Scroll.
 */
export const MacMarkdownLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Markdown Viewer Logo"
  >
    {/* Dog-eared Document Sheet */}
    <path
      d="M4 2.5H15L20 7.5V21.5H4V2.5Z"
      fill="#ffffff"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M15 2.5V7.5H20" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Document Text Lines */}
    <line x1="7" y1="7" x2="12" y2="7" stroke="#111" strokeWidth="1.6" strokeLinecap="square" />
    <line x1="7" y1="10.5" x2="17" y2="10.5" stroke="#111" strokeWidth="1.6" strokeLinecap="square" />
    <line x1="7" y1="14" x2="17" y2="14" stroke="#111" strokeWidth="1.6" strokeLinecap="square" />
    {/* Markdown Signature Badge */}
    <rect x="6.5" y="16.5" width="11" height="3.5" rx="0.5" fill="#000080" />
    <text
      x="12"
      y="19.3"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="3"
      fontWeight="900"
      fill="#ffffff"
      letterSpacing="0.05em"
    >
      MARKDOWN
    </text>
  </svg>
);

/**
 * Classic Macintosh JS IDE Logo: 3.5" Floppy Diskette with JS System Label.
 */
export const MacJsIdeLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="JS IDE Logo"
  >
    {/* 3.5" Diskette Plastic Shell */}
    <path
      d="M3.5 2.5H17.5L20.5 5.5V21.5H3.5V2.5Z"
      fill="#2b2d35"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Metal Shutter Top Slider */}
    <rect x="7" y="2.5" width="9.5" height="6.5" fill="#dcdfe5" stroke="#111" strokeWidth="1.2" />
    {/* Shutter Window Hole */}
    <rect x="12" y="4" width="2.2" height="3.5" fill="#2b2d35" />
    {/* System Paper Label */}
    <rect x="6" y="11.5" width="12" height="8.5" rx="0.5" fill="#ffffff" stroke="#111" strokeWidth="1" />
    {/* Floppy Write-Protect Notch */}
    <rect x="17.2" y="18.5" width="1.8" height="1.8" fill="#111" />
    {/* High-Contrast "JS" Label Header */}
    <rect x="6" y="11.5" width="12" height="3" fill="#000080" />
    <text
      x="12"
      y="14"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="2.4"
      fontWeight="900"
      fill="#ffffff"
    >
      DEV DISK
    </text>
    <text
      x="12"
      y="18.5"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="4"
      fontWeight="900"
      fill="#111"
      letterSpacing="-0.02em"
    >
      JS
    </text>
  </svg>
);

/**
 * Classic Macintosh Text File Logo (dog-eared document + TXT badge)
 */
export const MacTextFileLogo: React.FC<ThemeIconProps> = ({ size = 30, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="TXT File Logo"
  >
    <path
      d="M4.5 2.5H15L19.5 7V21.5H4.5V2.5Z"
      fill="#ffffff"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M15 2.5V7H19.5" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#111" strokeWidth="1.5" strokeLinecap="square" />
    <rect x="4.8" y="9" width="14.4" height="11" rx="0.5" fill="#f1f3f7" stroke="#111" strokeWidth="1.2" />
    <text
      x="12"
      y="17"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="6.5"
      fontWeight="900"
      fill="#111"
      letterSpacing="0.02em"
    >
      TXT
    </text>
  </svg>
);

/**
 * Classic Macintosh Markdown File Logo (dog-eared document + M ↓ badge)
 */
export const MacMdFileLogo: React.FC<ThemeIconProps> = ({ size = 30, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="MD File Logo"
  >
    <path
      d="M4.5 2.5H15L19.5 7V21.5H4.5V2.5Z"
      fill="#ffffff"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M15 2.5V7H19.5" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#111" strokeWidth="1.5" strokeLinecap="square" />
    <rect x="4.8" y="9" width="14.4" height="11" rx="0.5" fill="#000080" stroke="#111" strokeWidth="1.2" />
    <text
      x="12"
      y="17.2"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="6.8"
      fontWeight="900"
      fill="#ffffff"
      letterSpacing="-0.01em"
    >
      M ↓
    </text>
  </svg>
);

/**
 * Classic Macintosh JavaScript File Logo (dog-eared document + JS badge)
 */
export const MacJsFileLogo: React.FC<ThemeIconProps> = ({ size = 30, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="JS File Logo"
  >
    <path
      d="M4.5 2.5H15L19.5 7V21.5H4.5V2.5Z"
      fill="#ffffff"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M15 2.5V7H19.5" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#111" strokeWidth="1.5" strokeLinecap="square" />
    <rect x="4.8" y="9" width="14.4" height="11" rx="0.5" fill="#f59e0b" stroke="#111" strokeWidth="1.2" />
    <text
      x="12"
      y="17.2"
      textAnchor="middle"
      fontFamily="'Geneva', monospace"
      fontSize="7"
      fontWeight="900"
      fill="#111"
      letterSpacing="-0.02em"
    >
      JS
    </text>
  </svg>
);

/**
 * Classic Macintosh Game Hub Logo: Susan Kare 1984 Pixelated Gamepad.
 */
export const MacGameHubLogo: React.FC<ThemeIconProps> = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Game Hub Logo"
  >
    {/* Platinum Beveled Case */}
    <rect x="2.5" y="6.5" width="19" height="11" rx="1" fill="#dcdfe5" stroke="#111" strokeWidth="1.5" />
    <line x1="3" y1="7.5" x2="21" y2="7.5" stroke="#ffffff" strokeWidth="1" />
    <line x1="3" y1="17.5" x2="21" y2="17.5" stroke="#111" strokeWidth="1" />
    {/* D-Pad Pixel Cross */}
    <rect x="5.5" y="11" width="5" height="2" fill="#111" />
    <rect x="7" y="9.5" width="2" height="5" fill="#111" />
    {/* Retro Action Buttons */}
    <rect x="15" y="12" width="2.2" height="2.2" fill="#000080" stroke="#111" strokeWidth="0.8" />
    <rect x="17.5" y="9.5" width="2.2" height="2.2" fill="#000080" stroke="#111" strokeWidth="0.8" />
  </svg>
);

/**
 * Classic Macintosh Theme Definition (1984 System 7 / Susan Kare GUI).
 */
export const classicMacTheme: ThemeDefinition = {
  id: 'classic-mac',
  name: 'Classic Macintosh',
  subtitle: '1984 System 7 & Susan Kare GUI',
  description: 'Nostaljik 1984 platin şasi, pinstripe başlık çubuğu, 3D kabartmalı butonlar ve retro piksel ikonografisi.',
  colors: {
    accentColor: '#000080',
    accentRgb: '0, 0, 128',
    wallpaperBackground:
      'repeating-conic-gradient(#767b85 0% 25%, #8c919c 0% 50%) 0 0 / 4px 4px',
    extraCssVariables: {
      '--color-mac-platinum': '#dcdfe5',
      '--color-mac-dark': '#1e2024',
      '--color-mac-highlight': '#2563eb',
    },
  },
  typography: {
    fontSans: "'Geneva', 'Chicago', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'Monaco', 'Courier New', monospace",
  },
  icons: {
    appIcons: {
      terminal: MacTerminalLogo,
      'markdown-viewer': MacMarkdownLogo,
      'js-ide': MacJsIdeLogo,
      settings: MacSettingsLogo,
      'game-hub': MacGameHubLogo,
    },
    fileIcons: {
      txt: MacTextFileLogo,
      md: MacMdFileLogo,
      js: MacJsFileLogo,
    },
    brandIcon: MacBrandLogo,
    fallbackAppIcon: MacTerminalLogo,
    fallbackFileIcon: MacTextFileLogo,
  },
};
