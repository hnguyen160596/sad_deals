import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

// Document category types
export enum DocumentCategory {
  LEGAL = 'legal',
  MARKETING = 'marketing',
  FINANCIAL = 'financial',
  PRODUCT = 'product',
  HUMAN_RESOURCES = 'human_resources',
  CONTRACTS = 'contracts',
  POLICIES = 'policies',
  MISCELLANEOUS = 'miscellaneous'
}

// Document metadata
export interface DocumentVersion {
  id: string;
  version: number;
  url: string;
  filename: string;
  size: number;
  createdAt: string;
  createdBy: string; // User ID
  comment: string;
  status: 'draft' | 'published' | 'archived';
}

// Full document interface
export interface Document {
  id: string;
  title: string;
  description: string;
  category: DocumentCategory;
  tags: string[];
  currentVersion: number;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  accessLevel: 'private' | 'team' | 'public';
  accessUsers?: string[]; // Array of user IDs who can access this document
  accessRoles?: string[]; // Array of roles that can access this document
  isStarred: boolean;
  isFavorite: boolean;
  isTemplate: boolean;
  meta: Record<string, any>;
}

// Document activities for audit trail
export interface DocumentActivity {
  id: string;
  documentId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'downloaded' | 'shared' | 'published' | 'archived' | 'restored';
  details: string;
  timestamp: string;
  versionNumber?: number;
}

// Interface for Context
interface DocumentContextType {
  // Document state
  documents: Document[];
  filteredDocuments: Document[];
  selectedDocumentId: string | null;
  documentActivities: DocumentActivity[];
  isLoading: boolean;
  error: string | null;

  // Filters and search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: DocumentCategory | null;
  setSelectedCategory: (category: DocumentCategory | null) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  sortBy: 'title' | 'date' | 'size' | 'category';
  setSortBy: (sortBy: 'title' | 'date' | 'size' | 'category') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;

  // Document operations
  createDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>, file: File, comment: string) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Omit<Document, 'versions' | 'currentVersion'>>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<boolean>;

  // Version operations
  uploadNewVersion: (documentId: string, file: File, comment: string) => Promise<DocumentVersion>;
  getDocumentVersion: (documentId: string, versionNumber: number) => DocumentVersion | null;
  compareVersions: (documentId: string, versionA: number, versionB: number) => { added: string[], removed: string[], changed: string[] };
  setVersionStatus: (documentId: string, versionNumber: number, status: 'draft' | 'published' | 'archived') => Promise<boolean>;

  // Document selection
  selectDocument: (id: string | null) => void;

  // Favorites and starred
  toggleStar: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<boolean>;

  // Access control
  updateDocumentAccess: (id: string, accessLevel: 'private' | 'team' | 'public', accessUsers?: string[], accessRoles?: string[]) => Promise<boolean>;

  // Activity and audit
  getDocumentActivities: (documentId: string) => DocumentActivity[];
  logDocumentActivity: (documentId: string, action: DocumentActivity['action'], details: string, versionNumber?: number) => void;
}

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create context with default values
const DocumentContext = createContext<DocumentContextType>({
  documents: [],
  filteredDocuments: [],
  selectedDocumentId: null,
  documentActivities: [],
  isLoading: false,
  error: null,

  searchTerm: '',
  setSearchTerm: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  selectedTags: [],
  setSelectedTags: () => {},
  sortBy: 'date',
  setSortBy: () => {},
  sortDirection: 'desc',
  setSortDirection: () => {},

  createDocument: async () => ({} as Document),
  updateDocument: async () => ({} as Document),
  deleteDocument: async () => false,

  uploadNewVersion: async () => ({} as DocumentVersion),
  getDocumentVersion: () => null,
  compareVersions: () => ({ added: [], removed: [], changed: [] }),
  setVersionStatus: async () => false,

  selectDocument: () => {},

  toggleStar: async () => false,
  toggleFavorite: async () => false,

  updateDocumentAccess: async () => false,

  getDocumentActivities: () => [],
  logDocumentActivity: () => {}
});

