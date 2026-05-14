// Simple Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method !== 'GET') return;

  // This is a minimal cache-first strategy but we'll just bypass it to keep it simple and fulfill PWA installability requirements
  event.respondWith(fetch(event.request));
});
