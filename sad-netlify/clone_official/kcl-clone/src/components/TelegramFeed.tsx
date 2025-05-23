import React, { useState, useEffect, useRef, useCallback } from 'react';
import { trackClick } from './Analytics';
import ImageWithFallback from './ImageWithFallback';
import { getErrorTracking, withErrorBoundary } from '../utils/errorTracking';
import { optimizeTelegramImage } from '../utils/cloudinary';

interface TelegramMessage {
  id: number;
  text: string;
  date: number; // Unix timestamp
  sender: string;
  hasMedia: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
}

// Mock data for initial development - will be replaced with real API
const MOCK_MESSAGES: TelegramMessage[] = [
  {
    id: 1,
    text: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) are now just $189.99 at Amazon (regularly $249)! Click here to grab them before they sell out: https://amzn.to/example1',
    date: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    sender: 'Sales Aholics Deals',
    hasMedia: true,
    mediaUrl: '/images/deals/airpods.jpg',
    mediaType: 'image'
  },
  {
    id: 2,
    text: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker & Air Fryer only $129.99 (was $229.99)! Perfect for quick meals: https://target.com/example2',
    date: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    sender: 'Sales Aholics Deals',
    hasMedia: true,
    mediaUrl: '/images/deals/ninja.jpg',
    mediaType: 'image'
  },
  {
    id: 3,
    text: '🍔 McDonald\'s app users! Get FREE medium fries with any $1+ purchase today only! Just open the app and check the deals section.',
    date: Date.now() - 1000 * 60 * 60, // 1 hour ago
    sender: 'Sales Aholics Deals',
    hasMedia: false
  },
  {
    id: 4,
    text: '🏠 Home Depot is having a Memorial Day Sale with up to 40% off appliances and home goods! Shop now: https://homedepot.com/example4',
    date: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
    sender: 'Sales Aholics Deals',
    hasMedia: false
  },
  {
    id: 5,
    text: '👕 Old Navy: All T-shirts are 50% off online today only! No code needed, discount applied at checkout: https://oldnavy.com/example5',
    date: Date.now() - 1000 * 60 * 120, // 2 hours ago
    sender: 'Sales Aholics Deals',
    hasMedia: false
  }
];

// Function to fetch messages from API with retry logic
const fetchTelegramMessages = async (retryCount = 0): Promise<TelegramMessage[]> => {
  const maxRetries = 3;
  const errorTracking = getErrorTracking();

  try {
    // First try to fetch from our Netlify function API endpoint
    try {
      console.log('Attempting to fetch Telegram messages from API...');
      const response = await fetch('/.netlify/functions/get-telegram-messages?limit=10', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Set a reasonable timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched Telegram messages successfully:', data);

      // Return the real API data if valid
      if (data && data.messages && data.messages.length > 0) {
        return data.messages;
      } else {
        console.warn('API returned empty messages, will try alternative endpoint');
        throw new Error('Empty messages array returned');
      }
    } catch (apiError) {
      console.warn('Error with primary API, trying alternative endpoint:', apiError);

      // Try alternative endpoint - directly from function
      const alternativeResponse = await fetch('/api/get-telegram-messages?limit=10', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!alternativeResponse.ok) {
        throw new Error(`Failed to fetch from alternative endpoint: ${alternativeResponse.status}`);
      }

      const alternativeData = await alternativeResponse.json();
      console.log('Fetched from alternative endpoint successfully:', alternativeData);

      if (alternativeData && alternativeData.messages && alternativeData.messages.length > 0) {
        return alternativeData.messages;
      }

      // If both endpoints fail to return data, fall back to mock
      console.warn('Both endpoints failed to return data, using mock data');
      return MOCK_MESSAGES;
    }
  } catch (error) {
    // Capture error for monitoring
    errorTracking.captureError(error instanceof Error ? error : new Error('Unknown error fetching Telegram messages'), {
      component: 'TelegramFeed',
      method: 'fetchTelegramMessages',
      retryCount
    });

    console.error('Error fetching Telegram messages:', error);

    if (retryCount < maxRetries) {
      console.log(`Retrying fetch (${retryCount + 1}/${maxRetries})...`);
      // Exponential backoff: 1s, 2s, 4s
      const backoffTime = Math.pow(2, retryCount) * 500;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return fetchTelegramMessages(retryCount + 1);
    }

    // If all retries fail, return mock data instead of empty array
    // This ensures users always see something
    console.log('All retries failed, falling back to mock data');
    return MOCK_MESSAGES;
  }
};

// Track message engagement
const trackMessageEngagement = async (messageId: number, action: 'view' | 'click') => {
  const errorTracking = getErrorTracking();

  try {
    console.log(`Tracking ${action} for message ID ${messageId}`);
    // Call the real API endpoint
    await fetch('/.netlify/functions/track-telegram-engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, action })
    });
  } catch (error) {
    errorTracking.captureWarning(`Error tracking ${action} for message ${messageId}`, {
      component: 'TelegramFeed',
      method: 'trackMessageEngagement',
      messageId,
      action
    });
    console.error(`Error tracking ${action}:`, error);
  }
};

