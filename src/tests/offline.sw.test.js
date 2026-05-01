// ─── tests/offline.sw.test.js ────────────────────────────────────────────────
// Unit tests for service worker offline behavior.
// Tests the sw.js logic by checking its structure and cache strategy expectations.
// NOTE: Full browser offline simulation requires Playwright/Cypress (manual QA).
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sw = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

describe('Service Worker structure', () => {
  it('defines a CACHE_VERSION constant', () => {
    expect(sw).toMatch(/const CACHE_VERSION\s*=/);
  });

  it('CACHE_VERSION is non-empty string', () => {
    const match = sw.match(/const CACHE_VERSION\s*=\s*'([^']+)'/);
    expect(match).not.toBeNull();
    expect(match[1].length).toBeGreaterThan(0);
  });

  it('pre-caches index.html on install', () => {
    expect(sw).toContain('index.html');
    expect(sw).toContain('PRECACHE_URLS');
  });

  it('handles install event', () => {
    expect(sw).toContain("addEventListener('install'");
  });

  it('handles activate event (old cache cleanup)', () => {
    expect(sw).toContain("addEventListener('activate'");
    expect(sw).toContain('ALL_CACHES');
  });

  it('handles fetch event', () => {
    expect(sw).toContain("addEventListener('fetch'");
  });

  it('uses cache-first strategy for static assets', () => {
    expect(sw).toContain('CACHE_STATIC');
    expect(sw).toMatch(/cache.*first|Cache-First/i);
  });

  it('uses network-first strategy for navigation', () => {
    // Network-first implies it tries network, falls back to cache
    expect(sw).toMatch(/network.*first|Network-First|fetch\(.*catch/si);
  });

  it('calls skipWaiting on install', () => {
    expect(sw).toContain('skipWaiting');
  });

  it('calls clients.claim on activate', () => {
    expect(sw).toContain('clients.claim');
  });

  it('defines BASE path for GitHub Pages', () => {
    expect(sw).toContain('BASE');
    expect(sw).toMatch(/Nugget-Nihongo-SSW-Konstruksi/);
  });

  it('cleans up old caches on activate', () => {
    expect(sw).toMatch(/delete.*CACHE|caches\.delete/);
  });
});

describe('Service Worker — storage independence', () => {
  // The app uses localStorage (not SW cache) for progress data.
  // These tests confirm SW only caches static assets, not user data.
  it('SW does not reference localStorage', () => {
    expect(sw).not.toContain('localStorage');
  });

  it('SW does not reference ssw-progress keys', () => {
    expect(sw).not.toContain('ssw-progress');
    expect(sw).not.toContain('ssw-srs');
  });
});
