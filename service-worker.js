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
      return response || fetch(event.request);
    })
  );
});
