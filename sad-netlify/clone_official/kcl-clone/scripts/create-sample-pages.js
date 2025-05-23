// Script to create sample pages for testing the ClonedPage component
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample pages to create for testing
const samplePages = [
  {
    path: '/home',
    title: 'Home | Sales Aholics Deals',
    content: `
      <div class="content-wrapper">
        <h1>Welcome to Sales Aholics Deals</h1>
        <p>Find the best deals, coupons, and savings tips all in one place!</p>
        <div class="featured-section">
          <h2>Featured Deals</h2>
          <div class="deals-grid">
            <div class="deal-card">
              <h3>Amazon Echo Dot</h3>
              <p>Only $29.99 (Reg. $49.99)</p>
            </div>
            <div class="deal-card">
              <h3>Target Gift Cards</h3>
              <p>10% off this weekend only!</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/deals',
    title: 'Today\'s Deals | Sales Aholics Deals',
    content: `
      <div class="content-wrapper">
        <h1>Today's Hottest Deals</h1>
        <p>Don't miss these limited-time offers!</p>
        <div class="deals-grid">
          <div class="deal-card">
            <h3>Ninja Blender</h3>
            <p>50% off at Walmart</p>
          </div>
          <div class="deal-card">
            <h3>Apple AirPods Pro</h3>
            <p>Save $70 at Best Buy</p>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/stores',
    title: 'All Stores | Sales Aholics Deals',
    content: `
      <div class="content-wrapper">
        <h1>Browse Stores</h1>
        <p>Find deals from your favorite retailers</p>
        <div class="stores-grid">
          <div class="store-card">
            <h3>Amazon</h3>
          </div>
          <div class="store-card">
            <h3>Target</h3>
          </div>
          <div class="store-card">
            <h3>Walmart</h3>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/coupons-for/amazon',
    title: 'Amazon Deals & Coupons | Sales Aholics Deals',
    content: `
      <div class="content-wrapper">
        <h1>Amazon Deals & Coupons</h1>
        <p>The best deals from Amazon, updated hourly</p>
        <div class="deals-grid">
          <div class="deal-card">
            <h3>Echo Show 5</h3>
            <p>Now $44.99 (Reg. $89.99)</p>
          </div>
          <div class="deal-card">
            <h3>Kindle Paperwhite</h3>
            <p>$30 off for Prime members</p>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/coupons/diapers',
    title: 'Diaper Coupons | Sales Aholics Deals',
    content: `
      <div class="content-wrapper">
        <h1>Diaper Coupons</h1>
        <p>Save on diapers with these printable and digital coupons</p>
        <div class="coupons-grid">
          <div class="coupon-card">
            <h3>$3 off Pampers</h3>
            <p>Valid through June 2025</p>
          </div>
          <div class="coupon-card">
            <h3>Buy 1 Get 1 50% Off Huggies</h3>
            <p>Target Circle members only</p>
          </div>
        </div>
      </div>
    `
  }
];

// Output directory for sample pages
const cloneDir = path.join(__dirname, '../public/clone');

// Make sure the clone directory exists
if (!fs.existsSync(cloneDir)) {
  fs.mkdirSync(cloneDir, { recursive: true });
}

// Create sample pages
samplePages.forEach(page => {
  // Create the HTML content
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${page.title}</title>
    </head>
    <body>
      ${page.content}
    </body>
    </html>
  `;

  // Create the directory for this page
  const outputDir = path.join(cloneDir, page.path);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the HTML file
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  console.log(`Created sample page at ${outputDir}/index.html`);
});

console.log('Sample pages created successfully!');
console.log('These will help test the ClonedPage component while the scraper script runs.');
