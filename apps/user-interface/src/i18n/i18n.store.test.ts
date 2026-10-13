import { describe, it, expect, beforeEach } from 'vitest';
import { useI18nStore, detectBrowserLanguage } from './i18n.store';

describe('i18n Localization Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useI18nStore.getState().setLanguage('en');
  });

  it('should detect language or fallback to English', () => {
    expect(detectBrowserLanguage('tr-TR')).toBe('tr');
    expect(detectBrowserLanguage('de-DE')).toBe('de');
    expect(detectBrowserLanguage('ja')).toBe('ja');
    expect(detectBrowserLanguage('zh-CN')).toBe('en'); // unsupported fallback to en
  });

  it('should translate keys correctly in English and Turkish', () => {
    const store = useI18nStore.getState();
    expect(store.t('appName_terminal')).toBe('Terminal CLI');

    store.setLanguage('tr');
    expect(useI18nStore.getState().t('appName_settings')).toBe('Ayarlar');
    expect(useI18nStore.getState().t('window_close')).toBe('Pencereyi Kapat');
  });

  it('should replace dynamic interpolation parameters', () => {
    const store = useI18nStore.getState();
    const result = store.t('terminal_user_switched', { user: 'ahmet' });
    expect(result).toBe('User switched to: ahmet');
  });

  it('should persist selected language to localStorage', () => {
    const store = useI18nStore.getState();
    store.setLanguage('de');
    expect(localStorage.getItem('aec_portfolio_lang')).toBe('de');
  });
});
