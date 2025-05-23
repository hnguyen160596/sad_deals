import type React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { trackSearch, trackClick } from '../components/Analytics';

// Sample search data for demonstration
const sampleStores = [
  { name: 'Amazon', href: '/coupons-for/amazon', logo: 'https://ext.same-assets.com/3000230773/4055390373.png' },
  { name: 'Walmart', href: '/coupons-for/walmart', logo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3ejfk8bY1oOHWbGbWqtigI/9a0f8eee27326b81064adb0967ddd8d3/Walmart-Logo-2025.png?w=960&fit=max&auto=format&q=90' },
  { name: 'Target', href: '/coupons-for/target', logo: 'https://ext.same-assets.com/3000230773/1149209340.png' },
  { name: 'CVS', href: '/coupons-for/cvs', logo: 'https://ext.same-assets.com/3000230773/1492697023.png' },
  { name: 'Best Buy', href: '/coupons-for/best-buy', logo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/1t5L7yAg0ZYTR1ZcuYmw6L/7b689ea747a66abb27d004388ce1747b/BestBuy-Icon-2x.png?w=46&fit=max&auto=format&q=90' },
];

const sampleDeals = [
  {
    title: 'Huge Walker Edison Furniture Sale on Walmart.com (Save Up to 60%)',
    image: 'https://ext.same-assets.com/3000230773/3347604496.jpeg',
    href: '/2025/04/25/huge-walker-edison-furniture-sale-on-walmart-com-save-up-to-60',
    arrow: 'https://ext.same-assets.com/3000230773/1443725800.svg',
    store: 'Walmart',
    category: 'home',
    price: 299.99,
    discount: 60,
    date: '2025-04-25',
  },
  {
    title: "Pay Only $4.99 for This Women's Ribbed Tank Top on Amazon",
    image: 'https://ext.same-assets.com/3000230773/3704997900.jpeg',
    href: '/2025/05/07/pay-only-usd4-99-for-this-womens-ribbed-tank-top-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/409235749.svg',
    store: 'Amazon',
    category: 'apparel',
    price: 4.99,
    discount: 75,
    date: '2025-05-07',
  },
  {
    title: "It's Back: $400 Self-Cleaning Litter Box Drops to $164.99 on Amazon",
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/67CZ2HfqFefuuBD002NSDH/be309ca6be7ba5900363161d0668c2e1/ChatGPT_Image_Apr_30__2025__12_57_28_PM.png?w=241&fit=max&auto=format&q=90',
    href: '/2025/05/07/its-back-usd400-self-cleaning-litter-box-drops-to-usd164-99-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/3225579771.svg',
    store: 'Amazon',
    category: 'pets',
    price: 164.99,
    discount: 58,
    date: '2025-05-07',
  },
  {
    title: 'Apple AirPods Pro 2 with USB-C for Only $189.99 at Target (Reg. $249)',
    image: 'https://ext.same-assets.com/3000230773/7047365112.jpeg',
    href: '/2025/05/01/apple-airpods-pro-2-with-usb-c-for-only-usd189-99-at-target',
    arrow: 'https://ext.same-assets.com/3000230773/1443725800.svg',
    store: 'Target',
    category: 'electronics',
    price: 189.99,
    discount: 24,
    date: '2025-05-01',
  },
  {
    title: 'CVS ExtraBucks Deals: Save on Cosmetics, Personal Care & More',
    image: 'https://ext.same-assets.com/3000230773/9012345678.jpeg',
    href: '/2025/05/03/cvs-extrabucks-deals-save-on-cosmetics-personal-care-more',
    arrow: 'https://ext.same-assets.com/3000230773/409235749.svg',
    store: 'CVS',
    category: 'health',
    price: 9.99,
    discount: 40,
    date: '2025-05-03',
  },
];

const sampleArticles = [
  {
    title: 'Target Easter Clearance Sale',
    href: '/tips/couponing/target-easter-clearance',
    excerpt: 'Find out how to get the best deals in the Target Easter clearance sale with these easy tips.',
    date: '2025-05-01',
    category: 'store-hacks',
  },
  {
    title: 'Target Car Seat Trade-In Event',
    href: '/tips/store-hacks/target-car-seat-trade-in',
    excerpt: 'Save big on new car seats with Target\'s popular car seat trade-in event. Here\'s everything you need to know.',
    date: '2025-04-28',
    category: 'store-hacks',
  },
  {
    title: 'Sephora Oh Hair Yeah Sale',
    href: '/tips/money/sephora-oh-hair-yeah-event',
    excerpt: 'The Sephora Oh Hair Yeah Sale is here with amazing discounts on premium hair care products.',
    date: '2025-05-05',
    category: 'money',
  },
  {
    title: 'How to Save Money on Baby Formula',
    href: '/tips/baby/how-to-save-money-on-baby-formula',
    excerpt: 'Learn the best strategies to save on baby formula with these tips from our parenting experts.',
    date: '2025-04-30',
    category: 'baby',
  },
];

// Available filters
const dealCategories = ['all', 'apparel', 'electronics', 'home', 'pets', 'health'];
const stores = ['all', 'Amazon', 'Walmart', 'Target', 'CVS', 'Best Buy'];
const discountRanges = [
  { label: 'All Discounts', value: 'all' },
  { label: 'Up to 25%', value: '0-25' },
  { label: '25% - 50%', value: '25-50' },
  { label: '50% - 75%', value: '50-75' },
  { label: '75% or more', value: '75-100' },
];
const sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest', value: 'date-desc' },
  { label: 'Oldest', value: 'date-asc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Discount: High to Low', value: 'discount-desc' },
];
const articleCategories = ['all', 'couponing', 'store-hacks', 'money', 'baby'];

interface SearchResult {
  stores: typeof sampleStores;
  deals: typeof sampleDeals;
  articles: typeof sampleArticles;
}

interface FilterState {
  dealCategory: string;
  store: string;
  discountRange: string;
  sortBy: string;
  articleCategory: string;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult>({ stores: [], deals: [], articles: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'stores' | 'deals' | 'articles'>(
    (searchParams.get('tab') as 'all' | 'stores' | 'deals' | 'articles') || 'all'
  );

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    dealCategory: searchParams.get('category') || 'all',
    store: searchParams.get('store') || 'all',
    discountRange: searchParams.get('discount') || 'all',
    sortBy: searchParams.get('sort') || 'relevance',
    articleCategory: searchParams.get('articleCategory') || 'all',
  });

  // State for mobile filter drawer
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Apply filters to search results
  const applyFilters = (results: SearchResult, filters: FilterState): SearchResult => {
    let filteredDeals = [...results.deals];
    let filteredArticles = [...results.articles];

    // Apply deal category filter
    if (filters.dealCategory !== 'all') {
      filteredDeals = filteredDeals.filter(deal => deal.category === filters.dealCategory);
    }

    // Apply store filter
    if (filters.store !== 'all') {
      filteredDeals = filteredDeals.filter(deal => deal.store === filters.store);
    }

    // Apply discount range filter
    if (filters.discountRange !== 'all') {
      const [min, max] = filters.discountRange.split('-').map(Number);
      filteredDeals = filteredDeals.filter(deal => {
        if (max) {
          return deal.discount >= min && deal.discount <= max;
        } else {
          return deal.discount >= min;
        }
      });
    }

    // Apply article category filter
    if (filters.articleCategory !== 'all') {
      filteredArticles = filteredArticles.filter(article => article.category === filters.articleCategory);
    }

    // Apply sorting
    if (filters.sortBy !== 'relevance') {
      const [field, direction] = filters.sortBy.split('-');

      if (field === 'date') {
        filteredDeals.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return direction === 'asc' ? dateA - dateB : dateB - dateA;
        });

        filteredArticles.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return direction === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (field === 'price') {
        filteredDeals.sort((a, b) => {
          return direction === 'asc' ? a.price - b.price : b.price - a.price;
        });
      } else if (field === 'discount') {
        filteredDeals.sort((a, b) => b.discount - a.discount);
      }
    }

    return {
      ...results,
      deals: filteredDeals,
      articles: filteredArticles,
    };
  };

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      trackSearch(query);

      // Simulate API call with setTimeout
      setTimeout(() => {
        // Filter sample data based on search query
        const lowerQuery = query.toLowerCase();

        const filteredStores = sampleStores.filter(
          store => store.name.toLowerCase().includes(lowerQuery)
        );

        const filteredDeals = sampleDeals.filter(
          deal =>
            deal.title.toLowerCase().includes(lowerQuery) ||
            deal.store.toLowerCase().includes(lowerQuery) ||
            deal.category.toLowerCase().includes(lowerQuery)
        );

        const filteredArticles = sampleArticles.filter(
          article =>
            article.title.toLowerCase().includes(lowerQuery) ||
            article.excerpt.toLowerCase().includes(lowerQuery) ||
            article.category.toLowerCase().includes(lowerQuery)
        );

        const results = {
          stores: filteredStores,
          deals: filteredDeals,
          articles: filteredArticles,
        };

        // Apply filters
        const filteredResults = applyFilters(results, filters);
        setResults(filteredResults);
        setIsLoading(false);
      }, 800);
    }
  }, [query, filters]);

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'stores' | 'deals' | 'articles') => {
    setActiveTab(tab);
    searchParams.set('tab', tab);
    setSearchParams(searchParams);
  };

  // Handle filter change
  const handleFilterChange = (filterName: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    // Update URL params
    searchParams.set(filterName, value);
    setSearchParams(searchParams);

    // Track filter usage
    trackClick('Search Filter', `${filterName}:${value}`);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: FilterState = {
      dealCategory: 'all',
      store: 'all',
      discountRange: 'all',
      sortBy: 'relevance',
      articleCategory: 'all',
    };

    setFilters(defaultFilters);

    // Remove filter params from URL
    Object.keys(defaultFilters).forEach(key => {
      searchParams.delete(key);
    });
    setSearchParams(searchParams);

    trackClick('Search Filter', 'Reset');
  };

  // Determine if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== 'relevance');

  return (
    <Layout>
      <SEO
        title={`Search Results for "${query}" | Sales Aholics Deals`}
        description={`Search results for ${query} - Find deals, stores, and articles`}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Search Results for <span className="text-primary">"{query}"</span>
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Results tabs and filter controls */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 w-full md:w-auto mb-4 md:mb-0">
                <button
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange('all')}
                >
                  All ({results.stores.length + results.deals.length + results.articles.length})
                </button>
                <button
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'stores'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange('stores')}
                >
                  Stores ({results.stores.length})
                </button>
                <button
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'deals'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange('deals')}
                >
                  Deals ({results.deals.length})
                </button>
                <button
                  className={`px-4 py-2 border-b-2 font-medium text-sm ${
                    activeTab === 'articles'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabChange('articles')}
                >
                  Articles ({results.articles.length})
                </button>
              </div>

              {/* Mobile filter button */}
              <div className="md:hidden w-full">
                <button
                  type="button"
                  className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  Filters & Sort
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Desktop sort control */}
              <div className="hidden md:block">
                <label htmlFor="sort-by" className="sr-only">Sort by</label>
                <select
                  id="sort-by"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile filters - collapsible */}
            {showMobileFilters && (
              <div className="md:hidden bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Filters & Sort</h3>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="text-sm text-primary font-medium"
                      onClick={resetFilters}
                    >
                      Reset all
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Sort options */}
                  <div>
                    <label htmlFor="mobile-sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                      Sort by
                    </label>
                    <select
                      id="mobile-sort-by"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deal category filter */}
                  {(activeTab === 'all' || activeTab === 'deals') && (
                    <div>
                      <label htmlFor="mobile-deal-category" className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Category
                      </label>
                      <select
                        id="mobile-deal-category"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={filters.dealCategory}
                        onChange={(e) => handleFilterChange('dealCategory', e.target.value)}
                      >
                        {dealCategories.map((category) => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Store filter */}
                  {(activeTab === 'all' || activeTab === 'deals') && (
                    <div>
                      <label htmlFor="mobile-store" className="block text-sm font-medium text-gray-700 mb-1">
                        Store
                      </label>
                      <select
                        id="mobile-store"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={filters.store}
                        onChange={(e) => handleFilterChange('store', e.target.value)}
                      >
                        {stores.map((store) => (
                          <option key={store} value={store}>
                            {store === 'all' ? 'All Stores' : store}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Discount range filter */}
                  {(activeTab === 'all' || activeTab === 'deals') && (
                    <div>
                      <label htmlFor="mobile-discount" className="block text-sm font-medium text-gray-700 mb-1">
                        Discount
                      </label>
                      <select
                        id="mobile-discount"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={filters.discountRange}
                        onChange={(e) => handleFilterChange('discountRange', e.target.value)}
                      >
                        {discountRanges.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Article category filter */}
                  {(activeTab === 'all' || activeTab === 'articles') && (
                    <div>
                      <label htmlFor="mobile-article-category" className="block text-sm font-medium text-gray-700 mb-1">
                        Article Category
                      </label>
                      <select
                        id="mobile-article-category"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        value={filters.articleCategory}
                        onChange={(e) => handleFilterChange('articleCategory', e.target.value)}
                      >
                        {articleCategories.map((category) => (
                          <option key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop filters */}
            <div className="hidden md:grid md:grid-cols-5 gap-4 mb-6">
              {(activeTab === 'all' || activeTab === 'deals') && (
                <>
                  <div>
                    <label htmlFor="deal-category" className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Category
                    </label>
                    <select
                      id="deal-category"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filters.dealCategory}
                      onChange={(e) => handleFilterChange('dealCategory', e.target.value)}
                    >
                      {dealCategories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
                      Store
                    </label>
                    <select
                      id="store"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filters.store}
                      onChange={(e) => handleFilterChange('store', e.target.value)}
                    >
                      {stores.map((store) => (
                        <option key={store} value={store}>
                          {store === 'all' ? 'All Stores' : store}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                      Discount
                    </label>
                    <select
                      id="discount"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      value={filters.discountRange}
                      onChange={(e) => handleFilterChange('discountRange', e.target.value)}
                    >
                      {discountRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {(activeTab === 'all' || activeTab === 'articles') && (
                <div>
                  <label htmlFor="article-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Article Category
                  </label>
                  <select
                    id="article-category"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    value={filters.articleCategory}
                    onChange={(e) => handleFilterChange('articleCategory', e.target.value)}
                  >
                    {articleCategories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                    onClick={resetFilters}
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500 mb-6">
              {results.stores.length + results.deals.length + results.articles.length === 0 ? (
                <p>No results found. Try adjusting your filters or search term.</p>
              ) : (
                <p>
                  {activeTab === 'all' && `Showing ${results.stores.length + results.deals.length + results.articles.length} results`}
                  {activeTab === 'stores' && `Showing ${results.stores.length} store results`}
                  {activeTab === 'deals' && `Showing ${results.deals.length} deal results`}
                  {activeTab === 'articles' && `Showing ${results.articles.length} article results`}
                </p>
              )}
            </div>

            {/* Results display */}
            <div className="space-y-10">
              {/* Store results */}
              {(activeTab === 'all' || activeTab === 'stores') && results.stores.length > 0 && (
                <section>
                  {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Stores</h2>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.stores.map((store) => (
                      <a
                        key={store.href}
                        href={store.href}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        onClick={() => trackClick('Search Result', `Store: ${store.name}`)}
                      >
                        <img
                          src={store.logo}
                          alt={`${store.name} logo`}
                          className="h-12 w-auto object-contain mb-2"
                        />
                        <span className="text-center font-medium">{store.name}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Deal results */}
              {(activeTab === 'all' || activeTab === 'deals') && results.deals.length > 0 && (
                <section>
                  {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Deals</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.deals.map((deal) => (
                      <a
                        key={deal.href}
                        href={deal.href}
                        className="flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        onClick={() => trackClick('Search Result', `Deal: ${deal.title}`)}
                      >
                        <div className="relative h-48">
                          <img
                            src={deal.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm font-bold">
                            {deal.discount}% OFF
                          </div>
                        </div>
                        <div className="p-4 flex-grow">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>{deal.store}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{deal.category}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{deal.title}</h3>
                          <div className="flex justify-between items-center mt-auto pt-2">
                            <div className="text-lg font-bold text-primary">${deal.price}</div>
                            <div className="flex items-center text-gray-700">
                              <span className="mr-1 text-sm">View Deal</span>
                              <img src={deal.arrow} alt="" className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Article results */}
              {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
                <section>
                  {activeTab === 'all' && <h2 className="text-xl font-bold mb-4">Articles</h2>}
                  <div className="space-y-4">
                    {results.articles.map((article) => (
                      <a
                        key={article.href}
                        href={article.href}
                        className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        onClick={() => trackClick('Search Result', `Article: ${article.title}`)}
                      >
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{article.category.split('-').join(' ')}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{article.excerpt}</p>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* No results */}
              {(
                (activeTab === 'all' && results.stores.length === 0 && results.deals.length === 0 && results.articles.length === 0) ||
                (activeTab === 'stores' && results.stores.length === 0) ||
                (activeTab === 'deals' && results.deals.length === 0) ||
                (activeTab === 'articles' && results.articles.length === 0)
              ) && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                  <p className="text-gray-500">
                    We couldn't find any matches for "{query}" with your current filters.
                  </p>
                  <button
                    className="mt-4 text-primary font-medium"
                    onClick={resetFilters}
                  >
                    Clear filters and try again
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
