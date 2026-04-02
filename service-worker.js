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
        './ttfs/qrcode.min.js',
        './service-worker.js',
        './sw.js'
      ]).catch(err => {
        console.error('Cache install failed:', err);
      });
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
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache-first strategy: return cached response if available
      if (response) {
        // Update cache in background for next time
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open('stagecoach-spoof-v1').then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Network fetch failed, but we already have cached response
        });
        return response;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then(networkResponse => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          caches.open('stagecoach-spoof-v1').then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed and not in cache
        if (event.request.mode === 'navigate') {
          // For page navigations, return index.html if available
          return caches.match('./index.html');
        } else {
          // For other requests, return empty response to avoid 404
          return new Response('', { status: 200, statusText: 'OK', headers: { 'Content-Type': 'text/plain' } });
        }
      });
    })
  );
});
