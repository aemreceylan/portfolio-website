import React from 'react';
import { Globe, Palette, Check } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '#i18n/translations';
import { useTranslation } from '#i18n/i18n.store';
import '#styles/settings.css';

/**
 * SettingsApp component allowing the user to configure system preferences,
 * switch languages across 7 locales, and toggle appearance attributes.
 */
export const SettingsApp: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useTranslation();

  return (
    <div className="settings-container">
      {/* Settings Header */}
      <div className="settings-header">
        <h2>{t('settings_heading')}</h2>
        <p>{t('settings_subheading')}</p>
      </div>

      {/* Language Section */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Globe size={16} />
          <span>{t('settings_language_section')}</span>
        </div>
        <p className="settings-section-desc">{t('settings_language_desc')}</p>

        <div className="language-grid" role="group" aria-label={t('settings_language_section')}>
          {LANGUAGE_OPTIONS.map((lang) => {
            const isActive = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`language-card ${isActive ? 'active' : ''}`}
                onClick={() => setLanguage(lang.code)}
                aria-pressed={isActive}
                aria-label={`${lang.nativeName} (${lang.name})`}
              >
                <div className="language-info">
                  <span className="language-flag" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div className="language-names">
                    <span className="language-native">{lang.nativeName}</span>
                    <span className="language-code">{lang.code}</span>
                  </div>
                </div>

                {isActive && (
                  <span className="language-badge">
                    <Check size={12} style={{ display: 'inline', marginRight: 2 }} />
                    {t('settings_active_badge')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Appearance Section */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Palette size={16} />
          <span>{t('settings_appearance_section')}</span>
        </div>
        <p className="settings-section-desc">{t('settings_appearance_desc')}</p>
      </section>
    </div>
  );
};
