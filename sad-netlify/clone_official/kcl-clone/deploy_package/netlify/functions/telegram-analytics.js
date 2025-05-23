// Serverless function to get analytics for Telegram message engagement
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to validate params
const validateParams = (params) => {
  const errors = [];

  // Validate timeframe
  if (params.timeframe && !['day', 'week', 'month', 'year', 'all', 'custom'].includes(params.timeframe)) {
    errors.push('Invalid timeframe. Must be one of: day, week, month, year, all, custom');
  }

  // If custom timeframe, validate start and end dates
  if (params.timeframe === 'custom') {
    if (!params.startDate || !params.endDate) {
      errors.push('Custom timeframe requires both startDate and endDate parameters.');
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(params.startDate) || !dateRegex.test(params.endDate)) {
        errors.push('Dates must be in YYYY-MM-DD format.');
      } else {
        // Validate that startDate is before endDate
        const start = new Date(params.startDate);
        const end = new Date(params.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          errors.push('Invalid date format');
        } else if (start > end) {
          errors.push('startDate must be before endDate');
        }
      }
    }
  }

  // Validate limit
  if (params.limit && (isNaN(params.limit) || params.limit < 1 || params.limit > 100)) {
    errors.push('Invalid limit. Must be a number between 1 and 100');
  }

  // Validate filters
  if (params.storeFilter && typeof params.storeFilter !== 'string') {
    errors.push('storeFilter must be a string');
  }

  if (params.categoryFilter && typeof params.categoryFilter !== 'string') {
    errors.push('categoryFilter must be a string');
  }

  if (params.tagFilter && typeof params.tagFilter !== 'string') {
    errors.push('tagFilter must be a string');
  }

  return errors;
};

