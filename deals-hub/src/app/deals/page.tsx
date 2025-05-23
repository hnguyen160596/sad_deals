'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DealCard from '@/components/deals/DealCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Checkbox
} from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  CalendarIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDoubleDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { toast } from 'sonner';

// Demo data for deals (in a real application, this would come from an API)
const DEMO_DEALS = [
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
    dealType: 'deal',
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
    dealType: 'price_drop',
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
    dealType: 'coupon',
    couponCode: 'SAVE25NOW',
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
    dealType: 'deal',
  },
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
    dealType: 'deal',
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
    dealType: 'coupon',
    couponCode: 'COFFEE50',
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
    dealType: 'price_drop',
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
    dealType: 'deal',
  },
];

// Demo data for categories
const CATEGORIES = [
  { id: 'all', name: 'All Deals' },
  { id: 'electronics', name: 'Electronics', count: 124 },
  { id: 'home-kitchen', name: 'Home & Kitchen', count: 87 },
  { id: 'fashion', name: 'Fashion', count: 76 },
  { id: 'beauty', name: 'Beauty', count: 64 },
  { id: 'toys', name: 'Toys & Games', count: 52 },
  { id: 'sports', name: 'Sports & Outdoors', count: 45 },
  { id: 'books', name: 'Books & Media', count: 38 },
  { id: 'health', name: 'Health & Personal Care', count: 31 },
  { id: 'automotive', name: 'Automotive', count: 27 },
  { id: 'pets', name: 'Pet Supplies', count: 23 },
];

// Demo data for stores
const STORES = [
  { id: 'all', name: 'All Stores' },
  { id: 'amazon', name: 'Amazon', count: 86, logoUrl: '/images/stores/amazon.png' },
  { id: 'walmart', name: 'Walmart', count: 64, logoUrl: '/images/stores/walmart.png' },
  { id: 'target', name: 'Target', count: 48, logoUrl: '/images/stores/target.png' },
  { id: 'best-buy', name: 'Best Buy', count: 42, logoUrl: '/images/stores/best-buy.png' },
  { id: 'home-depot', name: 'Home Depot', count: 37, logoUrl: '/images/stores/home-depot.png' },
  { id: 'macys', name: 'Macy\'s', count: 31, logoUrl: '/images/stores/macys.png' },
  { id: 'kohls', name: 'Kohl\'s', count: 28 },
  { id: 'costco', name: 'Costco', count: 24 },
  { id: 'lowes', name: 'Lowe\'s', count: 21 },
  { id: 'bed-bath-beyond', name: 'Bed Bath & Beyond', count: 18 },
];

// Price range filters
const PRICE_RANGES = [
  { id: 'all', name: 'All Prices' },
  { id: 'under-25', name: 'Under $25' },
  { id: '25-50', name: '$25 to $50' },
  { id: '50-100', name: '$50 to $100' },
  { id: '100-200', name: '$100 to $200' },
  { id: 'over-200', name: 'Over $200' },
];

// Discount filters
const DISCOUNT_RANGES = [
  { id: 'all', name: 'All Discounts' },
  { id: '10-plus', name: '10% or more' },
  { id: '20-plus', name: '20% or more' },
  { id: '30-plus', name: '30% or more' },
  { id: '40-plus', name: '40% or more' },
  { id: '50-plus', name: '50% or more' },
];

// Deal type filters
const DEAL_TYPES = [
  { id: 'all', name: 'All Types' },
  { id: 'deal', name: 'Deals' },
  { id: 'coupon', name: 'Coupons' },
  { id: 'price_drop', name: 'Price Drops' },
];

// Date range filters
const DATE_RANGES = [
  { id: 'all', name: 'All Time' },
  { id: 'today', name: 'Today' },
  { id: 'this-week', name: 'This Week' },
  { id: 'this-month', name: 'This Month' },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'discount', name: 'Biggest Discount' },
  { id: 'popular', name: 'Most Popular' },
];

