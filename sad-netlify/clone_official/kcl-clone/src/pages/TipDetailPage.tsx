import type React from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import ArticleSchema from '../components/ArticleSchema';

// Sample tip detail content
const tipDetails: Record<string, {
  title: string;
  category: string;
  categoryHref: string;
  heroImage: string;
  publishDate: string;
  author: string;
  authorImage: string;
  authorBio: string;
  content: string;
  relatedTips: Array<{
    id: number;
    title: string;
    image: string;
    href: string;
  }>;
}> = {
  'amazon-prime-hacks': {
    title: '15 Amazon Hacks Every Prime Member Should Know',
    category: 'Store Hacks',
    categoryHref: '/tips/store-hacks',
    heroImage: 'https://ext.same-assets.com/591013942/6223456789.jpeg',
    publishDate: 'May 15, 2025',
    author: 'Sarah Johnson',
    authorImage: 'https://ext.same-assets.com/591013942/7223456789.jpeg',
    authorBio: 'Sarah is our resident e-commerce expert with 8+ years of experience finding the best online deals.',
    content: `
      <p class="mb-4">Amazon Prime offers so much more than just free two-day shipping. As a Prime member, you have access to a plethora of benefits that many people don't even know exist. Here are 15 lesser-known hacks to help you maximize your Prime membership.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">1. Use Amazon's Price Tracking Tools</h2>
      <p class="mb-4">Amazon's prices fluctuate constantly. Use CamelCamelCamel or the Amazon Assistant browser extension to track price history and set alerts for when prices drop on items you're interested in purchasing.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">2. Take Advantage of Subscribe & Save</h2>
      <p class="mb-4">For items you purchase regularly, use Subscribe & Save to get automatic deliveries and save up to 15% when you have five or more subscriptions delivered to the same address.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">3. Use Amazon Household to Share Benefits</h2>
      <p class="mb-4">Amazon Household allows you to share your Prime benefits with another adult in your household, including free shipping, Prime Video, and more.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">4. Don't Overlook Amazon Warehouse Deals</h2>
      <p class="mb-4">Amazon Warehouse offers great discounts on used, open-box, and refurbished products that have been inspected and graded by Amazon.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">5. Get Free Kindle Books</h2>
      <p class="mb-4">Prime members can borrow one free book per month from the Kindle Owners' Lending Library and also have access to Prime Reading, which offers a rotating selection of over 1,000 books, magazines, and comics.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">6. Use Amazon First Reads</h2>
      <p class="mb-4">Prime members get early access to one free Kindle book each month through Amazon First Reads (formerly Kindle First).</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">7. Create Your Own Amazon Day</h2>
      <p class="mb-4">To reduce packaging waste and consolidate deliveries, set up Amazon Day to have all your orders delivered on a specific day of the week.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">8. Get Free Same-Day Delivery</h2>
      <p class="mb-4">In eligible zip codes, Prime members can get free same-day delivery on orders over $35. Look for the "Prime FREE Same-Day" logo when shopping.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">9. Use Amazon Prime Photos for Unlimited Storage</h2>
      <p class="mb-4">Prime members get unlimited full-resolution photo storage and 5 GB of video storage through Amazon Photos.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">10. Shop with Amazon Smile</h2>
      <p class="mb-4">When you shop through smile.amazon.com, Amazon donates 0.5% of eligible purchases to the charity of your choice at no cost to you.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">11. Take Advantage of Amazon Prime Music</h2>
      <p class="mb-4">Prime members have access to over 2 million songs, ad-free. While not as extensive as Amazon Music Unlimited, it's a solid free option for casual listeners.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">12. Check Out Amazon Prime Gaming</h2>
      <p class="mb-4">Formerly known as Twitch Prime, Amazon Prime Gaming offers free PC games, in-game content, and a free Twitch channel subscription each month.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">13. Use Amazon Prime Wardrobe</h2>
      <p class="mb-4">Try before you buy with Prime Wardrobe. Choose up to six clothing items, try them on at home, and only pay for what you keep.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">14. Get Early Access to Lightning Deals</h2>
      <p class="mb-4">Prime members get 30-minute early access to Lightning Deals, which can make a big difference for highly sought-after items.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">15. Use No-Rush Shipping for Extra Benefits</h2>
      <p class="mb-4">When you're not in a hurry to receive your order, choose No-Rush Shipping at checkout and earn rewards or discounts on future purchases.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
      <p class="mb-4">Your Amazon Prime membership is more valuable than you might realize. By utilizing these hacks, you can maximize the benefits and get the most bang for your buck from your annual membership fee.</p>
    `,
    relatedTips: [
      {
        id: 101,
        title: 'How to Find Hidden Deals on Amazon',
        image: 'https://ext.same-assets.com/591013942/0443456789.jpeg',
        href: '/tips/store-hacks/hidden-amazon-deals',
      },
      {
        id: 102,
        title: '10 Ways to Save Money on Amazon Without Prime',
        image: 'https://ext.same-assets.com/591013942/1443456789.jpeg',
        href: '/tips/money/save-on-amazon-without-prime',
      },
      {
        id: 103,
        title: 'Amazon vs. Walmart: Which Offers Better Deals?',
        image: 'https://ext.same-assets.com/591013942/2443456789.jpeg',
        href: '/tips/store-hacks/amazon-vs-walmart',
      },
    ]
  },
  // Add more tips as needed
};

