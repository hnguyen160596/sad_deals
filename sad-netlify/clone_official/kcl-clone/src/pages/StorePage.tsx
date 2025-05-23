import type React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import FAQSection from '../components/FAQSection';
import Breadcrumbs from '../components/Breadcrumbs';
import storePages, { type StoreData } from '../data/storePages';

interface QuickLinksProps {
  links: { label: string; href: string; iconUrl: string }[];
}

const QuickLinks: React.FC<QuickLinksProps> = ({ links }) => (
  <div className="bg-blue-50 p-6 rounded-lg my-8">
    <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {links.map((link, index) => (
        <Link
          key={index}
          to={link.href}
          className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
        >
          <img src={link.iconUrl} alt="" className="w-6 h-6 mr-3" />
          <span className="text-blue-700 font-medium">{link.label}</span>
        </Link>
      ))}
    </div>
  </div>
);

interface StoreDealsProps {
  deals: StoreData['deals'];
  storeTitle: string;
}

const StoreDeals: React.FC<StoreDealsProps> = ({ deals, storeTitle }) => (
  <div className="my-8">
    <h2 className="text-2xl font-bold mb-6">{storeTitle} Deals</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deals.map((deal, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-48 overflow-hidden">
            <img
              src={deal.image || 'https://ext.same-assets.com/591013942/1818298894.png'}
              alt={deal.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{deal.title}</h3>
            <div className="text-gray-600 text-sm mb-3">{deal.time}</div>
            <Link
              to={deal.href}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              View Deal
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StorePage: React.FC = () => {
  const { store } = useParams<{ store: string }>();

  // Get store data from our mapping or show placeholder for stores we haven't yet mapped
  const storeData = store && storePages[store] ? storePages[store] : {
    title: `${store?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Coupons and Deals`,
    description: `Find the latest ${store?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} coupons, promo codes, and deals to save money on your next purchase.`,
    logoUrl: 'https://ext.same-assets.com/591013942/1818298894.png',
    quickLinks: [],
    deals: [],
    faqs: []
  };

  return (
    <Layout>
      <SEO
        title={`${storeData.title} | Sales Aholics Deals`}
        description={storeData.description}
        canonicalUrl={`https://salesaholicsdeals.com/coupons-for/${store}`}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs with Schema.org markup */}
        <Breadcrumbs
          items={[
            { name: 'Coupons & Deals', url: '/coupons' },
            { name: store ? store.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Store', url: `/coupons-for/${store}`, isLast: true }
          ]}
          className="mb-6"
        />
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-white p-2 border border-gray-200 shadow-sm mb-4 md:mb-0 md:mr-6">
            <img
              src={storeData.logoUrl}
              alt={storeData.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{storeData.title}</h1>
            <p className="text-gray-600 max-w-3xl">{storeData.description}</p>
          </div>
        </div>

        {storeData.quickLinks.length > 0 && <QuickLinks links={storeData.quickLinks} />}

        {storeData.deals.length > 0 && <StoreDeals deals={storeData.deals} storeTitle={storeData.title.split(' ')[0]} />}

        {storeData.faqs.length > 0 && <FAQSection faqs={storeData.faqs} />}

        {/* Placeholder content for stores without complete data */}
        {storeData.deals.length === 0 && (
          <div className="bg-blue-50 p-6 rounded-lg my-8 text-center">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">We're updating our deals!</h2>
            <p className="text-blue-700 mb-4">
              Our team is currently curating the best deals for {storeData.title.split(' ')[0]}.
              Check back soon for exclusive savings!
            </p>
            <Link
              to="/deals"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Browse All Deals
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StorePage;
