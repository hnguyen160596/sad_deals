import type React from 'react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import FilterSidebar from '../components/FilterSidebar';
import { useTranslation } from 'react-i18next';

interface Deal {
  id: number;
  title: string;
  image: string;
  storeLogo: string;
  store: string;
  timePosted: string;
  href: string;
  price?: string;
  retailPrice?: string;
  discount?: string;
  hotness: number;
  expired?: boolean;
}

// Sample deals data for different categories
const dealCategories: Record<string, { title: string; description: string; deals: Deal[] }> = {
  'online': {
    title: 'Online Deals',
    description: 'The best online deals from your favorite retailers. Shop these offers from the comfort of your home!',
    deals: [
      {
        id: 1,
        title: 'Amazon Echo Dot 5th Gen, Only $29.99 Shipped (Reg. $50)',
        image: 'https://ext.same-assets.com/591013942/9012345678.jpeg',
        store: 'Amazon',
        storeLogo: 'https://ext.same-assets.com/591013942/1818298894.png',
        timePosted: '2 hours ago',
        href: '/2025/05/19/amazon-echo-dot-5th-gen-only-29-99-shipped',
        price: '$29.99',
        retailPrice: '$49.99',
        discount: '40% Off',
        hotness: 98,
      },
      {
        id: 2,
        title: 'Anker 10000mAh Power Bank, Only $15.99 (Reg. $30)',
        image: 'https://ext.same-assets.com/591013942/5443456789.jpeg',
        store: 'Amazon',
        storeLogo: 'https://ext.same-assets.com/591013942/1818298894.png',
        timePosted: '3 hours ago',
        href: '/2025/05/19/anker-power-bank-only-15-99',
        price: '$15.99',
        retailPrice: '$29.99',
        discount: '47% Off',
        hotness: 95,
      },
      {
        id: 3,
        title: 'Instant Pot 6-Quart Duo Plus, Only $69.95 (Reg. $130)',
        image: 'https://ext.same-assets.com/591013942/6443456789.jpeg',
        store: 'Amazon',
        storeLogo: 'https://ext.same-assets.com/591013942/1818298894.png',
        timePosted: '4 hours ago',
        href: '/2025/05/19/instant-pot-6-quart-duo-plus-only-69-95',
        price: '$69.95',
        retailPrice: '$129.99',
        discount: '46% Off',
        hotness: 94,
      },
    ]
  },
  'freebies': {
    title: 'Freebies',
    description: 'Everyone loves free stuff! Check out these totally free items and samples - no purchase necessary.',
    deals: [
      {
        id: 4,
        title: 'FREE 8x10 Photo Print at Walgreens (Online Only)',
        image: 'https://ext.same-assets.com/591013942/7443456789.jpeg',
        store: 'Walgreens',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/6hpWDCF71K2UiUIHlbUkp1/219693b5005cb5f1ed93ed9d5d82d436/walgreens-icon.png',
        timePosted: '5 hours ago',
        href: '/2025/05/19/free-photo-print-walgreens',
        hotness: 90,
      },
      {
        id: 5,
        title: 'FREE Ice Cream Cone at Dairy Queen on May 20th',
        image: 'https://ext.same-assets.com/591013942/8443456789.jpeg',
        store: 'Dairy Queen',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3iZZIYwA6tOmrZC93hu9Tu/227a23318afc9f8bff628c218538b337/DairyQueen-Icon-2x.png',
        timePosted: '6 hours ago',
        href: '/2025/05/19/free-ice-cream-cone-dairy-queen',
        hotness: 97,
      },
      {
        id: 6,
        title: 'FREE Sample of Olay Regenerist Face Cream',
        image: 'https://ext.same-assets.com/591013942/9443456789.jpeg',
        store: 'Olay',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3ejfk8bY1oOHWbGbWqtigI/9a0f8eee27326b81064adb0967ddd8d3/Walmart-Logo-2025.png',
        timePosted: '8 hours ago',
        href: '/2025/05/19/free-olay-regenerist-sample',
        hotness: 89,
      },
    ]
  },
};

// Default category for fallback
const defaultCategory = {
  title: 'Deals',
  description: 'Find the best deals and discounts to save you money on your favorite products.',
  deals: [] as Deal[]
};

const DealCategoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { dealSlug } = useParams<{ dealSlug: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    stores: [],
    priceRanges: []
  } as {
    categories: string[];
    stores: string[];
    priceRanges: string[];
  });

  // Get category data or use default with formatted title
  const categoryData = dealSlug && dealCategories[dealSlug]
    ? dealCategories[dealSlug]
    : {
        title: dealSlug ? `${dealSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Deals` : 'Deals',
        description: dealSlug ? `Find the best ${dealSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} deals and save money on your purchases.` : defaultCategory.description,
        deals: []
      };

  const fallbackMessage = dealSlug
    ? `We're currently gathering the best ${dealSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} deals for you. Check back soon!`
    : 'We\'re currently updating our deals. Check back soon for new offers!';

  // Sample filter data
  const categoryFilters = [
    { id: 'online', name: 'Online Deals', count: 128 },
    { id: 'freebies', name: 'Freebies', count: 43 },
    { id: 'extreme-couponing', name: 'Extreme Couponing', count: 27 },
    { id: 'gift-card', name: 'Gift Card Deals', count: 18 },
    { id: 'clearance', name: 'Clearance', count: 76 },
    { id: 'shoes', name: 'Shoes', count: 31 },
    { id: 'lego', name: 'LEGO', count: 12 },
    { id: 'toys', name: 'Toys', count: 47 },
  ];

  const storeFilters = [
    { id: 'amazon', name: 'Amazon', count: 75 },
    { id: 'target', name: 'Target', count: 52 },
    { id: 'walmart', name: 'Walmart', count: 68 },
    { id: 'kohls', name: 'Kohl\'s', count: 41 },
    { id: 'macys', name: 'Macy\'s', count: 38 },
    { id: 'best-buy', name: 'Best Buy', count: 23 },
    { id: 'walgreens', name: 'Walgreens', count: 19 },
    { id: 'cvs', name: 'CVS', count: 17 },
  ];

  const priceRangeFilters = [
    { id: 'under-5', name: 'Under $5' },
    { id: '5-10', name: '$5 to $10' },
    { id: '10-25', name: '$10 to $25' },
    { id: '25-50', name: '$25 to $50' },
    { id: '50-100', name: '$50 to $100' },
    { id: 'over-100', name: 'Over $100' },
  ];

  const handleFilterChange = (filterType: 'categories' | 'stores' | 'priceRanges', filterId: string) => {
    setSelectedFilters(prev => {
      const currentFilters = [...prev[filterType]];
      if (currentFilters.includes(filterId)) {
        // Remove filter if already selected
        return {
          ...prev,
          [filterType]: currentFilters.filter(id => id !== filterId)
        };
      } else {
        // Add filter if not selected
        return {
          ...prev,
          [filterType]: [...currentFilters, filterId]
        };
      }
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      stores: [],
      priceRanges: []
    });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <SEO
        title={`${categoryData.title} | Sales Aholics Deals`}
        description={categoryData.description}
        canonicalUrl={dealSlug ? `https://salesaholicsdeals.com/deals/${dealSlug}` : 'https://salesaholicsdeals.com/deals'}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#1f1a1e]">{categoryData.title}</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {categoryData.description}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            className="w-full py-3 px-4 bg-[#f5f5f5] border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-[#1f1a1e] font-medium"
            onClick={toggleSidebar}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {t('dealPage.filterDeals', 'Filter Deals')}
          </button>
        </div>

        {/* Main Content with Sidebar and Deals Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5">
            <FilterSidebar
              categories={categoryFilters}
              stores={storeFilters}
              priceRanges={priceRangeFilters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Mobile Sidebar - Overlay */}
          {isSidebarOpen && (
            <div className="md:hidden">
              <FilterSidebar
                categories={categoryFilters}
                stores={storeFilters}
                priceRanges={priceRangeFilters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                isMobile={true}
                onCloseMobile={toggleSidebar}
              />
            </div>
          )}

          {/* Deals Grid */}
          <div className="flex-1">
            {/* Sort and Display Options */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{t('dealPage.sortBy', 'Sort By:')}</span>
                <select className="text-sm border-gray-200 rounded-md py-1 focus:ring-[#982a4a] focus:border-[#982a4a]">
                  <option>{t('dealPage.sortOptions.newest', 'Newest')}</option>
                  <option>{t('dealPage.sortOptions.hottest', 'Hottest')}</option>
                  <option>{t('dealPage.sortOptions.priceHigh', 'Price: High to Low')}</option>
                  <option>{t('dealPage.sortOptions.priceLow', 'Price: Low to High')}</option>
                  <option>{t('dealPage.sortOptions.discount', 'Discount %')}</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {categoryData.deals.length > 0 ?
                    t('dealPage.showingDeals', 'Showing {{count}} deals', { count: categoryData.deals.length }) :
                    t('dealPage.noDeals', 'No deals found')}
                </span>
                <div className="flex gap-1">
                  <button className="p-2 bg-[#982a4a] text-white rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedFilters.categories.length > 0 || selectedFilters.stores.length > 0 || selectedFilters.priceRanges.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{t('dealPage.activeFilters', 'Active Filters:')}</h3>
                  <button
                    className="text-xs text-[#982a4a] hover:underline"
                    onClick={clearFilters}
                  >
                    {t('dealPage.clearAll', 'Clear All')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFilters.categories.map(id => {
                    const category = categoryFilters.find(cat => cat.id === id);
                    return category ? (
                      <span
                        key={`cat-${id}`}
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center"
                      >
                        {category.name}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleFilterChange('categories', id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ) : null;
                  })}
                  {selectedFilters.stores.map(id => {
                    const store = storeFilters.find(st => st.id === id);
                    return store ? (
                      <span
                        key={`store-${id}`}
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center"
                      >
                        {store.name}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleFilterChange('stores', id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ) : null;
                  })}
                  {selectedFilters.priceRanges.map(id => {
                    const range = priceRangeFilters.find(pr => pr.id === id);
                    return range ? (
                      <span
                        key={`price-${id}`}
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full flex items-center"
                      >
                        {range.name}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleFilterChange('priceRanges', id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Deals Grid */}
            {categoryData.deals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={deal.href}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-48 object-cover"
                      />
                      {deal.discount && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-sm font-medium text-sm">
                          {deal.discount}
                        </div>
                      )}
                      {deal.expired && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-bold text-xl uppercase">Expired</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <button
                          className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
                          title={t('dealPage.setAlert', 'Set price alert')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </button>
                        <button
                          className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100"
                          title={t('dealPage.saveDeal', 'Save deal')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center mb-2">
                        <img
                          src={deal.storeLogo}
                          alt={deal.store}
                          className="w-6 h-6 mr-2"
                        />
                        <span className="text-xs font-medium text-gray-700">{deal.store}</span>
                        <div className="ml-auto bg-red-100 text-red-800 font-medium px-2 py-0.5 rounded-full text-xs">
                          {deal.hotness}% Hot
                        </div>
                      </div>
                      <h3 className="font-bold text-base mb-2 line-clamp-3 flex-grow text-[#1f1a1e]">{deal.title}</h3>

                      {deal.price && (
                        <div className="mt-1 mb-2">
                          <span className="text-lg font-bold text-green-700 mr-2">{deal.price}</span>
                          {deal.retailPrice && (
                            <span className="text-sm text-gray-500 line-through">{deal.retailPrice}</span>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{deal.timePosted}</span>
                        <span className="text-[#982a4a] text-sm font-medium">{t('dealPage.viewDeal', 'View →')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50 p-8 rounded-lg text-center mb-12">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">{t('dealPage.updatingDeals', 'We\'re updating our deals!')}</h3>
                <p className="text-blue-700 mb-6">
                  {fallbackMessage}
                </p>
                <Link
                  to="/deals"
                  className="inline-block px-6 py-2 bg-[#982a4a] text-white font-medium rounded-lg hover:bg-opacity-90"
                >
                  {t('dealPage.browseAllDeals', 'Browse All Deals')}
                </Link>
              </div>
            )}

            {/* Pagination */}
            {categoryData.deals.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <a href="#" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
                    <span className="sr-only">{t('pagination.previous', 'Previous')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="px-3 py-2 rounded bg-[#982a4a] text-white font-medium">1</a>
                  <a href="#" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">2</a>
                  <a href="#" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">3</a>
                  <span className="px-3 py-2 text-gray-500">...</span>
                  <a href="#" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">8</a>
                  <a href="#" className="px-3 py-2 rounded text-gray-700 hover:bg-gray-100">
                    <span className="sr-only">{t('pagination.next', 'Next')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Related Categories */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 text-[#1f1a1e]">{t('dealPage.popularCategories', 'Popular Deal Categories')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Link to="/deals/online" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.online', 'Online Deals')}</span>
            </Link>
            <Link to="/deals/freebies" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.freebies', 'Freebies')}</span>
            </Link>
            <Link to="/deals/clearance" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.clearance', 'Clearance')}</span>
            </Link>
            <Link to="/deals/gift-card" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.giftCard', 'Gift Card Deals')}</span>
            </Link>
            <Link to="/deals/shoes" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.shoes', 'Shoes')}</span>
            </Link>
            <Link to="/deals/lego" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.lego', 'LEGO')}</span>
            </Link>
            <Link to="/deals/toys" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.toys', 'Toys')}</span>
            </Link>
            <Link to="/deals/baby" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">{t('dealCategories.baby', 'Baby')}</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealCategoryPage;
