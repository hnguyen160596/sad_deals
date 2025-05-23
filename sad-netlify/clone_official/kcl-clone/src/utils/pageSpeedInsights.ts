/**
 * PageSpeed Insights Integration
 *
 * This utility provides functions for working with Google PageSpeed Insights API
 * to monitor Core Web Vitals and structured data validation
 */

/**
 * Interface for PageSpeed Insights API response
 */
interface PageSpeedApiResponse {
  id: string;
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      [key: string]: {
        id: string;
        title: string;
        description: string;
        score: number | null;
        displayValue?: string;
        details?: any;
      };
    };
  };
  loadingExperience: {
    metrics: {
      CUMULATIVE_LAYOUT_SHIFT_SCORE: {
        percentile: number;
        category: string;
      };
      FIRST_CONTENTFUL_PAINT_MS: {
        percentile: number;
        category: string;
      };
      FIRST_INPUT_DELAY_MS: {
        percentile: number;
        category: string;
      };
      LARGEST_CONTENTFUL_PAINT_MS: {
        percentile: number;
        category: string;
      };
    };
    overall_category: string;
  };
  originLoadingExperience: {
    metrics: {
      CUMULATIVE_LAYOUT_SHIFT_SCORE: {
        percentile: number;
        category: string;
      };
      FIRST_CONTENTFUL_PAINT_MS: {
        percentile: number;
        category: string;
      };
      FIRST_INPUT_DELAY_MS: {
        percentile: number;
        category: string;
      };
      LARGEST_CONTENTFUL_PAINT_MS: {
        percentile: number;
        category: string;
      };
    };
    overall_category: string;
  };
}

/**
 * Interface for simplified Core Web Vitals results
 */
interface CoreWebVitalsResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcp: number;
  fid: number;
  cls: number;
  lcpCategory: string;
  fidCategory: string;
  clsCategory: string;
  overallCategory: string;
  audits: {
    structuredData: {
      score: number | null;
      details: any;
      issues: string[];
    };
    seoResults: {
      score: number | null;
      details: any;
      issues: string[];
    };
  };
}

/**
 * Run a PageSpeed Insights test for a URL
 * @param url URL to test with PageSpeed Insights
 * @param apiKey Google API key (optional)
 * @param strategy 'mobile' or 'desktop'
 * @param category Categories to audit ('performance', 'accessibility', 'best-practices', 'seo', 'pwa')
 * @returns Promise with PageSpeed Insights results
 */
export const runPageSpeedTest = async (
  url: string,
  apiKey?: string,
  strategy: 'mobile' | 'desktop' = 'mobile',
  category: string[] = ['performance', 'accessibility', 'best-practices', 'seo']
): Promise<PageSpeedApiResponse> => {
  const categoryParam = category.join(',');
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=${categoryParam}${apiKey ? `&key=${apiKey}` : ''}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running PageSpeed test:', error);
    throw error;
  }
};

/**
 * Extract Core Web Vitals and structured data results from PageSpeed API response
 * @param response PageSpeed API response
 * @returns Simplified Core Web Vitals and structured data results
 */
