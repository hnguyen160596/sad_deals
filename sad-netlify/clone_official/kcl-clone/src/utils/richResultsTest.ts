/**
 * Rich Results Test Utilities
 *
 * This module provides utilities for working with Google's Rich Results Test Tool
 * to validate schema.org structured data on your pages and see how they might
 * appear in search results.
 */

/**
 * Opens the Google Rich Results Test tool for a given URL
 * @param url The URL to test with Google's Rich Results Test tool
 */
export const openRichResultsTest = (url: string = window.location.href) => {
  window.open(`https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`, '_blank');
};

/**
 * Opens the Schema.org Validator for a given URL
 * @param url The URL to validate with the Schema.org Validator
 */
export const openSchemaValidator = (url: string = window.location.href) => {
  window.open(`https://validator.schema.org/#url=${encodeURIComponent(url)}`, '_blank');
};

/**
 * Maps schema.org types to Rich Results Test feature URLs
 * This helps understand what types support rich results
 */
export const richResultsFeatures = {
  Article: 'https://developers.google.com/search/docs/appearance/structured-data/article',
  BreadcrumbList: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
  FAQPage: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
  HowTo: 'https://developers.google.com/search/docs/appearance/structured-data/how-to',
  LocalBusiness: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
  Product: 'https://developers.google.com/search/docs/appearance/structured-data/product',
  Recipe: 'https://developers.google.com/search/docs/appearance/structured-data/recipe',
  Review: 'https://developers.google.com/search/docs/appearance/structured-data/review-snippet',
  VideoObject: 'https://developers.google.com/search/docs/appearance/structured-data/video',
  Event: 'https://developers.google.com/search/docs/appearance/structured-data/event',
  JobPosting: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
  Course: 'https://developers.google.com/search/docs/appearance/structured-data/course',
  Dataset: 'https://developers.google.com/search/docs/appearance/structured-data/dataset',
  SoftwareApplication: 'https://developers.google.com/search/docs/appearance/structured-data/software-app',
  SpecialAnnouncement: 'https://developers.google.com/search/docs/appearance/structured-data/special-announcements',
};

/**
 * Gets the document URL with embedded schema.org as a sharable test URL
 * @param schemaType The schema.org type to test (e.g., 'Product', 'FAQPage')
 * @returns A Google Rich Results Test URL for the current page focusing on the specified schema type
 */
export const getTestUrlForSchemaType = (schemaType: string): string => {
  return `https://search.google.com/test/rich-results?url=${encodeURIComponent(window.location.href)}&user_agent=2&view=search-preview&schema-type=${schemaType}`;
};

/**
 * Extracts all schema types from the current page
 * @returns An array of schema.org @type values found in the document
 */
export const extractSchemaTypes = (): string[] => {
  const schemas = document.querySelectorAll('script[type="application/ld+json"]');
  const types: string[] = [];

  schemas.forEach(schema => {
    try {
      const parsed = JSON.parse(schema.textContent || '{}');
      if (parsed['@type']) {
        types.push(parsed['@type']);
      }
    } catch (error) {
      console.error('Error parsing schema:', error);
    }
  });

  return types;
};

/**
 * Checks if a schema type is eligible for rich results in Google Search
 * @param schemaType The schema.org type to check
 * @returns Whether the schema type can generate rich results
 */
export const isEligibleForRichResults = (schemaType: string): boolean => {
  return schemaType in richResultsFeatures;
};

/**
 * Retrieves the Google documentation link for a schema type
 * @param schemaType The schema.org type to get documentation for
 * @returns The Google documentation URL for the schema type, or undefined if not supported
 */
export const getDocumentationForSchemaType = (schemaType: string): string | undefined => {
  return richResultsFeatures[schemaType as keyof typeof richResultsFeatures];
};
