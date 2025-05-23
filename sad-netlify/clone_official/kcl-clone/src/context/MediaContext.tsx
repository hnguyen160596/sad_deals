import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';

// Define media item types
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other'
}

// Media item metadata
export interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  type: MediaType;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  size: number; // in bytes
  dimensions?: {
    width: number;
    height: number;
  };
  alt?: string;
  title?: string;
  description?: string;
  uploadedBy: string; // user ID
  uploadedAt: string; // ISO date string
  lastModified?: string; // ISO date string
  folder: string; // path like 'root' or 'products/featured'
  tags: string[];
  isOptimized: boolean;
  meta: Record<string, any>; // additional metadata
}

// For folder organization
export interface MediaFolder {
  id: string;
  name: string;
  path: string; // full path like 'products/featured'
  parentPath: string; // parent path like 'products'
  createdAt: string;
  createdBy: string; // user ID
  itemCount: number;
}

interface MediaContextType {
  // Media items state and operations
  mediaItems: MediaItem[];
  selectedItems: MediaItem[];
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;

  // Folder operations
  folders: MediaFolder[];
  currentFolder: string;
  navigateToFolder: (path: string) => void;
  createFolder: (name: string, parentPath?: string) => MediaFolder | null;
  deleteFolder: (path: string) => boolean;
  renameFolder: (path: string, newName: string) => boolean;

  // Media operations
  uploadMedia: (files: File[], folder?: string) => Promise<MediaItem[]>;
  deleteMedia: (ids: string[]) => boolean;
  updateMedia: (id: string, updates: Partial<MediaItem>) => boolean;
  moveMedia: (ids: string[], targetFolder: string) => boolean;

  // Filter and search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterByType: MediaType | null;
  setFilterByType: (type: MediaType | null) => void;
  sortBy: 'name' | 'date' | 'size';
  setSortBy: (sort: 'name' | 'date' | 'size') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;

  // Stats
  totalSize: number;
  totalCount: number;
  typeBreakdown: Record<MediaType, number>;
}

// Generate a simple unique ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get mime type category
const getMimeCategory = (mimeType: string): MediaType => {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
  if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
       'text/plain', 'text/csv'].includes(mimeType)) {
    return MediaType.DOCUMENT;
  }
  return MediaType.OTHER;
};