// Saved searches demo data
const DEMO_SAVED_SEARCHES = [
  { id: '1', name: 'Electronics Deals', filters: { category: 'electronics', priceRange: 'all', discountRange: '20-plus' } },
  { id: '2', name: 'Amazon Coupons', filters: { store: 'amazon', dealType: 'coupon' } },
  { id: '3', name: 'Kitchen Appliances', filters: { category: 'home-kitchen', priceRange: 'over-200' } },
];

export default function DealsPage() {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedDiscountRange, setSelectedDiscountRange] = useState('all');
  const [selectedDealType, setSelectedDealType] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // State for saved searches and favorites
  const [savedSearches, setSavedSearches] = useState(DEMO_SAVED_SEARCHES);
  const [savedDeals, setSavedDeals] = useState<string[]>([]);

  // State for UI controls
  const [filteredDeals, setFilteredDeals] = useState(DEMO_DEALS);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleDeals, setVisibleDeals] = useState(4); // Initial number of deals to show
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Observer for infinite scrolling
  const observerTarget = useRef(null);

  // Function to toggle saved deal status
  const toggleSavedDeal = (dealId: string) => {
    setSavedDeals(prev => {
      if (prev.includes(dealId)) {
        toast.success('Deal removed from saved items');
        return prev.filter(id => id !== dealId);
      } else {
        toast.success('Deal saved to your favorites');
        return [...prev, dealId];
      }
    });
  };

  // Function to load more deals (for infinite scroll)
  const loadMoreDeals = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    // Simulate API delay
    setTimeout(() => {
      setVisibleDeals(prev => {
        const newValue = prev + 4;
        // Check if we've reached the end of our filtered deals
        if (newValue >= filteredDeals.length) {
          setHasMore(false);
        }
        return newValue;
      });

      setLoadingMore(false);
    }, 800);
  }, [filteredDeals.length, hasMore, loadingMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreDeals();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMoreDeals]);

  // Save current search as a preset
  const saveCurrentSearch = () => {
    const newSavedSearch = {
      id: Date.now().toString(),
      name: `Search ${savedSearches.length + 1}`,
      filters: {
        category: selectedCategory,
        store: selectedStore,
        priceRange: selectedPriceRange,
        discountRange: selectedDiscountRange,
        dealType: selectedDealType,
        dateRange: selectedDateRange
      }
    };

    setSavedSearches(prev => [...prev, newSavedSearch]);
    toast.success('Search saved successfully');
  };

  // Apply a saved search
  const applySavedSearch = (search: typeof DEMO_SAVED_SEARCHES[0]) => {
    const { filters } = search;

    setSelectedCategory(filters.category || 'all');
    setSelectedStore(filters.store || 'all');
    setSelectedPriceRange(filters.priceRange || 'all');
    setSelectedDiscountRange(filters.discountRange || 'all');
    setSelectedDealType(filters.dealType || 'all');
    setSelectedDateRange(filters.dateRange || 'all');

    toast.success(`Applied saved search: ${search.name}`);
  };

  // Effect to filter and sort deals
  useEffect(() => {
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let filtered = [...DEMO_DEALS];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter((deal) =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.storeName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply tab filter
      if (activeTab === 'all') {
        // All deals, no additional filtering needed
      } else if (activeTab === 'expiring') {
        filtered = filtered.filter((deal) => deal.expiresAt && new Date(deal.expiresAt).getTime() - new Date().getTime() < 86400000 * 3); // 3 days
      } else if (activeTab === 'saved') {
        filtered = filtered.filter((deal) => savedDeals.includes(deal.id));
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        // In a real app, this would filter based on category IDs from the database
        // For demo, we'll just pretend all deals match the selected category except some
        if (['electronics', 'sports', 'automotive'].includes(selectedCategory)) {
          filtered = filtered.filter((deal, index) => index % 2 === 0);
        } else if (['home-kitchen', 'beauty', 'books'].includes(selectedCategory)) {
          filtered = filtered.filter((deal, index) => index % 2 === 1);
        }
      }

      // Apply store filter
      if (selectedStore !== 'all') {
        filtered = filtered.filter((deal) => {
          const storeId = deal.storeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return storeId === selectedStore;
        });
      }

      // Apply price range filter
      if (selectedPriceRange !== 'all') {
        filtered = filtered.filter((deal) => {
          const price = parseFloat(deal.price.replace(/[^0-9.]/g, ''));
          switch (selectedPriceRange) {
            case 'under-25':
              return price < 25;
            case '25-50':
              return price >= 25 && price <= 50;
            case '50-100':
              return price > 50 && price <= 100;
            case '100-200':
              return price > 100 && price <= 200;
            case 'over-200':
              return price > 200;
            default:
              return true;
          }
        });
      }

      // Apply discount filter
      if (selectedDiscountRange !== 'all') {
        filtered = filtered.filter((deal) => {
          const discount = deal.discountPercentage || 0;
          switch (selectedDiscountRange) {
            case '10-plus':
              return discount >= 10;
            case '20-plus':
              return discount >= 20;
            case '30-plus':
              return discount >= 30;
            case '40-plus':
              return discount >= 40;
            case '50-plus':
              return discount >= 50;
            default:
              return true;
          }
        });
      }

      // Apply deal type filter
      if (selectedDealType !== 'all') {
        filtered = filtered.filter((deal) => deal.dealType === selectedDealType);
      }

      // Apply date range filter
      if (selectedDateRange !== 'all') {
        const now = new Date();
        filtered = filtered.filter((deal) => {
          const dealDate = new Date(deal.createdAt);

          switch (selectedDateRange) {
            case 'today':
              return dealDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0);
            case 'this-week': {
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0, 0, 0, 0);
              return dealDate >= startOfWeek;
            }
            case 'this-month': {
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              return dealDate >= startOfMonth;
            }
            default:
              return true;
          }
        });
      }

      // Apply sorting
      switch (sortOption) {
        case 'price-low':
          filtered.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceA - priceB;
          });
          break;
        case 'price-high':
          filtered.sort((a, b) => {
            const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
            const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
            return priceB - priceA;
          });
          break;
        case 'discount':
          filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
          break;
        case 'popular':
          // For demo, we'll just randomize
          filtered.sort(() => Math.random() - 0.5);
          break;
        case 'newest':
        default:
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      setFilteredDeals(filtered);
      setVisibleDeals(4); // Reset to initial count
      setHasMore(filtered.length > 4); // Check if there are more deals to load
      setIsLoading(false);
    }, 500); // Short delay to simulate API call
  }, [
    searchQuery,
    activeTab,
    selectedCategory,
    selectedStore,
    selectedPriceRange,
    selectedDiscountRange,
    selectedDealType,
    selectedDateRange,
    sortOption,
    savedDeals
  ]);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search query is already set via the input field
    // The useEffect will handle the filtering
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStore('all');
    setSelectedPriceRange('all');
    setSelectedDiscountRange('all');
    setSelectedDealType('all');
    setSelectedDateRange('all');
    toast.success('All filters have been reset');
  };

  // Count active filters
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedStore !== 'all',
    selectedPriceRange !== 'all',
    selectedDiscountRange !== 'all',
    selectedDealType !== 'all',
    selectedDateRange !== 'all',
  ].filter(Boolean).length;

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-black py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Browse Deals</h1>
          <p className="mt-2 text-lg text-gray-300">Discover the best discounts and offers from top retailers</p>

          {/* Search bar in hero section */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for deals, products, or stores..."
                className="pl-10 bg-white/10 border-gray-700 text-white placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Search</Button>
          </form>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters (desktop) */}
          <div className="hidden lg:block w-64 space-y-6">
            {/* Saved searches */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Saved Searches</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Save current search"
                    onClick={saveCurrentSearch}
                  >
                    <StarIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {savedSearches.map((search) => (
                    <Button
                      key={search.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => applySavedSearch(search)}
                    >
                      <StarIconSolid className="h-3 w-3 mr-2 text-yellow-500" />
                      {search.name}
                    </Button>
                  ))}
                  {savedSearches.length === 0 && (
                    <p className="text-xs text-gray-500">Save your searches for quick access later</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories accordion */}
            <Accordion type="multiple" defaultValue={["categories"]} className="w-full">
              <AccordionItem value="categories">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Categories
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {CATEGORIES.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <Button
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start px-2 text-sm"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                        {category.id !== 'all' && (
                          <span className="text-xs text-gray-500">{category.count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Stores accordion with logos */}
            <Accordion type="multiple" defaultValue={["stores"]} className="w-full">
              <AccordionItem value="stores">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Stores
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {STORES.map((store) => (
                      <div key={store.id} className="flex items-center justify-between">
                        <Button
                          variant={selectedStore === store.id ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start px-2 text-sm"
                          onClick={() => setSelectedStore(store.id)}
                        >
                          {store.logoUrl && (
                            <span className="w-5 h-5 relative mr-2">
                              <img
                                src={store.logoUrl}
                                alt={store.name}
                                className="w-full h-full object-contain"
                              />
                            </span>
                          )}
                          {store.name}
                        </Button>
                        {store.id !== 'all' && (
                          <span className="text-xs text-gray-500">{store.count}</span>
                        )}
                      </div>
                    ))}
                    {STORES.length > 10 && (
                      <Link
                        href="/stores"
                        className="text-sm text-primary hover:underline block text-center mt-2"
                      >
                        View All Stores
                      </Link>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Price range accordion */}
            <Accordion type="multiple" defaultValue={["price"]} className="w-full">
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Price Range
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range) => (
                      <Button
                        key={range.id}
                        variant={selectedPriceRange === range.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start px-2 text-sm"
                        onClick={() => setSelectedPriceRange(range.id)}
                      >
                        {range.name}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Discount accordion */}
            <Accordion type="multiple" defaultValue={["discount"]} className="w-full">
              <AccordionItem value="discount">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Discount
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2">
                    {DISCOUNT_RANGES.map((range) => (
                      <Button
                        key={range.id}
                        variant={selectedDiscountRange === range.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start px-2 text-sm"
                        onClick={() => setSelectedDiscountRange(range.id)}
                      >
                        {range.name}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Deal Type accordion */}
            <Accordion type="multiple" defaultValue={["deal-type"]} className="w-full">
              <AccordionItem value="deal-type">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Deal Type
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2">
                    {DEAL_TYPES.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedDealType === type.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start px-2 text-sm"
                        onClick={() => setSelectedDealType(type.id)}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Date Range accordion */}
            <Accordion type="multiple" defaultValue={["date-range"]} className="w-full">
              <AccordionItem value="date-range">
                <AccordionTrigger className="py-3 px-4 hover:no-underline bg-gray-50 rounded-t-md font-medium">
                  Date Posted
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-md p-2">
                  <div className="space-y-2">
                    {DATE_RANGES.map((range) => (
                      <Button
                        key={range.id}
                        variant={selectedDateRange === range.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start px-2 text-sm"
                        onClick={() => setSelectedDateRange(range.id)}
                      >
                        {range.name}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Reset filters button */}
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center"
                onClick={resetAllFilters}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reset All Filters
              </Button>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Tabs and sort controls */}
            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFilters}
                    className={`lg:hidden flex items-center ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`}
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>

                  <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                      <TabsTrigger value="all">All Deals</TabsTrigger>
                      <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                      <TabsTrigger value="saved">Saved Deals</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort:</span>
                  <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile filters (collapsed by default) */}
              {showFilters && (
                <div className="lg:hidden space-y-4 bg-gray-50 p-4 rounded-md border">
                  {/* Saved searches */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-sm">Saved Searches</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Save current search"
                        onClick={saveCurrentSearch}
                      >
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {savedSearches.map((search) => (
                        <Button
                          key={search.id}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => applySavedSearch(search)}
                        >
                          <StarIconSolid className="h-3 w-3 mr-1 text-yellow-500" />
                          {search.name}
                        </Button>
                      ))}
                      {savedSearches.length === 0 && (
                        <p className="text-xs text-gray-500">Save your current filters</p>
                      )}
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {CATEGORIES.slice(0, 6).map((category) => (
                            <Button
                              key={category.id}
                              variant={selectedCategory === category.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              {category.name}
                            </Button>
                          ))}
                          {CATEGORIES.length > 6 && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/categories">
                                More...
                              </Link>
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="stores">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Stores
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {STORES.slice(0, 5).map((store) => (
                            <Button
                              key={store.id}
                              variant={selectedStore === store.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedStore(store.id)}
                            >
                              {store.name}
                            </Button>
                          ))}
                          {STORES.length > 5 && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/stores">
                                More...
                              </Link>
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Price Range
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {PRICE_RANGES.map((range) => (
                            <Button
                              key={range.id}
                              variant={selectedPriceRange === range.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedPriceRange(range.id)}
                            >
                              {range.name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="discount">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Discount
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {DISCOUNT_RANGES.map((range) => (
                            <Button
                              key={range.id}
                              variant={selectedDiscountRange === range.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedDiscountRange(range.id)}
                            >
                              {range.name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dealType">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Deal Type
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {DEAL_TYPES.map((type) => (
                            <Button
                              key={type.id}
                              variant={selectedDealType === type.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedDealType(type.id)}
                            >
                              {type.name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dateRange">
                      <AccordionTrigger className="py-2 text-sm font-medium">
                        Date Posted
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {DATE_RANGES.map((range) => (
                            <Button
                              key={range.id}
                              variant={selectedDateRange === range.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedDateRange(range.id)}
                            >
                              {range.name}
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="pt-2 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAllFilters}
                    >
                      Reset Filters
                    </Button>
                    <Button size="sm" onClick={toggleFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Active filters chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Category: {CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedCategory('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                {selectedStore !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Store: {STORES.find(s => s.id === selectedStore)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedStore('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                {selectedPriceRange !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Price: {PRICE_RANGES.find(p => p.id === selectedPriceRange)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedPriceRange('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                {selectedDiscountRange !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Discount: {DISCOUNT_RANGES.find(d => d.id === selectedDiscountRange)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedDiscountRange('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                {selectedDealType !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Deal Type: {DEAL_TYPES.find(t => t.id === selectedDealType)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedDealType('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                {selectedDateRange !== 'all' && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center">
                    <span>Date: {DATE_RANGES.find(d => d.id === selectedDateRange)?.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                      onClick={() => setSelectedDateRange('all')}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllFilters}
                  className="text-primary hover:text-primary/80 hover:bg-transparent px-1 h-7"
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Results count and layout options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold">{filteredDeals.length}</span> deals
              </p>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 w-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-5 w-full mb-1" />
                      <Skeleton className="h-5 w-full mb-3" />
                      <Skeleton className="h-6 w-32 mb-3" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDeals.length > 0 ? (
              <>
                {/* Deals grid with visible deals controlled for infinite scroll */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDeals.slice(0, visibleDeals).map((deal) => (
                    <div key={deal.id} className="relative group">
                      <DealCard
                        {...deal}
                      />
                      {/* Save/Bookmark button overlay */}
                      <button
                        className={`absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md
                          transition-all duration-300 hover:bg-white
                          ${savedDeals.includes(deal.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        onClick={() => toggleSavedDeal(deal.id)}
                        aria-label={savedDeals.includes(deal.id) ? "Remove from saved deals" : "Save deal"}
                      >
                        {savedDeals.includes(deal.id) ? (
                          <StarIconSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-gray-700" />
                        )}
                      </button>

                      {/* Deal Type Label */}
                      {deal.dealType === 'coupon' && (
                        <div className="absolute top-12 right-2 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                          COUPON
                        </div>
                      )}
                      {deal.dealType === 'price_drop' && (
                        <div className="absolute top-12 right-2 z-10 bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                          PRICE DROP
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load more / infinite scroll trigger */}
                {filteredDeals.length > visibleDeals && hasMore ? (
                  <div
                    className="mt-10 mb-6 flex justify-center"
                    ref={observerTarget}
                  >
                    <Button
                      variant="outline"
                      className="flex items-center"
                      onClick={loadMoreDeals}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Loading more deals...
                        </>
                      ) : (
                        <>
                          <ChevronDoubleDownIcon className="h-4 w-4 mr-2" />
                          Load more deals
                        </>
                      )}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria.</p>
                <Button
                  onClick={resetAllFilters}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
