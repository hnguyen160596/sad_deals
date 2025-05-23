/**
 * Amazon API helper functions for affiliate links and product information
 */
const crypto = require('crypto');
const axios = require('axios');

// Amazon API credentials provided by the user
const credentials = {
  accessKey: 'AKPA6R5GYQ1746210519',
  secretKey: '2hv12au36ZQj3tNyrL4jpSQbe9cWy3cobMo8P7mp',
  partnerTag: 'salesaholics99-20',
  region: 'us-east-1', // Default region for Amazon.com
  host: 'webservices.amazon.com'
};

/**
 * Generate an Amazon affiliate link for a product
 * @param {string} asin Amazon ASIN
 * @returns {string} Amazon affiliate link
 */
const generateAffiliateLink = (asin) => {
  if (!asin) return null;
  return `https://www.amazon.com/dp/${asin}/?tag=${credentials.partnerTag}`;
};

/**
 * Extract ASIN from Amazon URL
 * @param {string} url Amazon product URL
 * @returns {string|null} ASIN or null
 */
const extractASIN = (url) => {
  if (!url) return null;

  try {
    // Match ASIN patterns in Amazon URLs
    const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/ASIN\/|\/B0|B00)([A-Z0-9]{9,10})(?:\/|\?|$)/i;
    const match = url.match(asinRegex);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting ASIN:', error);
    return null;
  }
};

/**
 * Convert a regular Amazon link to an affiliate link
 * @param {string} url Original Amazon URL
 * @returns {string} Amazon affiliate link
 */
const convertToAffiliateLink = (url) => {
  if (!url || !url.includes('amazon.com')) return url;

  try {
    // Check if already contains our tag
    if (url.includes(`tag=${credentials.partnerTag}`)) {
      return url;
    }

    // Remove any existing tag
    const cleanUrl = url.replace(/(\?|&)tag=[^&]*(&|$)/, '$1');

    // Extract ASIN
    const asin = extractASIN(cleanUrl);
    if (asin) {
      return generateAffiliateLink(asin);
    }

    // If ASIN extraction failed, just append our tag
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}tag=${credentials.partnerTag}`;
  } catch (error) {
    console.error('Error converting affiliate link:', error);
    return url;
  }
};

/**
 * Sign a request to Amazon's API
 * @param {string} method HTTP method
 * @param {string} path Path
 * @param {Object} query Query parameters
 * @param {Object} headers Headers
 * @returns {Object} Signed headers
 */
const signRequest = (method, path, query, headers) => {
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = timestamp.slice(0, 8);

  headers = headers || {};
  headers['host'] = credentials.host;
  headers['x-amz-date'] = timestamp;

  // Create canonical request
  const canonical = [
    method.toUpperCase(),
    path,
    Object.keys(query).sort().map(k => `${k}=${encodeURIComponent(query[k])}`).join('&'),
    Object.keys(headers).sort().map(k => `${k.toLowerCase()}:${headers[k]}`).join('\n'),
    '',
    Object.keys(headers).sort().map(k => k.toLowerCase()).join(';'),
    'UNSIGNED-PAYLOAD'
  ].join('\n');

  // Create string to sign
  const credentialScope = `${date}/${credentials.region}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonical).digest('hex')
  ].join('\n');

  // Calculate signature
  const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
    const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  };

  const signature = crypto.createHmac('sha256', getSignatureKey(credentials.secretKey, date, credentials.region, 'ProductAdvertisingAPI'))
    .update(stringToSign)
    .digest('hex');

  // Add authorization header
  headers['Authorization'] = [
    `AWS4-HMAC-SHA256 Credential=${credentials.accessKey}/${credentialScope}`,
    `SignedHeaders=${Object.keys(headers).sort().map(k => k.toLowerCase()).join(';')}`,
    `Signature=${signature}`
  ].join(', ');

  return headers;
};

/**
 * Get product information from Amazon API
 * @param {string} asin Amazon ASIN
 * @returns {Promise<Object>} Product information
 */
const getProductInfo = async (asin) => {
  if (!asin) return null;

  // For development, return mock data to avoid making real API calls
  if (process.env.NODE_ENV === 'development') {
    return {
      title: 'Sample Amazon Product',
      price: '$99.99',
      imageUrl: 'https://via.placeholder.com/300',
      url: generateAffiliateLink(asin)
    };
  }

  try {
    const path = '/paapi5/getitems';
    const query = {
      'ItemIds': asin,
      'ItemIdType': 'ASIN',
      'PartnerTag': credentials.partnerTag,
      'PartnerType': 'Associates',
      'Resources': 'Images.Primary.Large,ItemInfo.Title,Offers.Listings.Price'
    };

    const headers = signRequest('POST', path, query, {
      'content-type': 'application/json'
    });

    const response = await axios({
      method: 'POST',
      url: `https://${credentials.host}${path}`,
      headers,
      data: {
        ItemIds: [asin],
        ItemIdType: 'ASIN',
        PartnerTag: credentials.partnerTag,
        PartnerType: 'Associates',
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'Offers.Listings.Price'
        ]
      }
    });

    if (response.data && response.data.ItemsResult && response.data.ItemsResult.Items.length > 0) {
      const item = response.data.ItemsResult.Items[0];
      return {
        title: item.ItemInfo.Title.DisplayValue,
        price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Check price',
        imageUrl: item.Images?.Primary?.Large?.URL,
        url: generateAffiliateLink(asin)
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching product info:', error);
    return null;
  }
};

/**
 * Process all links in text and convert Amazon links to affiliate links
 * @param {string} text Text containing links
 * @returns {string} Text with converted affiliate links
 */
const processAffiliateLinks = (text) => {
  if (!text) return text;

  try {
    // Regular expression to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, (url) => {
      if (url.includes('amazon.com')) {
        return convertToAffiliateLink(url);
      }
      return url;
    });
  } catch (error) {
    console.error('Error processing affiliate links:', error);
    return text;
  }
};

module.exports = {
  generateAffiliateLink,
  extractASIN,
  convertToAffiliateLink,
  getProductInfo,
  processAffiliateLinks
};
