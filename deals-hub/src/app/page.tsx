import React from 'react';
import HeroBanner from '@/components/common/HeroBanner';
import FeaturedDeals from '@/components/deals/FeaturedDeals';
import PopularStores from '@/components/stores/PopularStores';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// This would normally come from a database/API
// For demo, we're using static data
const FEATURED_DEALS = [
  {
    id: '1',
    title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    price: '$248.00',
    originalPrice: '$349.99',
    discountPercentage: 29,
    imageUrl: '/images/deals/sony.jpg',
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/1',
    slug: 'sony-wh-1000xm4-headphones',
    createdAt: '2025-05-21T00:00:00Z',
    expiresAt: '2025-05-30T00:00:00Z',
  },
  {
    id: '2',
    title: 'KitchenAid Artisan Series 5-Qt. Stand Mixer',
    price: '$279.99',
    originalPrice: '$399.99',
    discountPercentage: 30,
    imageUrl: '/images/deals/kitchenaid.jpg',
    storeName: 'Best Buy',
    storeLogoUrl: '/images/stores/best-buy.png',
    dealUrl: 'https://example.com/deal/2',
    slug: 'kitchenaid-artisan-mixer',
    createdAt: '2025-05-20T00:00:00Z',
  },
  {
    id: '3',
    title: 'Apple AirPods Pro (2nd Generation)',
    price: '$189.99',
    originalPrice: '$249.00',
    discountPercentage: 24,
    imageUrl: '/images/deals/airpods.jpg',
    storeName: 'Walmart',
    storeLogoUrl: '/images/stores/walmart.png',
    dealUrl: 'https://example.com/deal/3',
    slug: 'apple-airpods-pro-2nd-gen',
    createdAt: '2025-05-22T00:00:00Z',
    expiresAt: '2025-05-24T00:00:00Z',
  },
  {
    id: '4',
    title: 'Dyson V11 Cordless Vacuum Cleaner',
    price: '$469.99',
    originalPrice: '$599.99',
    discountPercentage: 22,
    imageUrl: '/images/deals/dyson.jpg',
    storeName: 'Target',
    storeLogoUrl: '/images/stores/target.png',
    dealUrl: 'https://example.com/deal/4',
    slug: 'dyson-v11-vacuum',
    createdAt: '2025-05-19T00:00:00Z',
  },
];

const POPULAR_STORES = [
  {
    id: '1',
    name: 'Amazon',
    logoUrl: '/images/stores/amazon.png',
    websiteUrl: 'https://amazon.com',
    activeDeals: 42,
    slug: 'amazon',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Walmart',
    logoUrl: '/images/stores/walmart.png',
    websiteUrl: 'https://walmart.com',
    activeDeals: 38,
    slug: 'walmart',
  },
  {
    id: '3',
    name: 'Target',
    logoUrl: '/images/stores/target.png',
    websiteUrl: 'https://target.com',
    activeDeals: 29,
    slug: 'target',
  },
  {
    id: '4',
    name: 'Best Buy',
    logoUrl: '/images/stores/best-buy.png',
    websiteUrl: 'https://bestbuy.com',
    activeDeals: 31,
    slug: 'best-buy',
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Home Depot',
    logoUrl: '/images/stores/home-depot.png',
    websiteUrl: 'https://homedepot.com',
    activeDeals: 24,
    slug: 'home-depot',
  },
  {
    id: '6',
    name: 'Macys',
    logoUrl: '/images/stores/macys.png',
    websiteUrl: 'https://macys.com',
    activeDeals: 18,
    slug: 'macys',
  },
];

export default function Home() {
  return (
    <>
      <HeroBanner />

      <div className="py-8 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-600 text-3xl font-bold">25%</span>
              <span className="text-gray-700 text-center">Average Discount</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <span className="text-green-600 text-3xl font-bold">500+</span>
              <span className="text-gray-700 text-center">Active Deals</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-3xl font-bold">150+</span>
              <span className="text-gray-700 text-center">Partner Stores</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
              <span className="text-amber-600 text-3xl font-bold">50K+</span>
              <span className="text-gray-700 text-center">Happy Users</span>
            </div>
          </div>
        </div>
      </div>

      <FeaturedDeals
        deals={FEATURED_DEALS}
      />

      <div className="bg-white py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="mt-10 lg:mt-0">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Never Miss a Deal
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Set up personalized deal alerts based on your favorite stores and categories.
                We'll notify you when new deals match your preferences.
              </p>
              <div className="mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/alerts/new"
                    className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                  >
                    Create Deal Alert
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative lg:ml-10">
                <blockquote className="mt-8">
                  <div className="max-w-3xl mx-auto text-center text-xl leading-9 font-medium text-gray-900">
                    <p>
                      "Thanks to DealsHub deal alerts, I saved over $200 on my new laptop.
                      I set up an alert and got notified as soon as the price dropped!"
                    </p>
                  </div>
                  <footer className="mt-8">
                    <div className="md:flex md:items-center md:justify-center">
                      <div className="mt-3 text-center md:mt-0 md:flex md:items-center">
                        <div className="text-base font-medium text-gray-900">Sarah Johnson</div>
                        <svg className="hidden md:block mx-1 h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 0h3L9 20H6l5-20z" />
                        </svg>
                        <div className="text-base font-medium text-gray-500">DealsHub Member</div>
                      </div>
                    </div>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PopularStores
        stores={POPULAR_STORES}
      />

      <div className="py-12 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Popular Categories
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Browse deals by category to find exactly what you're looking for.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            <Link href="/category/electronics" className="group">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">Electronics</h3>
                  <p className="mt-1 text-sm text-gray-500">86 deals</p>
                </div>
              </div>
            </Link>

            <Link href="/category/fashion" className="group">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-600 group-hover:text-pink-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">Fashion</h3>
                  <p className="mt-1 text-sm text-gray-500">74 deals</p>
                </div>
              </div>
            </Link>

            <Link href="/category/home-kitchen" className="group">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-600 group-hover:text-emerald-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">Home & Kitchen</h3>
                  <p className="mt-1 text-sm text-gray-500">61 deals</p>
                </div>
              </div>
            </Link>

            <Link href="/category/beauty" className="group">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-600 group-hover:text-purple-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">Beauty</h3>
                  <p className="mt-1 text-sm text-gray-500">52 deals</p>
                </div>
              </div>
            </Link>

            <Link href="/category/travel" className="group">
              <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 flex items-center justify-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-600 group-hover:text-amber-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary transition-colors">Travel</h3>
                  <p className="mt-1 text-sm text-gray-500">42 deals</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
            >
              View All Categories
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <NewsletterSignup />
    </>
  );
}
