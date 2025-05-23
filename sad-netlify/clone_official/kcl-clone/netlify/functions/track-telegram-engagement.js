// Function to track user engagement with Telegram messages
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
let supabase = null;

// Connect to Supabase if credentials are available
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: { enabled: false }
    });
    console.log('Supabase client initialized for tracking');
  } catch (error) {
    console.error('Error initializing Supabase client for tracking:', error);
  }
} else {
  console.log('No Supabase credentials found, engagement tracking will be mocked');
}

// Track message engagement (view, click, save, or share)
const trackEngagement = async (messageId, action) => {
  if (!messageId || !action) {
    throw new Error('Missing required parameters: messageId and action');
  }

  // Validate action
  const validActions = ['view', 'click', 'save', 'share'];
  if (!validActions.includes(action)) {
    throw new Error(`Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`);
  }

  // Skip if no database connection
  if (!supabase) {
    console.log(`Mock tracking ${action} for message ${messageId} (no database connection)`);
    return { success: true, mock: true };
  }

  try {
    // First, we need to get the database ID for the Telegram message
    const { data: messageData, error: messageError } = await supabase
      .from('telegram_messages')
      .select('id')
      .eq('telegram_message_id', messageId)
      .limit(1)
      .single();

    if (messageError || !messageData) {
      console.warn(`Message ${messageId} not found in database`);
      return { success: false, error: 'Message not found' };
    }

    const dbMessageId = messageData.id;

    // Check if engagement record exists
    const { data: existingData, error: existingError } = await supabase
      .from('telegram_message_engagement')
      .select('*')
      .eq('message_id', dbMessageId)
      .limit(1)
      .single();

    let result;

    if (existingError && !existingData) {
      // Create new engagement record
      const newRecord = {
        message_id: dbMessageId,
        view_count: action === 'view' ? 1 : 0,
        click_count: action === 'click' ? 1 : 0,
        save_count: action === 'save' ? 1 : 0,
        share_count: action === 'share' ? 1 : 0,
        last_viewed: action === 'view' ? new Date().toISOString() : null,
        last_clicked: action === 'click' ? new Date().toISOString() : null
      };

      const { error: insertError } = await supabase
        .from('telegram_message_engagement')
        .insert([newRecord]);

      if (insertError) throw insertError;
      result = { success: true, action, created: true };
    } else {
      // Update existing record
      const updates = {};

      if (action === 'view') {
        updates.view_count = (existingData.view_count || 0) + 1;
        updates.last_viewed = new Date().toISOString();
      } else if (action === 'click') {
        updates.click_count = (existingData.click_count || 0) + 1;
        updates.last_clicked = new Date().toISOString();
      } else if (action === 'save') {
        updates.save_count = (existingData.save_count || 0) + 1;
      } else if (action === 'share') {
        updates.share_count = (existingData.share_count || 0) + 1;
      }

      const { error: updateError } = await supabase
        .from('telegram_message_engagement')
        .update(updates)
        .eq('message_id', dbMessageId);

      if (updateError) throw updateError;
      result = { success: true, action, updated: true };
    }

    return result;
  } catch (error) {
    console.error(`Error tracking ${action} for message ${messageId}:`, error);
    return { success: false, error: error.message };
  }
};

// Handler for the Netlify serverless function
exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { messageId, action } = requestBody;

    if (!messageId || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameters',
          required: ['messageId', 'action']
        })
      };
    }

    // Track the engagement
    const result = await trackEngagement(messageId, action);

    return {
      statusCode: result.success ? 200 : 400,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in track-telegram-engagement function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
