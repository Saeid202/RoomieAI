// Service Worker for HomieAI PWA
const CACHE_NAME = 'homieai-v2';
const urlsToCache = [
  '/manifest.json',
  '/og.png',
  '/offline.html',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(urlsToCache).catch((err) => {
        console.log('Cache addAll error:', err);
        // Don't fail installation if some files can't be cached
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      // Skip external requests - don't cache them
      if (!event.request.url.includes(self.location.origin)) {
        try {
          return fetch(event.request);
        } catch (error) {
          console.log('External fetch failed:', error);
          return new Response('Network error', { status: 500 });
        }
      }

      // Check if this is an HTML request
      const isHtmlRequest = event.request.headers.get('accept')?.includes('text/html');
      
      // Check if this is a static asset
      const staticAssetExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp'];
      const isStaticAsset = staticAssetExtensions.some(ext => event.request.url.endsWith(ext));
      
      if (isHtmlRequest) {
        // Network-first strategy for HTML requests (no caching)
        try {
          const response = await fetch(event.request);
          return response;
        } catch (error) {
          // Fallback to offline page
          return caches.match('/offline.html').catch(() => {
            return new Response('Offline - please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
        }
      } else if (isStaticAsset) {
        // Cache-first strategy for static assets
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        try {
          const response = await fetch(event.request);
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        } catch (error) {
          // Return offline page if available
          return caches.match('/offline.html').catch(() => {
            return new Response('Offline - please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
        }
      } else {
        // For all other requests, fetch directly without caching
        return fetch(event.request);
      }
    })()
  );
});
