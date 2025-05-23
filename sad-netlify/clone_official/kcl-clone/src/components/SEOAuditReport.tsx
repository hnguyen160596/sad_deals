import React, { useState, useEffect } from 'react';
import { validateAllSchemas } from '../utils/schemaValidator';

interface SEOAuditItem {
  id: string;
  category: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'not-applicable';
  recommendations?: string[];
  impact?: 'high' | 'medium' | 'low';
}

interface SEOAuditProps {
  url?: string;
  onlyShowIssues?: boolean;
  className?: string;
}

/**
 * Component for performing comprehensive SEO audits
 * Checks technical SEO elements, structured data, meta tags, and more
 */
const SEOAuditReport: React.FC<SEOAuditProps> = ({
  url = window.location.href,
  onlyShowIssues = false,
  className = '',
}) => {
  const [auditResults, setAuditResults] = useState<SEOAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredResults, setFilteredResults] = useState<SEOAuditItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [overallScore, setOverallScore] = useState<number>(0);
  const [auditSummary, setAuditSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  }>({ total: 0, passed: 0, failed: 0, warnings: 0 });

  // Run audit on component mount
  useEffect(() => {
    const runAudit = async () => {
      setIsLoading(true);
      try {
        // Collect audit data
        const results: SEOAuditItem[] = [];

        // Check meta tags
        await checkMetaTags(results);

        // Check structured data
        await checkStructuredData(results);

        // Check heading structure
        await checkHeadingStructure(results);

        // Check images
        await checkImages(results);

        // Check links
        await checkLinks(results);

        // Check performance elements
        await checkPerformance(results);

        // Check mobile friendliness
        await checkMobileFriendliness(results);

        // Calculate overall score
        const score = calculateScore(results);
        setOverallScore(score);

        // Calculate summary
        const summary = {
          total: results.length,
          passed: results.filter(item => item.status === 'passed').length,
          failed: results.filter(item => item.status === 'failed').length,
          warnings: results.filter(item => item.status === 'warning').length,
        };
        setAuditSummary(summary);

        // Update state
        setAuditResults(results);
        applyFilters(results, filterCategory, filterStatus, onlyShowIssues);
      } catch (error) {
        console.error('Error running SEO audit:', error);
      } finally {
        setIsLoading(false);
      }
    };

    runAudit();
  }, [url, onlyShowIssues]);

  // Apply filters when filter options change
  useEffect(() => {
    applyFilters(auditResults, filterCategory, filterStatus, onlyShowIssues);
  }, [auditResults, filterCategory, filterStatus, onlyShowIssues]);

  // Filter results based on category and status
  const applyFilters = (
    results: SEOAuditItem[],
    category: string,
    status: string,
    onlyIssues: boolean
  ) => {
    let filtered = [...results];

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }

    // Only show issues if specified
    if (onlyIssues) {
      filtered = filtered.filter(item => item.status === 'failed' || item.status === 'warning');
    }

    setFilteredResults(filtered);
  };

  // Calculate overall score (0-100)
  const calculateScore = (results: SEOAuditItem[]): number => {
    if (results.length === 0) return 0;

    const weights = {
      critical: 3,
      warning: 2,
      info: 1,
      success: 0
    };

    const statuses = {
      passed: 1,
      warning: 0.5,
      failed: 0,
      'not-applicable': 1
    };

    let totalWeight = 0;
    let totalScore = 0;

    results.forEach(item => {
      const weight = weights[item.category];
      const statusScore = statuses[item.status];

      totalWeight += weight;
      totalScore += weight * statusScore;
    });

    return Math.round((totalScore / totalWeight) * 100);
  };

  // Check meta tags
  const checkMetaTags = async (results: SEOAuditItem[]): Promise<void> => {
    const metaTags = document.querySelectorAll('meta');
    const title = document.querySelector('title');

    // Check title tag
    results.push({
      id: 'title-tag',
      category: 'critical',
      title: 'Title Tag',
      description: 'Every page should have a unique, descriptive title tag.',
      status: title ? 'passed' : 'failed',
      recommendations: !title ? ['Add a descriptive title tag to your page'] : [],
      impact: 'high'
    });

    if (title) {
      const titleText = title.textContent || '';
      results.push({
        id: 'title-length',
        category: 'warning',
        title: 'Title Length',
        description: 'Title tag should be between 50-60 characters for optimal display in search results.',
        status: titleText.length >= 50 && titleText.length <= 60 ? 'passed' : 'warning',
        recommendations: titleText.length < 50 ? ['Title is too short. Add more descriptive content.'] :
                        titleText.length > 60 ? ['Title is too long and may be truncated in search results.'] : [],
        impact: 'medium'
      });
    }

    // Check meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    results.push({
      id: 'meta-description',
      category: 'critical',
      title: 'Meta Description',
      description: 'Every page should have a unique meta description that summarizes the content.',
      status: metaDescription ? 'passed' : 'failed',
      recommendations: !metaDescription ? ['Add a meta description tag to your page'] : [],
      impact: 'high'
    });

    if (metaDescription) {
      const descContent = metaDescription.getAttribute('content') || '';
      results.push({
        id: 'description-length',
        category: 'warning',
        title: 'Description Length',
        description: 'Meta description should be between 120-160 characters for optimal display in search results.',
        status: descContent.length >= 120 && descContent.length <= 160 ? 'passed' : 'warning',
        recommendations: descContent.length < 120 ? ['Description is too short. Add more descriptive content.'] :
                        descContent.length > 160 ? ['Description is too long and may be truncated in search results.'] : [],
        impact: 'medium'
      });
    }

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    results.push({
      id: 'canonical-url',
      category: 'critical',
      title: 'Canonical URL',
      description: 'Every page should have a canonical URL to prevent duplicate content issues.',
      status: canonical ? 'passed' : 'failed',
      recommendations: !canonical ? ['Add a canonical URL tag to your page'] : [],
      impact: 'high'
    });

    // Check viewport meta tag for mobile responsiveness
    const viewport = document.querySelector('meta[name="viewport"]');
    results.push({
      id: 'viewport-meta',
      category: 'critical',
      title: 'Viewport Meta Tag',
      description: 'Pages should include a viewport meta tag for proper mobile rendering.',
      status: viewport ? 'passed' : 'failed',
      recommendations: !viewport ? ['Add a viewport meta tag for mobile optimization'] : [],
      impact: 'high'
    });
  };

  // Check structured data
  const checkStructuredData = async (results: SEOAuditItem[]): Promise<void> => {
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');

    // Check if any structured data exists
    results.push({
      id: 'structured-data-exists',
      category: 'critical',
      title: 'Structured Data Implementation',
      description: 'Pages should include structured data to enhance search result appearance.',
      status: schemas.length > 0 ? 'passed' : 'failed',
      recommendations: schemas.length === 0 ? ['Add relevant structured data to your page'] : [],
      impact: 'high'
    });

    // Validate structured data if it exists
    if (schemas.length > 0) {
      try {
        const validationResults = validateAllSchemas();
        results.push({
          id: 'structured-data-valid',
          category: 'critical',
          title: 'Structured Data Validation',
          description: 'All structured data should be valid according to schema.org standards.',
          status: validationResults.valid ? 'passed' : 'failed',
          recommendations: !validationResults.valid ? validationResults.schemaResults
            .filter(result => !result.valid)
            .flatMap(result => result.errors.map(err => `Fix ${result.type}: ${err}`)) : [],
          impact: 'high'
        });
      } catch (error) {
        console.error('Error validating structured data:', error);
      }
    }
  };

  // Check heading structure
  const checkHeadingStructure = async (results: SEOAuditItem[]): Promise<void> => {
    const h1Tags = document.querySelectorAll('h1');
    const h2Tags = document.querySelectorAll('h2');

    // Check if page has an H1 tag
    results.push({
      id: 'h1-exists',
      category: 'critical',
      title: 'H1 Heading',
      description: 'Every page should have exactly one H1 heading that describes the page content.',
      status: h1Tags.length === 1 ? 'passed' : h1Tags.length === 0 ? 'failed' : 'warning',
      recommendations: h1Tags.length === 0 ? ['Add an H1 heading to your page'] :
                      h1Tags.length > 1 ? ['Use only one H1 heading per page'] : [],
      impact: 'high'
    });

    // Check heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let hierarchyValid = true;
    let lastLevel = 0;

    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        hierarchyValid = false;
        break;
      }
      lastLevel = level;
    }

    results.push({
      id: 'heading-hierarchy',
      category: 'warning',
      title: 'Heading Hierarchy',
      description: 'Headings should follow a logical hierarchy (H1 → H2 → H3, etc.) without skipping levels.',
      status: hierarchyValid ? 'passed' : 'warning',
      recommendations: !hierarchyValid ? ['Ensure heading levels follow a logical hierarchy without skipping levels'] : [],
      impact: 'medium'
    });
  };

  // Check images
  const checkImages = async (results: SEOAuditItem[]): Promise<void> => {
    const images = document.querySelectorAll('img');
    let missingAlt = 0;
    let missingLazy = 0;

    images.forEach(img => {
      if (!img.hasAttribute('alt')) missingAlt++;
      if (!img.hasAttribute('loading')) missingLazy++;
    });

    // Check alt text
    results.push({
      id: 'img-alt-text',
      category: 'critical',
      title: 'Image Alt Text',
      description: 'All images should have descriptive alt text for accessibility and SEO.',
      status: missingAlt === 0 ? 'passed' : missingAlt < images.length / 2 ? 'warning' : 'failed',
      recommendations: missingAlt > 0 ? [`Add alt text to ${missingAlt} image(s)`] : [],
      impact: 'high'
    });

    // Check lazy loading
    results.push({
      id: 'img-lazy-loading',
      category: 'warning',
      title: 'Image Lazy Loading',
      description: 'Images should use lazy loading to improve page performance.',
      status: missingLazy === 0 ? 'passed' : missingLazy < images.length / 2 ? 'warning' : 'failed',
      recommendations: missingLazy > 0 ? [`Add loading="lazy" attribute to ${missingLazy} image(s)`] : [],
      impact: 'medium'
    });
  };

  // Check links
  const checkLinks = async (results: SEOAuditItem[]): Promise<void> => {
    const links = document.querySelectorAll('a');
    let emptyLinks = 0;
    let missingRel = 0;

    links.forEach(link => {
      if (!link.textContent?.trim()) emptyLinks++;
      if (link.getAttribute('target') === '_blank' && !link.getAttribute('rel')) missingRel++;
    });

    // Check link text
    results.push({
      id: 'link-text',
      category: 'warning',
      title: 'Link Text',
      description: 'All links should have descriptive text (avoid "click here" or empty links).',
      status: emptyLinks === 0 ? 'passed' : 'warning',
      recommendations: emptyLinks > 0 ? [`Add descriptive text to ${emptyLinks} link(s)`] : [],
      impact: 'medium'
    });

    // Check external links
    results.push({
      id: 'external-links-rel',
      category: 'info',
      title: 'External Link Attributes',
      description: 'External links opening in new tabs should have rel="noopener" or rel="noreferrer" for security.',
      status: missingRel === 0 ? 'passed' : 'warning',
      recommendations: missingRel > 0 ? [`Add rel="noopener" to ${missingRel} external link(s) that open in new tabs`] : [],
      impact: 'low'
    });
  };

  // Check performance elements
  const checkPerformance = async (results: SEOAuditItem[]): Promise<void> => {
    // Check for render-blocking resources
    const renderBlockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');

    results.push({
      id: 'css-optimization',
      category: 'warning',
      title: 'CSS Optimization',
      description: 'Critical CSS should be inlined, and non-critical CSS should be deferred.',
      status: renderBlockingStyles.length <= 2 ? 'passed' : 'warning',
      recommendations: renderBlockingStyles.length > 2 ? ['Consider inlining critical CSS and deferring non-critical styles'] : [],
      impact: 'medium'
    });

    // Check for image format optimization
    const images = document.querySelectorAll('img');
    const modernImageFormats = ['webp', 'avif'];
    let optimizedImages = 0;

    images.forEach(img => {
      const src = img.getAttribute('src') || '';
      const hasModernFormat = modernImageFormats.some(format => src.toLowerCase().endsWith(`.${format}`));
      if (hasModernFormat) optimizedImages++;
    });

    results.push({
      id: 'image-formats',
      category: 'warning',
      title: 'Modern Image Formats',
      description: 'Use modern image formats like WebP or AVIF for better compression and quality.',
      status: images.length === 0 ? 'not-applicable' :
              optimizedImages / images.length >= 0.5 ? 'passed' : 'warning',
      recommendations: images.length > 0 && optimizedImages / images.length < 0.5 ?
                      ['Convert images to WebP or AVIF format for better performance'] : [],
      impact: 'medium'
    });
  };

  // Check mobile friendliness
  const checkMobileFriendliness = async (results: SEOAuditItem[]): Promise<void> => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewport = viewport && viewport.getAttribute('content')?.includes('width=device-width');

    results.push({
      id: 'mobile-friendly',
      category: 'critical',
      title: 'Mobile Friendliness',
      description: 'Pages should be optimized for mobile devices with proper viewport settings.',
      status: hasViewport ? 'passed' : 'failed',
      recommendations: !hasViewport ? ['Add a proper viewport meta tag with width=device-width'] : [],
      impact: 'high'
    });

    // Check tap targets (links and buttons)
    const tapTargets = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
    let smallTapTargets = 0;

    tapTargets.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 48 || rect.height < 48) smallTapTargets++;
    });

    results.push({
      id: 'tap-targets',
      category: 'warning',
      title: 'Tap Target Size',
      description: 'Interactive elements should be at least 48x48px for mobile usability.',
      status: smallTapTargets === 0 ? 'passed' :
              smallTapTargets < tapTargets.length / 3 ? 'warning' : 'failed',
      recommendations: smallTapTargets > 0 ? [`Increase the size of ${smallTapTargets} interactive element(s) for better mobile usability`] : [],
      impact: 'medium'
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'critical':
        return 'border-red-300';
      case 'warning':
        return 'border-yellow-300';
      case 'info':
        return 'border-blue-300';
      case 'success':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Handle export to PDF
  const handleExport = () => {
    // This would be implemented with a PDF generation library
    alert('Export to PDF functionality would be implemented here');
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-xl font-bold">SEO Audit Report</h2>
        <p className="text-gray-600 mt-1">
          {url === window.location.href ? 'Current page' : url}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Running SEO audit...</span>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="p-6 bg-white">
            <div className="flex flex-wrap gap-6 items-center mb-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-sm text-gray-600 mt-1">Overall Score</div>
              </div>

              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      overallScore >= 90 ? 'bg-green-500' :
                      overallScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${overallScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{auditSummary.passed}</div>
                  <div className="text-xs text-gray-600">Passed</div>
                </div>
                <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{auditSummary.warnings}</div>
                  <div className="text-xs text-gray-600">Warnings</div>
                </div>
                <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{auditSummary.failed}</div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Export Report
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={onlyShowIssues}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  Show only issues
                </label>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No results found for the selected filters
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className={`border ${getCategoryColor(item.category)} rounded-lg p-4`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status === 'passed' ? 'Passed' :
                         item.status === 'failed' ? 'Failed' :
                         item.status === 'warning' ? 'Warning' : 'N/A'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{item.description}</p>

                    {item.impact && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500 mr-2">Impact:</span>
                        <span className={`text-sm font-medium ${
                          item.impact === 'high' ? 'text-red-600' :
                          item.impact === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}
                        </span>
                      </div>
                    )}

                    {item.recommendations && item.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {item.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SEOAuditReport;
