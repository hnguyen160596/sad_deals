import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from './i18nWrapper';
import { trackClick } from './Analytics';
import ImageWithFallback from './ImageWithFallback';
import ProductSchema from './ProductSchema';

// Define the interface for deal items
interface Deal {
  id: string;
  title: string;
  image: string;
  store: string;
  originalPrice: string;
  currentPrice: string;
  savingsPercent: number;
  url: string;
  isExpiring: boolean;
  isBestSeller?: boolean;
}

// Sample deals data
const dealsList: Deal[] = [
  {
    id: 'deal-1',
    title: 'Apple AirPods Pro (2nd Generation)',
    image: '/images/deals/airpods.jpg',
    store: 'Amazon',
    originalPrice: '$249.00',
    currentPrice: '$189.99',
    savingsPercent: 24,
    url: '/deals/amazon-airpods-pro-deal',
    isExpiring: true,
    isBestSeller: true
  },
  {
    id: 'deal-2',
    title: 'KitchenAid 5.5 Quart Bowl-Lift Stand Mixer',
    image: '/images/deals/kitchenaid.jpg',
    store: 'Best Buy',
    originalPrice: '$449.99',
    currentPrice: '$329.99',
    savingsPercent: 27,
    url: '/deals/bestbuy-kitchenaid-mixer',
    isExpiring: false
  },
  {
    id: 'deal-3',
    title: 'Ninja Foodi 10-in-1 Pressure Cooker and Air Fryer',
    image: '/images/deals/ninja.jpg',
    store: 'Target',
    originalPrice: '$199.99',
    currentPrice: '$149.99',
    savingsPercent: 25,
    url: '/deals/target-ninja-foodi',
    isExpiring: true
  },
  {
    id: 'deal-4',
    title: 'Dyson V11 Cordless Vacuum Cleaner',
    image: '/images/deals/dyson.jpg',
    store: 'Walmart',
    originalPrice: '$599.99',
    currentPrice: '$469.99',
    savingsPercent: 22,
    url: '/deals/walmart-dyson-v11',
    isExpiring: false,
    isBestSeller: true
  },
  {
    id: 'deal-5',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    image: '/images/deals/sony.jpg',
    store: 'Amazon',
    originalPrice: '$399.99',
    currentPrice: '$328.00',
    savingsPercent: 18,
    url: '/deals/amazon-sony-headphones',
    isExpiring: false
  },
  {
    id: 'deal-6',
    title: 'Samsung 65" Class QLED 4K Smart TV',
    image: '/images/deals/samsung.jpg',
    store: 'Best Buy',
    originalPrice: '$1,299.99',
    currentPrice: '$899.99',
    savingsPercent: 31,
    url: '/deals/bestbuy-samsung-tv',
    isExpiring: true
  }
];

const TodaysTopDeals: React.FC = () => {
  const { t } = useTranslation();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring' | 'bestsellers'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading deals
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeals(dealsList);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleDealClick = (dealId: string) => {
    try {
      trackClick('TodaysTopDeals', `Deal_${dealId}`);
    } catch (error) {
      console.error('Error tracking deal click:', error);
    }
  };

  const handleFilterChange = (filter: 'all' | 'expiring' | 'bestsellers') => {
    setActiveFilter(filter);
    try {
      trackClick('TodaysTopDeals', `Filter_${filter}`);
    } catch (error) {
      console.error('Error tracking filter click:', error);
    }
  };

  // Filter deals based on active filter
  const filteredDeals = deals.filter((deal) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'expiring') return deal.isExpiring;
    if (activeFilter === 'bestsellers') return deal.isBestSeller;
    return true;
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            {t('deals.todaysTopDeals', "Today's Top Deals")}
          </h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === 'all'
                  ? 'bg-[#982a4a] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All Deals
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === 'expiring'
                  ? 'bg-[#982a4a] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('expiring')}
            >
              Ending Soon
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === 'bestsellers'
                  ? 'bg-[#982a4a] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('bestsellers')}
            >
              Best Sellers
            </button>
          </div>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDeals.length > 0 ? (
          // Deals grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl">
                {/* Add ProductSchema for SEO */}
                <ProductSchema
                  name={deal.title}
                  description={`${deal.title} on sale at ${deal.store}. Save ${deal.savingsPercent}% off the original price.`}
                  imageUrl={deal.image.startsWith('http') ? deal.image : `${window.location.origin}${deal.image}`}
                  url={`${window.location.origin}${deal.url}`}
                  brand={deal.store}
                  price={parseFloat(deal.currentPrice.replace(/[^0-9.]/g, ''))}
                  priceCurrency="USD"
                  availability="InStock"
                  offers={[
                    {
                      price: parseFloat(deal.currentPrice.replace(/[^0-9.]/g, '')),
                      priceCurrency: "USD",
                      seller: { name: deal.store }
                    }
                  ]}
                />

                {/* Deal badges */}
                <div className="relative">
                  {deal.isExpiring && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      Ending Soon
                    </span>
                  )}
                  {deal.isBestSeller && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      Best Seller
                    </span>
                  )}
                  {/* Deal image */}
                  <div className="h-64 overflow-hidden">
                    <ImageWithFallback
                      src={deal.image}
                      alt={deal.title}
                      fallbackText="Product Image"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Deal content */}
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-500">{deal.store}</span>
                    <span className="ml-2 text-xs bg-[#982a4a]/10 text-[#982a4a] px-2 py-0.5 rounded-full">
                      {deal.savingsPercent}% OFF
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{deal.title}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-[#982a4a]">{deal.currentPrice}</span>
                    <span className="ml-2 text-sm line-through text-gray-500">{deal.originalPrice}</span>
                  </div>
                  <Link
                    to={deal.url}
                    className="block w-full text-center bg-[#982a4a] hover:bg-[#982a4a]/90 text-white font-medium py-2 px-4 rounded transition-colors"
                    onClick={() => handleDealClick(deal.id)}
                  >
                    Here's the Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No deals found
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No deals found</h3>
            <p className="text-gray-500">Try changing your filter selection or check back later.</p>
          </div>
        )}

        {/* View all deals button */}
        <div className="mt-10 text-center">
          <Link
            to="/deals"
            className="inline-flex items-center px-6 py-3 border border-[#982a4a] text-[#982a4a] bg-white hover:bg-[#982a4a] hover:text-white font-medium rounded-md transition-colors"
            onClick={() => trackClick('TodaysTopDeals', 'ViewAllDeals')}
          >
            View All Deals
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TodaysTopDeals;
