import React, { useState, useEffect } from 'react';
import { getErrorTracking } from '../utils/errorTracking';

// Types for Web Vitals data
interface WebVitalsData {
  url: string;
  timestamp: number;
  metrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
    inp: number;
  };
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  device?: {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    viewport?: {
      width: number;
      height: number;
    };
  };
}

interface PagePerformance {
  url: string;
  averageMetrics: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
    inp: number;
  };
  samples: number;
  lastUpdated: number;
  passing: {
    lcp: boolean;
    fid: boolean;
    cls: boolean;
    overall: boolean;
  };
}

// Thresholds for Web Vitals (based on Google's recommendations)
const thresholds = {
  lcp: {
    good: 2500, // ms
    poor: 4000  // ms
  },
  fid: {
    good: 100,  // ms
    poor: 300   // ms
  },
  cls: {
    good: 0.1,
    poor: 0.25
  },
  ttfb: {
    good: 800,  // ms
    poor: 1800  // ms
  },
  fcp: {
    good: 1800, // ms
    poor: 3000  // ms
  },
  inp: {
    good: 200,  // ms
    poor: 500   // ms
  }
};

// Helper function to get status color based on metric value
const getStatusColor = (metric: string, value: number): string => {
  if (!thresholds[metric as keyof typeof thresholds]) return 'text-gray-500';

  if (value <= thresholds[metric as keyof typeof thresholds].good) {
    return 'text-green-500';
  } else if (value >= thresholds[metric as keyof typeof thresholds].poor) {
    return 'text-red-500';
  }
  return 'text-amber-500';
};

// Helper function to get status label
const getStatusLabel = (metric: string, value: number): string => {
  if (!thresholds[metric as keyof typeof thresholds]) return 'Unknown';

  if (value <= thresholds[metric as keyof typeof thresholds].good) {
    return 'Good';
  } else if (value >= thresholds[metric as keyof typeof thresholds].poor) {
    return 'Poor';
  }
  return 'Needs Improvement';
};

