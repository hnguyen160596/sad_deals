import React, { createContext, useState, useContext, useEffect } from 'react';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Define permissions as constants for consistency
export const PERMISSIONS = {
  // Content Management
  MANAGE_PAGES: 'manage_pages',
  EDIT_PAGES: 'edit_pages',
  PUBLISH_PAGES: 'publish_pages',

  // Media Management
  MANAGE_MEDIA: 'manage_media',
  UPLOAD_MEDIA: 'upload_media',
  DELETE_MEDIA: 'delete_media',

  // Deal Management
  MANAGE_DEALS: 'manage_deals',
  EDIT_DEALS: 'edit_deals',
  PUBLISH_DEALS: 'publish_deals',

  // Store Management
  MANAGE_STORES: 'manage_stores',

  // User Management
  MANAGE_USERS: 'manage_users',
  EDIT_USERS: 'edit_users',

  // Site Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SEO: 'manage_seo',
  MANAGE_DESIGN: 'manage_design',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',

  // Comments/Chat Moderation
  MODERATE_COMMENTS: 'moderate_comments',

  // API Integrations
  MANAGE_API_INTEGRATIONS: 'manage_api_integrations',
  VIEW_API_INTEGRATIONS: 'view_api_integrations',

  // System
  SYSTEM_SETTINGS: 'system_settings',
  ACCESS_LOGS: 'access_logs'
};

// Define user roles with associated permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  SUBSCRIBER: 'subscriber'
};

// Map roles to their permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super admin has all permissions
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_PAGES, PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
    PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.DELETE_MEDIA,
    PERMISSIONS.MANAGE_DEALS, PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
    PERMISSIONS.MANAGE_STORES, PERMISSIONS.MANAGE_USERS, PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_SETTINGS, PERMISSIONS.MANAGE_SEO, PERMISSIONS.MANAGE_DESIGN,
    PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MODERATE_COMMENTS, PERMISSIONS.MANAGE_API_INTEGRATIONS,
    PERMISSIONS.VIEW_API_INTEGRATIONS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
    PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.AUTHOR]: [
    PERMISSIONS.EDIT_PAGES,
    PERMISSIONS.UPLOAD_MEDIA,
    PERMISSIONS.EDIT_DEALS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS
  ],
  [ROLES.SUBSCRIBER]: []
};

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  role: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending' | 'banned';
  preferences: {
    darkMode?: boolean;
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    }
  };
  twoFactorAuth: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
    verifiedOn?: string; // ISO date string
    lastUsed?: string; // ISO date string
    setupComplete: boolean;
  };
}

// Role definition
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  verifyTwoFactorCode: (userId: string, code: string) => boolean;
  logout: () => void;
  register: (email: string, password: string, displayName: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => boolean;
  deleteUser: (id: string) => boolean;
  updateUserPermissions: (id: string, permissions: string[]) => boolean;
  updateUserRole: (id: string, role: string) => boolean;

  // Role management
  allRoles: Role[];
  createRole: (role: Role) => boolean;
  updateRole: (role: Role) => boolean;
  deleteRole: (roleId: string) => boolean;
  PERMISSIONS: typeof PERMISSIONS;

  // Two-factor authentication methods
  setupTwoFactor: (userId: string) => { secret: string; qrCodeUrl: string };
  verifyTwoFactorSetup: (userId: string, code: string) => boolean;
  disableTwoFactor: (userId: string, password: string) => boolean;
  generateBackupCodes: (userId: string) => string[];
}

