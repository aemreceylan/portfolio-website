import React from 'react';

export interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * AEC Brand Logo: Swiss Constructivist Architectural Monogram.
 * Features an engineered geometric "AEC" typographic mark with an industrial signal status beacon.
 */
export const AecBrandLogo: React.FC<LogoProps> = ({ size = 20, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AEC System Logo"
    >
      {/* Matte chassis base */}
      <rect x="1" y="1" width="22" height="22" rx="3.5" fill="#15181f" stroke="#373e4d" strokeWidth="1.3" />
      {/* Precision grid letterform: Geometric A */}
      <path
        d="M5 17L8.5 7L12 17M6.2 13.5H10.8"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Precision grid letterform: Monolithic E */}
      <path
        d="M14 7H19M14 12H17.5M14 17H19M14 7V17"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Dynamic Theme Signal Accent: Precision Status Beacon */}
      <rect x="17.5" y="11" width="2.4" height="2.4" fill="var(--color-accent, #ff5500)" />
    </svg>
  );
};

/**
 * Terminal Application Logo: Hardware Command Instrument.
 * High-contrast command prompt glyph with theme-reactive cursor beacon.
 */
export const TerminalAppLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Terminal Logo"
    >
      {/* High-Contrast Bold Command Prompt Chevron */}
      <path
        d="M4 6L11 12L4 18"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Theme-Reactive Industrial Cursor Block */}
      <rect x="13" y="15" width="8" height="3" rx="0.5" fill="var(--color-accent, #ff5500)" />
      {/* Precision Instrument Calibration Pip */}
      <circle cx="19" cy="6" r="1.5" fill="var(--color-accent, #ff5500)" />
    </svg>
  );
};

/**
 * Settings Application Logo: Precision Machined 8-Tooth Industrial Gear Mechanism.
 * Inspired by Swiss horology, Dieter Rams mechanical components, and precision instrument gearing.
 */
export const SettingsAppLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Settings Logo"
    >
      {/* Precision Engineering 8-Tooth Industrial Gear Chassis */}
      <path
        d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 16.96 19.71L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14.08 20.83V21A2 2 0 1 1 10.08 21V20.91A1.65 1.65 0 0 0 9.08 19.4A1.65 1.65 0 0 0 7.26 19.73L7.2 19.79A2 2 0 1 1 4.37 16.96L4.43 16.9A1.65 1.65 0 0 0 4.76 15.08A1.65 1.65 0 0 0 3.25 14.08H3.16A2 2 0 1 1 3.16 10.08H3.25A1.65 1.65 0 0 0 4.76 9.08A1.65 1.65 0 0 0 4.43 7.26L4.37 7.2A2 2 0 1 1 7.2 4.37L7.26 4.43A1.65 1.65 0 0 0 9.08 4.76A1.65 1.65 0 0 0 10.08 3.25V3.16A2 2 0 1 1 14.08 3.16V3.25A1.65 1.65 0 0 0 15.08 4.76A1.65 1.65 0 0 0 16.9 4.43L16.96 4.37A2 2 0 1 1 19.79 7.2L19.73 7.26A1.65 1.65 0 0 0 19.4 9.08A1.65 1.65 0 0 0 20.91 10.08H21A2 2 0 1 1 21 14.08H20.91A1.65 1.65 0 0 0 19.4 15Z"
        fill="#141720"
        stroke="#475569"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Machined Rotor Hub */}
      <circle cx="12" cy="12" r="5.6" fill="#1e2430" stroke="#64748b" strokeWidth="1.2" />
      {/* Axle Aperture */}
      <circle cx="12" cy="12" r="3" fill="#0f1218" stroke="#475569" strokeWidth="1.1" />
      {/* Theme-Reactive Drive Hub Core */}
      <circle cx="12" cy="12" r="1.6" fill="var(--color-accent, #ff5500)" />
      {/* Swiss Radial Calibration Notches */}
      <line x1="12" y1="6.8" x2="12" y2="8.6" stroke="#e2e8f0" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="7.5" y1="14.6" x2="9.1" y2="13.7" stroke="#e2e8f0" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="16.5" y1="14.6" x2="14.9" y2="13.7" stroke="#e2e8f0" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Markdown Application Logo: Swiss Editorial Typographic Mark.
 * Clean, bold architectural 'M' with theme-reactive directional indicator and baseline guideline.
 */
