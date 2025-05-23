import type React from 'react';
import { createContext, useState, useContext, useEffect, type ReactNode } from 'react'
import { trackEvent } from '../components/Analytics';
import { useUser } from './UserContext';

// Define types for notifications and context
export interface NotificationPreferences {
  dailyDeals: boolean;
  favoriteStores: boolean;
  priceDrops: boolean;
  comments: boolean;
  coupons: boolean;
  weeklyNewsletter: boolean;
  marketing: boolean;
}

export interface NotificationSubscription {
  id: string;
  email: string;
  preferences: NotificationPreferences;
  subscribedOn: string;
  storePreferences: string[]; // Array of store IDs/names
  dealCategoryPreferences: string[]; // Array of deal category IDs/names
  verified: boolean;
  lastEmailSent?: string;
}

interface NotificationContextType {
  isSubscribed: boolean;
  subscription: NotificationSubscription | null;
  isLoading: boolean;
  subscribe: (email: string, preferences?: Partial<NotificationPreferences>) => Promise<void>;
  unsubscribe: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  addStorePreference: (storeId: string) => Promise<void>;
  removeStorePreference: (storeId: string) => Promise<void>;
  addDealCategoryPreference: (categoryId: string) => Promise<void>;
  removeDealCategoryPreference: (categoryId: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType>({
  isSubscribed: false,
  subscription: null,
  isLoading: false,
  subscribe: async () => {},
  unsubscribe: async () => {},
  updatePreferences: async () => {},
  addStorePreference: async () => {},
  removeStorePreference: async () => {},
  addDealCategoryPreference: async () => {},
  removeDealCategoryPreference: async () => {},
  sendVerificationEmail: async () => {},
});

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  dailyDeals: true,
  favoriteStores: true,
  priceDrops: false,
  comments: false,
  coupons: true,
  weeklyNewsletter: true,
  marketing: false,
};

// Helper function for mock API delay
const mockAPIDelay = () => new Promise(resolve => setTimeout(resolve, 600));

// Create the provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<NotificationSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Check for existing subscription in localStorage on mount
  useEffect(() => {
    const loadSubscription = () => {
      try {
        const savedSubscription = localStorage.getItem('notification_subscription');
        if (savedSubscription) {
          setSubscription(JSON.parse(savedSubscription));
        } else if (isAuthenticated && user?.email) {
          // If the user is authenticated but has no subscription, check if there's a subscription
          // with their email address (simulating a database lookup)
          // In a real app, this would be an API call to check if the user's email is subscribed
        }
      } catch (error) {
        console.error('Failed to load notification subscription:', error);
      }
    };

    loadSubscription();
  }, [isAuthenticated, user]);

  // Save subscription to localStorage when it changes
  useEffect(() => {
    if (subscription) {
      localStorage.setItem('notification_subscription', JSON.stringify(subscription));
    }
  }, [subscription]);

  // Subscribe to notifications
  const subscribe = async (email: string, preferences?: Partial<NotificationPreferences>): Promise<void> => {
    setIsLoading(true);
    try {
      await mockAPIDelay();

      // Create a new subscription
      const newSubscription: NotificationSubscription = {
        id: `subscription_${Date.now()}`,
        email,
        preferences: { ...defaultPreferences, ...preferences },
        subscribedOn: new Date().toISOString(),
        storePreferences: [],
        dealCategoryPreferences: [],
        verified: false,
      };

      setSubscription(newSubscription);
      trackEvent('Notifications', 'Subscribe');
    } catch (error) {
      trackEvent('Notifications', 'Subscribe Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from notifications
  const unsubscribe = async (): Promise<void> => {
    if (!subscription) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      localStorage.removeItem('notification_subscription');
      setSubscription(null);
      trackEvent('Notifications', 'Unsubscribe');
    } catch (error) {
      trackEvent('Notifications', 'Unsubscribe Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update notification preferences
  const updatePreferences = async (preferences: Partial<NotificationPreferences>): Promise<void> => {
    if (!subscription) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      const updatedSubscription = {
        ...subscription,
        preferences: {
          ...subscription.preferences,
          ...preferences,
        },
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Update Preferences');
    } catch (error) {
      trackEvent('Notifications', 'Update Preferences Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a store to preferences
  const addStorePreference = async (storeId: string): Promise<void> => {
    if (!subscription) return;
    if (subscription.storePreferences.includes(storeId)) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      const updatedSubscription = {
        ...subscription,
        storePreferences: [...subscription.storePreferences, storeId],
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Add Store Preference', storeId);
    } catch (error) {
      trackEvent('Notifications', 'Add Store Preference Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a store from preferences
  const removeStorePreference = async (storeId: string): Promise<void> => {
    if (!subscription) return;
    if (!subscription.storePreferences.includes(storeId)) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      const updatedSubscription = {
        ...subscription,
        storePreferences: subscription.storePreferences.filter(id => id !== storeId),
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Remove Store Preference', storeId);
    } catch (error) {
      trackEvent('Notifications', 'Remove Store Preference Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a deal category to preferences
  const addDealCategoryPreference = async (categoryId: string): Promise<void> => {
    if (!subscription) return;
    if (subscription.dealCategoryPreferences.includes(categoryId)) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      const updatedSubscription = {
        ...subscription,
        dealCategoryPreferences: [...subscription.dealCategoryPreferences, categoryId],
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Add Category Preference', categoryId);
    } catch (error) {
      trackEvent('Notifications', 'Add Category Preference Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a deal category from preferences
  const removeDealCategoryPreference = async (categoryId: string): Promise<void> => {
    if (!subscription) return;
    if (!subscription.dealCategoryPreferences.includes(categoryId)) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      const updatedSubscription = {
        ...subscription,
        dealCategoryPreferences: subscription.dealCategoryPreferences.filter(id => id !== categoryId),
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Remove Category Preference', categoryId);
    } catch (error) {
      trackEvent('Notifications', 'Remove Category Preference Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async (): Promise<void> => {
    if (!subscription) return;
    if (subscription.verified) return;

    setIsLoading(true);
    try {
      await mockAPIDelay();
      // In a real app, this would send an actual email with a verification link
      console.log(`Sending verification email to ${subscription.email}`);

      // For demo purposes, automatically mark as verified after a delay
      const updatedSubscription = {
        ...subscription,
        verified: true,
      };
      setSubscription(updatedSubscription);
      trackEvent('Notifications', 'Send Verification Email');
    } catch (error) {
      trackEvent('Notifications', 'Send Verification Email Error', (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: NotificationContextType = {
    isSubscribed: !!subscription,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    updatePreferences,
    addStorePreference,
    removeStorePreference,
    addDealCategoryPreference,
    removeDealCategoryPreference,
    sendVerificationEmail,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notification context
export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