// Get analytics for the specified time period
async function getMessageAnalytics(params = {}) {
  try {
    // Set default parameters
    const timeframe = params.timeframe || 'all';
    const limit = params.limit || 20;
    const storeFilter = params.storeFilter || null;
    const categoryFilter = params.categoryFilter || null;
    const tagFilter = params.tagFilter || null;

    // Calculate time threshold based on timeframe
    let startThreshold = null;
    let endThreshold = null;
    const now = new Date();

    if (timeframe === 'day') {
      startThreshold = new Date(now.setDate(now.getDate() - 1)).toISOString();
    } else if (timeframe === 'week') {
      startThreshold = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (timeframe === 'month') {
      startThreshold = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    } else if (timeframe === 'year') {
      startThreshold = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    } else if (timeframe === 'custom' && params.startDate && params.endDate) {
      // Format custom dates with time at start and end of day
      startThreshold = new Date(`${params.startDate}T00:00:00Z`).toISOString();
      // Set end date to end of day
      endThreshold = new Date(`${params.endDate}T23:59:59Z`).toISOString();
    }

    // Base query to get messages with their engagement data and tags
    let query = supabase
      .from('telegram_messages')
      .select(`
        id,
        title,
        price,
        store,
        category,
        url,
        imageUrl,
        created_at,
        telegram_message_engagement (
          view_count,
          click_count,
          save_count,
          share_count,
          last_viewed,
          last_clicked,
          updated_at
        ),
        telegram_message_tags (
          tag_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply time filter if specified
    if (startThreshold) {
      query = query.gte('created_at', startThreshold);
    }

    if (endThreshold) {
      query = query.lte('created_at', endThreshold);
    }

    // Apply store filter if specified
    if (storeFilter) {
      query = query.eq('store', storeFilter);
    }

    // Apply category filter if specified
    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }

    // For tag filtering, we need to handle it after we get the results
    // since we have a many-to-many relationship

    // Apply limit
    query = query.limit(limit);

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching message analytics:', error);
      return { success: false, error };
    }

    // Format the data for easier use
    let formattedData = data.map(msg => {
      const engagement = msg.telegram_message_engagement[0] || {
        view_count: 0,
        click_count: 0,
        save_count: 0,
        share_count: 0
      };

      // Extract tags from the message
      const tags = Array.isArray(msg.telegram_message_tags)
        ? msg.telegram_message_tags.map(tag => tag.tag_name)
        : [];

      // Calculate engagement metrics
      const totalEngagements = engagement.view_count + engagement.click_count +
                               engagement.save_count + engagement.share_count;

      const clickThroughRate = engagement.view_count > 0
        ? (engagement.click_count / engagement.view_count * 100).toFixed(2)
        : 0;

      return {
        id: msg.id,
        title: msg.title,
        price: msg.price,
        store: msg.store,
        category: msg.category || 'Uncategorized',
        created_at: msg.created_at,
        tags: tags,
        engagement: {
          views: engagement.view_count || 0,
          clicks: engagement.click_count || 0,
          saves: engagement.save_count || 0,
          shares: engagement.share_count || 0,
          total: totalEngagements,
          ctr: parseFloat(clickThroughRate),
          last_viewed: engagement.last_viewed,
          last_clicked: engagement.last_clicked,
          last_updated: engagement.updated_at
        }
      };
    });

    // Apply tag filter if provided
    if (tagFilter) {
      formattedData = formattedData.filter(msg =>
        msg.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase())
      );
    }

    // Calculate aggregate metrics
    const totalViews = formattedData.reduce((sum, msg) => sum + msg.engagement.views, 0);
    const totalClicks = formattedData.reduce((sum, msg) => sum + msg.engagement.clicks, 0);
    const totalSaves = formattedData.reduce((sum, msg) => sum + msg.engagement.saves, 0);
    const totalShares = formattedData.reduce((sum, msg) => sum + msg.engagement.shares, 0);

    const overallCTR = totalViews > 0
      ? (totalClicks / totalViews * 100).toFixed(2)
      : 0;

    // Sort by different engagement metrics
    const mostViewed = [...formattedData]
      .sort((a, b) => b.engagement.views - a.engagement.views)
      .slice(0, 5);

    const mostClicked = [...formattedData]
      .sort((a, b) => b.engagement.clicks - a.engagement.clicks)
      .slice(0, 5);

    const mostSaved = [...formattedData]
      .sort((a, b) => b.engagement.saves - a.engagement.saves)
      .slice(0, 5);

    const highestCTR = [...formattedData]
      .filter(msg => msg.engagement.views > 10) // Minimum threshold to avoid skewed results
      .sort((a, b) => b.engagement.ctr - a.engagement.ctr)
      .slice(0, 5);

    // Group data by stores
    const storePerformance = formattedData.reduce((acc, msg) => {
      const store = msg.store || 'Unknown';
      if (!acc[store]) {
        acc[store] = {
          totalMessages: 0,
          totalViews: 0,
          totalClicks: 0,
          totalSaves: 0,
          totalShares: 0,
          ctr: 0,
          messages: []
        };
      }

      acc[store].totalMessages++;
      acc[store].totalViews += msg.engagement.views;
      acc[store].totalClicks += msg.engagement.clicks;
      acc[store].totalSaves += msg.engagement.saves;
      acc[store].totalShares += msg.engagement.shares;
      acc[store].messages.push(msg);

      return acc;
    }, {});

    // Calculate CTR for each store
    Object.keys(storePerformance).forEach(store => {
      const { totalViews, totalClicks } = storePerformance[store];
      storePerformance[store].ctr = totalViews > 0
        ? parseFloat((totalClicks / totalViews * 100).toFixed(2))
        : 0;
    });

    // Group data by categories
    const categoryPerformance = formattedData.reduce((acc, msg) => {
      const category = msg.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          totalMessages: 0,
          totalViews: 0,
          totalClicks: 0,
          totalSaves: 0,
          totalShares: 0,
          ctr: 0,
          messages: []
        };
      }

      acc[category].totalMessages++;
      acc[category].totalViews += msg.engagement.views;
      acc[category].totalClicks += msg.engagement.clicks;
      acc[category].totalSaves += msg.engagement.saves;
      acc[category].totalShares += msg.engagement.shares;
      acc[category].messages.push(msg);

      return acc;
    }, {});

    // Calculate CTR for each category
    Object.keys(categoryPerformance).forEach(category => {
      const { totalViews, totalClicks } = categoryPerformance[category];
      categoryPerformance[category].ctr = totalViews > 0
        ? parseFloat((totalClicks / totalViews * 100).toFixed(2))
        : 0;
    });

    // Group data by day for time-series analysis
    const dailyPerformance = formattedData.reduce((acc, msg) => {
      // Format date as YYYY-MM-DD
      const date = new Date(msg.created_at).toISOString().split('T')[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          views: 0,
          clicks: 0,
          saves: 0,
          shares: 0,
          messageCount: 0
        };
      }

      acc[date].views += msg.engagement.views;
      acc[date].clicks += msg.engagement.clicks;
      acc[date].saves += msg.engagement.saves;
      acc[date].shares += msg.engagement.shares;
      acc[date].messageCount++;

      return acc;
    }, {});

    // Convert to array and sort by date
    const timeSeriesData = Object.values(dailyPerformance)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get unique stores and categories for filtering options
    const uniqueStores = [...new Set(formattedData.map(msg => msg.store).filter(Boolean))];
    const uniqueCategories = [...new Set(formattedData.map(msg => msg.category).filter(Boolean))];

    // Extract all tags across messages
    const allTags = formattedData.reduce((tags, msg) => {
      msg.tags.forEach(tag => tags.add(tag));
      return tags;
    }, new Set());

    return {
      success: true,
      summary: {
        totalMessages: formattedData.length,
        totalViews,
        totalClicks,
        totalSaves,
        totalShares,
        overallCTR: parseFloat(overallCTR),
        timeframe,
        startDate: params.startDate || null,
        endDate: params.endDate || null
      },
      topPerformers: {
        mostViewed,
        mostClicked,
        mostSaved,
        highestCTR
      },
      segmentation: {
        storePerformance,
        categoryPerformance,
        timeSeriesData
      },
      filterOptions: {
        stores: uniqueStores,
        categories: uniqueCategories,
        tags: Array.from(allTags)
      },
      messages: formattedData
    };
  } catch (error) {
    console.error('Error processing analytics:', error);
    return { success: false, error: error.message };
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check if user is authenticated (can add actual auth check here)
  // const isAdmin = event.headers.authorization === `Bearer ${process.env.ADMIN_API_KEY}`;

  try {
    // Parse query parameters
    const params = event.queryStringParameters || {};

    // Validate parameters
    const validationErrors = validateParams(params);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ errors: validationErrors })
      };
    }

    // Get the analytics data
    const analyticsData = await getMessageAnalytics(params);

    if (!analyticsData.success) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch analytics data', details: analyticsData.error })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analyticsData)
    };
  } catch (error) {
    console.error('Error handling analytics request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
