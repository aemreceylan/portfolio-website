import React, { useEffect } from 'react';
import { Desktop } from '#components/desktop/Desktop';
import { useWindowManager } from '#stores/window-manager.store';
import { useViewportStore } from '#stores/viewport.store';
import { terminalManifest } from '#apps/app-registry';
import { useTranslation } from '#i18n/i18n.store';
import { SupportedLanguage } from '#i18n/translations';

/**
 * Standard Open Graph locale identifiers for supported language codes
 */
const OG_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en_US',
  tr: 'tr_TR',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  ru: 'ru_RU',
  ja: 'ja_JP',
};

/**
 * Updates DOM head metadata (title, lang, meta description, Open Graph, Twitter) according to active language
 */
const updateDocumentMetadata = (language: SupportedLanguage, title: string, description: string): void => {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = language;
  document.title = title;

  const setMetaContent = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute('content', content);
    }
  };

  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:locale"]', OG_LOCALE_MAP[language] || 'en_US');
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
};

/**
 * Root Application entry shell mounting the AEC Desktop Workspace.
 * Automatically spawns the Terminal window on initial desktop boot for an interactive welcoming feel.
 * Synchronizes the browser document.title, document.documentElement.lang, and meta tags with active language.
 */
export const App: React.FC = () => {
  const { openWindow } = useWindowManager();
  const { t, currentLanguage } = useTranslation();
  const { isMobile, initialize } = useViewportStore();

  useEffect(() => {
    const unbind = initialize();
    return () => unbind();
  }, [initialize]);

  useEffect(() => {
    // Only auto-open terminal on desktop viewports to preserve clean mobile home screen launcher
    if (!isMobile) {
      openWindow(terminalManifest);
    }
  }, [openWindow, isMobile]);

  useEffect(() => {
    const title = t('browser_tab_title');
    const description = t('browser_meta_description');
    updateDocumentMetadata(currentLanguage, title, description);
  }, [t, currentLanguage]);

  return <Desktop />;
};

export default App;

