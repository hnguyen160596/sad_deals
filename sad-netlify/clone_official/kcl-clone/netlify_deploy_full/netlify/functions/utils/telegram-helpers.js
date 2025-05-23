/**
 * Shared helper functions for Telegram integration
 * This centralizes logic for both telegram-bot.js and telegram-webhook.js
 */
const amazonHelpers = require('./amazon-helpers');

/**
 * Extract price from message text using regex
 * @param {string} text Message text
 * @returns {string|null} Extracted price or null
 */
const extractPrice = (text) => {
  if (!text) return null;
  const priceRegex = /\$\d+(\.\d{2})?/;
  const match = text.match(priceRegex);
  return match ? match[0] : null;
};

/**
 * Extract store name from message text
 * @param {string} text Message text
 * @returns {string|null} Store name or null
 */
const extractStore = (text) => {
  if (!text) return null;
  const storeNames = ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Home Depot', 'Costco', 'eBay', 'Lowes', 'Macys', 'Walgreens', 'CVS'];
  for (const store of storeNames) {
    if (text.toLowerCase().includes(store.toLowerCase())) return store;
  }
  return null;
};

/**
 * Extract product title from message
 * @param {string} text Message text
 * @returns {string} Extracted title
 */
const extractTitle = (text) => {
  if (!text) return '';
  // Remove any URLs
  const cleanText = text.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g, '');
  // Get first line or first 100 chars
  const lines = cleanText.split('\n');
  return lines[0].length > 100 ? lines[0].substring(0, 100) + '...' : lines[0];
};

/**
 * Extract category from message text
 * @param {string} text Message text
 * @returns {string|null} Category or null
 */
const extractCategory = (text) => {
  if (!text) return null;

  const categoryKeywords = {
    'Electronics': ['electronics', 'smartphone', 'laptop', 'computer', 'tablet', 'headphone', 'earbuds', 'camera', 'tv', 'monitor'],
    'Kitchen': ['kitchen', 'cookware', 'appliance', 'blender', 'mixer', 'microwave', 'oven', 'knife', 'pot', 'pan'],
    'Home': ['home', 'furniture', 'décor', 'decor', 'bedroom', 'bathroom', 'living room', 'rug', 'curtain', 'sheet'],
    'Clothing': ['clothing', 'dress', 'shirt', 'pants', 'jacket', 'shoes', 'fashion', 'apparel', 't-shirt', 'outfit'],
    'Beauty': ['beauty', 'makeup', 'skin care', 'skincare', 'moisturizer', 'sunscreen', 'foundation', 'mascara', 'lipstick', 'serum'],
    'Toys': ['toys', 'games', 'play', 'children', 'kids', 'lego', 'puzzle', 'board game', 'doll', 'action figure'],
    'Sports': ['sports', 'fitness', 'exercise', 'workout', 'gym', 'outdoor', 'camping', 'hiking', 'bike', 'basketball'],
    'Books': ['books', 'novel', 'textbook', 'reading', 'kindle'],
    'Grocery': ['grocery', 'food', 'snack', 'drink', 'beverage', 'coffee', 'tea', 'water', 'soda', 'juice']
  };

  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other'; // Default category
};

/**
 * Extract URLs from message entities
 * @param {string} text Message text
 * @param {Array} entities Message entities
 * @returns {Array} Array of extracted URLs
 */
const extractLinks = (text, entities) => {
  if (!entities || !entities.length) {
    // If no entities provided, try to extract URLs directly from text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text?.match(urlRegex) || [];
    return matches;
  }

  const links = [];
  entities.forEach(entity => {
    if (entity.type === 'url' || entity.type === 'text_link') {
      const url = entity.type === 'url'
        ? text.substring(entity.offset, entity.offset + entity.length)
        : entity.url;

      // Process Amazon links to ensure they have the affiliate tag
      const processedUrl = url.includes('amazon.com')
        ? amazonHelpers.convertToAffiliateLink(url)
        : url;

      links.push(processedUrl);
    }
  });

  return links;
};

/**
 * Process a message from the Telegram channel
 * @param {Object} message Telegram message object
 * @param {boolean} includePhotoUrl Whether to include photo URL
 * @returns {Object} Processed message data ready for database
 */
const processMessageData = (message, includePhotoUrl = false) => {
  if (!message || !message.message_id) {
    throw new Error('Invalid message object');
  }

  const text = message.text || message.caption || '';
  const entities = message.entities || message.caption_entities || [];
  const links = extractLinks(text, entities);
  const price = extractPrice(text);
  const store = extractStore(text);
  const title = extractTitle(text);

  // Create message data object for database
  const messageData = {
    telegram_message_id: message.message_id,
    channel_id: message.chat?.id?.toString(),
    text: text,
    date: new Date((message.date || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    price: price,
    store: store,
    title: title,
    links: links,
    has_photo: message.photo && message.photo.length > 0,
    created_at: new Date().toISOString()
  };

  // Add photo info if present
  if (message.photo && message.photo.length > 0) {
    // Get the largest photo (last in array)
    const photo = message.photo[message.photo.length - 1];
    messageData.photo_file_id = photo.file_id;

    // Optionally include URL (requires additional API call in the main function)
    if (includePhotoUrl && photo.file_id) {
      messageData.photo_url = photo.file_id; // Placeholder, will be replaced with actual URL
    }
  }

  return messageData;
};

/**
 * Get a file URL from Telegram
 * @param {string} fileId Telegram file ID
 * @param {string} botToken Telegram bot token
 * @returns {Promise<string|null>} File URL or null
 */
const getFileUrl = async (fileId, botToken) => {
  if (!fileId || !botToken) return null;

  try {
    const axios = require('axios');
    const TELEGRAM_API = `https://api.telegram.org/bot${botToken}`;

    const response = await axios.get(`${TELEGRAM_API}/getFile?file_id=${fileId}`, {
      timeout: 10000 // 10-second timeout
    });

    if (response.data && response.data.ok) {
      const filePath = response.data.result.file_path;
      return `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    }

    return null;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

module.exports = {
  extractPrice,
  extractStore,
  extractTitle,
  extractLinks,
  processMessageData,
  getFileUrl
};
