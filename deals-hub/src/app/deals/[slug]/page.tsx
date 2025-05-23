'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import DealCard from '@/components/deals/DealCard';
import Seo, {
  createProductStructuredData,
  createBreadcrumbStructuredData,
  createFAQStructuredData,
  createOfferStructuredData,
  createReviewStructuredData
} from '@/components/common/Seo';
import {
  Clock,
  Tag,
  ExternalLink,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Bell,
  ShoppingCart,
  Truck,
  CreditCard,
  BadgePercent,
  Heart,
  AlertCircle,
  ChevronRight,
  LineChart,
  BarChart4,
  Scissors,
  Star,
  Store,
  Check,
  ShieldCheck,
  Zap,
  Gift,
  Info,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// Add FAQs data for the deal
const DEAL_FAQS = [
  {
    question: "What makes these headphones different from other models?",
    answer: "The Sony WH-1000XM4 features industry-leading noise cancellation technology, 30-hour battery life, and speak-to-chat functionality that automatically reduces volume during conversations. They also have multipoint connection allowing you to pair with two Bluetooth devices simultaneously."
  },
  {
    question: "Are these headphones compatible with all devices?",
    answer: "Yes, the Sony WH-1000XM4 headphones are compatible with virtually all Bluetooth-enabled devices including Android, iOS, Windows, and macOS. They also come with a 3.5mm audio cable for wired connections to devices without Bluetooth."
  },
  {
    question: "Is this the latest model of Sony noise-cancelling headphones?",
    answer: "The WH-1000XM4 was the flagship model until the release of the WH-1000XM5. However, many users still prefer the XM4 for its foldable design and similar performance at a more affordable price."
  },
  {
    question: "How long does the battery last?",
    answer: "The Sony WH-1000XM4 offers up to 30 hours of battery life with noise cancellation enabled. A quick 10-minute charge provides up to 5 hours of playback time."
  },
  {
    question: "Does this deal include a warranty?",
    answer: "Yes, this deal includes the standard 1-year manufacturer warranty from Sony that covers defects in materials and workmanship."
  }
];

// Demo data for a single deal (in a real app, this would come from an API based on the slug)
const DEAL_DATA = {
  id: '1',
  title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
  description: 'Industry-leading noise cancellation, exceptional sound quality with Dual Noise Sensor technology, up to 30-hour battery life, touch sensor controls, speak-to-chat technology, wearing detection, and seamless multiple-device pairing.',
  price: '$248.00',
  originalPrice: '$349.99',
  discountPercentage: 29,
  imageUrl: '/images/deals/sony.jpg',
  storeName: 'Amazon',
  storeLogoUrl: '/images/stores/amazon.png',
  storeSlug: 'amazon',
  dealUrl: 'https://example.com/deal/1',
  slug: 'sony-wh-1000xm4-headphones',
  createdAt: '2025-05-21T00:00:00Z',
  expiresAt: '2025-05-30T00:00:00Z',
  views: 1824,
  clicks: 542,
  likes: 76,
  comments: [
    {
      id: 'comment1',
      userName: 'AudioEnthusiast',
      content: 'I bought these last month and the noise cancellation is incredible. Great for working from home or traveling.',
      createdAt: '2025-05-22T10:30:00Z',
      likes: 8,
    },
    {
      id: 'comment2',
      userName: 'TechReviewer',
      content: 'Excellent deal! These are regularly $350 so this is a significant discount. Battery life is as advertised - I get about 28-30 hours with ANC on.',
      createdAt: '2025-05-22T14:15:00Z',
      likes: 12,
    },
    {
      id: 'comment3',
      userName: 'BudgetShopper',
      content: 'Just ordered mine! Been waiting for these to go on sale for months.',
      createdAt: '2025-05-23T09:45:00Z',
      likes: 3,
    },
  ],
  highlights: [
    'Industry-leading noise cancellation with Dual Noise Sensor technology',
    'Up to 30-hour battery life with quick charging (5 hours from 10 min charge)',
    'Touch Sensor controls for easy playback, calls, and volume control',
    'Speak-to-chat technology automatically reduces volume during conversations',
    'Wearing detection pauses playback when headphones are removed',
    'Seamless multiple-device pairing',
    'Superior call quality with precise voice pickup',
    'Adaptive Sound Control adjusts ambient sound settings to your environment',
  ],
  specifications: {
    brand: 'Sony',
    model: 'WH-1000XM4',
    color: 'Black',
    connectivity: 'Bluetooth 5.0, 3.5mm audio cable',
    batteryLife: 'Up to 30 hours',
    weight: '8.96 oz',
    features: 'Noise Cancellation, Touch Controls, Voice Assistant Compatible',
    inTheBox: 'Headphones, Carrying Case, USB-C Cable, Audio Cable, Airplane Adapter',
  },
  category: 'Electronics',
  subCategory: 'Headphones',
  sku: 'SONY-WH1000XM4-B',
  ratings: {
    overall: 4.7,
    quality: 4.8,
    value: 4.6,
    comfort: 4.9,
    audio: 4.7,
    batteryLife: 4.5,
  },
  salesRank: '#1 in Headphones',
  warranty: '1-year manufacturer warranty',
  returnPolicy: '30-day return period',
  popularity: 'High',
  priceHistory: [
    { date: '2024-12-01', price: 349.99 },
    { date: '2025-01-15', price: 329.99 },
    { date: '2025-02-10', price: 299.99 },
    { date: '2025-03-20', price: 279.99 },
    { date: '2025-04-15', price: 269.99 },
    { date: '2025-05-01', price: 259.99 },
    { date: '2025-05-21', price: 248.00 },
  ],
  lowestHistoricalPrice: {
    price: '$248.00',
    date: '2025-05-21',
  },
  highestHistoricalPrice: {
    price: '$349.99',
    date: '2024-12-01',
  },
  availableCoupons: [
    {
      code: 'AUDIO10',
      description: 'Take an extra 10% off headphones',
      expires: '2025-06-15',
    },
    {
      code: 'SONY15',
      description: '15% off Sony products with promo code',
      expires: '2025-06-01',
    },
  ],
  relatedProducts: [
    {
      id: 'related1',
      name: 'Sony WF-1000XM4 Wireless Earbuds',
      price: '$199.99',
      imageUrl: '/images/deals/airpods.jpg',
      url: '/deals/sony-wf-1000xm4-earbuds',
    },
    {
      id: 'related2',
      name: 'Sony WH-1000XM4 Carrying Case',
      price: '$29.99',
      imageUrl: '/images/deals/sony.jpg',
      url: '/deals/sony-case',
    },
  ],
};

const SIMILAR_DEALS = [
  {
    id: '2',
    title: 'Bose QuietComfort 45 Bluetooth Wireless Headphones',
    price: '$279.00',
    originalPrice: '$329.00',
    discountPercentage: 15,
    imageUrl: '/images/deals/sony.jpg',
    storeName: 'Best Buy',
    storeLogoUrl: '/images/stores/best-buy.png',
    dealUrl: 'https://example.com/deal/2',
    slug: 'bose-quietcomfort-45',
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
  },
  {
    id: '4',
    title: 'Anker Soundcore Life Q30 Hybrid Active Noise Cancelling Headphones',
    price: '$79.99',
    originalPrice: '$99.99',
    discountPercentage: 20,
    imageUrl: '/images/deals/dyson.jpg',
    storeName: 'Amazon',
    storeLogoUrl: '/images/stores/amazon.png',
    dealUrl: 'https://example.com/deal/4',
    slug: 'anker-soundcore-life-q30',
    createdAt: '2025-05-19T00:00:00Z',
  },
];

const COMPETITIVE_PRICING = [
  {
    storeName: 'Amazon',
    price: '$248.00',
    storeLogoUrl: '/images/stores/amazon.png',
    inStock: true,
    freeShipping: true,
    url: 'https://amazon.com',
  },
  {
    storeName: 'Best Buy',
    price: '$279.99',
    storeLogoUrl: '/images/stores/best-buy.png',
    inStock: true,
    freeShipping: true,
    url: 'https://bestbuy.com',
  },
  {
    storeName: 'Walmart',
    price: '$289.00',
    storeLogoUrl: '/images/stores/walmart.png',
    inStock: true,
    freeShipping: true,
    url: 'https://walmart.com',
  },
  {
    storeName: 'Target',
    price: '$299.99',
    storeLogoUrl: '/images/stores/target.png',
    inStock: false,
    freeShipping: true,
    url: 'https://target.com',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateTimeRemaining = (expiresAt: string) => {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();

  if (diffTime <= 0) {
    return 'Expired';
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
};

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-yellow-400">
          {i < fullStars ? (
            <Star className="h-4 w-4 fill-current" />
          ) : i === fullStars && hasHalfStar ? (
            <Star className="h-4 w-4 fill-current" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          ) : (
            <Star className="h-4 w-4 text-gray-300" />
          )}
        </span>
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

const PriceHistoryChart = ({ priceHistory }: { priceHistory: typeof DEAL_DATA.priceHistory }) => {
  const maxPrice = Math.max(...priceHistory.map(item => item.price));
  const minPrice = Math.min(...priceHistory.map(item => item.price));

  return (
    <div className="mt-2 space-y-1">
      {priceHistory.map((item, index) => {
        const heightPercentage = ((item.price - minPrice) / (maxPrice - minPrice)) * 70 + 30;
        return (
          <div key={index} className="flex items-center">
            <div className="w-24 text-xs text-gray-500">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div className="flex-1 relative">
              <div
                className={`h-6 rounded relative ${index === priceHistory.length - 1 ? 'bg-primary' : 'bg-gray-200'}`}
                style={{ width: `${heightPercentage}%` }}
              >
                <span className="absolute inset-y-0 right-1 flex items-center text-xs font-medium">
                  ${item.price}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function DealPage({ params }: { params: { slug: string } }) {
  const [commentText, setCommentText] = useState('');
  const [likeStatus, setLikeStatus] = useState<'none' | 'liked' | 'disliked'>('none');
  const [savedDeal, setSavedDeal] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);

  const deal = DEAL_DATA;

  const numericPrice = parseFloat(deal.price.replace(/[^0-9.]/g, ''));

  const breadcrumbs = [
    { name: 'Home', url: 'https://deals-hub.com/' },
    { name: 'Deals', url: 'https://deals-hub.com/deals' },
    { name: deal.category, url: `https://deals-hub.com/deals?category=${deal.category.toLowerCase().replace(/\s+/g, '-')}` },
    { name: deal.title, url: `https://deals-hub.com/deals/${deal.slug}` },
  ];

  // Create enhanced product schema data for SEO with more detailed information
  const productSchema = createProductStructuredData({
    name: deal.title,
    description: deal.description,
    image: `https://deals-hub.com${deal.imageUrl}`,
    price: deal.price,
    currency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `https://deals-hub.com/deals/${deal.slug}`,
    brand: deal.specifications.brand,
    sku: deal.sku,
    reviewCount: deal.likes + deal.comments.length,
    ratingValue: deal.ratings.overall,
  });

  // Create breadcrumb schema data for SEO
  const breadcrumbSchema = createBreadcrumbStructuredData(breadcrumbs);

  // Create FAQ schema for better rich results
  const faqSchema = createFAQStructuredData(DEAL_FAQS);

  // Create review schema based on the top comment
  const reviewSchema = deal.comments.length > 0 ? createReviewStructuredData({
    reviewBody: deal.comments[0].content,
    ratingValue: deal.ratings.overall,
    author: deal.comments[0].userName,
    datePublished: deal.comments[0].createdAt,
    itemReviewed: {
      name: deal.title,
      image: `https://deals-hub.com${deal.imageUrl}`
    }
  }) : null;

  // Create enhanced offer schema for competitive pricing data
  const competitivePricingSchema = COMPETITIVE_PRICING.map(retailer =>
    createOfferStructuredData({
      price: retailer.price,
      currency: 'USD',
      availability: retailer.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: retailer.url,
      seller: {
        name: retailer.storeName,
        url: retailer.url
      }
    })
  );

  // Update the product schema offers to include all competitive pricing
  productSchema.offers = {
    '@type': 'AggregateOffer',
    offerCount: COMPETITIVE_PRICING.length,
    lowPrice: Math.min(...COMPETITIVE_PRICING.map(p => parseFloat(p.price.replace(/[^0-9.]/g, '')))),
    highPrice: Math.max(...COMPETITIVE_PRICING.map(p => parseFloat(p.price.replace(/[^0-9.]/g, '')))),
    priceCurrency: 'USD',
    offers: competitivePricingSchema
  };

  // Combined schema data with all our enhanced schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      productSchema,
      breadcrumbSchema,
      faqSchema,
      ...(reviewSchema ? [reviewSchema] : [])
    ]
  };

  const handleLike = () => {
    if (likeStatus === 'liked') {
      setLikeStatus('none');
      toast.info('Like removed');
    } else {
      setLikeStatus('liked');
      if (likeStatus === 'disliked') {
        toast.success('Changed to like');
      } else {
        toast.success('Deal liked');
      }
    }
  };

  const handleDislike = () => {
    if (likeStatus === 'disliked') {
      setLikeStatus('none');
      toast.info('Dislike removed');
    } else {
      setLikeStatus('disliked');
      if (likeStatus === 'liked') {
        toast.success('Changed to dislike');
      } else {
        toast.success('Deal disliked');
      }
    }
  };

  const handleSaveDeal = () => {
    setSavedDeal(!savedDeal);
    if (!savedDeal) {
      toast.success('Deal saved to your favorites');
    } else {
      toast.info('Deal removed from your favorites');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: `Check out this deal: ${deal.title} for ${deal.price} (${deal.discountPercentage}% off)`,
        url: `https://deals-hub.com/deals/${deal.slug}`
      })
      .then(() => toast.success('Deal shared successfully'))
      .catch((error) => toast.error('Error sharing: ' + error));
    } else {
      navigator.clipboard.writeText(`https://deals-hub.com/deals/${deal.slug}`)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      toast.success('Comment submitted successfully!');
      setCommentText('');
    } else {
      toast.error('Please enter a comment');
    }
  };

  const handleSetAlert = () => {
    toast.success('Price alert set! We\'ll notify you if the price drops further.');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setActiveCoupon(code);
        toast.success(`Coupon code ${code} copied to clipboard`);
        setTimeout(() => setActiveCoupon(null), 3000);
      })
      .catch(() => toast.error('Failed to copy coupon code'));
  };

  const togglePriceHistory = () => {
    setShowPriceHistory(!showPriceHistory);
  };

  const toggleExpandImage = () => {
    setExpandedImage(!expandedImage);
  };

  const isPriceDropping = deal.priceHistory.length > 1 &&
    deal.priceHistory[deal.priceHistory.length - 1].price <
    deal.priceHistory[deal.priceHistory.length - 2].price;

  const isAllTimeLowest = deal.price === deal.lowestHistoricalPrice.price;

  return (
    <>
      <Seo
        title={`${deal.title} - ${deal.discountPercentage}% Off - DealsHub`}
        description={`Get ${deal.title} for just ${deal.price} (originally ${deal.originalPrice}). This is a ${deal.discountPercentage}% discount from ${deal.storeName}.`}
        ogType="product"
        ogImage={`https://deals-hub.com${deal.imageUrl}`}
        structuredData={combinedSchema}
        canonicalUrl={`https://deals-hub.com/deals/${deal.slug}`}
        additionalMetaTags={[
          { name: 'keywords', content: `${deal.title}, discount, deal, ${deal.storeName}, ${deal.specifications.brand}, ${deal.category}, shopping` },
          { name: 'product:price:amount', content: numericPrice.toString() },
          { name: 'product:price:currency', content: 'USD' },
          { name: 'product:availability', content: 'in stock' },
          { name: 'product:brand', content: deal.specifications.brand },
          { name: 'product:condition', content: 'new' },
        ]}
      />

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" asChild>
              <Link href="/deals">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Deals
              </Link>
            </Button>
          </div>
          <nav className="text-sm mb-4">
            <ol className="list-none p-0 flex flex-wrap">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center">
                  {i > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-gray-600 font-medium">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.url} className="text-primary hover:underline">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b py-3 mb-4 -mx-4 px-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-primary">{deal.price}</div>
              <div className="text-xs text-gray-500 line-through">{deal.originalPrice}</div>
            </div>
            <Button size="sm" asChild>
              <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                Get This Deal
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div
                className={`relative h-64 sm:h-80 lg:h-96 w-full cursor-pointer ${expandedImage ? 'lg:h-[500px]' : ''}`}
                onClick={toggleExpandImage}
              >
                <Image
                  src={deal.imageUrl}
                  alt={deal.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain"
                  priority
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {expandedImage ? 'Click to shrink' : 'Click to expand'}
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex items-center mb-3">
                  <div className="relative h-8 w-8 mr-2">
                    <Image
                      src={deal.storeLogoUrl}
                      alt={deal.storeName}
                      fill
                      sizes="32px"
                      className="object-contain rounded-full"
                    />
                  </div>
                  <Link
                    href={`/stores/${deal.storeSlug}`}
                    className="text-sm text-gray-700 hover:text-primary hover:underline"
                  >
                    {deal.storeName}
                  </Link>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>Posted on {formatDate(deal.createdAt)}</span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <div className="p-2 border border-green-100 bg-green-50 rounded-md flex items-center">
                    <Zap className="h-4 w-4 text-green-600 mr-2" />
                    <div className="text-xs">
                      {isAllTimeLowest ? (
                        <span className="font-semibold text-green-700">All-time lowest price!</span>
                      ) : isPriceDropping ? (
                        <span className="font-semibold text-green-700">Price is dropping - good time to buy!</span>
                      ) : (
                        <span className="font-semibold text-amber-600">Good value for money</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span className="font-medium">Deal Quality:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(deal.discountPercentage / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-green-600">{deal.discountPercentage}% off</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant={likeStatus === 'liked' ? 'default' : 'outline'}
                onClick={handleLike}
                className="flex items-center justify-center"
                size="sm"
              >
                <ThumbsUp className={`h-4 w-4 mr-2 ${likeStatus === 'liked' ? 'text-white' : 'text-gray-500'}`} />
                Like
              </Button>
              <Button
                variant={likeStatus === 'disliked' ? 'default' : 'outline'}
                onClick={handleDislike}
                className="flex items-center justify-center"
                size="sm"
              >
                <ThumbsDown className={`h-4 w-4 mr-2 ${likeStatus === 'disliked' ? 'text-white' : 'text-gray-500'}`} />
                Dislike
              </Button>
              <Button
                variant={savedDeal ? 'default' : 'outline'}
                onClick={handleSaveDeal}
                className="flex items-center justify-center"
                size="sm"
              >
                <Heart className={`h-4 w-4 mr-2 ${savedDeal ? 'text-white' : 'text-gray-500'}`} />
                {savedDeal ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center justify-center"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2 text-gray-500" />
                Share
              </Button>
            </div>

            <Card className="mt-6">
              <CardHeader className="p-4 cursor-pointer" onClick={togglePriceHistory}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <LineChart className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Price History</span>
                  </div>
                  {showPriceHistory ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              {showPriceHistory && (
                <CardContent className="px-4 pt-0 pb-4">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="flex items-center text-gray-500">
                      <ArrowDown className="h-3 w-3 mr-1 text-green-500" />
                      Lowest: <span className="text-green-600 font-medium ml-1">{deal.lowestHistoricalPrice.price}</span>
                      <span className="text-xs text-gray-400 ml-1">({formatDate(deal.lowestHistoricalPrice.date)})</span>
                    </span>
                    <span className="flex items-center text-gray-500">
                      <ArrowUp className="h-3 w-3 mr-1 text-red-500" />
                      Highest: <span className="text-red-600 font-medium ml-1">{deal.highestHistoricalPrice.price}</span>
                    </span>
                  </div>
                  <PriceHistoryChart priceHistory={deal.priceHistory} />
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    <Info className="h-3 w-3 inline mr-1" />
                    Price tracking data for the last 6 months
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{deal.title}</h1>

              <div className="flex items-center mb-3">
                <StarRating rating={deal.ratings.overall} />
                <div className="ml-2 text-sm text-gray-500">
                  {deal.comments.length} reviews
                </div>
                <div className="ml-auto flex items-center space-x-1.5">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {deal.salesRank}
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {deal.popularity} Demand
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">{deal.price}</span>
                <span className="text-lg text-gray-500 line-through">{deal.originalPrice}</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-semibold">
                  {deal.discountPercentage}% OFF
                </span>
              </div>

              {deal.expiresAt && (
                <div className="mb-6 bg-amber-50 p-3 rounded-md flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-amber-800">
                    Deal expires in <span className="font-semibold">{calculateTimeRemaining(deal.expiresAt)}</span>
                  </span>
                </div>
              )}

              <p className="text-gray-600 mb-6">{deal.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <ShoppingCart className="h-5 w-5 text-gray-500 mr-2" />
                  <span>In stock and ready to ship</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Truck className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Free shipping with Prime</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                  <span>Secure payment options</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ShieldCheck className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{deal.warranty}</span>
                </div>
              </div>

              {deal.availableCoupons && deal.availableCoupons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center">
                    <Scissors className="h-4 w-4 mr-1 text-primary" />
                    Available Coupon Codes
                  </h3>
                  <div className="space-y-2">
                    {deal.availableCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="border border-dashed border-primary/30 rounded p-2 flex justify-between items-center bg-primary/5"
                      >
                        <div>
                          <div className="font-mono font-medium">{coupon.code}</div>
                          <div className="text-xs text-gray-600">{coupon.description}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 bg-white"
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {activeCoupon === coupon.code ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            'Copy'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button size="lg" className="flex-1" asChild>
                  <a
                    href={deal.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    Get This Deal
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 flex items-center justify-center"
                  onClick={handleSetAlert}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Set Price Alert
                </Button>
              </div>

              <Card>
                <CardContent className="p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Deal Tip:</span> This product has been{' '}
                    <span className="text-primary font-medium">viewed {deal.views} times</span> in the last 24 hours.
                    Popular deals may sell out quickly.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                    Price Comparison Across Retailers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {COMPETITIVE_PRICING.map((retailer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative h-7 w-7 mr-2">
                            <Image
                              src={retailer.storeLogoUrl}
                              alt={retailer.storeName}
                              fill
                              sizes="28px"
                              className="object-contain rounded-full"
                            />
                          </div>
                          <span className="text-sm">{retailer.storeName}</span>
                          {!retailer.inStock && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className={`text-sm font-semibold ${index === 0 ? 'text-green-600' : ''}`}>
                            {retailer.price}
                          </span>
                          <a
                            href={retailer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3"
                          >
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Store className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="highlights">
                <TabsList className="w-full">
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="ratings">Ratings</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion ({deal.comments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="highlights" className="border rounded-md p-6 mt-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Product Highlights</h2>
                  <ul className="space-y-3">
                    {deal.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="specifications" className="border rounded-md p-6 mt-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Product Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(deal.specifications).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <span className="font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>{' '}
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ratings" className="border rounded-md p-6 mt-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Ratings</h2>

                  <div className="flex items-center mb-6">
                    <div className="flex flex-col items-center p-4 bg-primary-50 rounded-lg mr-6">
                      <span className="text-4xl font-bold text-primary">{deal.ratings.overall}</span>
                      <div className="mt-1">
                        <StarRating rating={deal.ratings.overall} />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{deal.comments.length} reviews</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      {Object.entries(deal.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <span className="w-28 text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <div className="flex-1 mx-3">
                            <Progress value={value * 20} className="h-2" />
                          </div>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      <span className="font-medium">Quality:</span> Users praise the exceptional build quality and premium materials.
                    </p>
                    <p>
                      <span className="font-medium">Value:</span> Most reviewers feel these headphones are worth the price, especially at the current discount.
                    </p>
                    <p>
                      <span className="font-medium">Comfort:</span> Almost all users rate these headphones as extremely comfortable for long wear periods.
                    </p>
                    <p>
                      <span className="font-medium">Audio:</span> Sound quality receives high marks with special praise for the bass response.
                    </p>
                    <p>
                      <span className="font-medium">Battery Life:</span> Most users confirm the 30-hour battery life claim is accurate.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="border rounded-md p-6 mt-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Discussion</h2>

                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="mb-3">
                      <textarea
                        placeholder="Write your comment about this deal..."
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      ></textarea>
                    </div>
                    <Button type="submit">Post Comment</Button>
                  </form>

                  <div className="space-y-4">
                    {deal.comments.map((comment) => (
                      <div key={comment.id} className="border-t pt-4">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{comment.userName}</span>
                          <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {deal.relatedProducts && deal.relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Gift className="h-5 w-5 mr-2 text-primary" />
              Frequently Bought Together
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <div className="p-4 flex flex-col items-center">
                  <div className="relative h-32 w-32 mb-3">
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title}
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-center line-clamp-2">{deal.title}</h3>
                  <p className="mt-2 font-semibold text-primary">{deal.price}</p>
                  <div className="mt-2 w-full">
                    <Button size="sm" className="w-full" variant="outline">
                      Selected
                    </Button>
                  </div>
                </div>
              </Card>
              {deal.relatedProducts.map((product) => (
                <Card key={product.id}>
                  <div className="p-4 flex flex-col items-center">
                    <div className="relative h-32 w-32 mb-3">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="128px"
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-center line-clamp-2">{product.name}</h3>
                    <p className="mt-2 font-semibold text-primary">{product.price}</p>
                    <div className="mt-2 w-full">
                      <Button size="sm" className="w-full" asChild>
                        <Link href={product.url}>
                          Add to Cart
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <Card className="bg-primary/5 border-primary/20">
                <div className="p-4 flex flex-col items-center justify-center h-full">
                  <h3 className="font-semibold text-lg text-center mb-2">Bundle & Save 10%</h3>
                  <p className="text-sm text-center text-gray-600 mb-4">
                    Buy these items together and save an additional 10%
                  </p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-primary">$427.99</span>
                    <span className="text-sm text-gray-500 line-through">$477.98</span>
                  </div>
                  <Button className="w-full">
                    Add Bundle to Cart
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary w-2 h-8 rounded mr-2"></span>
            Frequently Asked Questions
          </h2>
          <div className="bg-white border rounded-lg p-6">
            <Accordion type="single" collapsible className="w-full">
              {DEAL_FAQS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="bg-primary w-2 h-8 rounded mr-2"></span>
            Similar Deals You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SIMILAR_DEALS.map((deal) => (
              <DealCard
                key={deal.id}
                {...deal}
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/deals" className="flex items-center">
                Browse More Deals
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
