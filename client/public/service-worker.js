/*
  Bhakti Sangeet Service Worker
  ------------------------------------------------------------------
  Responsibility: cache the APPLICATION SHELL (HTML/CSS/JS/icons) so the
  app can boot with zero network. It never touches the personal music
  library — songs and metadata live only in IndexedDB (see src/db/db.js).

  Strategy:
   - App shell (navigation requests, same-origin static assets): cache-first,
     falling back to network, and updating the cache in the background.
   - /api/* requests (YouTube search etc.): network-only, never cached,
     because that data requires internet by design.
*/

const CACHE_VERSION = 'bhakti-sangeet-shell-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('bhakti-sangeet-shell-') && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API calls (YouTube search needs live internet data).
  if (url.pathname.startsWith('/api/')) {
    return; // let the browser handle it normally (network-only)
  }

  // Only handle same-origin GET requests for the shell.
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: serve cached index.html when offline (SPA shell).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first, update cache in background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
