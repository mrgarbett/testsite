self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('spoof-card-v1').then(cache => {
      return cache.addAll([
        './test.html',
        './ttfs/CircularStd-Book.ttf',
        './ttfs/CircularStd-Bold.ttf',
        './ttfs/student.svg',
        // Add other assets if needed
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
