'use client';

import React, { useState, useEffect, useRef } from 'react';
import StoreCard from '@/components/stores/StoreCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  HeartIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

// Demo data for stores
const ALL_STORES = [
  {
    id: '1',
    name: 'Amazon',
    description: 'Shop millions of products with fast shipping and daily deals.',
    logoUrl: '/images/stores/amazon.png',
    websiteUrl: 'https://amazon.com',
    activeDeals: 86,
    slug: 'amazon',
    isFeatured: true,
    categories: ['electronics', 'home', 'fashion', 'books', 'beauty'],
  },
  {
    id: '2',
    name: 'Walmart',
    description: 'Save Money. Live Better. Low prices on home goods, electronics, and more.',
    logoUrl: '/images/stores/walmart.png',
    websiteUrl: 'https://walmart.com',
    activeDeals: 64,
    slug: 'walmart',
    isFeatured: true,
    categories: ['grocery', 'home', 'fashion', 'electronics'],
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
    categories: ['home', 'fashion', 'beauty', 'grocery'],
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
    categories: ['electronics', 'appliances', 'computers'],
  },
  {
    id: '5',
    name: 'Home Depot',
    description: 'More saving. More doing. Quality home improvement products at low prices.',
    logoUrl: '/images/stores/home-depot.png',
    websiteUrl: 'https://homedepot.com',
    activeDeals: 37,
    slug: 'home-depot',
    isFeatured: false,
    categories: ['home', 'garden', 'tools', 'appliances'],
  },
  {
    id: '6',
    name: 'Macy\'s',
    description: 'Shop fashion, home, beauty, and more with big savings at America\'s favorite store.',
    logoUrl: '/images/stores/macys.png',
    websiteUrl: 'https://macys.com',
    activeDeals: 31,
    slug: 'macys',
    isFeatured: false,
    categories: ['fashion', 'beauty', 'home'],
  },
  {
    id: '7',
    name: 'Kohl\'s',
    description: 'Shop clothing, home, and more plus earn Kohl\'s Cash and amazing deals.',
    logoUrl: '/images/stores/best-buy.png', // Reusing for demo
    websiteUrl: 'https://kohls.com',
    activeDeals: 28,
    slug: 'kohls',
    isFeatured: false,
    categories: ['fashion', 'home', 'beauty'],
  },
  {
    id: '8',
    name: 'Costco',
    description: 'Wholesale prices on thousands of top brands. Member-only deals and savings.',
    logoUrl: '/images/stores/walmart.png', // Reusing for demo
    websiteUrl: 'https://costco.com',
    activeDeals: 24,
    slug: 'costco',
    isFeatured: false,
    categories: ['grocery', 'electronics', 'home', 'health'],
  },
  {
    id: '9',
    name: 'Lowe\'s',
    description: 'Do it right for less. Find deals on everything for your home improvement projects.',
    logoUrl: '/images/stores/home-depot.png', // Reusing for demo
    websiteUrl: 'https://lowes.com',
    activeDeals: 21,
    slug: 'lowes',
    isFeatured: false,
    categories: ['home', 'garden', 'tools'],
  },
  {
    id: '10',
    name: 'Bed Bath & Beyond',
    description: 'Get discounts on home decor, kitchen essentials, and organization solutions.',
    logoUrl: '/images/stores/macys.png', // Reusing for demo
    websiteUrl: 'https://bedbathandbeyond.com',
    activeDeals: 18,
    slug: 'bed-bath-beyond',
    isFeatured: false,
    categories: ['home', 'kitchen', 'bath'],
  },
  {
    id: '11',
    name: 'Staples',
    description: 'Shop office supplies, furniture, technology, and more at discounted prices.',
    logoUrl: '/images/stores/target.png', // Reusing for demo
    websiteUrl: 'https://staples.com',
    activeDeals: 15,
    slug: 'staples',
    isFeatured: false,
    categories: ['office', 'electronics', 'computers'],
  },
  {
    id: '12',
    name: 'Petco',
    description: 'Find deals on pet food, supplies, and services for all your animal friends.',
    logoUrl: '/images/stores/best-buy.png', // Reusing for demo
    websiteUrl: 'https://petco.com',
    activeDeals: 14,
    slug: 'petco',
    isFeatured: false,
    categories: ['pets'],
  },
];

// Store categories for filtering
const STORE_CATEGORIES = [
  { id: 'all', name: 'All Stores' },
  { id: 'electronics', name: 'Electronics & Tech', count: 7 },
  { id: 'fashion', name: 'Fashion & Clothing', count: 6 },
  { id: 'home', name: 'Home & Garden', count: 8 },
  { id: 'beauty', name: 'Health & Beauty', count: 5 },
  { id: 'grocery', name: 'Grocery & Food', count: 4 },
  { id: 'computers', name: 'Computers', count: 3 },
  { id: 'appliances', name: 'Appliances', count: 3 },
  { id: 'tools', name: 'Tools & DIY', count: 3 },
  { id: 'pets', name: 'Pet Supplies', count: 2 },
  { id: 'office', name: 'Office Supplies', count: 1 },
  { id: 'kitchen', name: 'Kitchen', count: 2 },
  { id: 'books', name: 'Books & Media', count: 2 },
];

