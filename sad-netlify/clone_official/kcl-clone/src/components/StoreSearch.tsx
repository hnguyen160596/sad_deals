import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stores } from '../data/stores';
import { trackClick } from './Analytics';

const StoreSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof stores>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim().length > 1) {
      // Filter stores based on search term
      const uniqueStores = stores.filter((store, index, self) =>
        index === self.findIndex((s) => s.name === store.name)
      );

      const results = uniqueStores.filter(store =>
        store.name.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 8); // Limit results to 8

      setSearchResults(results);
      setIsSearchOpen(results.length > 0);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  // Handle click on search result
  const handleStoreClick = (storeName: string, href: string) => {
    try {
      trackClick('StoreSearch', `SearchResult_${storeName}`);
      setIsSearchOpen(false);
      setSearchTerm('');
      navigate(href);
    } catch (error) {
      console.error('Error handling store click:', error);
    }
  };

  // Handle submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      // Navigate to first result
      handleStoreClick(searchResults[0].name, searchResults[0].href);
    } else if (searchTerm.trim()) {
      // Navigate to search page with query
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for stores..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#982a4a] focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          <span className="text-sm">Search</span>
        </button>
      </form>

      {isSearchOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg overflow-hidden">
          <div className="py-1">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.href}
                  onClick={() => handleStoreClick(result.name, result.href)}
                  className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-8 h-8 mr-3 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={result.icon}
                      alt={result.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/stores/placeholder/store-placeholder.png';
                      }}
                    />
                  </div>
                  <span className="flex-grow text-gray-700">{result.name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500">No stores found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSearch;