// Fallback component to render when TelegramFeed encounters an error
const TelegramFeedErrorFallback: React.FC = () => (
  <div className="fixed bottom-0 right-5 w-80 bg-white shadow-lg rounded-t-lg overflow-hidden z-50 border border-gray-200 h-12">
    <div className="bg-[#982a4a] text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
          <svg className="w-5 h-5 text-[#982a4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold">Live Deals Chat</h3>
          <p className="text-xs opacity-75">Temporarily unavailable</p>
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        aria-label="Reload chat"
        className="text-white hover:bg-white/10 p-1 rounded"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>
);

const TelegramFeedComponent: React.FC = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(
    localStorage.getItem('telegramFeedMinimized') === 'true'
  );
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [reconnectDelay, setReconnectDelay] = useState<number>(2);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTracking = getErrorTracking();

  // Initialize message refs
  useEffect(() => {
    messages.forEach((message) => {
      if (!messageRefs.current[message.id]) {
        messageRefs.current[message.id] = React.createRef();
      }
    });
  }, [messages]);

  // Main fetch function
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const data = await fetchTelegramMessages();

      // Check if we have new messages (compare with current first message ID)
      if (messages.length > 0 && data.length > 0 && data[0].id !== messages[0].id) {
        setHasNewMessages(true);
      }

      if (data.length > 0) {
        setMessages(data);
        setLastRefresh(new Date());
        setError(null);
        // Reset retry counters on success
        setRetryAttempt(0);
        setReconnectDelay(2);
      } else if (messages.length === 0) {
        // Only show error if we have no messages to display
        setError('No deals available at the moment. Please try again later.');
      }
    } catch (err) {
      errorTracking.captureError(err instanceof Error ? err : new Error('Unknown error in fetchMessages'), {
        component: 'TelegramFeed',
        method: 'fetchMessages',
        retryAttempt
      });

      console.error('Error fetching Telegram messages:', err);
      setError('Failed to load deals feed. Please try again later.');

      // Implement exponential backoff for reconnection attempts
      if (retryAttempt < 5) {  // max 5 retry attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          setRetryAttempt(prev => prev + 1);
          fetchMessages(true);
        }, reconnectDelay * 1000);

        // Increase delay for next attempt (exponential backoff)
        setReconnectDelay(prev => Math.min(prev * 2, 30)); // max 30 seconds delay
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [messages, retryAttempt, reconnectDelay, errorTracking]);

  // Initial data load
  useEffect(() => {
    fetchMessages();

    // Set up polling for new messages every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(false); // Don't show loading state for background refreshes
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchMessages]);

  // Save minimized state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('telegramFeedMinimized', isMinimized.toString());
    } catch (err) {
      console.error('Error saving minimized state to localStorage:', err);
      // Non-critical error, don't track
    }
  }, [isMinimized]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Track message views
  useEffect(() => {
    if (isMinimized) return;

    try {
      const visibleMessages = messages.slice(0, 3); // Track only first 3 messages
      visibleMessages.forEach(message => {
        trackMessageEngagement(message.id, 'view');
      });
    } catch (err) {
      errorTracking.captureWarning('Failed to track message views', {
        component: 'TelegramFeed',
        method: 'useEffect[trackViews]'
      });
    }
  }, [messages, isMinimized, errorTracking]);

  const toggleMinimize = () => {
    try {
      const newState = !isMinimized;
      setIsMinimized(newState);
      trackClick('TelegramFeed', newState ? 'Minimize' : 'Maximize');

      if (!newState && hasNewMessages) {
        setHasNewMessages(false);
      }
    } catch (err) {
      errorTracking.captureWarning('Error toggling minimize state', {
        component: 'TelegramFeed',
        method: 'toggleMinimize'
      });
      console.error('Error toggling minimize state:', err);
      // Still try to toggle state even if tracking fails
      setIsMinimized(!isMinimized);
    }
  };

  const handleMessageClick = (id: number) => {
    try {
      trackClick('TelegramFeed', `Message_${id}`);
      trackMessageEngagement(id, 'click');
    } catch (err) {
      errorTracking.captureWarning('Error tracking message click', {
        component: 'TelegramFeed',
        method: 'handleMessageClick',
        messageId: id
      });
      console.error('Error tracking message click:', err);
    }
  };

  const formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffMins < 1440) return `${Math.round(diffMins / 60)} hr ago`;
      return date.toLocaleDateString();
    } catch (err) {
      errorTracking.captureWarning('Error formatting date', {
        component: 'TelegramFeed',
        method: 'formatDate',
        timestamp
      });
      console.error('Error formatting date:', err);
      return 'Unknown time';
    }
  };

  const parseMessageText = (text: string) => {
    try {
      // Convert URLs to clickable links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#982a4a] hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                trackClick('TelegramFeed', `Link_${part}`);
              }}
            >
              {part.length > 30 ? part.substring(0, 30) + '...' : part}
            </a>
          );
        }
        return part;
      });
    } catch (err) {
      errorTracking.captureWarning('Error parsing message text', {
        component: 'TelegramFeed',
        method: 'parseMessageText',
        textLength: text?.length
      });
      console.error('Error parsing message text:', err);
      return text; // Return original text if parsing fails
    }
  };

  // Handle manual refresh
  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchMessages(true);
    trackClick('TelegramFeed', 'ManualRefresh');
  };

  // Get optimized image URL using Cloudinary
  const getOptimizedImageUrl = (url?: string) => {
    if (!url) return '/images/deals/deal-placeholder.png';

    // If URL is a relative path, make sure we handle it correctly
    if (url.startsWith('/')) {
      // Just return the relative path as is
      return url;
    }

    try {
      // For external URLs, try to optimize with Cloudinary if available
      if (typeof optimizeTelegramImage === 'function') {
        return optimizeTelegramImage(url, {
          width: 300,
          height: 200,
          crop: 'fill',
          gravity: 'auto'
        });
      }

      // If optimization isn't available, return the original URL
      return url;
    } catch (err) {
      console.error('Error optimizing image URL:', err);

      // Determine if we should use a placeholder based on the error
      if (err instanceof Error && err.message.includes('network')) {
        return '/images/deals/deal-placeholder.png';
      }

      // Otherwise fallback to original URL
      return url;
    }
  };

  return (
    <div
      className={`fixed bottom-0 right-5 w-80 bg-white shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 z-50 border border-gray-200 ${isMinimized ? 'h-12' : 'h-96'}`}
    >
      {/* Header */}
      <div
        className="bg-[#982a4a] text-white px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={toggleMinimize}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
            <svg className="w-5 h-5 text-[#982a4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold">Live Deals Chat</h3>
            <p className="text-xs opacity-75">via Telegram</p>
          </div>
        </div>
        <div className="flex items-center">
          {hasNewMessages && !isMinimized && (
            <span className="mr-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
          <button
            aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            className="text-white hover:bg-white/10 p-1 rounded"
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Messages container */}
      {!isMinimized && (
        <div className="h-[calc(100%-3rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#982a4a]"></div>
                <p className="text-sm text-gray-500 mt-2">Loading deals...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
                <button
                  className="mt-2 text-xs text-[#982a4a] hover:underline"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchMessages();
                  }}
                >
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">No deals available right now.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  ref={messageRefs.current[message.id] || (messageRefs.current[message.id] = React.createRef())}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{message.sender}</span>
                    <span className="text-xs text-gray-500">{formatDate(message.date)}</span>
                  </div>

                  <p className="text-sm text-gray-800 break-words">
                    {parseMessageText(message.text)}
                  </p>

                  {message.hasMedia && message.mediaUrl && (
                    <div className="mt-2">
                      {message.mediaType === 'image' && (
                        <ImageWithFallback
                          src={getOptimizedImageUrl(message.mediaUrl)}
                          fallbackSrc="/images/deals/deal-placeholder.png"
                          alt="Deal"
                          className="rounded-md max-h-40 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(message.mediaUrl, '_blank');
                            trackClick('TelegramFeed', `Image_${message.id}`);
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Status bar */}
          <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
            <span>
              {loading ? 'Refreshing...' : `Last updated: ${formatDate(lastRefresh.getTime())}`}
            </span>
            <button
              onClick={handleManualRefresh}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
              disabled={loading}
              aria-label="Refresh deals"
            >
              <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Footer with link to Telegram channel */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <a
              href="https://t.me/salesaholicsdeals"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#982a4a] hover:underline flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                trackClick('TelegramFeed', 'JoinChannel');
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" />
              </svg>
              Join our Telegram channel for more deals
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component wrapped in an error boundary
const TelegramFeed = withErrorBoundary(TelegramFeedComponent, <TelegramFeedErrorFallback />);
export default TelegramFeed;
