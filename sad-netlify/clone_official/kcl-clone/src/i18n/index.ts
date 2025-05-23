import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Resources with translations
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
    },

    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
