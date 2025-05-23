import type React from 'react';

const deals = [
  {
    title: 'This $40 Portable Neck Fan Is Just $12.89 for Prime Members',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/6dKJ3Ze3vhtTWliCgYmJxR/c7f933b54814865569e489a3c07fb38b/amazon-neck-fan.jpg?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/07/this-usd40-portable-neck-fan-is-just-usd12-89-for-prime-members',
    time: '12 hours ago',
    arrow: 'https://ext.same-assets.com/3000230773/801332402.svg',
  },
  {
    title: 'Free $199 Dog DNA Test? Ollies Wild Offer Is Back (But Not for Long)',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/oU8HlXMLSdVkann4kZoBX/bcc521f898fa41db1c72e0a297971676/ollie_free_embark_dna_test.png?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/07/free-usd199-dog-dna-test-ollies-wild-offer-is-back-but-not-for-long-e',
    time: '9 hours ago',
    arrow: 'https://ext.same-assets.com/3000230773/1132317054.svg',
  },
  {
    title: 'Watching TV? Scrolling TikTok? Nielsen Will Pay You for That',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3jXX58IPW01H8KdCF6nNxK/84378538b0d3fae33ada03af1e51b173/nielsen_ft_image.png?w=260&fit=max&auto=format&q=90',
    href: '/2025/05/06/watching-tv-scrolling-tiktok-nielsen-will-pay-you-for-that',
    time: '1 day ago',
    arrow: 'https://ext.same-assets.com/3000230773/1937519199.svg',
  },
];

const categories = [
  'Baby', 'Clothing', 'Coffee', 'Food', 'Home', 'Laundry', 'Pet', 'Shoes', 'Toys', 'Electronics'
];

const TopDealsList: React.FC = () => (
  <section className="bg-white py-12">
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-uniforma text-primary mb-4">Today's Top Deals</h2>
        <ul className="space-y-6">
          {deals.map((deal) => (
            <li key={deal.href} className="flex space-x-4">
              <img src={deal.image} alt={deal.title} className="w-24 h-24 object-cover rounded-md" />
              <div>
                <a href={deal.href} className="font-semibold text-primary hover:underline">
                  {deal.title}
                </a>
                <p className="text-sm text-gray-500 mt-1">{deal.time}</p>
                <a href={deal.href} className="text-secondary text-sm flex items-center mt-2">
                  Here's the deal!
                  <img src={deal.arrow} alt="arrow" className="ml-1 w-4 h-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Popular Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <a href={`/deals/${cat.toLowerCase()}`} className="flex justify-between hover:text-primary hover:underline">
                <span>{cat}</span>
                <span>→</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  </section>
);

export default TopDealsList;
