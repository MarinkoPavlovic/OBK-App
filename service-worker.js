const CACHE_NAME = 'objektermittlungs-app-v1.2.10';
const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './icons/app-192.png',
  './icons/app-512.png',
  './icons/app-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  const appAsset = APP_FILES.some(path => new URL(path, self.registration.scope).href === request.url);
  if (request.mode !== 'navigate' && appAsset) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone()));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
  }
});
