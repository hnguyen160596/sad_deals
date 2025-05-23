import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from './i18nWrapper';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'font-bold' : '';
  };

  return (
    <header className="bg-yellow-400 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-black">
                SAD DEALS
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-900 hover:border-gray-300 ${isActive('/')}`}
              >
                {t('nav.discoverDeals', 'Discover Deals')}
              </Link>
              <Link
                to="/deals/todays-deals"
                className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-900 hover:border-gray-300 ${isActive('/deals/todays-deals')}`}
              >
                {t('nav.todaysDeals', "Today's Deals")}
              </Link>
              <Link
                to="/tips"
                className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-900 hover:border-gray-300 ${isActive('/tips')}`}
              >
                {t('nav.savingsHacks', 'Savings Hacks')}
              </Link>
              <Link
                to="/telegram-feed"
                className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-900 hover:border-gray-300 ${isActive('/telegram-feed')}`}
              >
                Live Deals
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center">
              <LanguageSwitcher />
              <Link
                to="/login"
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
              >
                {t('nav.signup', 'Sign up')}
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">{t('nav.openMenu', 'Open menu')}</span>
              {menuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${menuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 ${
              isActive('/') ? 'bg-gray-50 border-gray-500' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.discoverDeals', 'Discover Deals')}
          </Link>
          <Link
            to="/deals/todays-deals"
            className={`block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 ${
              isActive('/deals/todays-deals') ? 'bg-gray-50 border-gray-500' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.todaysDeals', "Today's Deals")}
          </Link>
          <Link
            to="/tips"
            className={`block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 ${
              isActive('/tips') ? 'bg-gray-50 border-gray-500' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.savingsHacks', 'Savings Hacks')}
          </Link>
          <Link
            to="/telegram-feed"
            className={`block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 ${
              isActive('/telegram-feed') ? 'bg-gray-50 border-gray-500' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Live Deals
          </Link>
          <Link
            to="/login"
            className={`block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-300 ${
              isActive('/login') ? 'bg-gray-50 border-gray-500' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.signup', 'Sign up')}
          </Link>
          <div className="pl-3 pr-4 py-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
