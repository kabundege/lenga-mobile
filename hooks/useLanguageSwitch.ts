import { useAppDispatch } from '@/hooks/useRedux';
import { setLocale, type Locale } from '@/store/slices/preferencesSlice';
import { useTranslation } from 'react-i18next';

export function useLanguageSwitch() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const currentLanguage = (i18n.language === 'en' || i18n.language === 'rw' ? i18n.language : 'en') as Locale;

  const setLanguage = (locale: Locale) => {
    if (locale === currentLanguage) return;
    dispatch(setLocale(locale));
    i18n.changeLanguage(locale);
  };

  return {
    t,
    currentLanguage,
    setLanguage,
    isEnglish: currentLanguage === 'en',
    isKinyarwanda: currentLanguage === 'rw',
  };
}