// Default content for fallback
const defaultTipContent = {
  title: 'Money-Saving Tip',
  category: 'Savings',
  categoryHref: '/tips',
  heroImage: 'https://ext.same-assets.com/591013942/3443456789.jpeg',
  publishDate: 'May 2025',
  author: 'Sales Aholics Team',
  authorImage: 'https://ext.same-assets.com/591013942/4443456789.jpeg',
  authorBio: 'Our team of savings experts is dedicated to finding the best deals and sharing money-saving tips.',
  content: '<p>We\'re currently updating this content. Please check back soon for this money-saving tip!</p>',
  relatedTips: []
};

const TipDetailPage: React.FC = () => {
  const { tipSlug } = useParams<{ tipSlug: string }>();

  // Get tip data or use default
  const tipData = tipSlug && tipDetails[tipSlug]
    ? tipDetails[tipSlug]
    : {
        ...defaultTipContent,
        title: tipSlug ? tipSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : defaultTipContent.title
      };

  return (
    <>
      <SEO
        title={`${tipData.title} | Sales Aholics Deals`}
        description={`Learn about ${tipData.title} and save money with our expert tips.`}
        canonicalUrl={tipSlug ? `https://salesaholicsdeals.com/tips/${tipSlug}` : 'https://salesaholicsdeals.com/tips'}
      />

      {/* Add ArticleSchema for rich snippet in search results */}
      <ArticleSchema
        title={tipData.title}
        description={`Learn about ${tipData.title} and save money with our expert tips.`}
        url={tipSlug ? `https://salesaholicsdeals.com/tips/${tipSlug}` : 'https://salesaholicsdeals.com/tips'}
        imageUrl={tipData.heroImage.startsWith('http') ? tipData.heroImage : `${window.location.origin}${tipData.heroImage}`}
        datePublished={tipData.publishDate}
        dateModified={tipData.publishDate}
        author={{
          name: tipData.author,
          imageUrl: tipData.authorImage.startsWith('http') ? tipData.authorImage : `${window.location.origin}${tipData.authorImage}`
        }}
        publisher={{
          name: 'Sales Aholics Deals',
          logo: `${window.location.origin}/logo.png`,
          url: 'https://salesaholicsdeals.com'
        }}
        articleType="BlogPosting"
        articleSection={tipData.category}
        keywords={[tipData.category, 'savings tips', 'money saving', 'deals', 'budget tips']}
      />

      <article className="container mx-auto px-4 py-8">
        {/* Breadcrumbs with Schema.org markup */}
        <Breadcrumbs
          items={[
            { name: 'Tips', url: '/tips' },
            { name: tipData.category, url: tipData.categoryHref },
            { name: tipData.title, url: window.location.pathname, isLast: true }
          ]}
          className="mb-6"
        />

        {/* Title and Category */}
        <div className="mb-8 text-center max-w-4xl mx-auto">
          <Link
            to={tipData.categoryHref}
            className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4"
          >
            {tipData.category}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{tipData.title}</h1>

          {/* Author info */}
          <div className="flex items-center justify-center">
            <img
              src={tipData.authorImage}
              alt={tipData.author}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="text-left">
              <div className="font-medium">{tipData.author}</div>
              <div className="text-sm text-gray-500">{tipData.publishDate}</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mb-10 max-w-4xl mx-auto">
          <img
            src={tipData.heroImage}
            alt={tipData.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: tipData.content }}
          />

          {/* Author Bio */}
          <div className="border-t border-b border-gray-200 py-8 my-8">
            <div className="flex items-start">
              <img
                src={tipData.authorImage}
                alt={tipData.author}
                className="w-16 h-16 rounded-full mr-6"
              />
              <div>
                <h3 className="font-bold text-lg mb-2">About {tipData.author}</h3>
                <p className="text-gray-600">{tipData.authorBio}</p>
              </div>
            </div>
          </div>

          {/* Related Tips */}
          {tipData.relatedTips.length > 0 && (
            <div className="my-12">
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tipData.relatedTips.map((tip) => (
                  <Link
                    key={tip.id}
                    to={tip.href}
                    className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={tip.image}
                      alt={tip.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-bold hover:text-blue-600 transition-colors">{tip.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sharing */}
          <div className="my-8 flex justify-center">
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white mx-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.14h-3v4h3v12h5v-12h3.85l.42-4z" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 text-white mx-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white mx-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.372 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-800 text-white mx-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </>
  );
};

export default TipDetailPage;
