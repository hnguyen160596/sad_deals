import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// Define types for the API responses
interface PageSpeedInsightsScore {
  mobile: number;
  desktop: number;
}

interface CoreWebVitals {
  lcp: {
    score: number;
    value: number;
    status: 'good' | 'needs-improvement' | 'poor';
  };
  fid: {
    score: number;
    value: number;
    status: 'good' | 'needs-improvement' | 'poor';
  };
  cls: {
    score: number;
    value: number;
    status: 'good' | 'needs-improvement' | 'poor';
  };
}

interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    position: number;
  }>;
}

interface IntegrationStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastChecked: string;
  description: string;
}

interface SEOHealthItem {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'error';
  description: string;
  recommendation?: string;
}

// Mock data for demonstration - in a real app, this would come from API calls
const getMockSEOData = () => {
  return {
    pageSpeedScore: {
      mobile: 82,
      desktop: 95
    },
    coreWebVitals: {
      lcp: {
        score: 89,
        value: 2.1,
        status: 'good' as const
      },
      fid: {
        score: 95,
        value: 18,
        status: 'good' as const
      },
      cls: {
        score: 78,
        value: 0.12,
        status: 'needs-improvement' as const
      }
    },
    searchConsole: {
      clicks: 1248,
      impressions: 25679,
      ctr: 4.86,
      position: 18.4,
      topQueries: [
        {
          query: "best deals online",
          clicks: 142,
          impressions: 2560,
          position: 3.2
        },
        {
          query: "discount coupons",
          clicks: 98,
          impressions: 1845,
          position: 5.7
        },
        {
          query: "sales aholics",
          clicks: 76,
          impressions: 920,
          position: 1.3
        },
        {
          query: "promo codes for amazon",
          clicks: 59,
          impressions: 1325,
          position: 6.8
        },
        {
          query: "online deals today",
          clicks: 45,
          impressions: 1120,
          position: 9.2
        }
      ],
      topPages: [
        {
          page: "/deals/electronics",
          clicks: 210,
          impressions: 3450,
          position: 4.1
        },
        {
          page: "/stores/amazon",
          clicks: 175,
          impressions: 2980,
          position: 3.8
        },
        {
          page: "/",
          clicks: 150,
          impressions: 3210,
          position: 5.2
        },
        {
          page: "/blog/best-summer-deals",
          clicks: 95,
          impressions: 1860,
          position: 7.3
        },
        {
          page: "/deals/home-kitchen",
          clicks: 82,
          impressions: 1540,
          position: 8.5
        }
      ]
    },
    integrations: [
      {
        id: "search-console",
        name: "Google Search Console",
        status: "active",
        lastChecked: "2025-05-20T15:30:00Z",
        description: "Search Console integration is working properly"
      },
      {
        id: "analytics",
        name: "Google Analytics 4",
        status: "active",
        lastChecked: "2025-05-20T15:30:00Z",
        description: "Analytics integration is working properly"
      },
      {
        id: "tag-manager",
        name: "Google Tag Manager",
        status: "active",
        lastChecked: "2025-05-20T15:30:00Z",
        description: "Tag Manager integration is working properly"
      },
      {
        id: "merchant-center",
        name: "Google Merchant Center",
        status: "active",
        lastChecked: "2025-05-20T15:30:00Z",
        description: "Product feed is updating correctly"
      },
      {
        id: "business-profile",
        name: "Google Business Profile",
        status: "inactive",
        lastChecked: "2025-05-20T15:30:00Z",
        description: "Not connected"
      }
    ],
    seoHealth: [
      {
        id: "titles",
        name: "Page Titles",
        status: "good",
        description: "All page titles are optimized for SEO"
      },
      {
        id: "meta-desc",
        name: "Meta Descriptions",
        status: "warning",
        description: "8 pages missing meta descriptions",
        recommendation: "Add meta descriptions to improve click-through rates"
      },
      {
        id: "h1-tags",
        name: "H1 Tags",
        status: "good",
        description: "All pages have unique H1 tags"
      },
      {
        id: "images-alt",
        name: "Image Alt Text",
        status: "error",
        description: "32 images missing alt text",
        recommendation: "Add alt text to all images for better accessibility and SEO"
      },
      {
        id: "structured-data",
        name: "Structured Data",
        status: "good",
        description: "Structured data is properly implemented"
      },
      {
        id: "mobile-friendly",
        name: "Mobile Friendly",
        status: "good",
        description: "Site is fully responsive"
      },
      {
        id: "https",
        name: "HTTPS Security",
        status: "good",
        description: "Site is properly secured with HTTPS"
      },
      {
        id: "crawl-errors",
        name: "Crawl Errors",
        status: "warning",
        description: "12 404 errors found",
        recommendation: "Fix broken links or add redirects"
      }
    ]
  };
};

