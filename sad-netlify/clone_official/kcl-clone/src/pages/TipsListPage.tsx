import type React from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';

// Sample tips categories
const tipsCategories = [
  {
    name: 'Home Tips',
    href: '/tips/home',
    image: 'https://ext.same-assets.com/591013942/8123456789.jpeg',
    description: 'Save on home decor, cleaning, organization, and more'
  },
  {
    name: 'Couponing Tips',
    href: '/tips/couponing',
    image: 'https://ext.same-assets.com/591013942/9123456789.jpeg',
    description: 'Learn the ins and outs of extreme couponing'
  },
  {
    name: 'Travel Tips',
    href: '/tips/travel',
    image: 'https://ext.same-assets.com/591013942/0223456789.jpeg',
    description: 'Travel hacks to save money on your next vacation'
  },
  {
    name: 'Store Hacks',
    href: '/tips/store-hacks',
    image: 'https://ext.same-assets.com/591013942/1223456789.jpeg',
    description: 'Insider tips and tricks for shopping at your favorite stores'
  },
  {
    name: 'Money Saving',
    href: '/tips/money',
    image: 'https://ext.same-assets.com/591013942/2223456789.jpeg',
    description: 'Finance tips for saving money in everyday life'
  },
  {
    name: 'Family',
    href: '/tips/family',
    image: 'https://ext.same-assets.com/591013942/3223456789.jpeg',
    description: 'Tips for saving on family and parenting expenses'
  },
  {
    name: 'Recipes',
    href: '/tips/recipes',
    image: 'https://ext.same-assets.com/591013942/4223456789.jpeg',
    description: 'Budget-friendly meals and recipes'
  },
  {
    name: 'DIY Projects',
    href: '/tips/diy',
    image: 'https://ext.same-assets.com/591013942/5223456789.jpeg',
    description: 'Do-it-yourself projects to save money'
  },
];

// Sample featured tips
const featuredTips = [
  {
    id: 1,
    title: '15 Amazon Hacks Every Prime Member Should Know',
    image: 'https://ext.same-assets.com/591013942/6223456789.jpeg',
    category: 'Store Hacks',
    categoryHref: '/tips/store-hacks',
    timePosted: 'May 15, 2025',
    author: 'Sarah Johnson',
    authorImage: 'https://ext.same-assets.com/591013942/7223456789.jpeg',
    href: '/tips/store-hacks/amazon-prime-hacks',
    excerpt: 'Make the most of your Amazon Prime membership with these little-known tips and tricks that will save you time and money.',
  },
  {
    id: 2,
    title: 'How to Create a Coupon Binder in 5 Easy Steps',
    image: 'https://ext.same-assets.com/591013942/8223456789.jpeg',
    category: 'Couponing',
    categoryHref: '/tips/couponing',
    timePosted: 'May 12, 2025',
    author: 'Michael Chen',
    authorImage: 'https://ext.same-assets.com/591013942/9223456789.jpeg',
    href: '/tips/couponing/create-coupon-binder',
    excerpt: 'Stay organized and maximize your savings with a well-structured coupon binder. Follow these simple steps to create your own system.',
  },
  {
    id: 3,
    title: '10 Dollar Store DIY Home Decor Ideas That Look Expensive',
    image: 'https://ext.same-assets.com/591013942/0333456789.jpeg',
    category: 'DIY',
    categoryHref: '/tips/diy',
    timePosted: 'May 10, 2025',
    author: 'Jessica Rodriguez',
    authorImage: 'https://ext.same-assets.com/591013942/1333456789.jpeg',
    href: '/tips/diy/dollar-store-home-decor',
    excerpt: 'Transform dollar store finds into stunning home decor that looks high-end. These budget-friendly DIY projects will impress your guests.',
  },
  {
    id: 4,
    title: 'How to Save $200 on Your Monthly Grocery Bill',
    image: 'https://ext.same-assets.com/591013942/2333456789.jpeg',
    category: 'Money',
    categoryHref: '/tips/money',
    timePosted: 'May 8, 2025',
    author: 'David Thompson',
    authorImage: 'https://ext.same-assets.com/591013942/3333456789.jpeg',
    href: '/tips/money/save-on-groceries',
    excerpt: 'Cut your grocery spending without sacrificing quality or variety. These practical strategies can help you save up to $200 every month.',
  },
];

