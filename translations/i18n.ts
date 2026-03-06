import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './languages/en';
import rw from './languages/rw';

const STORAGE_KEY = 'lenga:preferences';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { locale?: string };
        const locale = data?.locale === 'en' || data?.locale === 'rw' ? data.locale : 'en';
        callback(locale);
        return;
      }
    } catch {
      // ignore
    }
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      data.locale = language;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  },
};

export const resources = {
  en: { translation: en },
  rw: { translation: rw },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
