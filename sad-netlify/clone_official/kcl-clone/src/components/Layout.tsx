import type React from 'react';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PWAInstallPrompt from './PWAInstallPrompt';
import WebsiteSchema from './WebsiteSchema';
import CoreWebVitalsOptimizer from './CoreWebVitalsOptimizer';

const Layout: React.FC = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen flex flex-col theme-transition">
      {/* Performance optimization for Core Web Vitals */}
      <CoreWebVitalsOptimizer
        preconnectUrls={[
          'https://api.telegram.org',
          'https://res.cloudinary.com'
        ]}
        preloadImages={[
          '/logo.svg',
          '/images/sad-text-logo.png'
        ]}
      />

      {/* Add WebsiteSchema for better search engine understanding */}
      <WebsiteSchema
        name="Sales Aholics Deals"
        url="https://salesaholicsdeals.com"
        description="Discover the best coupons, promo codes, and deals on your favorite products. Save money and shop smarter with Sales Aholics Deals."
        searchUrl="https://salesaholicsdeals.com/search?q="
        sameAs={[
          "https://facebook.com/salesaholicsdeals",
          "https://twitter.com/salesaholics",
          "https://instagram.com/salesaholicsdeals",
          "https://pinterest.com/salesaholicsdeals"
        ]}
        alternateName={["Sales Aholics", "SalesAholics"]}
        publisher={{
          name: "Sales Aholics Media",
          logo: "https://salesaholicsdeals.com/logo.png"
        }}
        potentialActions={[
          {
            type: "SearchAction",
            target: "https://salesaholicsdeals.com/coupons-for/{search_term_string}",
            queryInput: "required name=search_term_string"
          }
        ]}
      />
      <Header />
      <main className="flex-grow theme-transition">
        <Outlet />
      </main>
      <Footer />
      {showScrollToTop && (
        <button
          className="fixed bottom-20 right-5 bg-primary dark:bg-primary-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-20 hover:bg-primary/90 dark:hover:bg-primary-dark/90 transition-all"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
      <PWAInstallPrompt />
    </div>
  );
};

export default Layout;
