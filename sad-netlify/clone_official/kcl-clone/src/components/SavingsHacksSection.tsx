import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const monthlyHacks = [
  {
    label: 'IHOP Kids Eat Free',
    href: '/tips/money/kids-eat-free-at-ihop'
  },
  {
    label: 'Costco Coupon Book',
    href: '/tips/couponing/costco-coupon-book'
  },
  {
    label: "Lowe's Memorial Day Sale",
    href: '/tips/money/lowes-memorial-day-sale'
  },
  {
    label: 'Home Depot Memorial Day Sale',
    href: '/tips/money/home-depot-memorial-day-sale'
  },
  {
    label: 'Costco Appliance Savings Event',
    href: '/tips/money/costco-appliance-savings-event'
  },
  {
    label: 'Amazon Memorial Day Sale',
    href: '/tips/money/amazon-memorial-day-deals'
  },
  {
    label: "Macy's 10 Days of Glam Sale",
    href: '/tips/couponing/macys-10-days-of-glam'
  },
  {
    label: 'Dollar General Clearance Event',
    href: '/tips/store-hacks/dollar-general-clearance-event'
  },
  {
    label: 'REI Anniversary Sale',
    href: '/tips/store-hacks/rei-anniversary-sale'
  },
  {
    label: 'Target Memorial Day Sale',
    href: '/tips/store-hacks/target-memorial-day-sale'
  },
  {
    label: 'Walmart Memorial Day Sale',
    href: '/tips/store-hacks/walmart-memorial-day-sale'
  },
  {
    label: "Macy's Memorial Day Sale",
    href: '/tips/store-hacks/macys-memorial-day-deals'
  },
  {
    label: '$30 Concert Ticket Event',
    href: '/tips/money/live-nation-concert-week'
  },
  {
    label: 'Nordstrom Clear the Rack Sale',
    href: '/tips/store-hacks/nordstrom-rack-clear-the-rack-sale'
  }
];

const popularPages = [
  {
    label: 'How to Coupon',
    href: '/beginners',
    icon: 'https://ext.same-assets.com/3000230773/4252861238.svg'
  },
  {
    label: 'How to Save on Groceries',
    href: '/food-grocery-prices-rising',
    icon: 'https://ext.same-assets.com/3000230773/3301625649.svg'
  },
  {
    label: 'Store Return Policies',
    href: '/store-return-policies',
    icon: 'https://ext.same-assets.com/3000230773/3394157246.svg'
  },
  {
    label: 'Back to School Sales',
    href: '/deals/back-to-school',
    icon: 'https://ext.same-assets.com/3000230773/1787624407.svg'
  },
  {
    label: 'Black Friday Sales',
    href: '/best-black-friday-sales',
    icon: 'https://ext.same-assets.com/3000230773/2116589346.svg'
  },
];

const featuredHacks = [
  {
    title: "The Home Depot Memorial Day Sale is Live With $2.50 Mulch, More",
    href: '/tips/money/home-depot-memorial-day-sale',
    imgSrc: 'https://ext.same-assets.com/2489353078/963880294.jpeg',
    time: '4 days ago'
  },
  {
    title: "Amazon's Memorial Day Sale Just Dropped: I Scored Up to 84% Off",
    href: '/tips/money/amazon-memorial-day-deals',
    imgSrc: 'https://ext.same-assets.com/2489353078/3466175990.jpeg',
    time: '3 days ago'
  },
  {
    title: "Lowe's Memorial Day Sale Through May 28 - Top 10+ Deals Worth Buying",
    href: '/tips/money/lowes-memorial-day-sale',
    imgSrc: 'https://ext.same-assets.com/2489353078/1513158991.jpeg',
    time: '2 days ago'
  }
];

const SavingsHacksSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#1f1a1e] mb-8 mt-4">
          {t('savingsHacks.title', "SAD's Insider Shopping Secrets")}
        </h2>

        <p className="text-gray-700 mb-8 max-w-5xl">
          {t('savingsHacks.description', "Not only does Sales Aholics Deals find you the best deals, but we also provide you with expert shopping strategies and savings secrets. See the latest sales schedules, get the newest weekly ads to save on groceries, and find store-specific advice to maximize your savings.")}
        </p>

        {/* Featured Savings Hacks - Carousel */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHacks.map((hack, index) => (
              <div key={index} className="flex flex-col">
                <Link to={hack.href} className="group">
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={hack.imgSrc}
                      alt={hack.title}
                      className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-[#1f1a1e] group-hover:text-[#982a4a] mb-1">{hack.title}</h3>
                </Link>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">{hack.time}</span>
                  <Link to={hack.href} className="text-[#982a4a] text-sm font-medium flex items-center hover:underline">
                    {t('savingsHacks.heresDeal', "Here's the deal")}
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#982a4a]' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* All Savings Hacks */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1f1a1e]">
              {t('savingsHacks.allSavingsHacks', 'All Savings Hacks')}
            </h2>

            {/* Filter dropdown */}
            <div className="relative">
              <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50">
                <span className="text-sm font-medium">{t('savingsHacks.filterByCategory', 'Filter by category')}</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Grid of Savings Hacks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What's Happening This Month */}
            <div>
              <h3 className="text-xl font-semibold text-[#1f1a1e] mb-4">{t('savingsHacks.whatsHappening', "What's Happening This Month")}</h3>
              <ul className="space-y-1.5">
                {monthlyHacks.slice(0, 10).map((hack, index) => (
                  <li key={index} className="border-b border-gray-100 pb-1.5">
                    <Link to={hack.href} className="text-gray-700 hover:text-[#982a4a] transition-colors">
                      <span className="text-base">{hack.label}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    to="/tips"
                    className="text-[#982a4a] font-medium flex items-center hover:underline"
                  >
                    {t('savingsHacks.seeAllSavingsHacks', 'See all savings hacks')}
                    <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular Pages */}
            <div>
              <h3 className="flex items-center text-xl font-semibold text-[#1f1a1e] mb-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t('savingsHacks.popularPages', 'Popular Pages')}
              </h3>
              <ul className="space-y-4">
                {popularPages.map((page, index) => (
                  <li key={index}>
                    <Link to={page.href} className="flex items-center hover:underline group">
                      <div className="w-10 h-10 flex-shrink-0 mr-3">
                        <img src={page.icon} alt="" className="w-full h-full" />
                      </div>
                      <span className="text-base text-gray-700 group-hover:text-[#982a4a]">{page.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsHacksSection;
