/* ============================================
   sw.js — Service Worker · Álvaro Orozco
   Cache-first para estáticos, network-first para HTML.
   Sube CACHE_VERSION al publicar cambios.
   ============================================ */
const CACHE_VERSION = 'aoz-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/politica.html',
  '/css/main.css',
  '/js/main.js',
  '/js/projects.js',
  '/js/renderer.js',
  '/manifest.webmanifest',
  '/src/img/logo-full.svg',
  '/src/img/logo-iso.svg',
  '/src/img/icon-192.png',
  '/src/img/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Solo gestionamos GET del mismo origen; lo demás (APIs, fuentes externas) va directo a la red.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // HTML: network-first para tener siempre la última versión, con fallback a caché offline.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Estáticos: cache-first, y refresca la caché en segundo plano.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
