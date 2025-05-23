export interface StoreDeal {
  title: string;
  image: string;
  href: string;
  time: string;
}
export interface StoreData {
  title: string;
  description: string;
  logoUrl: string;
  quickLinks: { label: string; href: string; iconUrl: string }[];
  deals: StoreDeal[];
  faqs: { question: string; answer: string }[];
}

const storePages: Record<string, StoreData> = {
  amazon: {
    title: 'Amazon Coupons and Deals',
    description:
      "See the latest and greatest Amazon deals from Sales Aholics Deals. Save with Amazon sales and promo codes on books, beauty, gift cards, Kindles and more.",
    logoUrl: 'https://ext.same-assets.com/591013942/1818298894.png',
    quickLinks: [
      { label: 'Best Amazon Deals!', href: '/tips/store-hacks/best-amazon-deals', iconUrl: 'https://ext.same-assets.com/591013942/2333065904.svg' },
      { label: 'Amazon Promo Codes', href: '/tips/store-hacks/amazon-promo-codes', iconUrl: 'https://ext.same-assets.com/591013942/1493798275.svg' },
      { label: 'Amazon Beauty Deals', href: '/tips/money/amazon-beauty-deals', iconUrl: 'https://ext.same-assets.com/591013942/634937076.svg' },
      { label: 'Amazon Under $5', href: '/tips/store-hacks/cool-things-buy-amazon-under-5', iconUrl: 'https://ext.same-assets.com/591013942/2701742114.svg' },
      { label: 'Deals Over 50% Off', href: '/tips/money/amazon-deals-over-50-off', iconUrl: 'https://ext.same-assets.com/591013942/842301841.svg' },
    ],
    deals: [
      {
        title: 'Amazon Pet Day Sale: Expect the Next One in May 2026',
        image: 'https://ext.same-assets.com/591013942/2600831171.jpeg',
        href: '/tips/couponing/amazon-pet-day',
        time: '4 days ago',
      },
      {
        title: 'These Amazon Pet Deals Are Left Over From Pet Day: Treats, Toys, and More',
        image: 'https://ext.same-assets.com/591013942/2944323260.jpeg',
        href: '/tips/money/amazon-pet-deals',
        time: '3 days ago',
      },
      {
        title: "This Smart Bird Feeder Just Dropped to $53.99 on Amazon",
        image: 'https://ext.same-assets.com/591013942/2737178619.jpeg',
        href: '/2025/05/18/this-smart-bird-feeder-just-dropped-to-usd53-99-on-amazon',
        time: '5 hours ago',
      },
      {
        title: 'Cutter Backyard Bug Spray Concentrate 2-Pack, as Low as $10.17 on Amazon',
        image: 'https://ext.same-assets.com/591013942/2993463539.jpeg',
        href: '/2025/05/18/cutter-backyard-bug-spray-concentrate-2-pack-as-low-as-usd10-17-on-amazon',
        time: '5 hours ago',
      },
    ],
    faqs: [
      {
        question: 'How much is Amazon Prime?',
        answer: 'Amazon Prime costs $14.99 per month or $139 per year in the US. Students can get a discounted membership for $7.49 per month or $69 per year with Prime Student.'
      },
      {
        question: 'When is Amazon Prime Day?',
        answer: 'Amazon Prime Day typically occurs in July each year, though specific dates vary. It\'s a two-day sales event exclusive to Prime members featuring deals across all categories.'
      },
      {
        question: 'Is Amazon Prime worth it?',
        answer: 'Amazon Prime can be worth it if you regularly use its benefits, including free two-day shipping, Prime Video, Prime Music, Prime Reading, and exclusive deals. For frequent Amazon shoppers, the shipping savings alone often justify the cost.'
      },
      {
        question: 'How do I get free returns on Amazon?',
        answer: 'Most Amazon items are eligible for free returns within 30 days of receipt. To return an item, go to Your Orders, select the item, click Return or replace items, choose a reason, select your preferred return method, and print a return label if required.'
      },
      {
        question: 'How do I get free stuff from Amazon?',
        answer: 'You can get free items from Amazon through Amazon Vine (invitation only for top reviewers), Amazon\'s sampling programs, promotional giveaways, the Amazon Warehouse free returns section, and by signing up for Amazon\'s product testing programs.'
      },
    ],
  },
};

export default storePages;
