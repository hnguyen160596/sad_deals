import type React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import CommentSection from '../components/CommentSection';
import FavoriteButton from '../components/FavoriteButton';
import { useComments } from '../context/CommentContext';

// Sample post data for demo purposes
const samplePosts: Record<string, {
  id: string;
  type: 'deal' | 'tip';
  title: string;
  image: string;
  store: string;
  storeImage: string;
  date: string;
  content: string;
  price?: string;
  originalPrice?: string;
  discount?: string;
  link?: string;
  expired?: boolean;
}> = {
  'this-amazon-approved-ionic-blow-dryer-is-only-usd27-after-markdowns': {
    id: 'deal-1',
    type: 'deal',
    title: 'This Amazon-Approved Ionic Hair Dryer Is Only $25 After Markdowns',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/5LRKyxiEggf1xXgnmgf0LH/401955e80bb626e397279b935e98e80a/Maroon___Pink.png?w=520&fit=max&auto=format&q=90',
    store: 'Amazon',
    storeImage: 'https://ext.same-assets.com/3000230773/4055390373.png',
    date: 'May 6, 2025',
    content: `<div class="post-content">
      <p>Looking for a powerful hair dryer that won't break the bank? Check out this highly-rated ionic hair dryer on Amazon that's now on sale for just $25!</p>

      <h2>Why We Love This Deal</h2>
      <ul>
        <li>Professional quality at a budget price</li>
        <li>Ionic technology reduces frizz and drying time</li>
        <li>Multiple heat settings</li>
        <li>Lightweight design</li>
        <li>Over 5,000 5-star reviews</li>
      </ul>

      <h2>How to Get the Deal</h2>
      <ol>
        <li>Head to Amazon using our link below</li>
        <li>Choose your preferred color (maroon or pink)</li>
        <li>Add to cart and checkout</li>
        <li>No promo code needed - discount applied automatically!</li>
      </ol>

      <p>Don't miss out on this amazing deal - it's likely to sell out quickly at this price!</p>
    </div>`,
    price: '$25.99',
    originalPrice: '$49.99',
    discount: '48% off',
    link: 'https://www.amazon.com',
  },
  'kate-spade-large-crossbody-only-usd79-shipped-reg-usd329': {
    id: 'deal-2',
    type: 'deal',
    title: 'Kate Spade Large Crossbody, Only $79 Shipped (Reg. $329)',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/UzKN0TQHprekCOQQsczqU/eef2765cca4f67a76654fc5b016a9089/kate_spade_crosbody.jpg?w=520&fit=max&auto=format&q=90',
    store: 'Kate Spade',
    storeImage: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/3CYHPBH5cIaO6QSwMY8iCG/2a296bb13c20ff5babe7beb7289e23c4/kate-spade-icon.png?w=46&fit=max&auto=format&q=90',
    date: 'May 7, 2025',
    content: `<div class="post-content">
      <p>This Kate Spade crossbody bag is a steal at just $79! Perfect for everyday use with its classic design and practical features.</p>

      <h2>Deal Details</h2>
      <ul>
        <li>Original price: $329</li>
        <li>Sale price: $79</li>
        <li>Total savings: $250 (76% off!)</li>
        <li>Free shipping with code FREESHIP</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>Pebbled leather exterior</li>
        <li>Adjustable strap</li>
        <li>Interior zip and slip pockets</li>
        <li>Gold-tone hardware</li>
        <li>Multiple color options available</li>
      </ul>

      <p>This deal is only available while supplies last, so don't wait too long!</p>
    </div>`,
    price: '$79.00',
    originalPrice: '$329.00',
    discount: '76% off',
    link: 'https://www.katespade.com',
  },
  'target-car-seat-trade-in': {
    id: 'tip-1',
    type: 'tip',
    title: 'Target Car Seat Trade-In Event: Get 20% Off New Car Seats',
    image: 'https://content-images.thekrazycouponlady.com/nie44ndm9bqr/2BZ4I2Uo0M7qjlupnYsUYy/3a5a4ca7c6f59bd5d7be55190363b5f9/Target-Car-Seat-Tradein-Event-Stack.jpeg?w=520&fit=max&auto=format&q=90',
    store: 'Target',
    storeImage: 'https://ext.same-assets.com/3000230773/1149209340.png',
    date: 'May 5, 2025',
    content: `<div class="post-content">
      <p>Target's popular Car Seat Trade-In Event is back! Recycle your old car seat and receive a 20% off coupon for a new car seat, stroller, or select baby gear.</p>

      <h2>Event Details</h2>
      <ul>
        <li>Dates: May 15-28, 2025</li>
        <li>Location: Any Target store</li>
        <li>No purchase receipt necessary</li>
        <li>Coupon valid through June 11, 2025</li>
      </ul>

      <h2>How It Works</h2>
      <ol>
        <li>Bring your old, expired, or damaged car seat to any Target store</li>
        <li>Look for the drop-off box near Guest Services</li>
        <li>Scan the code on the box with your Target Circle app</li>
        <li>Receive a 20% off coupon in your Target Circle account</li>
        <li>Use coupon online or in-store for new car seats, strollers, and select baby gear</li>
      </ol>

      <h2>Pro Tips</h2>
      <ul>
        <li>You can trade in up to two car seats per household (each trade-in gets a separate 20% off coupon)</li>
        <li>The coupon can be used on sale items for even more savings</li>
        <li>If you don't have the Target app, a team member can help you get set up</li>
      </ul>

      <p>This is an excellent opportunity to safely dispose of old car seats and save money on new baby gear!</p>
    </div>`,
  },
};

