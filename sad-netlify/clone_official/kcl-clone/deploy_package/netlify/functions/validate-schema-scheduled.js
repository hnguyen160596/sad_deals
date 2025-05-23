// Scheduled function to validate schema.org structured data across key pages
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

// Configuration for pages to validate
const PAGES_TO_VALIDATE = [
  {
    url: 'https://salesaholicsdeals.com',
    name: 'Homepage'
  },
  {
    url: 'https://salesaholicsdeals.com/deals',
    name: 'Deals Page'
  },
  {
    url: 'https://salesaholicsdeals.com/tips',
    name: 'Tips Page'
  },
  {
    url: 'https://salesaholicsdeals.com/telegram-feed',
    name: 'Telegram Feed'
  }
];

// Configure email settings
const EMAIL_CONFIG = {
  enabled: !!process.env.ADMIN_EMAIL, // Only enable if admin email is set
  adminEmail: process.env.ADMIN_EMAIL,
  fromEmail: process.env.FROM_EMAIL || 'noreply@salesaholicsdeals.com',
  smtpSettings: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
};

/**
 * Entry point for the scheduled function
 */
exports.handler = async (event) => {
  try {
    console.log(`Starting scheduled schema validation at ${new Date().toISOString()}`);

    // Validate schema on each page
    const results = await Promise.all(
      PAGES_TO_VALIDATE.map(page => validatePage(page.url, page.name))
    );

    // Analyze results
    const hasErrors = results.some(result => !result.success);
    const validationSummary = {
      timestamp: new Date().toISOString(),
      totalPages: results.length,
      pagesWithErrors: results.filter(r => !r.success).length,
      pagesWithoutSchema: results.filter(r => r.schemas.length === 0).length,
      results
    };

    // Send email report if there are errors and email is configured
    if (hasErrors && EMAIL_CONFIG.enabled) {
      await sendEmailReport(validationSummary);
    }

    // Store results for later review
    // In a real implementation, you might store this in a database
    console.log('Schema validation results:', JSON.stringify(validationSummary, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Schema validation complete. ${validationSummary.pagesWithErrors} pages with errors.`,
        summary: validationSummary
      })
    };
  } catch (error) {
    console.error('Error in scheduled schema validation:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error in scheduled schema validation',
        message: error.message
      })
    };
  }
};

/**
 * Validate schema.org structured data on a specific page
 * @param {string} url - URL to validate
 * @param {string} name - Name of the page (for reporting)
 * @returns {Object} Validation results
 */
async function validatePage(url, name) {
  try {
    // Make a request to the page
    const response = await fetch(url);
    if (!response.ok) {
      return {
        page: name,
        url,
        success: false,
        schemas: [],
        errors: [`Failed to fetch page: ${response.status} ${response.statusText}`]
      };
    }

    const html = await response.text();

    // Extract JSON-LD scripts
    const schemas = extractJSONLD(html);

    // Validate each schema
    const validationResults = schemas.map(schema => ({
      type: schema['@type'] || 'Unknown',
      valid: validateSchema(schema),
      schema
    }));

    // Check for Schema Validation API if we have a key
    const apiKey = process.env.GOOGLE_API_KEY;
    let apiResults = null;

    if (apiKey) {
      try {
        const pageSpeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=seo&key=${apiKey}`;
        const apiResponse = await fetch(pageSpeedUrl);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const structuredDataAudit = data.lighthouseResult?.audits?.['structured-data'];

          apiResults = {
            score: structuredDataAudit?.score,
            details: structuredDataAudit?.details
          };
        }
      } catch (apiError) {
        console.warn(`PageSpeed API error for ${url}:`, apiError.message);
      }
    }

    // Determine if there are validation issues
    const hasInvalidSchemas = validationResults.some(result => !result.valid);
    const hasApiErrors = apiResults && apiResults.score !== 1;

    return {
      page: name,
      url,
      success: !hasInvalidSchemas && !hasApiErrors,
      schemas: validationResults,
      apiResults,
      errors: getValidationErrors(validationResults, apiResults)
    };
  } catch (error) {
    console.error(`Error validating ${name} (${url}):`, error);

    return {
      page: name,
      url,
      success: false,
      schemas: [],
      errors: [`Error during validation: ${error.message}`]
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
 * Basic schema validation
 * @param {Object} schema - Schema.org JSON-LD object
 * @returns {boolean} Whether schema appears valid
 */
function validateSchema(schema) {
  if (!schema) return false;

  // Check basic requirements
  if (!schema['@context'] || !schema['@context'].includes('schema.org')) {
    return false;
  }

  if (!schema['@type']) {
    return false;
  }

  // Type-specific validation
  const type = schema['@type'];

  switch (type) {
    case 'Product':
      return !!schema.name && (!!schema.image || !!schema.offers);

    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      return !!schema.headline && !!schema.author && !!schema.datePublished;

    case 'FAQPage':
      return !!schema.mainEntity && Array.isArray(schema.mainEntity);

    case 'Event':
      return !!schema.name && !!schema.startDate;

    case 'Recipe':
      return !!schema.name &&
        (!!schema.recipeIngredient || !!schema.ingredients) &&
        (!!schema.recipeInstructions || !!schema.steps);

    default:
      // Basic validation for other types
      return Object.keys(schema).length > 2;
  }
}

/**
 * Get validation errors from results
 * @param {Array} validationResults - Schema validation results
 * @param {Object} apiResults - PageSpeed API results
 * @returns {Array} List of validation errors
 */
function getValidationErrors(validationResults, apiResults) {
  const errors = [];

  // Schema validation errors
  validationResults.forEach(result => {
    if (!result.valid) {
      errors.push(`Invalid ${result.type} schema: missing required properties`);
    }
  });

  // API validation errors
  if (apiResults && apiResults.score !== 1 && apiResults.details) {
    if (apiResults.details.items) {
      apiResults.details.items.forEach(item => {
        if (item.status === 'ERROR' || item.status === 'WARNING') {
          errors.push(item.message || 'Unknown structured data issue from PageSpeed API');
        }
      });
    }
  }

  return errors;
}

/**
 * Send an email report with validation results
 * @param {Object} validationSummary - Schema validation results
 */
async function sendEmailReport(validationSummary) {
  try {
    if (!EMAIL_CONFIG.enabled) {
      console.log('Email reporting disabled: ADMIN_EMAIL not configured');
      return;
    }

    // Create HTML email body
    const htmlBody = `
      <h1>Schema.org Validation Report</h1>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Status:</strong> ${validationSummary.pagesWithErrors > 0 ? '❌ ISSUES FOUND' : '✅ ALL GOOD'}</p>

      <h2>Summary</h2>
      <ul>
        <li><strong>Total Pages Checked:</strong> ${validationSummary.totalPages}</li>
        <li><strong>Pages With Errors:</strong> ${validationSummary.pagesWithErrors}</li>
        <li><strong>Pages Without Schema:</strong> ${validationSummary.pagesWithoutSchema}</li>
      </ul>

      <h2>Page Results</h2>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <tr>
          <th>Page</th>
          <th>Status</th>
          <th>Schema Types</th>
          <th>Errors</th>
        </tr>
        ${validationSummary.results.map(result => `
          <tr>
            <td><a href="${result.url}">${result.page}</a></td>
            <td style="color: ${result.success ? 'green' : 'red'};">${result.success ? '✅ VALID' : '❌ INVALID'}</td>
            <td>${result.schemas.map(s => s.type).join(', ') || 'None'}</td>
            <td>${result.errors.join('<br>') || 'None'}</td>
          </tr>
        `).join('')}
      </table>

      <p><em>This is an automated report from the SalesAholicsDeals schema validation system.</em></p>
    `;

    // Configure mailer
    const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtpSettings);

    // Send email
    const info = await transporter.sendMail({
      from: `"Schema Validator" <${EMAIL_CONFIG.fromEmail}>`,
      to: EMAIL_CONFIG.adminEmail,
      subject: `Schema Validation Report: ${validationSummary.pagesWithErrors > 0 ? 'ISSUES FOUND' : 'All Good'}`,
      html: htmlBody
    });

    console.log(`Email report sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email report:', error);
  }
}
