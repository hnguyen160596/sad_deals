import type React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

// Sample deal categories with images
const dealCategories = [
  {
    name: 'Online Deals',
    href: '/deals/online',
    image: 'https://ext.same-assets.com/591013942/1234567890.jpeg',
    description: 'Score the best deals online from top retailers'
  },
  {
    name: 'Extreme Couponing',
    href: '/deals/extreme-couponing',
    image: 'https://ext.same-assets.com/591013942/2345678901.jpeg',
    description: 'Maximizing your savings with extreme couponing techniques'
  },
  {
    name: 'Freebies',
    href: '/deals/freebies',
    image: 'https://ext.same-assets.com/591013942/3456789012.jpeg',
    description: 'Get free stuff! No purchase necessary'
  },
  {
    name: 'Gift Card Deals',
    href: '/deals/gift-card',
    image: 'https://ext.same-assets.com/591013942/4567890123.jpeg',
    description: 'Discounted gift cards and bonus card offers'
  },
  {
    name: 'Clearance',
    href: '/deals/clearance',
    image: 'https://ext.same-assets.com/591013942/5678901234.jpeg',
    description: 'Deep discounts on clearance items'
  },
  {
    name: 'Shoes',
    href: '/deals/shoes',
    image: 'https://ext.same-assets.com/591013942/6789012345.jpeg',
    description: 'Step into savings with shoe deals'
  },
  {
    name: 'LEGO',
    href: '/deals/lego',
    image: 'https://ext.same-assets.com/591013942/7890123456.jpeg',
    description: 'Building block bargains for all ages'
  },
  {
    name: 'Baby',
    href: '/deals/baby',
    image: 'https://ext.same-assets.com/591013942/8901234567.jpeg',
    description: 'Save on everything for your little one'
  },
];

// Sample featured deals
const featuredDeals = [
  {
    id: 1,
    title: 'Amazon Echo Dot 5th Gen, Only $29.99 Shipped (Reg. $50)',
    image: 'https://ext.same-assets.com/591013942/9012345678.jpeg',
    store: 'Amazon',
    storeLogo: 'https://ext.same-assets.com/591013942/1818298894.png',
    timePosted: '2 hours ago',
    href: '/2025/05/19/amazon-echo-dot-5th-gen-only-29-99-shipped',
    hotness: 98,
  },
  {
    id: 2,
    title: 'Ninja Creami Ice Cream Maker, as Low as $149.99 at Target (Regularly $230)',
    image: 'https://ext.same-assets.com/591013942/0123456789.jpeg',
    store: 'Target',
    storeLogo: 'https://ext.same-assets.com/591013942/target-icon.png',
    timePosted: '5 hours ago',
    href: '/2025/05/19/ninja-creami-ice-cream-maker-as-low-as-149-99-at-target',
    hotness: 95,
  },
  {
    id: 3,
    title: 'Old Navy: Kids\' Shorts, Only $6 (Regularly $15)',
    image: 'https://ext.same-assets.com/591013942/1123456789.jpeg',
    store: 'Old Navy',
    storeLogo: 'https://ext.same-assets.com/591013942/old-navy-icon.png',
    timePosted: '6 hours ago',
    href: '/2025/05/19/old-navy-kids-shorts-only-6',
    hotness: 90,
  },
  {
    id: 4,
    title: 'CVS: FREE Colgate Toothpaste After ExtraBucks (Reg. $3.99)',
    image: 'https://ext.same-assets.com/591013942/2123456789.jpeg',
    store: 'CVS',
    storeLogo: 'https://ext.same-assets.com/591013942/cvs-icon.png',
    timePosted: '8 hours ago',
    href: '/2025/05/19/cvs-free-colgate-toothpaste-after-extrabucks',
    hotness: 88,
  },
];

const TodaysDealsPage: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/deals';

  return (
    <>
      <SEO
        title="Today's Deals | Sales Aholics Deals"
        description="Find the hottest deals, freebies, and savings today. New deals added hourly!"
        canonicalUrl="https://salesaholicsdeals.com/deals"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Today's Hottest Deals</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The best deals, sales, and coupons hand-picked by our team of experts. Updated hourly!
          </p>
        </div>

        {/* Deal Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b">Deal Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dealCategories.map((category) => (
              <Link
                key={category.href}
                to={category.href}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Deals */}
        <section>
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b">Featured Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredDeals.map((deal) => (
              <Link
                key={deal.id}
                to={deal.href}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
              >
                <div className="md:w-1/3 bg-gray-100">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="p-4 md:w-2/3 flex flex-col">
                  <div className="flex items-center mb-2">
                    <img
                      src={deal.storeLogo}
                      alt={deal.store}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{deal.store}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{deal.title}</h3>

                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-sm text-gray-500">{deal.timePosted}</span>
                    <div className="bg-red-100 text-red-800 font-medium px-2 py-1 rounded-full text-xs">
                      {deal.hotness}% Hot
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/deals"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-block"
            >
              Load More Deals
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default TodaysDealsPage;
