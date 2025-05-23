import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';

// Define analytics data types
interface PageView {
  page: string;
  count: number;
  uniqueVisitors: number;
  avgTimeOnPage: number; // in seconds
  bounceRate: number; // percentage
  exitRate: number; // percentage
}

interface ReferrerSource {
  source: string;
  visitors: number;
  percentage: number;
}

interface BrowserData {
  browser: string;
  count: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

interface LocationData {
  country: string;
  count: number;
  percentage: number;
}

interface ConversionData {
  action: string;
  count: number;
  conversionRate: number;
}

interface DealClickData {
  dealId: string;
  dealName: string;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
}

interface AnalyticsData {
  timeRange: string;
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number; // in seconds
  bounceRate: number; // percentage
  topPages: PageView[];
  referrers: ReferrerSource[];
  browsers: BrowserData[];
  devices: DeviceData[];
  locations: LocationData[];
  conversions: ConversionData[];
  dealClicks: DealClickData[];
  visitorsByDay: {
    date: string;
    visitors: number;
    pageViews: number;
  }[];
}

// Sample analytics data
const sampleAnalyticsData: AnalyticsData = {
  timeRange: '30d',
  totalVisitors: 24589,
  uniqueVisitors: 15342,
  pageViews: 76254,
  avgSessionDuration: 185, // 3m 5s
  bounceRate: 42.3,
  topPages: [
    {
      page: 'Home Page',
      count: 15432,
      uniqueVisitors: 12453,
      avgTimeOnPage: 65,
      bounceRate: 35.2,
      exitRate: 22.5,
    },
    {
      page: 'Today\'s Deals',
      count: 12345,
      uniqueVisitors: 8765,
      avgTimeOnPage: 122,
      bounceRate: 25.7,
      exitRate: 18.2,
    },
    {
      page: 'Amazon Store Page',
      count: 8765,
      uniqueVisitors: 6543,
      avgTimeOnPage: 93,
      bounceRate: 32.1,
      exitRate: 28.4,
    },
    {
      page: 'Categories/Electronics',
      count: 7654,
      uniqueVisitors: 5432,
      avgTimeOnPage: 78,
      bounceRate: 40.2,
      exitRate: 35.6,
    },
    {
      page: 'Apple AirPods Pro Deal',
      count: 6543,
      uniqueVisitors: 4321,
      avgTimeOnPage: 135,
      bounceRate: 15.6,
      exitRate: 42.3,
    },
  ],
  referrers: [
    { source: 'Direct', visitors: 5689, percentage: 23.1 },
    { source: 'Google', visitors: 8765, percentage: 35.6 },
    { source: 'Facebook', visitors: 3456, percentage: 14.1 },
    { source: 'Instagram', visitors: 2345, percentage: 9.5 },
    { source: 'Twitter', visitors: 1234, percentage: 5.0 },
    { source: 'Email', visitors: 1876, percentage: 7.6 },
    { source: 'Other', visitors: 1224, percentage: 5.1 },
  ],
  browsers: [
    { browser: 'Chrome', count: 12543, percentage: 51.0 },
    { browser: 'Safari', count: 5432, percentage: 22.1 },
    { browser: 'Firefox', count: 2345, percentage: 9.5 },
    { browser: 'Edge', count: 2123, percentage: 8.6 },
    { browser: 'Samsung Internet', count: 1234, percentage: 5.0 },
    { browser: 'Opera', count: 543, percentage: 2.2 },
    { browser: 'Other', count: 369, percentage: 1.6 },
  ],
  devices: [
    { device: 'Mobile', count: 14532, percentage: 59.1 },
    { device: 'Desktop', count: 8765, percentage: 35.6 },
    { device: 'Tablet', count: 1292, percentage: 5.3 },
  ],
  locations: [
    { country: 'United States', count: 15432, percentage: 62.8 },
    { country: 'United Kingdom', count: 3254, percentage: 13.2 },
    { country: 'Canada', count: 2123, percentage: 8.6 },
    { country: 'Australia', count: 1234, percentage: 5.0 },
    { country: 'Germany', count: 875, percentage: 3.6 },
    { country: 'France', count: 543, percentage: 2.2 },
    { country: 'Other', count: 1128, percentage: 4.6 },
  ],
  conversions: [
    { action: 'Deal Click', count: 8952, conversionRate: 36.4 },
    { action: 'Store Visit', count: 5432, conversionRate: 22.1 },
    { action: 'Email Signup', count: 1423, conversionRate: 5.8 },
    { action: 'App Download', count: 876, conversionRate: 3.6 },
  ],
  dealClicks: [
    {
      dealId: 'deal-001',
      dealName: 'Apple AirPods Pro (2nd Generation)',
      clicks: 1452,
      impressions: 4532,
      ctr: 32.0,
      conversions: 543,
      conversionRate: 37.4,
    },
    {
      dealId: 'deal-002',
      dealName: 'Dyson V11 Cordless Vacuum',
      clicks: 1352,
      impressions: 3876,
      ctr: 34.9,
      conversions: 432,
      conversionRate: 32.0,
    },
    {
      dealId: 'deal-003',
      dealName: 'Nintendo Switch OLED Model',
      clicks: 1243,
      impressions: 3654,
      ctr: 34.0,
      conversions: 398,
      conversionRate: 32.0,
    },
    {
      dealId: 'deal-004',
      dealName: 'Samsung 55" QLED 4K Smart TV',
      clicks: 1165,
      impressions: 3543,
      ctr: 32.9,
      conversions: 356,
      conversionRate: 30.6,
    },
    {
      dealId: 'deal-005',
      dealName: 'KitchenAid Stand Mixer',
      clicks: 978,
      impressions: 3234,
      ctr: 30.2,
      conversions: 287,
      conversionRate: 29.3,
    },
  ],
  visitorsByDay: [
    { date: '2025-05-21', visitors: 856, pageViews: 2567 },
    { date: '2025-05-20', visitors: 892, pageViews: 2678 },
    { date: '2025-05-19', visitors: 854, pageViews: 2567 },
    { date: '2025-05-18', visitors: 798, pageViews: 2345 },
    { date: '2025-05-17', visitors: 756, pageViews: 2123 },
    { date: '2025-05-16', visitors: 845, pageViews: 2456 },
    { date: '2025-05-15', visitors: 923, pageViews: 2765 },
    { date: '2025-05-14', visitors: 932, pageViews: 2786 },
    { date: '2025-05-13', visitors: 912, pageViews: 2745 },
    { date: '2025-05-12', visitors: 934, pageViews: 2798 },
    { date: '2025-05-11', visitors: 867, pageViews: 2543 },
    { date: '2025-05-10', visitors: 765, pageViews: 2234 },
    { date: '2025-05-09', visitors: 843, pageViews: 2456 },
    { date: '2025-05-08', visitors: 865, pageViews: 2543 },
  ],
};

const SiteAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(sampleAnalyticsData);