export const extractCoreWebVitalsAndStructuredData = (
  response: PageSpeedApiResponse
): CoreWebVitalsResult => {
  const { lighthouseResult, loadingExperience } = response;

  // Extract structured data audit results
  const structuredDataAudit = lighthouseResult.audits['structured-data'] || {
    score: null,
    details: null
  };

  // Extract SEO audits related to structured data
  const relevantSeoAudits = [
    'meta-description',
    'document-title',
    'canonical',
    'hreflang',
    'robots-txt',
    'image-alt'
  ];

  const seoIssues: string[] = [];
  relevantSeoAudits.forEach(auditId => {
    const audit = lighthouseResult.audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      seoIssues.push(`${audit.title}: ${audit.description}`);
    }
  });

  // Extract structured data issues
  const structuredDataIssues: string[] = [];
  if (structuredDataAudit.details && structuredDataAudit.details.items) {
    structuredDataAudit.details.items.forEach((item: any) => {
      if (item.status === 'ERROR' || item.status === 'WARNING') {
        structuredDataIssues.push(item.message || 'Unknown structured data issue');
      }
    });
  }

  // Extract Core Web Vitals metrics
  return {
    // Lighthouse scores (0-1)
    performance: lighthouseResult.categories.performance.score,
    accessibility: lighthouseResult.categories.accessibility.score,
    bestPractices: lighthouseResult.categories['best-practices'].score,
    seo: lighthouseResult.categories.seo.score,

    // Field data (real user metrics)
    lcp: loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile || 0,
    fid: loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.percentile || 0,
    cls: loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || 0,

    // Category ratings
    lcpCategory: loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.category || 'UNKNOWN',
    fidCategory: loadingExperience?.metrics?.FIRST_INPUT_DELAY_MS?.category || 'UNKNOWN',
    clsCategory: loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category || 'UNKNOWN',
    overallCategory: loadingExperience?.overall_category || 'UNKNOWN',

    // Structured data and SEO audits
    audits: {
      structuredData: {
        score: structuredDataAudit.score,
        details: structuredDataAudit.details,
        issues: structuredDataIssues
      },
      seoResults: {
        score: lighthouseResult.categories.seo.score,
        details: null,
        issues: seoIssues
      }
    }
  };
};

/**
 * Test a URL's structured data with PageSpeed Insights API
 * @param url URL to test
 * @param apiKey Google API key (optional)
 * @returns Promise with structured data validation results
 */
export const testStructuredData = async (
  url: string,
  apiKey?: string
): Promise<{
  valid: boolean;
  score: number | null;
  issues: string[];
  url: string;
}> => {
  try {
    const response = await runPageSpeedTest(url, apiKey, 'mobile', ['seo']);
    const results = extractCoreWebVitalsAndStructuredData(response);

    return {
      valid: results.audits.structuredData.issues.length === 0,
      score: results.audits.structuredData.score,
      issues: results.audits.structuredData.issues,
      url
    };
  } catch (error) {
    console.error('Error testing structured data:', error);
    return {
      valid: false,
      score: null,
      issues: [`Error testing URL: ${error instanceof Error ? error.message : String(error)}`],
      url
    };
  }
};

/**
 * Creates a visual UI indicator based on a score
 * @param score Value between 0-1
 * @returns String with color indicator
 */
export const getScoreIndicator = (score: number | null): string => {
  if (score === null) return '⚪ Unknown';
  if (score >= 0.9) return '🟢 Good';
  if (score >= 0.5) return '🟠 Needs Improvement';
  return '🔴 Poor';
};

/**
 * Get the PageSpeed Insights URL for a given page
 * @param url The URL to analyze with PageSpeed Insights
 * @returns The full PageSpeed Insights analysis URL
 */
export const getPageSpeedInsightsUrl = (url: string): string => {
  return `https://pagespeed.web.dev/report?url=${encodeURIComponent(url)}`;
};

/**
 * Get the Google Rich Results Test URL for a given page
 * @param url The URL to test for rich results
 * @returns The full Google Rich Results Test URL
 */
export const getRichResultsTestUrl = (url: string): string => {
  return `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
};

/**
 * Create a serverless function API endpoint for this utility
 * Can be used as a reference when implementing in Netlify functions
 */
export const createPageSpeedEndpoint = async (
  url: string | null,
  apiKey: string | null
): Promise<{
  statusCode: number;
  body: string;
}> => {
  try {
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL parameter is required' })
      };
    }

    const results = await runPageSpeedTest(
      url,
      apiKey || undefined,
      'mobile',
      ['performance', 'accessibility', 'best-practices', 'seo']
    );

    const simplifiedResults = extractCoreWebVitalsAndStructuredData(results);

    return {
      statusCode: 200,
      body: JSON.stringify(simplifiedResults)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Error running PageSpeed analysis',
        message: error instanceof Error ? error.message : String(error)
      })
    };
  }
};
