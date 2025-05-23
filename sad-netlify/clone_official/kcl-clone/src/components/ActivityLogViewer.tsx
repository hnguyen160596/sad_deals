import React, { useState, useEffect } from 'react';
import { useActivityLog, ActivityLogEntry, ActivityLogFilter } from '../context/ActivityLogContext';
import { useUser } from '../context/UserContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';

// Define action types for filtering
const ACTION_TYPES = [
  'All Actions',
  'Create',
  'Update',
  'Delete',
  'Login',
  'Logout',
  'Publish',
  'Unpublish',
  'Import',
  'Export',
  'Settings Change',
];

// Define target types for filtering
const TARGET_TYPES = [
  'All Types',
  'Deal',
  'Store',
  'User',
  'Page',
  'Media',
  'Setting',
  'API Integration',
  'Document',
  'Data Backup',
];

const ActivityLogViewer: React.FC = () => {
  const { logs, getFilteredLogs, clearLogs, exportLogs } = useActivityLog();
  const { allUsers } = useUser();

  // State for filters
  const [filter, setFilter] = useState<ActivityLogFilter>({});
  const [filteredLogs, setFilteredLogs] = useState<ActivityLogEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('All Actions');
  const [selectedTarget, setSelectedTarget] = useState<string>('All Types');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  // Update filtered logs when filters change
  useEffect(() => {
    const newFilter: ActivityLogFilter = {};

    if (selectedUser !== 'all') {
      newFilter.userId = selectedUser;
    }

    if (selectedAction !== 'All Actions') {
      newFilter.actionType = selectedAction;
    }

    if (selectedTarget !== 'All Types') {
      newFilter.targetType = selectedTarget;
    }

    if (startDate) {
      newFilter.startDate = new Date(startDate);
    }

    if (endDate) {
      newFilter.endDate = new Date(endDate);
    }

    if (searchQuery) {
      newFilter.searchQuery = searchQuery;
    }

    setFilter(newFilter);
    setFilteredLogs(getFilteredLogs(newFilter));
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    selectedUser,
    selectedAction,
    selectedTarget,
    startDate,
    endDate,
    searchQuery,
    getFilteredLogs,
  ]);

  // Calculate pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handleClearFilters = () => {
    setSelectedUser('all');
    setSelectedAction('All Actions');
    setSelectedTarget('All Types');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
      clearLogs();
    }
  };

  const handleExportLogs = (format: 'csv' | 'json') => {
    exportLogs(format);
  };

  // Render action icon based on the action type
  const renderActionIcon = (action: string) => {
    switch (action) {
      case 'Create':
        return <span className="text-green-500 text-xl">+</span>;
      case 'Update':
        return <span className="text-blue-500 text-xl">✎</span>;
      case 'Delete':
        return <span className="text-red-500 text-xl">×</span>;
      case 'Login':
        return <span className="text-purple-500 text-xl">→</span>;
      case 'Logout':
        return <span className="text-purple-500 text-xl">←</span>;
      case 'Publish':
        return <span className="text-green-500 text-xl">↑</span>;
      case 'Unpublish':
        return <span className="text-yellow-500 text-xl">↓</span>;
      default:
        return <span className="text-gray-500 text-xl">•</span>;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Activity Log</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportLogs('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportLogs('json')}
              >
                Export JSON
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearLogs}
              >
                Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
            <h3 className="font-medium text-gray-700">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="all">All Users</option>
                  {allUsers && allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  {ACTION_TYPES.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Type
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                >
                  {TARGET_TYPES.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  placeholder="Search in logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">{renderActionIcon(log.action)}</div>
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.targetType}
                          {log.targetName && <span> - {log.targetName}</span>}
                        </div>
                        {log.targetId && (
                          <div className="text-xs text-gray-500">ID: {log.targetId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.details || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogViewer;