// Provider component
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();

  // State for documents and activities
  const [documents, setDocuments] = useState<Document[]>(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      return JSON.parse(savedDocuments);
    }

    // Sample documents for demo
    return [
      {
        id: '1',
        title: 'Privacy Policy',
        description: 'Official privacy policy for the website',
        category: DocumentCategory.LEGAL,
        tags: ['policy', 'legal', 'privacy'],
        currentVersion: 2,
        versions: [
          {
            id: 'v1',
            version: 1,
            url: 'https://example.com/documents/privacy-policy-v1.pdf',
            filename: 'privacy-policy-v1.pdf',
            size: 1024 * 512, // 512 KB
            createdAt: new Date('2025-01-15').toISOString(),
            createdBy: '1', // admin user
            comment: 'Initial version',
            status: 'archived'
          },
          {
            id: 'v2',
            version: 2,
            url: 'https://example.com/documents/privacy-policy-v2.pdf',
            filename: 'privacy-policy-v2.pdf',
            size: 1024 * 520, // 520 KB
            createdAt: new Date('2025-03-10').toISOString(),
            createdBy: '1', // admin user
            comment: 'Updated for GDPR compliance',
            status: 'published'
          }
        ],
        createdAt: new Date('2025-01-15').toISOString(),
        updatedAt: new Date('2025-03-10').toISOString(),
        ownerId: '1', // admin user
        accessLevel: 'public',
        isStarred: true,
        isFavorite: true,
        isTemplate: false,
        meta: {}
      },
      {
        id: '2',
        title: 'Marketing Campaign Plan Q2 2025',
        description: 'Detailed marketing strategy for Q2 2025',
        category: DocumentCategory.MARKETING,
        tags: ['marketing', 'q2', 'strategy'],
        currentVersion: 3,
        versions: [
          {
            id: 'v1',
            version: 1,
            url: 'https://example.com/documents/marketing-q2-2025-v1.docx',
            filename: 'marketing-q2-2025-v1.docx',
            size: 1024 * 1024 * 2.3, // 2.3 MB
            createdAt: new Date('2025-02-01').toISOString(),
            createdBy: '2', // editor user
            comment: 'Initial draft',
            status: 'archived'
          },
          {
            id: 'v2',
            version: 2,
            url: 'https://example.com/documents/marketing-q2-2025-v2.docx',
            filename: 'marketing-q2-2025-v2.docx',
            size: 1024 * 1024 * 2.5, // 2.5 MB
            createdAt: new Date('2025-02-15').toISOString(),
            createdBy: '2', // editor user
            comment: 'Added budget section',
            status: 'archived'
          },
          {
            id: 'v3',
            version: 3,
            url: 'https://example.com/documents/marketing-q2-2025-v3.docx',
            filename: 'marketing-q2-2025-v3.docx',
            size: 1024 * 1024 * 2.8, // 2.8 MB
            createdAt: new Date('2025-03-05').toISOString(),
            createdBy: '1', // admin user
            comment: 'Final approval with executive feedback',
            status: 'published'
          }
        ],
        createdAt: new Date('2025-02-01').toISOString(),
        updatedAt: new Date('2025-03-05').toISOString(),
        ownerId: '2', // editor user
        accessLevel: 'team',
        accessRoles: ['admin', 'editor'],
        isStarred: false,
        isFavorite: true,
        isTemplate: false,
        meta: {}
      },
      {
        id: '3',
        title: 'Employee Handbook Template',
        description: 'Template for creating employee handbooks',
        category: DocumentCategory.HUMAN_RESOURCES,
        tags: ['hr', 'template', 'onboarding'],
        currentVersion: 1,
        versions: [
          {
            id: 'v1',
            version: 1,
            url: 'https://example.com/documents/employee-handbook-template.docx',
            filename: 'employee-handbook-template.docx',
            size: 1024 * 1024 * 1.5, // 1.5 MB
            createdAt: new Date('2025-01-20').toISOString(),
            createdBy: '1', // admin user
            comment: 'Initial template',
            status: 'published'
          }
        ],
        createdAt: new Date('2025-01-20').toISOString(),
        updatedAt: new Date('2025-01-20').toISOString(),
        ownerId: '1', // admin user
        accessLevel: 'team',
        accessRoles: ['admin', 'editor', 'moderator'],
        isStarred: true,
        isFavorite: false,
        isTemplate: true,
        meta: {}
      }
    ];
  });

  const [documentActivities, setDocumentActivities] = useState<DocumentActivity[]>(() => {
    const savedActivities = localStorage.getItem('documentActivities');
    if (savedActivities) {
      return JSON.parse(savedActivities);
    }

    // Sample activities for demo
    return [
      {
        id: '1',
        documentId: '1',
        userId: '1',
        action: 'created',
        details: 'Created document',
        timestamp: new Date('2025-01-15').toISOString(),
        versionNumber: 1
      },
      {
        id: '2',
        documentId: '1',
        userId: '1',
        action: 'updated',
        details: 'Updated for GDPR compliance',
        timestamp: new Date('2025-03-10').toISOString(),
        versionNumber: 2
      },
      {
        id: '3',
        documentId: '1',
        userId: '1',
        action: 'published',
        details: 'Published version 2',
        timestamp: new Date('2025-03-10').toISOString(),
        versionNumber: 2
      },
      {
        id: '4',
        documentId: '2',
        userId: '2',
        action: 'created',
        details: 'Created document',
        timestamp: new Date('2025-02-01').toISOString(),
        versionNumber: 1
      },
      {
        id: '5',
        documentId: '2',
        userId: '2',
        action: 'updated',
        details: 'Added budget section',
        timestamp: new Date('2025-02-15').toISOString(),
        versionNumber: 2
      },
      {
        id: '6',
        documentId: '2',
        userId: '1',
        action: 'updated',
        details: 'Final approval with executive feedback',
        timestamp: new Date('2025-03-05').toISOString(),
        versionNumber: 3
      },
      {
        id: '7',
        documentId: '2',
        userId: '1',
        action: 'published',
        details: 'Published version 3',
        timestamp: new Date('2025-03-05').toISOString(),
        versionNumber: 3
      },
      {
        id: '8',
        documentId: '3',
        userId: '1',
        action: 'created',
        details: 'Created document template',
        timestamp: new Date('2025-01-20').toISOString(),
        versionNumber: 1
      },
      {
        id: '9',
        documentId: '3',
        userId: '1',
        action: 'published',
        details: 'Published template',
        timestamp: new Date('2025-01-20').toISOString(),
        versionNumber: 1
      }
    ];
  });

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'size' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save documents to localStorage when they change
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  // Save activities to localStorage when they change
  useEffect(() => {
    localStorage.setItem('documentActivities', JSON.stringify(documentActivities));
  }, [documentActivities]);

  // Apply filters and sorting to documents
  const filteredDocuments = documents.filter(doc => {
    // Apply search filter
    const matchesSearch = searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply category filter
    const matchesCategory = selectedCategory === null || doc.category === selectedCategory;

    // Apply tags filter
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => doc.tags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  }).sort((a, b) => {
    // Apply sorting
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        break;
      case 'size': {
        const aSize = a.versions[a.currentVersion - 1]?.size || 0;
        const bSize = b.versions[b.currentVersion - 1]?.size || 0;
        comparison = bSize - aSize;
        break;
      }
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }

    return sortDirection === 'asc' ? comparison * -1 : comparison;
  });

  // Create a new document
  const createDocument = async (
    docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>,
    file: File,
    comment: string
  ): Promise<Document> => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a document');
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, we would upload the file to a server
      // For demo purposes, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create document version
      const version: DocumentVersion = {
        id: generateId(),
        version: 1,
        url: URL.createObjectURL(file), // In a real app, this would be a server URL
        filename: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        comment,
        status: 'draft'
      };

      // Create new document
      const newDocument: Document = {
        id: generateId(),
        ...docData,
        currentVersion: 1,
        versions: [version],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: currentUser.id
      };

      // Update state
      setDocuments([...documents, newDocument]);

      // Log activity
      logDocumentActivity(newDocument.id, 'created', 'Created document', 1);

      return newDocument;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update document metadata
  const updateDocument = async (
    id: string,
    updates: Partial<Omit<Document, 'versions' | 'currentVersion'>>
  ): Promise<Document> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update a document');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the document
      const docIndex = documents.findIndex(doc => doc.id === id);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      // Make sure the user has permission to update this document
      const doc = documents[docIndex];
      if (doc.ownerId !== currentUser.id && !currentUser.isAdmin) {
        throw new Error('You do not have permission to update this document');
      }

      // Update the document
      const updatedDoc = {
        ...doc,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update state
      const newDocuments = [...documents];
      newDocuments[docIndex] = updatedDoc;
      setDocuments(newDocuments);

      // Log activity
      logDocumentActivity(id, 'updated', 'Updated document metadata');

      return updatedDoc;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete a document');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the document
      const doc = documents.find(doc => doc.id === id);
      if (!doc) {
        throw new Error('Document not found');
      }

      // Make sure the user has permission to delete this document
      if (doc.ownerId !== currentUser.id && !currentUser.isAdmin) {
        throw new Error('You do not have permission to delete this document');
      }

      // Remove the document
      setDocuments(documents.filter(doc => doc.id !== id));

      // Log activity
      logDocumentActivity(id, 'deleted', 'Deleted document');

      // If this document was selected, deselect it
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a new version of a document
  const uploadNewVersion = async (
    documentId: string,
    file: File,
    comment: string
  ): Promise<DocumentVersion> => {
    if (!currentUser) {
      throw new Error('You must be logged in to upload a new version');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the document
      const docIndex = documents.findIndex(doc => doc.id === documentId);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      // Make sure the user has permission to update this document
      const doc = documents[docIndex];
      if (doc.ownerId !== currentUser.id && !currentUser.isAdmin) {
        throw new Error('You do not have permission to update this document');
      }

      // In a real app, we would upload the file to a server
      // For demo purposes, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new version
      const newVersion: DocumentVersion = {
        id: generateId(),
        version: doc.currentVersion + 1,
        url: URL.createObjectURL(file), // In a real app, this would be a server URL
        filename: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id,
        comment,
        status: 'draft'
      };

      // Update the document
      const updatedDoc = {
        ...doc,
        currentVersion: doc.currentVersion + 1,
        versions: [...doc.versions, newVersion],
        updatedAt: new Date().toISOString()
      };

      // Update state
      const newDocuments = [...documents];
      newDocuments[docIndex] = updatedDoc;
      setDocuments(newDocuments);

      // Log activity
      logDocumentActivity(documentId, 'updated', `Uploaded version ${newVersion.version}`, newVersion.version);

      return newVersion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific version of a document
  const getDocumentVersion = (documentId: string, versionNumber: number): DocumentVersion | null => {
    const doc = documents.find(doc => doc.id === documentId);
    if (!doc) return null;

    return doc.versions.find(version => version.version === versionNumber) || null;
  };

  // Compare two versions of a document (simulated for demo)
  const compareVersions = (
    documentId: string,
    versionA: number,
    versionB: number
  ): { added: string[], removed: string[], changed: string[] } => {
    // In a real application, this would perform an actual diff between document versions
    // For demo purposes, we'll return simulated diff results
    return {
      added: ['Paragraph on page 3', 'New section in appendix'],
      removed: ['Outdated reference on page 7'],
      changed: ['Updated policy wording on page 2', 'Fixed formatting throughout document']
    };
  };

  // Set the status of a document version
  const setVersionStatus = async (
    documentId: string,
    versionNumber: number,
    status: 'draft' | 'published' | 'archived'
  ): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('You must be logged in to change version status');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the document
      const docIndex = documents.findIndex(doc => doc.id === documentId);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      // Make sure the user has permission
      const doc = documents[docIndex];
      if (doc.ownerId !== currentUser.id && !currentUser.isAdmin) {
        throw new Error('You do not have permission to change version status');
      }

      // Find the version
      const versionIndex = doc.versions.findIndex(v => v.version === versionNumber);
      if (versionIndex === -1) {
        throw new Error('Version not found');
      }

      // If publishing, make sure there's only one published version
      if (status === 'published') {
        // Archive any currently published versions
        doc.versions = doc.versions.map(v =>
          v.status === 'published' ? { ...v, status: 'archived' } : v
        );
      }

      // Update the version status
      doc.versions[versionIndex] = {
        ...doc.versions[versionIndex],
        status
      };

      // Update state
      const newDocuments = [...documents];
      newDocuments[docIndex] = {
        ...doc,
        updatedAt: new Date().toISOString()
      };
      setDocuments(newDocuments);

      // Log activity
      logDocumentActivity(documentId, status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'updated', `Changed version ${versionNumber} status to ${status}`, versionNumber);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Document selection
  const selectDocument = (id: string | null) => {
    setSelectedDocumentId(id);

    // Log view activity if selecting a document
    if (id && currentUser) {
      logDocumentActivity(id, 'viewed', 'Viewed document');
    }
  };

  // Toggle star status
  const toggleStar = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('You must be logged in to star a document');
    }

    try {
      const docIndex = documents.findIndex(doc => doc.id === id);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      const doc = documents[docIndex];
      const newDocuments = [...documents];
      newDocuments[docIndex] = {
        ...doc,
        isStarred: !doc.isStarred
      };

      setDocuments(newDocuments);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('You must be logged in to favorite a document');
    }

    try {
      const docIndex = documents.findIndex(doc => doc.id === id);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      const doc = documents[docIndex];
      const newDocuments = [...documents];
      newDocuments[docIndex] = {
        ...doc,
        isFavorite: !doc.isFavorite
      };

      setDocuments(newDocuments);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Update document access settings
  const updateDocumentAccess = async (
    id: string,
    accessLevel: 'private' | 'team' | 'public',
    accessUsers?: string[],
    accessRoles?: string[]
  ): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('You must be logged in to update document access');
    }

    try {
      const docIndex = documents.findIndex(doc => doc.id === id);
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      // Make sure the user has permission
      const doc = documents[docIndex];
      if (doc.ownerId !== currentUser.id && !currentUser.isAdmin) {
        throw new Error('You do not have permission to update document access');
      }

      // Update access settings
      const newDocuments = [...documents];
      newDocuments[docIndex] = {
        ...doc,
        accessLevel,
        accessUsers,
        accessRoles,
        updatedAt: new Date().toISOString()
      };

      setDocuments(newDocuments);

      // Log activity
      logDocumentActivity(id, 'updated', `Updated access level to ${accessLevel}`);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Get activities for a specific document
  const getDocumentActivities = (documentId: string): DocumentActivity[] => {
    return documentActivities.filter(activity => activity.documentId === documentId);
  };

  // Log a document activity
  const logDocumentActivity = (
    documentId: string,
    action: DocumentActivity['action'],
    details: string,
    versionNumber?: number
  ) => {
    if (!currentUser) return;

    const newActivity: DocumentActivity = {
      id: generateId(),
      documentId,
      userId: currentUser.id,
      action,
      details,
      timestamp: new Date().toISOString(),
      versionNumber
    };

    setDocumentActivities([...documentActivities, newActivity]);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      filteredDocuments,
      selectedDocumentId,
      documentActivities,
      isLoading,
      error,

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
      updateDocument,
      deleteDocument,

      uploadNewVersion,
      getDocumentVersion,
      compareVersions,
      setVersionStatus,

      selectDocument,

      toggleStar,
      toggleFavorite,

      updateDocumentAccess,

      getDocumentActivities,
      logDocumentActivity
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook
export const useDocuments = () => useContext(DocumentContext);
