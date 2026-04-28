// ─── sw.js — SSW Konstruksi Service Worker ────────────────────────────────────
// Strategy:
//   Static assets (JS, CSS, fonts, icons) → Cache-First
//   Google Fonts → Cache-First (separate cache, longer TTL)
//   Everything else → Network-First with cache fallback
//
// Cache versioning: bump CACHE_VERSION on every deploy to force SW update.
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION   = 'ssw-v1';
const CACHE_STATIC    = `${CACHE_VERSION}-static`;
const CACHE_FONTS     = `${CACHE_VERSION}-fonts`;
const ALL_CACHES      = [CACHE_STATIC, CACHE_FONTS];

const BASE = '/Nugget-Nihongo-SSW-Konstruksi';

// Assets to pre-cache on install (shell)
const PRECACHE_URLS = [
  `${BASE}/`,
  `${BASE}/index.html`,
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
// Delete old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !ALL_CACHES.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim()) // take control immediately
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Google Fonts → Cache-First (long TTL, rarely changes)
  if (url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, CACHE_FONTS));
    return;
  }

  // Same-origin static assets → Cache-First
  if (url.origin === self.location.origin) {
    // HTML → Network-First (always try to get fresh shell)
    if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(networkFirst(request, CACHE_STATIC));
      return;
    }
    // JS, CSS, images, fonts, manifests → Cache-First
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // External requests → pass through (no caching)
});

// ── Cache-First strategy ───────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()); // async, don't await
    }
    return response;
  } catch {
    // Offline and not cached — return a minimal offline response for navigations
    if (request.mode === 'navigate') {
      const fallback = await cache.match(`${BASE}/`) ||
                       await cache.match(`${BASE}/index.html`);
      if (fallback) return fallback;
    }
    return new Response('Offline — buka app dulu saat online.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ── Network-First strategy ────────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request) ||
                   await cache.match(`${BASE}/`) ||
                   await cache.match(`${BASE}/index.html`);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
