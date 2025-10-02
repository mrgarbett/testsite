self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('stagecoach-spoof-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './ttfs/student.svg',
        './ttfs/CircularStd-Book.ttf',
        './ttfs/CircularStd-Bold.ttf',
        './ttfs/CircularStd-Black.otf',
        './service-worker.js',
        './sw.js',
        // Add other assets as needed
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'stagecoach-spoof-v1').map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Always serve from cache if available
      if (response) {
        return response;
      }
      // If not cached, try to fetch and cache it
      return fetch(event.request).then(networkResponse => {
        // Only cache GET requests and successful responses
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          caches.open('stagecoach-spoof-v1').then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Optionally, fallback to index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
