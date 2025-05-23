import React from 'react';
import { Link } from 'react-router-dom';
import { stores } from '../data/stores';
import { trackClick } from './Analytics';

// Sample featured deals data
const featuredDeals = [
  {
    storeName: "Amazon",
    discount: "Up to 70% off",
    expiryDate: "Limited time",
    featured: true
  },
  {
    storeName: "Target",
    discount: "25% off home goods",
    expiryDate: "3 days left",
    featured: true
  },
  {
    storeName: "Walmart",
    discount: "BOGO 50% off",
    expiryDate: "Today only",
    featured: true
  },
  {
    storeName: "Best Buy",
    discount: "$50 off $200+",
    expiryDate: "Weekend special",
    featured: false
  }
];

const FeaturedStores: React.FC = () => {
  // Get stores with featured deals
  const storesWithDeals = featuredDeals.map(deal => {
    const storeInfo = stores.find(store => store.name === deal.storeName);
    if (!storeInfo) return null;
    return {
      ...storeInfo,
      discount: deal.discount,
      expiryDate: deal.expiryDate,
      featured: deal.featured
    };
  }).filter(Boolean); // Remove nulls

  const handleStoreClick = (storeName: string) => {
    try {
      trackClick('FeaturedStores', `FeaturedStore_${storeName}`);
    } catch (error) {
      console.error('Error tracking featured store click:', error);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Featured Deals</h2>
          <Link
            to="/deals"
            className="text-[#982a4a] hover:text-[#982a4a]/80 flex items-center text-sm font-medium self-start sm:self-center"
            onClick={() => trackClick('FeaturedStores', 'ViewAllDeals')}
          >
            View All Deals
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {storesWithDeals.map((store) => (
            <Link
              key={store.href}
              to={store.href}
              className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              onClick={() => handleStoreClick(store.name)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden p-2 mr-4">
                    <img
                      src={store.icon}
                      alt={store.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/stores/placeholder/store-placeholder.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.expiryDate}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-md p-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-[#982a4a]">{store.discount}</span>
                  <span className="text-sm text-gray-500 font-medium">Get Deal</span>
                </div>
                {store.featured && (
                  <div className="absolute top-0 right-0 bg-[#982a4a] text-white text-xs px-2 py-1 rounded-bl-md">
                    Featured
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStores;
