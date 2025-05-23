// Netlify serverless function to validate schema.org structured data
const fetch = require('node-fetch');

/**
 * Validate schema.org structured data via Google's Rich Results Test API
 * @param {Object} event - Netlify function event
 * @returns {Object} Response with validation results
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
    const apiKey = process.env.GOOGLE_API_KEY; // Set this in Netlify environment variables

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

    // Run both Rich Results Test and PageSpeed Insights
    const [richResultsData, pageSpeedData] = await Promise.all([
      runRichResultsTest(url, apiKey),
      runPageSpeedTest(url, apiKey)
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        richResults: richResultsData,
        pageSpeed: pageSpeedData,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Schema validation error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error validating schema',
        message: error.message
      })
    };
  }
};

/**
 * Run Google's Rich Results Test API
 * @param {string} url - URL to test
 * @param {string} apiKey - Google API key
 * @returns {Object} Rich Results Test data
 */
async function runRichResultsTest(url, apiKey) {
  // This is a placeholder since Google doesn't have a public API for Rich Results Test
  // In a real implementation, you'd likely need to use a scraping approach or a third-party API
  try {
    // Attempt to fetch the page and parse schemas manually
    const response = await fetch(url);
    const html = await response.text();

    // Extract JSON-LD scripts
    const schemas = extractJSONLD(html);

    // Validate each schema
    const validatedSchemas = schemas.map(schema => {
      const validation = validateSchema(schema);
      return {
        type: Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type'] || 'Unknown',
        valid: validation.valid,
        errors: validation.errors || [],
        data: schema
      };
    });

    return {
      url,
      schemas: validatedSchemas,
      detected: schemas.length > 0,
      detectedTypes: schemas.map(schema => Array.isArray(schema['@type']) ? schema['@type'][0] : schema['@type']),
      valid: validatedSchemas.every(s => s.valid)
    };
  } catch (error) {
    console.error('Error in Rich Results Test:', error);
    return {
      url,
      schemas: [],
      detected: false,
      detectedTypes: [],
      error: error.message
    };
  }
}

/**
 * Run PageSpeed Insights API
 * @param {string} url - URL to test
 * @param {string} apiKey - Google API key
 * @returns {Object} PageSpeed Insights data
 */
async function runPageSpeedTest(url, apiKey) {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=seo${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extract structured data audit
    const structuredDataAudit = data.lighthouseResult?.audits?.['structured-data'];

    return {
      url,
      structuredData: {
        score: structuredDataAudit?.score,
        valid: structuredDataAudit?.score === 1,
        details: structuredDataAudit?.details || {}
      },
      seoScore: data.lighthouseResult?.categories?.seo?.score
    };
  } catch (error) {
    console.error('PageSpeed API error:', error);
    return {
      url,
      structuredData: { score: null, valid: false, details: {} },
      seoScore: null,
      error: error.message
    };
  }
}

/**
 * Extract JSON-LD from HTML
 * @param {string} html - HTML content
 * @returns {Array} Array of schema objects
 */
function extractJSONLD(html) {
  const schemas = [];
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;

  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const schema = JSON.parse(match[1].trim());
      schemas.push(schema);
    } catch (error) {
      console.warn('Error parsing JSON-LD:', error);
    }
  }

  return schemas;
}

/**
 * Enhanced schema validation
 * @param {Object} schema - Schema.org JSON-LD object
 * @returns {Object} Validation result with validity and any errors
 */
