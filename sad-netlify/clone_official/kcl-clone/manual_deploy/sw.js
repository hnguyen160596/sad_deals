// Cache names for different types of assets
const CACHE_NAMES = {
  static: 'static-cache-v1',
  images: 'images-cache-v1',
  fonts: 'fonts-cache-v1',
  pages: 'pages-cache-v1',
  telegram: 'telegram-cache-v1'
};

// Assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/images/deals/deal-placeholder.png',
  '/images/icons/icon-placeholder.png',
  '/images/stores/placeholder/store-placeholder.png'
];

// Regular expression for assets to cache
const CACHE_PATTERNS = {
  images: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  fonts: /\.(?:woff|woff2|ttf|otf|eot)$/,
  static: /\.(?:js|css)$/,
  telegram: /telegram|messages/
};

// Cache duration (in seconds)
const CACHE_DURATION = {
  images: 7 * 24 * 60 * 60, // 7 days for images
  telegram: 60 * 60, // 1 hour for telegram messages
  static: 24 * 60 * 60 // 1 day for static resources
};

// Function to determine appropriate cache for a request
const getCacheForRequest = (request) => {
  const url = new URL(request.url);

  // API requests should not be cached (except Telegram images)
  if (url.pathname.startsWith('/api/') && !url.pathname.includes('telegram')) {
    return null;
  }

  // Determine the correct cache based on the URL pattern
  if (CACHE_PATTERNS.images.test(url.pathname)) {
    return CACHE_NAMES.images;
  } else if (CACHE_PATTERNS.fonts.test(url.pathname)) {
    return CACHE_NAMES.fonts;
  } else if (CACHE_PATTERNS.telegram.test(url.pathname)) {
    return CACHE_NAMES.telegram;
  } else if (CACHE_PATTERNS.static.test(url.pathname)) {
    return CACHE_NAMES.static;
  }

  // For HTML requests, use pages cache
  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    return CACHE_NAMES.pages;
  }

  return null;
};

// Function to determine if a response should be cached
const shouldCacheResponse = (response) => {
  // Only cache successful responses
  return response && response.status === 200 && response.type === 'basic';
};

// Install event - pre-cache important assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('Service Worker: Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Return true if the cache name is not in our current cache names
              const isOldCache = !Object.values(CACHE_NAMES).includes(cacheName);
              if (isOldCache) {
                console.log('Service Worker: Removing old cache', cacheName);
              }
              return isOldCache;
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Function to add a timestamped response to cache
const addToCache = async (cacheName, request, response) => {
  if (!shouldCacheResponse(response)) return;

  // Clone the response since we're going to consume it
  const responseToCache = response.clone();

  try {
    const cache = await caches.open(cacheName);

    // Add response to cache with timestamp
    const headers = new Headers(responseToCache.headers);
    headers.append('sw-fetched-on', new Date().toISOString());

    // Create a new response with the updated headers
    const augmentedResponse = new Response(
      await responseToCache.blob(),
      {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      }
    );

    cache.put(request, augmentedResponse);
    console.log('Service Worker: Cached resource', request.url);
  } catch (error) {
    console.error('Service Worker: Cache add failed:', error);
  }
};

// Function to determine if cached response is still valid
const isCacheValid = (cachedResponse, cacheName) => {
  // Get the timestamp from the cached response
  const fetchedOn = cachedResponse.headers.get('sw-fetched-on');
  if (!fetchedOn) return false;

  const fetchDate = new Date(fetchedOn).getTime();
  const now = new Date().getTime();

  // Calculate the age of the cached response in seconds
  const ageInSeconds = (now - fetchDate) / 1000;

  // Determine the maximum age based on cache type
  let maxAgeInSeconds;
  if (cacheName === CACHE_NAMES.images) {
    maxAgeInSeconds = CACHE_DURATION.images;
  } else if (cacheName === CACHE_NAMES.telegram) {
    maxAgeInSeconds = CACHE_DURATION.telegram;
  } else {
    maxAgeInSeconds = CACHE_DURATION.static;
  }

  return ageInSeconds < maxAgeInSeconds;
};

// Fetch event with stale-while-revalidate strategy for most resources
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Determine the appropriate cache for this request
  const cacheName = getCacheForRequest(event.request);

  // If this request shouldn't be cached, proceed with normal fetch
  if (!cacheName) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Use stale-while-revalidate strategy
  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Start fetch in the background
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Add new response to cache
            addToCache(cacheName, event.request, networkResponse);
            return networkResponse;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed, falling back to cache', error);

            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            // For image requests, return a placeholder
            if (CACHE_PATTERNS.images.test(event.request.url)) {
              return caches.match('/images/deals/deal-placeholder.png');
            }

            // Otherwise, propagate the error
            throw error;
          });

        // If we have a valid cached response, use it
        if (cachedResponse && isCacheValid(cachedResponse, cacheName)) {
          // If it's a Telegram resource, try to refresh it in the background
          if (CACHE_PATTERNS.telegram.test(event.request.url)) {
            // Return cached response immediately, but still update cache in background
            fetchPromise.catch(error => {
              console.log('Service Worker: Background refresh failed for Telegram resource', error);
            });
            return cachedResponse;
          }

          return cachedResponse;
        }

        // If no cached response or it's expired, wait for the fetch
        return fetchPromise;
      });
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Command to clear specific cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const cacheToClear = event.data.cacheName;
    if (CACHE_NAMES[cacheToClear]) {
      caches.delete(CACHE_NAMES[cacheToClear]).then(() => {
        console.log(`Service Worker: Cleared ${cacheToClear} cache`);
      });
    } else {
      console.log(`Service Worker: Invalid cache name: ${cacheToClear}`);
    }
  }

  // Command to clear all caches
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    Promise.all(Object.values(CACHE_NAMES).map(name => caches.delete(name)))
      .then(() => {
        console.log('Service Worker: Cleared all caches');
      });
  }
});
