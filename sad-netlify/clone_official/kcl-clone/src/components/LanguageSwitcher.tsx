import type React from 'react';
import { useState } from 'react';
import { useTranslation, type Language } from './i18nWrapper';
import { trackClick } from './Analytics';

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useTranslation();

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === language) || languages[0];

  const changeLanguage = (langCode: Language) => {
    try {
      setLanguage(langCode);
      setIsOpen(false);
      trackClick('Language', `Changed to ${langCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-1">{selectedLanguage.flag}</span>
        <span className="hidden md:inline">{selectedLanguage.name}</span>
        <svg
          className={`h-5 w-5 text-gray-400 ${isOpen ? 'rotate-180' : ''} transition-transform`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  lang.code === language
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
