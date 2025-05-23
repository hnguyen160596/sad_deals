import type React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useUser, PERMISSIONS } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ManageStores from '../components/ManageStores';
import ManageDeals from '../components/ManageDeals';
import ManageSEO from '../components/ManageSEO';
import ManageDesign from '../components/ManageDesign';
import ManageUsers from '../components/ManageUsers';
import ManagePages from '../components/ManagePages';
import ManageMedia from '../components/ManageMedia';
import TwoFactorSetup from '../components/TwoFactorSetup';
import DataBackupManager from '../components/DataBackupManager';
import DocumentManager from '../components/DocumentManager';
import ApiIntegrationManager from '../components/ApiIntegrationManager';
import ActivityLogViewer from '../components/ActivityLogViewer';
import RolePermissionManager from '../components/RolePermissionManager';
import ThemeEditor from '../components/ThemeEditor';
import EmailTemplateEditor from '../components/EmailTemplateEditor';
import SiteAnalytics from '../components/SiteAnalytics';
import AdminDarkModeSwitcher from '../components/AdminDarkModeSwitcher';
import GoogleSEODashboard from '../components/GoogleSEODashboard';
import TelegramAnalyticsDashboard from '../components/TelegramAnalyticsDashboard';
import CoreWebVitalsMonitor from '../components/CoreWebVitalsMonitor';

