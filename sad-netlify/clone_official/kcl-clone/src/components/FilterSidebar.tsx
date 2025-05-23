import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface FilterSidebarProps {
  categories: FilterOption[];
  stores: FilterOption[];
  priceRanges: FilterOption[];
  selectedFilters: {
    categories: string[];
    stores: string[];
    priceRanges: string[];
  };
  onFilterChange: (filterType: 'categories' | 'stores' | 'priceRanges', filterId: string) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  stores,
  priceRanges,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  isMobile = false,
  onCloseMobile
}) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    stores: true,
    priceRanges: true
  });

  const toggleSection = (section: 'categories' | 'stores' | 'priceRanges') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters =
    selectedFilters.categories.length > 0 ||
    selectedFilters.stores.length > 0 ||
    selectedFilters.priceRanges.length > 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm ${isMobile ? 'fixed inset-0 z-50 overflow-y-auto' : ''}`}>
      {isMobile && (
        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1f1a1e]">{t('filterSidebar.filters', 'Filters')}</h2>
          <button
            type="button"
            className="p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
            onClick={onCloseMobile}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className={isMobile ? 'p-4' : ''}>
        {hasActiveFilters && (
          <div className="px-4 py-3 flex justify-between items-center border-b border-gray-100">
            <span className="text-sm font-medium text-[#1f1a1e]">
              {t('filterSidebar.activeFilters', 'Active Filters')}
            </span>
            <button
              className="text-sm text-[#982a4a] hover:underline"
              onClick={onClearFilters}
            >
              {t('filterSidebar.clearAll', 'Clear All')}
            </button>
          </div>
        )}

        {/* Categories Filter */}
        <div className="border-b border-gray-100">
          <button
            className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-[#1f1a1e]"
            onClick={() => toggleSection('categories')}
          >
            <span className="font-semibold">{t('filterSidebar.categories', 'Categories')}</span>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.categories ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.categories && (
            <div className="px-4 pb-3 space-y-2">
              {categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    id={`category-${category.id}`}
                    type="checkbox"
                    className="h-4 w-4 rounded text-[#982a4a] focus:ring-[#982a4a] border-gray-300"
                    checked={selectedFilters.categories.includes(category.id)}
                    onChange={() => onFilterChange('categories', category.id)}
                  />
                  <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                    {category.name}
                  </label>
                  {category.count !== undefined && (
                    <span className="text-xs text-gray-500">({category.count})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stores Filter */}
        <div className="border-b border-gray-100">
          <button
            className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-[#1f1a1e]"
            onClick={() => toggleSection('stores')}
          >
            <span className="font-semibold">{t('filterSidebar.stores', 'Stores')}</span>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.stores ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.stores && (
            <div className="px-4 pb-3">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={t('filterSidebar.searchStores', 'Search stores...')}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#982a4a] focus:border-[#982a4a]"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {stores.map(store => (
                  <div key={store.id} className="flex items-center">
                    <input
                      id={`store-${store.id}`}
                      type="checkbox"
                      className="h-4 w-4 rounded text-[#982a4a] focus:ring-[#982a4a] border-gray-300"
                      checked={selectedFilters.stores.includes(store.id)}
                      onChange={() => onFilterChange('stores', store.id)}
                    />
                    <label htmlFor={`store-${store.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                      {store.name}
                    </label>
                    {store.count !== undefined && (
                      <span className="text-xs text-gray-500">({store.count})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-gray-100">
          <button
            className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium text-[#1f1a1e]"
            onClick={() => toggleSection('priceRanges')}
          >
            <span className="font-semibold">{t('filterSidebar.priceRange', 'Price Range')}</span>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.priceRanges ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.priceRanges && (
            <div className="px-4 pb-3 space-y-2">
              {priceRanges.map(range => (
                <div key={range.id} className="flex items-center">
                  <input
                    id={`price-${range.id}`}
                    type="checkbox"
                    className="h-4 w-4 rounded text-[#982a4a] focus:ring-[#982a4a] border-gray-300"
                    checked={selectedFilters.priceRanges.includes(range.id)}
                    onChange={() => onFilterChange('priceRanges', range.id)}
                  />
                  <label htmlFor={`price-${range.id}`} className="ml-2 text-sm text-gray-700">
                    {range.name}
                  </label>
                </div>
              ))}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#982a4a] focus:border-[#982a4a]"
                  />
                  <span className="text-gray-500 mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#982a4a] focus:border-[#982a4a]"
                  />
                  <button
                    className="ml-2 p-2 bg-[#982a4a] text-white rounded-md hover:bg-opacity-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <div className="px-4 py-3 mt-4 flex justify-between">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={onClearFilters}
            >
              {t('filterSidebar.reset', 'Reset')}
            </button>
            <button
              className="px-4 py-2 bg-[#982a4a] text-white rounded-md hover:bg-opacity-90"
              onClick={onCloseMobile}
            >
              {t('filterSidebar.applyFilters', 'Apply Filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
