// Netlify function to generate AMP versions of blog posts
const { createClient } = require('@supabase/supabase-js');
const sanitizeHtml = require('sanitize-html');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Site information
const SITE_URL = process.env.SITE_URL || 'https://example.com';
const SITE_TITLE = process.env.SITE_TITLE || 'Your Site Name';
const SITE_LOGO_URL = process.env.SITE_LOGO_URL || 'https://example.com/logo.png';

// Helper to escape HTML in attributes
const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Convert regular HTML to AMP-compatible HTML
const convertToAmpHtml = (htmlContent) => {
  if (!htmlContent) return '';

  // First, sanitize the HTML to remove any harmful content
  let cleanHtml = sanitizeHtml(htmlContent, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height']
    }
  });

  // Replace <img> tags with <amp-img>
  cleanHtml = cleanHtml.replace(/<img(.*?)>/g, (match, attributes) => {
    // Extract src, alt, width, and height from attributes
    const srcMatch = attributes.match(/src=["'](.*?)["']/);
    const altMatch = attributes.match(/alt=["'](.*?)["']/);
    const widthMatch = attributes.match(/width=["'](.*?)["']/);
    const heightMatch = attributes.match(/height=["'](.*?)["']/);

    const src = srcMatch ? srcMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';
    const width = widthMatch ? widthMatch[1] : '1200';
    const height = heightMatch ? heightMatch[1] : '800';

    return `<amp-img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" layout="responsive"></amp-img>`;
  });

  // Replace any iframes with amp-iframe
  cleanHtml = cleanHtml.replace(/<iframe(.*?)><\/iframe>/g, (match, attributes) => {
    // Extract src, width, and height from attributes
    const srcMatch = attributes.match(/src=["'](.*?)["']/);
    const widthMatch = attributes.match(/width=["'](.*?)["']/);
    const heightMatch = attributes.match(/height=["'](.*?)["']/);

    const src = srcMatch ? srcMatch[1] : '';
    const width = widthMatch ? widthMatch[1] : '600';
    const height = heightMatch ? heightMatch[1] : '400';

    return `<amp-iframe src="${escapeHtml(src)}" width="${width}" height="${height}" layout="responsive" sandbox="allow-scripts allow-same-origin" frameborder="0"><amp-img layout="fill" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=" placeholder></amp-img></amp-iframe>`;
  });

  // Replace any video players with amp-video
  cleanHtml = cleanHtml.replace(/<video(.*?)>(.*?)<\/video>/g, (match, attributes, content) => {
    // Extract src, width, and height from attributes
    const srcMatch = content.match(/<source src=["'](.*?)["']/);
    const widthMatch = attributes.match(/width=["'](.*?)["']/);
    const heightMatch = attributes.match(/height=["'](.*?)["']/);

    const src = srcMatch ? srcMatch[1] : '';
    const width = widthMatch ? widthMatch[1] : '600';
    const height = heightMatch ? heightMatch[1] : '400';

    return `<amp-video src="${escapeHtml(src)}" width="${width}" height="${height}" layout="responsive" controls></amp-video>`;
  });

  return cleanHtml;
};

// Generate AMP HTML page
const generateAmpPage = async (postId) => {
  try {
    // Fetch the blog post from database
    const { data: post, error } = await supabase
      .from('blog_posts') // Change this to your actual table name
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      throw new Error(`Error fetching post: ${error?.message || 'Post not found'}`);
    }

    // Convert post content to AMP HTML
    const ampContent = convertToAmpHtml(post.content);

    // Format dates
    const datePublished = post.published_at || post.created_at;
    const dateModified = post.updated_at || datePublished;

    // Create article structured data
    const articleStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description || post.excerpt || '',
      image: post.featured_image || '',
      datePublished: datePublished,
      dateModified: dateModified,
      author: {
        '@type': 'Person',
        name: post.author_name || 'Admin',
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_TITLE,
        logo: {
          '@type': 'ImageObject',
          url: SITE_LOGO_URL,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${post.slug}`,
      },
    };

    // Generate complete AMP HTML
    const ampHtml = `<!doctype html>
<html amp lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${escapeHtml(post.title)} | ${escapeHtml(SITE_TITLE)}</title>
  <link rel="canonical" href="${SITE_URL}/blog/${post.slug}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${escapeHtml(post.description || post.excerpt || post.title)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE_URL}/blog/${post.slug}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description || post.excerpt || post.title)}">
  <meta property="og:image" content="${post.featured_image || ''}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${SITE_URL}/blog/${post.slug}">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description || post.excerpt || post.title)}">
  <meta name="twitter:image" content="${post.featured_image || ''}">

  <!-- Schema.org structured data -->
  <script type="application/ld+json">
    ${JSON.stringify(articleStructuredData)}
  </script>

  <!-- AMP boilerplate code -->
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <!-- AMP components -->
  <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
  <script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>
  <script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>

  <!-- Custom styles -->
  <style amp-custom>
    /* AMP CSS must be less than 75KB */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
    }
    header {
      margin-bottom: 24px;
    }
    h1 {
      font-size: 32px;
      line-height: 1.2;
      margin-bottom: 16px;
    }
    .meta {
      font-size: 14px;
      color: #757575;
      margin-bottom: 24px;
    }
    .featured-image {
      margin-bottom: 24px;
    }
    .content {
      font-size: 18px;
    }
    .content p {
      margin-bottom: 16px;
    }
    .content h2 {
      font-size: 24px;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .content img {
      max-width: 100%;
      height: auto;
    }
    .social-share {
      margin-top: 32px;
      display: flex;
      gap: 8px;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #757575;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .nav-link {
      display: inline-block;
      margin-right: 16px;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <!-- Google Analytics -->
  <amp-analytics type="gtag" data-credentials="include">
    <script type="application/json">
    {
      "vars" : {
        "gtag_id": "${process.env.GOOGLE_ANALYTICS_ID || 'G-EXAMPLE123'}",
        "config": {
          "${process.env.GOOGLE_ANALYTICS_ID || 'G-EXAMPLE123'}": { "groups": "default" }
        }
      }
    }
    </script>
  </amp-analytics>

  <header>
    <div class="site-nav">
      <a href="${SITE_URL}" class="nav-link">Home</a>
      <a href="${SITE_URL}/blog" class="nav-link">Blog</a>
      <a href="${SITE_URL}/deals" class="nav-link">Deals</a>
    </div>

    <h1>${escapeHtml(post.title)}</h1>
    <div class="meta">
      <span>By ${escapeHtml(post.author_name || 'Admin')}</span> •
      <time datetime="${datePublished}">${new Date(datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      ${post.updated_at ? ` • Updated: ${new Date(post.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
    </div>

    ${post.featured_image ? `
    <amp-img
      class="featured-image"
      src="${post.featured_image}"
      width="1200"
      height="630"
      layout="responsive"
      alt="${escapeHtml(post.title)}"
    ></amp-img>
    ` : ''}
  </header>

  <article class="content">
    ${ampContent}
  </article>

  <div class="social-share">
    <amp-social-share type="twitter" width="40" height="40"></amp-social-share>
    <amp-social-share type="facebook" width="40" height="40"></amp-social-share>
    <amp-social-share type="linkedin" width="40" height="40"></amp-social-share>
    <amp-social-share type="email" width="40" height="40"></amp-social-share>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} ${escapeHtml(SITE_TITLE)}. All rights reserved.</p>
    <p><a href="${SITE_URL}/privacy-policy">Privacy Policy</a> • <a href="${SITE_URL}/terms">Terms of Use</a></p>
  </div>
</body>
</html>`;

    return ampHtml;
  } catch (error) {
    console.error('Error generating AMP page:', error);
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

  // Get post ID or slug from path
  const postIdOrSlug = event.path.split('/').pop();

  if (!postIdOrSlug) {
    return {
      statusCode: 400,
      body: 'Post ID or slug is required'
    };
  }

  try {
    // Check if we have a numeric ID or a slug
    const isId = /^\d+$/.test(postIdOrSlug);

    // Fetch post by ID or slug
    let post;
    if (isId) {
      post = await generateAmpPage(postIdOrSlug);
    } else {
      // Get post ID from slug
      const { data, error } = await supabase
        .from('blog_posts') // Change this to your actual table name
        .select('id')
        .eq('slug', postIdOrSlug)
        .single();

      if (error || !data) {
        return {
          statusCode: 404,
          body: 'Post not found'
        };
      }

      post = await generateAmpPage(data.id);
    }

    // Return the AMP HTML
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: post
    };
  } catch (error) {
    console.error('Error in AMP page function:', error);

    return {
      statusCode: 500,
      body: `Failed to generate AMP page: ${error.message}`
    };
  }
};
