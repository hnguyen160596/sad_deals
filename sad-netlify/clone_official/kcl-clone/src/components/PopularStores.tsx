import React from 'react';
import { Link } from 'react-router-dom';
import { stores } from '../data/stores';
import { trackClick } from './Analytics';
import StoreSearch from './StoreSearch';

interface PopularStoresProps {
  limit?: number;
}

const PopularStores: React.FC<PopularStoresProps> = ({ limit = 12 }) => {
  // Remove duplicate stores by name
  const uniqueStores = stores.filter((store, index, self) =>
    index === self.findIndex((s) => s.name === store.name)
  );

  // On mobile, show 8; on md+ show up to the limit (default 12)
  const mobileLimit = 8;
  const desktopLimit = limit;

  // Always render up to desktopLimit, but hide extra ones on mobile
  const popularStores = uniqueStores.slice(0, desktopLimit);

  const handleStoreClick = (storeName: string) => {
    try {
      trackClick('PopularStores', `Store_${storeName}`);
    } catch (error) {
      console.error('Error tracking store click:', error);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Popular Stores</h2>
          <Link
            to="/stores"
            className="text-[#982a4a] hover:text-[#982a4a]/80 flex items-center text-sm font-medium self-start sm:self-center"
            onClick={() => trackClick('PopularStores', 'ViewAllStores')}
          >
            View All Stores
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Store Search */}
        <div className="mb-8">
          <StoreSearch />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {popularStores.map((store, idx) => (
            <Link
              key={store.href}
              to={store.href}
              className={`flex flex-col items-center group ${idx >= mobileLimit ? 'hidden md:flex' : ''}`}
              onClick={() => handleStoreClick(store.name)}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden p-2 mb-1 md:mb-2 transition-all duration-200 group-hover:shadow-md">
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
              <span className="text-xs md:text-sm text-center text-gray-700 group-hover:text-[#982a4a]">
                {store.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularStores;
