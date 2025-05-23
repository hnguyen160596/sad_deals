'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import DealCard from '@/components/deals/DealCard';
import StoreCard from '@/components/stores/StoreCard'; // For similar stores
import Seo from '@/components/common/Seo'; // For structured data
import {
  ExternalLink,
  Clock,
  Copy,
  Check,
  TagIcon,
  Heart,
  Share2,
  Info,
  Bookmark,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  XMarkIcon,
  ChevronRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

// Demo store data (in a real app, this would come from an API based on the slug)
const STORE_DATA = {
  id: '1',
  name: 'Amazon',
  description: 'Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence. It has been often referred to as "one of the most influential economic and cultural forces in the world", and is often regarded as one of the world\'s most valuable brands.',
  logoUrl: '/images/stores/amazon.png',
  websiteUrl: 'https://amazon.com',
  activeDeals: 86,
  slug: 'amazon',
  isFeatured: true,
  about: [
    'Free shipping with Amazon Prime membership',
    'Regular deals and lightning deals throughout the day',
    'Subscribe & Save program for recurring purchases',
    'Amazon Warehouse for open-box and used items at a discount',
    'Amazon Outlet for overstock items and clearance deals',
  ],
  tips: [
    'Check Amazon Gold Box Deals for the best daily discounts',
    'Sign up for Amazon Prime to get exclusive deals and free shipping',
    'Use Amazon Subscribe & Save to get up to 15% off recurring orders',
    'Check prices on CamelCamelCamel.com to see price history',
    'Amazon Warehouse offers open-box items at significant discounts',
  ],
  coupons: [
    {
      id: 'coupon1',
      code: 'SUMMER25',
      description: '25% off select summer items',
      expiresAt: '2025-06-30T23:59:59Z',
      terms: 'Valid on select summer items only. Maximum discount of $50.',
      minimumPurchase: '$100',
    },
    {
      id: 'coupon2',
      code: 'PRIMESAVE10',
      description: '$10 off your next purchase of $50 or more',
      expiresAt: '2025-07-15T23:59:59Z',
      terms: 'Prime members only. One use per account.',
      minimumPurchase: '$50',
    },
    {
      id: 'coupon3',
      code: 'NEWCUST20',
      description: '20% off first purchase for new customers (max discount $50)',
      expiresAt: '2025-12-31T23:59:59Z',
      terms: 'New customers only. Cannot be combined with other offers.',
      minimumPurchase: '$0',
    },
  ],
  // Additional metadata
  foundedYear: 1994,
  headquarters: 'Seattle, Washington, USA',
  categories: ['Electronics', 'Home & Kitchen', 'Books', 'Fashion', 'Grocery'],
  paymentMethods: ['Credit Card', 'Debit Card', 'Gift Card', 'Amazon Pay', 'PayPal'],
  returnPolicy: '30-day return policy on most items',
  shippingInfo: 'Free shipping on orders over $25 or with Prime membership',
  socialMedia: {
    twitter: 'https://twitter.com/amazon',
    facebook: 'https://facebook.com/amazon',
    instagram: 'https://instagram.com/amazon',
  },
  // Events/sales
  upcomingEvents: [
    {
      name: 'Prime Day',
      date: '2025-07-15',
      description: 'Annual sale event with thousands of deals exclusively for Prime members'
    },
    {
      name: 'Black Friday',
      date: '2025-11-28',
      description: 'Biggest sale of the year with massive discounts across all categories'
    }
  ]
};

// Demo deals for this store
const STORE_DEALS = [
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
  },
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
  },
  {
    id: '12',
    title: 'KitchenAid 5-Speed Ultra Power Hand Mixer',
    price: '$49.99',
    originalPrice: '$59.99',
    discountPercentage: 17,
    imageUrl: '/images/deals/kitchenaid.jpg', // Reusing image for demo
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/12',
    slug: 'kitchenaid-hand-mixer',
    createdAt: '2025-05-15T00:00:00Z',
  },
  {
    id: '15',
    title: 'Kindle Paperwhite (16 GB) – Now with a 6.8" display',
    price: '$129.99',
    originalPrice: '$149.99',
    discountPercentage: 13,
    imageUrl: '/images/deals/sony.jpg', // Reusing image for demo
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/15',
    slug: 'kindle-paperwhite',
    createdAt: '2025-05-14T00:00:00Z',
  },
  {
    id: '18',
    title: 'Bose SoundLink Flex Bluetooth Portable Speaker',
    price: '$129.00',
    originalPrice: '$149.00',
    discountPercentage: 13,
    imageUrl: '/images/deals/dyson.jpg', // Reusing image for demo
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/18',
    slug: 'bose-soundlink-flex',
    createdAt: '2025-05-13T00:00:00Z',
  },
];

