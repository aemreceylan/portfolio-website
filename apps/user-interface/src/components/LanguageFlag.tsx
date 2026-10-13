import React from 'react';
import type { SupportedLanguage } from '#i18n/translations';

interface LanguageFlagProps {
  code: SupportedLanguage;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * High-definition vector SVG flag component for supported locales.
 * Renders consistent, pixel-crisp national flags across all operating systems
 * without relying on system emoji font glyphs.
 */
export const LanguageFlag: React.FC<LanguageFlagProps> = ({
  code,
  width = 24,
  height = 16,
  className = '',
}) => {
  const clipId = `flag-clip-${code}`;

  const renderFlagGraphic = () => {
    switch (code) {
      case 'en':
        // United Kingdom (Union Jack)
        return (
          <>
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="12" />
            <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="7" />
          </>
        );

      case 'tr':
        // Turkey (Al Bayrak: Crescent and Star)
        return (
          <>
            <rect width="60" height="40" fill="#E30A17" />
            <circle cx="23" cy="20" r="10.5" fill="#FFFFFF" />
            <circle cx="26" cy="20" r="8.4" fill="#E30A17" />
            <polygon
              points="35,16 36.1,18.8 39.2,18.9 36.7,20.8 37.6,23.8 35,22 32.4,23.8 33.3,20.8 30.8,18.9 33.9,18.8"
              fill="#FFFFFF"
            />
          </>
        );

      case 'de':
        // Germany (Schwarz-Rot-Gold)
        return (
          <>
            <rect width="60" height="13.33" y="0" fill="#000000" />
            <rect width="60" height="13.33" y="13.33" fill="#DD0000" />
            <rect width="60" height="13.34" y="26.66" fill="#FFCE00" />
          </>
        );

      case 'fr':
        // France (Tricolore: Blue, White, Red)
        return (
          <>
            <rect width="20" height="40" x="0" fill="#002654" />
            <rect width="20" height="40" x="20" fill="#FFFFFF" />
            <rect width="20" height="40" x="40" fill="#ED2939" />
          </>
        );

      case 'es':
        // Spain (Rojigualda: Red, Yellow, Red)
        return (
          <>
            <rect width="60" height="10" y="0" fill="#AA151B" />
            <rect width="60" height="20" y="10" fill="#F1BF00" />
            <rect width="60" height="10" y="30" fill="#AA151B" />
          </>
        );

      case 'ru':
        // Russia (White, Blue, Red)
        return (
          <>
            <rect width="60" height="13.33" y="0" fill="#FFFFFF" />
            <rect width="60" height="13.33" y="13.33" fill="#0039A6" />
            <rect width="60" height="13.34" y="26.66" fill="#D52B1E" />
          </>
        );

      case 'ja':
        // Japan (Nisshōki: Hinomaru)
        return (
          <>
            <rect width="60" height="40" fill="#FFFFFF" />
            <circle cx="30" cy="20" r="11" fill="#BC002D" />
          </>
        );

      default:
        return <rect width="60" height="40" fill="#333333" />;
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'block', borderRadius: '3px', flexShrink: 0 }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="60" height="40" rx="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {renderFlagGraphic()}
      </g>
    </svg>
  );
};
