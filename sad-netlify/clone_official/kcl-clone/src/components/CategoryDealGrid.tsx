import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';

interface DealType {
  id: string;
  title: string;
  image: string;
  store: string;
  href: string;
  time: string;
  price?: string;
  oldPrice?: string;
  categories: string[];
}

interface CategoryDealGridProps {
  title: string;
  subtitle?: string;
  deals: DealType[];
  categories?: Array<{id: string; name: string}>;
  showFilters?: boolean;
}

const CategoryDealGrid: React.FC<CategoryDealGridProps> = ({
  title,
  subtitle,
  deals,
  categories = [],
  showFilters = true
}) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const dealsPerPage = 6;

  // Filter deals by category if needed
  const filteredDeals = selectedCategory === 'all'
    ? deals
    : deals.filter(deal => deal.categories.includes(selectedCategory));

  // Calculate pagination
  const indexOfLastDeal = currentPage * dealsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - dealsPerPage;
  const currentDeals = filteredDeals.slice(indexOfFirstDeal, indexOfLastDeal);
  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
  };

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1f1a1e]">{title}</h2>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>

          {showFilters && categories.length > 0 && (
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50">
                  <span className="text-sm font-medium">{t('categoryDealGrid.filterByCategory', 'Filter by category')}</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown menu (not fully implemented for simplicity) */}
                <div className="hidden absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className={`w-full text-left px-4 py-2 text-sm ${selectedCategory === 'all' ? 'text-[#982a4a] font-medium' : 'text-gray-700'}`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      {t('categoryDealGrid.allCategories', 'All Categories')}
                    </button>

                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`w-full text-left px-4 py-2 text-sm ${selectedCategory === category.id ? 'text-[#982a4a] font-medium' : 'text-gray-700'}`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deal grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDeals.map((deal) => (
            <div key={deal.id} className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
              <Link to={deal.href} className="group">
                <div className="relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {deal.store && (
                    <span className="absolute top-3 left-3 bg-[#982a4a]/90 text-white text-xs px-2 py-1 rounded">
                      {deal.store}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-[#1f1a1e] text-lg mb-2 line-clamp-2 group-hover:text-[#982a4a] transition-colors">
                    {deal.title}
                  </h3>

                  {deal.price && (
                    <div className="flex items-center mb-2">
                      <span className="text-[#982a4a] font-bold text-lg">{deal.price}</span>
                      {deal.oldPrice && (
                        <span className="text-gray-500 line-through ml-2 text-sm">{deal.oldPrice}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm text-gray-500">{deal.time}</span>

                    <span className="text-[#982a4a] font-medium flex items-center text-sm hover:underline">
                      {t('categoryDealGrid.heresDeal', "Here's the deal")}
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>

              <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
                <button className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-primary/10">
                  {t('categoryDealGrid.priceAlert', 'Price Alert')}
                </button>

                <div>
                  <FavoriteButton
                    itemId={deal.id}
                    itemType="deal"
                    itemData={{
                      title: deal.title,
                      image: deal.image,
                      store: deal.store,
                      url: deal.href
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-10 h-10 flex items-center justify-center rounded-md ${
                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1f1a1e] hover:bg-gray-100'
              }`}
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page buttons */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-md ${
                  currentPage === index + 1
                    ? 'bg-[#982a4a] text-white'
                    : 'text-[#1f1a1e] hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-10 h-10 flex items-center justify-center rounded-md ${
                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-[#1f1a1e] hover:bg-gray-100'
              }`}
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* View all button */}
        {deals.length > currentDeals.length && (
          <div className="mt-8 text-center">
            <Link
              to="/deals"
              className="inline-flex items-center bg-[#f6cf13] hover:bg-[#f6cf13]/90 px-5 py-2.5 rounded-md font-medium"
            >
              {t('categoryDealGrid.viewMoreDeals', 'View more deals')}
              <svg className="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryDealGrid;
