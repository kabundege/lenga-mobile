import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import rw from './languages/rw';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    callback('rw');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

export const resources = {
  rw: { translation: rw },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'rw',
    fallbackLng: 'rw',
    supportedLngs: ['rw'],
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