const PostPage: React.FC = () => {
  const { year, month, day, slug } = useParams<{ year: string; month: string; day: string; slug: string }>();
  const { getCommentCount } = useComments();

  // Use slug to find the post or use the first sample post as fallback
  const post = slug && samplePosts[slug]
    ? samplePosts[slug]
    : Object.values(samplePosts)[0];

  const postId = post.id;
  const commentCount = getCommentCount(postId);

  return (
    <Layout>
      <SEO
        title={`${post.title} | Sales Aholics Deals`}
        description={`Get the details on ${post.title} and save big today!`}
        canonicalUrl={`https://salesaholicsdeals.com/${year || '2025'}/${month || '05'}/${day || '07'}/${slug || 'sample-post'}`}
        image={post.image}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <img
              src={post.storeImage}
              alt={post.store}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">{post.store}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex space-x-4 items-center">
              <div className="flex items-center space-x-1 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>{commentCount} Comments</span>
              </div>

              <FavoriteButton
                itemId={post.id}
                itemType={post.type}
                itemTitle={post.title}
                itemUrl={`/${year || '2025'}/${month || '05'}/${day || '07'}/${slug || 'sample-post'}`}
                itemImage={post.image}
                className="flex items-center space-x-1 text-gray-600"
              />
            </div>

            {post.type === 'deal' && post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Shop Now
              </a>
            )}
          </div>
        </div>

        {/* Post Image and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-6">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>

            {post.type === 'deal' && post.price && (
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500">Deal Price:</span>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-green-600 mr-2">{post.price}</span>
                      {post.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{post.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {post.discount && (
                    <div className="bg-red-100 text-red-800 font-medium px-3 py-1 rounded-full">
                      {post.discount}
                    </div>
                  )}
                </div>

                {post.expired && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    This deal has expired. Check back for more deals soon!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">
                {post.type === 'deal' ? 'Deal Summary' : 'Tip Summary'}
              </h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{post.type === 'deal' ? 'Verified working deal' : 'Helpful savings tip'}</span>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Updated {post.date}</span>
                </div>

                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.type === 'deal' ? 'No coupon code needed' : 'Step-by-step instructions included'}</span>
                </div>

                {post.type === 'deal' && post.link && (
                  <div className="mt-6">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 px-4 bg-primary text-white text-center rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Get This Deal
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-12">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Comments Section */}
        <CommentSection postId={postId} postType={post.type} />
      </div>
    </Layout>
  );
};

export default PostPage;