// Category-specific content
const categoryContent: Record<string, { title: string; description: string; tips: typeof featuredTips }> = {
  'home': {
    title: 'Home Tips & Hacks',
    description: 'Discover clever ways to save money on home decor, organization, cleaning, and more. Our expert home tips will help you create a beautiful space without breaking the bank.',
    tips: [
      {
        id: 5,
        title: '12 Brilliant Ways to Organize Your Kitchen on a Budget',
        image: 'https://ext.same-assets.com/591013942/4333456789.jpeg',
        category: 'Home',
        categoryHref: '/tips/home',
        timePosted: 'May 5, 2025',
        author: 'Emma Wilson',
        authorImage: 'https://ext.same-assets.com/591013942/5333456789.jpeg',
        href: '/tips/home/kitchen-organization',
        excerpt: 'Transform your kitchen with these affordable organization solutions. From pantry makeovers to drawer dividers, these ideas will maximize your space.',
      },
      // More home tips...
    ]
  },
  'couponing': {
    title: 'Couponing Tips & Strategies',
    description: 'Master the art of couponing with our expert guides and strategies. Learn how to find, organize, and use coupons effectively to maximize your savings on everyday purchases.',
    tips: [
      {
        id: 6,
        title: 'The Beginner\'s Guide to Digital Couponing',
        image: 'https://ext.same-assets.com/591013942/6333456789.jpeg',
        category: 'Couponing',
        categoryHref: '/tips/couponing',
        timePosted: 'May 3, 2025',
        author: 'Robert Garcia',
        authorImage: 'https://ext.same-assets.com/591013942/7333456789.jpeg',
        href: '/tips/couponing/digital-couponing-guide',
        excerpt: 'New to digital coupons? This comprehensive guide will show you how to find, save, and redeem digital coupons at your favorite stores and online retailers.',
      },
      // More couponing tips...
    ]
  },
  // More categories...
};

const TipsListPage: React.FC = () => {
  const { tipCategory } = useParams<{ tipCategory?: string }>();
  const isMainPage = !tipCategory;

  // Get category-specific content or use defaults for main tips page
  const pageContent = tipCategory && categoryContent[tipCategory]
    ? categoryContent[tipCategory]
    : {
        title: tipCategory
          ? `${tipCategory.charAt(0).toUpperCase() + tipCategory.slice(1)} Tips & Hacks`
          : 'Money-Saving Tips & Life Hacks',
        description: tipCategory
          ? `Discover the best ${tipCategory} tips and hacks to save money and simplify your life.`
          : 'Browse our collection of money-saving tips, life hacks, and expert advice to help you save more and spend less.',
        tips: featuredTips
      };

  // Format category name for display
  const formattedCategory = tipCategory
    ? tipCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  const canonicalPath = tipCategory ? `/tips/${tipCategory}` : '/tips';

  return (
    <>
      <SEO
        title={`${pageContent.title} | Sales Aholics Deals`}
        description={pageContent.description}
        canonicalUrl={`https://salesaholicsdeals.com${canonicalPath}`}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{pageContent.title}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {pageContent.description}
          </p>
        </div>

        {/* Categories Grid - Only shown on main tips page */}
        {isMainPage && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 pb-2 border-b">Tips Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tipsCategories.map((category) => (
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
        )}

        {/* Tips Articles List */}
        <section>
          <h2 className="text-2xl font-bold mb-8 pb-2 border-b">
            {isMainPage ? 'Featured Tips & Guides' : `Latest ${formattedCategory} Tips`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pageContent.tips.map((tip) => (
              <Link
                key={tip.id}
                to={tip.href}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="bg-gray-100">
                  <img
                    src={tip.image}
                    alt={tip.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                      {tip.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-3">{tip.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tip.excerpt}</p>

                  <div className="mt-auto flex items-center">
                    <img
                      src={tip.authorImage}
                      alt={tip.author}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium">{tip.author}</p>
                      <p className="text-xs text-gray-500">{tip.timePosted}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to={isMainPage ? "/tips" : tipCategory ? `/tips/${tipCategory}` : "/tips"}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-block"
            >
              Load More Tips
            </Link>
          </div>
        </section>

        {/* Related Categories - Only shown on category pages */}
        {!isMainPage && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Tips Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tipsCategories
                .filter(cat => !tipCategory || !cat.href.includes(tipCategory))
                .slice(0, 4)
                .map(category => (
                  <Link
                    key={category.href}
                    to={category.href}
                    className="p-4 bg-white border border-gray-200 rounded-lg text-center hover:shadow-md transition-shadow"
                  >
                    <span className="font-medium">{category.name}</span>
                  </Link>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TipsListPage;
