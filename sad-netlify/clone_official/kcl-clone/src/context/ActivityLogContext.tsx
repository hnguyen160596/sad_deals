import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';

// Activity log entry type
export interface ActivityLogEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: Date;
  ip?: string;
}

// Activity log filter type
export interface ActivityLogFilter {
  userId?: string;
  actionType?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

interface ActivityLogContextValue {
  logs: ActivityLogEntry[];
  addLogEntry: (entry: Omit<ActivityLogEntry, 'id' | 'userId' | 'username' | 'timestamp' | 'ip'>) => void;
  getFilteredLogs: (filter: ActivityLogFilter) => ActivityLogEntry[];
  clearLogs: () => void;
  exportLogs: (format: 'csv' | 'json') => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | undefined>(undefined);

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within an ActivityLogProvider');
  }
  return context;
};

// Local storage key for logs
const LOGS_STORAGE_KEY = 'admin_activity_logs';

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  // Load logs from localStorage on mount
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
      if (storedLogs) {
        // Parse stored logs and convert timestamp strings to Date objects
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Failed to load activity logs from localStorage:', error);
    }
  }, []);

  // Save logs to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save activity logs to localStorage:', error);
    }
  }, [logs]);

  // Add a new log entry
  const addLogEntry = useCallback(
    (entry: Omit<ActivityLogEntry, 'id' | 'userId' | 'username' | 'timestamp' | 'ip'>) => {
      if (!currentUser) {
        console.warn('Cannot log activity: No user is logged in');
        return;
      }

      const newEntry: ActivityLogEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        userId: currentUser.id,
        username: currentUser.displayName,
        timestamp: new Date(),
        ip: '127.0.0.1', // In a real app, this would be the actual IP
        ...entry,
      };

      setLogs((prevLogs) => [newEntry, ...prevLogs]);
    },
    [currentUser]
  );

  // Get filtered logs based on criteria
  const getFilteredLogs = useCallback(
    (filter: ActivityLogFilter) => {
      let filteredLogs = [...logs];

      if (filter.userId) {
        filteredLogs = filteredLogs.filter((log) => log.userId === filter.userId);
      }

      if (filter.actionType) {
        filteredLogs = filteredLogs.filter((log) => log.action === filter.actionType);
      }

      if (filter.targetType) {
        filteredLogs = filteredLogs.filter((log) => log.targetType === filter.targetType);
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter((log) => log.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter((log) => log.timestamp <= endDate);
      }

      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(query) ||
            log.targetType.toLowerCase().includes(query) ||
            (log.targetName && log.targetName.toLowerCase().includes(query)) ||
            (log.details && log.details.toLowerCase().includes(query)) ||
            log.username.toLowerCase().includes(query)
        );
      }

      return filteredLogs;
    },
    [logs]
  );

  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Export logs in CSV or JSON format
  const exportLogs = useCallback(
    (format: 'csv' | 'json') => {
      if (logs.length === 0) {
        console.warn('No logs to export');
        return;
      }

      let exportData: string;
      let fileName: string;
      let mimeType: string;

      if (format === 'csv') {
        // Create CSV header
        const header = 'ID,User ID,Username,Action,Target Type,Target ID,Target Name,Details,Timestamp,IP\n';

        // Map logs to CSV rows
        const rows = logs.map((log) => {
          return [
            log.id,
            log.userId,
            `"${log.username.replace(/"/g, '""')}"`,
            `"${log.action.replace(/"/g, '""')}"`,
            `"${log.targetType.replace(/"/g, '""')}"`,
            log.targetId ? `"${log.targetId.replace(/"/g, '""')}"` : '',
            log.targetName ? `"${log.targetName.replace(/"/g, '""')}"` : '',
            log.details ? `"${log.details.replace(/"/g, '""')}"` : '',
            log.timestamp.toISOString(),
            log.ip || ''
          ].join(',');
        }).join('\n');

        exportData = header + rows;
        fileName = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON format
        exportData = JSON.stringify(logs, null, 2);
        fileName = `activity_logs_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create a download link and trigger the download
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [logs]
  );

  const value = {
    logs,
    addLogEntry,
    getFilteredLogs,
    clearLogs,
    exportLogs,
  };

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
};
