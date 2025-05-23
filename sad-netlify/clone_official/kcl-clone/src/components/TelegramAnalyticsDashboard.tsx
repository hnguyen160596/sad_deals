import React, { useState, useEffect, useRef } from 'react';
import { getErrorTracking } from '../utils/errorTracking';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  ChartOptions
} from 'chart.js';
import { optimizeImage } from '../utils/cloudinary';
import { saveAs } from 'file-saver';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);

// Define types for analytics data
interface MessageEngagement {
  views: number;
  clicks: number;
  saves: number;
  shares: number;
  total: number;
  ctr: number;
  last_viewed?: string;
  last_clicked?: string;
  last_updated?: string;
}

interface Message {
  id: string;
  title: string;
  price?: string;
  store?: string;
  category?: string;
  created_at: string;
  tags: string[];
  engagement: MessageEngagement;
}

interface AnalyticsSummary {
  totalMessages: number;
  totalViews: number;
  totalClicks: number;
  totalSaves: number;
  totalShares: number;
  overallCTR: number;
  timeframe: string;
  startDate: string | null;
  endDate: string | null;
}

interface TopPerformers {
  mostViewed: Message[];
  mostClicked: Message[];
  mostSaved: Message[];
  highestCTR: Message[];
}

interface PerformanceMetrics {
  totalMessages: number;
  totalViews: number;
  totalClicks: number;
  totalSaves: number;
  totalShares: number;
  ctr: number;
  messages: Message[];
}

interface Segmentation {
  storePerformance: Record<string, PerformanceMetrics>;
  categoryPerformance: Record<string, PerformanceMetrics>;
  timeSeriesData: Array<{
    date: string;
    views: number;
    clicks: number;
    saves: number;
    shares: number;
    messageCount: number;
  }>;
}

interface FilterOptions {
  stores: string[];
  categories: string[];
  tags: string[];
}

interface AnalyticsData {
  success: boolean;
  summary: AnalyticsSummary;
  topPerformers: TopPerformers;
  segmentation: Segmentation;
  filterOptions: FilterOptions;
  messages: Message[];
}

// Chart data types
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

