// Script to scrape and save pages from thekrazycouponlady.com
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URLs to scrape
const urls = [
  // Stores
  '/',
  '/coupons-for/amazon',
  '/coupons-for/costco',
  '/coupons-for/cvs',
  '/coupons-for/dollar-general',
  '/coupons-for/kohls',
  '/coupons-for/kroger',
  '/coupons-for/sams-club',
  '/coupons-for/target',
  '/coupons-for/walgreens',
  '/coupons-for/walmart',
  '/stores',

  // Deals
  '/deals',
  '/deals/online',
  '/deals/extreme-couponing',
  '/deals/freebies',
  '/deals/gift-card',
  '/deals/clearance',
  '/deals/shoes',
  '/deals/lego',
  '/deals/baby',
  '/deals/toys',
  '/deals/subscribe-and-save',
  '/deals/easter',
  '/deals/apparel',
  '/deals/printable-only',
  '/deals/moneymakers',
  '/deals/cricut',
  '/deals/rebates',
  '/deals/vacuums',
  '/deals/dining',
  '/deals/coupon-previews',
  '/deals/yeti',
  '/deals/valentines-day',
  '/deals/mothers-day',
  '/deals/catalinas',
  '/deals/photo',
  '/deals/bedding',

  // Coupons
  '/coupons',
  '/coupons/diapers',
  '/coupons/dove',
  '/coupons/loreal',
  '/coupons/huggies',
  '/coupons/food',
  '/coupons/gain',
  '/coupons/hills-science-diet',
  '/coupons/pampers',
  '/coupons/tide',
  '/coupons/persil',
  '/coupons/soda',
  '/coupons/coke',
  '/coupons/air-wick',
  '/coupons/pepsi',
  '/coupons/cerave',
  '/coupons/dog',
  '/coupons/laundry',
  '/coupons/detergent',
  '/coupons/toilet-paper',
  '/coupons/garnier',
  '/coupons/febreze',
  '/coupons/arm-hammer',
  '/coupons/swiffer',
  '/coupons/ibotta',
  '/coupons/general-mills',

  // Tips
  '/tips',
  '/tips/home',
  '/tips/couponing',
  '/tips/travel',
  '/tips/store-hacks',
  '/tips/money',
  '/tips/family',
  '/tips/recipes',
  '/tips/diy',
  '/tips-sitemap',

  // Other pages
  '/krazy-coupon-lady-privacy-policy',
  '/contact',
  '/beginners',
];

const baseUrl = 'https://thekrazycouponlady.com';
const outputDir = path.join(__dirname, '../public/clone');

// Make sure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to download and save a page
async function scrapePage(url) {
  try {
    console.log(`Scraping ${url}...`);

    // Fetch the page content
    const response = await axios.get(`${baseUrl}${url}`);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Create necessary directories
    const urlPath = url === '/' ? '/home' : url;
    const outputPath = path.join(outputDir, urlPath);
    fs.mkdirSync(outputPath, { recursive: true });

    // Extract the content
    const pageContent = {
      title: $('title').text(),
      body: $('body').html(),
    };

    // Create a simplified HTML file with just the content
    const simplifiedHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageContent.title}</title>
      </head>
      <body>
        ${pageContent.body}
      </body>
      </html>
    `;

    // Save the file
    fs.writeFileSync(path.join(outputPath, 'index.html'), simplifiedHtml);
    console.log(`Saved ${url} to ${outputPath}/index.html`);

    // Find and download images (in a real implementation, this would download and save images locally)
    // This is simplified here

    return true;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return false;
  }
}

// Main function to scrape all pages
async function scrapeAllPages() {
  console.log(`Starting to scrape ${urls.length} pages...`);

  // Scrape pages sequentially to avoid rate limiting
  for (const url of urls) {
    await scrapePage(url);
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Scraping completed!');
}

// Start the scraping process
scrapeAllPages();
