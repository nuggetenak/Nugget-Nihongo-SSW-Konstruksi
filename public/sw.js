// ─── sw.js — SSW Konstruksi Service Worker ────────────────────────────────────
// Strategy:
//   Static assets (JS, CSS, fonts, icons) → Cache-First
//   Everything else → Network-First with cache fallback
//
// Cache versioning: bump CACHE_VERSION on every deploy to force SW update.
// ─────────────────────────────────────────────────────────────────────────────

// Kept equal to package.json's version. NOT what invalidates the cache in
// production: .github/workflows/deploy.yml rewrites this to a UTC timestamp
// immediately before the build, so the committed value never ships. It is the
// only signal a reader gets about which release a local build corresponds to,
// and it had drifted to 4.23.0 against a 6.0.0 package — which reads exactly
// like the stale-cache bug docs/PWA_RELEASE_SPEC.md §2 warns about, while being
// harmless. See that section for why a timestamp is the right deployed scheme.
const CACHE_VERSION = 'ssw-v6.0.0';
const CACHE_STATIC    = `${CACHE_VERSION}-static`;
const ALL_CACHES      = [CACHE_STATIC];

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
    // Deliberately no immediate self-activation call here — see UI_UX_PLAN.md
    // item 37. A new worker now stays in the `waiting` state so an open
    // session keeps running on the JS bundle it started with (its lazy
    // chunks still resolve). The client prompts the user and only tells this
    // worker to take over once they choose to update (see the message
    // listener below).
  );
});

// ── Message ────────────────────────────────────────────────────────────────
// The client posts this after the user accepts the update toast.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
      .then(() => self.clients.claim()) // take control immediately once activated
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Google Fonts CDN retired (item 61, 2026-08-26) -- fonts are self-hosted
  // and same-origin now, so they're already covered by the same-origin
  // cache-first branch below. No cross-origin font handling needed.

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
