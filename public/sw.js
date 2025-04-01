
const CACHE_NAME = 'doorfinder-cache-v2';
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

// Cache and return requests with improved image handling
self.addEventListener('fetch', (event) => {
  // Apply different strategies based on request type
  const url = new URL(event.request.url);
  
  // Special handling for image requests
  if (event.request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    event.respondWith(imageStrategy(event.request));
    return;
  }
  
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

// Special strategy for images - stale-while-revalidate
const imageStrategy = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchAndCache = async () => {
    try {
      const networkResponse = await fetch(request);
      
      // Cache the new response (only if successful)
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      console.error('Error fetching image:', error);
      // If the network request fails and we don't have a cached response, 
      // we need to throw to trigger the catch block
      if (!cachedResponse) throw error;
      return cachedResponse;
    }
  };
  
  // Return cached response immediately if available (stale)
  if (cachedResponse) {
    // Update the cache in the background
    fetchAndCache().catch(console.error);
    return cachedResponse;
  }
  
  // If nothing in cache, wait for the network response
  return fetchAndCache();
};

// Update service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['doorfinder-cache-v2'];
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
