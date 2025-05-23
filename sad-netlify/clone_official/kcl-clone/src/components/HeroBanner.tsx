import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackClick } from './Analytics';

const HeroBanner: React.FC = () => {
  const { t } = useTranslation();

  const handleSearchClick = () => {
    try {
      trackClick('HeroBanner', 'SearchClick');
    } catch (error) {
      // Silently fail
    }
  };

  const handleExploreClick = () => {
    try {
      trackClick('HeroBanner', 'ExploreClick');
    } catch (error) {
      // Silently fail
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-[#f6cf13] to-[#ffb700] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1f1a1e] mb-6 leading-tight">
              Find the Best Deals & Save Big Today
            </h1>
            <p className="text-lg md:text-xl text-[#1f1a1e] mb-8 max-w-2xl">
              Discover thousands of deals, coupons and money-saving tips from your favorite stores.
              Never pay full price again!
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link
                to="/search"
                className="px-6 py-3 bg-[#982a4a] text-white font-medium rounded-md hover:bg-[#982a4a]/90 transition-colors shadow-md flex items-center justify-center"
                onClick={handleSearchClick}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Deals
              </Link>
              <Link
                to="/deals/todays-deals"
                className="px-6 py-3 bg-[#1f1a1e] text-white font-medium rounded-md hover:bg-[#1f1a1e]/90 transition-colors shadow-md flex items-center justify-center"
                onClick={handleExploreClick}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Explore Today's Deals
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="relative rounded-lg overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
              <img
                src="/images/deal1.jpg"
                alt="Featured deal"
                className="w-full h-auto rounded-lg"
                loading="eager"
                width="600"
                height="400"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 p-4 rounded-lg max-w-xs text-center transform -rotate-3">
                  <p className="text-sm font-semibold text-[#982a4a]">FEATURED DEAL</p>
                  <p className="text-lg font-bold text-[#1f1a1e] my-1">Up to 70% OFF</p>
                  <p className="text-sm text-gray-600">Limited time offer!</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-lg overflow-hidden shadow-xl transform -rotate-6 hover:rotate-0 transition-all duration-300 z-10 w-36 h-36">
              <img
                src="/images/deal2.jpg"
                alt="Secondary deal"
                className="w-full h-full object-cover"
                loading="eager"
                width="144"
                height="144"
              />
            </div>
            <div className="absolute -top-4 -right-4 rounded-lg overflow-hidden shadow-xl transform rotate-12 hover:rotate-0 transition-all duration-300 z-10 w-28 h-28">
              <img
                src="/images/deal3.jpg"
                alt="Third deal"
                className="w-full h-full object-cover"
                loading="eager"
                width="112"
                height="112"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ transform: 'translateY(1px)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroBanner;
