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
// Bump this in the same commit as package.json's version, every time; it is a
// close-out step in docs/AGENT_WORKFLOW.md §3 because it was missed once already.
const CACHE_VERSION = 'ssw-v7.2.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const ALL_CACHES = [CACHE_STATIC];

const BASE = '/Nugget-Nihongo-SSW-Konstruksi';

// Assets to pre-cache on install (shell)
const PRECACHE_URLS = [`${BASE}/`, `${BASE}/index.html`];

// ── Install ────────────────────────────────────────────────────────────────
// The shell is required; everything else is best-effort.
//
// This was one `cache.addAll(PRECACHE_URLS)` with no catch, and `Cache.addAll`
// is atomic by spec: one failed request out of the ~38 the postbuild script
// writes in here rejects the whole promise, which rejects `waitUntil`, which
// discards the installation. Nothing was cached — not even `/` or index.html —
// and nothing surfaced. A first-time user on a flaky connection got zero
// offline capability instead of the core loop; a returning user silently kept
// the old worker. For an audience on unreliable connections that was the worst
// failure mode in the app: it turned a partial network into no app at all.
//
// Split in two so a missing font or an icon can no longer cost the shell.
// SHELL_URLS still uses addAll — if the app's own entry point cannot be
// cached there is nothing to install and failing loudly is right. The rest go
// through allSettled, so each one is independent and the failures are named in
// the console instead of vanishing.
// Named, not sliced by position: generate-precache.mjs rewrites PRECACHE_URLS
// wholesale at postbuild, and an index-based split would silently demote the
// shell to best-effort the day that script reorders its output.
const SHELL_URLS = [`${BASE}/`, `${BASE}/index.html`];
const OPTIONAL_URLS = PRECACHE_URLS.filter((url) => !SHELL_URLS.includes(url));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(async (cache) => {
      await cache.addAll(SHELL_URLS);
      const results = await Promise.allSettled(OPTIONAL_URLS.map((url) => cache.add(url)));
      const failed = results
        .map((r, i) => (r.status === 'rejected' ? OPTIONAL_URLS[i] : null))
        .filter(Boolean);
      if (failed.length) {
        console.error(
          `[sw] ${failed.length}/${OPTIONAL_URLS.length} assets missed the precache; ` +
            'the app is installed and will fetch them on demand:',
          failed
        );
      }
    })
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
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => caches.delete(key))
        )
      )
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
  const cache = await caches.open(cacheName);
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
      const fallback = (await cache.match(`${BASE}/`)) || (await cache.match(`${BASE}/index.html`));
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
    const cached =
      (await cache.match(request)) ||
      (await cache.match(`${BASE}/`)) ||
      (await cache.match(`${BASE}/index.html`));
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
