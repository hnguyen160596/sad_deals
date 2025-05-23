import type React from 'react';
import { createContext, useState, useContext } from 'react';
import { useUser } from './UserContext';
import { useMedia } from './MediaContext';

// Define the types of content that can be backed up
export enum ContentType {
  PAGES = 'pages',
  USERS = 'users',
  DEALS = 'deals',
  STORES = 'stores',
  MEDIA = 'media',
  SETTINGS = 'settings',
  ALL = 'all'
}

// Define export formats
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml'
}

// Define a type for backup jobs
export interface BackupJob {
  id: string;
  createdAt: string;
  completedAt?: string;
  type: 'export' | 'import';
  contentTypes: ContentType[];
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName?: string;
  fileSize?: number;
  error?: string;
  createdBy: string; // user ID
  metadata: Record<string, any>;
}

// Define an interface for backup settings
export interface BackupSettings {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  autoBackupTime: string; // HH:MM format
  autoBackupRetention: number; // number of days to keep backups
  autoBackupContentTypes: ContentType[];
  autoBackupFormat: ExportFormat;
  backupDirectory: string;
}

// Define the context interface
interface DataBackupContextType {
  // State
  jobs: BackupJob[];
  settings: BackupSettings;
  isExporting: boolean;
  isImporting: boolean;

  // Backup history
  getBackupJobs: () => BackupJob[];
  getBackupJob: (id: string) => BackupJob | undefined;
  deleteBackupJob: (id: string) => void;

  // Export functionality
  exportData: (contentTypes: ContentType[], format: ExportFormat) => Promise<string>;

  // Import functionality
  importData: (file: File) => Promise<{ success: boolean; message: string }>;
  validateImportFile: (file: File) => Promise<{ valid: boolean; contentTypes: ContentType[]; records: number }>;

  // Settings
  updateBackupSettings: (settings: Partial<BackupSettings>) => void;
}

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create the context with default values
const DataBackupContext = createContext<DataBackupContextType>({
  jobs: [],
  settings: {
    autoBackupEnabled: false,
    autoBackupFrequency: 'weekly',
    autoBackupTime: '03:00',
    autoBackupRetention: 30,
    autoBackupContentTypes: [ContentType.ALL],
    autoBackupFormat: ExportFormat.JSON,
    backupDirectory: '/backups'
  },
  isExporting: false,
  isImporting: false,

  getBackupJobs: () => [],
  getBackupJob: () => undefined,
  deleteBackupJob: () => {},

  exportData: async () => '',

  importData: async () => ({ success: false, message: '' }),
  validateImportFile: async () => ({ valid: false, contentTypes: [], records: 0 }),

  updateBackupSettings: () => {}
});

