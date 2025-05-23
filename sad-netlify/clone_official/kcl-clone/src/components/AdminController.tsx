import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Switch } from './ui/Switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';

/**
 * AdminController - A powerful central control panel for admin users
 * This component provides a unified interface for system-wide controls,
 * real-time monitoring, and quick access to critical admin functions.
 */
interface SystemMetric {
  name: string;
  value: number | string;
  change: number;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: string;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  permission?: string;
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  source: string;
  resolved: boolean;
}

const AdminController: React.FC = () => {
  const { currentUser, hasPermission } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State for system metrics
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'Active Users', value: 284, change: 12.3, status: 'success', icon: '👥' },
    { name: 'Server Load', value: '24%', change: -3.2, status: 'success', icon: '🖥️' },
    { name: 'Database Size', value: '1.23 GB', change: 5.7, status: 'warning', icon: '💾' },
    { name: 'Memory Usage', value: '42%', change: 8.1, status: 'warning', icon: '📊' },
    { name: 'Disk Space', value: '67%', change: 2.4, status: 'success', icon: '💿' },
    { name: 'API Requests (24h)', value: 12587, change: 18.5, status: 'success', icon: '🔄' },
  ]);

  // State for system alerts
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: 'alert1',
      level: 'warning',
      message: 'Database backup delayed by more than 6 hours',
      timestamp: new Date(Date.now() - 3600000 * 2),
      source: 'Backup System',
      resolved: false
    },
    {
      id: 'alert2',
      level: 'info',
      message: 'New system update available (v2.5.3)',
      timestamp: new Date(Date.now() - 3600000 * 5),
      source: 'Update Manager',
      resolved: false
    },
    {
      id: 'alert3',
      level: 'critical',
      message: 'Unusual traffic detected - possible DDoS attempt',
      timestamp: new Date(Date.now() - 3600000 * 1),
      source: 'Security Monitor',
      resolved: true
    }
  ]);

  // Define quick actions for admin users
  const quickActions: QuickAction[] = [
    {
      id: 'clear-cache',
      name: 'Clear System Cache',
      description: 'Purge all cache to refresh system data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('System cache cleared successfully', 'success');
        }, 1000);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
      permission: 'SYSTEM_SETTINGS'
    },
    {
      id: 'reindex-search',
      name: 'Rebuild Search Index',
      description: 'Recreate search indexes for optimal performance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('Search indexes rebuilt successfully', 'success');
        }, 2000);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
      permission: 'SYSTEM_SETTINGS'
    },
    {
      id: 'maintenance-mode',
      name: 'Maintenance Mode',
      description: 'Toggle maintenance mode for all users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('Maintenance mode toggled', 'info');
        }, 500);
      },
      color: 'bg-amber-500 hover:bg-amber-600',
      permission: 'SYSTEM_SETTINGS'
    },
    {
      id: 'backup-now',
      name: 'Create Backup',
      description: 'Initiate immediate system backup',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('System backup initiated', 'success');
        }, 1500);
      },
      color: 'bg-green-500 hover:bg-green-600',
      permission: 'SYSTEM_SETTINGS'
    },
    {
      id: 'security-scan',
      name: 'Security Scan',
      description: 'Run comprehensive security analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('Security scan completed - No issues found', 'success');
        }, 3000);
      },
      color: 'bg-red-500 hover:bg-red-600',
      permission: 'SYSTEM_SETTINGS'
    },
    {
      id: 'optimize-db',
      name: 'Optimize Database',
      description: 'Run database optimization routines',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      action: () => {
        setTimeout(() => {
          showToast('Database optimization complete', 'success');
        }, 2500);
      },
      color: 'bg-indigo-500 hover:bg-indigo-600',
      permission: 'SYSTEM_SETTINGS'
    }
  ];

  // System status indicators
  const [systemStatus, setSystemStatus] = useState({
    apiStatus: 'operational',
    databaseStatus: 'operational',
    storageStatus: 'operational',
    cacheStatus: 'degraded',
    searchStatus: 'operational',
    maintenanceMode: false
  });

  // Toggle maintenance mode
  const toggleMaintenanceMode = () => {
    setSystemStatus(prev => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode
    }));

    showToast(
      systemStatus.maintenanceMode
        ? 'Maintenance mode disabled'
        : 'Maintenance mode enabled - Users will see maintenance page',
      systemStatus.maintenanceMode ? 'info' : 'warning'
    );
  };

  // Mark an alert as resolved
  const resolveAlert = (alertId: string) => {
    setSystemAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    showToast('Alert marked as resolved', 'success');
  };

  // Navigate to different admin sections
  const navigateTo = (path: string) => {
    navigate(`/admin/${path}`);
  };

  // Simulate metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          change: Math.round((metric.change + (Math.random() * 2 - 1)) * 10) / 10,
          status: Math.random() > 0.9
            ? (Math.random() > 0.5 ? 'warning' : 'success')
            : metric.status
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Center</h1>
          <p className="text-gray-500">Welcome, {currentUser?.displayName} - System overview and controls</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={systemStatus.maintenanceMode ? "danger" : "outline"}
            onClick={toggleMaintenanceMode}
          >
            {systemStatus.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
          </Button>
          <Button onClick={() => navigateTo('activity')}>
            View Activity Logs
          </Button>
        </div>
      </div>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-2xl">{metric.icon}</div>
                  <div className={`text-xs font-medium ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  } flex items-center`}>
                    {metric.change > 0 ? (
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
                <p className="text-xl font-semibold mt-1">{metric.value}</p>
                <div className="mt-2">
                  <div
                    className={`h-1 rounded-full ${
                      metric.status === 'success' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      metric.status === 'danger' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <StatusIndicator
              name="API Services"
              status={systemStatus.apiStatus}
            />
            <StatusIndicator
              name="Database"
              status={systemStatus.databaseStatus}
            />
            <StatusIndicator
              name="File Storage"
              status={systemStatus.storageStatus}
            />
            <StatusIndicator
              name="Cache System"
              status={systemStatus.cacheStatus}
            />
            <StatusIndicator
              name="Search Index"
              status={systemStatus.searchStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions
                  .filter(action => !action.permission || hasPermission(action.permission))
                  .map(action => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`${action.color} text-white rounded-lg p-4 text-left transition-transform transform hover:scale-105 hover:shadow-lg`}
                    >
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                          {action.icon}
                        </div>
                        <h3 className="font-medium">{action.name}</h3>
                      </div>
                      <p className="text-sm text-white/80">{action.description}</p>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts
                  .filter(alert => !alert.resolved)
                  .map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg ${
                        alert.level === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                        alert.level === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                        'bg-blue-50 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex">
                          <div className={`${
                            alert.level === 'critical' ? 'text-red-600' :
                            alert.level === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          } font-medium`}>
                            {alert.level === 'critical' ? 'Critical' :
                             alert.level === 'warning' ? 'Warning' : 'Info'}
                          </div>
                          <span className="mx-2 text-gray-500">•</span>
                          <div className="text-gray-500">{alert.source}</div>
                        </div>
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Resolve
                        </button>
                      </div>
                      <p className="mt-2">{alert.message}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}

                {systemAlerts.filter(alert => !alert.resolved).length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No active alerts - All systems operational</p>
                  </div>
                )}
              </div>

              {systemAlerts.some(alert => alert.resolved) && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Recently Resolved</h4>
                  <div className="space-y-2">
                    {systemAlerts
                      .filter(alert => alert.resolved)
                      .slice(0, 2)
                      .map(alert => (
                        <div key={alert.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between">
                            <div className="text-sm font-medium text-gray-600">{alert.message}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(alert.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access & Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content Management</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="system">System Management</TabsTrigger>
              <TabsTrigger value="design">Design & Themes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NavigationCard
                  name="Manage Deals"
                  icon="🛍️"
                  description="Create, edit, publish deals"
                  onClick={() => navigateTo('deals')}
                />
                <NavigationCard
                  name="Today's Deals"
                  icon="🔥"
                  description="Featured and daily deals"
                  onClick={() => navigateTo('today')}
                />
                <NavigationCard
                  name="Stores"
                  icon="🏬"
                  description="Manage store pages & listings"
                  onClick={() => navigateTo('stores')}
                />
                <NavigationCard
                  name="Pages"
                  icon="📄"
                  description="Static pages and content"
                  onClick={() => navigateTo('pages')}
                />
                <NavigationCard
                  name="Media Library"
                  icon="🖼️"
                  description="Images, videos, files"
                  onClick={() => navigateTo('media')}
                />
                <NavigationCard
                  name="Documents"
                  icon="📑"
                  description="PDFs and other documents"
                  onClick={() => navigateTo('documents')}
                />
                <NavigationCard
                  name="Email Templates"
                  icon="📧"
                  description="Design email communications"
                  onClick={() => navigateTo('emails')}
                />
                <NavigationCard
                  name="SEO & Metadata"
                  icon="🔍"
                  description="Search optimization tools"
                  onClick={() => navigateTo('seo')}
                />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NavigationCard
                  name="User Management"
                  icon="👥"
                  description="Manage user accounts"
                  onClick={() => navigateTo('users')}
                />
                <NavigationCard
                  name="Roles & Permissions"
                  icon="🔐"
                  description="Access control management"
                  onClick={() => navigateTo('roles')}
                />
                <NavigationCard
                  name="Chat Moderation"
                  icon="💬"
                  description="Moderate user communications"
                  onClick={() => navigateTo('chat')}
                />
                <NavigationCard
                  name="User Activity"
                  icon="📊"
                  description="Track user engagement"
                  onClick={() => navigateTo('analytics')}
                />
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NavigationCard
                  name="API Integrations"
                  icon="🔌"
                  description="External service connections"
                  onClick={() => navigateTo('integrations')}
                />
                <NavigationCard
                  name="Backup & Export"
                  icon="💾"
                  description="Data backup management"
                  onClick={() => navigateTo('backup')}
                />
                <NavigationCard
                  name="Activity Logs"
                  icon="📜"
                  description="System audit trail"
                  onClick={() => navigateTo('activity')}
                />
                <NavigationCard
                  name="System Settings"
                  icon="⚙️"
                  description="Global configuration"
                  onClick={() => navigateTo('settings')}
                />
              </div>
            </TabsContent>

            <TabsContent value="design">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NavigationCard
                  name="Site Design"
                  icon="🎨"
                  description="Layout and UI settings"
                  onClick={() => navigateTo('design')}
                />
                <NavigationCard
                  name="Theme Editor"
                  icon="🎭"
                  description="Colors, fonts, and styles"
                  onClick={() => navigateTo('theme')}
                />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NavigationCard
                  name="Site Analytics"
                  icon="📈"
                  description="Traffic and visitor data"
                  onClick={() => navigateTo('analytics')}
                />
                <NavigationCard
                  name="Deal Performance"
                  icon="💰"
                  description="Conversion and revenue"
                  onClick={() => navigateTo('analytics?tab=deals')}
                />
                <NavigationCard
                  name="User Demographics"
                  icon="👤"
                  description="User profile analysis"
                  onClick={() => navigateTo('analytics?tab=audience')}
                />
                <NavigationCard
                  name="Export Reports"
                  icon="📊"
                  description="Generate data exports"
                  onClick={() => navigateTo('analytics?report=export')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Status indicator component
interface StatusIndicatorProps {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ name, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'outage': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'outage': return 'Outage';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border shadow-sm">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-3`}></div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{getStatusText()}</p>
      </div>
    </div>
  );
};

// Navigation card component
interface NavigationCardProps {
  name: string;
  icon: string;
  description: string;
  onClick: () => void;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ name, icon, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
};

export default AdminController;
