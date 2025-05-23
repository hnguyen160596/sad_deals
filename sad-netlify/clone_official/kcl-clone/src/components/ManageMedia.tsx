import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useUser, PERMISSIONS } from '../context/UserContext';
import { useMedia, MediaType } from '../context/MediaContext';
import Breadcrumbs from './Breadcrumbs';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Media Item component
const MediaItem: React.FC<{ item: any; isSelected: boolean; onSelect: () => void; onView: () => void }> = ({
  item,
  isSelected,
  onSelect,
  onView
}) => {
  return (
    <div
      className={`relative group rounded-lg border overflow-hidden ${
        isSelected ? 'border-[#982a4a] ring-2 ring-[#982a4a]/30' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="aspect-square bg-gray-100 relative">
        {item.type === MediaType.IMAGE ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.alt || item.filename}
            className="w-full h-full object-cover"
          />
        ) : item.type === MediaType.VIDEO ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ) : item.type === MediaType.DOCUMENT ? (
          <div className="w-full h-full flex items-center justify-center bg-blue-50">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        ) : item.type === MediaType.AUDIO ? (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 rounded-full bg-[#982a4a] text-white w-6 h-6 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
          {item.filename}
        </h3>
        <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Media Gallery component
const MediaGallery: React.FC = () => {
  const {
    mediaItems,
    currentFolder,
    folders,
    selectedItems,
    selectItem,
    deselectItem,
    clearSelection,
    navigateToFolder,
    searchTerm,
    filterByType
  } = useMedia();

  const [viewingItem, setViewingItem] = useState<any | null>(null);

  // Filter media items by current folder, search term and type
  const filteredItems = mediaItems.filter(item => {
    const matchesFolder = item.folder === currentFolder;
    const matchesSearch = searchTerm === '' ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = !filterByType || item.type === filterByType;

    return matchesFolder && matchesSearch && matchesType;
  });

  // Get subfolders of current folder
  const subfolders = folders.filter(folder => folder.parentPath === currentFolder);

  // Get parent folder info
  const parentFolder = currentFolder === 'root'
    ? null
    : folders.find(folder => folder.path === folders.find(f => f.path === currentFolder)?.parentPath);

  // Get current folder name
  const currentFolderName = folders.find(f => f.path === currentFolder)?.name;

  const isItemSelected = (id: string) => selectedItems.some(item => item.id === id);

  const toggleSelection = (id: string) => {
    if (isItemSelected(id)) {
      deselectItem(id);
    } else {
      selectItem(id);
    }
  };

  return (
    <div className="relative">
      {/* Breadcrumb navigation with Schema.org markup */}
      {currentFolder === 'root' ? (
        <Breadcrumbs
          items={[
            { name: 'Admin', url: '/admin' },
            { name: 'Media', url: '/admin/media', isLast: true }
          ]}
          className="mb-4"
        />
      ) : (
        <Breadcrumbs
          items={[
            { name: 'Admin', url: '/admin' },
            { name: 'Media', url: '#', onClick: () => navigateToFolder('root') },
            ...(parentFolder && parentFolder.path !== 'root' ? [
              {
                name: parentFolder.name,
                url: '#',
                onClick: () => navigateToFolder(parentFolder.path)
              }
            ] : []),
            { name: currentFolderName || 'Current Folder', url: '#', isLast: true }
          ]}
          className="mb-4"
        />
      )}

      {/* Folders */}
      {subfolders.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subfolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => navigateToFolder(folder.path)}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-[#982a4a] mb-2">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-sm truncate max-w-full">{folder.name}</span>
                <span className="text-xs text-gray-500">{folder.itemCount} items</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media items grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map(item => (
            <MediaItem
              key={item.id}
              item={item}
              isSelected={isItemSelected(item.id)}
              onSelect={() => toggleSelection(item.id)}
              onView={() => setViewingItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-gray-500 font-medium mb-1">No media found</h3>
          <p className="text-gray-400 text-sm">
            {searchTerm || filterByType
              ? 'Try adjusting your search or filter criteria'
              : 'Upload files to see them here'}
          </p>
        </div>
      )}

      {/* Media preview modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="font-medium truncate">{viewingItem.filename}</h3>
              <button onClick={() => setViewingItem(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-center mb-4">
                {viewingItem.type === MediaType.IMAGE ? (
                  <img
                    src={viewingItem.url}
                    alt={viewingItem.alt || viewingItem.filename}
                    className="max-h-[50vh] max-w-full object-contain"
                  />
                ) : viewingItem.type === MediaType.VIDEO ? (
                  <div className="aspect-video w-full bg-black rounded">
                    <video
                      controls
                      className="w-full h-full"
                      src={viewingItem.url}
                    ></video>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="inline-block p-4 bg-gray-200 rounded-full mb-3">
                      {viewingItem.type === MediaType.DOCUMENT ? (
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : viewingItem.type === MediaType.AUDIO ? (
                        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      ) : (
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="text-sm font-medium">{viewingItem.filename}</div>
                    <a
                      href={viewingItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#982a4a] text-sm inline-block mt-2 hover:underline"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">File Details</h4>
                  <dl className="space-y-1">
                    <div className="flex items-start">
                      <dt className="text-gray-500 text-sm w-24">Name:</dt>
                      <dd className="text-sm">{viewingItem.originalFilename}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="text-gray-500 text-sm w-24">Type:</dt>
                      <dd className="text-sm">{viewingItem.mimeType}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="text-gray-500 text-sm w-24">Size:</dt>
                      <dd className="text-sm">{formatFileSize(viewingItem.size)}</dd>
                    </div>
                    {viewingItem.dimensions && (
                      <div className="flex items-start">
                        <dt className="text-gray-500 text-sm w-24">Dimensions:</dt>
                        <dd className="text-sm">{`${viewingItem.dimensions.width} × ${viewingItem.dimensions.height}`}</dd>
                      </div>
                    )}
                    <div className="flex items-start">
                      <dt className="text-gray-500 text-sm w-24">Uploaded:</dt>
                      <dd className="text-sm">{new Date(viewingItem.uploadedAt).toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Usage Information</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                    <h5 className="text-sm font-medium mb-1">Direct URL</h5>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={viewingItem.url}
                        readOnly
                        className="text-xs w-full bg-white border border-gray-300 rounded py-1 px-2"
                        onClick={e => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        className="ml-2 text-[#982a4a] p-1 rounded hover:bg-[#982a4a]/10"
                        onClick={() => navigator.clipboard.writeText(viewingItem.url)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {viewingItem.type === MediaType.IMAGE && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <h5 className="text-sm font-medium mb-1">HTML Image Tag</h5>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={`<img src="${viewingItem.url}" alt="${viewingItem.alt || viewingItem.filename}" />`}
                          readOnly
                          className="text-xs w-full bg-white border border-gray-300 rounded py-1 px-2"
                          onClick={e => (e.target as HTMLInputElement).select()}
                        />
                        <button
                          className="ml-2 text-[#982a4a] p-1 rounded hover:bg-[#982a4a]/10"
                          onClick={() => navigator.clipboard.writeText(`<img src="${viewingItem.url}" alt="${viewingItem.alt || viewingItem.filename}" />`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex justify-between">
              <div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <div className="space-x-2">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit Details
                </button>
                {!isItemSelected(viewingItem.id) ? (
                  <button
                    onClick={() => selectItem(viewingItem.id)}
                    className="px-4 py-2 bg-[#982a4a] text-white rounded text-sm hover:bg-[#982a4a]/90"
                  >
                    Select
                  </button>
                ) : (
                  <button
                    onClick={() => deselectItem(viewingItem.id)}
                    className="px-4 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                  >
                    Deselect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main media management component
const ManageMedia: React.FC = () => {
  const { hasPermission } = useUser();
  const {
    mediaItems,
    folders,
    selectedItems,
    clearSelection,
    createFolder,
    deleteFolder,
    deleteMedia,
    moveMedia,
    searchTerm,
    setSearchTerm,
    filterByType,
    setFilterByType,
    uploadMedia,
    totalSize,
    totalCount,
    typeBreakdown,
    currentFolder,
    navigateToFolder
  } = useMedia();

  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedMoveFolder, setSelectedMoveFolder] = useState('root');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = hasPermission(PERMISSIONS.UPLOAD_MEDIA);
  const canDelete = hasPermission(PERMISSIONS.DELETE_MEDIA);
  const canManage = hasPermission(PERMISSIONS.MANAGE_MEDIA);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      await uploadMedia(files);
      setUploadProgress(100);

      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset progress after a delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle new folder creation
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const folder = createFolder(newFolderName.trim());
    if (folder) {
      setNewFolderName('');
      setIsNewFolderModalOpen(false);
    } else {
      alert('Could not create folder. Please check the name is valid and unique.');
    }
  };

  // Handle media deletion
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)? This cannot be undone.`)) {
      deleteMedia(selectedItems.map(item => item.id));
    }
  };

  // Handle move operation
  const handleMoveSelected = () => {
    if (selectedItems.length === 0 || selectedMoveFolder === currentFolder) return;

    moveMedia(selectedItems.map(item => item.id), selectedMoveFolder);
    setIsMoveModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Media Management</h1>

        <div className="flex items-center space-x-3">
          {canUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#982a4a] text-white rounded-lg px-4 py-2 flex items-center hover:bg-[#982a4a]/90 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Files
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </button>
          )}

          {canManage && (
            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 flex items-center hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9-6h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H3m18 0h-1.5a1.5 1.5 0 0 1-1.5-1.5v-1a1.5 1.5 0 0 1 1.5-1.5H21" />
              </svg>
              New Folder
            </button>
          )}
        </div>
      </div>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#982a4a] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="font-medium text-gray-700 mb-3">Media Library</h2>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search media..."
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

            {/* Filter by type */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Type</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilterByType(null)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${!filterByType ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  All Media ({totalCount})
                </button>
                <button
                  onClick={() => setFilterByType(MediaType.IMAGE)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterByType === MediaType.IMAGE ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  Images ({typeBreakdown[MediaType.IMAGE]})
                </button>
                <button
                  onClick={() => setFilterByType(MediaType.VIDEO)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterByType === MediaType.VIDEO ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  Videos ({typeBreakdown[MediaType.VIDEO]})
                </button>
                <button
                  onClick={() => setFilterByType(MediaType.DOCUMENT)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterByType === MediaType.DOCUMENT ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  Documents ({typeBreakdown[MediaType.DOCUMENT]})
                </button>
                <button
                  onClick={() => setFilterByType(MediaType.AUDIO)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${filterByType === MediaType.AUDIO ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  Audio ({typeBreakdown[MediaType.AUDIO]})
                </button>
              </div>
            </div>

            {/* Storage usage */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Storage Usage</h3>
              <div className="bg-gray-100 rounded-full h-2 mb-2">
                <div
                  className="bg-[#982a4a] h-2 rounded-full"
                  style={{ width: `${Math.min(totalSize / (1024 * 1024 * 500) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">{formatFileSize(totalSize)} used of 500 MB</p>
            </div>

            {/* Folder navigation */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Folders</h3>
              <div className="space-y-1">
                <button
                  onClick={() => navigateToFolder('root')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${currentFolder === 'root' ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Root
                </button>
                {folders.filter(f => f.path !== 'root').map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => navigateToFolder(folder.path)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${currentFolder === folder.path ? 'bg-[#982a4a]/10 text-[#982a4a]' : 'hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {folder.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Selection actions */}
          {selectedItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">{selectedItems.length}</span> items selected
              </div>
              <div className="flex space-x-2">
                {canManage && (
                  <button
                    onClick={() => setIsMoveModalOpen(true)}
                    className="text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    Move
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteSelected}
                    className="text-red-600 px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={clearSelection}
                  className="text-gray-600 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Media gallery */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <MediaGallery />
          </div>
        </div>
      </div>

      {/* New folder modal */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                  placeholder="Enter folder name"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Only letters, numbers, dashes, and underscores are allowed.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || !/^[a-zA-Z0-9-_]+$/.test(newFolderName)}
                  className="px-4 py-2 bg-[#982a4a] text-white rounded-md text-sm font-medium hover:bg-[#982a4a]/90 disabled:opacity-50"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Move {selectedItems.length} Item(s)</h3>
              <div className="mb-4">
                <label htmlFor="moveFolder" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Destination Folder
                </label>
                <select
                  id="moveFolder"
                  value={selectedMoveFolder}
                  onChange={(e) => setSelectedMoveFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a]"
                >
                  <option value="root">Root</option>
                  {folders.filter(f => f.path !== 'root' && f.path !== currentFolder)
                    .map(folder => (
                      <option key={folder.id} value={folder.path}>
                        {folder.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveSelected}
                  className="px-4 py-2 bg-[#982a4a] text-white rounded-md text-sm font-medium hover:bg-[#982a4a]/90"
                >
                  Move Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedia;