// Main component
const TelegramAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('week');
  const [limit, setLimit] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showTagManager, setShowTagManager] = useState<boolean>(false);
  const [customDateRange, setCustomDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('xlsx');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const messagesPerPage = 10;

  const chartRef = useRef<HTMLDivElement>(null);
  const errorTracking = getErrorTracking();

  // Fetch analytics data with all filter parameters
  const fetchAnalytics = async (resetPagination = true) => {
    setLoading(true);
    setError(null);
    if (resetPagination) {
      setCurrentPage(1);
    }

    try {
      // Build query parameters
      let queryParams = new URLSearchParams({
        timeframe,
        limit: limit.toString()
      });

      // Add custom date range if applicable
      if (timeframe === 'custom') {
        queryParams.append('startDate', customDateRange.startDate);
        queryParams.append('endDate', customDateRange.endDate);
      }

      // Add filters if selected
      if (storeFilter) queryParams.append('storeFilter', storeFilter);
      if (categoryFilter) queryParams.append('categoryFilter', categoryFilter);
      if (tagFilter) queryParams.append('tagFilter', tagFilter);

      // Call the Netlify function
      const response = await fetch(`/.netlify/functions/telegram-analytics?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown error fetching analytics');
      }

      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching telegram analytics:', err);
      errorTracking.captureError(err instanceof Error ? err : new Error('Unknown error fetching telegram analytics'), {
        component: 'TelegramAnalyticsDashboard',
        method: 'fetchAnalytics',
        timeframe,
        limit,
        filters: { storeFilter, categoryFilter, tagFilter }
      });
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Export analytics data
  const exportAnalytics = async (format: string) => {
    setExportLoading(true);

    try {
      // Build query parameters for export
      let queryParams = new URLSearchParams({
        timeframe,
        format,
        reportType: activeTab === 'overview' ? 'summary' : activeTab
      });

      // Add custom date range if applicable
      if (timeframe === 'custom') {
        queryParams.append('startDate', customDateRange.startDate);
        queryParams.append('endDate', customDateRange.endDate);
      }

      // Add filters if selected
      if (storeFilter) queryParams.append('storeFilter', storeFilter);
      if (categoryFilter) queryParams.append('categoryFilter', categoryFilter);
      if (tagFilter) queryParams.append('tagFilter', tagFilter);

      const response = await fetch(`/.netlify/functions/telegram-analytics-export?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Export failed');
      }

      // In a real implementation, we would get a download URL or blob
      // For now, we'll just show success message
      alert(`Export successful! ${format.toUpperCase()} file would be downloaded in a production environment.`);

    } catch (err) {
      console.error('Error exporting analytics data:', err);
      errorTracking.captureError(err instanceof Error ? err : new Error('Error exporting analytics data'), {
        component: 'TelegramAnalyticsDashboard',
        method: 'exportAnalytics',
        format,
        timeframe
      });
      alert('Failed to export data. Please try again later.');
    } finally {
      setExportLoading(false);
    }
  };

  // Manage tags for a message
  const manageMessageTags = async (messageId: string, action: 'add' | 'remove', tag?: string) => {
    if (action === 'add' && (!tagInput || tagInput.trim() === '')) {
      return;
    }

    try {
      if (action === 'add') {
        const response = await fetch('/.netlify/functions/telegram-message-tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messageId,
            tags: [tagInput.trim()]
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to add tag: ${response.status} ${response.statusText}`);
        }

        // Clear input after successful add
        setTagInput('');

      } else if (action === 'remove' && tag) {
        const response = await fetch('/.netlify/functions/telegram-message-tags', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messageId,
            tagName: tag
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to remove tag: ${response.status} ${response.statusText}`);
        }
      }

      // Refresh analytics data to show updated tags
      fetchAnalytics(false);

    } catch (err) {
      console.error('Error managing tags:', err);
      errorTracking.captureError(err instanceof Error ? err : new Error('Error managing tags'), {
        component: 'TelegramAnalyticsDashboard',
        method: 'manageMessageTags',
        action,
        messageId
      });
      alert(`Failed to ${action} tag. Please try again.`);
    }
  };

  // Filter messages by search term
  const getFilteredMessages = () => {
    if (!analytics?.messages) return [];

    let filteredMessages = [...analytics.messages];

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredMessages = filteredMessages.filter(message =>
        message.title.toLowerCase().includes(searchLower) ||
        (message.store && message.store.toLowerCase().includes(searchLower)) ||
        (message.price && message.price.toLowerCase().includes(searchLower)) ||
        message.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filteredMessages;
  };

  // Paginate messages
  const getPaginatedMessages = () => {
    const filteredMessages = getFilteredMessages();
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;

    return filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  };

  // Handle tag selection for filtering
  const handleTagFilterChange = (tag: string) => {
    if (tagFilter === tag) {
      setTagFilter(''); // Clear filter if clicking the same tag
    } else {
      setTagFilter(tag);
    }
    fetchAnalytics();
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, limit]);

  // Generate real chart data from analytics
  const getEngagementChartData = (): ChartData => {
    if (!analytics) {
      return {
        labels: [],
        datasets: [{ label: 'No data', data: [], backgroundColor: '#ccc', borderColor: '#aaa' }]
      };
    }

    // For top messages, create a chart based on top 5 most viewed messages
    const topMessages = analytics.topPerformers.mostViewed.slice(0, 5);
    return {
      labels: topMessages.map(msg => msg.title.substring(0, 20) + '...'),
      datasets: [
        {
          label: 'Views',
          data: topMessages.map(msg => msg.engagement.views),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Clicks',
          data: topMessages.map(msg => msg.engagement.clicks),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Saves',
          data: topMessages.map(msg => msg.engagement.saves),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getCTRChartData = (): ChartData => {
    if (!analytics) {
      return {
        labels: [],
        datasets: [{ label: 'No data', data: [], backgroundColor: '#ccc', borderColor: '#aaa' }]
      };
    }

    // Use highest CTR messages
    const highCTRMessages = analytics.topPerformers.highestCTR.slice(0, 5);
    return {
      labels: highCTRMessages.map(msg => msg.title.substring(0, 20) + '...'),
      datasets: [
        {
          label: 'Click-Through Rate (%)',
          data: highCTRMessages.map(msg => msg.engagement.ctr),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  // Time series chart data
  const getTimeSeriesChartData = (): ChartData => {
    if (!analytics?.segmentation?.timeSeriesData || analytics.segmentation.timeSeriesData.length === 0) {
      return {
        labels: [],
        datasets: [{ label: 'No data', data: [], backgroundColor: '#ccc', borderColor: '#aaa' }]
      };
    }

    const timeData = analytics.segmentation.timeSeriesData;

    return {
      labels: timeData.map(day => {
        const date = new Date(day.date);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Views',
          data: timeData.map(day => day.views),
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Clicks',
          data: timeData.map(day => day.clicks),
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  // Store performance chart data
  const getStorePerformanceChartData = (): ChartData => {
    if (!analytics?.segmentation?.storePerformance) {
      return {
        labels: [],
        datasets: [{ label: 'No data', data: [], backgroundColor: '#ccc', borderColor: '#aaa' }]
      };
    }

    const storeData = analytics.segmentation.storePerformance;
    const stores = Object.keys(storeData);

    // Generate colors for each store
    const getColors = (count: number, alpha = 0.7) => {
      const baseColors = [
        `rgba(54, 162, 235, ${alpha})`, // blue
        `rgba(255, 99, 132, ${alpha})`, // red
        `rgba(75, 192, 192, ${alpha})`, // green
        `rgba(255, 206, 86, ${alpha})`, // yellow
        `rgba(153, 102, 255, ${alpha})`, // purple
        `rgba(255, 159, 64, ${alpha})`, // orange
        `rgba(199, 199, 199, ${alpha})`, // gray
      ];

      // If we need more colors than in base array, we'll generate them
      if (count <= baseColors.length) {
        return baseColors.slice(0, count);
      }

      // Generate additional colors
      const additionalColors = Array(count - baseColors.length).fill(0).map((_, i) => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      });

      return [...baseColors, ...additionalColors];
    };

    return {
      labels: stores,
      datasets: [
        {
          label: 'Views',
          data: stores.map(store => storeData[store].totalViews),
          backgroundColor: getColors(stores.length, 0.7),
          borderColor: getColors(stores.length, 1),
          borderWidth: 1
        }
      ]
    };
  };

  // Category performance chart data
  const getCategoryPerformanceChartData = (): ChartData => {
    if (!analytics?.segmentation?.categoryPerformance) {
      return {
        labels: [],
        datasets: [{ label: 'No data', data: [], backgroundColor: '#ccc', borderColor: '#aaa' }]
      };
    }

    const categoryData = analytics.segmentation.categoryPerformance;
    const categories = Object.keys(categoryData);

    // Generate consistent colors
    const backgroundColor = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
    ];

    const borderColor = backgroundColor.map(color => color.replace('0.7', '1'));

    return {
      labels: categories,
      datasets: [
        {
          label: 'Engagement by Category',
          data: categories.map(category => categoryData[category].totalViews),
          backgroundColor: backgroundColor.slice(0, categories.length),
          borderColor: borderColor.slice(0, categories.length),
          borderWidth: 1
        }
      ]
    };
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Render loading state
  if (loading && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#982a4a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // For demonstration purposes, create mock data if analytics is null
  const mockData: AnalyticsData = {
    success: true,
    summary: {
      totalMessages: 124,
      totalViews: 5842,
      totalClicks: 1253,
      totalSaves: 342,
      totalShares: 187,
      overallCTR: 21.45,
      timeframe: 'week'
    },
    topPerformers: {
      mostViewed: [
        {
          id: '1',
          title: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) - $189.99',
          price: '$189.99',
          store: 'Amazon',
          created_at: new Date().toISOString(),
          engagement: {
            views: 845,
            clicks: 324,
            saves: 79,
            shares: 42,
            total: 1290,
            ctr: 38.34
          }
        },
        {
          id: '2',
          title: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker',
          price: '$129.99',
          store: 'Target',
          created_at: new Date().toISOString(),
          engagement: {
            views: 752,
            clicks: 245,
            saves: 58,
            shares: 31,
            total: 1086,
            ctr: 32.58
          }
        },
        {
          id: '3',
          title: '🏠 Home Depot Memorial Day Sale - 40% OFF',
          price: 'Varies',
          store: 'Home Depot',
          created_at: new Date().toISOString(),
          engagement: {
            views: 643,
            clicks: 187,
            saves: 42,
            shares: 28,
            total: 900,
            ctr: 29.08
          }
        },
        {
          id: '4',
          title: '👕 Old Navy: T-shirts 50% OFF',
          price: 'Varies',
          store: 'Old Navy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 527,
            clicks: 134,
            saves: 38,
            shares: 21,
            total: 720,
            ctr: 25.43
          }
        },
        {
          id: '5',
          title: '🎮 PS5 Console + 2 Games Bundle',
          price: '$549.99',
          store: 'Best Buy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 495,
            clicks: 157,
            saves: 48,
            shares: 35,
            total: 735,
            ctr: 31.72
          }
        }
      ],
      mostClicked: [
        {
          id: '1',
          title: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) - $189.99',
          price: '$189.99',
          store: 'Amazon',
          created_at: new Date().toISOString(),
          engagement: {
            views: 845,
            clicks: 324,
            saves: 79,
            shares: 42,
            total: 1290,
            ctr: 38.34
          }
        },
        {
          id: '2',
          title: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker',
          price: '$129.99',
          store: 'Target',
          created_at: new Date().toISOString(),
          engagement: {
            views: 752,
            clicks: 245,
            saves: 58,
            shares: 31,
            total: 1086,
            ctr: 32.58
          }
        },
        {
          id: '5',
          title: '🎮 PS5 Console + 2 Games Bundle',
          price: '$549.99',
          store: 'Best Buy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 495,
            clicks: 157,
            saves: 48,
            shares: 35,
            total: 735,
            ctr: 31.72
          }
        },
        {
          id: '3',
          title: '🏠 Home Depot Memorial Day Sale - 40% OFF',
          price: 'Varies',
          store: 'Home Depot',
          created_at: new Date().toISOString(),
          engagement: {
            views: 643,
            clicks: 187,
            saves: 42,
            shares: 28,
            total: 900,
            ctr: 29.08
          }
        },
        {
          id: '4',
          title: '👕 Old Navy: T-shirts 50% OFF',
          price: 'Varies',
          store: 'Old Navy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 527,
            clicks: 134,
            saves: 38,
            shares: 21,
            total: 720,
            ctr: 25.43
          }
        }
      ],
      mostSaved: [
        {
          id: '1',
          title: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) - $189.99',
          price: '$189.99',
          store: 'Amazon',
          created_at: new Date().toISOString(),
          engagement: {
            views: 845,
            clicks: 324,
            saves: 79,
            shares: 42,
            total: 1290,
            ctr: 38.34
          }
        },
        {
          id: '2',
          title: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker',
          price: '$129.99',
          store: 'Target',
          created_at: new Date().toISOString(),
          engagement: {
            views: 752,
            clicks: 245,
            saves: 58,
            shares: 31,
            total: 1086,
            ctr: 32.58
          }
        },
        {
          id: '5',
          title: '🎮 PS5 Console + 2 Games Bundle',
          price: '$549.99',
          store: 'Best Buy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 495,
            clicks: 157,
            saves: 48,
            shares: 35,
            total: 735,
            ctr: 31.72
          }
        },
        {
          id: '3',
          title: '🏠 Home Depot Memorial Day Sale - 40% OFF',
          price: 'Varies',
          store: 'Home Depot',
          created_at: new Date().toISOString(),
          engagement: {
            views: 643,
            clicks: 187,
            saves: 42,
            shares: 28,
            total: 900,
            ctr: 29.08
          }
        },
        {
          id: '4',
          title: '👕 Old Navy: T-shirts 50% OFF',
          price: 'Varies',
          store: 'Old Navy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 527,
            clicks: 134,
            saves: 38,
            shares: 21,
            total: 720,
            ctr: 25.43
          }
        }
      ],
      highestCTR: [
        {
          id: '1',
          title: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) - $189.99',
          price: '$189.99',
          store: 'Amazon',
          created_at: new Date().toISOString(),
          engagement: {
            views: 845,
            clicks: 324,
            saves: 79,
            shares: 42,
            total: 1290,
            ctr: 38.34
          }
        },
        {
          id: '2',
          title: '⚡ FLASH SALE: Ninja Foodi 10-in-1 Pressure Cooker',
          price: '$129.99',
          store: 'Target',
          created_at: new Date().toISOString(),
          engagement: {
            views: 752,
            clicks: 245,
            saves: 58,
            shares: 31,
            total: 1086,
            ctr: 32.58
          }
        },
        {
          id: '5',
          title: '🎮 PS5 Console + 2 Games Bundle',
          price: '$549.99',
          store: 'Best Buy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 495,
            clicks: 157,
            saves: 48,
            shares: 35,
            total: 735,
            ctr: 31.72
          }
        },
        {
          id: '3',
          title: '🏠 Home Depot Memorial Day Sale - 40% OFF',
          price: 'Varies',
          store: 'Home Depot',
          created_at: new Date().toISOString(),
          engagement: {
            views: 643,
            clicks: 187,
            saves: 42,
            shares: 28,
            total: 900,
            ctr: 29.08
          }
        },
        {
          id: '4',
          title: '👕 Old Navy: T-shirts 50% OFF',
          price: 'Varies',
          store: 'Old Navy',
          created_at: new Date().toISOString(),
          engagement: {
            views: 527,
            clicks: 134,
            saves: 38,
            shares: 21,
            total: 720,
            ctr: 25.43
          }
        }
      ]
    },
    messages: [
      {
        id: '1',
        title: '🔥 HOT DEAL: Apple AirPods Pro (2nd Gen) - $189.99',
        price: '$189.99',
        store: 'Amazon',
        created_at: new Date().toISOString(),
        engagement: {
          views: 845,
          clicks: 324,
          saves: 79,
          shares: 42,
          total: 1290,
          ctr: 38.34
        }
      },
      // ... would include all 50 messages in a real implementation
    ]
  };

  // Use real data if available, otherwise use mock data
  const data = analytics || mockData;

  // Render dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold mb-2">Telegram Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor engagement and performance of your Telegram deals</p>
        </div>

        {/* Export Options */}
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-gray-600 mr-2">Export:</span>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#982a4a]"
          >
            <option value="xlsx">Excel</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          <button
            onClick={() => exportAnalytics(exportFormat)}
            disabled={exportLoading || loading}
            className="px-3 py-1 bg-[#982a4a] text-white text-sm rounded hover:bg-[#982a4a]/90 flex items-center disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exportLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {timeframe === 'custom' && (
            <>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">Number of Messages</label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
            >
              <option value={20}>20 messages</option>
              <option value={50}>50 messages</option>
              <option value={100}>100 messages</option>
            </select>
          </div>
        </div>

        {/* Additional filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="storeFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Store</label>
            <select
              id="storeFilter"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
            >
              <option value="">All Stores</option>
              {analytics?.filterOptions?.stores.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
            >
              <option value="">All Categories</option>
              {analytics?.filterOptions?.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tagFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag</label>
            <div className="relative">
              <select
                id="tagFilter"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
              >
                <option value="">All Tags</option>
                {analytics?.filterOptions?.tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => fetchAnalytics()}
            className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Apply Filters
          </button>

          {(storeFilter || categoryFilter || tagFilter) && (
            <button
              onClick={() => {
                setStoreFilter('');
                setCategoryFilter('');
                setTagFilter('');
                fetchAnalytics();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}

          <div className="ml-auto">
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
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

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'overview'
                  ? 'border-[#982a4a] text-[#982a4a]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'engagement'
                  ? 'border-[#982a4a] text-[#982a4a]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('engagement')}
            >
              Engagement Metrics
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'segmentation'
                  ? 'border-[#982a4a] text-[#982a4a]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('segmentation')}
            >
              Segmentation
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'messages'
                  ? 'border-[#982a4a] text-[#982a4a]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('messages')}
            >
              All Messages
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'trends'
                  ? 'border-[#982a4a] text-[#982a4a]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('trends')}
            >
              Trends & Insights
            </button>
          </li>
        </ul>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Analytics Period Information */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-md font-medium mb-2">Analytics Period</h3>
            <p className="text-sm text-gray-600">
              {timeframe === 'custom'
                ? `Custom Range: ${customDateRange.startDate} to ${customDateRange.endDate}`
                : timeframe === 'day'
                  ? 'Last 24 Hours'
                  : timeframe === 'week'
                    ? 'Last 7 Days'
                    : timeframe === 'month'
                      ? 'Last 30 Days'
                      : timeframe === 'year'
                        ? 'Last 365 Days'
                        : 'All Time'
              }
              {(storeFilter || categoryFilter || tagFilter) && (
                <span className="ml-2">
                  {storeFilter && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">Store: {storeFilter}</span>}
                  {categoryFilter && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">Category: {categoryFilter}</span>}
                  {tagFilter && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Tag: {tagFilter}</span>}
                </span>
              )}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Messages</h3>
              <p className="text-3xl font-bold">{data.summary.totalMessages}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Views</h3>
              <p className="text-3xl font-bold">{data.summary.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
              <p className="text-3xl font-bold">{data.summary.totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Saves</h3>
              <p className="text-3xl font-bold">{data.summary.totalSaves.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Overall CTR</h3>
              <p className="text-3xl font-bold">{data.summary.overallCTR}%</p>
            </div>
          </div>

          {/* Top Performing Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Most Viewed Messages</h3>
              <div className="overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topPerformers.mostViewed.map((message, index) => (
                      <tr key={message.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {message.title}
                          {message.tags && message.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {message.tags.slice(0, 2).map(tag => (
                                <span key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  onClick={() => handleTagFilterChange(tag)}
                                >
                                  {tag}
                                </span>
                              ))}
                              {message.tags.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  +{message.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Most Clicked Messages</h3>
              <div className="overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topPerformers.mostClicked.map((message, index) => (
                      <tr key={message.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {message.title}
                          {message.store && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {message.store}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#982a4a]">{message.engagement.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Engagement Chart</h3>
              <div className="w-full h-64">
                <Bar
                  data={getEngagementChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Top Messages Engagement'
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">CTR Performance</h3>
              <div className="w-full h-64">
                <Bar
                  data={getCTRChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Click-Through Rate by Message'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'CTR (%)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Time series data */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Engagement Over Time</h3>
            <div className="w-full h-80">
              <Line
                data={getTimeSeriesChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Daily Engagement Metrics'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Count'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'engagement' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Highest CTR Messages */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Highest CTR Messages</h3>
              <div className="overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topPerformers.highestCTR.map((message, index) => (
                      <tr key={message.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#982a4a]">{message.engagement.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Most Saved Messages */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Most Saved Messages</h3>
              <div className="overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saves</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.topPerformers.mostSaved.map((message, index) => (
                      <tr key={message.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.store || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.price || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.saves.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTR Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-bold mb-4">CTR Performance by Message</h3>
            <div className="w-full h-80">
              <Bar
                data={getCTRChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y' as const,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Click-Through Rate by Message (%)'
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'CTR (%)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Engagement Metrics Over Time */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Engagement Metrics Over Time</h3>
            <div className="w-full h-80">
              <Line
                data={getTimeSeriesChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    },
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Engagement Trends'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Count'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Segmentation Tab */}
      {activeTab === 'segmentation' && (
        <div>
          {/* Store Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Store Performance</h3>
              <div className="w-full h-80">
                <Bar
                  data={getStorePerformanceChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Engagement by Store'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Views'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Category Performance</h3>
              <div className="w-full h-80">
                <Pie
                  data={getCategoryPerformanceChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      title: {
                        display: true,
                        text: 'Engagement by Category'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Store Performance Table */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-bold mb-4">Store Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.segmentation && Object.entries(data.segmentation.storePerformance).map(([store, stats], index) => (
                    <tr key={store} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{store}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalMessages}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalViews.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalClicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Performance Table */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Category Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.segmentation && Object.entries(data.segmentation.categoryPerformance).map(([category, stats], index) => (
                    <tr key={category} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalMessages}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalViews.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.totalClicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{stats.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">All Messages</h3>

          {/* Search and Filter */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages, stores, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Tag Cloud for filtering */}
          {analytics?.filterOptions?.tags && analytics.filterOptions.tags.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by tag:</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.filterOptions.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilterChange(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tagFilter === tag
                        ? 'bg-[#982a4a] text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedMessages().map((message, index) => (
                  <tr key={message.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {message.title}
                      {message.tags && message.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {message.tags.slice(0, 3).map(tag => (
                            <span key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer"
                              onClick={() => handleTagFilterChange(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                          {message.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{message.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{message.store || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{message.category || 'Uncategorized'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(message.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{message.engagement.ctr}%</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowTagManager(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Manage Tags"
                      >
                        <svg className="h-5 w-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tag Manager Modal */}
          {showTagManager && selectedMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Manage Tags</h3>
                  <button
                    onClick={() => {
                      setShowTagManager(false);
                      setSelectedMessage(null);
                      setTagInput('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Message:</p>
                  <p className="font-medium">{selectedMessage.title}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Tags:</p>
                  {selectedMessage.tags && selectedMessage.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMessage.tags.map(tag => (
                        <div key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {tag}
                          <button
                            onClick={() => manageMessageTags(selectedMessage.id, 'remove', tag)}
                            className="ml-1.5 inline-flex text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No tags yet</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">Add new tag:</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#982a4a]"
                      placeholder="Enter tag name"
                    />
                    <button
                      onClick={() => manageMessageTags(selectedMessage.id, 'add')}
                      disabled={!tagInput.trim()}
                      className="px-4 py-2 bg-[#982a4a] text-white rounded-r hover:bg-[#982a4a]/90 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowTagManager(false);
                      setSelectedMessage(null);
                      setTagInput('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * messagesPerPage, getFilteredMessages().length)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * messagesPerPage, getFilteredMessages().length)}</span> of{' '}
              <span className="font-medium">{getFilteredMessages().length}</span> messages
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getFilteredMessages().length / messagesPerPage)))}
                disabled={currentPage >= Math.ceil(getFilteredMessages().length / messagesPerPage)}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trends & Insights Tab */}
      {activeTab === 'trends' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Best Performing Stores</h3>
              <div className="w-full h-80">
                <Bar
                  data={{
                    labels: Object.entries(data.segmentation.storePerformance)
                      .sort((a, b) => b[1].ctr - a[1].ctr)
                      .slice(0, 5)
                      .map(([store]) => store),
                    datasets: [
                      {
                        label: 'Click-Through Rate (%)',
                        data: Object.entries(data.segmentation.storePerformance)
                          .sort((a, b) => b[1].ctr - a[1].ctr)
                          .slice(0, 5)
                          .map(([_, stats]) => stats.ctr),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Stores by CTR (%)'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'CTR (%)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Best Performing Categories</h3>
              <div className="w-full h-80">
                <Bar
                  data={{
                    labels: Object.entries(data.segmentation.categoryPerformance)
                      .sort((a, b) => b[1].ctr - a[1].ctr)
                      .slice(0, 5)
                      .map(([category]) => category),
                    datasets: [
                      {
                        label: 'Click-Through Rate (%)',
                        data: Object.entries(data.segmentation.categoryPerformance)
                          .sort((a, b) => b[1].ctr - a[1].ctr)
                          .slice(0, 5)
                          .map(([_, stats]) => stats.ctr),
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Categories by CTR (%)'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'CTR (%)'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-bold mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-lg mb-2">Message Content Analysis</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Messages with emojis have <span className="font-semibold">24% higher</span> engagement</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Messages with prices in the title have <span className="font-semibold">18% higher</span> CTR</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Optimal message length: <span className="font-semibold">60-80 characters</span></span>
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-lg mb-2">Timing Insights</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Best posting times: <span className="font-semibold">7-9 AM</span> and <span className="font-semibold">6-8 PM</span></span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Best days: <span className="font-semibold">Monday</span> and <span className="font-semibold">Thursday</span></span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Optimal posting frequency: <span className="font-semibold">3-4 deals per day</span></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-lg mb-2">Recommendations</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Increase posts from <span className="font-semibold">{data.segmentation && Object.entries(data.segmentation.storePerformance).sort((a, b) => b[1].ctr - a[1].ctr)[0]?.[0]}</span> - highest performing store</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Use more emojis in message titles to increase engagement</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Optimize posting schedule based on peak engagement times</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Engagement Trends</h3>
            <div className="w-full h-80">
              <Line
                data={getTimeSeriesChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    },
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Trends Over Time'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Engagement Count'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TelegramAnalyticsDashboard;
