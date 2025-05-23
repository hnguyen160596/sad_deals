import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import SavingsHacksSection from '../components/SavingsHacksSection';
import EventsCarousel from '../components/EventsCarousel';
import AppPromoSection from '../components/AppPromoSection';
import EmailSignupSection from '../components/EmailSignupSection';
import TodaysTopDeals from '../components/TodaysTopDeals';
import LiveChatBox from '../components/LiveChatBox';
import InlineTelegramFeed from '../components/InlineTelegramFeed';
import AdPlacement from '../components/AdPlacement';
import SEO from '../components/SEO';
import PopularStores from '../components/PopularStores';
import FeaturedStores from '../components/FeaturedStores';
import { trackClick } from '../components/Analytics';

// Create a simple error boundary component for each section
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; sectionName: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; sectionName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.sectionName} section:`, error, errorInfo);
    try {
      trackClick('ErrorBoundary', `Error_${this.props.sectionName}`);
    } catch (e) {
      console.error('Error tracking error event:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 px-4 text-center bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-4">
            We encountered an error loading this section. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#982a4a] text-white rounded-md hover:bg-[#982a4a]/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Popular Categories Sidebar component
const PopularCategories: React.FC = () => {
  const categories = [
    { id: 'grocery', name: 'Grocery', count: 57, icon: '🛒' },
    { id: 'home', name: 'Home & Kitchen', count: 43, icon: '🏠' },
    { id: 'electronics', name: 'Electronics', count: 38, icon: '📱' },
    { id: 'clothing', name: 'Clothing', count: 34, icon: '👕' },
    { id: 'beauty', name: 'Beauty & Personal Care', count: 29, icon: '💄' },
    { id: 'toys', name: 'Toys & Games', count: 25, icon: '🧸' },
    { id: 'pets', name: 'Pet Supplies', count: 21, icon: '🐶' },
    { id: 'office', name: 'Office Products', count: 18, icon: '🖨️' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    try {
      trackClick('PopularCategories', `Category_${categoryId}`);
    } catch (error) {
      console.error('Error tracking category click:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Popular Categories
      </h3>
      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/deals/${category.id}`}
              className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-md transition-colors"
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="flex items-center">
                <span className="mr-2 text-lg">{category.icon}</span>
                <span className="text-gray-700 group-hover:text-[#982a4a]">
                  {category.name}
                </span>
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {category.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/categories"
        className="mt-4 text-sm text-[#982a4a] hover:underline flex items-center justify-center pt-3 border-t border-gray-100"
        onClick={() => trackClick('PopularCategories', 'ViewAllCategories')}
      >
        View All Categories
        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

// Loading fallback component
const SectionLoading: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`w-full ${height} flex items-center justify-center bg-gray-50 rounded-md animate-pulse`}>
    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  </div>
);

const HomePage: React.FC = () => {
  // Create Organization structured data for home page
  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Site Name',
    url: 'https://example.com',
    logo: 'https://example.com/images/logo.png',
    sameAs: [
      'https://www.facebook.com/yoursitename',
      'https://twitter.com/yoursitename',
      'https://www.instagram.com/yoursitename'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-800-555-5555',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: ['English']
    }
  };

  return (
    <>
      <SEO
        title="Find the Best Deals & Coupons | Your Site Name"
        description="Discover the best deals, discounts, and coupons from top retailers. Save money on electronics, home goods, kitchen appliances, and more."
        canonicalUrl="https://example.com"
        ogType="website"
        ogImage="https://example.com/images/og-home.jpg"
        structuredData={organizationStructuredData}
        additionalMetaTags={[
          { name: 'keywords', content: 'deals, coupons, discounts, sale, savings, promo codes' },
          { name: 'author', content: 'Your Site Name' }
        ]}
      />

      {/* Hero Banner Section */}
      <SectionErrorBoundary sectionName="HeroBanner">
        <Suspense fallback={<SectionLoading height="h-96" />}>
          <HeroBanner />
        </Suspense>
      </SectionErrorBoundary>

      {/* Popular Stores Section */}
      <SectionErrorBoundary sectionName="PopularStores">
        <Suspense fallback={<SectionLoading />}>
          <PopularStores />
        </Suspense>
      </SectionErrorBoundary>

      {/* Ad placement after the hero banner */}
      <div className="max-w-7xl mx-auto my-6 flex justify-center">
        <AdPlacement adSlot="1234567890" adFormat="horizontal" className="hidden md:block" />
        <AdPlacement adSlot="0987654321" adFormat="rectangle" className="md:hidden" />
      </div>

      {/* Telegram Feed - Live deals from our Telegram channel */}
      <SectionErrorBoundary sectionName="InlineTelegramFeed">
        <Suspense fallback={<SectionLoading height="h-48" />}>
          <InlineTelegramFeed />
        </Suspense>
      </SectionErrorBoundary>

      {/* Featured Stores with Special Deals */}
      <SectionErrorBoundary sectionName="FeaturedStores">
        <Suspense fallback={<SectionLoading height="h-64" />}>
          <FeaturedStores />
        </Suspense>
      </SectionErrorBoundary>

      {/* Events Carousel Section - Upcoming sales events */}
      <SectionErrorBoundary sectionName="EventsCarousel">
        <Suspense fallback={<SectionLoading />}>
          <EventsCarousel />
        </Suspense>
      </SectionErrorBoundary>

      {/* App Promotion Section */}
      <SectionErrorBoundary sectionName="AppPromoSection">
        <Suspense fallback={<SectionLoading />}>
          <AppPromoSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Today's Top Deals Section with Sidebar */}
      <SectionErrorBoundary sectionName="TodaysTopDeals">
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Main Content - Today's Top Deals */}
              <div className="md:w-3/4">
                <Suspense fallback={<SectionLoading />}>
                  <TodaysTopDeals />
                </Suspense>
              </div>

              {/* Sidebar - Popular Categories */}
              <div className="md:w-1/4 mt-6 md:mt-0">
                <div className="sticky top-24">
                  <PopularCategories />

                  {/* Sidebar Ad Placement */}
                  <div className="mt-6">
                    <AdPlacement adSlot="3692581470" adFormat="rectangle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionErrorBoundary>

      {/* Ad placement before savings hacks */}
      <div className="max-w-7xl mx-auto my-6 flex justify-center">
        <AdPlacement adSlot="2468013579" adFormat="rectangle" />
      </div>

      {/* Savings Hacks Section */}
      <SectionErrorBoundary sectionName="SavingsHacks">
        <Suspense fallback={<SectionLoading />}>
          <SavingsHacksSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Email Signup Section */}
      <SectionErrorBoundary sectionName="EmailSignup">
        <Suspense fallback={<SectionLoading height="h-48" />}>
          <EmailSignupSection />
        </Suspense>
      </SectionErrorBoundary>

      {/* Live Chat Box - appears in the bottom right corner */}
      <SectionErrorBoundary sectionName="LiveChatBox">
        <LiveChatBox />
      </SectionErrorBoundary>
    </>
  );
};

export default HomePage;
