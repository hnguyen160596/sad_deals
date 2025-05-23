// PageSpeed Insights API integration
const fetch = require('node-fetch');

/**
 * Netlify function to proxy PageSpeed Insights API requests
 * This allows us to use the API without exposing the API key on the client side
 */
exports.handler = async (event) => {
  // Set CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Get URL from query parameters
    const params = new URLSearchParams(event.queryStringParameters);
    const url = params.get('url');
    const strategy = params.get('strategy') || 'mobile';
    const categories = params.get('categories') || 'performance,accessibility,best-practices,seo';

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid URL format' })
      };
    }

    // Call PageSpeed Insights API
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=${categories}${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Process and simplify the response
    const result = processPageSpeedResponse(data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('PageSpeed Insights error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error calling PageSpeed Insights API',
        message: error.message
      })
    };
  }
};

/**
 * Process PageSpeed Insights API response to extract relevant data
 * @param {Object} response - PageSpeed API response
 * @returns {Object} Simplified response
 */
function processPageSpeedResponse(response) {
  const { lighthouseResult, loadingExperience, origin, id } = response;

  // Extract Core Web Vitals metrics
  const coreWebVitals = {
    lcp: loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
    lcpCategory: loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.category,
    fid: loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile,
    fidCategory: loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.category,
    cls: loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
    clsCategory: loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category,
    overallCategory: loadingExperience?.overall_category
  };

  // Extract scores
  const scores = {
    performance: lighthouseResult?.categories?.performance?.score || null,
    accessibility: lighthouseResult?.categories?.accessibility?.score || null,
    bestPractices: lighthouseResult?.categories?.['best-practices']?.score || null,
    seo: lighthouseResult?.categories?.seo?.score || null
  };

  // Extract structured data audit
  const structuredDataAudit = lighthouseResult?.audits?.['structured-data'];

  const structuredData = structuredDataAudit ? {
    score: structuredDataAudit.score,
    details: structuredDataAudit.details,
    description: structuredDataAudit.description,
    issues: extractStructuredDataIssues(structuredDataAudit)
  } : null;

  // Extract key audits
  const keyAudits = extractKeyAudits(lighthouseResult?.audits || {});

  return {
    url: id,
    timestamp: new Date().toISOString(),
    coreWebVitals,
    scores,
    structuredData,
    keyAudits
  };
}

/**
 * Extract structured data issues from audit
 * @param {Object} audit - Structured data audit
 * @returns {Array} List of issues
 */
function extractStructuredDataIssues(audit) {
  if (!audit || !audit.details || !audit.details.items) {
    return [];
  }

  return audit.details.items
    .filter(item => item.status === 'ERROR' || item.status === 'WARNING')
    .map(item => ({
      status: item.status,
      message: item.message || 'Unknown structured data issue'
    }));
}

/**
 * Extract key audits from Lighthouse results
 * @param {Object} audits - Lighthouse audits
 * @returns {Object} Key audit results
 */
function extractKeyAudits(audits) {
  // List of important audits to extract
  const auditKeys = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
    'interactive',
    'max-potential-fid',
    'server-response-time',
    'render-blocking-resources',
    'unminified-css',
    'unminified-javascript',
    'unused-css-rules',
    'unused-javascript',
    'uses-responsive-images',
    'offscreen-images',
    'unsized-images',
    'uses-text-compression',
    'uses-webp-images',
    'third-party-summary',
    'largest-contentful-paint-element',
    'layout-shift-elements',
    'long-tasks',
    'non-composited-animations',
    'font-display',
    'resource-summary'
  ];

  // Extract relevant audits
  const result = {};
  auditKeys.forEach(key => {
    if (audits[key]) {
      result[key] = {
        score: audits[key].score,
        value: audits[key].numericValue,
        displayValue: audits[key].displayValue,
        title: audits[key].title,
        description: audits[key].description
      };
    }
  });

  return result;
}