// Helper function to format metric value
const formatMetricValue = (metric: string, value: number): string => {
  if (metric === 'cls') {
    return value.toFixed(2);
  }
  return `${Math.round(value)}ms`;
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

const CoreWebVitalsMonitor: React.FC = () => {
  const [pageData, setPageData] = useState<PagePerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [detailedData, setDetailedData] = useState<WebVitalsData[]>([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const errorTracking = getErrorTracking();

  // Fetch Web Vitals data
  const fetchWebVitalsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the Netlify function
      // const response = await fetch(`/.netlify/functions/pagespeed-insights?timeRange=${timeRange}`);
      // if (!response.ok) throw new Error(`Failed to fetch Web Vitals data: ${response.status}`);
      // const data = await response.json();
      // setPageData(data.pages);

      // For demo, create mock data
      const mockData: PagePerformance[] = [
        {
          url: '/',
          averageMetrics: {
            lcp: 1850,
            fid: 45,
            cls: 0.05,
            ttfb: 320,
            fcp: 1200,
            inp: 90
          },
          samples: 1245,
          lastUpdated: Date.now() - 900000, // 15 mins ago
          passing: {
            lcp: true,
            fid: true,
            cls: true,
            overall: true
          }
        },
        {
          url: '/deals',
          averageMetrics: {
            lcp: 2750,
            fid: 65,
            cls: 0.15,
            ttfb: 420,
            fcp: 1500,
            inp: 180
          },
          samples: 845,
          lastUpdated: Date.now() - 1200000, // 20 mins ago
          passing: {
            lcp: false,
            fid: true,
            cls: false,
            overall: false
          }
        },
        {
          url: '/coupons',
          averageMetrics: {
            lcp: 2100,
            fid: 75,
            cls: 0.08,
            ttfb: 380,
            fcp: 1400,
            inp: 150
          },
          samples: 625,
          lastUpdated: Date.now() - 1500000, // 25 mins ago
          passing: {
            lcp: true,
            fid: true,
            cls: true,
            overall: true
          }
        },
        {
          url: '/stores',
          averageMetrics: {
            lcp: 3200,
            fid: 120,
            cls: 0.22,
            ttfb: 550,
            fcp: 1900,
            inp: 250
          },
          samples: 415,
          lastUpdated: Date.now() - 1800000, // 30 mins ago
          passing: {
            lcp: false,
            fid: false,
            cls: false,
            overall: false
          }
        },
        {
          url: '/blog',
          averageMetrics: {
            lcp: 2300,
            fid: 58,
            cls: 0.12,
            ttfb: 410,
            fcp: 1550,
            inp: 160
          },
          samples: 325,
          lastUpdated: Date.now() - 2100000, // 35 mins ago
          passing: {
            lcp: true,
            fid: true,
            cls: false,
            overall: false
          }
        }
      ];

      setPageData(mockData);

      // Create detailed data for the first page
      const mockDetailedData: WebVitalsData[] = Array(10).fill(null).map((_, index) => ({
        url: '/',
        timestamp: Date.now() - (index * 3600000), // hours ago
        metrics: {
          lcp: 1850 + (Math.random() * 500 - 250),
          fid: 45 + (Math.random() * 20 - 10),
          cls: 0.05 + (Math.random() * 0.03 - 0.015),
          ttfb: 320 + (Math.random() * 100 - 50),
          fcp: 1200 + (Math.random() * 200 - 100),
          inp: 90 + (Math.random() * 40 - 20)
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        connection: {
          effectiveType: '4g',
          downlink: 10,
          rtt: 50
        },
        device: {
          deviceMemory: 8,
          hardwareConcurrency: 8,
          viewport: {
            width: 1920,
            height: 1080
          }
        }
      }));

      setDetailedData(mockDetailedData);
    } catch (err) {
      console.error('Error fetching Web Vitals data:', err);
      errorTracking.captureError(err instanceof Error ? err : new Error('Unknown error fetching Web Vitals data'), {
        component: 'CoreWebVitalsMonitor',
        method: 'fetchWebVitalsData',
        timeRange
      });
      setError('Failed to load Web Vitals data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchWebVitalsData();
  }, [timeRange]);

  // Handle page selection
  const handlePageSelect = (url: string) => {
    setSelectedPage(url);
    // In a real implementation, this would fetch detailed data for the selected page
    // For demo, just show a detail view
    setShowDetails(true);
  };

  // Calculate overall performance score (0-100)
  const calculateOverallScore = (): number => {
    if (!pageData.length) return 0;

    const passingPages = pageData.filter(page => page.passing.overall).length;
    return Math.round((passingPages / pageData.length) * 100);
  };

  // Get status class for score
  const getScoreClass = (score: number): string => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Get percentage of pages passing for a specific metric
  const getMetricPassingPercentage = (metric: keyof PagePerformance['passing']): number => {
    if (!pageData.length) return 0;

    const passingCount = pageData.filter(page => page.passing[metric]).length;
    return Math.round((passingCount / pageData.length) * 100);
  };

  // Calculate average for a specific metric across all pages
  const getAverageMetric = (metric: keyof PagePerformance['averageMetrics']): number => {
    if (!pageData.length) return 0;

    const sum = pageData.reduce((total, page) => total + page.averageMetrics[metric], 0);
    return sum / pageData.length;
  };

  // Render loading state
  if (loading && pageData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#982a4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Web Vitals data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && pageData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={fetchWebVitalsData}
            className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render detailed view for a specific page
  if (showDetails && selectedPage) {
    const pageInfo = pageData.find(page => page.url === selectedPage);

    if (!pageInfo) {
      return <div>Page data not found</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowDetails(false)}
            className="flex items-center text-[#982a4a] hover:underline"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Overview
          </button>
          <h1 className="text-2xl font-bold ml-4">Core Web Vitals: {selectedPage}</h1>
        </div>

        {/* Page performance summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Overall Status</h3>
            <div className="flex items-center">
              <div className={`text-3xl font-bold ${pageInfo.passing.overall ? 'text-green-500' : 'text-red-500'}`}>
                {pageInfo.passing.overall ? 'Passing' : 'Failing'}
              </div>
              <div className={`ml-2 w-3 h-3 rounded-full ${pageInfo.passing.overall ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Data Samples</h3>
            <p className="text-3xl font-bold">{pageInfo.samples.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-xl font-bold">{formatDate(pageInfo.lastUpdated)}</p>
          </div>
        </div>

        {/* Core Web Vitals cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* LCP Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Largest Contentful Paint</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('lcp', pageInfo.averageMetrics.lcp)}`}>
                  {getStatusLabel('lcp', pageInfo.averageMetrics.lcp)}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">Measures loading performance</p>
            </div>
            <div className="px-4 py-6 flex flex-col items-center">
              <div className={`text-4xl font-bold ${getStatusColor('lcp', pageInfo.averageMetrics.lcp)}`}>
                {formatMetricValue('lcp', pageInfo.averageMetrics.lcp)}
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStatusColor('lcp', pageInfo.averageMetrics.lcp)}`}
                  style={{ width: `${Math.min(100, (pageInfo.averageMetrics.lcp / thresholds.lcp.poor) * 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between w-full">
                <span>Good: &lt;{thresholds.lcp.good}ms</span>
                <span>Poor: &gt;{thresholds.lcp.poor}ms</span>
              </div>
            </div>
          </div>

          {/* FID Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">First Input Delay</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('fid', pageInfo.averageMetrics.fid)}`}>
                  {getStatusLabel('fid', pageInfo.averageMetrics.fid)}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">Measures interactivity</p>
            </div>
            <div className="px-4 py-6 flex flex-col items-center">
              <div className={`text-4xl font-bold ${getStatusColor('fid', pageInfo.averageMetrics.fid)}`}>
                {formatMetricValue('fid', pageInfo.averageMetrics.fid)}
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStatusColor('fid', pageInfo.averageMetrics.fid)}`}
                  style={{ width: `${Math.min(100, (pageInfo.averageMetrics.fid / thresholds.fid.poor) * 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between w-full">
                <span>Good: &lt;{thresholds.fid.good}ms</span>
                <span>Poor: &gt;{thresholds.fid.poor}ms</span>
              </div>
            </div>
          </div>

          {/* CLS Card */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Cumulative Layout Shift</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('cls', pageInfo.averageMetrics.cls)}`}>
                  {getStatusLabel('cls', pageInfo.averageMetrics.cls)}
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">Measures visual stability</p>
            </div>
            <div className="px-4 py-6 flex flex-col items-center">
              <div className={`text-4xl font-bold ${getStatusColor('cls', pageInfo.averageMetrics.cls)}`}>
                {formatMetricValue('cls', pageInfo.averageMetrics.cls)}
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStatusColor('cls', pageInfo.averageMetrics.cls)}`}
                  style={{ width: `${Math.min(100, (pageInfo.averageMetrics.cls / thresholds.cls.poor) * 100)}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between w-full">
                <span>Good: &lt;{thresholds.cls.good}</span>
                <span>Poor: &gt;{thresholds.cls.poor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* TTFB Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Time to First Byte</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('ttfb', pageInfo.averageMetrics.ttfb)}`}>
                {formatMetricValue('ttfb', pageInfo.averageMetrics.ttfb)}
              </div>
            </div>
            <p className="text-xs text-gray-500">Server response time</p>
          </div>

          {/* FCP Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">First Contentful Paint</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('fcp', pageInfo.averageMetrics.fcp)}`}>
                {formatMetricValue('fcp', pageInfo.averageMetrics.fcp)}
              </div>
            </div>
            <p className="text-xs text-gray-500">First content appears</p>
          </div>

          {/* INP Card */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Interaction to Next Paint</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('inp', pageInfo.averageMetrics.inp)}`}>
                {formatMetricValue('inp', pageInfo.averageMetrics.inp)}
              </div>
            </div>
            <p className="text-xs text-gray-500">Responsiveness to interactions</p>
          </div>
        </div>

        {/* History Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-bold mb-4">Performance History</h3>
          <div className="h-64 bg-gray-100 rounded">
            {/* In a real implementation, this would be a line chart showing the history of metrics over time */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Performance History Chart</p>
                <p className="text-xs text-gray-400 mt-2">This is a placeholder. In production, this would show a trend chart.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent measurements */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Recent Measurements</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LCP</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTFB</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detailedData.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.timestamp)}</td>
                    <td className={`px-4 py-3 text-sm ${getStatusColor('lcp', entry.metrics.lcp)}`}>
                      {formatMetricValue('lcp', entry.metrics.lcp)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${getStatusColor('fid', entry.metrics.fid)}`}>
                      {formatMetricValue('fid', entry.metrics.fid)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${getStatusColor('cls', entry.metrics.cls)}`}>
                      {formatMetricValue('cls', entry.metrics.cls)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${getStatusColor('ttfb', entry.metrics.ttfb)}`}>
                      {formatMetricValue('ttfb', entry.metrics.ttfb)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.device?.hardwareConcurrency ? `${entry.device.hardwareConcurrency} cores` : 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {entry.connection?.effectiveType || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Render main dashboard view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Core Web Vitals Dashboard</h1>
        <p className="text-gray-600">Monitor performance metrics for your site</p>
      </div>

      {/* Time range filter */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={fetchWebVitalsData}
              className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
              {loading && <span className="ml-2 animate-spin">⟳</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Overall score */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center justify-center col-span-1">
            <div className="relative mb-2">
              <svg viewBox="0 0 36 36" className="w-32 h-32">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={getScoreClass(calculateOverallScore())}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${calculateOverallScore()}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="21" textAnchor="middle" className={`text-3xl font-bold ${getScoreClass(calculateOverallScore())}`} fill="currentColor">
                  {calculateOverallScore()}
                </text>
              </svg>
            </div>
            <h2 className="text-lg font-bold">Overall Score</h2>
            <p className="text-sm text-gray-500">Across all pages</p>
          </div>

          <div className="col-span-3">
            <h3 className="text-lg font-bold mb-4">Core Web Vitals Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">LCP</h4>
                  <div className={`text-sm font-medium ${getScoreClass(getMetricPassingPercentage('lcp'))}`}>
                    {getMetricPassingPercentage('lcp')}% passing
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">Largest Contentful Paint</p>
                <div className="text-2xl font-bold">
                  {formatMetricValue('lcp', getAverageMetric('lcp'))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Avg. across all pages</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">FID</h4>
                  <div className={`text-sm font-medium ${getScoreClass(getMetricPassingPercentage('fid'))}`}>
                    {getMetricPassingPercentage('fid')}% passing
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">First Input Delay</p>
                <div className="text-2xl font-bold">
                  {formatMetricValue('fid', getAverageMetric('fid'))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Avg. across all pages</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">CLS</h4>
                  <div className={`text-sm font-medium ${getScoreClass(getMetricPassingPercentage('cls'))}`}>
                    {getMetricPassingPercentage('cls')}% passing
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">Cumulative Layout Shift</p>
                <div className="text-2xl font-bold">
                  {formatMetricValue('cls', getAverageMetric('cls'))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Avg. across all pages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page performance table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Page Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LCP</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLS</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Samples</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.map((page) => (
                <tr key={page.url} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{page.url}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getStatusColor('lcp', page.averageMetrics.lcp)}`}>
                      {formatMetricValue('lcp', page.averageMetrics.lcp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getStatusColor('fid', page.averageMetrics.fid)}`}>
                      {formatMetricValue('fid', page.averageMetrics.fid)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getStatusColor('cls', page.averageMetrics.cls)}`}>
                      {formatMetricValue('cls', page.averageMetrics.cls)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${page.passing.overall ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {page.passing.overall ? 'Passing' : 'Failing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.samples.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePageSelect(page.url)}
                      className="text-[#982a4a] hover:text-[#982a4a]/70"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoreWebVitalsMonitor;