// Provider component
export const DataBackupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, currentUser } = useUser();
  const { mediaItems, folders } = useMedia();

  const [jobs, setJobs] = useState<BackupJob[]>(() => {
    const savedJobs = localStorage.getItem('backupJobs');
    if (savedJobs) {
      return JSON.parse(savedJobs);
    }

    // Return some sample backup jobs for demo
    return [
      {
        id: '1',
        createdAt: new Date('2025-05-15T10:30:00').toISOString(),
        completedAt: new Date('2025-05-15T10:32:00').toISOString(),
        type: 'export',
        contentTypes: [ContentType.ALL],
        format: ExportFormat.JSON,
        status: 'completed',
        fileName: 'full_backup_20250515.json',
        fileSize: 1024 * 1024 * 2.3, // 2.3 MB
        createdBy: '1', // admin user
        metadata: {
          records: {
            pages: 35,
            users: 42,
            deals: 273,
            stores: 87,
            media: 156,
            settings: 1
          }
        }
      },
      {
        id: '2',
        createdAt: new Date('2025-05-10T08:15:00').toISOString(),
        completedAt: new Date('2025-05-10T08:16:30').toISOString(),
        type: 'export',
        contentTypes: [ContentType.USERS, ContentType.SETTINGS],
        format: ExportFormat.JSON,
        status: 'completed',
        fileName: 'users_settings_backup_20250510.json',
        fileSize: 1024 * 512, // 512 KB
        createdBy: '1', // admin user
        metadata: {
          records: {
            users: 42,
            settings: 1
          }
        }
      },
      {
        id: '3',
        createdAt: new Date('2025-05-01T14:20:00').toISOString(),
        completedAt: new Date('2025-05-01T14:23:00').toISOString(),
        type: 'import',
        contentTypes: [ContentType.DEALS, ContentType.STORES],
        format: ExportFormat.JSON,
        status: 'completed',
        fileName: 'deals_stores_import_20250501.json',
        fileSize: 1024 * 1024, // 1 MB
        createdBy: '1', // admin user
        metadata: {
          imported: {
            deals: 50,
            stores: 12
          },
          skipped: 2,
          errors: 0
        }
      }
    ];
  });

  const [settings, setSettings] = useState<BackupSettings>(() => {
    const savedSettings = localStorage.getItem('backupSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }

    // Return default settings
    return {
      autoBackupEnabled: false,
      autoBackupFrequency: 'weekly',
      autoBackupTime: '03:00',
      autoBackupRetention: 30,
      autoBackupContentTypes: [ContentType.ALL],
      autoBackupFormat: ExportFormat.JSON,
      backupDirectory: '/backups'
    };
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Persist jobs to localStorage when they change
  useState(() => {
    localStorage.setItem('backupJobs', JSON.stringify(jobs));
  });

  // Persist settings to localStorage when they change
  useState(() => {
    localStorage.setItem('backupSettings', JSON.stringify(settings));
  });

  // Get all backup jobs
  const getBackupJobs = () => jobs;

  // Get a specific backup job by ID
  const getBackupJob = (id: string) => jobs.find(job => job.id === id);

  // Delete a backup job
  const deleteBackupJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  // Export data
  const exportData = async (contentTypes: ContentType[], format: ExportFormat): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to export data');
    }

    // Create a new job
    const newJob: BackupJob = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      type: 'export',
      contentTypes,
      format,
      status: 'processing',
      createdBy: currentUser.id,
      metadata: {}
    };

    setJobs([...jobs, newJob]);
    setIsExporting(true);

    try {
      // Prepare data to export based on content types
      const exportData: Record<string, any> = {};
      let recordCounts: Record<string, number> = {};

      // If ALL is selected, export everything
      if (contentTypes.includes(ContentType.ALL)) {
        contentTypes = Object.values(ContentType).filter(type => type !== ContentType.ALL);
      }

      // Gather data for each content type
      for (const contentType of contentTypes) {
        switch (contentType) {
          case ContentType.USERS:
            exportData.users = users;
            recordCounts.users = users.length;
            break;
          case ContentType.MEDIA:
            exportData.media = {
              items: mediaItems,
              folders: folders
            };
            recordCounts.media = mediaItems.length;
            break;
          case ContentType.SETTINGS:
            exportData.settings = {
              backup: settings,
              // Other settings would be included here
            };
            recordCounts.settings = 1;
            break;
          // Add other content types as needed
          case ContentType.PAGES:
            // Mock data for demo
            exportData.pages = [];
            recordCounts.pages = 0;
            break;
          case ContentType.DEALS:
            // Mock data for demo
            exportData.deals = [];
            recordCounts.deals = 0;
            break;
          case ContentType.STORES:
            // Mock data for demo
            exportData.stores = [];
            recordCounts.stores = 0;
            break;
          default:
            break;
        }
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Format the data according to the selected format
      let formattedData: string = '';
      let fileName: string = '';
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);

      switch (format) {
        case ExportFormat.JSON:
          formattedData = JSON.stringify(exportData, null, 2);
          fileName = `backup_${timestamp}.json`;
          break;
        case ExportFormat.CSV:
          // In a real implementation, you would convert the data to CSV format
          // For demo purposes, we'll just stringify the JSON
          formattedData = JSON.stringify(exportData);
          fileName = `backup_${timestamp}.csv`;
          break;
        case ExportFormat.XML:
          // In a real implementation, you would convert the data to XML format
          // For demo purposes, we'll just stringify the JSON
          formattedData = `<export>${JSON.stringify(exportData)}</export>`;
          fileName = `backup_${timestamp}.xml`;
          break;
      }

      // Update the job with completion info
      const updatedJob: BackupJob = {
        ...newJob,
        completedAt: new Date().toISOString(),
        status: 'completed',
        fileName,
        fileSize: new Blob([formattedData]).size,
        metadata: {
          records: recordCounts
        }
      };

      setJobs(jobs.map(job => job.id === newJob.id ? updatedJob : job));

      return formattedData;
    } catch (error) {
      // Update the job with error info
      const updatedJob: BackupJob = {
        ...newJob,
        completedAt: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setJobs(jobs.map(job => job.id === newJob.id ? updatedJob : job));

      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Validate an import file
  const validateImportFile = async (file: File): Promise<{ valid: boolean; contentTypes: ContentType[]; records: number }> => {
    try {
      // Read the file
      const text = await file.text();

      // Attempt to parse as JSON (for demo purposes, we only support JSON imports)
      const data = JSON.parse(text);

      // Determine content types in the file
      const contentTypes: ContentType[] = [];
      let totalRecords = 0;

      if (data.users && Array.isArray(data.users)) {
        contentTypes.push(ContentType.USERS);
        totalRecords += data.users.length;
      }

      if (data.media && data.media.items && Array.isArray(data.media.items)) {
        contentTypes.push(ContentType.MEDIA);
        totalRecords += data.media.items.length;
      }

      if (data.settings) {
        contentTypes.push(ContentType.SETTINGS);
        totalRecords += 1;
      }

      if (data.pages && Array.isArray(data.pages)) {
        contentTypes.push(ContentType.PAGES);
        totalRecords += data.pages.length;
      }

      if (data.deals && Array.isArray(data.deals)) {
        contentTypes.push(ContentType.DEALS);
        totalRecords += data.deals.length;
      }

      if (data.stores && Array.isArray(data.stores)) {
        contentTypes.push(ContentType.STORES);
        totalRecords += data.stores.length;
      }

      return {
        valid: contentTypes.length > 0,
        contentTypes,
        records: totalRecords
      };
    } catch (error) {
      console.error('Error validating import file:', error);
      return {
        valid: false,
        contentTypes: [],
        records: 0
      };
    }
  };

  // Import data
  const importData = async (file: File): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to import data' };
    }

    // Create a new job
    const newJob: BackupJob = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      type: 'import',
      contentTypes: [],
      format: file.name.endsWith('.json') ? ExportFormat.JSON :
              file.name.endsWith('.csv') ? ExportFormat.CSV :
              file.name.endsWith('.xml') ? ExportFormat.XML :
              ExportFormat.JSON,
      status: 'processing',
      fileName: file.name,
      fileSize: file.size,
      createdBy: currentUser.id,
      metadata: {}
    };

    setJobs([...jobs, newJob]);
    setIsImporting(true);

    try {
      // Validate the file
      const validation = await validateImportFile(file);

      if (!validation.valid) {
        throw new Error('Invalid import file format');
      }

      // Update the job with content types
      newJob.contentTypes = validation.contentTypes;

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, you would process the data and update your state
      // For demo purposes, we'll just return success

      // Update the job with completion info
      const updatedJob: BackupJob = {
        ...newJob,
        completedAt: new Date().toISOString(),
        status: 'completed',
        metadata: {
          imported: validation.contentTypes.reduce((acc, type) => {
            acc[type] = Math.floor(Math.random() * 50) + 1; // Random number for demo
            return acc;
          }, {} as Record<string, number>),
          skipped: Math.floor(Math.random() * 5),
          errors: 0
        }
      };

      setJobs(jobs.map(job => job.id === newJob.id ? updatedJob : job));

      return {
        success: true,
        message: `Successfully imported ${validation.records} records of ${validation.contentTypes.join(', ')}`
      };
    } catch (error) {
      // Update the job with error info
      const updatedJob: BackupJob = {
        ...newJob,
        completedAt: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setJobs(jobs.map(job => job.id === newJob.id ? updatedJob : job));

      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred during import'
      };
    } finally {
      setIsImporting(false);
    }
  };

  // Update backup settings
  const updateBackupSettings = (newSettings: Partial<BackupSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return (
    <DataBackupContext.Provider value={{
      jobs,
      settings,
      isExporting,
      isImporting,

      getBackupJobs,
      getBackupJob,
      deleteBackupJob,

      exportData,

      importData,
      validateImportFile,

      updateBackupSettings
    }}>
      {children}
    </DataBackupContext.Provider>
  );
};

// Custom hook
export const useDataBackup = () => useContext(DataBackupContext);
