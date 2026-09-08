// ─── tests/sw-precache-resilience.test.js ────────────────────────────────────
// UI_UX_PLAN item 130 — one failed request used to discard the whole precache.
//
// `Cache.addAll` is atomic by spec. The install handler was a bare
// `cache.addAll(PRECACHE_URLS)` over the ~38 URLs generate-precache.mjs writes
// in at postbuild, with no catch: one 404 or one dropped connection rejected
// the whole promise, rejected `waitUntil`, and discarded the installation.
// Nothing was cached — not even `/` or index.html — and nothing surfaced. A
// first-time user on a flaky connection got no offline capability at all
// rather than the core loop; a returning user silently kept the old worker.
//
// offline.sw.test.js checks sw.js's *shape* by string match, which is what let
// this ship: the strings were all present and correct. These tests actually run
// the install handler in a fake worker global and assert what ends up cached.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import vm from 'node:vm';

const SW_SOURCE = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
const BASE = '/Nugget-Nihongo-SSW-Konstruksi';

/**
 * Runs sw.js in a sandboxed worker global, fires `install`, and returns what
 * the handler managed to cache.
 *
 * @param {object} opts
 * @param {string[]} opts.urls    what PRECACHE_URLS should contain
 * @param {string[]} opts.failing which of those URLs the network rejects
 */
async function installWorker({ urls, failing = [] }) {
  const cached = new Set();
  const listeners = {};
  const errors = [];

  const cache = {
    add: (url) =>
      failing.includes(url)
        ? Promise.reject(new TypeError(`Failed to fetch ${url}`))
        : Promise.resolve(cached.add(url)),
    // Real addAll semantics: all-or-nothing.
    addAll: async (list) => {
      if (list.some((u) => failing.includes(u))) {
        throw new TypeError('addAll: at least one request failed');
      }
      list.forEach((u) => cached.add(u));
    },
  };

  const sandbox = {
    self: {
      addEventListener: (type, fn) => {
        listeners[type] = fn;
      },
      skipWaiting: () => {},
      clients: { claim: () => Promise.resolve() },
      location: { origin: 'https://example.test' },
    },
    caches: { open: async () => cache, keys: async () => [], delete: async () => true },
    fetch: async () => ({ ok: true }),
    console: { error: (...a) => errors.push(a), log: () => {} },
    URL,
    TypeError,
    Promise,
  };
  sandbox.globalThis = sandbox;

  const source = SW_SOURCE.replace(
    /const PRECACHE_URLS = \[[\s\S]*?\];/,
    `const PRECACHE_URLS = ${JSON.stringify(urls)};`
  );
  vm.runInNewContext(source, sandbox);

  let pending;
  listeners.install({ waitUntil: (p) => (pending = p) });
  const outcome = await pending.then(
    () => 'installed',
    (e) => e
  );
  return { outcome, cached, errors };
}

const SHELL = [`${BASE}/`, `${BASE}/index.html`];
const ASSETS = [`${BASE}/assets/app.js`, `${BASE}/assets/app.css`, `${BASE}/fonts/dm-sans.woff2`];
const ALL = [...SHELL, ...ASSETS];

describe('service worker install', () => {
  it('caches everything when the network cooperates', async () => {
    const { outcome, cached } = await installWorker({ urls: ALL });
    expect(outcome).toBe('installed');
    expect([...cached].sort()).toEqual([...ALL].sort());
  });

  it('still installs when one asset fails, and keeps the shell', async () => {
    const { outcome, cached } = await installWorker({
      urls: ALL,
      failing: [`${BASE}/fonts/dm-sans.woff2`],
    });
    // Before the fix this rejected and the cache was left completely empty.
    expect(outcome).toBe('installed');
    expect(cached.has(`${BASE}/`)).toBe(true);
    expect(cached.has(`${BASE}/index.html`)).toBe(true);
    expect(cached.has(`${BASE}/assets/app.js`)).toBe(true);
    expect(cached.has(`${BASE}/fonts/dm-sans.woff2`)).toBe(false);
  });

  it('survives every optional asset failing at once', async () => {
    const { outcome, cached } = await installWorker({ urls: ALL, failing: ASSETS });
    expect(outcome).toBe('installed');
    expect([...cached].sort()).toEqual([...SHELL].sort());
  });

  it('names what it could not cache instead of failing silently', async () => {
    const { errors } = await installWorker({ urls: ALL, failing: [`${BASE}/assets/app.css`] });
    expect(errors).toHaveLength(1);
    expect(errors[0].join(' ')).toMatch(/1\/3 assets missed the precache/);
    expect(JSON.stringify(errors[0])).toContain('app.css');
  });

  it('fails the install when the shell itself cannot be cached', async () => {
    // Deliberate: with no entry point there is nothing to install, and a worker
    // that activates without one would serve a blank page offline.
    const { outcome, cached } = await installWorker({
      urls: ALL,
      failing: [`${BASE}/index.html`],
    });
    expect(outcome).toBeInstanceOf(TypeError);
    expect(cached.size).toBe(0);
  });

  it('treats the shell by name, not by position in PRECACHE_URLS', async () => {
    // generate-precache.mjs rewrites the array wholesale; an index-based split
    // would quietly demote the shell if that script ever reorders its output.
    const reordered = [...ASSETS, ...SHELL];
    const { outcome, cached } = await installWorker({
      urls: reordered,
      failing: [`${BASE}/assets/app.js`],
    });
    expect(outcome).toBe('installed');
    expect(cached.has(`${BASE}/index.html`)).toBe(true);
  });
});
