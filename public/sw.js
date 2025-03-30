
const CACHE_NAME = 'doorfinder-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/doorfinderIcon-192x192.png',
  '/doorfinderIcon-512x512.png',
  '/favicon.svg',
  '/lovable-uploads/83895367-873f-49ab-ab0f-09cf6a9ea424.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return null;
      })
  );
});

// Update service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['doorfinder-cache-v1'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Claim clients so the SW is in control immediately
  self.clients.claim();
});
