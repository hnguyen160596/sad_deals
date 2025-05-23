'use client';

import React from 'react';
import DealCard from '@/components/deals/DealCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoltIcon, CalendarIcon, FireIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Demo data for today's deals
const TODAYS_HOT_DEALS = [
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
    isFeatured: true,
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
    isFeatured: true,
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
    isFeatured: true,
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
    isFeatured: true,
  },
];

const LIGHTNING_DEALS = [
  {
    id: '5',
    title: 'Samsung 65" Class QLED 4K UHD Smart TV',
    price: '$999.99',
    originalPrice: '$1,299.99',
    discountPercentage: 23,
    imageUrl: '/images/deals/sony.jpg', // Reusing image for demo
    storeName: 'Best Buy',
    storeLogoUrl: '/images/stores/best-buy.png',
    dealUrl: 'https://example.com/deal/5',
    slug: 'samsung-65-qled-tv',
    createdAt: '2025-05-18T00:00:00Z',
    expiresAt: '2025-05-23T23:59:59Z', // Expires today
  },
  {
    id: '6',
    title: 'Nespresso Vertuo Next Coffee and Espresso Machine',
    price: '$159.99',
    originalPrice: '$209.99',
    discountPercentage: 24,
    imageUrl: '/images/deals/kitchenaid.jpg', // Reusing image for demo
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/6',
    slug: 'nespresso-vertuo-next',
    createdAt: '2025-05-17T00:00:00Z',
    expiresAt: '2025-05-23T23:59:59Z', // Expires today
  },
];

const UPCOMING_DEALS = [
  {
    id: '7',
    title: 'Apple MacBook Air M3 Chip 13.6" Laptop',
    price: '$1,049.00',
    originalPrice: '$1,299.00',
    discountPercentage: 19,
    imageUrl: '/images/deals/airpods.jpg', // Reusing image for demo
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/7',
    slug: 'apple-macbook-air-m3',
    createdAt: '2025-05-16T00:00:00Z',
    startsAt: '2025-05-24T00:00:00Z', // Starts tomorrow
  },
  {
    id: '8',
    title: 'LG 27" UltraGear QHD Gaming Monitor',
    price: '$249.99',
    originalPrice: '$399.99',
    discountPercentage: 38,
    imageUrl: '/images/deals/dyson.jpg', // Reusing image for demo
    storeName: 'Best Buy',
    storeLogoUrl: '/images/stores/best-buy.png',
    dealUrl: 'https://example.com/deal/8',
    slug: 'lg-27-ultragear-monitor',
    createdAt: '2025-05-15T00:00:00Z',
    startsAt: '2025-05-24T00:00:00Z', // Starts tomorrow
  },
];

export default function TodaysDealsPage() {
  return (
    <>
      <div className="bg-gray-900 py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Today's Deals</h1>
          <p className="mt-2 text-gray-300">Daily curated offers that you don't want to miss</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="hot-deals" className="w-full">
          <div className="border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="hot-deals" className="flex items-center space-x-2">
                <FireIcon className="h-4 w-4" />
                <span>Hot Deals</span>
              </TabsTrigger>
              <TabsTrigger value="lightning-deals" className="flex items-center space-x-2">
                <BoltIcon className="h-4 w-4" />
                <span>Lightning Deals</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming-deals" className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Upcoming Deals</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="hot-deals" className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Today's Hot Deals</h2>
              <p className="text-gray-600">Our hand-picked selection of the best deals today</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TODAYS_HOT_DEALS.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/deals">View All Deals</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="lightning-deals" className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lightning Deals</h2>
              <p className="text-gray-600">Limited-time offers ending soon. Act fast!</p>
            </div>

            <div className="mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-amber-600">
                    <BoltIcon className="h-5 w-5" />
                    <span className="font-bold">These deals expire today at midnight!</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LIGHTNING_DEALS.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/deals">View All Deals</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upcoming-deals" className="pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Deals</h2>
              <p className="text-gray-600">Preview deals that will be available soon</p>
            </div>

            <div className="mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <CalendarIcon className="h-5 w-5" />
                    <span className="font-bold">These deals will be available starting tomorrow!</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {UPCOMING_DEALS.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/deals">View All Deals</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-16 bg-gray-50 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Never Miss a Deal</h2>
            <p className="text-gray-600 mt-2">Get personalized deal alerts delivered right to your inbox</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              By subscribing, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
