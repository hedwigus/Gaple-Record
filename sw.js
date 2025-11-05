const CACHE_NAME = 'domino-scorekeeper-cache-v1';

// Add all the assets that make up the app shell.
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/GameSetup.tsx',
  '/components/Scoreboard.tsx',
  '/components/icons.tsx',
  '/constants.ts',
  '/types.ts',
  '/icon.svg',
];

// Install event: cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
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
});

// Fetch event: serve from cache first, with a network fallback.
// This strategy is good for the app shell and dynamic content.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If we have a cached response, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // Check for a valid response
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          // Clone the response and add it to the cache for next time.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
              // We only cache GET requests.
              if(event.request.method === 'GET' && event.request.url.startsWith('http')){
                cache.put(event.request, responseToCache);
              }
          });
          
          return networkResponse;
        });
      }).catch(error => {
          // This will be triggered if the network fails and there's no cache.
          // You could return an offline fallback page here.
          console.error('Fetch failed:', error);
          // For now, we'll just let the browser handle the error.
      })
  );
});
