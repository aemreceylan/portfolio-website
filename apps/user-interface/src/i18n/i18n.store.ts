import { create } from 'zustand';
import { useCallback } from 'react';
import { SupportedLanguage, TRANSLATIONS, Translations } from './translations';

/**
 * Storage key used to persist language preference across user visits
 */
const STORAGE_KEY = 'aec_portfolio_lang';

/**
 * Supported language codes array for quick membership lookup
 */
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'tr', 'de', 'fr', 'es', 'ru', 'ja'];

/**
 * Detects the most appropriate language from browser settings or defaults to 'en'
 *
 * @param candidate - Optional language tag string (e.g. 'de-DE' or 'tr')
 * @returns SupportedLanguage code
 */
export function detectBrowserLanguage(candidate?: string): SupportedLanguage {
  const rawLang = candidate || (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const normalized = rawLang.toLowerCase().split('-')[0] as SupportedLanguage;

  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }
  return 'en';
}

/**
 * Raw Zustand store interface for managing persisted language state
 */
interface I18nStoreState {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
}

/**
 * Initializes the initial language from localStorage or browser language detection
 */
function getInitialLanguage(): SupportedLanguage {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  }
  return detectBrowserLanguage();
}

/**
 * Reactive Zustand store powering AEC Portfolio internationalization
 */
export const useI18nStore = create<I18nStoreState>((set, get) => ({
  currentLanguage: getInitialLanguage(),

  setLanguage: (lang) => {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Safe fallback if localStorage is blocked
      }
    }
    set({ currentLanguage: lang });
  },

  t: (key, params) => {
    const { currentLanguage } = get();
    const dictionary = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    let translation = dictionary[key] || TRANSLATIONS.en[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return translation;
  },
}));

/**
 * Hook providing reactive translation helper compatible with React Compiler automatic memoization.
 * Re-creates the `t` translator whenever `currentLanguage` changes so all JSX nodes update immediately.
 */
export function useTranslation() {
  const currentLanguage = useI18nStore((state) => state.currentLanguage);
  const setLanguage = useI18nStore((state) => state.setLanguage);

  const t = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>) => {
      const dictionary = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
      let translation = dictionary[key] || TRANSLATIONS.en[key] || String(key);

      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return translation;
    },
    [currentLanguage]
  );

  return { currentLanguage, setLanguage, t };
}
