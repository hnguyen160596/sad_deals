// Function to manage Telegram message tags
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Set CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

  try {
    // Check authorization (can be enhanced with actual auth logic)
    // const isAdmin = event.headers.authorization === `Bearer ${process.env.ADMIN_API_KEY}`;

    // Get tags for a message
    if (event.httpMethod === 'GET') {
      const messageId = event.queryStringParameters?.messageId;

      if (!messageId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing messageId parameter' })
        };
      }

      const { data, error } = await supabase
        .from('telegram_message_tags')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, tags: data })
      };
    }

    // Add tags to a message
    if (event.httpMethod === 'POST') {
      const { messageId, tags } = JSON.parse(event.body);

      if (!messageId || !tags || !Array.isArray(tags)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid request. Required: messageId and tags array' })
        };
      }

      // Process each tag
      const tagObjects = tags.map(tag => ({
        message_id: messageId,
        tag_name: tag.toLowerCase().trim(),
        created_at: new Date().toISOString()
      }));

      // Upsert tags (insert if not exists)
      const { data, error } = await supabase
        .from('telegram_message_tags')
        .upsert(tagObjects, { onConflict: ['message_id', 'tag_name'] })
        .select();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, tags: data })
      };
    }

    // Remove a tag from a message
    if (event.httpMethod === 'DELETE') {
      const { messageId, tagName } = JSON.parse(event.body);

      if (!messageId || !tagName) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid request. Required: messageId and tagName' })
        };
      }

      const { data, error } = await supabase
        .from('telegram_message_tags')
        .delete()
        .match({ message_id: messageId, tag_name: tagName.toLowerCase().trim() });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, deleted: true })
      };
    }

    // Get all available tags
    if (event.path.endsWith('/all-tags')) {
      const { data, error } = await supabase
        .from('telegram_message_tags')
        .select('tag_name')
        .order('tag_name');

      if (error) throw error;

      // Get unique tag names
      const uniqueTags = [...new Set(data.map(item => item.tag_name))];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, tags: uniqueTags })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error in telegram-message-tags function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
