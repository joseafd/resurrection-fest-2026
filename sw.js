const CACHE_NAME = 'resu-2026-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Attempt to pre-cache but don't fail if some dev-only files are missing
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('Pre-caching warning:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate caching
self.addEventListener('fetch', (event) => {
  // Only cache GET requests within our origin (exclude dev-server websockets, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: return cached copy but update in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {/* ignore network failures */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache new successful requests dynamically
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
