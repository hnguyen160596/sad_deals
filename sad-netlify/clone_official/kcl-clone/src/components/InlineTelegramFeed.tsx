import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { trackClick } from './Analytics';

// Function to track user engagement with Telegram messages
const trackMessageEngagement = async (messageId: number | string, action: 'view' | 'click' | 'save' | 'share') => {
  try {
    const response = await fetch('/api/track-telegram-engagement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId,
        action,
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to track ${action} for message ${messageId}`);
    }

    return response.ok;
  } catch (error) {
    console.error(`Error tracking ${action}:`, error);
    return false;
  }
};

interface TelegramMessage {
  id: number;
  price: string;
  title: string;
  url: string;
  imageUrl: string;
  date: number; // Unix timestamp
  tag?: string;
  viewCount?: number;
  store?: string;
  category?: string;
  isAffiliate?: boolean;
  submittedBy?: string;
  isVerified?: boolean;
}

// Mock data for initial development - will be replaced with real API
const MOCK_MESSAGES: TelegramMessage[] = [
  {
    id: 1,
    price: '$189.99',
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case, Wireless Earbuds',
    url: 'https://amzn.to/example1',
    imageUrl: '/images/deals/airpods.jpg',
    date: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    tag: 'salesaholics99-20',
    viewCount: 1234,
    store: 'Amazon',
    category: 'Electronics'
  },
  {
    id: 2,
    price: '$129.99',
    title: 'Ninja Foodi 10-in-1 Pressure Cooker & Air Fryer, Perfect for Quick Meals',
    url: 'https://amzn.to/example2',
    imageUrl: '/images/deals/ninja.jpg',
    date: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    tag: 'salesaholics99-20',
    viewCount: 986,
    store: 'Amazon',
    category: 'Kitchen'
  },
  {
    id: 3,
    price: '$9.xx',
    title: 'Steel Cash Box with Removable Money Tray, Money Saving Box with Key, Durable & Scratch Resistant Black Safety Box, Medium',
    url: 'https://www.amazon.com/dp/B0F1CX4VSH/?tag=salesaholics99-20',
    imageUrl: 'https://ext.same-assets.com/3000230773/3567289451.jpg',
    date: Date.now() - 1000 * 60 * 60, // 1 hour ago
    tag: 'salesaholics99-20',
    viewCount: 1,
    store: 'Amazon',
    category: 'Home'
  },
  {
    id: 4,
    price: '$24.99',
    title: 'Home Depot Memorial Day Sale with up to 40% off appliances and home goods!',
    url: 'https://homedepot.com/example4',
    imageUrl: '/images/stores/home-depot.png',
    date: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
    viewCount: 458,
    store: 'Home Depot',
    category: 'Sale'
  },
  {
    id: 5,
    price: '$14.50',
    title: 'Women\'s Casual Joggers with Pockets, Lightweight Athletic Sweatpants',
    url: 'https://www.amazon.com/dp/example5/?tag=salesaholics99-20',
    imageUrl: 'https://ext.same-assets.com/3000230773/2846527108.jpg',
    date: Date.now() - 1000 * 60 * 120, // 2 hours ago
    tag: 'salesaholics99-20',
    viewCount: 219,
    store: 'Amazon',
    category: 'Clothing'
  },
  // Example of a subscriber-submitted affiliate deal
  {
    id: 6,
    price: '$32.99',
    title: 'Wireless Headphones with Noise Cancellation, 40 Hour Battery Life',
    url: 'https://www.amazon.com/dp/example6/?tag=subs-aff-01',
    imageUrl: 'https://ext.same-assets.com/3000230773/headphones-deal.jpg',
    date: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    tag: 'subs-aff-01',
    viewCount: 87,
    store: 'Amazon',
    category: 'Electronics',
    isAffiliate: true,
    submittedBy: 'JohnDoe',
    isVerified: true
  },
  // Example of a subscriber-submitted affiliate deal pending approval
  {
    id: 7,
    price: '$19.99',
    title: 'Smart Water Bottle with Temperature Display, 24oz',
    url: 'https://www.amazon.com/dp/example7/?tag=subs-aff-02',
    imageUrl: 'https://ext.same-assets.com/3000230773/smart-bottle.jpg',
    date: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    tag: 'subs-aff-02',
    viewCount: 12,
    store: 'Amazon',
    category: 'Home',
    isAffiliate: true,
    submittedBy: 'JaneSmith',
    isVerified: false
  }
];

// Mock interface for deal submission
interface DealSubmission {
  title: string;
  price: string;
  url: string;
  imageUrl: string;
  store: string;
  category: string;
  affiliateTag: string;
}

// Mock pending submissions to simulate admin approval process
const MOCK_PENDING_SUBMISSIONS: DealSubmission[] = [
  {
    title: 'Electric Standing Desk 55" Home Office Desk with Dual Motors',
    price: '$199.99',
    url: 'https://www.amazon.com/dp/B0CXJ7DW2V/?tag=user1-aff-20',
    imageUrl: 'https://ext.same-assets.com/3000230773/standing-desk.jpg',
    store: 'Amazon',
    category: 'Home Office',
    affiliateTag: 'user1-aff-20'
  },
  {
    title: 'Robot Vacuum and Mop Combo, Smart Navigation with App Control',
    price: '$279.99',
    url: 'https://www.amazon.com/dp/B09TRPXT15/?tag=user2-aff-30',
    imageUrl: 'https://ext.same-assets.com/3000230773/robot-vacuum.jpg',
    store: 'Amazon',
    category: 'Home',
    affiliateTag: 'user2-aff-30'
  }
];

// Add a function to fetch messages from our API
const fetchTelegramMessages = async (
  page = 1,
  limit = 10,
  store: string | undefined = 'all',
  priceRange: string | undefined = 'all',
  after = 0
): Promise<TelegramMessage[]> => {
  try {
    // Build the query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (store && store !== 'all') {
      params.append('store', store);
    }

    if (priceRange && priceRange !== 'all') {
      params.append('priceRange', priceRange);
    }

    if (after > 0) {
      params.append('after', after.toString());
    }

    // Add cache buster for development to avoid stale cache
    if (import.meta.env.DEV) {
      params.append('_cb', Date.now().toString());
    }

    try {
      // Try primary API endpoint
      console.log('Attempting to fetch from primary endpoint...');
      const response = await fetch(`/.netlify/functions/get-telegram-messages?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched telegram messages successfully:', data);

      if (data && data.messages && data.messages.length > 0) {
        return data.messages;
      }

      throw new Error('Empty messages from primary endpoint');
    } catch (primaryError) {
      console.warn('Primary endpoint failed, trying alternative:', primaryError);

      // Try alternative endpoint
      const altResponse = await fetch(`/api/get-telegram-messages?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000) // 8 second timeout for backup
      });

      if (!altResponse.ok) {
        throw new Error(`Alternative API error: ${altResponse.status}`);
      }

      const altData = await altResponse.json();

      if (altData && altData.messages && altData.messages.length > 0) {
        return altData.messages;
      }

      throw new Error('No valid data from either endpoint');
    }
  } catch (error) {
    console.error('Error fetching Telegram messages:', error);

    // Always return mock data in case of error to ensure UI shows something
    console.log('Falling back to mock data');
    if (page > 1) {
      // For pagination, return fewer items on later pages
      return MOCK_MESSAGES.slice(0, Math.max(1, MOCK_MESSAGES.length - (page - 1) * 2));
    }
    return MOCK_MESSAGES;
  }
};

const InlineTelegramFeed: React.FC = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [savedDeals, setSavedDeals] = useState<number[]>(() => {
    // Load saved deals from localStorage
    const saved = localStorage.getItem('savedDeals');
    return saved ? JSON.parse(saved) : [];
  });
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [hasNewDeals, setHasNewDeals] = useState<boolean>(false);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(() => {
    // Load last seen timestamp from localStorage
    const timestamp = localStorage.getItem('lastSeenTimestamp');
    return timestamp ? parseInt(timestamp, 10) : 0;
  });
  const [showOnlySavedDeals, setShowOnlySavedDeals] = useState<boolean>(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);
  const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [formData, setFormData] = useState<DealSubmission>({
    title: '',
    price: '',
    url: '',
    imageUrl: '',
    store: '',
    category: '',
    affiliateTag: ''
  });

  const [pendingSubmissions, setPendingSubmissions] = useState<DealSubmission[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Add state for pagination
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [integrationHealth, setIntegrationHealth] = useState<{status: string; health_score: number} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Engagement tracking: refs for each message
  const messageRefs = useRef<{[key: number]: React.RefObject<HTMLDivElement>}>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if user is a subscriber (this would be replaced with actual auth check)
    const checkSubscriberStatus = async () => {
      setTimeout(() => {
        setIsSubscriber(localStorage.getItem('isSubscriber') === 'true');
      }, 500);
    };

    checkSubscriberStatus();
  }, []);

  useEffect(() => {
    // Mock check for admin role (would be a real authorization check in production)
    const checkAdminStatus = async () => {
      setTimeout(() => {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      }, 500);
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      setPendingSubmissions(MOCK_PENDING_SUBMISSIONS);

      // Check integration health status if admin
      const checkIntegrationHealth = async () => {
        try {
          const response = await fetch('/api/telegram-status');
          if (response.ok) {
            const data = await response.json();
            setIntegrationHealth(data);
          }
        } catch (error) {
          console.error('Error checking integration health:', error);
        }
      };

      checkIntegrationHealth();

      // Check health every 5 minutes
      const healthInterval = setInterval(checkIntegrationHealth, 5 * 60 * 1000);
      return () => clearInterval(healthInterval);
    }
  }, [isAdmin]);

  useEffect(() => {
    // Function to fetch messages from our API
    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Fetch messages from our API
        const data = await fetchTelegramMessages(
          page,
          expanded ? 20 : 10, // Fetch more if expanded
          storeFilter !== 'all' ? storeFilter : undefined,
          priceFilter !== 'all' ? priceFilter : undefined
        );

        setMessages(prevMessages => {
          // If first page, replace messages
          // Otherwise append to existing messages
          return page === 1 ? data : [...prevMessages, ...data];
        });

        setHasMore(data.length === (expanded ? 20 : 10));

        // Check for new messages
        const newestMessageTimestamp = data.length > 0
          ? Math.max(...data.map(msg => msg.date), 0)
          : 0;

        if (newestMessageTimestamp > lastSeenTimestamp && lastSeenTimestamp !== 0) {
          setHasNewDeals(true);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching Telegram messages:', err);
        setError('Failed to load deals feed. Please try again later.');
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up polling for new messages every 60 seconds
    const interval = setInterval(() => {
      // Only check for new messages, don't replace the current view
      const checkNewMessages = async () => {
        try {
          // Get the newest message timestamp we have
          const newestTimestamp = messages.length > 0
            ? Math.max(...messages.map(msg => msg.date), 0)
            : 0;

          // Fetch messages newer than our newest
          const newMessages = await fetchTelegramMessages(
            1,
            5,
            undefined,
            undefined,
            newestTimestamp
          );

          if (newMessages.length > 0) {
            setMessages(prev => [...newMessages, ...prev]);
            setHasNewDeals(true);
          }
        } catch (error) {
          console.error('Error checking for new messages:', error);
        }
      };

      checkNewMessages();
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [page, expanded, storeFilter, priceFilter]);

  // Add scroll event listener for scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        setShowScrollTop(messagesContainerRef.current.scrollTop > 300);
      }
    };

    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      return () => messagesContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Save to localStorage whenever savedDeals changes
  useEffect(() => {
    localStorage.setItem('savedDeals', JSON.stringify(savedDeals));
  }, [savedDeals]);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!expanded) return;

      if (e.key === 'Escape') {
        setExpanded(false);
      } else if (e.key === 'ArrowUp') {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollBy(0, -100);
        }
      } else if (e.key === 'ArrowDown') {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollBy(0, 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  // Engagement tracking: Intersection Observer for message views
  useEffect(() => {
    const viewedMessages = new Set<number>();

    observerRef.current = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const messageId = entry.target.getAttribute('data-message-id');
          if (entry.isIntersecting && messageId && !viewedMessages.has(parseInt(messageId))) {
            trackMessageEngagement(messageId, 'view');
            viewedMessages.add(parseInt(messageId));
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe message elements when they're rendered
  useEffect(() => {
    messages.forEach((message) => {
      if (messageRefs.current[message.id] && messageRefs.current[message.id].current) {
        observerRef.current?.observe(messageRefs.current[message.id].current as Element);
      }
    });

    return () => {
      messages.forEach((message) => {
        if (messageRefs.current[message.id] && messageRefs.current[message.id].current) {
          observerRef.current?.unobserve(messageRefs.current[message.id].current as Element);
        }
      });
    };
  }, [messages]);

  // Initialize message refs
  useEffect(() => {
    messages.forEach((message) => {
      if (!messageRefs.current[message.id]) {
        messageRefs.current[message.id] = React.createRef();
      }
    });
  }, [messages]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeAgo = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    try {
      trackClick('InlineTelegramFeed', expanded ? 'Collapse' : 'Expand');
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Mark all as seen when expanding
    if (!expanded) {
      const newestMessageTimestamp = Math.max(...messages.map(msg => msg.date), 0);
      setLastSeenTimestamp(newestMessageTimestamp);
      localStorage.setItem('lastSeenTimestamp', newestMessageTimestamp.toString());
      setHasNewDeals(false);
    }
  };

  // Engagement: track click
  const handleMessageClick = useCallback((messageId: number) => {
    trackMessageEngagement(messageId, 'click');
  }, []);

  // Engagement: track save
  const handleSaveDeal = useCallback((id: number) => {
    setSavedDeals(prev => {
      if (prev.includes(id)) {
        return prev.filter(dealId => dealId !== id);
      } else {
        return [...prev, id];
      }
    });

    try {
      trackClick('InlineTelegramFeed', savedDeals.includes(id) ? 'UnsaveDeal' : 'SaveDeal');
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Track save engagement
    trackMessageEngagement(id, 'save');
  }, [savedDeals]);

  // Engagement: track share
  const handleShareDeal = useCallback((messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // Share logic
    if (navigator.share) {
      navigator.share({
        title: message.title,
        text: `${message.title} - ${message.price}`,
        url: message.url,
      }).catch(error => console.log('Error sharing', error));
    } else {
      // Fallback copy to clipboard
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = `${message.title} - ${message.price}\n${message.url}`;
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      alert('Deal link copied to clipboard!');
    }

    // Track share engagement
    trackMessageEngagement(messageId, 'share');
  }, [messages]);

  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitDeal = (e: React.FormEvent) => {
    e.preventDefault();

    trackClick('InlineTelegramFeed', 'SubmitAffiliateDeal');

    alert('Your deal has been submitted for admin approval. It will appear in the feed once approved.');
    setShowSubmissionForm(false);
    setFormData({
      title: '',
      price: '',
      url: '',
      imageUrl: '',
      store: '',
      category: '',
      affiliateTag: ''
    });
  };

  const approveDeal = (submission: DealSubmission, index: number) => {
    const newMessage: TelegramMessage = {
      id: Math.max(...messages.map(m => m.id)) + 1,
      price: submission.price,
      title: submission.title,
      url: submission.url,
      imageUrl: submission.imageUrl,
      date: Date.now(),
      tag: submission.affiliateTag,
      viewCount: 0,
      store: submission.store,
      category: submission.category,
      isAffiliate: true,
      submittedBy: 'Subscriber',
      isVerified: true
    };

    setMessages(prev => [newMessage, ...prev]);
    setPendingSubmissions(prev => prev.filter((_, i) => i !== index));
    alert('Deal approved and published to the feed!');
  };

  const rejectDeal = (index: number) => {
    setPendingSubmissions(prev => prev.filter((_, i) => i !== index));
    alert('Deal rejected and removed from queue.');
  };

  // Apply filters
  const filteredMessages = messages.filter(message => {
    if (showOnlySavedDeals && !savedDeals.includes(message.id)) {
      return false;
    }

    if (storeFilter !== 'all' && message.store !== storeFilter) {
      return false;
    }

    if (priceFilter !== 'all') {
      const price = parseFloat(message.price.replace(/[^0-9.]/g, ''));

      if (priceFilter === 'under25' && price >= 25) {
        return false;
      } else if (priceFilter === '25to50' && (price < 25 || price > 50)) {
        return false;
      } else if (priceFilter === '50to100' && (price < 50 || price > 100)) {
        return false;
      } else if (priceFilter === 'over100' && price <= 100) {
        return false;
      }
    }

    return true;
  });

  // Get unique stores for filter dropdown
  const storeOptions = ['all', ...Array.from(new Set(messages.map(m => m.store).filter(Boolean)))];

  // Add function to load more messages
  const loadMoreMessages = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#17212b] rounded-lg overflow-hidden shadow-lg transform transition-all duration-300">
          <div className="bg-[#17212b] text-white p-3 flex justify-between items-center border-b border-[#0e1621]">
            <div className="flex items-center">
              <div className="flex flex-col">
                <h2 className="text-lg font-medium text-white">Sales-Aholic</h2>
                <p className="text-sm text-gray-400">1,618 subscribers</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {hasNewDeals && (
                <div className="relative">
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="text-gray-400 hover:text-white transition-colors relative"
                  aria-label="Admin Panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {pendingSubmissions.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingSubmissions.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleToggleExpand}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={expanded ? "Collapse feed" : "Expand feed"}
              >
                {expanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
              <Link
                to="/live-deals-feed"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <Link
                to={savedDeals.length > 0 ? "/saved-deals" : "#"}
                className={`text-gray-400 hover:text-white transition-colors ${savedDeals.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedDeals.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#0088cc] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {savedDeals.length}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {isAdmin && showAdminPanel && (
            <div className="bg-[#242f3d] p-4 border-b border-[#0e1621] animate-fadeIn">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <h3 className="text-white text-md font-medium">Admin Review Panel</h3>
                  {integrationHealth && (
                    <div className="ml-3 flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          integrationHealth.status === 'healthy'
                            ? 'bg-green-500'
                            : integrationHealth.status === 'issues_detected'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {integrationHealth.status === 'healthy'
                          ? 'System healthy'
                          : integrationHealth.status === 'issues_detected'
                            ? 'Issues detected'
                            : 'System error'}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({integrationHealth.health_score}/100)
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <p>No pending submissions to review</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {pendingSubmissions.map((submission, index) => (
                    <div key={index} className="bg-[#17212b] p-3 rounded">
                      <div className="flex mb-2">
                        <div className="w-20 h-20 bg-black rounded overflow-hidden mr-3 flex-shrink-0">
                          <img
                            src={submission.imageUrl}
                            alt={submission.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/deals/deal-placeholder.png';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{submission.price}</div>
                          <p className="text-gray-300 text-sm line-clamp-2">{submission.title}</p>
                          <div className="flex text-xs text-gray-400 mt-1 space-x-2">
                            <span>{submission.store}</span>
                            <span>•</span>
                            <span>{submission.category}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Tag: {submission.affiliateTag}
                          </div>
                        </div>
                      </div>

                      <a
                        href={submission.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#64aaed] text-xs hover:underline break-all block mb-3"
                      >
                        {submission.url}
                      </a>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => rejectDeal(index)}
                          className="px-3 py-1 text-xs bg-[#982a4a] hover:bg-[#b03353] text-white rounded transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => approveDeal(submission, index)}
                          className="px-3 py-1 text-xs bg-[#0088cc] hover:bg-[#0077b5] text-white rounded transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400 border-t border-[#0e1621] pt-3">
                <div className="flex justify-between">
                  <div>
                    <p>Admin Instructions:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Review all submitted deals for appropriate content</li>
                      <li>Verify affiliate tags are correctly formatted</li>
                      <li>Check image quality and relevance</li>
                      <li>Ensure price accuracy</li>
                    </ul>
                  </div>

                  {integrationHealth && (
                    <div className="ml-4 max-w-[200px]">
                      <p>System Status:</p>
                      <div className="mt-1 bg-[#17212b] p-2 rounded">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>Health Score:</span>
                          <span className={`font-medium ${
                            integrationHealth.health_score > 80
                              ? 'text-green-400'
                              : integrationHealth.health_score > 50
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }`}>
                            {integrationHealth.health_score}/100
                          </span>
                        </div>
                        <div className="w-full bg-[#0e1621] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              integrationHealth.health_score > 80
                                ? 'bg-green-500'
                                : integrationHealth.health_score > 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${integrationHealth.health_score}%` }}>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px]">
                          <a
                            href="/api/telegram-status?admin=true"
                            target="_blank"
                            className="text-[#0088cc] hover:underline"
                          >
                            View detailed status →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isSubscriber && (
            <div className="bg-[#242f3d] text-white p-2 text-center border-b border-[#0e1621]">
              <button
                onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                className="text-[#0088cc] hover:text-[#0099dd] text-sm font-medium transition-colors focus:outline-none flex items-center justify-center mx-auto"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showSubmissionForm ? 'Cancel submission' : 'Submit your affiliate deal'}
              </button>
            </div>
          )}

          {isSubscriber && showSubmissionForm && (
            <div className="bg-[#242f3d] p-4 border-b border-[#0e1621] animate-fadeIn">
              <h3 className="text-white text-md mb-3 font-medium">Submit Your Affiliate Deal</h3>
              <p className="text-gray-400 text-xs mb-4">Your deal will be reviewed by an admin before appearing in the feed.</p>

              <form onSubmit={handleSubmitDeal} className="space-y-3">
                <div>
                  <label htmlFor="title" className="block text-gray-400 text-xs mb-1">Product Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                    placeholder="Product title"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="price" className="block text-gray-400 text-xs mb-1">Price</label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                      placeholder="$XX.XX"
                    />
                  </div>

                  <div className="flex-1">
                    <label htmlFor="store" className="block text-gray-400 text-xs mb-1">Store</label>
                    <select
                      id="store"
                      name="store"
                      value={formData.store}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                    >
                      <option value="">Select Store</option>
                      {storeOptions.filter(s => s !== 'all').map(store => (
                        <option key={store} value={store}>{store}</option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="url" className="block text-gray-400 text-xs mb-1">Product URL (with your affiliate tag)</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-gray-400 text-xs mb-1">Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label htmlFor="affiliateTag" className="block text-gray-400 text-xs mb-1">Your Affiliate Tag</label>
                  <input
                    type="text"
                    id="affiliateTag"
                    name="affiliateTag"
                    value={formData.affiliateTag}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                    placeholder="your-tag-123"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-gray-400 text-xs mb-1">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-[#17212b] text-white text-sm rounded p-2 border border-[#0e1621] focus:border-[#0088cc] focus:outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Toys">Toys</option>
                    <option value="Sale">Sale</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="mr-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-[#0088cc] hover:bg-[#0077b5] text-white rounded transition-colors focus:outline-none"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </div>
          )}

          {expanded && (
            <div className="bg-[#17212b] p-3 border-b border-[#0e1621] flex flex-wrap gap-2">
              <select
                className="bg-[#242f3d] text-white border-none rounded px-3 py-1 text-sm"
                value={storeFilter}
                onChange={(e) => {
                  setStoreFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Stores</option>
                {storeOptions.filter(store => store !== 'all').map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>

              <select
                className="bg-[#242f3d] text-white border-none rounded px-3 py-1 text-sm"
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Prices</option>
                <option value="under25">Under $25</option>
                <option value="25to50">$25 to $50</option>
                <option value="50to100">$50 to $100</option>
                <option value="over100">Over $100</option>
              </select>

              <button
                className="bg-[#242f3d] text-white border-none rounded px-3 py-1 text-sm flex items-center"
                onClick={() => {
                  setStoreFilter('all');
                  setPriceFilter('all');
                  setShowOnlySavedDeals(false);
                  setPage(1);
                }}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>

              {savedDeals.length > 0 && (
                <button
                  className={`bg-[#242f3d] text-white border-none rounded px-3 py-1 text-sm ml-auto flex items-center ${showOnlySavedDeals ? 'bg-[#0088cc]' : ''}`}
                  onClick={() => setShowOnlySavedDeals(!showOnlySavedDeals)}
                >
                  <svg className="w-3 h-3 mr-1" fill={showOnlySavedDeals ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {showOnlySavedDeals ? 'All Deals' : `Saved Deals (${savedDeals.length})`}
                </button>
              )}
            </div>
          )}

          <div
            className={`bg-[#0e1621] transition-all duration-300 overflow-hidden relative ${expanded ? 'max-h-[800px]' : 'max-h-[500px]'}`}
          >
            {loading && page === 1 ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-[#982a4a] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error && messages.length === 0 ? (
              <div className="text-center p-8 text-gray-400">
                <p>{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setPage(1);
                  }}
                  className="mt-4 text-[#982a4a] hover:text-[#b03353] underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No deals match your filters</p>
                <button
                  className="mt-2 text-[#0088cc] hover:underline"
                  onClick={() => {
                    setStoreFilter('all');
                    setPriceFilter('all');
                    setShowOnlySavedDeals(false);
                    setPage(1);
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                ref={messagesContainerRef}
                className="divide-y divide-[#17212b]/50 overflow-y-auto"
                style={{ maxHeight: expanded ? '800px' : '500px' }}
                onScroll={(e) => {
                  const container = e.currentTarget;
                  if (
                    !loading &&
                    hasMore &&
                    container.scrollHeight - container.scrollTop <= container.clientHeight + 200
                  ) {
                    loadMoreMessages();
                  }
                }}
              >
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover:bg-[#17212b]/50 transition-colors relative"
                    ref={messageRefs.current[message.id] || (messageRefs.current[message.id] = React.createRef())}
                    data-message-id={message.id}
                  >
                    {message.isAffiliate && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`px-2 py-0.5 rounded-full text-xs uppercase ${message.isVerified ? 'bg-green-600/80 text-white' : 'bg-yellow-500/80 text-black'}`}>
                          {message.isVerified ? 'Verified' : 'Pending'}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center mb-2">
                      <span className="text-gray-300 font-medium">Sales-Aholic</span>
                      {message.isAffiliate && message.submittedBy && (
                        <span className="text-gray-400 text-xs ml-2">
                          via <span className="text-[#0088cc]">@{message.submittedBy}</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={message.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-2"
                      onClick={() => {
                        trackClick('InlineTelegramFeed', `Image_${message.id}`);
                        handleMessageClick(message.id);
                      }}
                    >
                      <div className="relative bg-black rounded overflow-hidden" style={{ paddingBottom: '75%' }}>
                        <img
                          src={message.imageUrl}
                          alt={message.title}
                          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/deals/deal-placeholder.png';
                          }}
                        />
                      </div>
                    </a>

                    <div className="text-white mb-1">
                      <div className="font-medium">{message.price}</div>
                      <p className="text-gray-300 break-words mb-1">{message.title}</p>
                      <a
                        href={message.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#64aaed] hover:underline break-all text-sm"
                        onClick={() => {
                          trackClick('InlineTelegramFeed', `Link_${message.id}`);
                          handleMessageClick(message.id);
                        }}
                      >
                        {message.url}
                      </a>
                      {message.tag && (
                        <div className="text-gray-500 text-xs mt-1">
                          tag={message.tag}
                        </div>
                      )}
                    </div>

                    <div className="flex mt-2 -mx-1">
                      <button
                        className="flex-1 mx-1 py-1.5 px-2 text-xs rounded text-white bg-[#242f3d] hover:bg-[#36475a] transition-colors flex items-center justify-center"
                        onClick={() => handleSaveDeal(message.id)}
                      >
                        {savedDeals.includes(message.id) ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Saved
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Save
                          </>
                        )}
                      </button>

                      <button
                        className="flex-1 mx-1 py-1.5 px-2 text-xs rounded text-white bg-[#242f3d] hover:bg-[#36475a] transition-colors flex items-center justify-center"
                        onClick={() => handleShareDeal(message.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                          <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                        </svg>
                        Share
                      </button>

                      <a
                        href={message.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 mx-1 py-1.5 px-2 text-xs rounded text-white bg-[#0088cc] hover:bg-[#0077b5] transition-colors flex items-center justify-center"
                        onClick={() => {
                          trackClick('InlineTelegramFeed', `GetDeal_${message.id}`);
                          handleMessageClick(message.id);
                        }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        Get Deal
                      </a>
                    </div>

                    <div className="flex items-center mt-3 text-xs text-gray-500">
                      {message.viewCount && (
                        <span className="flex items-center mr-2">
                          <svg className="w-4 h-4 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {message.viewCount}
                        </span>
                      )}
                      <span>{formatDate(message.date)}</span>
                      <span className="ml-2 text-gray-600">{formatTimeAgo(message.date)}</span>
                    </div>
                  </div>
                ))}

                {loading && page > 1 && (
                  <div className="flex justify-center p-4">
                    <div className="w-6 h-6 border-2 border-[#982a4a] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {!loading && hasMore && filteredMessages.length >= 10 && (
                  <div className="text-center p-4">
                    <button
                      onClick={loadMoreMessages}
                      className="px-4 py-2 bg-[#242f3d] text-white text-sm rounded hover:bg-[#36475a] transition-colors"
                    >
                      Load More Deals
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="absolute bottom-4 right-4 bg-[#0088cc] text-white rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 transition-opacity z-10"
                aria-label="Scroll to top"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>

          <div className="p-4 bg-[#17212b] border-t border-[#0e1621]">
            <a
              href="https://t.me/salesaholicsdeals"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center py-2 px-4 bg-[#0088cc] text-white rounded-md hover:bg-[#0077b5] transition-colors"
              onClick={() => trackClick('InlineTelegramFeed', 'OpenInTelegram')}
            >
              View More in Telegram
            </a>

            <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs text-gray-500 pt-2 border-t border-[#0e1621]">
              <span>Debug Controls:</span>
              <button
                onClick={() => {
                  const newState = !isSubscriber;
                  setIsSubscriber(newState);
                  localStorage.setItem('isSubscriber', newState.toString());
                }}
                className={`px-2 py-1 rounded ${isSubscriber ? 'bg-green-800/50 text-green-300' : 'bg-gray-800/50 text-gray-300'}`}
              >
                {isSubscriber ? 'Subscriber: ON' : 'Subscriber: OFF'}
              </button>

              <button
                onClick={() => {
                  const newState = !isAdmin;
                  setIsAdmin(newState);
                  localStorage.setItem('isAdmin', newState.toString());
                  if (newState) {
                    setPendingSubmissions(MOCK_PENDING_SUBMISSIONS);
                  }
                }}
                className={`px-2 py-1 rounded ${isAdmin ? 'bg-red-800/50 text-red-300' : 'bg-gray-800/50 text-gray-300'}`}
              >
                {isAdmin ? 'Admin: ON' : 'Admin: OFF'}
              </button>

              <button
                onClick={() => {
                  setHasNewDeals(true);
                }}
                className="px-2 py-1 rounded bg-gray-800/50 text-gray-300"
              >
                Trigger New Deals
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InlineTelegramFeed;