// Generate a simple unique ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 15);

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);

  // Initialize users and roles from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      // Load users
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Create default admin user if no users exist
        const adminUser: User = {
          id: generateId(),
          email: 'admin@example.com',
          password: 'admin123', // In a real app, this would be hashed
          displayName: 'Admin User',
          photoURL: 'https://via.placeholder.com/150',
          isAdmin: true,
          role: ROLES.ADMIN,
          permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
          createdAt: new Date(),
          status: 'active',
          preferences: {
            darkMode: false,
            language: 'en',
            notifications: {
              email: true,
              push: true
            }
          },
          twoFactorAuth: {
            enabled: false,
            setupComplete: false
          }
        };
        setUsers([adminUser]);
        localStorage.setItem('users', JSON.stringify([adminUser]));
      }

      // Load roles
      const savedRoles = localStorage.getItem('roles');
      if (savedRoles) {
        setRoles(JSON.parse(savedRoles));
      } else {
        // Initialize default roles
        const defaultRoles: Role[] = [
          {
            id: 'role_super_admin',
            name: 'Super Administrator',
            permissions: Object.values(PERMISSIONS),
            description: 'Full access to all system features and settings',
            isSystem: true
          },
          {
            id: 'role_admin',
            name: 'Administrator',
            permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
            description: 'Can manage most aspects of the site, but cannot change system settings',
            isSystem: true
          },
          {
            id: 'role_editor',
            name: 'Editor',
            permissions: ROLE_PERMISSIONS[ROLES.EDITOR],
            description: 'Can edit and publish content',
            isSystem: true
          },
          {
            id: 'role_subscriber',
            name: 'Subscriber',
            permissions: [],
            description: 'Regular user with minimal permissions',
            isSystem: true
          }
        ];
        setRoles(defaultRoles);
        localStorage.setItem('roles', JSON.stringify(defaultRoles));
      }

      // Check for logged in user
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    return new Promise((resolve, reject) => {
      try {
        const user = users.find(u => u.email === email);

        // For demo purposes, accept any password
        if (user) {
          // In a real app, you would verify the password hash here
          const updatedUser = {
            ...user,
            lastLogin: new Date()
          };

          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          resolve({ success: true });
        } else {
          // For demo purposes, create a new user if not found
          const newUser: User = {
            id: generateId(),
            email,
            password, // In a real app, this would be hashed
            displayName: email.split('@')[0],
            photoURL: 'https://via.placeholder.com/150',
            isAdmin: false,
            role: ROLES.SUBSCRIBER,
            permissions: [],
            createdAt: new Date(),
            status: 'active',
            preferences: {
              darkMode: false,
              language: 'en',
              notifications: {
                email: true,
                push: true
              }
            },
            twoFactorAuth: {
              enabled: false,
              setupComplete: false
            }
          };

          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          setCurrentUser(newUser);

          localStorage.setItem('users', JSON.stringify(updatedUsers));
          localStorage.setItem('currentUser', JSON.stringify(newUser));

          resolve({ success: true });
        }
      } catch (error) {
        reject(new Error('Login failed. Please try again.'));
      }
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Register new user
  const register = (email: string, password: string, displayName: string) => {
    try {
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        return false;
      }

      const newUser: User = {
        id: generateId(),
        email,
        password, // In a real app, this would be hashed
        displayName,
        photoURL: 'https://via.placeholder.com/150',
        isAdmin: false,
        role: ROLES.SUBSCRIBER,
        permissions: [],
        createdAt: new Date(),
        status: 'active',
        preferences: {
          darkMode: false,
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        twoFactorAuth: {
          enabled: false,
          setupComplete: false
        }
      };

      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  // Permission checking
  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  // Role checking
  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Two-factor authentication
  const setupTwoFactor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'SalesAholics', secret);

    // Generate QR code
    let qrCodeUrl = '';
    QRCode.toDataURL(otpAuthUrl)
      .then(url => {
        qrCodeUrl = url;
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });

    // Update user
    const updatedUser = {
      ...user,
      twoFactorAuth: {
        ...user.twoFactorAuth,
        secret,
        setupComplete: false
      }
    };

    // Update users array
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // If this is the current user, update currentUser
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    return { secret, qrCodeUrl };
  };

  // Verify a two-factor code
  const verifyTwoFactorCode = (userId: string, code: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.twoFactorAuth.secret) {
      return false;
    }

    try {
      return authenticator.verify({
        token: code,
        secret: user.twoFactorAuth.secret
      });
    } catch (error) {
      console.error('Error verifying two-factor code:', error);
      return false;
    }
  };

  // Complete setup of two-factor authentication
  const verifyTwoFactorSetup = (userId: string, code: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.twoFactorAuth.secret) {
      return false;
    }

    try {
      const isValid = authenticator.verify({
        token: code,
        secret: user.twoFactorAuth.secret
      });

      if (isValid) {
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
          Math.random().toString(36).substring(2, 8)
        );

        // Update user
        const updatedUser = {
          ...user,
          twoFactorAuth: {
            ...user.twoFactorAuth,
            enabled: true,
            setupComplete: true,
            verifiedOn: new Date().toISOString(),
            backupCodes
          }
        };

        // Update users array
        const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // If this is the current user, update currentUser
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying two-factor setup:', error);
      return false;
    }
  };

  // Disable two-factor authentication
  const disableTwoFactor = (userId: string, password: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return false;
    }

    // In a real app, you would verify the password here
    // For demo purposes, we'll just accept any password

    // Update user
    const updatedUser = {
      ...user,
      twoFactorAuth: {
        enabled: false,
        setupComplete: false
      }
    };

    // Update users array
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // If this is the current user, update currentUser
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    return true;
  };

  // Generate backup codes
  const generateBackupCodes = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return [];
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8)
    );

    // Update user
    const updatedUser = {
      ...user,
      twoFactorAuth: {
        ...user.twoFactorAuth,
        backupCodes
      }
    };

    // Update users array
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // If this is the current user, update currentUser
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    return backupCodes;
  };

  // User management functions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    try {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      const updatedUser = { ...users[userIndex], ...updates };
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;

      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // If this is the current user, update currentUser
      if (currentUser && currentUser.id === id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const deleteUser = (id: string) => {
    try {
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) return false;

      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // If this is the current user, log them out
      if (currentUser && currentUser.id === id) {
        logout();
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const updateUserPermissions = (id: string, permissions: string[]) => {
    return updateUser(id, { permissions });
  };

  const updateUserRole = (id: string, role: string) => {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    return updateUser(id, { role, permissions: rolePermissions });
  };

  // Role management functions
  const createRole = (role: Role) => {
    const newRole = { ...role, id: role.id || `role_${generateId()}` };
    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    return true;
  };

  const updateRole = (role: Role) => {
    const roleIndex = roles.findIndex(r => r.id === role.id);
    if (roleIndex === -1) return false;

    const updatedRoles = [...roles];
    updatedRoles[roleIndex] = role;
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    return true;
  };

  const deleteRole = (roleId: string) => {
    // Don't allow deleting system roles
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return false;

    const updatedRoles = roles.filter(r => r.id !== roleId);
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    return true;
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        verifyTwoFactorCode,
        logout,
        register,
        hasPermission,
        hasRole,
        addUser,
        updateUser,
        deleteUser,
        updateUserPermissions,
        updateUserRole,
        allRoles: roles,
        createRole,
        updateRole,
        deleteRole,
        PERMISSIONS,
        setupTwoFactor,
        verifyTwoFactorSetup,
        disableTwoFactor,
        generateBackupCodes
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the auth context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
