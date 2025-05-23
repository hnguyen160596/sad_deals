import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import TelegramFeed from '../components/TelegramFeed';
import InlineTelegramFeed from '../components/InlineTelegramFeed';

// Define the message type
interface TelegramMessage {
  id: number;
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  date: number;
  store?: string;
}

// Mock data for testing when API fails
const MOCK_MESSAGES: TelegramMessage[] = [
  {
    id: 1,
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case',
    price: '$189.99',
    url: 'https://amzn.to/example1',
    imageUrl: '/images/deals/airpods.jpg',
    date: Date.now() - 1000 * 60 * 5 // 5 minutes ago
  },
  {
    id: 2,
    title: 'Ninja Foodi 10-in-1 Pressure Cooker & Air Fryer',
    price: '$129.99',
    url: 'https://amzn.to/example2',
    imageUrl: '/images/deals/ninja.jpg',
    date: Date.now() - 1000 * 60 * 30 // 30 minutes ago
  },
  {
    id: 3,
    title: 'Steel Cash Box with Removable Money Tray',
    price: '$9.99',
    url: 'https://www.amazon.com/dp/B0F1CX4VSH/?tag=salesaholics99-20',
    imageUrl: '/images/deals/deal-placeholder.png',
    date: Date.now() - 1000 * 60 * 60 // 1 hour ago
  },
  {
    id: 4,
    title: 'Home Depot Memorial Day Sale with up to 40% off!',
    price: '$24.99',
    url: 'https://homedepot.com/example4',
    imageUrl: '/images/stores/home-depot.png',
    date: Date.now() - 1000 * 60 * 90 // 1.5 hours ago
  }
];

const TelegramFeedPage: React.FC = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>(MOCK_MESSAGES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'up' | 'down' | 'unknown'>('unknown');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // First try the Netlify function endpoint
        let success = false;
        let responseData;

        try {
          console.log('Attempting to fetch from primary API endpoint...');
          const response = await fetch('/.netlify/functions/get-telegram-messages', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.status}`);
          }

          responseData = await response.json();
          console.log('Fetched telegram messages from primary endpoint:', responseData);
          success = true;
          setApiStatus('up');
        } catch (primaryError) {
          console.warn('Primary endpoint failed, trying alternative:', primaryError);

          // Try alternative endpoint if primary fails
          try {
            const altResponse = await fetch('/api/get-telegram-messages', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(8000) // 8 second timeout for backup
            });

            if (!altResponse.ok) {
              throw new Error(`Alternative API error: ${altResponse.status}`);
            }

            responseData = await altResponse.json();
            console.log('Fetched from alternative endpoint successfully:', responseData);
            success = true;
            setApiStatus('up');
          } catch (altError) {
            console.error('Alternative endpoint also failed:', altError);
            setApiStatus('down');
            throw new Error('Both API endpoints failed');
          }
        }

        if (success && responseData && responseData.messages && responseData.messages.length > 0) {
          setMessages(responseData.messages);
          setError(null);
        } else if (success && responseData) {
          // API worked but returned no messages, keep using mock data
          console.log('API returned no messages, using mock data');
          setError('API returned no messages, showing mock data instead');
        } else {
          throw new Error('No valid data in API response');
        }
      } catch (err) {
        console.error('Error fetching Telegram messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Telegram messages');

        // Already using mock data by default, no need to set it again
        console.log('Using mock data due to API failure');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Telegram Feed - Live Deals</title>
        <meta name="description" content="Get real-time deals from our Telegram channel" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Live Telegram Deals</h1>

        {apiStatus === 'down' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">Note:</p>
            <p>The Telegram API is currently unavailable. Showing sample deals for demonstration purposes.</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Telegram Feed Component Test</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <TelegramFeed />
          </div>
        </div>

        <div className="mt-10 mb-8">
          <h2 className="text-xl font-semibold mb-4">Inline Telegram Feed Component Test</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <InlineTelegramFeed />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <button
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Try again
                  fetch('/.netlify/functions/get-telegram-messages')
                    .then(res => res.json())
                    .then(data => {
                      if (data && data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                        setApiStatus('up');
                      }
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error(err);
                      setError('Failed to load Telegram messages on retry');
                      setApiStatus('down');
                      setLoading(false);
                    });
                }}
              >
                Try Again
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p>No messages found. The API returned an empty array.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages.map(message => (
                <div key={message.id} className="border rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={message.imageUrl || '/images/deals/deal-placeholder.png'}
                      alt={message.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/deals/deal-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-xl mb-1">{message.price}</div>
                    <p className="text-gray-700 text-base mb-2">{message.title}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {message.store || 'Unknown Store'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(message.date).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={message.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      View Deal
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Status & Debug Info</h2>
          <div className="mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              apiStatus === 'up' ? 'bg-green-100 text-green-800' :
              apiStatus === 'down' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              API Status: {apiStatus === 'up' ? 'Online' : apiStatus === 'down' ? 'Offline' : 'Unknown'}
            </div>
          </div>
          <div className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify({ messages: messages.slice(0, 2), error, loading, apiStatus }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TelegramFeedPage;