// Deal count ranges
const DEAL_COUNT_RANGES = [
  { id: 'all', name: 'Any number of deals' },
  { id: '50-plus', name: '50+ deals' },
  { id: '20-plus', name: '20+ deals' },
  { id: '10-plus', name: '10+ deals' },
];

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDealCount, setSelectedDealCount] = useState('all');
  const [selectedLetterFilter, setSelectedLetterFilter] = useState<string | null>(null);
  const [filteredStores, setFilteredStores] = useState(ALL_STORES);
  const [sortOption, setSortOption] = useState('name');
  const [isLoading, setIsLoading] = useState(true);
  const [followedStores, setFollowedStores] = useState<string[]>([]);
  const [showOnlyFollowed, setShowOnlyFollowed] = useState(false);
  const [visibleStores, setVisibleStores] = useState(8); // Initial number of stores to show

  // Refs for scroll behavior
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Mock loading state to simulate data fetching
  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Toggle store follow status
  const toggleFollowStore = (storeId: string) => {
    setFollowedStores(prev => {
      if (prev.includes(storeId)) {
        toast.success('Store removed from your followed stores');
        return prev.filter(id => id !== storeId);
      } else {
        toast.success('Store added to your followed stores');
        return [...prev, storeId];
      }
    });
  };

  // Load more stores
  const loadMoreStores = () => {
    setVisibleStores(prev => Math.min(prev + 8, filteredStores.length));
  };

  // Effect to filter and sort stores
  useEffect(() => {
    simulateLoading();

    let filtered = [...ALL_STORES];

    // Apply followed stores filter
    if (showOnlyFollowed) {
      filtered = filtered.filter((store) => followedStores.includes(store.id));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((store) =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((store) =>
        store.categories && store.categories.includes(selectedCategory)
      );
    }

    // Apply deal count filter
    if (selectedDealCount !== 'all') {
      filtered = filtered.filter((store) => {
        const dealCount = store.activeDeals || 0;
        switch (selectedDealCount) {
          case '50-plus':
            return dealCount >= 50;
          case '20-plus':
            return dealCount >= 20;
          case '10-plus':
            return dealCount >= 10;
          default:
            return true;
        }
      });
    }

    // Apply letter filter
    if (selectedLetterFilter) {
      filtered = filtered.filter((store) =>
        store.name.charAt(0).toUpperCase() === selectedLetterFilter
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'deals':
        filtered.sort((a, b) => b.activeDeals - a.activeDeals);
        break;
      case 'featured':
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
        break;
      case 'followed':
        filtered.sort((a, b) => {
          const aFollowed = followedStores.includes(a.id);
          const bFollowed = followedStores.includes(b.id);
          if (aFollowed && !bFollowed) return -1;
          if (!aFollowed && bFollowed) return 1;
          return 0;
        });
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredStores(filtered);
    // Reset visible stores count when filters change
    setVisibleStores(8);
  }, [searchQuery, selectedCategory, selectedDealCount, selectedLetterFilter, sortOption, followedStores, showOnlyFollowed]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search query is already set via the input field
    // The useEffect will handle the filtering
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDealCount('all');
    setSelectedLetterFilter(null);
    setShowOnlyFollowed(false);
    setSortOption('name');
    toast.success('All filters have been reset');
  };

  // Function to get the first letter of each store name for the alphabetical index
  const getAlphabetIndex = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const storeLetters = Array.from(new Set(filteredStores.map(store => store.name.charAt(0).toUpperCase())));

    return alphabet.map(letter => ({
      letter,
      active: storeLetters.includes(letter),
    }));
  };

  // Scroll to the section with the given letter
  const scrollToLetter = (letter: string) => {
    const element = letterRefs.current[letter];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSelectedLetterFilter(letter);
    }
  };

  // Group stores by first letter
  const groupStoresByLetter = () => {
    const grouped: Record<string, typeof ALL_STORES> = {};

    // Only group the stores that are visible based on the visibleStores state
    const visibleFilteredStores = filteredStores.slice(0, visibleStores);

    visibleFilteredStores.forEach(store => {
      const letter = store.name.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(store);
    });

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const alphabetIndex = getAlphabetIndex();
  const groupedStores = groupStoresByLetter();

  // Count active filters
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedDealCount !== 'all',
    selectedLetterFilter !== null,
    showOnlyFollowed,
    searchQuery !== '',
  ].filter(Boolean).length;

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-black py-8">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Store Directory</h1>
          <p className="mt-2 text-lg text-gray-300">Find coupons and deals from all your favorite retailers in one place</p>

          {/* Search bar in hero section */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search stores by name..."
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
        {/* Filters and sorting */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium">Filter by:</span>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {STORE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} {category.count && category.id !== 'all' ? `(${category.count})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Deal count filter */}
              <Select value={selectedDealCount} onValueChange={setSelectedDealCount}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Deal count" />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_COUNT_RANGES.map((range) => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Followed stores toggle */}
              <Button
                variant={showOnlyFollowed ? "default" : "outline"}
                size="sm"
                className="flex items-center"
                onClick={() => setShowOnlyFollowed(!showOnlyFollowed)}
              >
                {showOnlyFollowed ? (
                  <HeartIconSolid className="h-4 w-4 mr-2 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 mr-2" />
                )}
                Followed Stores
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Store Name (A-Z)</SelectItem>
                  <SelectItem value="deals">Most Deals</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                  <SelectItem value="followed">Followed First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  Category: {STORE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setSelectedCategory('all')}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {selectedDealCount !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  Deals: {DEAL_COUNT_RANGES.find(r => r.id === selectedDealCount)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setSelectedDealCount('all')}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {selectedLetterFilter && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  Starts with: {selectedLetterFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setSelectedLetterFilter(null)}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {showOnlyFollowed && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  Showing: Followed Stores
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setShowOnlyFollowed(false)}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                  Search: "{searchQuery}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setSearchQuery('')}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button variant="ghost" size="sm" className="text-primary" onClick={resetFilters}>
                Reset All
              </Button>
            </div>
          )}
        </div>

        {/* Featured stores section */}
        {!selectedLetterFilter && !showOnlyFollowed && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-yellow-400 w-2 h-8 rounded mr-2"></span>
              Featured Stores
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <div className="p-4 flex items-center justify-center border-b">
                      <Skeleton className="h-20 w-32" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                      <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                      <Skeleton className="h-4 w-5/6 mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                    </CardContent>
                    <div className="p-4 pt-0 flex justify-between gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredStores
                  .filter(store => store.isFeatured)
                  .slice(0, 4)
                  .map(store => (
                    <div key={store.id} className="relative group">
                      <StoreCard {...store} />

                      {/* Follow button overlay */}
                      <button
                        className={`absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md
                          ${followedStores.includes(store.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        onClick={() => toggleFollowStore(store.id)}
                        aria-label={followedStores.includes(store.id) ? "Unfollow store" : "Follow store"}
                      >
                        {followedStores.includes(store.id) ? (
                          <HeartIconSolid className="h-5 w-5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-5 w-5 text-gray-700" />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Alphabet index */}
        <div className="sticky top-16 bg-white z-10 py-3 border-b border-t">
          <div className="flex flex-wrap justify-center gap-1">
            {alphabetIndex.map(({ letter, active }) => (
              <Button
                key={letter}
                variant={selectedLetterFilter === letter ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-8 h-8 p-0",
                  active ? "hover:bg-gray-100" : "text-gray-400 cursor-not-allowed"
                )}
                disabled={!active}
                onClick={() => active && scrollToLetter(letter)}
              >
                {letter}
              </Button>
            ))}

            {selectedLetterFilter && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-xs"
                onClick={() => setSelectedLetterFilter(null)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i}>
                  <div className="p-4 flex items-center justify-center border-b">
                    <Skeleton className="h-20 w-32" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-5/6 mx-auto mb-2" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                  </CardContent>
                  <div className="p-4 pt-0 flex justify-between gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6">
            {filteredStores.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or category filter.</p>
                <Button
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Alphabetical stores list */}
                <div className="space-y-12">
                  {groupedStores.map(([letter, stores]) => (
                    <div
                      key={letter}
                      id={`letter-${letter}`}
                      className="scroll-mt-24"
                      ref={el => letterRefs.current[letter] = el}
                    >
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          {letter}
                        </span>
                        <span>{letter}</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {stores.map(store => (
                          <div key={store.id} className="relative group">
                            <StoreCard
                              {...store}
                            />

                            {/* Follow button overlay */}
                            <button
                              className={`absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-md
                                transition-all duration-300 hover:bg-white
                                ${followedStores.includes(store.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                              onClick={() => toggleFollowStore(store.id)}
                              aria-label={followedStores.includes(store.id) ? "Unfollow store" : "Follow store"}
                            >
                              {followedStores.includes(store.id) ? (
                                <HeartIconSolid className="h-5 w-5 text-red-500" />
                              ) : (
                                <HeartIcon className="h-5 w-5 text-gray-700" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load more button */}
                {visibleStores < filteredStores.length && (
                  <div className="flex justify-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMoreStores}
                      className="flex items-center gap-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Load More Stores
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Promo section */}
        <div className="mt-12 mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Looking for exclusive deals?</h2>
              <p className="mb-6">Sign up for our newsletter to receive weekly updates on the best deals from your favorite stores.</p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <Input
                  placeholder="Enter your email"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
                <Button className="bg-white text-blue-700 hover:bg-white/90">
                  Subscribe
                </Button>
              </form>
            </div>
            <div className="md:w-1/3 relative">
              <div className="absolute inset-0 bg-indigo-200 opacity-20 z-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {ALL_STORES.slice(0, 4).map(store => (
                    <div key={store.id} className="bg-white p-2 rounded-lg">
                      <div className="relative h-12 w-20">
                        <Image
                          src={store.logoUrl}
                          alt={store.name}
                          fill
                          sizes="80px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