// Popular categories for this store
const STORE_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', count: 24 },
  { id: 'home-kitchen', name: 'Home & Kitchen', count: 19 },
  { id: 'books', name: 'Books & Media', count: 14 },
  { id: 'fashion', name: 'Fashion', count: 12 },
  { id: 'beauty', name: 'Beauty', count: 8 },
  { id: 'toys', name: 'Toys & Games', count: 7 },
  { id: 'pets', name: 'Pet Supplies', count: 2 },
];

// Similar stores
const SIMILAR_STORES = [
  {
    id: '2',
    name: 'Walmart',
    description: 'Save Money. Live Better. Low prices on home goods, electronics, and more.',
    logoUrl: '/images/stores/walmart.png',
    websiteUrl: 'https://walmart.com',
    activeDeals: 64,
    slug: 'walmart',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Target',
    description: 'Expect More. Pay Less. Find deals on quality products for the whole family.',
    logoUrl: '/images/stores/target.png',
    websiteUrl: 'https://target.com',
    activeDeals: 48,
    slug: 'target',
    isFeatured: false,
  },
  {
    id: '4',
    name: 'Best Buy',
    description: 'Expert service. Unbeatable price. Find deals on the latest tech and appliances.',
    logoUrl: '/images/stores/best-buy.png',
    websiteUrl: 'https://bestbuy.com',
    activeDeals: 42,
    slug: 'best-buy',
    isFeatured: true,
  },
];

