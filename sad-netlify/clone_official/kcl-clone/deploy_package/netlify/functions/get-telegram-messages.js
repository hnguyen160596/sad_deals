// API Endpoint to fetch Telegram messages for the frontend
const { createClient } = require('@supabase/supabase-js');

// Development detection
const DEV_MODE = process.env.NODE_ENV === 'development' || !process.env.SUPABASE_URL;

// Mock message data for development and fallback
const MOCK_MESSAGES = [
  {
    telegram_message_id: 1,
    title: 'Apple AirPods Pro (2nd Gen) with MagSafe Case',
    price: '$189.99',
    links: ['https://amzn.to/example1'],
    photo_url: '/images/deals/airpods.jpg',
    date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    store: 'Amazon'
  },
  {
    telegram_message_id: 2,
    title: 'Ninja Foodi 10-in-1 Pressure Cooker & Air Fryer',
    price: '$129.99',
    links: ['https://amzn.to/example2'],
    photo_url: '/images/deals/ninja.jpg',
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    store: 'Amazon'
  },
  {
    telegram_message_id: 3,
    title: 'Steel Cash Box with Money Tray, Black Safety Box',
    price: '$9.99',
    links: ['https://www.amazon.com/dp/B0F1CX4VSH/?tag=salesaholics99-20'],
    photo_url: '/images/deals/deal-placeholder.png',
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    store: 'Amazon'
  },
  {
    telegram_message_id: 4,
    title: 'Home Depot Memorial Day Sale with up to 40% off!',
    price: '$24.99',
    links: ['https://homedepot.com/example4'],
    photo_url: '/images/stores/home-depot.png',
    date: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    store: 'Home Depot'
  },
  {
    telegram_message_id: 5,
    title: 'Women\'s Casual Joggers with Pockets, Lightweight Sweatpants',
    price: '$14.50',
    links: ['https://www.amazon.com/dp/example5/?tag=salesaholics99-20'],
    photo_url: '/images/deals/deal-placeholder.png',
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    store: 'Amazon'
  }
];

// In-memory cache to improve performance
const CACHE = {
  messages: null,
  lastFetched: null,
  cacheTtlMs: 60000, // 1 minute cache TTL
  messageStats: {
    totalFetches: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errors: 0
  }
};

// Initialize database client if credentials are available
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    // Create Supabase client with error handling
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: { enabled: false }
    });
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  console.log('DEV_MODE: No Supabase credentials found, using mock data');
  // Always consider it development mode if no credentials
  DEV_MODE = true;
}

// Helper to format message data for frontend
const formatMessageData = (message) => {
  try {
    // Get the first link as the product URL if available
    const productUrl = message.links && message.links.length > 0
      ? message.links[0]
      : '';

    // Ensure all required fields are present and handle missing data
    return {
      id: message.telegram_message_id || Math.floor(Math.random() * 10000),
      title: message.title || 'Product Deal',
      price: message.price || 'Check price',
      url: productUrl,
      imageUrl: message.photo_url || '/images/deals/deal-placeholder.png',
      date: new Date(message.date).getTime(),
      tag: productUrl.includes('tag=') ? productUrl.split('tag=')[1].split('&')[0] : '',
      viewCount: message.view_count || Math.floor(Math.random() * 1000) + 100, // Mocked view count if not available
      store: message.store || 'Unknown',
      category: message.category || 'Deal' // Default category, would be extracted in a real system
    };
  } catch (error) {
    console.error('Error formatting message:', error);
    // Return a fallback object with default values if there's an error
    return {
      id: Math.floor(Math.random() * 10000),
      title: 'Error formatting message',
      price: 'N/A',
      url: '',
      imageUrl: '/images/deals/deal-placeholder.png',
      date: Date.now(),
      tag: '',
      viewCount: 0,
      store: 'Unknown',
      category: 'Error'
    };
  }
};

// Check if cache is valid
const isCacheValid = () => {
  if (!CACHE.messages || !CACHE.lastFetched) return false;

  const now = Date.now();
  const cacheAge = now - CACHE.lastFetched;
  return cacheAge < CACHE.cacheTtlMs;
};

