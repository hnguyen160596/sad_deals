import type React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';

interface Coupon {
  id: number;
  title: string;
  description: string;
  expiry: string;
  source: string;
  code?: string;
  url: string;
  image: string;
  storeLogo: string;
  store: string;
  verified: boolean;
  success: number;
}

// Sample coupon data for different categories
const couponCategories: Record<string, { title: string; description: string; coupons: Coupon[] }> = {
  'diapers': {
    title: 'Diaper Coupons',
    description: 'Save money on diapers with these printable and digital coupons for Huggies, Pampers, Luvs, and more.',
    coupons: [
      {
        id: 1,
        title: '20% Off Huggies Diapers',
        description: 'Take 20% off any Huggies diaper purchase',
        expiry: 'May 30, 2025',
        source: 'Manufacturer',
        code: 'HUGGIES20',
        url: '/coupons/huggies',
        image: 'https://ext.same-assets.com/591013942/3123456789.jpeg',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/5ua7Rm7qHZkitd17dev3jF/296b794f9b48b9826cdde1aaedac368b/Amazon-icon-2x.png',
        store: 'Amazon',
        verified: true,
        success: 92
      },
      {
        id: 2,
        title: '$3 Off Pampers Swaddlers',
        description: 'Save $3 on any pack of Pampers Swaddlers',
        expiry: 'June 15, 2025',
        source: 'Manufacturer',
        url: '/coupons/pampers',
        image: 'https://ext.same-assets.com/591013942/4123456789.jpeg',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/6rN3PYosPpBNMW27B3UfEW/d9e88b84e5e7ccfb2759488490b6bbea/Target-Icon.png',
        store: 'Target',
        verified: true,
        success: 89
      },
      {
        id: 3,
        title: 'Buy One, Get One 50% Off Luvs Diapers',
        description: 'Buy one package of Luvs diapers and get another 50% off',
        expiry: 'May 25, 2025',
        source: 'Store',
        url: '/coupons/luvs',
        image: 'https://ext.same-assets.com/591013942/5123456789.jpeg',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/ZdZR1JtLsuz8jJfyn9tZH/c2bd75bb973aaf535016d36964f92f6a/cvs-Icon.png',
        store: 'CVS',
        verified: true,
        success: 78
      },
    ]
  },
  'toilet-paper': {
    title: 'Toilet Paper Coupons',
    description: 'Find the best toilet paper coupons for Charmin, Angel Soft, Cottonelle, and Scott. Save money on your household essentials.',
    coupons: [
      {
        id: 4,
        title: '$1.50 Off Charmin Ultra Soft',
        description: 'Save $1.50 on Charmin Ultra Soft 6 Mega Rolls or larger',
        expiry: 'June 1, 2025',
        source: 'Manufacturer',
        code: 'CHARMIN150',
        url: '/coupons/charmin',
        image: 'https://ext.same-assets.com/591013942/6123456789.jpeg',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3ejfk8bY1oOHWbGbWqtigI/9a0f8eee27326b81064adb0967ddd8d3/Walmart-Logo-2025.png',
        store: 'Walmart',
        verified: true,
        success: 95
      },
      {
        id: 5,
        title: '$1 Off Any Cottonelle Product',
        description: 'Take $1 off any Cottonelle product, including toilet paper and flushable wipes',
        expiry: 'May 29, 2025',
        source: 'Manufacturer',
        url: '/coupons/cottonelle',
        image: 'https://ext.same-assets.com/591013942/7123456789.jpeg',
        storeLogo: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/1HQCt4gawjklspIx0XunTJ/ffd5783e1f251b125f6a4e1c128ceaf4/DollarGeneral-Icon-2x.png',
        store: 'Dollar General',
        verified: true,
        success: 88
      },
    ]
  },
};

// For categories without specific data, show a placeholder
const defaultCategory = {
  title: 'Coupons',
  description: 'Find printable and digital coupons to save money on your favorite products.',
  coupons: [] as Coupon[]
};

const CouponCategoryPage: React.FC = () => {
  const { couponSlug } = useParams<{ couponSlug: string }>();

  // Get category data or use default
  const categoryData = couponSlug && couponCategories[couponSlug]
    ? couponCategories[couponSlug]
    : {
        title: `${couponSlug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Coupons`,
        description: `Save money on ${couponSlug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} with these printable and digital coupons.`,
        coupons: []
      };

  return (
    <Layout>
      <SEO
        title={`${categoryData.title} | Sales Aholics Deals`}
        description={categoryData.description}
        canonicalUrl={`https://salesaholicsdeals.com/coupons/${couponSlug}`}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{categoryData.title}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {categoryData.description}
          </p>
        </div>

        {/* Filter options */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium text-gray-700">Filter by:</span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md">All Coupons</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Printable</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Digital</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Store</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">Manufacturer</button>

            <div className="ml-auto">
              <select className="px-4 py-2 border border-gray-300 rounded-md bg-white">
                <option>Sort: Newest</option>
                <option>Sort: Expiring Soon</option>
                <option>Sort: Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        {categoryData.coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryData.coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-gray-100">
                    <img
                      src={coupon.image}
                      alt={coupon.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-4 md:w-2/3 flex flex-col">
                    <div className="flex items-center mb-2">
                      <img
                        src={coupon.storeLogo}
                        alt={coupon.store}
                        className="w-6 h-6 mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{coupon.store}</span>
                      {coupon.verified && (
                        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Verified</span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-2">{coupon.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{coupon.description}</p>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">Expires: {coupon.expiry}</span>
                        <span className="text-xs text-gray-500">{coupon.success}% Success</span>
                      </div>

                      {coupon.code ? (
                        <div className="flex items-center border border-dashed border-gray-300 bg-gray-50 rounded p-2 mb-3">
                          <span className="font-mono font-bold text-gray-800 mr-auto">{coupon.code}</span>
                          <button className="text-blue-600 text-sm font-medium">Copy</button>
                        </div>
                      ) : null}

                      <Link
                        to={coupon.url}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                      >
                        Get Coupon
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-yellow-800 mb-3">We're updating our coupons!</h3>
            <p className="text-yellow-700 mb-6">
              Our team is currently gathering the latest {couponSlug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} coupons.
              Check back soon for exclusive savings!
            </p>
            <Link
              to="/coupons"
              className="inline-block px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700"
            >
              Browse All Coupons
            </Link>
          </div>
        )}

        {/* Related Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Coupon Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Link to="/coupons/diapers" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">Diaper Coupons</span>
            </Link>
            <Link to="/coupons/food" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">Food Coupons</span>
            </Link>
            <Link to="/coupons/toilet-paper" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">Toilet Paper Coupons</span>
            </Link>
            <Link to="/coupons/laundry" className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow">
              <span className="font-medium">Laundry Coupons</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CouponCategoryPage;
