// Netlify Function to generate a dynamic sitemap for SEO
const { createClient } = require('@supabase/supabase-js');

// Initialize database client if available
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Base URL for the site
const BASE_URL = process.env.URL || 'https://salesaholicsdeals.com';

// Get dynamic pages from the database
const getDynamicPages = async () => {
  // If no database connection, return empty array
  if (!supabase) {
    console.log('No Supabase connection, using static pages only');
    return [];
  }

  try {
    // Get store pages
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('slug, name, updated_at')
      .order('name');

    if (storesError) throw storesError;

    const storeUrls = stores.map(store => ({
      url: `/stores/${store.slug}`,
      lastmod: store.updated_at ? new Date(store.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      priority: '0.8',
      changefreq: 'daily'
    }));

    // Get deal categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, name, updated_at')
      .order('name');

    if (categoriesError) throw categoriesError;

    const categoryUrls = categories.map(category => ({
      url: `/deals/${category.slug}`,
      lastmod: category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      priority: '0.8',
      changefreq: 'daily'
    }));

    // Get deal pages
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('slug, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500); // Limit to 500 most recent deals

    if (dealsError) throw dealsError;

    const dealUrls = deals.map(deal => ({
      url: `/deal/${deal.slug}`,
      lastmod: deal.updated_at ? new Date(deal.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      priority: '0.7',
      changefreq: 'weekly'
    }));

    return [...storeUrls, ...categoryUrls, ...dealUrls];
  } catch (error) {
    console.error('Error fetching dynamic pages:', error);
    return [];
  }
};

// Define static pages with their priorities and change frequencies
const getStaticPages = () => {
  return [
    { url: '/', lastmod: new Date().toISOString().split('T')[0], priority: '1.0', changefreq: 'daily' },
    { url: '/deals', lastmod: new Date().toISOString().split('T')[0], priority: '0.9', changefreq: 'daily' },
    { url: '/todays-deals', lastmod: new Date().toISOString().split('T')[0], priority: '0.9', changefreq: 'daily' },
    { url: '/stores', lastmod: new Date().toISOString().split('T')[0], priority: '0.8', changefreq: 'weekly' },
    { url: '/tips', lastmod: new Date().toISOString().split('T')[0], priority: '0.7', changefreq: 'weekly' },
    { url: '/telegram-feed', lastmod: new Date().toISOString().split('T')[0], priority: '0.6', changefreq: 'weekly' },
    { url: '/about', lastmod: new Date().toISOString().split('T')[0], priority: '0.5', changefreq: 'monthly' },
    { url: '/contact', lastmod: new Date().toISOString().split('T')[0], priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy-policy', lastmod: new Date().toISOString().split('T')[0], priority: '0.4', changefreq: 'monthly' },
  ];
};

// Generate the sitemap XML string
const generateSitemapXml = (urls) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;
};

// Main handler function
exports.handler = async (event, context) => {
  try {
    console.log('Generating sitemap...');

    // Get static pages
    const staticPages = getStaticPages();

    // Get dynamic pages from database
    const dynamicPages = await getDynamicPages();

    // Combine all pages
    const allPages = [...staticPages, ...dynamicPages];

    // Generate the sitemap XML
    const sitemapXml = generateSitemapXml(allPages);

    console.log(`Sitemap generated with ${allPages.length} URLs`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
      body: sitemapXml
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error generating sitemap', details: error.message })
    };
  }
};
