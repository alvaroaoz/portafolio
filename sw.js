/* ============================================
   sw.js — Service Worker · Álvaro Orozco
   Network-first para todo (HTML, CSS y JS): con conexión se sirve siempre
   lo publicado y la caché solo se usa sin conexión. Así un deploy nunca
   mezcla HTML nuevo con CSS/JS viejos.
   Al publicar cambios sube CACHE_VERSION. Si cambias el ?v= de CSS/JS en
   index.html y politica.html, actualiza también ASSET_V.
   ============================================ */
const CACHE_VERSION = 'aoz-v10';
const ASSET_V = '?v=7';
const PRECACHE = [
  '/',
  '/index.html',
  '/politica.html',
  '/css/fonts.css' + ASSET_V,
  '/css/main.css' + ASSET_V,
  '/css/fonts/lato-400.woff2',
  '/css/fonts/lato-700.woff2',
  '/css/fonts/eb-garamond-500-700.woff2',
  '/css/fonts/roboto-mono.woff2',
  '/js/main.js' + ASSET_V,
  '/js/projects.js' + ASSET_V,
  '/js/renderer.js' + ASSET_V,
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

  // Network-first: la respuesta de red se guarda en caché para usarla sin conexión.
  const isPage = request.mode === 'navigate' || request.destination === 'document';
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(async () =>
        (await caches.match(request)) ||
        (isPage && (await caches.match('/index.html'))) ||
        Response.error()
      )
  );
});
