// Telegram Bot - Forwarder Service
// This serverless function runs on a schedule to poll for new messages and forward them

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const telegramHelpers = require('./utils/telegram-helpers');

// Environment detection
const DEV_MODE = process.env.NODE_ENV === 'development' || !process.env.SUPABASE_URL;

// Mock data for development testing
const MOCK_MESSAGES = [
  {
    message_id: 101,
    text: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) are now just $189.99 at Amazon (regularly $249)! Click here to grab them before they sell out: https://amzn.to/example1',
    chat: { id: '1234567890' },
    date: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
    photo: [
      { file_id: 'photo1small', width: 100, height: 100 },
      { file_id: 'photo1medium', width: 320, height: 320 },
      { file_id: 'photo1large', width: 800, height: 800 }
    ]
  },
  {
    message_id: 102,
    text: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker & Air Fryer only $129.99 (was $229.99)! Perfect for quick meals: https://target.com/example2',
    chat: { id: '1234567890' },
    date: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
    photo: [
      { file_id: 'photo2small', width: 100, height: 100 },
      { file_id: 'photo2medium', width: 320, height: 320 },
      { file_id: 'photo2large', width: 800, height: 800 }
    ]
  }
];

// Initialize database client
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: { enabled: false }
    });
    console.log('Supabase client initialized successfully');
  } catch (supaError) {
    console.error('Error initializing Supabase client:', supaError);
    console.log('🧪 Running in DEV_MODE with mock data (Supabase initialization failed)');
  }
} else {
  console.log('🧪 Running in DEV_MODE with mock data (no Supabase credentials available)');
}

// Telegram credentials - Using the provided token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7708700477:AAHO96EDKHXDC91BGgUAruF505NlIqhXkyU';
// Target the salesahoclic channel - using exact channel name
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '@salesahoclic';
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

// Log Telegram configuration for debugging
console.log(`Telegram configuration: Using bot token ${BOT_TOKEN ? 'provided' : 'missing'}`);
console.log(`Target channel: ${CHANNEL_ID}`);

// Track last processed message ID
let lastMessageId = 0;

// Get the most recent message ID from the database
const getLastProcessedMessageId = async () => {
  if (DEV_MODE) {
    console.log('🧪 DEV_MODE: Using mock last message ID');
    return 100; // Mock ID to process our test messages
  }

  try {
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('telegram_message_id')
      .order('telegram_message_id', { ascending: false })
      .limit(1);

    if (error) throw error;

    const lastId = data && data.length > 0 ? data[0].telegram_message_id : 0;
    console.log(`Last processed message ID: ${lastId}`);
    return lastId;
  } catch (error) {
    console.error('Error getting last message ID:', error);
    return 0;
  }
};

