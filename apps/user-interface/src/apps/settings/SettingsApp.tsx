import React, { useState } from 'react';
import { Globe, Palette, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '#i18n/translations';
import { useTranslation } from '#i18n/i18n.store';
import { LanguageFlag } from '#components/LanguageFlag';
import { useThemeStore, THEME_OPTIONS, THEME_DEFINITIONS, ThemeId } from '#stores/theme.store';
import { performSystemReset } from '#services/system-reset';
import '#styles/settings.css';

/**
 * SettingsApp component allowing the user to configure:
 * - Multilingual preferences across 7 locales
 * - Multi-Engine System Design Theme (Spatial Dark Glass, Swiss Industrial, Cyberpunk Neon, Classic Macintosh)
 * - System factory reset (equivalent to sudo rm -rf in GUI)
 */
export const SettingsApp: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const { currentTheme, setTheme } = useThemeStore();
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const getThemeDescription = (themeId: ThemeId): string => {
    switch (themeId) {
      case 'spatial-glass':
        return t('settings_theme_desc_spatial_glass');
      case 'swiss-industrial':
        return t('settings_theme_desc_swiss_industrial');
      case 'cyberpunk-neon':
        return t('settings_theme_desc_cyberpunk_neon');
      case 'classic-mac':
        return t('settings_theme_desc_classic_mac');
      default:
        return THEME_DEFINITIONS[themeId]?.description || t('settings_appearance_desc');
    }
  };

  const activeThemeMeta = THEME_DEFINITIONS[currentTheme];
  const activeThemeTitle = activeThemeMeta
    ? t('settings_theme_title_format').replace('{name}', activeThemeMeta.name)
    : t('settings_appearance_section');
  const activeThemeDescription = getThemeDescription(currentTheme);

  const handleConfirmReset = () => {
    performSystemReset();
    setShowResetConfirm(false);
    setResetSuccessMessage(t('settings_reset_success'));
    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="settings-container" role="region" aria-label="System Settings">
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
                  <div className="language-flag-wrapper">
                    <LanguageFlag code={lang.code} width={26} height={18} />
                  </div>
                  <span className="language-native">{lang.nativeName}</span>
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

      {/* Design System Theme Section */}
      <section className="settings-section" aria-label={activeThemeTitle}>
        <div className="settings-section-title">
          <Palette size={16} />
          <span>{activeThemeTitle}</span>
          <span className="settings-active-theme-pill" data-testid="settings-active-theme-badge">
            <Check size={11} style={{ display: 'inline', marginRight: 4 }} />
            {t('settings_active_badge')}
          </span>
        </div>
        <p className="settings-section-desc" data-testid="settings-theme-description">
          {activeThemeDescription}
        </p>

        <div
          className="theme-selector-grid"
          role="radiogroup"
          aria-label={t('settings_appearance_section')}
        >
          {THEME_OPTIONS.map((opt) => {
            const isActive = currentTheme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`theme-card ${opt.id} ${isActive ? 'active' : ''}`}
                onClick={() => setTheme(opt.id as ThemeId)}
                data-testid={`theme-card-${opt.id}`}
                aria-label={`${opt.name} (${opt.subtitle})`}
              >
                {/* Visual Theme Preview Box */}
                <div className={`theme-preview-box preview-${opt.id}`}>
                  <div className="preview-decor-window">
                    <div className="preview-decor-bar">
                      <span className="preview-decor-dot close" />
                      <span className="preview-decor-dot min" />
                      <span className="preview-decor-dot max" />
                      <span className="preview-decor-accent" style={{ background: opt.accentColor }} />
                    </div>
                    <div className="preview-decor-body">
                      <span className="preview-decor-line long" />
                      <span className="preview-decor-line short" />
                    </div>
                  </div>
                </div>

                {/* Theme Metadata */}
                <div className="theme-card-body">
                  <div className="theme-card-header">
                    <div className="theme-title-group">
                      <h4 className="theme-name">{opt.name}</h4>
                      <span className="theme-subtitle">{opt.subtitle}</span>
                    </div>

                    {isActive && (
                      <span className="theme-active-badge">
                        <Check size={12} style={{ display: 'inline', marginRight: 2 }} />
                        {t('settings_active_badge')}
                      </span>
                    )}
                  </div>

                  <p className="theme-description">{getThemeDescription(opt.id as ThemeId)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Factory Reset Section (sudo rm -rf in GUI) */}
      <section className="settings-section settings-danger-zone" aria-label={t('settings_reset_section')}>
        <div className="settings-section-title settings-danger-title">
          <RotateCcw size={16} />
          <span>{t('settings_reset_section')}</span>
        </div>
        <p className="settings-section-desc">{t('settings_reset_desc')}</p>

        {resetSuccessMessage && (
          <div className="settings-reset-success-alert" role="status" data-testid="settings-reset-success-alert">
            <Check size={14} />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {!showResetConfirm ? (
          <div className="settings-reset-action">
            <button
              type="button"
              className="settings-reset-trigger-btn"
              onClick={() => setShowResetConfirm(true)}
              data-testid="settings-reset-button"
            >
              <RotateCcw size={14} />
              <span>{t('settings_reset_button')}</span>
            </button>
          </div>
        ) : (
          <div className="settings-reset-confirm-box" role="alert" data-testid="settings-reset-confirm-box">
            <div className="settings-reset-confirm-header">
              <AlertTriangle size={18} className="danger-icon" />
              <h4>{t('settings_reset_confirm_title')}</h4>
            </div>
            <p className="settings-reset-confirm-text">{t('settings_reset_confirm_desc')}</p>
            <div className="settings-reset-confirm-actions">
              <button
                type="button"
                className="settings-reset-cancel-btn"
                onClick={() => setShowResetConfirm(false)}
                data-testid="settings-reset-cancel-button"
              >
                {t('settings_reset_cancel_btn')}
              </button>
              <button
                type="button"
                className="settings-reset-execute-btn"
                onClick={handleConfirmReset}
                data-testid="settings-reset-execute-button"
              >
                <RotateCcw size={13} />
                <span>{t('settings_reset_confirm_btn')}</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SettingsApp;
