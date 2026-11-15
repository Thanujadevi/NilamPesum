import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import taTranslation from './locales/ta/translation.json';

const resources = {
  en: { translation: enTranslation },
  ta: { translation: taTranslation }
};

// Farmer-facing default is Tamil ('ta') as required by specifications
const savedLang = localStorage.getItem('nilam_pesum_lang') || 'ta';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Automatically persist and propagate language change globally
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('nilam_pesum_lang', lng);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nilam_pesum_lang_change', { detail: lng }));
  }
});

export default i18n;