// Create context with default values
const MediaContext = createContext<MediaContextType>({
  mediaItems: [],
  selectedItems: [],
  selectItem: () => {},
  deselectItem: () => {},
  selectMultiple: () => {},
  clearSelection: () => {},

  folders: [],
  currentFolder: 'root',
  navigateToFolder: () => {},
  createFolder: () => null,
  deleteFolder: () => false,
  renameFolder: () => false,

  uploadMedia: async () => [],
  deleteMedia: () => false,
  updateMedia: () => false,
  moveMedia: () => false,

  searchTerm: '',
  setSearchTerm: () => {},
  filterByType: null,
  setFilterByType: () => {},
  sortBy: 'date',
  setSortBy: () => {},
  sortDirection: 'desc',
  setSortDirection: () => {},

  totalSize: 0,
  totalCount: 0,
  typeBreakdown: {
    [MediaType.IMAGE]: 0,
    [MediaType.VIDEO]: 0,
    [MediaType.DOCUMENT]: 0,
    [MediaType.AUDIO]: 0,
    [MediaType.OTHER]: 0
  }
});

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for media items
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const savedItems = localStorage.getItem('mediaItems');
    if (savedItems) {
      return JSON.parse(savedItems);
    }

    // Sample data
    return [
      {
        id: '1',
        filename: 'sample-image-1.jpg',
        originalFilename: 'beach.jpg',
        type: MediaType.IMAGE,
        mimeType: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1520483601560-389dff434fdf?q=80&w=200',
        size: 1024000,
        dimensions: { width: 1200, height: 800 },
        alt: 'Sample beach image',
        title: 'Beach',
        description: 'A beautiful beach scene',
        uploadedBy: '1', // admin user ID
        uploadedAt: new Date('2025-05-15').toISOString(),
        folder: 'root',
        tags: ['beach', 'summer', 'featured'],
        isOptimized: true,
        meta: {}
      },
      {
        id: '2',
        filename: 'product-headphones.jpg',
        originalFilename: 'headphones.jpg',
        type: MediaType.IMAGE,
        mimeType: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200',
        size: 768000,
        dimensions: { width: 1000, height: 750 },
        alt: 'Headphones product image',
        title: 'Headphones',
        description: 'Wireless headphones product image',
        uploadedBy: '1',
        uploadedAt: new Date('2025-05-14').toISOString(),
        folder: 'products',
        tags: ['product', 'electronics', 'headphones'],
        isOptimized: true,
        meta: { productId: 'hp-001' }
      },
      {
        id: '3',
        filename: 'annual-report.pdf',
        originalFilename: 'annual-report-2025.pdf',
        type: MediaType.DOCUMENT,
        mimeType: 'application/pdf',
        url: 'https://example.com/files/sample.pdf',
        size: 2048000,
        uploadedBy: '1',
        uploadedAt: new Date('2025-05-10').toISOString(),
        folder: 'documents',
        tags: ['report', 'internal'],
        isOptimized: false,
        meta: { pages: 24 }
      }
    ];
  });

  // State for folders
  const [folders, setFolders] = useState<MediaFolder[]>(() => {
    const savedFolders = localStorage.getItem('mediaFolders');
    if (savedFolders) {
      return JSON.parse(savedFolders);
    }

    // Default folders
    return [
      {
        id: '1',
        name: 'Root',
        path: 'root',
        parentPath: '',
        createdAt: new Date('2025-01-01').toISOString(),
        createdBy: '1',
        itemCount: 1
      },
      {
        id: '2',
        name: 'Products',
        path: 'products',
        parentPath: 'root',
        createdAt: new Date('2025-01-01').toISOString(),
        createdBy: '1',
        itemCount: 1
      },
      {
        id: '3',
        name: 'Documents',
        path: 'documents',
        parentPath: 'root',
        createdAt: new Date('2025-01-01').toISOString(),
        createdBy: '1',
        itemCount: 1
      }
    ];
  });

  // Current navigation and selection state
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByType, setFilterByType] = useState<MediaType | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('mediaFolders', JSON.stringify(folders));
  }, [folders]);

  // Calculate statistics
  const calculateStats = () => {
    const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0);
    const totalCount = mediaItems.length;

    const typeBreakdown = mediaItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {
      [MediaType.IMAGE]: 0,
      [MediaType.VIDEO]: 0,
      [MediaType.DOCUMENT]: 0,
      [MediaType.AUDIO]: 0,
      [MediaType.OTHER]: 0
    });

    return { totalSize, totalCount, typeBreakdown };
  };

  const { totalSize, totalCount, typeBreakdown } = calculateStats();

  // Selection handlers
  const selectItem = (id: string) => {
    const item = mediaItems.find(item => item.id === id);
    if (item && !selectedItems.some(selected => selected.id === id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const deselectItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const selectMultiple = (ids: string[]) => {
    const itemsToSelect = mediaItems.filter(item => ids.includes(item.id));
    setSelectedItems([...selectedItems, ...itemsToSelect]);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Folder navigation
  const navigateToFolder = (path: string) => {
    // Check if folder exists
    if (folders.some(folder => folder.path === path) || path === 'root') {
      setCurrentFolder(path);
      clearSelection();
    }
  };

  // Create a new folder
  const createFolder = (name: string, parentPath = currentFolder): MediaFolder | null => {
    // Validate name (no special characters except dash and underscore)
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return null;
    }

    // Check if folder already exists
    const newPath = parentPath === 'root' ? name : `${parentPath}/${name}`;
    if (folders.some(folder => folder.path === newPath)) {
      return null;
    }

    const newFolder: MediaFolder = {
      id: generateId(),
      name,
      path: newPath,
      parentPath,
      createdAt: new Date().toISOString(),
      createdBy: '1', // Default to admin
      itemCount: 0
    };

    setFolders([...folders, newFolder]);
    return newFolder;
  };

  // Delete a folder
  const deleteFolder = (path: string): boolean => {
    // Can't delete root
    if (path === 'root') return false;

    // Check if folder has items
    if (mediaItems.some(item => item.folder === path)) {
      return false;
    }

    // Check if folder has subfolders
    if (folders.some(folder => folder.parentPath === path)) {
      return false;
    }

    setFolders(folders.filter(folder => folder.path !== path));
    return true;
  };

  // Rename a folder
  const renameFolder = (path: string, newName: string): boolean => {
    // Can't rename root
    if (path === 'root') return false;

    // Validate name
    if (!/^[a-zA-Z0-9-_]+$/.test(newName)) {
      return false;
    }

    const folderIndex = folders.findIndex(folder => folder.path === path);
    if (folderIndex === -1) return false;

    const folder = folders[folderIndex];
    const parentPath = folder.parentPath;
    const newPath = parentPath === 'root' ? newName : `${parentPath}/${newName}`;

    // Check if new path already exists
    if (folders.some(folder => folder.path === newPath)) {
      return false;
    }

    // Update folder
    const updatedFolder = {
      ...folder,
      name: newName,
      path: newPath
    };

    // Update all items in this folder
    const updatedMediaItems = mediaItems.map(item => {
      if (item.folder === path) {
        return { ...item, folder: newPath };
      }
      return item;
    });

    // Update all subfolders
    const updatedFolders = folders.map(f => {
      if (f.path === path) {
        return updatedFolder;
      }
      if (f.parentPath === path) {
        const newSubPath = f.path.replace(path, newPath);
        return { ...f, path: newSubPath, parentPath: newPath };
      }
      return f;
    });

    setFolders(updatedFolders);
    setMediaItems(updatedMediaItems);
    return true;
  };

  // Upload media
  const uploadMedia = async (files: File[], folder = currentFolder): Promise<MediaItem[]> => {
    // In a real application, this would call an API to upload files to a server
    // For demo purposes, we'll simulate the upload
    const newMediaItems: MediaItem[] = [];

    for (const file of files) {
      // Create a blob URL for demo purposes
      const url = URL.createObjectURL(file);
      const thumbnailUrl = file.type.startsWith('image/') ? url : undefined;

      // Get dimensions for images
      let dimensions;
      if (file.type.startsWith('image/')) {
        dimensions = { width: 800, height: 600 }; // Placeholder
      }

      const newItem: MediaItem = {
        id: generateId(),
        filename: file.name.replace(/[^a-zA-Z0-9.-]/g, '-'),
        originalFilename: file.name,
        type: getMimeCategory(file.type),
        mimeType: file.type,
        url,
        thumbnailUrl,
        size: file.size,
        dimensions,
        uploadedBy: '1', // Default to admin
        uploadedAt: new Date().toISOString(),
        folder,
        tags: [],
        isOptimized: false,
        meta: {}
      };

      newMediaItems.push(newItem);
    }

    // Update folder counts
    const updatedFolders = folders.map(f => {
      if (f.path === folder) {
        return { ...f, itemCount: f.itemCount + newMediaItems.length };
      }
      return f;
    });

    setMediaItems([...mediaItems, ...newMediaItems]);
    setFolders(updatedFolders);
    return newMediaItems;
  };

  // Delete media
  const deleteMedia = (ids: string[]): boolean => {
    // Get folders that will be affected
    const itemsToDelete = mediaItems.filter(item => ids.includes(item.id));
    const foldersToUpdate = new Set(itemsToDelete.map(item => item.folder));

    // Update folder counts
    const updatedFolders = folders.map(folder => {
      if (foldersToUpdate.has(folder.path)) {
        const deleteCount = itemsToDelete.filter(item => item.folder === folder.path).length;
        return { ...folder, itemCount: folder.itemCount - deleteCount };
      }
      return folder;
    });

    setMediaItems(mediaItems.filter(item => !ids.includes(item.id)));
    setFolders(updatedFolders);

    // Clear any selected items that were deleted
    setSelectedItems(selectedItems.filter(item => !ids.includes(item.id)));
    return true;
  };

  // Update media item
  const updateMedia = (id: string, updates: Partial<MediaItem>): boolean => {
    const itemIndex = mediaItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    const updatedMediaItems = [...mediaItems];
    updatedMediaItems[itemIndex] = { ...updatedMediaItems[itemIndex], ...updates };

    setMediaItems(updatedMediaItems);

    // Update selected items if needed
    const selectedIndex = selectedItems.findIndex(item => item.id === id);
    if (selectedIndex !== -1) {
      const updatedSelectedItems = [...selectedItems];
      updatedSelectedItems[selectedIndex] = { ...updatedSelectedItems[selectedIndex], ...updates };
      setSelectedItems(updatedSelectedItems);
    }

    return true;
  };

  // Move media items to a different folder
  const moveMedia = (ids: string[], targetFolder: string): boolean => {
    // Check if target folder exists
    if (!folders.some(folder => folder.path === targetFolder)) {
      return false;
    }

    // Get source folders to update counts
    const itemsToMove = mediaItems.filter(item => ids.includes(item.id));
    const sourceFoldersMap = itemsToMove.reduce<Record<string, number>>((acc, item) => {
      acc[item.folder] = (acc[item.folder] || 0) + 1;
      return acc;
    }, {});

    // Update media items
    const updatedMediaItems = mediaItems.map(item => {
      if (ids.includes(item.id)) {
        return { ...item, folder: targetFolder };
      }
      return item;
    });

    // Update folder counts
    const updatedFolders = folders.map(folder => {
      if (folder.path === targetFolder) {
        const addCount = itemsToMove.length;
        return { ...folder, itemCount: folder.itemCount + addCount };
      }

      if (sourceFoldersMap[folder.path]) {
        return { ...folder, itemCount: folder.itemCount - sourceFoldersMap[folder.path] };
      }

      return folder;
    });

    setMediaItems(updatedMediaItems);
    setFolders(updatedFolders);
    return true;
  };

  return (
    <MediaContext.Provider value={{
      mediaItems,
      selectedItems,
      selectItem,
      deselectItem,
      selectMultiple,
      clearSelection,

      folders,
      currentFolder,
      navigateToFolder,
      createFolder,
      deleteFolder,
      renameFolder,

      uploadMedia,
      deleteMedia,
      updateMedia,
      moveMedia,

      searchTerm,
      setSearchTerm,
      filterByType,
      setFilterByType,
      sortBy,
      setSortBy,
      sortDirection,
      setSortDirection,

      totalSize,
      totalCount,
      typeBreakdown
    }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
