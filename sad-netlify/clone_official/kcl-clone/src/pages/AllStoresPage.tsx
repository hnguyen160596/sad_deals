import type React from 'react';
import { stores } from '../data/stores';
import EmailSignupSection from '../components/EmailSignupSection';

const AllStoresPage: React.FC = () => {
  // Top 6 popular stores
  const popularStores = stores.slice(0, 6);
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="text-sm text-gray-600 mb-2">
          <a href="/" className="hover:underline">Home</a> / Stores
        </nav>
        <h1 className="text-3xl font-uniforma text-primary mb-6">
          Coupons and Deals by Store
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          {popularStores.map((store) => (
            <a key={store.href} href={store.href} className="flex flex-col items-center space-y-2 hover:opacity-75">
              <img src={store.icon} alt={store.name} className="h-12 w-auto" />
              <span className="text-sm text-primary">{store.name}</span>
            </a>
          ))}
        </div>
      </div>
      <section className="bg-secondary py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-uniforma text-primary mb-8">All Stores</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {stores.map((store) => (
              <li key={store.href} className="flex flex-col items-center">
                <a href={store.href} className="flex flex-col items-center space-y-2 hover:opacity-75">
                  <img src={store.icon} alt={store.name} className="h-10 w-auto" />
                  <span className="text-center text-sm text-primary">{store.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EmailSignupSection />
    </div>
  );
};

export default AllStoresPage;
