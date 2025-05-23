// Netlify function to generate a Google Merchant Center product feed
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Site information
const SITE_URL = process.env.SITE_URL || 'https://example.com';
const SITE_TITLE = process.env.SITE_TITLE || 'Your Site Name';

// Helper to escape XML characters
const escapeXml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Generate the XML product feed
const generateProductFeed = async () => {
  try {
    // Fetch active deals from database
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching deals: ${error.message}`);
    }

    // Start the XML document
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Best deals and discounts</description>
`;

    // Generate entry for each deal
    deals.forEach(deal => {
      // Skip deals without required fields
      if (!deal.title || !deal.id || !deal.url || !deal.price) return;

      // Convert price to proper format (numeric value with currency)
      let price = deal.price;
      if (typeof price === 'string') {
        // Remove currency symbol and ensure proper format
        price = price.replace(/[^0-9.]/g, '');
      }

      // Skip deals with invalid prices
      if (!price || isNaN(parseFloat(price))) return;

      // Format the price with currency
      const formattedPrice = `${parseFloat(price).toFixed(2)} USD`;

      // Get the primary image URL
      const imageUrl = deal.imageUrl || deal.image_url || '';

      // Get the product availability
      const availability = deal.in_stock ? 'in stock' : 'out of stock';

      // Get appropriate Google category
      let category = 'Home & Garden > Household Supplies';
      if (deal.category) {
        if (deal.category.toLowerCase().includes('electronic')) {
          category = 'Electronics';
        } else if (deal.category.toLowerCase().includes('apparel') ||
                  deal.category.toLowerCase().includes('clothing')) {
          category = 'Apparel & Accessories';
        } else if (deal.category.toLowerCase().includes('toy')) {
          category = 'Toys & Games';
        }
      }

      // Generate the item entry
      xml += `    <item>
      <g:id>${escapeXml(deal.id.toString())}</g:id>
      <g:title>${escapeXml(deal.title)}</g:title>
      <g:description>${escapeXml(deal.description || deal.title)}</g:description>
      <g:link>${escapeXml(deal.url)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${escapeXml(formattedPrice)}</g:price>
      <g:availability>${escapeXml(availability)}</g:availability>
      <g:brand>${escapeXml(deal.store || 'Various')}</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:google_product_category>${escapeXml(category)}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
    </item>
`;
    });

    // Close the XML document
    xml += `  </channel>
</rss>`;

    return xml;
  } catch (error) {
    console.error('Error generating product feed:', error);
    throw error;
  }
};

// Netlify function handler
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  // Check for optional API key
  const apiKey = event.queryStringParameters?.key;
  const configuredKey = process.env.PRODUCT_FEED_API_KEY;

  if (configuredKey && apiKey !== configuredKey) {
    return {
      statusCode: 401,
      body: 'Unauthorized'
    };
  }

  try {
    // Generate the product feed
    const productFeedXml = await generateProductFeed();

    // Return the XML response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: productFeedXml
    };
  } catch (error) {
    console.error('Error in product feed function:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate product feed' })
    };
  }
};
