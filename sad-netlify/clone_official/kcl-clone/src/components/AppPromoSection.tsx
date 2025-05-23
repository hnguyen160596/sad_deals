import type React from 'react';
import { trackClick } from './Analytics';
import { useTranslation } from './i18nWrapper';

const AppPromoSection: React.FC = () => {
  const { t } = useTranslation();

  const handleStoreClick = (store: 'appstore' | 'googleplay') => {
    try {
      trackClick('AppPromo', `${store}_click`);
    } catch (error) {
      console.error('Error tracking app store click:', error);
    }
  };

  // Image error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    const isStoreIcon = target.alt.includes('App Store') || target.alt.includes('Google Play');

    if (isStoreIcon) {
      target.src = '/images/icons/icon-placeholder.png';
    } else {
      target.src = '/images/app-promo-placeholder.png';
    }

    target.onerror = null; // Prevents infinite loop if the placeholder also fails
  };

  return (
    <section className="bg-gradient-to-r from-[#982a4a]/10 to-[#982a4a]/5 py-12">
      <div className="max-w-7xl mx-auto px-6 md:flex items-center justify-between">
        <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
          <h2 className="text-3xl font-bold text-[#982a4a] mb-4">
            Plan Your Deals with Our App
          </h2>
          <p className="text-gray-700 mb-6 text-lg">
            Never miss a sale! The Sales Aholics Deals app helps you:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-[#982a4a] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Track upcoming sales events with calendar reminders</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-[#982a4a] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Get notifications for flash deals and limited-time offers</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-[#982a4a] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Create shopping lists and save favorite deals</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-[#982a4a] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Compare prices across multiple stores</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleStoreClick('appstore')}
              className="transform hover:scale-105 transition-transform"
            >
              <img
                src="/images/app-store.png"
                alt="Download on the App Store"
                className="h-10"
                onError={handleImageError}
              />
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleStoreClick('googleplay')}
              className="transform hover:scale-105 transition-transform"
            >
              <img
                src="/images/google-play.png"
                alt="Get it on Google Play"
                className="h-10"
                onError={handleImageError}
              />
            </a>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#982a4a]/20 to-[#982a4a]/10 rounded-3xl transform rotate-3 scale-105"></div>
            <img
              src="/images/app-promo.png"
              alt="Sales Aholics Deals app calendar feature"
              className="relative z-10 rounded-2xl shadow-xl max-w-full md:max-w-md mx-auto"
              onError={handleImageError}
            />
            <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-full shadow-lg z-20">
              <svg className="w-8 h-8 text-[#982a4a]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 15a7 7 0 110-14 7 7 0 010 14z" />
                <path d="M10 5a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V6a1 1 0 011-1z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8 text-center">
        <p className="text-gray-500">Available for iOS and Android devices. Free download.</p>
      </div>
    </section>
  );
};

export default AppPromoSection;