// Progress bar component
const ProgressBar: React.FC<{ percent: number; label: string; color: string }> = ({ percent, label, color }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = '';
  let label = '';

  switch (status) {
    case 'active':
    case 'good':
      classes = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      label = status === 'active' ? 'Active' : 'Good';
      break;
    case 'warning':
    case 'needs-improvement':
      classes = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      label = status === 'warning' ? 'Warning' : 'Needs Improvement';
      break;
    case 'error':
    case 'poor':
      classes = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      label = status === 'error' ? 'Error' : 'Poor';
      break;
    case 'inactive':
    case 'pending':
      classes = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      label = status === 'inactive' ? 'Inactive' : 'Pending';
      break;
    default:
      classes = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      label = status;
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
      {label}
    </span>
  );
};

const GoogleSEODashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [seoData, setSeoData] = useState<any>(getMockSEOData());
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'health' | 'integrations'>('overview');

  // Colors based on dark mode
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-500';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  // In a real app, this would fetch data from an API
  const fetchSEOData = async () => {
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSeoData(getMockSEOData());
    setLoading(false);
  };

  useEffect(() => {
    fetchSEOData();
  }, [timePeriod]);

  // Fake refresh data
  const handleRefresh = () => {
    fetchSEOData();
  };

  // Generate Core Web Vitals score
  const getOverallCWVScore = () => {
    const { lcp, fid, cls } = seoData.coreWebVitals;
    return Math.round((lcp.score + fid.score + cls.score) / 3);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PageSpeed Insights Score */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1`}>
              <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>PageSpeed Insights</h3>
              <div className="space-y-4">
                <ProgressBar
                  percent={seoData.pageSpeedScore.mobile}
                  label="Mobile Score"
                  color={seoData.pageSpeedScore.mobile >= 90 ? 'bg-green-600' : seoData.pageSpeedScore.mobile >= 70 ? 'bg-yellow-500' : 'bg-red-500'}
                />
                <ProgressBar
                  percent={seoData.pageSpeedScore.desktop}
                  label="Desktop Score"
                  color={seoData.pageSpeedScore.desktop >= 90 ? 'bg-green-600' : seoData.pageSpeedScore.desktop >= 70 ? 'bg-yellow-500' : 'bg-red-500'}
                />
              </div>
              <button
                className="mt-4 text-blue-600 hover:underline text-sm flex items-center dark:text-blue-400"
                onClick={() => window.open('https://pagespeed.web.dev/')}
              >
                Run test on PageSpeed Insights
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </button>
            </div>

            {/* Core Web Vitals */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1`}>
              <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Core Web Vitals</h3>
              <div className="flex justify-center mb-4">
                <div className="relative inline-flex justify-center items-center w-32 h-32">
                  <svg className="w-32 h-32" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={getOverallCWVScore() >= 90 ? '#10B981' : getOverallCWVScore() >= 70 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="3"
                      strokeDasharray={`${getOverallCWVScore()}, 100`}
                    />
                  </svg>
                  <div className="absolute text-2xl font-bold">{getOverallCWVScore()}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className={`text-sm ${subTextColor}`}>LCP</p>
                  <p className={`font-semibold ${textColor}`}>{seoData.coreWebVitals.lcp.value}s</p>
                  <StatusBadge status={seoData.coreWebVitals.lcp.status} />
                </div>
                <div>
                  <p className={`text-sm ${subTextColor}`}>FID</p>
                  <p className={`font-semibold ${textColor}`}>{seoData.coreWebVitals.fid.value}ms</p>
                  <StatusBadge status={seoData.coreWebVitals.fid.status} />
                </div>
                <div>
                  <p className={`text-sm ${subTextColor}`}>CLS</p>
                  <p className={`font-semibold ${textColor}`}>{seoData.coreWebVitals.cls.value}</p>
                  <StatusBadge status={seoData.coreWebVitals.cls.status} />
                </div>
              </div>
            </div>

            {/* Search Console Summary */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1`}>
              <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Search Console</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${subTextColor}`}>Clicks</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{seoData.searchConsole.clicks}</p>
                </div>
                <div>
                  <p className={`text-sm ${subTextColor}`}>Impressions</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{seoData.searchConsole.impressions}</p>
                </div>
                <div>
                  <p className={`text-sm ${subTextColor}`}>CTR</p>
                  <p className={`text-xl font-bold ${textColor}`}>{seoData.searchConsole.ctr}%</p>
                </div>
                <div>
                  <p className={`text-sm ${subTextColor}`}>Avg. Position</p>
                  <p className={`text-xl font-bold ${textColor}`}>{seoData.searchConsole.position}</p>
                </div>
              </div>
              <button
                className="mt-4 text-blue-600 hover:underline text-sm flex items-center dark:text-blue-400"
                onClick={() => window.open('https://search.google.com/search-console')}
              >
                View in Search Console
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </button>
            </div>

            {/* SEO Health Summary */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${textColor}`}>SEO Health</h3>
                <div className="flex space-x-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className={`text-xs ${subTextColor}`}>{seoData.seoHealth.filter(i => i.status === 'good').length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    <span className={`text-xs ${subTextColor}`}>{seoData.seoHealth.filter(i => i.status === 'warning').length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span className={`text-xs ${subTextColor}`}>{seoData.seoHealth.filter(i => i.status === 'error').length}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {seoData.seoHealth
                  .filter(item => item.status !== 'good')
                  .slice(0, 3)
                  .map((item: SEOHealthItem) => (
                    <div key={item.id} className={`border ${borderColor} p-3 rounded-md`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${textColor}`}>{item.name}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className={`text-sm mt-1 ${subTextColor}`}>{item.description}</p>
                    </div>
                  ))}
              </div>
              <button
                className="mt-4 text-blue-600 hover:underline text-sm flex items-center dark:text-blue-400"
                onClick={() => setActiveTab('health')}
              >
                View all issues
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>

            {/* Top Keywords */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1 md:col-span-2`}>
              <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Top Keywords</h3>
              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <thead>
                    <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                      <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">Keyword</th>
                      <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">Clicks</th>
                      <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">Impressions</th>
                      <th className="py-2 px-4 text-left text-xs font-medium uppercase tracking-wider">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoData.searchConsole.topQueries.map((query, index) => (
                      <tr key={index} className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                        <td className="py-2 px-4 text-sm">{query.query}</td>
                        <td className="py-2 px-4 text-sm">{query.clicks}</td>
                        <td className="py-2 px-4 text-sm">{query.impressions}</td>
                        <td className="py-2 px-4 text-sm">{query.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Integration Status */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1 md:col-span-3`}>
              <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>Google Integrations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {seoData.integrations.map((integration: IntegrationStatus) => (
                  <div key={integration.id} className={`border ${borderColor} p-4 rounded-md`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">
                        {integration.id === 'search-console' && (
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#4285F4">
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zm-10 3l-4-4 1.41-1.41L12 12.17l2.59-2.58L16 11l-4 4z"/>
                          </svg>
                        )}
                        {integration.id === 'analytics' && (
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#F9AB00">
                            <path d="M19.86 3H4.14A1.14 1.14 0 0 0 3 4.14v15.72A1.14 1.14 0 0 0 4.14 21h15.72A1.14 1.14 0 0 0 21 19.86V4.14A1.14 1.14 0 0 0 19.86 3zM8 17H6V9h2v8zm5 0h-2V7h2v10zm5 0h-2v-6h2v6z"/>
                          </svg>
                        )}
                        {integration.id === 'tag-manager' && (
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#1A73E8">
                            <path d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H5V4h14v14z"/>
                            <path d="M7 9h10v2H7zm0 3h7v2H7z"/>
                          </svg>
                        )}
                        {integration.id === 'merchant-center' && (
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#EA4335">
                            <path d="M16 6V4h-2v2h-4V4H8v2H6v12h12V6h-2zm0 10H8V8h8v8z"/>
                            <path d="M10 10h4v4h-4z"/>
                          </svg>
                        )}
                        {integration.id === 'business-profile' && (
                          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="#34A853">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        )}
                      </div>
                      <h4 className={`text-sm font-medium ${textColor}`}>{integration.name}</h4>
                      <StatusBadge status={integration.status} />
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 text-blue-600 hover:underline text-sm flex items-center dark:text-blue-400"
                onClick={() => setActiveTab('integrations')}
              >
                Manage integrations
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PageSpeed Insights Detailed */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-6 ${textColor}`}>PageSpeed Insights Detailed</h3>

              <div className="mb-6">
                <h4 className={`font-medium mb-2 ${textColor}`}>Mobile Score</h4>
                <div className="flex items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={seoData.pageSpeedScore.mobile >= 90 ? '#10B981' : seoData.pageSpeedScore.mobile >= 70 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="3"
                        strokeDasharray={`${seoData.pageSpeedScore.mobile}, 100`}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                      {seoData.pageSpeedScore.mobile}
                    </div>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className={`text-sm ${subTextColor}`}>First Contentful Paint</p>
                      <p className={`font-medium ${textColor}`}>1.8s</p>
                    </div>
                    <div>
                      <p className={`text-sm ${subTextColor}`}>Time to Interactive</p>
                      <p className={`font-medium ${textColor}`}>3.2s</p>
                    </div>
                    <div>
                      <p className={`text-sm ${subTextColor}`}>Speed Index</p>
                      <p className={`font-medium ${textColor}`}>2.4s</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className={`font-medium mb-2 ${textColor}`}>Desktop Score</h4>
                <div className="flex items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={seoData.pageSpeedScore.desktop >= 90 ? '#10B981' : seoData.pageSpeedScore.desktop >= 70 ? '#F59E0B' : '#EF4444'}
                        strokeWidth="3"
                        strokeDasharray={`${seoData.pageSpeedScore.desktop}, 100`}
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                      {seoData.pageSpeedScore.desktop}
                    </div>
                  </div>
                  <div className="ml-4 space-y-2">
                    <div>
                      <p className={`text-sm ${subTextColor}`}>First Contentful Paint</p>
                      <p className={`font-medium ${textColor}`}>0.8s</p>
                    </div>
                    <div>
                      <p className={`text-sm ${subTextColor}`}>Time to Interactive</p>
                      <p className={`font-medium ${textColor}`}>1.5s</p>
                    </div>
                    <div>
                      <p className={`text-sm ${subTextColor}`}>Speed Index</p>
                      <p className={`font-medium ${textColor}`}>1.2s</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="mt-6 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 flex justify-center items-center"
                onClick={() => window.open('https://pagespeed.web.dev/')}
              >
                Run New Test
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>

            {/* Core Web Vitals Detailed */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-6 ${textColor}`}>Core Web Vitals Detailed</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-medium ${textColor}`}>Largest Contentful Paint (LCP)</h4>
                    <StatusBadge status={seoData.coreWebVitals.lcp.status} />
                  </div>
                  <p className={`text-sm mb-2 ${subTextColor}`}>Measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds.</p>
                  <div className="flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${seoData.coreWebVitals.lcp.status === 'good' ? 'bg-green-500' : seoData.coreWebVitals.lcp.status === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${seoData.coreWebVitals.lcp.score}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${textColor}`}>{seoData.coreWebVitals.lcp.value}s</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-medium ${textColor}`}>First Input Delay (FID)</h4>
                    <StatusBadge status={seoData.coreWebVitals.fid.status} />
                  </div>
                  <p className={`text-sm mb-2 ${subTextColor}`}>Measures interactivity. To provide a good user experience, FID should be less than 100 milliseconds.</p>
                  <div className="flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${seoData.coreWebVitals.fid.status === 'good' ? 'bg-green-500' : seoData.coreWebVitals.fid.status === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${seoData.coreWebVitals.fid.score}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${textColor}`}>{seoData.coreWebVitals.fid.value}ms</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-medium ${textColor}`}>Cumulative Layout Shift (CLS)</h4>
                    <StatusBadge status={seoData.coreWebVitals.cls.status} />
                  </div>
                  <p className={`text-sm mb-2 ${subTextColor}`}>Measures visual stability. To provide a good user experience, CLS should be less than 0.1.</p>
                  <div className="flex items-center">
                    <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${seoData.coreWebVitals.cls.status === 'good' ? 'bg-green-500' : seoData.coreWebVitals.cls.status === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${seoData.coreWebVitals.cls.score}%` }}
                      ></div>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${textColor}`}>{seoData.coreWebVitals.cls.value}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-2 ${textColor}`}>Recommendations</h4>
                <ul className={`text-sm space-y-2 ${subTextColor}`}>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span>Optimize image loading with proper width and height attributes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span>Reduce JavaScript execution time by removing unused code</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Fix CLS issues on mobile by using fixed dimensions for all banner ads</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Search Console Trends */}
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm col-span-1 md:col-span-2`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-lg font-semibold ${textColor}`}>Search Console Trends</h3>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${timePeriod === '7d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setTimePeriod('7d')}
                  >
                    7 Days
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${timePeriod === '30d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setTimePeriod('30d')}
                  >
                    30 Days
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md ${timePeriod === '90d' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                    onClick={() => setTimePeriod('90d')}
                  >
                    90 Days
                  </button>
                </div>
              </div>

              <div className="h-64 mb-6 flex items-center justify-center">
                <p className={`text-sm ${subTextColor}`}>Chart would be displayed here (showing clicks and impressions over time)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-medium mb-3 ${textColor}`}>Top Performing Pages</h4>
                  <div className="overflow-x-auto">
                    <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <thead>
                        <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                          <th className="py-2 text-left text-xs font-medium uppercase tracking-wider">Page</th>
                          <th className="py-2 text-right text-xs font-medium uppercase tracking-wider">Clicks</th>
                          <th className="py-2 text-right text-xs font-medium uppercase tracking-wider">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoData.searchConsole.topPages.map((page, index) => (
                          <tr key={index} className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                            <td className="py-2 text-sm truncate max-w-[200px]">{page.page}</td>
                            <td className="py-2 text-sm text-right">{page.clicks}</td>
                            <td className="py-2 text-sm text-right">{page.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-3 ${textColor}`}>Top Queries</h4>
                  <div className="overflow-x-auto">
                    <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <thead>
                        <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                          <th className="py-2 text-left text-xs font-medium uppercase tracking-wider">Query</th>
                          <th className="py-2 text-right text-xs font-medium uppercase tracking-wider">Clicks</th>
                          <th className="py-2 text-right text-xs font-medium uppercase tracking-wider">CTR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoData.searchConsole.topQueries.map((query, index) => (
                          <tr key={index} className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                            <td className="py-2 text-sm truncate max-w-[200px]">{query.query}</td>
                            <td className="py-2 text-sm text-right">{query.clicks}</td>
                            <td className="py-2 text-sm text-right">{(query.clicks / query.impressions * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'health':
        return (
          <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${textColor}`}>SEO Health Check</h3>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center`}
                  onClick={handleRefresh}
                >
                  <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh
                </button>
                <select
                  className={`px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 border-none dark:bg-gray-700 dark:text-gray-300`}
                >
                  <option value="all">All Issues</option>
                  <option value="errors">Errors Only</option>
                  <option value="warnings">Warnings Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <thead>
                  <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Issue</th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                    <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {seoData.seoHealth.map((item: SEOHealthItem) => (
                    <tr key={item.id} className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                      <td className="py-4 text-sm font-medium">{item.name}</td>
                      <td className="py-4 text-sm">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-4 text-sm max-w-md">
                        <p>{item.description}</p>
                        {item.recommendation && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Recommendation: {item.recommendation}
                          </p>
                        )}
                      </td>
                      <td className="py-4 text-sm">
                        {item.status !== 'good' && (
                          <button className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                            Fix Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'integrations':
        return (
          <div className="grid grid-cols-1 gap-6">
            <div className={`${cardBg} border ${borderColor} rounded-lg p-6 shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-6 ${textColor}`}>Google Integrations</h3>

              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <thead>
                    <tr className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                      <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Integration</th>
                      <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Last Checked</th>
                      <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                      <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoData.integrations.map((integration: IntegrationStatus) => (
                      <tr key={integration.id} className={isDarkMode ? 'border-b border-gray-700' : 'border-b'}>
                        <td className="py-4 text-sm font-medium">{integration.name}</td>
                        <td className="py-4 text-sm">
                          <StatusBadge status={integration.status} />
                        </td>
                        <td className="py-4 text-sm">
                          {new Date(integration.lastChecked).toLocaleString()}
                        </td>
                        <td className="py-4 text-sm">{integration.description}</td>
                        <td className="py-4 text-sm">
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                              Configure
                            </button>
                            {integration.status === 'inactive' && (
                              <button className="px-3 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800">
                                Connect
                              </button>
                            )}
                            {integration.status === 'error' && (
                              <button className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800">
                                Fix
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
                <h4 className={`font-medium mb-3 ${textColor}`}>Add New Integration</h4>
                <div className="flex space-x-3">
                  <select
                    className={`px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 border-none dark:bg-gray-700 dark:text-gray-300`}
                  >
                    <option value="">Select Integration</option>
                    <option value="google-ads">Google Ads</option>
                    <option value="search-console">Google Search Console</option>
                    <option value="analytics">Google Analytics 4</option>
                    <option value="tag-manager">Google Tag Manager</option>
                    <option value="merchant-center">Google Merchant Center</option>
                    <option value="business-profile">Google Business Profile</option>
                  </select>
                  <button className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Add Integration
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className={`text-xl font-bold ${textColor}`}>Google SEO Dashboard</h2>
          <p className={`mt-1 ${subTextColor}`}>Insights and optimizations to improve your Google search visibility.</p>
        </div>

        <div className="flex mt-3 md:mt-0 space-x-2">
          <select
            className={`${cardBg} border ${borderColor} rounded-md px-3 py-2 text-sm ${textColor}`}
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as any)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button
            className={`${cardBg} border ${borderColor} rounded-md px-3 py-2 text-sm ${textColor} hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center`}
            onClick={handleRefresh}
          >
            <svg className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? `border-[#982a4a] ${textColor}`
                  : `border-transparent ${subTextColor} hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600`
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'performance'
                  ? `border-[#982a4a] ${textColor}`
                  : `border-transparent ${subTextColor} hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600`
              }`}
              onClick={() => setActiveTab('performance')}
            >
              Performance
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'health'
                  ? `border-[#982a4a] ${textColor}`
                  : `border-transparent ${subTextColor} hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600`
              }`}
              onClick={() => setActiveTab('health')}
            >
              SEO Health
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'integrations'
                  ? `border-[#982a4a] ${textColor}`
                  : `border-transparent ${subTextColor} hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-200 dark:hover:border-gray-600`
              }`}
              onClick={() => setActiveTab('integrations')}
            >
              Integrations
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        renderTabContent()
      )}
    </div>
  );
};

export default GoogleSEODashboard;
