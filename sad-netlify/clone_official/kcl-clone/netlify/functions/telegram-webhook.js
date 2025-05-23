// Telegram Webhook Handler - Receives messages from Telegram and stores them for display
const { createClient } = require('@supabase/supabase-js');
const { processMessageData, getFileUrl } = require('./utils/telegram-helpers');

// Initialize Supabase client for database operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get Telegram bot token from environment
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Verify the request is coming from Telegram
const verifyTelegramWebhook = (event) => {
  // Get the token from environment variables
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!secretToken) {
    console.warn('TELEGRAM_WEBHOOK_SECRET not configured. Webhook verification disabled.');
    return true;
  }

  try {
    // Check for X-Telegram-Bot-Api-Secret-Token header
    // Header keys may be lowercased by some platforms (e.g., Netlify, AWS Lambda)
    const headers = event.headers || {};
    const telegramHeader =
      headers['x-telegram-bot-api-secret-token'] ||
      headers['X-Telegram-Bot-Api-Secret-Token'] ||
      headers['X-TELEGRAM-BOT-API-SECRET-TOKEN'];

    if (!telegramHeader) {
      console.error('Missing X-Telegram-Bot-Api-Secret-Token header');
      return false;
    }

    // Compare the provided token with our secret token
    const isValid = telegramHeader === secretToken;

    if (!isValid) {
      console.error('Invalid webhook token provided');
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
};

// Process a message from the Telegram channel
const processMessage = async (message) => {
  try {
    // Use shared helper to process message data
    const messageData = processMessageData(message, false);

    // If there's a photo, get the file URL using Telegram API
    if (message.photo && message.photo.length > 0 && BOT_TOKEN) {
      const fileId = message.photo[message.photo.length - 1].file_id;
      messageData.photo_url = await getFileUrl(fileId, BOT_TOKEN);
    }

    // Store in database
    const { error } = await supabase
      .from('telegram_messages')
      .insert([messageData]);

    if (error) throw error;

    console.log(`Successfully processed message ${message.message_id}`);
    return { success: true, id: message.message_id };

  } catch (error) {
    console.error('Error processing message:', error);
    return { success: false, error: error.message };
  }
};

// Main handler function for the webhook
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Verify the request is from Telegram
    if (!verifyTelegramWebhook(event)) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    // Parse the incoming webhook data
    const data = JSON.parse(event.body);
    console.log('Received webhook data:', JSON.stringify(data));

    // Check if this is a channel post
    const message = data.channel_post || data.message;

    if (!message) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: false, error: 'No valid message found in webhook data' })
      };
    }

    // Process the message
    const result = await processMessage(message);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