export const MarkdownAppLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Markdown Logo"
    >
      {/* Swiss Monolithic "M" Mark in High-Contrast White */}
      <path
        d="M3 17V7H6L9.5 12L13 7H16V17"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Theme-Reactive Directional Downward Arrow */}
      <path
        d="M19.5 7V17M17 14.5L19.5 17L22 14.5"
        stroke="var(--color-accent, #ff5500)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Architectural Baseline Rule */}
      <line x1="3" y1="20" x2="22" y2="20" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * JavaScript IDE Application Logo: Precision Code Studio Module.
 * Minimalist engineering brackets with compiler slash beacon.
 */
export const JsIdeAppLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JavaScript IDE Logo"
    >
      {/* Left Code Bracket */}
      <path
        d="M7.5 7L2.5 12L7.5 17"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Code Bracket */}
      <path
        d="M16.5 7L21.5 12L16.5 17"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Technical Compiler Slash */}
      <line
        x1="14"
        y1="5"
        x2="10"
        y2="19"
        stroke="var(--color-accent, #ff5500)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Plain Text Document File Icon (.txt): Architectural Blueprint Sheet with Monospace TXT Badge.
 */
export const TextFileLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Text File Icon"
    >
      {/* Document Perimeter */}
      <path
        d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
        fill="#101217"
        stroke="#3d4656"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Precision Corner Fold */}
      <path d="M14.5 2.5V8H20" stroke="#3d4656" strokeWidth="1.5" fill="#1b1f2a" strokeLinejoin="round" />
      {/* Header Typographic Guidelines */}
      <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#71717a" strokeWidth="1.6" strokeLinecap="round" />
      {/* Monospace "TXT" Inset Badge - Enlarged & Centered */}
      <rect
        x="4.8"
        y="8.8"
        width="14.4"
        height="11"
        rx="2"
        fill="#1b1f29"
        stroke="#4b5563"
        strokeWidth="1.3"
      />
      <text
        x="12"
        y="16.9"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="6.8"
        fontWeight="800"
        fill="#e2e8f0"
        letterSpacing="-0.02em"
      >
        TXT
      </text>
    </svg>
  );
};

/**
 * Markdown Document File Icon (.md): Architectural Blueprint Sheet with Swiss M Arrow Badge.
 */
export const MdFileLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Markdown File Icon"
    >
      {/* Document Perimeter */}
      <path
        d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
        fill="#101217"
        stroke="#3d4656"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Precision Corner Fold */}
      <path d="M14.5 2.5V8H20" stroke="#3d4656" strokeWidth="1.5" fill="#1b1f2a" strokeLinejoin="round" />
      {/* Theme Signal Top Guideline */}
      <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="var(--color-accent, #ff5500)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Distinctive Markdown "M ↓" Inset Badge - Enlarged & High Legibility */}
      <rect
        x="4.8"
        y="8.8"
        width="14.4"
        height="11"
        rx="2"
        fill="#151720"
        stroke="var(--color-accent, #ff5500)"
        strokeWidth="1.3"
      />
      {/* Swiss Monolithic "M" Mark - Substantially Enlarged */}
      <path
        d="M6.3 17.5V10.8H8.1L10 14L11.9 10.8H13.7V17.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Theme-Reactive Downward Arrow - Substantially Enlarged */}
      <path
        d="M16.8 10.8V17.5M14.6 15.2L16.8 17.5L19 15.2"
        stroke="var(--color-accent, #ff5500)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * JavaScript Source File Icon (.js): Technical Script Module with Amber JS Tag.
 */
export const JsFileLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JavaScript File Icon"
    >
      {/* Document Perimeter with subtle amber border hint */}
      <path
        d="M4 2.5H14.5L20 8V21.5H4V2.5Z"
        fill="#121419"
        stroke="#59482b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Corner Fold */}
      <path d="M14.5 2.5V8H20" stroke="#59482b" strokeWidth="1.5" fill="#201b13" strokeLinejoin="round" />
      {/* Amber Top Guideline */}
      <line x1="7" y1="6.5" x2="12" y2="6.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      {/* Bold Monospace "JS" Inset Box - Enlarged & Centered */}
      <rect
        x="4.8"
        y="8.8"
        width="14.4"
        height="11"
        rx="2"
        fill="#231d10"
        stroke="#d97706"
        strokeWidth="1.3"
      />
      <text
        x="12"
        y="17.1"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="7.8"
        fontWeight="800"
        fill="#f59e0b"
        letterSpacing="-0.02em"
      >
        JS
      </text>
    </svg>
  );
};
