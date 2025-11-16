// Service Worker for data caching and offline support
const CACHE_NAME = 'performance-dashboard-v1';
const DATA_CACHE_NAME = 'dashboard-data-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cache opened');
      // Only cache index.html, other assets will be cached on demand
      return cache.add('/').catch((err) => {
        console.warn('[Service Worker] Failed to cache root:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache API requests for data (only if they exist)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              cache.put(request, responseToCache).catch((err) => {
                console.warn('[Service Worker] Failed to cache API response:', err);
              });
            }
            return response;
          })
          .catch((error) => {
            // Return cached data if network fails
            return cache.match(request).then((cached) => {
              if (cached) {
                return cached;
              }
              // If no cache and network fails, return error response
              return new Response(JSON.stringify({ error: 'Network error' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              });
            });
          });
      })
    );
    return;
  }

  // For static assets, use network-first strategy with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn('[Service Worker] Failed to cache:', err);
            });
          });
        }
        return response;
      })
      .catch((error) => {
        // If network fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cache and network fails, let the error propagate naturally
          // Don't try to fetch again to avoid infinite loops
          console.warn('[Service Worker] Network failed and no cache:', request.url);
          throw error;
        });
      })
  );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(DATA_CACHE_NAME);
  }
});