  // In a real app, you would fetch analytics data from an API
  useEffect(() => {
    // This would be an API call in a real app
    setAnalyticsData({
      ...sampleAnalyticsData,
      timeRange,
    });
  }, [timeRange]);

  // Helper function to format time in seconds to mm:ss format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Helper to generate percentage bar
  const PercentageBar: React.FC<{ percentage: number; color?: string }> = ({
    percentage,
    color = 'bg-[#982a4a]'
  }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
      <div
        className={`${color} h-2.5 rounded-full`}
        style={{ width: `${Math.min(100, percentage)}%` }}
      ></div>
    </div>
  );

  // Helper to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Site Analytics</h1>

        <div className="flex space-x-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
            <option value="1y">Last Year</option>
          </select>

          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Total Visitors</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(analyticsData.totalVisitors)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 text-xs flex items-center font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                8.3%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Page Views</p>
                <p className="text-2xl font-bold mt-1">{formatNumber(analyticsData.pageViews)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 text-xs flex items-center font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                12.5%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Avg Session Duration</p>
                <p className="text-2xl font-bold mt-1">{formatTime(analyticsData.avgSessionDuration)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-red-600 text-xs flex items-center font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                2.1%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase">Bounce Rate</p>
                <p className="text-2xl font-bold mt-1">{analyticsData.bounceRate}%</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-600 text-xs flex items-center font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                1.8%
              </span>
              <span className="text-xs text-gray-500 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="deals">Deal Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visitors Over Time Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visitors Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 relative">
                  {/* This would be a real chart in production */}
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {analyticsData.visitorsByDay.slice(-14).map((day, index) => {
                      const heightPercentage = (day.visitors / 1000) * 100;
                      return (
                        <div key={day.date} className="flex flex-col items-center">
                          <div
                            className="w-8 bg-[#982a4a] rounded-t"
                            style={{ height: `${heightPercentage}%` }}
                          ></div>
                          <p className="text-xs text-gray-500 mt-2 rotate-90 lg:rotate-0 origin-left lg:origin-center">
                            {new Date(day.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 flex justify-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#982a4a] rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Visitors</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Page Views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.referrers.slice(0, 5).map(referrer => (
                    <div key={referrer.source}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{referrer.source}</span>
                        <span className="text-sm text-gray-500">{referrer.percentage}%</span>
                      </div>
                      <PercentageBar percentage={referrer.percentage} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-3">Top Conversion Actions</h4>
                  <div className="space-y-4">
                    {analyticsData.conversions.slice(0, 3).map(conversion => (
                      <div key={conversion.action}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{conversion.action}</span>
                          <span className="text-sm text-gray-500">{conversion.conversionRate}%</span>
                        </div>
                        <PercentageBar percentage={conversion.conversionRate} color="bg-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Pages & Device Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unique</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.topPages.map((page, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{page.page}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatNumber(page.count)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatNumber(page.uniqueVisitors)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatTime(page.avgTimeOnPage)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{page.bounceRate}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Device & Browser Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.devices.map(device => (
                    <div key={device.device}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{device.device}</span>
                        <span className="text-sm text-gray-500">{device.percentage}%</span>
                      </div>
                      <PercentageBar
                        percentage={device.percentage}
                        color={
                          device.device === 'Mobile' ? 'bg-blue-500' :
                          device.device === 'Desktop' ? 'bg-purple-500' : 'bg-green-500'
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-3">Browser Breakdown</h4>
                  <div className="space-y-4">
                    {analyticsData.browsers.slice(0, 4).map(browser => (
                      <div key={browser.browser}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{browser.browser}</span>
                          <span className="text-sm text-gray-500">{browser.percentage}%</span>
                        </div>
                        <PercentageBar
                          percentage={browser.percentage}
                          color="bg-gray-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <p className="text-gray-500">Map Visualization Placeholder</p>
                </div>

                <div className="space-y-4 mt-6">
                  {analyticsData.locations.slice(0, 6).map(location => (
                    <div key={location.country}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{location.country}</span>
                        <span className="text-sm text-gray-500">{formatNumber(location.count)} ({location.percentage}%)</span>
                      </div>
                      <PercentageBar percentage={location.percentage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device & Browser */}
            <Card>
              <CardHeader>
                <CardTitle>Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Devices</h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-600">
                            Mobile
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {analyticsData.devices.find(d => d.device === 'Mobile')?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Device Chart Placeholder</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Browsers</h3>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analyticsData.browsers.map(browser => (
                          <tr key={browser.browser} className="hover:bg-gray-50">
                            <td className="py-2">
                              <div className="text-sm font-medium">{browser.browser}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="text-sm">{formatNumber(browser.count)}</div>
                            </td>
                            <td className="py-2 text-right">
                              <div className="text-sm">{browser.percentage}%</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New vs Returning */}
            <Card>
              <CardHeader>
                <CardTitle>New vs Returning Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Donut Chart Placeholder</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">New Visitors</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">62.4%</p>
                    <p className="text-xs text-green-500 mt-1">↑ 5.2%</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Returning Visitors</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">37.6%</p>
                    <p className="text-xs text-red-500 mt-1">↓ 5.2%</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Avg. Sessions per User</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">1.8</p>
                    <p className="text-xs text-green-500 mt-1">↑ 2.3%</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Avg. Session Duration</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{formatTime(analyticsData.avgSessionDuration)}</p>
                    <p className="text-xs text-red-500 mt-1">↓ 2.1%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Pages / Session</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">3.1</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 3.3% vs previous period</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">Bounce Rate</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">{analyticsData.bounceRate}%</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 1.8% improvement</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-green-700 font-medium">Avg. Session Duration</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{formatTime(analyticsData.avgSessionDuration)}</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-red-600 mt-2">↓ 2.1% vs previous period</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-yellow-700 font-medium">Pages per Visit</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">3.1</p>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <svg className="w-5 h-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 4.2% vs previous period</p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">Session Duration Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">0-10 seconds</span>
                        <span className="text-sm text-gray-500">28.5%</span>
                      </div>
                      <PercentageBar percentage={28.5} color="bg-red-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">11-30 seconds</span>
                        <span className="text-sm text-gray-500">18.2%</span>
                      </div>
                      <PercentageBar percentage={18.2} color="bg-orange-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">31-60 seconds</span>
                        <span className="text-sm text-gray-500">15.7%</span>
                      </div>
                      <PercentageBar percentage={15.7} color="bg-yellow-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">1-3 minutes</span>
                        <span className="text-sm text-gray-500">22.4%</span>
                      </div>
                      <PercentageBar percentage={22.4} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">3+ minutes</span>
                        <span className="text-sm text-gray-500">15.2%</span>
                      </div>
                      <PercentageBar percentage={15.2} color="bg-blue-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Page Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unique</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bounce</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Exit %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.topPages.map((page, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{page.page}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatNumber(page.count)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatNumber(page.uniqueVisitors)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{formatTime(page.avgTimeOnPage)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className={`text-sm ${page.bounceRate > 50 ? 'text-red-600' : page.bounceRate > 35 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {page.bounceRate}%
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <div className="text-sm">{page.exitRate}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Site Speed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Site Speed Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">First Contentful Paint</span>
                      <span className="text-sm text-gray-500">1.2s</span>
                    </div>
                    <PercentageBar
                      percentage={80}
                      color="bg-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">80% of industry average</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Time to Interactive</span>
                      <span className="text-sm text-gray-500">2.8s</span>
                    </div>
                    <PercentageBar
                      percentage={70}
                      color="bg-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">70% of industry average</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Largest Contentful Paint</span>
                      <span className="text-sm text-gray-500">2.4s</span>
                    </div>
                    <PercentageBar
                      percentage={85}
                      color="bg-yellow-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">85% of industry average</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Cumulative Layout Shift</span>
                      <span className="text-sm text-gray-500">0.12</span>
                    </div>
                    <PercentageBar
                      percentage={60}
                      color="bg-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">60% of industry average</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Performance Insights</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Image optimization could improve Largest Contentful Paint by up to 0.8s.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Flow & Path Analysis */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>User Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">User Flow Visualization Placeholder</p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Top Landing Pages</h3>
                    <ol className="space-y-2 pl-5 list-decimal">
                      <li className="text-sm">Home Page (45.2%)</li>
                      <li className="text-sm">Today's Deals (18.7%)</li>
                      <li className="text-sm">Amazon Store Page (9.3%)</li>
                      <li className="text-sm">Electronics Category (5.8%)</li>
                      <li className="text-sm">Apple AirPods Deal (3.2%)</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Top Exit Pages</h3>
                    <ol className="space-y-2 pl-5 list-decimal">
                      <li className="text-sm">Deal Detail Pages (28.5%)</li>
                      <li className="text-sm">Home Page (15.3%)</li>
                      <li className="text-sm">Store Pages (12.7%)</li>
                      <li className="text-sm">Search Results (9.4%)</li>
                      <li className="text-sm">Category Pages (8.2%)</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Common User Paths</h3>
                    <ol className="space-y-2 pl-5 list-decimal">
                      <li className="text-sm">Home → Today's Deals → Deal Detail (24.3%)</li>
                      <li className="text-sm">Home → Category → Deal Detail (18.9%)</li>
                      <li className="text-sm">Search → Deal Detail (15.4%)</li>
                      <li className="text-sm">Store Page → Deal Detail (10.2%)</li>
                      <li className="text-sm">Home → Featured Deal (8.7%)</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Total Conversions</p>
                    <p className="text-2xl font-bold mt-1">16,683</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      8.3% vs previous period
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold mt-1">4.7%</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      0.5% vs previous period
                    </p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">Conversion by Action Type</h3>
                  </div>

                  <div className="space-y-4">
                    {analyticsData.conversions.map(conversion => (
                      <div key={conversion.action}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{conversion.action}</span>
                          <span className="text-sm text-gray-500">{conversion.conversionRate}%</span>
                        </div>
                        <PercentageBar
                          percentage={conversion.conversionRate}
                          color={
                            conversion.action === 'Deal Click' ? 'bg-[#982a4a]' :
                            conversion.action === 'Store Visit' ? 'bg-blue-500' :
                            conversion.action === 'Email Signup' ? 'bg-green-500' :
                            'bg-purple-500'
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">{formatNumber(conversion.count)} conversions</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">Top Converting Pages</h3>
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="py-2">
                          <div className="text-sm font-medium">Apple AirPods Pro Deal</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="text-sm font-medium text-green-600">7.8%</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2">
                          <div className="text-sm font-medium">Amazon Fire TV Deal</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="text-sm font-medium text-green-600">6.5%</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2">
                          <div className="text-sm font-medium">Today's Top Deals</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="text-sm font-medium text-green-600">5.9%</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2">
                          <div className="text-sm font-medium">Electronics Category</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="text-sm font-medium text-green-600">4.2%</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2">
                          <div className="text-sm font-medium">Home Page</div>
                        </td>
                        <td className="py-2 text-right">
                          <div className="text-sm font-medium text-green-600">3.8%</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnels */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Deal Funnel</h3>
                  <div className="relative pt-1">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Page Views</span>
                          <span className="text-sm text-gray-500">{formatNumber(analyticsData.pageViews)} (100%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-[#982a4a] h-4 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Deal Views</span>
                          <span className="text-sm text-gray-500">29,876 (39.2%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-[#982a4a] h-4 rounded-full" style={{ width: '39.2%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Deal Clicks</span>
                          <span className="text-sm text-gray-500">{formatNumber(analyticsData.conversions[0].count)} (11.7%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-[#982a4a] h-4 rounded-full" style={{ width: '11.7%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Completed Purchase</span>
                          <span className="text-sm text-gray-500">2,845 (3.7%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div className="bg-[#982a4a] h-4 rounded-full" style={{ width: '3.7%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-sm font-medium mb-3">Email Signup Funnel</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Form Views</span>
                        <span className="text-sm text-gray-500">24,567 (100%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full w-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Form Starts</span>
                        <span className="text-sm text-gray-500">5,234 (21.3%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: '21.3%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Form Submissions</span>
                        <span className="text-sm text-gray-500">{formatNumber(analyticsData.conversions[2].count)} (5.8%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: '5.8%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Confirmed Subscriptions</span>
                        <span className="text-sm text-gray-500">954 (3.9%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: '3.9%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Conversion Insights</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex">
                      <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Deals with images convert 34% better than deals without images
                    </li>
                    <li className="flex">
                      <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Users from social media have 22% higher conversion rates
                    </li>
                    <li className="flex">
                      <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Limited-time deals have 45% higher click-through rates
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Deal Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Deal Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Name</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analyticsData.dealClicks.map(deal => (
                        <tr key={deal.dealId} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium">{deal.dealName}</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm">{formatNumber(deal.impressions)}</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm">{formatNumber(deal.clicks)}</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm font-medium text-blue-600">{deal.ctr}%</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm">{formatNumber(deal.conversions)}</div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="text-sm font-medium text-green-600">{deal.conversionRate}%</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deal Performance Tab */}
        <TabsContent value="deals">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Performing Deals */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">Apple AirPods Pro (2nd Generation)</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm">Amazon</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(4532)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(1452)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">32.0%</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">$1,240</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">Dyson V11 Cordless Vacuum</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm">Walmart</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(3876)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(1352)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">34.9%</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">$1,890</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">Nintendo Switch OLED Model</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm">Best Buy</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(3654)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(1243)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">34.0%</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">$1,560</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">Samsung 55" QLED 4K Smart TV</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm">Amazon</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(3543)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(1165)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">32.9%</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">$2,140</div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium">KitchenAid Stand Mixer</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm">Target</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(3234)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">{formatNumber(978)}</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">30.2%</div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="text-sm">$890</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Deal Categories Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Electronics</span>
                      <span className="text-sm text-gray-500">32.5%</span>
                    </div>
                    <PercentageBar percentage={32.5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Home & Kitchen</span>
                      <span className="text-sm text-gray-500">24.8%</span>
                    </div>
                    <PercentageBar percentage={24.8} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Clothing</span>
                      <span className="text-sm text-gray-500">18.3%</span>
                    </div>
                    <PercentageBar percentage={18.3} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Toys & Games</span>
                      <span className="text-sm text-gray-500">12.6%</span>
                    </div>
                    <PercentageBar percentage={12.6} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Health & Beauty</span>
                      <span className="text-sm text-gray-500">7.5%</span>
                    </div>
                    <PercentageBar percentage={7.5} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Other</span>
                      <span className="text-sm text-gray-500">4.3%</span>
                    </div>
                    <PercentageBar percentage={4.3} />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">Top Stores</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Amazon</span>
                        <span className="text-sm text-gray-500">42.7%</span>
                      </div>
                      <PercentageBar percentage={42.7} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Walmart</span>
                        <span className="text-sm text-gray-500">18.2%</span>
                      </div>
                      <PercentageBar percentage={18.2} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Best Buy</span>
                        <span className="text-sm text-gray-500">14.5%</span>
                      </div>
                      <PercentageBar percentage={14.5} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Target</span>
                        <span className="text-sm text-gray-500">10.3%</span>
                      </div>
                      <PercentageBar percentage={10.3} color="bg-blue-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deal Trends */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Deal Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <p className="text-gray-500">Deal Performance Chart Placeholder</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">Performance Insights</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tech deals perform 23% better on weekdays
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deals with discounts &gt;30% get 45% more clicks
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Featured deals get 3.2x more engagement
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">Time-Based Patterns</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Peak deal engagement: 7-9 PM weekdays
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Weekend deals perform best 10 AM - 1 PM
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Flash deals get 68% higher engagement
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">Optimization Opportunities</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex">
                        <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Clothing deals underperforming by 12%
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Mobile conversion rate down 3.2% this week
                      </li>
                      <li className="flex">
                        <svg className="h-5 w-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Target deals need better imagery
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteAnalytics;
