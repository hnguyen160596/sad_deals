/**
 * Schema Validator Utility
 * Provides functions to validate schema.org JSON-LD data for SEO
 */

/**
 * Validates a schema object for required fields based on schema type
 * @param schema The schema object to validate
 * @returns Validation result with errors if any
 */
export const validateSchema = (schema: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for required context and type
  if (!schema['@context'] || schema['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context. Must be "https://schema.org"');
  }

  if (!schema['@type']) {
    errors.push('Missing @type property');
    return { valid: errors.length === 0, errors };
  }

  // Validate based on schema type
  switch (schema['@type']) {
    case 'Product':
      validateProductSchema(schema, errors);
      break;
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      validateArticleSchema(schema, errors);
      break;
    case 'BreadcrumbList':
      validateBreadcrumbSchema(schema, errors);
      break;
    case 'FAQPage':
      validateFAQSchema(schema, errors);
      break;
    case 'LocalBusiness':
      validateLocalBusinessSchema(schema, errors);
      break;
    default:
      errors.push(`Validation for schema type "${schema['@type']}" not implemented`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validates a Product schema
 */
const validateProductSchema = (schema: any, errors: string[]) => {
  const requiredFields = ['name', 'image', 'description'];
  checkRequiredFields(schema, requiredFields, errors);

  // Check offers
  if (schema.offers) {
    if (Array.isArray(schema.offers)) {
      schema.offers.forEach((offer: any, index: number) => {
        if (!offer.price) {
          errors.push(`Offer at index ${index} is missing price`);
        }
        if (!offer.priceCurrency) {
          errors.push(`Offer at index ${index} is missing priceCurrency`);
        }
      });
    } else if (typeof schema.offers === 'object') {
      if (!schema.offers.price) {
        errors.push('Product offer is missing price');
      }
      if (!schema.offers.priceCurrency) {
        errors.push('Product offer is missing priceCurrency');
      }
    }
  }
};

/**
 * Validates an Article schema
 */
const validateArticleSchema = (schema: any, errors: string[]) => {
  const requiredFields = ['headline', 'author', 'datePublished', 'image'];
  checkRequiredFields(schema, requiredFields, errors);

  // Check headline length (Google limits to ~110 chars)
  if (schema.headline && schema.headline.length > 110) {
    errors.push(`Headline exceeds Google's recommended limit of 110 characters (${schema.headline.length})`);
  }

  // Check author
  if (schema.author && typeof schema.author === 'object') {
    if (!schema.author.name) {
      errors.push('Author object is missing name property');
    }
  }
};

/**
 * Validates a BreadcrumbList schema
 */
const validateBreadcrumbSchema = (schema: any, errors: string[]) => {
  if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
    errors.push('BreadcrumbList is missing itemListElement array');
    return;
  }

  schema.itemListElement.forEach((item: any, index: number) => {
    if (item['@type'] !== 'ListItem') {
      errors.push(`BreadcrumbList item at index ${index} must have @type of "ListItem"`);
    }

    if (!item.position) {
      errors.push(`BreadcrumbList item at index ${index} is missing position property`);
    }

    if (!item.item) {
      errors.push(`BreadcrumbList item at index ${index} is missing item property`);
    } else {
      if (!item.item['@id'] && !item.item.url) {
        errors.push(`BreadcrumbList item at index ${index} is missing item.@id or item.url property`);
      }

      if (!item.item.name) {
        errors.push(`BreadcrumbList item at index ${index} is missing item.name property`);
      }
    }
  });
};

/**
 * Validates a FAQPage schema
 */
const validateFAQSchema = (schema: any, errors: string[]) => {
  if (!schema.mainEntity || (!Array.isArray(schema.mainEntity) && typeof schema.mainEntity !== 'object')) {
    errors.push('FAQPage is missing mainEntity property');
    return;
  }

  const questions = Array.isArray(schema.mainEntity) ? schema.mainEntity : [schema.mainEntity];

  questions.forEach((question: any, index: number) => {
    if (question['@type'] !== 'Question') {
      errors.push(`FAQ question at index ${index} must have @type of "Question"`);
    }

    if (!question.name) {
      errors.push(`FAQ question at index ${index} is missing name property`);
    }

    if (!question.acceptedAnswer) {
      errors.push(`FAQ question at index ${index} is missing acceptedAnswer property`);
    } else {
      if (question.acceptedAnswer['@type'] !== 'Answer') {
        errors.push(`FAQ answer at index ${index} must have @type of "Answer"`);
      }

      if (!question.acceptedAnswer.text) {
        errors.push(`FAQ answer at index ${index} is missing text property`);
      }
    }
  });
};

/**
 * Validates a LocalBusiness schema
 */
const validateLocalBusinessSchema = (schema: any, errors: string[]) => {
  const requiredFields = ['name', 'address', 'telephone'];
  checkRequiredFields(schema, requiredFields, errors);

  // Check address
  if (schema.address && typeof schema.address === 'object') {
    if (schema.address['@type'] !== 'PostalAddress') {
      errors.push('Address must have @type of "PostalAddress"');
    }

    const addressRequiredFields = ['streetAddress', 'addressLocality', 'addressRegion', 'postalCode'];
    checkRequiredFields(schema.address, addressRequiredFields, errors, 'address');
  }

  // Check opening hours
  if (schema.openingHoursSpecification && Array.isArray(schema.openingHoursSpecification)) {
    schema.openingHoursSpecification.forEach((spec: any, index: number) => {
      if (spec['@type'] !== 'OpeningHoursSpecification') {
        errors.push(`Opening hours at index ${index} must have @type of "OpeningHoursSpecification"`);
      }

      if (!spec.dayOfWeek || !spec.opens || !spec.closes) {
        errors.push(`Opening hours at index ${index} is missing required properties (dayOfWeek, opens, closes)`);
      }
    });
  }
};

/**
 * Helper function to check for required fields in a schema
 */
const checkRequiredFields = (schema: any, requiredFields: string[], errors: string[], prefix: string = '') => {
  requiredFields.forEach(field => {
    if (schema[field] === undefined || schema[field] === null || schema[field] === '') {
      errors.push(`${prefix ? prefix + '.' : ''}${field} is required but missing or empty`);
    }
  });
};

/**
 * Tests all schemas on the page and returns validation results
 * @returns Validation results for all schemas found
 */
export const validateAllSchemas = (): { valid: boolean; schemaResults: Array<{ type: string; valid: boolean; errors: string[] }> } => {
  const schemaResults: Array<{ type: string; valid: boolean; errors: string[] }> = [];
  let overallValid = true;

  try {
    // Find all JSON-LD scripts in the page
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    scripts.forEach((script, index) => {
      try {
        const schema = JSON.parse(script.textContent || '{}');
        const type = schema['@type'] || `Unknown (index ${index})`;
        const result = validateSchema(schema);

        schemaResults.push({
          type,
          valid: result.valid,
          errors: result.errors
        });

        if (!result.valid) {
          overallValid = false;
        }
      } catch (e) {
        schemaResults.push({
          type: `Parse error (index ${index})`,
          valid: false,
          errors: [`Error parsing JSON: ${e}`]
        });
        overallValid = false;
      }
    });

    return { valid: overallValid, schemaResults };
  } catch (e) {
    return {
      valid: false,
      schemaResults: [{
        type: 'System error',
        valid: false,
        errors: [`Error validating schemas: ${e}`]
      }]
    };
  }
};
