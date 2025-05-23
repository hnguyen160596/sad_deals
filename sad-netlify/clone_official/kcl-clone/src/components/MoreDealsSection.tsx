import type React from 'react';
import { useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';
import { useNotifications } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import { trackClick } from './Analytics';

const deals = [
  {
    title: 'This Amazon-Approved Ionic Hair Dryer Is Only $25 After Markdowns',
    image:
      'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/5LRKyxiEggf1xXgnmgf0LH/401955e80bb626e397279b935e98e80a/Maroon___Pink.png?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/06/this-amazon-approved-ionic-blow-dryer-is-only-usd27-after-markdowns',
    arrow: 'https://ext.same-assets.com/3000230773/286459257.svg',
    store: 'Amazon',
    time: '11 hours ago'
  },
  {
    title: 'Kate Spade Large Crossbody, Only $79 Shipped (Reg. $329)',
    image:
      'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/UzKN0TQHprekCOQQsczqU/eef2765cca4f67a76654fc5b016a9089/kate_spade_crosbody.jpg?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/07/kate-spade-large-crossbody-only-usd79-shipped-reg-usd329',
    arrow: 'https://ext.same-assets.com/3000230773/3160495444.svg',
    store: 'Kate Spade',
    time: '12 hours ago'
  },
  {
    title: 'The 5 Bestselling Jewelry Deals on Sale for Mothers Day (All Under $10)',
    image:
      'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/6ZNVrme9t63fIywxKn3aVH/075b32733f841e7fafdb414a3bec0974/target_mothers_day_jewelry_collage.png?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/07/the-5-bestselling-jewelry-deals-on-sale-for-mothers-day-all-under-usd10',
    arrow: 'https://ext.same-assets.com/3000230773/658199468.svg',
    store: 'Target',
    time: '1 day ago'
  },
  {
    title: 'Get a Free Krispy Kreme Original Glazed Donut Today No Purchase Necessary',
    image:
      'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3wuSJn63SzzV61G8VBfqoc/6df1a33df58e82615aebf2cb1649c900/krispy-kreme-original-glazed-donut-free-rewards-kcl-09-1702494075-1702494075.jpg?w=550&fit=max&auto=format&q=90',
    href: '/tips/store-hacks/krispy-kreme-free-donuts',
    arrow: 'https://ext.same-assets.com/3000230773/1132317054.svg',
    store: 'Krispy Kreme',
    time: '2 days ago'
  },
  {
    title: 'Grab a Stem Flying Insect Light Trap for $4.27 at Target Before Its Gone',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3rwmmOO8SBQeR9aMA45PqY/01d368b28b58e41c34c11d0707aaee99/stem-light-trap-kit-target1.jpg?w=241&fit=max&auto=format&q=90',
    href: '/2025/05/18/grab-a-stem-flying-insect-light-trap-for-usd4-27-at-target-before-its-gone',
    arrow: 'https://ext.same-assets.com/3000230773/409235749.svg',
    store: 'Target',
    time: '3 hours ago'
  },
  {
    title: 'Pay Only $4.99 for This Women\'s Ribbed Tank Top on Amazon',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/UY6qJ2y9TExecz4vJRapH/eafafe7e2e4b9d6ad59cfc4eed1ef1de/50_ribbed_tank_amazon.jpg?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/07/pay-only-usd4-99-for-this-womens-ribbed-tank-top-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/409235749.svg',
    store: 'Amazon',
    time: '5 hours ago'
  },
  {
    title: 'It\'s Back: $400 Self-Cleaning Litter Box Drops to $164.99 on Amazon',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/67CZ2HfqFefuuBD002NSDH/be309ca6be7ba5900363161d0668c2e1/ChatGPT_Image_Apr_30__2025__12_57_28_PM.png?w=241&fit=max&auto=format&q=90',
    href: '/2025/05/07/its-back-usd400-self-cleaning-litter-box-drops-to-usd164-99-on-amazon',
    arrow: 'https://ext.same-assets.com/3000230773/3225579771.svg',
    store: 'Amazon',
    time: '8 hours ago'
  },
  {
    title: 'Use Ibotta and Fetch for $1.44 Febreze Mist at Walmart (Reg. $3.24)',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/7xrmjNmuYC5Rfk5Ptvx5HL/7b87ee435eac99ceee6b61c4650612b3/walmart-febreze-spray-6.jpg?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/18/use-ibotta-and-fetch-for-usd1-44-febreze-mist-at-walmart-reg-usd3-24',
    arrow: 'https://ext.same-assets.com/3000230773/658199468.svg',
    store: 'Walmart',
    time: '10 hours ago'
  }
];

interface DealCardProps {
  deal: typeof deals[0];
  onSubscribeToPriceAlert: (deal: typeof deals[0]) => void;
  isSubscribed: boolean;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onSubscribeToPriceAlert, isSubscribed }) => {
  const { t } = useTranslation();

  return (
    <a href={deal.href} className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="flex">
        <div className="relative w-24 md:w-28 flex-shrink-0">
          <img
            src={deal.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {deal.store && (
            <span className="absolute top-1 left-1 bg-primary/90 text-white text-xs px-1.5 py-0.5 rounded">
              {deal.store}
            </span>
          )}
        </div>

        <div className="p-3 flex flex-col justify-between flex-1">
          <h3 className="font-medium text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {deal.title}
          </h3>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-xs text-gray-500">{deal.time}</span>

            <div className="flex items-center text-sm font-medium text-primary">
              {t('home.moreDeals.heresTheDeal', "Here's the deal")}
              {deal.arrow && (
                <img
                  src={deal.arrow}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="ml-1 w-4 h-4"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-100 flex justify-between items-center">
        <button
          className={`text-xs px-2 py-1 rounded-full ${
            isSubscribed
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-primary/10'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSubscribeToPriceAlert(deal);
          }}
        >
          {isSubscribed ? t('deals.priceAlertActive', 'Alert Active') : t('deals.priceAlert', 'Price Alert')}
        </button>

        <div className="flex items-center space-x-2">
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="z-10"
          >
            <FavoriteButton
              itemId={deal.href}
              itemType="deal"
              itemData={{
                title: deal.title,
                image: deal.image,
                store: deal.store,
                url: deal.href
              }}
            />
          </div>
        </div>
      </div>
    </a>
  );
};

const MoreDealsSection: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({});
  const { subscription, addDealCategoryPreference, isSubscribed } = useNotifications();
  const { isAuthenticated } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    // Check which deals are already in the user's notification preferences
    if (subscription && subscription.dealCategoryPreferences) {
      const currentSubscriptions: Record<string, boolean> = {};
      deals.forEach(deal => {
        const dealKey = deal.href;
        currentSubscriptions[dealKey] = subscription.dealCategoryPreferences.includes(dealKey);
      });
      setSubscriptions(currentSubscriptions);
    }
  }, [subscription]);

  const handleSubscribeToPriceAlert = async (deal: typeof deals[0]) => {
    if (!isAuthenticated) {
      // Redirect to login first
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (!isSubscribed) {
      // Show email signup modal or redirect to email preferences
      window.location.href = '/email-preferences';
      return;
    }

    const dealKey = deal.href;

    try {
      await addDealCategoryPreference(dealKey);
      setSubscriptions(prev => ({
        ...prev,
        [dealKey]: true
      }));
      trackClick('Price Alert', 'Subscribe', deal.title);
    } catch (error) {
      console.error('Failed to subscribe to price alert:', error);
    }
  };

  return (
    <section className="py-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('home.moreDeals.todaysTopDeals', "Today's top deals")}
        </h2>

        <div className="grid gap-4 md:gap-6">
          {deals.map((deal, index) => (
            <DealCard
              key={index}
              deal={deal}
              onSubscribeToPriceAlert={handleSubscribeToPriceAlert}
              isSubscribed={subscriptions[deal.href] || false}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/deals"
            className="inline-flex items-center text-primary dark:text-primary-dark font-medium hover:underline"
            onClick={() => trackClick('More Deals', 'View All')}
          >
            {t('home.moreDeals.findDeals', 'Find deals today')}
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default MoreDealsSection;