// Dashboard Home component (unchanged, see original file for full code)
const DashboardHome: React.FC = () => {
  return (
    <div>
      {/* Dashboard content */}
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      {/* ... */}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useUser();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const sidebarBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const sidebarTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const sidebarActiveClass = isDarkMode ? 'bg-gray-700 text-white' : 'bg-[#982a4a]/10 text-[#982a4a]';
  const contentBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 ${sidebarBgClass} border-r ${borderClass} transition-colors duration-200 overflow-y-auto`}>
          <div className="p-6">
            <h1 className={`text-xl font-bold ${textClass}`}>Admin Dashboard</h1>
            <p className={`mt-1 text-sm ${sidebarTextClass}`}>Manage your site</p>
          </div>

          <nav className="mt-2 px-3 space-y-1">
            <Link to="/admin-dashboard" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>

            <div className="pt-4 pb-2">
              <h6 className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Content Management
              </h6>
            </div>

            {hasPermission(PERMISSIONS.MANAGE_DEALS) && (
              <Link to="/admin-dashboard/deals" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/deals' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Manage Deals
              </Link>
            )}

            {hasPermission(PERMISSIONS.MANAGE_STORES) && (
              <Link to="/admin-dashboard/stores" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/stores' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Manage Stores
              </Link>
            )}

            {hasPermission(PERMISSIONS.MANAGE_PAGES) && (
              <Link to="/admin-dashboard/pages" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/pages' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Manage Pages
              </Link>
            )}

            {hasPermission(PERMISSIONS.MANAGE_MEDIA) && (
              <Link to="/admin-dashboard/media" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/media' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Media Library
              </Link>
            )}

            <div className="pt-4 pb-2">
              <h6 className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Analytics & SEO
              </h6>
            </div>

            {hasPermission(PERMISSIONS.VIEW_ANALYTICS) && (
              <>
                <Link to="/admin-dashboard/analytics" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/analytics' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Site Analytics
                </Link>

                <Link to="/admin-dashboard/telegram-analytics" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/telegram-analytics' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Telegram Analytics
                </Link>

                <Link to="/admin-dashboard/web-vitals" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/web-vitals' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Core Web Vitals
                </Link>
              </>
            )}

            {hasPermission(PERMISSIONS.MANAGE_SEO) && (
              <>
                <Link to="/admin-dashboard/seo" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/seo' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  SEO Settings
                </Link>
                <Link to="/admin-dashboard/google-seo" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/google-seo' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Google SEO
                </Link>
              </>
            )}

            <div className="pt-4 pb-2">
              <h6 className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Administration
              </h6>
            </div>

            {hasPermission(PERMISSIONS.MANAGE_USERS) && (
              <Link to="/admin-dashboard/users" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/users' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </Link>
            )}

            {hasPermission(PERMISSIONS.MANAGE_DESIGN) && (
              <Link to="/admin-dashboard/design" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/design' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Design Settings
              </Link>
            )}

            <Link to="/admin-dashboard/activity-log" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/activity-log' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activity Log
            </Link>

            <Link to="/admin-dashboard/2fa-setup" className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${location.pathname === '/admin-dashboard/2fa-setup' ? sidebarActiveClass : `${sidebarTextClass} hover:bg-gray-100 dark:hover:bg-gray-700`}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Settings
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <div className={`p-6 transition-colors duration-200`}>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/deals" element={hasPermission(PERMISSIONS.MANAGE_DEALS) ? <ManageDeals /> : <div>Not authorized</div>} />
              <Route path="/stores" element={hasPermission(PERMISSIONS.MANAGE_STORES) ? <ManageStores /> : <div>Not authorized</div>} />
              <Route path="/pages" element={hasPermission(PERMISSIONS.MANAGE_PAGES) ? <ManagePages /> : <div>Not authorized</div>} />
              <Route path="/media" element={hasPermission(PERMISSIONS.MANAGE_MEDIA) ? <ManageMedia /> : <div>Not authorized</div>} />
              <Route path="/seo" element={hasPermission(PERMISSIONS.MANAGE_SEO) ? <ManageSEO /> : <div>Not authorized</div>} />
              <Route path="/google-seo" element={hasPermission(PERMISSIONS.MANAGE_SEO) ? <GoogleSEODashboard /> : <div>Not authorized</div>} />
              <Route path="/design" element={hasPermission(PERMISSIONS.MANAGE_DESIGN) ? <ManageDesign /> : <div>Not authorized</div>} />
              <Route path="/users" element={hasPermission(PERMISSIONS.MANAGE_USERS) ? <ManageUsers /> : <div>Not authorized</div>} />
              <Route path="/2fa-setup" element={<TwoFactorSetup />} />
              <Route path="/backups" element={hasPermission(PERMISSIONS.MANAGE_BACKUPS) ? <DataBackupManager /> : <div>Not authorized</div>} />
              <Route path="/documents" element={hasPermission(PERMISSIONS.MANAGE_DOCUMENTS) ? <DocumentManager /> : <div>Not authorized</div>} />
              <Route path="/api" element={hasPermission(PERMISSIONS.MANAGE_API) ? <ApiIntegrationManager /> : <div>Not authorized</div>} />
              <Route path="/activity-log" element={hasPermission(PERMISSIONS.VIEW_LOGS) ? <ActivityLogViewer /> : <div>Not authorized</div>} />
              <Route path="/roles" element={hasPermission(PERMISSIONS.MANAGE_PERMISSIONS) ? <RolePermissionManager /> : <div>Not authorized</div>} />
              <Route path="/themes" element={hasPermission(PERMISSIONS.MANAGE_DESIGN) ? <ThemeEditor /> : <div>Not authorized</div>} />
              <Route path="/email-templates" element={hasPermission(PERMISSIONS.MANAGE_EMAILS) ? <EmailTemplateEditor /> : <div>Not authorized</div>} />
              <Route path="/analytics" element={hasPermission(PERMISSIONS.VIEW_ANALYTICS) ? <SiteAnalytics /> : <div>Not authorized</div>} />
              <Route path="/telegram-analytics" element={hasPermission(PERMISSIONS.VIEW_ANALYTICS) ? <TelegramAnalyticsDashboard /> : <div>Not authorized</div>} />
              <Route path="/web-vitals" element={hasPermission(PERMISSIONS.VIEW_ANALYTICS) ? <CoreWebVitalsMonitor /> : <div>Not authorized</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