export default function StorePage({ params }: { params: { slug: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeals, setFilteredDeals] = useState(STORE_DEALS);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleDeals, setVisibleDeals] = useState(4); // Initial number to show

  // In a real app, we would fetch the store data based on the slug
  // For this demo, we'll use the static data
  const store = STORE_DATA;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredDeals(STORE_DEALS);
      } else {
        const filtered = STORE_DEALS.filter(deal =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredDeals(filtered);
      }

      setIsLoading(false);
    }, 500);
  };

  const handleCopyCoupon = (couponId: string, couponCode: string) => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopiedCouponId(couponId);
      toast.success(`Coupon code ${couponCode} copied to clipboard!`);

      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedCouponId(null);
      }, 3000);
    }).catch(() => {
      toast.error('Failed to copy coupon code');
    });
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success(`You're now following ${store.name}!`);
    } else {
      toast.success(`You've unfollowed ${store.name}`);
    }
  };

  const filterByCategory = (categoryId: string | null) => {
    setActiveCategory(categoryId);

    setIsLoading(true);
    setTimeout(() => {
      if (!categoryId) {
        setFilteredDeals(STORE_DEALS);
      } else {
        // In a real app, you would filter by actual categories
        // For demo, we'll just filter randomly
        const filtered = STORE_DEALS.filter((_, index) => {
          const categoryHash = categoryId.charCodeAt(0);
          return index % (categoryHash % 5 || 1) === 0;
        });
        setFilteredDeals(filtered);
      }
      setIsLoading(false);
    }, 500);
  };

  const loadMoreDeals = () => {
    setVisibleDeals(Math.min(visibleDeals + 3, filteredDeals.length));
  };

  const shareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: `${store.name} - Deals and Coupons`,
        text: `Check out the latest deals and coupons from ${store.name}!`,
        url: window.location.href,
      }).then(() => {
        toast.success('Shared successfully!');
      }).catch((error) => {
        toast.error('Error sharing');
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Store URL copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy URL');
      });
    }
  };

  // Create the structured data for SEO
  const storeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    description: store.description,
    url: store.websiteUrl,
    logo: store.logoUrl.startsWith('http') ? store.logoUrl : `https://example.com${store.logoUrl}`,
    foundingDate: `${store.foundedYear}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: store.headquarters.split(', ')[0],
      addressRegion: store.headquarters.split(', ')[1],
      addressCountry: store.headquarters.split(', ')[2],
    },
    sameAs: [
      store.socialMedia.twitter,
      store.socialMedia.facebook,
      store.socialMedia.instagram,
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://example.com/deals?store=${store.slug}&q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <Seo
        title={`${store.name} Coupons & Deals - Up to 29% Off`}
        description={`Find the latest ${store.name} coupons, promo codes and deals. Save on ${store.categories.join(', ')} and more with verified offers.`}
        structuredData={storeStructuredData}
      />

      {/* Store Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" className="text-white" asChild>
              <Link href="/stores">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Stores
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="relative h-28 w-28 md:h-36 md:w-36">
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  sizes="(max-width: 768px) 112px, 144px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-white mb-2">{store.name}</h1>

                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 hover:text-white"
                    onClick={toggleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <HeartIconSolid className="h-4 w-4 mr-2 text-red-500" />
                        Following
                      </>
                    ) : (
                      <>
                        <HeartIcon className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/20 hover:bg-white/10 hover:text-white"
                    onClick={shareStore}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <p className="text-gray-300 max-w-2xl mb-2">{store.description.split('.')[0]}.</p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                  <TagIcon className="h-3.5 w-3.5 mr-1" />
                  {store.activeDeals} Active Deals
                </Badge>

                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {store.headquarters}
                </Badge>

                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Since {store.foundedYear}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                <Button asChild>
                  <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    Visit Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>

                <Button variant="outline" className="text-white border-white/30 hover:bg-white hover:text-gray-900">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="deals" className="space-y-8">
          <TabsList className="mb-6 w-full justify-start overflow-auto">
            <TabsTrigger value="deals" className="text-base">Deals</TabsTrigger>
            <TabsTrigger value="coupons" className="text-base">Coupons</TabsTrigger>
            <TabsTrigger value="about" className="text-base">About</TabsTrigger>
            <TabsTrigger value="tips" className="text-base">Shopping Tips</TabsTrigger>
            <TabsTrigger value="events" className="text-base">Upcoming Sales</TabsTrigger>
          </TabsList>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Latest {store.name} Deals</h2>
                  <Link
                    href={`/deals?store=${store.slug}`}
                    className="text-primary hover:underline flex items-center"
                  >
                    View All
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="search"
                      placeholder={`Search ${store.name} deals...`}
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>

                {activeCategory && (
                  <div className="flex items-center">
                    <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                      Category: {STORE_CATEGORIES.find(c => c.id === activeCategory)?.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-transparent"
                        onClick={() => filterByCategory(null)}
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="h-48 w-full">
                          <Skeleton className="h-full w-full" />
                        </div>
                        <div className="p-4">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-5 w-full mb-1" />
                          <Skeleton className="h-5 w-full mb-3" />
                          <Skeleton className="h-6 w-32 mb-3" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-2 mt-4">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search criteria.</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory(null);
                        setFilteredDeals(STORE_DEALS);
                      }}
                    >
                      Reset Search
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDeals.slice(0, visibleDeals).map(deal => (
                        <DealCard
                          key={deal.id}
                          {...deal}
                        />
                      ))}
                    </div>

                    {visibleDeals < filteredDeals.length && (
                      <div className="flex justify-center mt-6">
                        <Button
                          variant="outline"
                          onClick={loadMoreDeals}
                        >
                          Load More Deals
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Shop by Category</h3>
                <div className="flex flex-col gap-1.5">
                  {STORE_CATEGORIES.map(category => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? "default" : "ghost"}
                      size="sm"
                      className="justify-between"
                      onClick={() => filterByCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <Card className="bg-gray-50 border-blue-100">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Shopping Information</h4>
                        <p className="text-sm text-blue-800 mt-1">{store.shippingInfo}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <ArrowPathIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <p className="text-sm text-blue-800">{store.returnPolicy}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                    <h3 className="font-semibold">Upcoming Sale!</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {store.upcomingEvents.slice(0, 1).map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center">
                            <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{event.name}</h4>
                            <p className="text-sm text-gray-500">{event.date}</p>
                            <p className="text-sm mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href="#events">
                        View All Events
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-red-500 w-2 h-8 rounded mr-2"></span>
                Current {store.name} Coupons & Promo Codes
              </h2>

              {store.coupons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons available</h3>
                  <p className="text-gray-500">Check back later for new coupons and promo codes.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {store.coupons.map(coupon => (
                    <Card key={coupon.id} className="overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr]">
                        <div className="p-5 border-r border-dashed border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-lg">{coupon.description}</h3>
                              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                                {coupon.minimumPurchase === '$0' ? 'No minimum' : `Min. ${coupon.minimumPurchase}`}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-500">
                              {coupon.terms}
                            </div>

                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <a
                                href={store.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center"
                              >
                                Shop at {store.name}
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>

                              <span className="text-sm text-gray-400">•</span>

                              <button
                                type="button"
                                className="text-sm text-primary hover:underline"
                                onClick={() => handleCopyCoupon(coupon.id, coupon.code)}
                              >
                                {copiedCouponId === coupon.id ? 'Copied!' : 'Copy & use code'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center p-5 bg-gray-50">
                          <div className="font-mono font-bold text-lg mb-2">{coupon.code}</div>
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => handleCopyCoupon(coupon.id, coupon.code)}
                          >
                            {copiedCouponId === coupon.id ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Code
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-10 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use {store.name} coupons</h3>
                <ol className="list-decimal list-inside text-blue-800 space-y-2">
                  <li>Find a coupon code above and click the "Copy Code" button</li>
                  <li>Visit <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer" className="underline">{store.name}</a> and add products to your cart</li>
                  <li>During checkout, look for the promo code or coupon code field</li>
                  <li>Paste your copied code and apply it to your order</li>
                  <li>Enjoy your savings!</li>
                </ol>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Payment Methods Accepted at {store.name}</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {store.paymentMethods.map((method, index) => (
                    <Badge key={index} variant="outline" className="py-1.5 px-3">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About {store.name}</h2>
                  <div className="prose prose-blue max-w-none">
                    <p>{store.description}</p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Shopping at {store.name}</h3>
                    <ul className="space-y-3">
                      {store.about.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Company Information</h3>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Headquarters</dt>
                          <dd className="mt-1 text-base text-gray-900">{store.headquarters}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Founded</dt>
                          <dd className="mt-1 text-base text-gray-900">{store.foundedYear}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Website</dt>
                          <dd className="mt-1 text-base text-gray-900">
                            <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                              {store.websiteUrl.replace(/^https?:\/\//, '')}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Categories</dt>
                          <dd className="mt-1 text-base text-gray-900">{store.categories.join(', ')}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button className="flex-1" asChild>
                      <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                        Visit {store.name} Website
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/deals?store=${store.slug}`}>
                        Browse All {store.name} Deals
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold">Connect with {store.name}</h3>
                      <div className="space-y-3">
                        {Object.entries(store.socialMedia).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-blue-900">Shipping Info</h3>
                      <p className="text-sm text-blue-800">{store.shippingInfo}</p>

                      <h3 className="font-semibold text-blue-900 pt-2">Return Policy</h3>
                      <p className="text-sm text-blue-800">{store.returnPolicy}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Tips for {store.name}</h2>

              <div className="bg-amber-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Save Money at {store.name}</h3>
                <ul className="space-y-4">
                  {store.tips.map((tip, index) => (
                    <li key={index} className="flex">
                      <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">{index + 1}</span>
                      <span className="text-amber-900">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Times to Shop</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Prime Day</h4>
                    <p className="text-sm text-gray-600">Amazon's biggest sale event of the year with exclusive deals for Prime members.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Black Friday & Cyber Monday</h4>
                    <p className="text-sm text-gray-600">Massive discounts across all categories during the holiday shopping season.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Lightning Deals</h4>
                    <p className="text-sm text-gray-600">Limited-time offers that appear throughout the day with significant discounts.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Deal of the Day</h4>
                    <p className="text-sm text-gray-600">Check the "Deal of the Day" section each morning for a new featured discount.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 bg-violet-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-violet-900 mb-4">Insider Tips</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-violet-900">Use Price Tracking Tools</h4>
                      <p className="text-sm text-violet-800 mt-1">Use CamelCamelCamel or Keepa to track price history and get alerts when prices drop on your wishlist items.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-violet-900">Subscribe & Save</h4>
                      <p className="text-sm text-violet-800 mt-1">Set up recurring deliveries for items you regularly purchase to save up to 15% and get free shipping.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-violet-900">Amazon Credit Card</h4>
                      <p className="text-sm text-violet-800 mt-1">Get 5% cashback on all Amazon purchases if you have a Prime membership and an Amazon credit card.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button size="lg" asChild>
                  <Link href={`/deals?store=${store.slug}`}>
                    Browse All {store.name} Deals
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" id="events">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Sales & Events at {store.name}</h2>

              <div className="space-y-6">
                {store.upcomingEvents.map((event, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-0">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col items-center justify-center text-white">
                        <div className="text-2xl font-bold">
                          {event.date.split('-')[1]}/{event.date.split('-')[2]}
                        </div>
                        <div className="text-sm opacity-90">
                          {new Date(event.date).toLocaleString('default', { month: 'long' })}
                        </div>
                        <div className="text-sm mt-1 opacity-90">
                          {event.date.split('-')[0]}
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold">{event.name}</h3>
                        <p className="mt-2 text-gray-600">{event.description}</p>

                        <div className="mt-4 flex gap-3">
                          <Button variant="outline" size="sm" asChild>
                            <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer">
                              Visit Website
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>

                          <Button size="sm">
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Similar Stores with Upcoming Sales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {SIMILAR_STORES.map(store => (
                    <StoreCard
                      key={store.id}
                      {...store}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