function validateSchema(schema) {
  if (!schema) return { valid: false, errors: ['Schema is empty or null'] };

  const errors = [];

  // Check basic requirements
  if (!schema['@context'] || !schema['@context'].includes('schema.org')) {
    errors.push('@context missing or not set to schema.org');
  }

  if (!schema['@type']) {
    errors.push('@type is required');
    return { valid: false, errors };
  }

  // Get the type or handle array of types
  const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];
  const primaryType = types[0]; // Use the first type for primary validation

  // Type-specific validation
  switch (primaryType) {
    case 'Product':
      if (!schema.name) errors.push('Product: name is required');
      if (!schema.image && !schema.offers) errors.push('Product: either image or offers is required');
      if (schema.offers) {
        if (Array.isArray(schema.offers)) {
          // Check individual offers
          schema.offers.forEach((offer, index) => {
            if (!offer.price) errors.push(`Product: offer[${index}] is missing price`);
            if (!offer.priceCurrency) errors.push(`Product: offer[${index}] is missing priceCurrency`);
          });
        } else if (typeof schema.offers === 'object') {
          // Single offer object
          if (!schema.offers.price) errors.push('Product: offers is missing price');
          if (!schema.offers.priceCurrency) errors.push('Product: offers is missing priceCurrency');
        }
      }
      break;

    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      if (!schema.headline) errors.push(`${primaryType}: headline is required`);
      if (schema.headline && schema.headline.length > 110) errors.push(`${primaryType}: headline exceeds Google's 110 character limit`);
      if (!schema.author) errors.push(`${primaryType}: author is required`);
      if (!schema.datePublished) errors.push(`${primaryType}: datePublished is required`);
      if (!schema.publisher) errors.push(`${primaryType}: publisher is required`);
      break;

    case 'FAQPage':
      if (!schema.mainEntity) errors.push('FAQPage: mainEntity is required');
      if (!Array.isArray(schema.mainEntity)) errors.push('FAQPage: mainEntity must be an array');
      else {
        schema.mainEntity.forEach((item, index) => {
          if (item['@type'] !== 'Question') errors.push(`FAQPage: mainEntity[${index}] must have @type Question`);
          if (!item.name) errors.push(`FAQPage: Question[${index}] is missing name (question text)`);
          if (!item.acceptedAnswer) errors.push(`FAQPage: Question[${index}] is missing acceptedAnswer`);
          if (item.acceptedAnswer && item.acceptedAnswer['@type'] !== 'Answer')
            errors.push(`FAQPage: acceptedAnswer[${index}] must have @type Answer`);
          if (item.acceptedAnswer && !item.acceptedAnswer.text) errors.push(`FAQPage: Answer[${index}] is missing text`);
        });
      }
      break;

    case 'Event':
      if (!schema.name) errors.push('Event: name is required');
      if (!schema.startDate) errors.push('Event: startDate is required');
      if (!schema.location) errors.push('Event: location is required');
      if (schema.location && !schema.location.name) errors.push('Event: location.name is required');
      break;

    case 'Recipe':
      if (!schema.name) errors.push('Recipe: name is required');
      if (!schema.recipeIngredient && !schema.ingredients) errors.push('Recipe: recipeIngredient is required');
      if (!schema.recipeInstructions && !schema.steps) errors.push('Recipe: recipeInstructions is required');
      if (!schema.author) errors.push('Recipe: author is required');
      break;

    case 'JobPosting':
      if (!schema.title) errors.push('JobPosting: title is required');
      if (!schema.description) errors.push('JobPosting: description is required');
      if (!schema.datePosted) errors.push('JobPosting: datePosted is required');
      if (!schema.hiringOrganization) errors.push('JobPosting: hiringOrganization is required');
      if (schema.hiringOrganization && !schema.hiringOrganization.name)
        errors.push('JobPosting: hiringOrganization.name is required');
      break;

    case 'WebSite':
      if (!schema.name) errors.push('WebSite: name is required');
      if (!schema.url) errors.push('WebSite: url is required');
      break;

    case 'VideoObject':
      if (!schema.name) errors.push('VideoObject: name is required');
      if (!schema.description) errors.push('VideoObject: description is required');
      if (!schema.thumbnailUrl) errors.push('VideoObject: thumbnailUrl is required');
      if (!schema.uploadDate) errors.push('VideoObject: uploadDate is required');
      if (!schema.contentUrl && !schema.embedUrl) errors.push('VideoObject: either contentUrl or embedUrl is required');
      break;

    case 'LocalBusiness':
      if (!schema.name) errors.push('LocalBusiness: name is required');
      if (!schema.address) errors.push('LocalBusiness: address is required');
      if (schema.address && !schema.address.streetAddress) errors.push('LocalBusiness: address.streetAddress is required');
      if (schema.address && !schema.address.addressLocality) errors.push('LocalBusiness: address.addressLocality is required');
      break;

    case 'AggregateRating':
      if (schema.ratingValue === undefined) errors.push('AggregateRating: ratingValue is required');
      if (schema.ratingCount === undefined && schema.reviewCount === undefined)
        errors.push('AggregateRating: either ratingCount or reviewCount is required');
      break;

    default:
      // Basic validation for other types
      if (Object.keys(schema).length <= 2) errors.push(`${primaryType}: Schema has minimal properties`);
      break;
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
