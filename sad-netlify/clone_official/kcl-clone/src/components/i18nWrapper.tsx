import type React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { trackEvent } from './Analytics';

// Define the available languages
export type Language = 'en' | 'es';

// Define the i18n context props
interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue: string) => string;
}

// Create context with default values
const I18nContext = createContext<I18nContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key, defaultValue) => defaultValue,
});

// Create translations map
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'Sales Aholics Deals',
    'app.slogan': 'Find amazing deals every day!',

    // Navigation
    'nav.discoverDeals': 'Discover Deals',
    'nav.todaysDeals': "Today's Deals",
    'nav.savingsHacks': 'Savings Hacks',
    'nav.login': 'Log in',
    'nav.signup': 'Sign up',
    'nav.logout': 'Sign out',
    'nav.profile': 'Your Profile',
    'nav.search': 'Search',
    'nav.searchPlaceholder': 'Search deals, stores...',
    'nav.openMenu': 'Open menu',
    'nav.toggleSearch': 'Toggle search',
    'nav.viewAllStores': 'View all stores',
    'nav.seeAllDeals': 'See all deals',
    'nav.seeAllSavingsHacks': 'See all savings hacks',

    // Deals
    'deals.featured': 'Featured Deals',
    'deals.viewAll': 'View All',
    'deals.expiresIn': 'Expires in',
    'deals.expired': 'Expired',
    'deals.freeShipping': 'Free Shipping',
    'deals.fromPrice': 'From',
    'deals.showCode': 'Show Code',
    'deals.getOffer': 'Get Offer',

    // User
    'user.emailPreferences': 'Email Preferences',
    'user.editProfile': 'Edit Profile',
    'user.favorites': 'My Favorites',
    'user.notifications': 'Notifications',

    // Forms
    'form.email': 'Email Address',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.name': 'Full Name',
    'form.submit': 'Submit',
    'form.subscribe': 'Subscribe',
    'form.required': 'Required',

    // Notifications
    'notifications.success': 'Success!',
    'notifications.error': 'Error!',
    'notifications.emailPreferences': 'Email Preferences',
  },
  es: {
    // Common
    'app.name': 'Sales Aholics Deals',
    'app.slogan': '¡Encuentra ofertas increíbles todos los días!',

    // Navigation
    'nav.discoverDeals': 'Descubrir Ofertas',
    'nav.todaysDeals': 'Ofertas de Hoy',
    'nav.savingsHacks': 'Consejos de Ahorro',
    'nav.login': 'Iniciar sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar sesión',
    'nav.profile': 'Tu Perfil',
    'nav.search': 'Buscar',
    'nav.searchPlaceholder': 'Buscar ofertas, tiendas...',
    'nav.openMenu': 'Abrir menú',
    'nav.toggleSearch': 'Alternar búsqueda',
    'nav.viewAllStores': 'Ver todas las tiendas',
    'nav.seeAllDeals': 'Ver todas las ofertas',
    'nav.seeAllSavingsHacks': 'Ver todos los consejos de ahorro',

    // Deals
    'deals.featured': 'Ofertas Destacadas',
    'deals.viewAll': 'Ver Todo',
    'deals.expiresIn': 'Expira en',
    'deals.expired': 'Expirado',
    'deals.freeShipping': 'Envío Gratis',
    'deals.fromPrice': 'Desde',
    'deals.showCode': 'Mostrar Código',
    'deals.getOffer': 'Obtener Oferta',

    // User
    'user.emailPreferences': 'Preferencias de Email',
    'user.editProfile': 'Editar Perfil',
    'user.favorites': 'Mis Favoritos',
    'user.notifications': 'Notificaciones',

    // Forms
    'form.email': 'Correo Electrónico',
    'form.password': 'Contraseña',
    'form.confirmPassword': 'Confirmar Contraseña',
    'form.name': 'Nombre Completo',
    'form.submit': 'Enviar',
    'form.subscribe': 'Suscribirse',
    'form.required': 'Requerido',

    // Notifications
    'notifications.success': '¡Éxito!',
    'notifications.error': '¡Error!',
    'notifications.emailPreferences': 'Preferencias de Email',
  }
};

// Provider component
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Initialize language from localStorage on component mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('preferred_language') as Language;
      if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
        setLanguageState(savedLang);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
    }
  }, []);

  // Function to set language and save to localStorage
  const setLanguage = (lang: Language) => {
    try {
      setLanguageState(lang);
      localStorage.setItem('preferred_language', lang);
      trackEvent('Language', 'Change', lang);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  // Translation function
  const t = (key: string, defaultValue: string): string => {
    try {
      return translations[language][key] || defaultValue;
    } catch (error) {
      return defaultValue;
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook for using the i18n context
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;
