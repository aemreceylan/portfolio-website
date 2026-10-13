import React from 'react';
import { Globe, Palette, Check, Sparkles, Image } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '#i18n/translations';
import { useTranslation } from '#i18n/i18n.store';
import { LanguageFlag } from '#components/LanguageFlag';
import {
  useThemeStore,
  WALLPAPER_OPTIONS,
  ACCENT_COLOR_OPTIONS,
} from '#stores/theme.store';
import '#styles/settings.css';

/**
 * SettingsApp component allowing the user to configure:
 * - Multilingual preferences across 7 locales
 * - Desktop wallpaper themes with Spatial dark gradients
 * - Dynamic accent palette with automatic wallpaper synchronization
 */
export const SettingsApp: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useTranslation();
  const { wallpaper, accent, isAutoAccent, setWallpaper, setAccent, setAutoAccent } = useThemeStore();

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

      {/* Wallpaper Themes Section */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Image size={16} />
          <span>Masaüstü Duvar Kağıdı</span>
        </div>
        <p className="settings-section-desc">
          Spatial Dark Glass masaüstünüz için yüksek kaliteli karanlık tema arka planları.
        </p>

        <div className="wallpaper-grid" role="group" aria-label="Wallpaper Options">
          {WALLPAPER_OPTIONS.map((wp) => {
            const isActive = wallpaper === wp.id;
            return (
              <button
                key={wp.id}
                type="button"
                className={`wallpaper-card ${isActive ? 'active' : ''}`}
                onClick={() => setWallpaper(wp.id)}
                aria-pressed={isActive}
                aria-label={`Wallpaper ${wp.name}`}
              >
                <div
                  className="wallpaper-thumb"
                  style={{ background: wp.previewGradient }}
                >
                  {isActive && (
                    <span className="language-badge">
                      <Check size={12} style={{ display: 'inline', marginRight: 2 }} />
                      Aktif
                    </span>
                  )}
                </div>
                <span className="wallpaper-name">{wp.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accent Palette Section */}
      <section className="settings-section">
        <div className="settings-section-title">
          <Palette size={16} />
          <span>Vurgu Rengi & Tema</span>
        </div>
        <p className="settings-section-desc">
          Sistem parıltısı ve butonlar için renk paleti. Otomatik modda seçilen duvar kağıdının atmosferine göre uyarlanır.
        </p>

        <div className="accent-row">
          <button
            type="button"
            className={`accent-auto-btn ${isAutoAccent ? 'active' : ''}`}
            onClick={() => setAutoAccent(!isAutoAccent)}
            aria-pressed={isAutoAccent}
          >
            <Sparkles size={14} />
            <span>Otomatik Senkronizasyon {isAutoAccent ? '(Açık)' : '(Kapalı)'}</span>
          </button>

          {ACCENT_COLOR_OPTIONS.map((ac) => {
            const isActive = accent === ac.id;
            return (
              <button
                key={ac.id}
                type="button"
                className={`accent-circle-btn ${isActive ? 'active' : ''}`}
                style={{ background: ac.hex }}
                onClick={() => setAccent(ac.id)}
                aria-label={`Accent color ${ac.name}`}
                title={`${ac.name} ${isActive ? '(Active)' : ''}`}
              >
                {isActive && <Check size={14} color="#000" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SettingsApp;