// Get channel updates using getUpdates API
const getChannelUpdates = async () => {
  try {
    console.log(`Fetching messages from Telegram channel: ${CHANNEL_ID}`);

    if (!TELEGRAM_API) {
      throw new Error('Telegram API URL not available');
    }

    // First try to get chat ID if using username format (@salesahoclic)
    let resolvedChannelId = CHANNEL_ID;
    if (CHANNEL_ID.startsWith('@')) {
      try {
        console.log(`Getting channel info for ${CHANNEL_ID}`);
        const chatResponse = await axios.get(
          `${TELEGRAM_API}/getChat?chat_id=${CHANNEL_ID}`,
          { timeout: 10000 }
        );

        if (chatResponse.data && chatResponse.data.ok) {
          resolvedChannelId = chatResponse.data.result.id?.toString();
          console.log(`Resolved channel ID: ${resolvedChannelId}`);
        }
      } catch (chatError) {
        console.warn(`Could not resolve chat ID for ${CHANNEL_ID}:`, chatError.message);
        // Continue with original channel ID
      }
    }

    // Try to get the channel history using getChatHistory method
    try {
      console.log(`Getting channel history using forwardMessages`);
      const response = await axios.get(
        `${TELEGRAM_API}/getUpdates?offset=-1&limit=100&allowed_updates=["channel_post"]`,
        { timeout: 10000 }
      );

      if (!response.data || !response.data.ok) {
        throw new Error(`Failed to get updates: ${response.data?.description || 'Unknown error'}`);
      }

      // Extract channel posts from updates
      const updates = response.data.result || [];
      console.log(`Received ${updates.length} updates from Telegram`);

      // Find messages from our target channel
      const channelMessages = updates
        .filter(update => {
          // Check both channel_post and message for the target channel
          const chatId =
            (update.channel_post?.chat?.id?.toString() ||
             update.message?.chat?.id?.toString() ||
             update.channel_post?.chat?.username ||
             update.message?.chat?.username);

          const chatUsername =
            update.channel_post?.chat?.username ||
            update.message?.chat?.username;

          // Log for debugging
          console.log(`Comparing update chatId: ${chatId}, username: ${chatUsername} with target: ${resolvedChannelId} or ${CHANNEL_ID}`);

          // Match against both numeric ID and username
          return chatId === resolvedChannelId ||
                 chatId === CHANNEL_ID ||
                 `@${chatId}` === CHANNEL_ID ||
                 chatUsername === CHANNEL_ID.replace('@', '') ||
                 `@${chatUsername}` === CHANNEL_ID;
        })
        .map(update => update.channel_post || update.message);

      console.log(`Found ${channelMessages.length} messages from target channel`);

      if (channelMessages.length === 0) {
        // If we found no messages, try to get the last few messages from the channel
        console.log("No messages found through updates. Trying to get channel history...");

        // Alternative approach: Try to get the latest messages directly
        // For public channels we can use the Telegram API's getHistory method
        try {
          const historyResponse = await axios.post(
            `${TELEGRAM_API}/forwardMessages`,
            {
              chat_id: resolvedChannelId, // Where to forward messages
              from_chat_id: resolvedChannelId, // Source chat
              message_ids: [1, 2, 3, 4, 5], // Get the most recent messages
              disable_notification: true
            },
            { timeout: 10000 }
          );

          if (historyResponse.data && historyResponse.data.ok) {
            console.log("Successfully got channel history via forwardMessages");
            return historyResponse.data.result || [];
          }
        } catch (historyError) {
          console.warn("Failed to get channel history via forwardMessages:", historyError.message);
        }

        // For testing purposes, return some mock messages if we can't get real ones
        if (DEV_MODE) {
          console.log("Returning mock messages for development");
          return MOCK_MESSAGES;
        }
      }

      return channelMessages;
    } catch (error) {
      console.error('Error fetching channel updates:', error);

      // As a fallback, try to get the channel messages using a different approach
      try {
        console.log("Trying to get channel content via direct API call...");
        const directResponse = await axios.get(
          `https://t.me/s/${CHANNEL_ID.replace('@', '')}`,
          { timeout: 10000 }
        );

        // This will return HTML content that would need to be parsed
        // For simplicity in this fix, we'll return mock messages if in DEV_MODE
        if (DEV_MODE) {
          console.log("Using mock messages as fallback");
          return MOCK_MESSAGES;
        }
      } catch (directError) {
        console.error("Failed to get channel content directly:", directError.message);
      }

      throw error;
    }
  } catch (error) {
    console.error('Error fetching channel updates:', error);
    throw error;
  }
};

// Process a new message and store in database
const processMessage = async (message) => {
  try {
    if (!message || !message.message_id) return false;

    // Skip messages we've already processed
    if (message.message_id <= lastMessageId) {
      console.log(`Skipping already processed message ${message.message_id}`);
      return false;
    }

    // Use shared helper utility to process message data
    const messageData = telegramHelpers.processMessageData(message, false);
    console.log(`Processing message ${message.message_id}: ${messageData.title.substring(0, 30)}...`);

    // Handle photos if present
    if (message.photo && message.photo.length > 0) {
      // Get actual URL via getFile API
      messageData.photo_url = await telegramHelpers.getFileUrl(
        messageData.photo_file_id,
        BOT_TOKEN
      );
      console.log(`Photo URL for message ${message.message_id}: ${messageData.photo_url}`);
    }

    if (DEV_MODE) {
      // Log the message object in development mode
      console.log('🧪 DEV_MODE: Would store in database:', JSON.stringify(messageData, null, 2));
      return true;
    }

    // Store in database
    const { error } = await supabase
      .from('telegram_messages')
      .insert([messageData]);

    if (error) throw error;

    console.log(`Successfully processed message ${message.message_id}`);
    return true;
  } catch (error) {
    console.error(`Error processing message ${message?.message_id}:`, error);
    return false;
  }
};

