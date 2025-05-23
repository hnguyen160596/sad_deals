// Function to export Telegram analytics data
const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
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
      headers: headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse query parameters
    const params = event.queryStringParameters || {};
    const {
      timeframe = 'all',
      startDate,
      endDate,
      format = 'json',
      reportType = 'messages'
    } = params;

    // Validate time parameters
    let timeThreshold = null;
    let endThreshold = null;
    const now = new Date();

    if (timeframe === 'day') {
      timeThreshold = new Date(now.setDate(now.getDate() - 1)).toISOString();
    } else if (timeframe === 'week') {
      timeThreshold = new Date(now.setDate(now.getDate() - 7)).toISOString();
    } else if (timeframe === 'month') {
      timeThreshold = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
    } else if (timeframe === 'year') {
      timeThreshold = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    } else if (timeframe === 'custom' && startDate && endDate) {
      // Format custom dates with time at start and end of day
      timeThreshold = new Date(`${startDate}T00:00:00Z`).toISOString();
      endThreshold = new Date(`${endDate}T23:59:59Z`).toISOString();
    }

    // Base query to get messages with their engagement data
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
    if (timeThreshold) {
      query = query.gte('created_at', timeThreshold);
    }

    if (endThreshold) {
      query = query.lte('created_at', endThreshold);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching message analytics for export:', error);
      throw error;
    }

    // Format the data for easier use
    const formattedData = data.map(msg => {
      const engagement = msg.telegram_message_engagement[0] || {
        view_count: 0,
        click_count: 0,
        save_count: 0,
        share_count: 0
      };

      // Extract tags
      const tags = Array.isArray(msg.telegram_message_tags)
        ? msg.telegram_message_tags.map(tag => tag.tag_name).join(', ')
        : '';

      // Calculate engagement metrics
      const totalEngagements = engagement.view_count + engagement.click_count +
                               engagement.save_count + engagement.share_count;

      const clickThroughRate = engagement.view_count > 0
        ? (engagement.click_count / engagement.view_count * 100).toFixed(2)
        : 0;

      return {
        id: msg.id,
        title: msg.title,
        price: msg.price || 'N/A',
        store: msg.store || 'N/A',
        category: msg.category || 'Uncategorized',
        tags: tags,
        url: msg.url || 'N/A',
        created_at: msg.created_at,
        views: engagement.view_count || 0,
        clicks: engagement.click_count || 0,
        saves: engagement.save_count || 0,
        shares: engagement.share_count || 0,
        total_engagements: totalEngagements,
        ctr: `${clickThroughRate}%`,
        last_viewed: engagement.last_viewed || 'N/A',
        last_clicked: engagement.last_clicked || 'N/A'
      };
    });

    // If format is JSON, return the data directly
    if (format === 'json') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: formattedData,
          exportedAt: new Date().toISOString(),
          params
        })
      };
    }

    // For Excel/CSV exports, we need to generate the file
    // This would be handled in a real serverless function with actual file generation
    // For demonstration, we're returning a mock response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Export prepared in ${format} format for ${reportType} report`,
        exportData: {
          rowCount: formattedData.length,
          format,
          reportType,
          timeframe,
          startDate: startDate || null,
          endDate: endDate || null,
          // In a real implementation, this would be a signed URL to download the file
          downloadUrl: 'https://example.com/downloads/telegram-analytics-export.xlsx'
        }
      })
    };
  } catch (error) {
    console.error('Error in telegram-analytics-export function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate export',
        details: error.message
      })
    };
  }
};
