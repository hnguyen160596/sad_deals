import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useDocuments, DocumentCategory, Document, DocumentVersion, DocumentActivity } from '../context/DocumentContext';
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

// Document card component
const DocumentCard: React.FC<{
  document: Document;
  isSelected: boolean;
  onSelect: () => void;
  onStar: () => void;
  onFavorite: () => void;
}> = ({ document, isSelected, onSelect, onStar, onFavorite }) => {
  const currentVersion = document.versions.find(v => v.version === document.currentVersion);

  // Get published version if available
  const publishedVersion = document.versions.find(v => v.status === 'published');

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isSelected ? 'border-[#982a4a] ring-2 ring-[#982a4a]/20' : 'border-gray-200 hover:border-gray-300'
      } transition-all cursor-pointer bg-white`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={`flex items-center ${document.isTemplate ? 'text-blue-500' : 'text-gray-400'}`}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {document.isTemplate ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              )}
            </svg>
            <span className="text-xs uppercase font-medium">{document.category.replace('_', ' ')}</span>
          </div>
          <div className="flex">
            <button
              onClick={(e) => { e.stopPropagation(); onStar(); }}
              className={`p-1 rounded-full ${document.isStarred ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill={document.isStarred ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`p-1 rounded-full ${document.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill={document.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-1 truncate" title={document.title}>
          {document.title}
        </h3>

        <p className="text-gray-500 text-sm line-clamp-2 mb-3" title={document.description}>
          {document.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {document.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 rounded-full text-xs px-2 py-1">
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="bg-gray-100 text-gray-600 rounded-full text-xs px-2 py-1">
              +{document.tags.length - 3}
            </span>
          )}
        </div>

        <div className="border-t pt-3 text-xs text-gray-500 flex justify-between">
          <div>
            {publishedVersion ? (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Published
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="mr-2">{document.versions.length} version{document.versions.length !== 1 ? 's' : ''}</span>
            <span>{currentVersion && formatFileSize(currentVersion.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document version list component
const DocumentVersionList: React.FC<{
  document: Document;
  onUploadVersion: () => void;
  onViewVersion: (version: number) => void;
  onPublishVersion: (version: number) => void;
  onArchiveVersion: (version: number) => void;
  onCompareVersions: (versionA: number, versionB: number) => void;
}> = ({
  document,
  onUploadVersion,
  onViewVersion,
  onPublishVersion,
  onArchiveVersion,
  onCompareVersions
}) => {
  const [compareMode, setCompareMode] = useState(false);
  const [versionA, setVersionA] = useState<number | null>(null);
  const [versionB, setVersionB] = useState<number | null>(null);

  const sortedVersions = [...document.versions].sort((a, b) => b.version - a.version);

  const handleVersionSelect = (version: number) => {
    if (!compareMode) {
      onViewVersion(version);
      return;
    }

    if (versionA === null) {
      setVersionA(version);
    } else if (versionB === null) {
      setVersionB(version);
    }
  };

  useEffect(() => {
    if (versionA !== null && versionB !== null) {
      onCompareVersions(versionA, versionB);
      setCompareMode(false);
      setVersionA(null);
      setVersionB(null);
    }
  }, [versionA, versionB, onCompareVersions]);

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">Document Versions</h3>
        <div className="flex space-x-3">
          {document.versions.length > 1 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`text-sm px-3 py-1 rounded ${
                compareMode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              {compareMode ? 'Cancel Compare' : 'Compare Versions'}
            </button>
          )}
          <button
            onClick={onUploadVersion}
            className="bg-[#982a4a] text-white text-sm px-3 py-1 rounded hover:bg-[#982a4a]/90"
          >
            Upload New Version
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-2">
            Select two versions to compare:
            {versionA !== null && (
              <span className="font-medium ml-1">
                First: V{versionA}
                {versionB === null ? ' | Now select second version' : ''}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
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
            {sortedVersions.map((version) => (
              <tr
                key={version.id}
                className={`${
                  document.currentVersion === version.version ? 'bg-blue-50' : ''
                } ${
                  compareMode ? 'hover:bg-gray-100 cursor-pointer' : ''
                }`}
                onClick={() => compareMode && handleVersionSelect(version.version)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    V{version.version}
                    {document.currentVersion === version.version && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                    {compareMode && versionA === version.version && (
                      <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                        Compare A
                      </span>
                    )}
                    {compareMode && versionB === version.version && (
                      <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
                        Compare B
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(version.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatFileSize(version.size)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-1">
                    {version.comment}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    version.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : version.status === 'archived'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!compareMode && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewVersion(version.version); }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {version.status !== 'published' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPublishVersion(version.version); }}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Publish
                        </button>
                      )}
                      {version.status !== 'archived' && version.status !== 'published' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onArchiveVersion(version.version); }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Archive
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Document activity component
const DocumentActivityList: React.FC<{ activities: DocumentActivity[] }> = ({ activities }) => {
  const sortedActivities = [...activities].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-700 mb-3">Activity History</h3>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {sortedActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No activity recorded yet</p>
        ) : (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gray-200"></div>
            <ul className="space-y-4">
              {sortedActivities.map(activity => (
                <li key={activity.id} className="relative pl-10">
                  <div className={`absolute left-0 flex items-center justify-center w-14 h-7 rounded ${
                    activity.action === 'created' || activity.action === 'published'
                      ? 'bg-green-100'
                      : activity.action === 'deleted' || activity.action === 'archived'
                        ? 'bg-red-100'
                        : activity.action === 'viewed' || activity.action === 'downloaded'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                  }`}>
                    <span className={`text-xs font-medium capitalize ${
                      activity.action === 'created' || activity.action === 'published'
                        ? 'text-green-800'
                        : activity.action === 'deleted' || activity.action === 'archived'
                          ? 'text-red-800'
                          : activity.action === 'viewed' || activity.action === 'downloaded'
                            ? 'text-blue-800'
                            : 'text-gray-800'
                    }`}>
                      {activity.action}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-800 mb-1">
                      {activity.details}
                      {activity.versionNumber && (
                        <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          V{activity.versionNumber}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Document details component
const DocumentDetails: React.FC<{
  document: Document;
  onClose: () => void;
  onDelete: () => void;
  onUploadVersion: () => void;
}> = ({ document, onClose, onDelete, onUploadVersion }) => {
  const { getDocumentActivities, getDocumentVersion, setVersionStatus, compareVersions } = useDocuments();
  const activities = getDocumentActivities(document.id);

  const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'activity'>('details');
  const [viewingVersion, setViewingVersion] = useState<DocumentVersion | null>(null);
  const [compareResult, setCompareResult] = useState<{
    versionA: number;
    versionB: number;
    added: string[];
    removed: string[];
    changed: string[];
  } | null>(null);

  const handleViewVersion = (version: number) => {
    const versionData = getDocumentVersion(document.id, version);
    if (versionData) {
      setViewingVersion(versionData);
    }
  };

  const handleCloseVersionView = () => {
    setViewingVersion(null);
  };

  const handlePublishVersion = async (version: number) => {
    try {
      await setVersionStatus(document.id, version, 'published');
    } catch (error) {
      console.error('Error publishing version:', error);
    }
  };

  const handleArchiveVersion = async (version: number) => {
    try {
      await setVersionStatus(document.id, version, 'archived');
    } catch (error) {
      console.error('Error archiving version:', error);
    }
  };

  const handleCompareVersions = (versionA: number, versionB: number) => {
    const result = compareVersions(document.id, versionA, versionB);
    setCompareResult({
      versionA,
      versionB,
      ...result
    });
  };

  // Get current version
  const currentVersion = document.versions.find(v => v.version === document.currentVersion);

  return (
    <>
      {/* Document version viewer */}
      {viewingVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">
                Version {viewingVersion.version} - {viewingVersion.filename}
              </h3>
              <button onClick={handleCloseVersionView}>
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status: <span className="font-medium capitalize">{viewingVersion.status}</span></p>
                  <p className="text-sm text-gray-500 mb-1">Size: <span className="font-medium">{formatFileSize(viewingVersion.size)}</span></p>
                  <p className="text-sm text-gray-500 mb-1">Created: <span className="font-medium">{formatDate(viewingVersion.createdAt)}</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Comment:</p>
                  <p className="text-sm font-medium">{viewingVersion.comment}</p>
                </div>
              </div>

              {/* File preview - in a real app this would be a PDF viewer or similar */}
              <div className="bg-gray-100 p-20 rounded-lg border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 mb-1">{viewingVersion.filename}</p>
                  <p className="text-gray-500 text-sm">Preview not available in demo</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Download Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version comparison viewer */}
      {compareResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">
                Comparing Version {compareResult.versionA} to Version {compareResult.versionB}
              </h3>
              <button onClick={() => setCompareResult(null)}>
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-green-200 rounded-lg bg-green-50 p-4">
                  <h4 className="text-green-700 font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Added Content
                  </h4>
                  {compareResult.added.length === 0 ? (
                    <p className="text-sm text-green-600">No content added</p>
                  ) : (
                    <ul className="text-sm text-green-600 list-disc pl-5 space-y-1">
                      {compareResult.added.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-red-200 rounded-lg bg-red-50 p-4">
                  <h4 className="text-red-700 font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Removed Content
                  </h4>
                  {compareResult.removed.length === 0 ? (
                    <p className="text-sm text-red-600">No content removed</p>
                  ) : (
                    <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                      {compareResult.removed.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border border-blue-200 rounded-lg bg-blue-50 p-4">
                  <h4 className="text-blue-700 font-medium mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Changed Content
                  </h4>
                  {compareResult.changed.length === 0 ? (
                    <p className="text-sm text-blue-600">No content changed</p>
                  ) : (
                    <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                      {compareResult.changed.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600">
                  The comparison between Version {compareResult.versionA} and Version {compareResult.versionB} shows
                  {compareResult.added.length > 0 ? ` ${compareResult.added.length} addition${compareResult.added.length !== 1 ? 's' : ''}` : ' no additions'},
                  {compareResult.removed.length > 0 ? ` ${compareResult.removed.length} removal${compareResult.removed.length !== 1 ? 's' : ''}` : ' no removals'}, and
                  {compareResult.changed.length > 0 ? ` ${compareResult.changed.length} change${compareResult.changed.length !== 1 ? 's' : ''}` : ' no changes'}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <h2 className="font-semibold text-xl">{document.title}</h2>
              {document.isTemplate && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  Template
                </span>
              )}
            </div>
            <button onClick={onClose}>
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'text-[#982a4a] border-b-2 border-[#982a4a]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'versions'
                    ? 'text-[#982a4a] border-b-2 border-[#982a4a]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('versions')}
              >
                Versions ({document.versions.length})
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'activity'
                    ? 'text-[#982a4a] border-b-2 border-[#982a4a]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity History
              </button>
            </nav>
          </div>

          <div className="p-6 flex-1 overflow-auto">
            {activeTab === 'details' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600">{document.description}</p>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-600 rounded-full text-sm px-3 py-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-medium text-gray-700 mb-2">Access Level</h3>
                      <div className="flex items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          document.accessLevel === 'public'
                            ? 'bg-green-100 text-green-800'
                            : document.accessLevel === 'team'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {document.accessLevel.charAt(0).toUpperCase() + document.accessLevel.slice(1)}
                        </span>
                      </div>

                      {document.accessLevel === 'team' && document.accessRoles && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Accessible by roles:</h4>
                          <div className="flex flex-wrap gap-1">
                            {document.accessRoles.map(role => (
                              <span key={role} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-3">Document Properties</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Category:</span>
                        <span className="text-sm font-medium capitalize">{document.category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Created:</span>
                        <span className="text-sm">{formatDate(document.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Last updated:</span>
                        <span className="text-sm">{formatDate(document.updatedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Current version:</span>
                        <span className="text-sm font-medium">V{document.currentVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Size:</span>
                        <span className="text-sm">{currentVersion ? formatFileSize(currentVersion.size) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">File name:</span>
                        <span className="text-sm">{currentVersion ? currentVersion.filename : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button
                        className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 mb-2"
                      >
                        Download Document
                      </button>
                      <button
                        onClick={onUploadVersion}
                        className="w-full bg-[#982a4a] text-white rounded py-2 text-sm hover:bg-[#982a4a]/90 mb-2"
                      >
                        Upload New Version
                      </button>
                      <button
                        onClick={onDelete}
                        className="w-full bg-red-600 text-white rounded py-2 text-sm hover:bg-red-700"
                      >
                        Delete Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'versions' && (
              <DocumentVersionList
                document={document}
                onUploadVersion={onUploadVersion}
                onViewVersion={handleViewVersion}
                onPublishVersion={handlePublishVersion}
                onArchiveVersion={handleArchiveVersion}
                onCompareVersions={handleCompareVersions}
              />
            )}

            {activeTab === 'activity' && (
              <DocumentActivityList activities={activities} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// New document form
interface NewDocumentFormProps {
  onSubmit: (title: string, description: string, category: DocumentCategory, tags: string[], file: File, comment: string) => void;
  onCancel: () => void;
}

const NewDocumentForm: React.FC<NewDocumentFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.MISCELLANEOUS);
  const [tagsInput, setTagsInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!file) {
      setError('File is required');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSubmit(title, description, category, tags, file, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload New Document</h2>
          <button onClick={onCancel}>
            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              >
                {Object.values(DocumentCategory).map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ').charAt(0).toUpperCase() + cat.replace('_', ' ').slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. important, contract, 2025"
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="file"
                className="w-full block text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-[#982a4a] file:text-white
                hover:file:bg-[#982a4a]/90"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                required
              />
              {file && (
                <p className="mt-1 text-sm text-gray-500">{file.name} ({formatFileSize(file.size)})</p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Version Comment
              </label>
              <input
                type="text"
                id="comment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Initial version"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#982a4a] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#982a4a]/90"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New version upload form
interface NewVersionFormProps {
  documentId: string;
  documentTitle: string;
  onSubmit: (file: File, comment: string) => void;
  onCancel: () => void;
}

const NewVersionForm: React.FC<NewVersionFormProps> = ({ documentId, documentTitle, onSubmit, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('File is required');
      return;
    }

    onSubmit(file, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload New Version</h2>
          <button onClick={onCancel}>
            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Uploading a new version for document: <span className="font-medium">{documentTitle}</span>
        </p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="version-file" className="block text-sm font-medium text-gray-700 mb-1">
                File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="version-file"
                className="w-full block text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-[#982a4a] file:text-white
                hover:file:bg-[#982a4a]/90"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                required
              />
              {file && (
                <p className="mt-1 text-sm text-gray-500">{file.name} ({formatFileSize(file.size)})</p>
              )}
            </div>

            <div>
              <label htmlFor="version-comment" className="block text-sm font-medium text-gray-700 mb-1">
                Version Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="version-comment"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what changed in this version"
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#982a4a] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#982a4a]/90"
            >
              Upload Version
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main DocumentManager component
const DocumentManager: React.FC = () => {
  const { hasPermission } = useUser();
  const {
    documents,
    filteredDocuments,
    selectedDocumentId,
    selectDocument,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    createDocument,
    deleteDocument,
    uploadNewVersion,
    toggleStar,
    toggleFavorite
  } = useDocuments();

  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has necessary permissions
  const canCreateDocument = hasPermission(PERMISSIONS.MANAGE_PAGES);
  const canEditDocument = hasPermission(PERMISSIONS.EDIT_PAGES);
  const canDeleteDocument = hasPermission(PERMISSIONS.MANAGE_PAGES);

  // Get the selected document if one is selected
  const selectedDocument = selectedDocumentId
    ? documents.find(doc => doc.id === selectedDocumentId)
    : null;

  // Handle creating a new document
  const handleCreateDocument = async (
    title: string,
    description: string,
    category: DocumentCategory,
    tags: string[],
    file: File,
    comment: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const newDoc = await createDocument(
        {
          title,
          description,
          category,
          tags,
          ownerId: '',
          accessLevel: 'team',
          accessRoles: ['admin', 'editor'],
          isStarred: false,
          isFavorite: false,
          isTemplate: false,
          meta: {}
        },
        file,
        comment || 'Initial version'
      );

      setIsNewDocModalOpen(false);
      selectDocument(newDoc.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
      console.error('Error creating document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle uploading a new version
  const handleUploadNewVersion = async (file: File, comment: string) => {
    if (!selectedDocumentId) return;

    setIsLoading(true);
    setError(null);

    try {
      await uploadNewVersion(selectedDocumentId, file, comment);
      setIsNewVersionModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload new version');
      console.error('Error uploading new version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a document
  const handleDeleteDocument = async () => {
    if (!selectedDocumentId) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteDocument(selectedDocumentId);
      setIsDeleteConfirmOpen(false);
      selectDocument(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      console.error('Error deleting document:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique tags from documents for the filter
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  ).sort();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Document Management</h1>

        {canCreateDocument && (
          <button
            onClick={() => setIsNewDocModalOpen(true)}
            className="bg-[#982a4a] text-white rounded-lg px-4 py-2 flex items-center hover:bg-[#982a4a]/90"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload New Document
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar / Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="font-medium text-gray-700 mb-3">Filters</h2>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#982a4a] focus:border-[#982a4a] text-sm"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${!selectedCategory ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  All Categories
                </button>
                {Object.values(DocumentCategory).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md capitalize ${selectedCategory === category ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                  >
                    {category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                        className="h-4 w-4 text-[#982a4a] focus:ring-[#982a4a] border-gray-300 rounded"
                      />
                      <label htmlFor={`tag-${tag}`} className="ml-2 text-sm text-gray-700">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort by */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'size' | 'category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] text-sm"
              >
                <option value="date">Date Updated</option>
                <option value="title">Title</option>
                <option value="size">File Size</option>
                <option value="category">Category</option>
              </select>

              <div className="flex mt-2">
                <button
                  onClick={() => setSortDirection('asc')}
                  className={`flex-1 px-3 py-1 text-sm rounded-l-md ${
                    sortDirection === 'asc'
                      ? 'bg-[#982a4a] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ascending
                </button>
                <button
                  onClick={() => setSortDirection('desc')}
                  className={`flex-1 px-3 py-1 text-sm rounded-r-md ${
                    sortDirection === 'desc'
                      ? 'bg-[#982a4a] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Descending
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Filters</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Starred Documents
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Favorites
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Templates
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recently Modified
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <svg className="animate-spin h-8 w-8 text-[#982a4a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory || selectedTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first document to get started'}
              </p>
              {canCreateDocument && (
                <button
                  onClick={() => setIsNewDocModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#982a4a] hover:bg-[#982a4a]/90"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  isSelected={selectedDocumentId === document.id}
                  onSelect={() => selectDocument(document.id)}
                  onStar={() => toggleStar(document.id)}
                  onFavorite={() => toggleFavorite(document.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document detail view */}
      {selectedDocument && (
        <DocumentDetails
          document={selectedDocument}
          onClose={() => selectDocument(null)}
          onDelete={() => setIsDeleteConfirmOpen(true)}
          onUploadVersion={() => setIsNewVersionModalOpen(true)}
        />
      )}

      {/* New document modal */}
      {isNewDocModalOpen && (
        <NewDocumentForm
          onSubmit={handleCreateDocument}
          onCancel={() => setIsNewDocModalOpen(false)}
        />
      )}

      {/* New version modal */}
      {isNewVersionModalOpen && selectedDocument && (
        <NewVersionForm
          documentId={selectedDocument.id}
          documentTitle={selectedDocument.title}
          onSubmit={handleUploadNewVersion}
          onCancel={() => setIsNewVersionModalOpen(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {isDeleteConfirmOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Document Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{selectedDocument.title}</span>"? This action cannot be undone and will delete all versions of this document.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