// Poll for new messages with enhanced error handling and retries
const pollForMessages = async () => {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount <= maxRetries) {
    try {
      // Get last processed message ID from the database
      lastMessageId = await getLastProcessedMessageId();

      // For development mode, use mock data
      if (DEV_MODE) {
        console.log('🧪 DEV_MODE: Using mock channel messages');

        // Process mock messages
        const results = await Promise.all(
          MOCK_MESSAGES.map(message => processMessage(message))
        );

        const successCount = results.filter(result => result).length;
        console.log(`🧪 DEV_MODE: Successfully processed ${successCount}/${MOCK_MESSAGES.length} mock messages`);

        return { processed: successCount, total: MOCK_MESSAGES.length, dev_mode: true };
      }

      if (!TELEGRAM_API || !CHANNEL_ID) {
        throw new Error('Missing Telegram API credentials (BOT_TOKEN or CHANNEL_ID)');
      }

      // Fetch channel messages with our improved getChannelUpdates function
      console.log('Fetching updates from Telegram API...');
      const channelMessages = await getChannelUpdates();

      console.log(`Found ${channelMessages.length} new channel messages to process`);

      // Process each new message with concurrency limit to avoid rate limiting
      const processWithConcurrency = async (messages, concurrency = 5) => {
        const results = [];
        const chunks = [];

        // Split messages into chunks for concurrent processing
        for (let i = 0; i < messages.length; i += concurrency) {
          chunks.push(messages.slice(i, i + concurrency));
        }

        // Process each chunk in sequence
        for (const chunk of chunks) {
          const chunkResults = await Promise.all(
            chunk.map(message => processMessage(message))
          );
          results.push(...chunkResults);
        }

        return results;
      };

      // Process messages with controlled concurrency
      const results = await processWithConcurrency(channelMessages);
      const successCount = results.filter(result => result).length;

      // Log success rate for monitoring
      if (channelMessages.length > 0) {
        console.log(`Successfully processed ${successCount}/${channelMessages.length} messages (${(successCount/channelMessages.length*100).toFixed(1)}%)`);
      } else {
        console.log('No new messages to process');
      }

      // Store a status record in the database for monitoring
      try {
        if (!DEV_MODE) {
          await supabase.from('telegram_bot_runs').insert([{
            run_timestamp: new Date().toISOString(),
            messages_found: channelMessages.length,
            messages_processed: successCount,
            success_rate: channelMessages.length > 0 ? successCount/channelMessages.length : 1,
            error: null
          }]);
        }
      } catch (dbError) {
        console.error('Failed to log run status to database:', dbError);
        // Continue execution even if logging fails
      }

      return { processed: successCount, total: channelMessages.length };
    } catch (error) {
      retryCount++;

      // Log the retry attempt
      console.error(`Error polling for messages (attempt ${retryCount}/${maxRetries}):`, error);

      if (retryCount > maxRetries) {
        // Store the failure in the database for monitoring
        try {
          if (!DEV_MODE) {
            await supabase.from('telegram_bot_runs').insert([{
              run_timestamp: new Date().toISOString(),
              messages_found: 0,
              messages_processed: 0,
              success_rate: 0,
              error: error.message
            }]);
          }
        } catch (dbError) {
          console.error('Failed to log error to database:', dbError);
        }

        throw error;
      }

      // Exponential backoff between retries: 2, 4, 8 seconds
      const backoffTime = Math.pow(2, retryCount) * 1000;
      console.log(`Retrying in ${backoffTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
};

// Main handler for scheduled function
exports.handler = async (event, context) => {
  try {
    console.log(`Telegram bot function started at ${new Date().toISOString()}`);
    console.log(`Environment: ${DEV_MODE ? 'Development (Mock Mode)' : 'Production'}`);

    // This could be triggered by a scheduled event
    const result = await pollForMessages();

    console.log(`Telegram bot function completed at ${new Date().toISOString()}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...result,
        timestamp: new Date().toISOString(),
        dev_mode: DEV_MODE
      })
    };
  } catch (error) {
    console.error('Error in Telegram bot function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        dev_mode: DEV_MODE
      })
    };
  }
};