// Function to get messages with pagination and filtering
const getMessages = async (req) => {
  try {
    console.log(`Processing request at ${new Date().toISOString()}`);
    CACHE.messageStats.totalFetches++;

    // Parse query parameters
    const queryParams = new URLSearchParams(req.queryStringParameters || {});
    const limit = parseInt(queryParams.get('limit') || '20', 10);
    const page = parseInt(queryParams.get('page') || '1', 10);
    const store = queryParams.get('store') || null;
    const priceRange = queryParams.get('priceRange') || null;
    const after = queryParams.get('after') ? parseInt(queryParams.get('after'), 10) : null;
    const cacheDisabled = queryParams.get('nocache') === 'true';

    console.log(`Request parameters: limit=${limit}, page=${page}, store=${store}, priceRange=${priceRange}, after=${after}`);

    // Check if we can use cached data for this request
    // Only use cache for simple requests without filters
    const canUseCache = !cacheDisabled && !store && !priceRange && !after && page === 1;

    if (canUseCache && isCacheValid()) {
      console.log('Using cached data');
      CACHE.messageStats.cacheHits++;
      return CACHE.messages;
    }

    CACHE.messageStats.cacheMisses++;

    // If we're in development with no Supabase connection, use mock data
    if (DEV_MODE || !supabase) {
      console.log("Using mock Telegram messages");

      // Filter mock messages
      let filteredMessages = [...MOCK_MESSAGES];

      if (store) {
        filteredMessages = filteredMessages.filter(m => m.store === store);
      }

      if (priceRange) {
        const priceNumeric = msg => parseFloat(msg.price.replace(/[^0-9.]/g, ''));

        if (priceRange === 'under25') {
          filteredMessages = filteredMessages.filter(m => priceNumeric(m) < 25);
        } else if (priceRange === '25to50') {
          filteredMessages = filteredMessages.filter(m => priceNumeric(m) >= 25 && priceNumeric(m) <= 50);
        } else if (priceRange === '50to100') {
          filteredMessages = filteredMessages.filter(m => priceNumeric(m) > 50 && priceNumeric(m) <= 100);
        } else if (priceRange === 'over100') {
          filteredMessages = filteredMessages.filter(m => priceNumeric(m) > 100);
        }
      }

      if (after) {
        filteredMessages = filteredMessages.filter(m => new Date(m.date).getTime() > after);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedMessages = filteredMessages.slice(offset, offset + limit);

      // Format messages
      const formattedMessages = paginatedMessages.map(formatMessageData);

      // Add a little randomness to the mock data to simulate real-time updates
      if (Math.random() < 0.2) {
        const newMessage = { ...MOCK_MESSAGES[0] };
        newMessage.telegram_message_id = Date.now();
        newMessage.date = new Date().toISOString();
        newMessage.title = `New Deal ${Math.floor(Math.random() * 100)}`;
        formattedMessages.unshift(formatMessageData(newMessage));
      }

      const result = {
        messages: formattedMessages,
        pagination: {
          page,
          limit,
          total: filteredMessages.length,
          hasMore: offset + limit < filteredMessages.length
        },
        metadata: {
          generated: new Date().toISOString(),
          source: 'mock',
          stats: CACHE.messageStats
        }
      };

      // Cache the result for simple requests
      if (canUseCache) {
        CACHE.messages = result;
        CACHE.lastFetched = Date.now();
      }

      return result;
    }

    // Try to get data from Supabase database
    try {
      console.log("Attempting to fetch real data from Supabase...");

      // Build the query for Supabase
      let query = supabase
        .from('telegram_messages')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false });

      // Apply filters
      if (store) {
        query = query.eq('store', store);
      }

      if (priceRange) {
        // Extract numeric price value for comparison
        if (priceRange === 'under25') {
          query = query.lt('price_numeric', 25);
        } else if (priceRange === '25to50') {
          query = query.gte('price_numeric', 25).lte('price_numeric', 50);
        } else if (priceRange === '50to100') {
          query = query.gt('price_numeric', 50).lte('price_numeric', 100);
        } else if (priceRange === 'over100') {
          query = query.gt('price_numeric', 100);
        }
      }

      if (after) {
        // Get only messages after a specific timestamp
        query = query.gt('date', new Date(after).toISOString());
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Execute the query
      console.log('Executing database query');
      const { data, error, count } = await query;

      if (error) {
        console.error('Database query error:', error);
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} messages from database`);

      // If we got no data, return mock data as fallback
      if (!data || data.length === 0) {
        console.log("No data found in database, using mock data as fallback");

        // Process mock messages like before
        let filteredMessages = [...MOCK_MESSAGES];
        const offset = (page - 1) * limit;
        const paginatedMessages = filteredMessages.slice(offset, offset + limit);
        const formattedMessages = paginatedMessages.map(formatMessageData);

        const result = {
          messages: formattedMessages,
          pagination: {
            page,
            limit,
            total: filteredMessages.length,
            hasMore: offset + limit < filteredMessages.length
          },
          metadata: {
            generated: new Date().toISOString(),
            source: 'mock_fallback',
            stats: CACHE.messageStats
          }
        };

        return result;
      }

      // Format the messages for the frontend
      const formattedMessages = (data || []).map(formatMessageData);

      const result = {
        messages: formattedMessages,
        pagination: {
          page,
          limit,
          total: count || formattedMessages.length,
          hasMore: formattedMessages.length === limit
        },
        metadata: {
          generated: new Date().toISOString(),
          source: 'database',
          stats: CACHE.messageStats
        }
      };

      // Cache the result for simple requests
      if (canUseCache) {
        CACHE.messages = result;
        CACHE.lastFetched = Date.now();
      }

      return result;
    } catch (dbError) {
      // If database fails, fall back to mock data
      console.error('Database error, falling back to mock data:', dbError);

      // Process mock messages as fallback
      let filteredMessages = [...MOCK_MESSAGES];
      const offset = (page - 1) * limit;
      const paginatedMessages = filteredMessages.slice(offset, offset + limit);
      const formattedMessages = paginatedMessages.map(formatMessageData);

      const result = {
        messages: formattedMessages,
        pagination: {
          page,
          limit,
          total: filteredMessages.length,
          hasMore: offset + limit < filteredMessages.length
        },
        metadata: {
          generated: new Date().toISOString(),
          source: 'mock_db_error',
          error: dbError.message,
          stats: CACHE.messageStats
        }
      };

      return result;
    }
  } catch (error) {
    CACHE.messageStats.errors++;
    console.error('Error getting messages:', error);

    // Return mock data in case of any error
    let filteredMessages = [...MOCK_MESSAGES];
    const offset = (page - 1) * limit;
    const paginatedMessages = filteredMessages.slice(offset, offset + limit);
    const formattedMessages = paginatedMessages.map(formatMessageData);

    // Return a graceful error response with mock data
    return {
      messages: formattedMessages,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredMessages.length,
        hasMore: offset + limit < filteredMessages.length
      },
      error: {
        message: error.message,
        timestamp: new Date().toISOString()
      },
      metadata: {
        generated: new Date().toISOString(),
        source: 'error_fallback',
        stats: CACHE.messageStats
      }
    };
  }
};

// Main handler function
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // Enable CORS for frontend access
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60' // 1 minute cache for browsers
  };

  try {
    console.log(`Handling request from ${event.headers['client-ip'] || 'unknown'}`);
    const startTime = Date.now();
    const result = await getMessages(event);
    const duration = Date.now() - startTime;

    console.log(`Request processed in ${duration}ms`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Unhandled error in get messages function:', error);

    // Fallback to mock data even in critical error cases
    const mockResult = {
      messages: MOCK_MESSAGES.slice(0, 5).map(formatMessageData),
      pagination: {
        page: 1,
        limit: 5,
        total: MOCK_MESSAGES.length,
        hasMore: true
      },
      error: {
        message: error.message,
        timestamp: new Date().toISOString()
      },
      metadata: {
        generated: new Date().toISOString(),
        source: 'critical_error_fallback'
      }
    };

    return {
      statusCode: 200, // Send 200 even with error to ensure frontend gets data
      headers,
      body: JSON.stringify(mockResult)
    };
  }
};
