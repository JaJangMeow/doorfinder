
const CACHE_NAME = 'doorfinder-cache-v3';
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

// Fallback placeholder image
const FALLBACK_IMAGE = '/placeholder.svg';

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

// Enhanced strategy for images - stale-while-revalidate with priority
const imageStrategy = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Check if this is a high-priority image
  const isHighPriority = request.headers.get('X-Priority') === 'high' || 
                         request.url.includes('priority=high');
  
  // Function to fetch and cache the image
  const fetchAndCache = async () => {
    try {
      // Add a timeout for network requests to avoid hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 5000);
      });
      
      const networkResponse = await Promise.race([
        fetch(request, { cache: 'no-cache' }),
        timeoutPromise
      ]);
      
      // Cache the new response (only if successful)
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      console.error('Error fetching image:', error);
      
      // If network request fails and we don't have a cached response,
      // try to return a placeholder image
      if (!cachedResponse) {
        const placeholder = await cache.match(FALLBACK_IMAGE);
        if (placeholder) return placeholder;
        
        // If no placeholder in cache, try to fetch it directly
        try {
          return await fetch(FALLBACK_IMAGE);
        } catch (error) {
          throw error; // Ultimately fail if we can't get even a placeholder
        }
      }
      return cachedResponse;
    }
  };
  
  // For high priority images or if nothing in cache, wait for network
  if (isHighPriority || !cachedResponse) {
    try {
      return await fetchAndCache();
    } catch (error) {
      if (cachedResponse) return cachedResponse;
      
      // Try to return a placeholder as last resort
      try {
        const placeholder = await cache.match(FALLBACK_IMAGE);
        if (placeholder) return placeholder;
      } catch (e) {
        console.error('Failed to fetch placeholder:', e);
      }
      
      throw error; // Fail if all else fails
    }
  }
  
  // For normal priority with cached version: return cache immediately, update in background
  fetchAndCache().catch(console.error);
  return cachedResponse;
};

// Update service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['doorfinder-cache-v3']; // Updated cache version
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
