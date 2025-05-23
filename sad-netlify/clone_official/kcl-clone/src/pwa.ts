import { trackEvent } from './components/Analytics';

// Define a safer trackEvent wrapper
const safeTrackEvent = (category: string, action: string, label?: string) => {
  try {
    // Ensure trackEvent exists and is a function
    if (typeof trackEvent === 'function') {
      trackEvent(category, action, label);
    }
  } catch (error) {
    console.error('Error in safeTrackEvent:', error);
  }
};

// Service worker registration options
const SW_URL = '/sw.js';
const SW_SCOPE = '/';

// PWA configuration
export const PWA_CONFIG = {
  cacheNames: {
    static: 'static-cache-v1',
    images: 'images-cache-v1',
    fonts: 'fonts-cache-v1',
    pages: 'pages-cache-v1',
    telegram: 'telegram-cache-v1'
  }
};

// Utility function to check if app is in offline mode
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

// Show notification for service worker updates
const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Update notification in the UI
    const updateBar = document.createElement('div');
    updateBar.id = 'sw-update-bar';
    updateBar.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #982a4a;
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
    `;

    updateBar.innerHTML = `
      <div>
        <strong>New version available!</strong>
        <p style="margin: 0; font-size: 14px;">Refresh to update the app with new features and improvements.</p>
      </div>
      <div>
        <button id="sw-dismiss" style="background: transparent; border: 1px solid white; color: white; padding: 8px 12px; margin-right: 10px; cursor: pointer; border-radius: 4px;">
          Later
        </button>
        <button id="sw-update" style="background: white; border: none; color: #982a4a; padding: 8px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">
          Update Now
        </button>
      </div>
    `;

    document.body.appendChild(updateBar);

    // Set up click handlers
    document.getElementById('sw-update')?.addEventListener('click', () => {
      safeTrackEvent('PWA', 'Update Accepted', 'UI');
      document.body.removeChild(updateBar);

      // Skip waiting and refresh the page
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      window.location.reload();
    });

    document.getElementById('sw-dismiss')?.addEventListener('click', () => {
      safeTrackEvent('PWA', 'Update Dismissed', 'UI');
      document.body.removeChild(updateBar);
    });
  } catch (error) {
    console.error('Error showing update notification:', error);
  }
};

// Check for service worker updates
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    // Trigger an update check
    await registration.update();
    return true;
  } catch (error) {
    console.error('Failed to check for SW updates:', error);
    return false;
  }
};

// Clear a specific cache
export const clearCache = async (cacheName: keyof typeof PWA_CONFIG.cacheNames): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return false;

    // Post a message to clear specific cache
    registration.active.postMessage({
      type: 'CLEAR_CACHE',
      cacheName
    });

    safeTrackEvent('PWA', 'Cache Cleared', cacheName);
    return true;
  } catch (error) {
    console.error(`Failed to clear ${cacheName} cache:`, error);
    return false;
  }
};

// Clear all caches
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return false;

    // Post a message to clear all caches
    registration.active.postMessage({
      type: 'CLEAR_ALL_CACHES'
    });

    safeTrackEvent('PWA', 'All Caches Cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear all caches:', error);
    return false;
  }
};

// Register service worker
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
      console.log('Service workers not supported or unavailable');
      resolve(null);
      return;
    }

    try {
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE })
        .then((registration) => {
          console.log('Service worker successfully registered', registration);
          safeTrackEvent('PWA', 'Registered');

          // Add update handler
          if (registration.waiting) {
            showUpdateNotification(registration);
          }

          // Add controller change handler for when a new SW takes over
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New service worker activated');
            safeTrackEvent('PWA', 'Controller Changed');
          });

          // Add update found handler
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed and waiting');
                safeTrackEvent('PWA', 'Update Ready');
                showUpdateNotification(registration);
              }
            });
          });

          // Set up messaging between the page and service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Received message from service worker:', event.data);

            // Handle specific messages if needed
            if (event.data && event.data.type === 'CACHE_UPDATED') {
              safeTrackEvent('PWA', 'Cache Updated', event.data.cacheName);
            }
          });

          // Let the app know the service worker is ready to work offline
          if (registration.active) {
            console.log('App ready to work offline');
            safeTrackEvent('PWA', 'Offline Ready');
          }

          resolve(registration);
        })
        .catch((error) => {
          console.error('Service worker registration failed', error);
          safeTrackEvent('PWA', 'Registration Error', error?.message || 'Unknown error');
          resolve(null);
        });
    } catch (error) {
      console.error('Error setting up service worker:', error);
      safeTrackEvent('PWA', 'Setup Error', (error as Error)?.message);
      resolve(null);
    }
  });
}

// Get the current state of the service worker
export const getServiceWorkerState = async (): Promise<{
  registered: boolean;
  active: boolean;
  controller: boolean;
  updateAvailable: boolean;
}> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
      return {
        registered: false,
        active: false,
        controller: false,
        updateAvailable: false
      };
    }

    const registration = await navigator.serviceWorker.getRegistration();

    return {
      registered: !!registration,
      active: !!registration?.active,
      controller: !!navigator.serviceWorker.controller,
      updateAvailable: !!registration?.waiting
    };
  } catch (error) {
    console.error('Error getting service worker state:', error);
    return {
      registered: false,
      active: false,
      controller: false,
      updateAvailable: false
    };
  }
};

// Get statistics about cached resources
export const getCacheStats = async (): Promise<{
  [key: string]: {
    count: number;
    size: number;
    oldestItem?: Date;
    newestItem?: Date;
  };
}> => {
  try {
    if (typeof caches === 'undefined') {
      return {};
    }

    const stats: {
      [key: string]: {
        count: number;
        size: number;
        oldestItem?: Date;
        newestItem?: Date;
      };
    } = {};

    // Loop through each cache
    for (const cacheName of Object.values(PWA_CONFIG.cacheNames)) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      let totalSize = 0;
      let oldestDate: Date | undefined;
      let newestDate: Date | undefined;

      // Calculate sizes
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.clone().blob();
          totalSize += blob.size;

          // Get timestamp from headers
          const fetchedOn = response.headers.get('sw-fetched-on');
          if (fetchedOn) {
            const date = new Date(fetchedOn);
            if (!oldestDate || date < oldestDate) {
              oldestDate = date;
            }
            if (!newestDate || date > newestDate) {
              newestDate = date;
            }
          }
        }
      }

      stats[cacheName] = {
        count: keys.length,
        size: totalSize,
        oldestItem: oldestDate,
        newestItem: newestDate
      };
    }

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {};
  }
};
