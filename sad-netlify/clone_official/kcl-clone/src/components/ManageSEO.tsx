import type React from 'react';
import { useState } from 'react';
import SchemaDebugger from './SchemaDebugger';
import SEOAuditReport from './SEOAuditReport';

// Default SEO settings
const defaultSeoSettings = {
  general: {
    siteTitle: 'Sales Aholics Deals',
    siteDescription: 'Discover the best coupons, promo codes, and deals on your favorite products. Save money and shop smarter with Sales Aholics Deals.',
    separator: '|',
    titleFormat: 'page | site',
  },
  social: {
    ogImage: 'https://salesaholicsdeals.com/og-image.jpg',
    twitterHandle: '@salesaholics',
    facebookPage: 'salesaholicsdeals',
    linkedinProfile: 'sales-aholics-deals',
  },
  verification: {
    googleVerification: '',
    bingVerification: '',
    pinterestVerification: '',
    yandexVerification: '',
  },
  advanced: {
    canonicalUrl: 'https://salesaholicsdeals.com',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /private/\n\nSitemap: https://salesaholicsdeals.com/sitemap.xml',
    sitemapUrl: 'https://salesaholicsdeals.com/sitemap.xml',
    structuredData: true,
  },
  analytics: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
  },
};

const ManageSEO: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState(defaultSeoSettings);
  const [activeSection, setActiveSection] = useState('general');
  const [previewUrl, setPreviewUrl] = useState('https://salesaholicsdeals.com/deals/online');
  const [saved, setSaved] = useState(false);

  // Handle general settings change
  const handleGeneralChange = (key: string, value: string) => {
    setSeoSettings({
      ...seoSettings,
      general: {
        ...seoSettings.general,
        [key]: value,
      },
    });
    setSaved(false);
  };

  // Handle social settings change
  const handleSocialChange = (key: string, value: string) => {
    setSeoSettings({
      ...seoSettings,
      social: {
        ...seoSettings.social,
        [key]: value,
      },
    });
    setSaved(false);
  };

  // Handle verification settings change
  const handleVerificationChange = (key: string, value: string) => {
    setSeoSettings({
      ...seoSettings,
      verification: {
        ...seoSettings.verification,
        [key]: value,
      },
    });
    setSaved(false);
  };

  // Handle advanced settings change
  const handleAdvancedChange = (key: string, value: any) => {
    setSeoSettings({
      ...seoSettings,
      advanced: {
        ...seoSettings.advanced,
        [key]: value,
      },
    });
    setSaved(false);
  };

  // Handle analytics settings change
  const handleAnalyticsChange = (key: string, value: string) => {
    setSeoSettings({
      ...seoSettings,
      analytics: {
        ...seoSettings.analytics,
        [key]: value,
      },
    });
    setSaved(false);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // Here you would save settings to backend or localStorage
    console.log('Saving SEO settings:', seoSettings);

    // For demo purposes, just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Generate SEO meta tag preview
  const generateMetaTagPreview = () => {
    const pageTitle = 'Online Deals';
    const pageDescription = 'The best online deals from your favorite retailers. Shop these offers from the comfort of your home!';

    let formattedTitle = '';
    if (seoSettings.general.titleFormat === 'page | site') {
      formattedTitle = `${pageTitle} ${seoSettings.general.separator} ${seoSettings.general.siteTitle}`;
    } else {
      formattedTitle = `${seoSettings.general.siteTitle} ${seoSettings.general.separator} ${pageTitle}`;
    }

    return `
<title>${formattedTitle}</title>
<meta name="description" content="${pageDescription}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${previewUrl}" />
<meta property="og:title" content="${formattedTitle}" />
<meta property="og:description" content="${pageDescription}" />
<meta property="og:image" content="${seoSettings.social.ogImage}" />
<meta property="og:site_name" content="${seoSettings.general.siteTitle}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${seoSettings.social.twitterHandle}" />
<meta name="twitter:title" content="${formattedTitle}" />
<meta name="twitter:description" content="${pageDescription}" />
<meta name="twitter:image" content="${seoSettings.social.ogImage}" />

<!-- Canonical URL -->
<link rel="canonical" href="${seoSettings.advanced.canonicalUrl}${previewUrl.replace('https://salesaholicsdeals.com', '')}" />

<!-- Site Verification -->
${seoSettings.verification.googleVerification ? `<meta name="google-site-verification" content="${seoSettings.verification.googleVerification}" />` : ''}
${seoSettings.verification.bingVerification ? `<meta name="msvalidate.01" content="${seoSettings.verification.bingVerification}" />` : ''}
${seoSettings.verification.pinterestVerification ? `<meta name="p:domain_verify" content="${seoSettings.verification.pinterestVerification}" />` : ''}
${seoSettings.verification.yandexVerification ? `<meta name="yandex-verification" content="${seoSettings.verification.yandexVerification}" />` : ''}

<!-- Analytics -->
${seoSettings.analytics.googleAnalyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${seoSettings.analytics.googleAnalyticsId}"></script>` : ''}
${seoSettings.analytics.facebookPixelId ? `<script>
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${seoSettings.analytics.facebookPixelId}');
  fbq('track', 'PageView');
</script>` : ''}
`;
  };

  return (
    <div className="seo-settings">
      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          SEO settings saved successfully!
        </div>
      )}

      <div className="mb-6 flex flex-wrap border border-gray-200 rounded-lg overflow-hidden">
        <button
          className={`py-3 px-4 ${
            activeSection === 'general' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('general')}
        >
          General
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'social' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('social')}
        >
          Social
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'verification' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('verification')}
        >
          Verification
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'advanced' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('advanced')}
        >
          Advanced
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'analytics' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('analytics')}
        >
          Analytics
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'schema' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('schema')}
        >
          Schema Debug
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'auto-schema' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('auto-schema')}
        >
          Auto Schema
        </button>
        <button
          className={`py-3 px-4 ${
            activeSection === 'audit' ? 'bg-blue-50 text-blue-700' : 'bg-white'
          }`}
          onClick={() => setActiveSection('audit')}
        >
          SEO Audit
        </button>
      </div>

      {activeSection === 'general' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">General SEO Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure the basic SEO settings for your site, including titles and descriptions.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Site Title</label>
              <input
                type="text"
                value={seoSettings.general.siteTitle}
                onChange={(e) => handleGeneralChange('siteTitle', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Your Site Name"
              />
              <p className="mt-1 text-sm text-gray-500">
                The name of your website, used in title tags and meta data
              </p>
            </div>

            <div>
              <label className="block mb-2">Site Description</label>
              <textarea
                value={seoSettings.general.siteDescription}
                onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
                placeholder="Brief description of your website"
              />
              <p className="mt-1 text-sm text-gray-500">
                A short description of your site (150-160 characters recommended)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Title Separator</label>
                <select
                  value={seoSettings.general.separator}
                  onChange={(e) => handleGeneralChange('separator', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="|">| (Vertical Bar)</option>
                  <option value="-">- (Hyphen)</option>
                  <option value="•">• (Bullet)</option>
                  <option value="~">~ (Tilde)</option>
                  <option value="»">» (Double Angle Quote)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Character used to separate parts of the title tag
                </p>
              </div>

              <div>
                <label className="block mb-2">Title Format</label>
                <select
                  value={seoSettings.general.titleFormat}
                  onChange={(e) => handleGeneralChange('titleFormat', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="page | site">Page Title | Site Name</option>
                  <option value="site | page">Site Name | Page Title</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  How to order your page titles and site name
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'social' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Social Media Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure how your content appears when shared on social media platforms.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Default Open Graph Image URL</label>
              <input
                type="text"
                value={seoSettings.social.ogImage}
                onChange={(e) => handleSocialChange('ogImage', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Image used when your content is shared on Facebook, Twitter, etc. (Recommended size: 1200 x 630 pixels)
              </p>
            </div>

            <div>
              <label className="block mb-2">Twitter Handle</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  @
                </span>
                <input
                  type="text"
                  value={seoSettings.social.twitterHandle.replace('@', '')}
                  onChange={(e) => handleSocialChange('twitterHandle', `@${e.target.value}`)}
                  className="flex-1 p-2 border border-gray-300 rounded-r"
                  placeholder="yourtwitterhandle"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your Twitter username (without the @)
              </p>
            </div>

            <div>
              <label className="block mb-2">Facebook Page</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  facebook.com/
                </span>
                <input
                  type="text"
                  value={seoSettings.social.facebookPage}
                  onChange={(e) => handleSocialChange('facebookPage', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-r"
                  placeholder="yourfacebookpage"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your Facebook page name
              </p>
            </div>

            <div>
              <label className="block mb-2">LinkedIn Profile</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  linkedin.com/company/
                </span>
                <input
                  type="text"
                  value={seoSettings.social.linkedinProfile}
                  onChange={(e) => handleSocialChange('linkedinProfile', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-r"
                  placeholder="your-company-name"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Your LinkedIn company profile name
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'verification' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Site Verification</h3>
          <p className="text-sm text-gray-600 mb-6">
            Add verification codes to confirm your site ownership with search engines and tools.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Google Search Console Verification</label>
              <input
                type="text"
                value={seoSettings.verification.googleVerification}
                onChange={(e) => handleVerificationChange('googleVerification', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Google verification code"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the verification code provided by Google Search Console
              </p>
            </div>

            <div>
              <label className="block mb-2">Bing Webmaster Tools Verification</label>
              <input
                type="text"
                value={seoSettings.verification.bingVerification}
                onChange={(e) => handleVerificationChange('bingVerification', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Bing verification code"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the verification code provided by Bing Webmaster Tools
              </p>
            </div>

            <div>
              <label className="block mb-2">Pinterest Verification</label>
              <input
                type="text"
                value={seoSettings.verification.pinterestVerification}
                onChange={(e) => handleVerificationChange('pinterestVerification', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Pinterest verification code"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the verification code provided by Pinterest
              </p>
            </div>

            <div>
              <label className="block mb-2">Yandex Webmaster Verification</label>
              <input
                type="text"
                value={seoSettings.verification.yandexVerification}
                onChange={(e) => handleVerificationChange('yandexVerification', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Yandex verification code"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the verification code provided by Yandex Webmaster
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'advanced' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Advanced SEO Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure technical SEO settings like canonical URLs, robots.txt, and more.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Canonical URL</label>
              <input
                type="text"
                value={seoSettings.advanced.canonicalUrl}
                onChange={(e) => handleAdvancedChange('canonicalUrl', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://example.com"
              />
              <p className="mt-1 text-sm text-gray-500">
                The primary domain to use for canonical URLs (include https:// and no trailing slash)
              </p>
            </div>

            <div>
              <label className="block mb-2">Robots.txt Content</label>
              <textarea
                value={seoSettings.advanced.robotsTxt}
                onChange={(e) => handleAdvancedChange('robotsTxt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                rows={8}
                placeholder="User-agent: *\nAllow: /\nDisallow: /admin/"
              />
              <p className="mt-1 text-sm text-gray-500">
                Instructions for search engine crawlers
              </p>
            </div>

            <div>
              <label className="block mb-2">Sitemap URL</label>
              <input
                type="text"
                value={seoSettings.advanced.sitemapUrl}
                onChange={(e) => handleAdvancedChange('sitemapUrl', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://example.com/sitemap.xml"
              />
              <p className="mt-1 text-sm text-gray-500">
                The URL to your sitemap file
              </p>
            </div>

            <div>
              <label className="block mb-2">Enable JSON-LD Structured Data</label>
              <div className="flex items-center mt-2">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    name="structuredData"
                    checked={seoSettings.advanced.structuredData}
                    onChange={() => handleAdvancedChange('structuredData', true)}
                    className="mr-1"
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="structuredData"
                    checked={!seoSettings.advanced.structuredData}
                    onChange={() => handleAdvancedChange('structuredData', false)}
                    className="mr-1"
                  />
                  <span>No</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Enable Schema.org structured data for better search engine understanding
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'analytics' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Analytics Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure analytics and tracking tools for your site.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={seoSettings.analytics.googleAnalyticsId}
                onChange={(e) => handleAnalyticsChange('googleAnalyticsId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Google Analytics measurement ID (starts with G- for GA4 or UA- for Universal Analytics)
              </p>
            </div>

            <div>
              <label className="block mb-2">Facebook Pixel ID</label>
              <input
                type="text"
                value={seoSettings.analytics.facebookPixelId}
                onChange={(e) => handleAnalyticsChange('facebookPixelId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="XXXXXXXXXXXXXXXX"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Facebook Pixel ID for conversion tracking
              </p>
            </div>

            <div>
              <label className="block mb-2">Hotjar ID</label>
              <input
                type="text"
                value={seoSettings.analytics.hotjarId}
                onChange={(e) => handleAnalyticsChange('hotjarId', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="XXXXXXX"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your Hotjar Site ID for heatmaps and recordings
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schema Debugger */}
      {activeSection === 'schema' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Schema.org Structured Data Debugger</h3>
          <p className="text-sm text-gray-600 mb-6">
            Debug and validate your structured data for improved SEO and rich results in search engines.
          </p>

          <SchemaDebugger allowAutoGeneration={false} />
        </div>
      )}

      {/* Auto Schema Generator */}
      {activeSection === 'auto-schema' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Automated Schema.org Generator</h3>
          <p className="text-sm text-gray-600 mb-6">
            Automatically generate and apply structured data based on your page content.
            Our intelligent algorithm detects page type and creates appropriate schema markup.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Auto-generated schemas are meant as a starting point. Review and customize them for best results.
                </p>
              </div>
            </div>
          </div>

          <SchemaDebugger allowAutoGeneration={true} />

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold mb-4">Supported Schema Types</h4>
            <p className="text-sm text-gray-600 mb-4">
              Our auto-detection system can identify and generate the following schema types:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <h5 className="font-medium">Product</h5>
                <p className="text-xs text-gray-600">For e-commerce and product pages</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">Article / BlogPosting</h5>
                <p className="text-xs text-gray-600">For news, blogs, and editorial content</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">FAQPage</h5>
                <p className="text-xs text-gray-600">For FAQ sections and pages</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">Event</h5>
                <p className="text-xs text-gray-600">For events, webinars, and conferences</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">Recipe</h5>
                <p className="text-xs text-gray-600">For food recipes and cooking instructions</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">JobPosting</h5>
                <p className="text-xs text-gray-600">For job listings and career pages</p>
              </div>

              <div className="border rounded p-3">
                <h5 className="font-medium">WebSite</h5>
                <p className="text-xs text-gray-600">Default for general pages</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Audit Report */}
      {activeSection === 'audit' && (
        <div className="settings-section">
          <h3 className="text-lg font-semibold mb-4">Comprehensive SEO Audit</h3>
          <p className="text-sm text-gray-600 mb-6">
            Run a thorough SEO audit to identify issues and opportunities for improvement.
          </p>

          <SEOAuditReport onlyShowIssues={false} />
        </div>
      )}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Meta Tag Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          Preview how your meta tags will appear for:
          <input
            type="text"
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            className="ml-2 p-1 border border-gray-300 rounded text-sm"
            style={{ width: '350px' }}
          />
        </p>
        <div className="bg-white p-4 border border-gray-200 rounded-lg overflow-auto">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">{generateMetaTagPreview()}</pre>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save SEO Settings
        </button>
      </div>
    </div>
  );
};

export default ManageSEO;
