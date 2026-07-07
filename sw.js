// ============================================================
// sw.js — MAWJA Service Worker
// ضروري باش يخدم التطبيق كـ PWA حقيقي (يتنزل على الهاتف)
// ============================================================

const CACHE_NAME = 'mawja-app-v1';
const CACHE_URLS = [
  '/app.html',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // API calls دائماً من الشبكة مباشرة (ما نخزنوهم في الكاش)
  if (event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
