import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { stores } from '../data/stores';

const StoreListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group stores alphabetically
  const groupedStores = stores.reduce<Record<string, typeof stores>>((acc, store) => {
    const firstLetter = store.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(store);
    return acc;
  }, {});

  // Get all unique first letters for the alphabet navigation
  const letters = Object.keys(groupedStores).sort();

  // Filter stores based on search term
  const filteredStores = searchTerm
    ? stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  return (
    <Layout>
      <SEO
        title="All Stores | Sales Aholics Deals"
        description="Find the best coupons, deals, and promo codes from all your favorite stores in one place."
        canonicalUrl="https://salesaholicsdeals.com/stores"
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">All Stores</h1>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for a store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchTerm('')}
            >
              {searchTerm && (
                <span className="text-gray-500 hover:text-gray-700">✕</span>
              )}
            </button>
          </div>
        </div>

        {/* Alphabet Navigation */}
        {!searchTerm && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {letters.map(letter => (
              <a
                key={letter}
                href={`#${letter}`}
                className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-700 font-medium hover:bg-blue-200"
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Store Grid - Filtered Results */}
        {searchTerm && filteredStores && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredStores.map((store, index) => (
                <Link
                  key={`${store.href}-${index}`}
                  to={store.href}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <img
                      src={store.icon}
                      alt={store.name}
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <span className="text-sm font-medium">{store.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Store Grid - Alphabetical Grouping */}
        {!searchTerm && letters.map(letter => (
          <div key={letter} id={letter} className="mb-8 scroll-mt-16">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">{letter}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedStores[letter].map((store, index) => (
                <Link
                  key={`${store.href}-${index}`}
                  to={store.href}
                  className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    <img
                      src={store.icon}
                      alt={store.name}
                      className="max-w-full max-h-full"
                    />
                  </div>
                  <span className="text-sm font-medium">{store.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default StoreListPage;
