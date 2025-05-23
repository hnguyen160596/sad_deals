import type React from 'react';
import { useState, useRef } from 'react';
import { useDataBackup, ContentType, ExportFormat, BackupJob } from '../context/DataBackupContext';
import { useUser, PERMISSIONS } from '../context/UserContext';

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Job status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'failed':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'processing':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Job details component
const JobDetails: React.FC<{ job: BackupJob; onClose: () => void }> = ({ job, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Backup Job Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Job Information</h4>
            <dl className="space-y-1">
              <div className="flex items-start">
                <dt className="text-gray-500 text-sm w-24">Type:</dt>
                <dd className="text-sm capitalize">{job.type}</dd>
              </div>
              <div className="flex items-start">
                <dt className="text-gray-500 text-sm w-24">Created:</dt>
                <dd className="text-sm">{formatDate(job.createdAt)}</dd>
              </div>
              {job.completedAt && (
                <div className="flex items-start">
                  <dt className="text-gray-500 text-sm w-24">Completed:</dt>
                  <dd className="text-sm">{formatDate(job.completedAt)}</dd>
                </div>
              )}
              <div className="flex items-start">
                <dt className="text-gray-500 text-sm w-24">Status:</dt>
                <dd className="text-sm"><StatusBadge status={job.status} /></dd>
              </div>
              {job.fileName && (
                <div className="flex items-start">
                  <dt className="text-gray-500 text-sm w-24">File:</dt>
                  <dd className="text-sm">{job.fileName}</dd>
                </div>
              )}
              {job.fileSize && (
                <div className="flex items-start">
                  <dt className="text-gray-500 text-sm w-24">Size:</dt>
                  <dd className="text-sm">{formatFileSize(job.fileSize)}</dd>
                </div>
              )}
              <div className="flex items-start">
                <dt className="text-gray-500 text-sm w-24">Format:</dt>
                <dd className="text-sm uppercase">{job.format}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Content</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.contentTypes.map(type => (
                <span key={type} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded capitalize">
                  {type}
                </span>
              ))}
            </div>

            {job.status === 'completed' && job.type === 'export' && job.metadata.records && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Records Exported</h5>
                <ul className="text-sm space-y-1">
                  {Object.entries(job.metadata.records).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.status === 'completed' && job.type === 'import' && job.metadata.imported && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Records Imported</h5>
                <ul className="text-sm space-y-1">
                  {Object.entries(job.metadata.imported).map(([key, value]) => (
                    <li key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                  {job.metadata.skipped > 0 && (
                    <li className="flex justify-between text-yellow-600">
                      <span>Skipped:</span>
                      <span className="font-medium">{job.metadata.skipped}</span>
                    </li>
                  )}
                  {job.metadata.errors > 0 && (
                    <li className="flex justify-between text-red-600">
                      <span>Errors:</span>
                      <span className="font-medium">{job.metadata.errors}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {job.status === 'failed' && job.error && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-red-700 mb-1">Error</h5>
                <div className="bg-red-50 text-red-700 p-2 rounded text-sm">
                  {job.error}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end space-x-2">
          {job.status === 'completed' && job.type === 'export' && (
            <button
              className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90"
              onClick={() => {
                // In a real app, this would trigger a download of the actual file
                alert('In a production environment, this would download the export file.');
              }}
            >
              Download
            </button>
          )}
          <button
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Export settings component
interface ExportSettingsProps {
  onStartExport: () => void;
  selectedContentTypes: ContentType[];
  setSelectedContentTypes: React.Dispatch<React.SetStateAction<ContentType[]>>;
  selectedFormat: ExportFormat;
  setSelectedFormat: React.Dispatch<React.SetStateAction<ExportFormat>>;
}

const ExportSettings: React.FC<ExportSettingsProps> = ({
  onStartExport,
  selectedContentTypes,
  setSelectedContentTypes,
  selectedFormat,
  setSelectedFormat
}) => {
  const { isExporting } = useDataBackup();

  const toggleContentType = (type: ContentType) => {
    if (type === ContentType.ALL) {
      // If "All" is selected, clear other selections
      if (selectedContentTypes.includes(ContentType.ALL)) {
        setSelectedContentTypes([]);
      } else {
        setSelectedContentTypes([ContentType.ALL]);
      }
    } else {
      // If a specific type is selected, remove "All" if it's selected
      let newSelection = selectedContentTypes.filter(t => t !== ContentType.ALL);

      if (newSelection.includes(type)) {
        newSelection = newSelection.filter(t => t !== type);
      } else {
        newSelection.push(type);
      }

      setSelectedContentTypes(newSelection);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Export Data</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Content to Export</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(ContentType).map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                  checked={selectedContentTypes.includes(type)}
                  onChange={() => toggleContentType(type)}
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Export Format</h4>
          <div className="flex space-x-4">
            {Object.values(ExportFormat).map(format => (
              <label key={format} className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300"
                  checked={selectedFormat === format}
                  onChange={() => setSelectedFormat(format)}
                />
                <span className="ml-2 text-sm text-gray-700 uppercase">{format}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={onStartExport}
            disabled={isExporting || selectedContentTypes.length === 0}
            className={`px-4 py-2 bg-[#982a4a] text-white rounded-md hover:bg-[#982a4a]/90 ${
              isExporting || selectedContentTypes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExporting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </span>
            ) : (
              'Start Export'
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Exports will create a backup file of the selected content that you can download and store securely.
          </p>
        </div>
      </div>
    </div>
  );
};

// Import component
const ImportSettings: React.FC = () => {
  const { importData, validateImportFile, isImporting } = useDataBackup();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValidation, setFileValidation] = useState<{ valid: boolean; contentTypes: ContentType[]; records: number } | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setFileValidation(null);
      return;
    }

    const file = files[0];
    setSelectedFile(file);
    setImportResult(null);

    // Validate the file
    const validation = await validateImportFile(file);
    setFileValidation(validation);
  };

  const handleImport = async () => {
    if (!selectedFile || !fileValidation?.valid) return;

    const result = await importData(selectedFile);
    setImportResult(result);

    // Reset selected file and validation
    setSelectedFile(null);
    setFileValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Import Data</h3>

      <div className="space-y-6">
        {importResult && (
          <div className={`p-4 rounded ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {importResult.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {importResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="import-file" className="block text-sm font-medium text-gray-700 mb-2">
            Select Backup File to Import
          </label>
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              id="import-file"
              accept=".json,.csv,.xml"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-[#982a4a] file:text-white
                hover:file:bg-[#982a4a]/90"
            />

            {selectedFile && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setFileValidation(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-500 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: .json, .csv, .xml
          </p>
        </div>

        {selectedFile && fileValidation && (
          <div className={`p-4 rounded-lg ${fileValidation.valid ? 'bg-green-50' : 'bg-red-50'}`}>
            <h4 className={`text-sm font-medium mb-2 ${fileValidation.valid ? 'text-green-800' : 'text-red-800'}`}>
              File Validation
            </h4>

            {fileValidation.valid ? (
              <div>
                <p className="text-sm mb-2">
                  This file contains {fileValidation.records} records with the following content types:
                </p>
                <div className="flex flex-wrap gap-2">
                  {fileValidation.contentTypes.map(type => (
                    <span key={type} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600">
                Invalid backup file format. Please select a valid backup file.
              </p>
            )}
          </div>
        )}

        <div>
          <button
            onClick={handleImport}
            disabled={isImporting || !selectedFile || !fileValidation?.valid}
            className={`px-4 py-2 bg-[#982a4a] text-white rounded-md hover:bg-[#982a4a]/90 ${
              isImporting || !selectedFile || !fileValidation?.valid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isImporting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </span>
            ) : (
              'Start Import'
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Importing data will merge or replace existing content. Make sure you have a backup before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
};

// Auto-backup settings component
const AutoBackupSettings: React.FC = () => {
  const { settings, updateBackupSettings } = useDataBackup();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Scheduled Backups</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="auto-backup-toggle" className="text-sm font-medium text-gray-700">
            Enable Automatic Backups
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              type="checkbox"
              id="auto-backup-toggle"
              checked={settings.autoBackupEnabled}
              onChange={() => updateBackupSettings({ autoBackupEnabled: !settings.autoBackupEnabled })}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="auto-backup-toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                settings.autoBackupEnabled ? 'bg-[#982a4a]' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="backup-frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Backup Frequency
            </label>
            <select
              id="backup-frequency"
              value={settings.autoBackupFrequency}
              onChange={(e) => updateBackupSettings({ autoBackupFrequency: e.target.value as any })}
              disabled={!settings.autoBackupEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label htmlFor="backup-time" className="block text-sm font-medium text-gray-700 mb-1">
              Backup Time
            </label>
            <input
              type="time"
              id="backup-time"
              value={settings.autoBackupTime}
              onChange={(e) => updateBackupSettings({ autoBackupTime: e.target.value })}
              disabled={!settings.autoBackupEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="backup-retention" className="block text-sm font-medium text-gray-700 mb-1">
            Backup Retention (days)
          </label>
          <input
            type="number"
            id="backup-retention"
            min="1"
            max="365"
            value={settings.autoBackupRetention}
            onChange={(e) => updateBackupSettings({ autoBackupRetention: parseInt(e.target.value) })}
            disabled={!settings.autoBackupEnabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] disabled:opacity-50 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content to Backup
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(ContentType).map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                  checked={settings.autoBackupContentTypes.includes(type)}
                  onChange={() => {
                    let newTypes;
                    if (type === ContentType.ALL) {
                      // If ALL is selected, clear other selections
                      newTypes = settings.autoBackupContentTypes.includes(ContentType.ALL)
                        ? []
                        : [ContentType.ALL];
                    } else {
                      // If a specific type is selected, remove ALL if it's there
                      newTypes = settings.autoBackupContentTypes.filter(t => t !== ContentType.ALL);

                      if (newTypes.includes(type)) {
                        newTypes = newTypes.filter(t => t !== type);
                      } else {
                        newTypes.push(type);
                      }
                    }
                    updateBackupSettings({ autoBackupContentTypes: newTypes });
                  }}
                  disabled={!settings.autoBackupEnabled}
                />
                <span className={`ml-2 text-sm capitalize ${!settings.autoBackupEnabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="backup-format" className="block text-sm font-medium text-gray-700 mb-1">
            Backup Format
          </label>
          <select
            id="backup-format"
            value={settings.autoBackupFormat}
            onChange={(e) => updateBackupSettings({ autoBackupFormat: e.target.value as ExportFormat })}
            disabled={!settings.autoBackupEnabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] disabled:opacity-50 disabled:bg-gray-100"
          >
            {Object.values(ExportFormat).map(format => (
              <option key={format} value={format}>{format.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t">
          <button
            className="px-4 py-2 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90 disabled:opacity-50 disabled:hover:bg-[#982a4a]"
            disabled={!settings.autoBackupEnabled}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Job history component
const JobHistory: React.FC = () => {
  const { jobs, deleteBackupJob } = useDataBackup();
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteJob = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteJob = () => {
    if (confirmDelete) {
      deleteBackupJob(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">Backup History</h3>

      {jobs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No backup jobs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize">{job.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {job.contentTypes.slice(0, 3).map(type => (
                        <span key={type} className="bg-gray-100 text-xs px-2 py-0.5 rounded capitalize">
                          {type}
                        </span>
                      ))}
                      {job.contentTypes.length > 3 && (
                        <span className="bg-gray-100 text-xs px-2 py-0.5 rounded">
                          +{job.contentTypes.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="uppercase">{job.format}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {job.status === 'completed' && job.type === 'export' && (
                      <button
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() => {
                          // In a real app, this would trigger a download of the actual file
                          alert('In a production environment, this would download the export file.');
                        }}
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Job details modal */}
      {selectedJob && (
        <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this backup job? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteJob}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
const DataBackupManager: React.FC = () => {
  const { hasPermission } = useUser();
  const { exportData } = useDataBackup();

  const [activeTab, setActiveTab] = useState('export');
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>([ContentType.ALL]);
  const [selectedFormat, setSelectedFormat] = useState(ExportFormat.JSON);

  // Check required permissions
  const canExport = hasPermission(PERMISSIONS.SYSTEM_SETTINGS);
  const canImport = hasPermission(PERMISSIONS.SYSTEM_SETTINGS);
  const canSchedule = hasPermission(PERMISSIONS.SYSTEM_SETTINGS);

  if (!canExport && !canImport) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You don't have permission to access this area. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleStartExport = async () => {
    try {
      await exportData(selectedContentTypes, selectedFormat);
    } catch (error) {
      console.error('Export error:', error);
      // Error will be shown in job history
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Backup & Export</h1>

      <div className="bg-white shadow-sm rounded-lg p-1 mb-6">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'export'
                ? 'bg-[#982a4a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('export')}
            disabled={!canExport}
          >
            Export
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'import'
                ? 'bg-[#982a4a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('import')}
            disabled={!canImport}
          >
            Import
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'scheduled'
                ? 'bg-[#982a4a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('scheduled')}
            disabled={!canSchedule}
          >
            Scheduled Backups
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'history'
                ? 'bg-[#982a4a] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'export' && (
        <ExportSettings
          onStartExport={handleStartExport}
          selectedContentTypes={selectedContentTypes}
          setSelectedContentTypes={setSelectedContentTypes}
          selectedFormat={selectedFormat}
          setSelectedFormat={setSelectedFormat}
        />
      )}

      {activeTab === 'import' && (
        <ImportSettings />
      )}

      {activeTab === 'scheduled' && (
        <AutoBackupSettings />
      )}

      {activeTab === 'history' && (
        <JobHistory />
      )}

      {/* Custom styles for toggle switch */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #982a4a;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #982a4a;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #ccc;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default DataBackupManager;
