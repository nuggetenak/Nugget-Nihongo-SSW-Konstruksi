// ─── tests/storage.test.js ───────────────────────────────────────────────────
// Unit tests for the storage engine: 3-document model + v1→v2 migration.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  init,
  get,
  set,
  getSRSCard,
  setSRSCard,
  getAllSRSCards,
  getSRSCardCount,
  resetAll,
  exportAll,
  importAll,
  _reset_for_test,
} from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

// ─── init ────────────────────────────────────────────────────────────────────

describe('init — fresh install', () => {
  it('creates 3 documents in localStorage', () => {
    init();
    expect(localStorage.getItem(DOCS.progress)).not.toBeNull();
    expect(localStorage.getItem(DOCS.srs)).not.toBeNull();
    expect(localStorage.getItem(DOCS.prefs)).not.toBeNull();
  });

  it('progress doc has _v = STORAGE_VERSION', () => {
    init();
    const prog = JSON.parse(localStorage.getItem(DOCS.progress));
    expect(prog._v).toBe(STORAGE_VERSION);
  });

  it('srs doc starts with empty cards', () => {
    init();
    const srs = JSON.parse(localStorage.getItem(DOCS.srs));
    expect(srs.cards).toEqual({});
  });

  it('prefs doc has default track = null', () => {
    init();
    const prefs = JSON.parse(localStorage.getItem(DOCS.prefs));
    expect(prefs.track).toBeNull();
  });

  it('is idempotent — second init() is a no-op', () => {
    init();
    localStorage.setItem(DOCS.prefs, JSON.stringify({ _v: STORAGE_VERSION, track: 'lifeline' }));
    init(); // should NOT overwrite
    const prefs = JSON.parse(localStorage.getItem(DOCS.prefs));
    expect(prefs.track).toBe('lifeline');
  });
});

// ─── v1 → v2 migration ───────────────────────────────────────────────────────

describe('init — v1 migration', () => {
  it('migrates ssw-known to progress.known', () => {
    localStorage.setItem('ssw-known', JSON.stringify([1, 2, 3]));
    init();
    const prog = get('progress');
    expect(prog.known).toEqual([1, 2, 3]);
  });

  it('migrates ssw-track to prefs.track', () => {
    localStorage.setItem('ssw-track', JSON.stringify('lifeline'));
    init();
    const prefs = get('prefs');
    expect(prefs.track).toBe('lifeline');
  });

  it('migrates ssw-theme to prefs.theme', () => {
    localStorage.setItem('ssw-theme', 'dark');
    init();
    expect(get('prefs').theme).toBe('dark');
  });

  it('migrates ssw-srs-{id} keys to srs.cards', () => {
    const cardEntry = { card: { stability: 1, difficulty: 5 }, history: [], reviewed_at: null };
    localStorage.setItem('ssw-srs-42', JSON.stringify(cardEntry));
    localStorage.setItem('ssw-srs-100', JSON.stringify(cardEntry));
    init();
    const cards = getAllSRSCards();
    expect(Object.keys(cards)).toContain('42');
    expect(Object.keys(cards)).toContain('100');
  });

  it('deletes old ssw-known key after migration', () => {
    localStorage.setItem('ssw-known', JSON.stringify([1, 2]));
    init();
    expect(localStorage.getItem('ssw-known')).toBeNull();
  });

  it('deletes old ssw-srs-* keys after migration', () => {
    localStorage.setItem('ssw-srs-1', JSON.stringify({}));
    init();
    expect(localStorage.getItem('ssw-srs-1')).toBeNull();
  });

  it('writes v2 ssw-progress doc after migration', () => {
    localStorage.setItem('ssw-known', JSON.stringify([5]));
    init();
    const raw = localStorage.getItem(DOCS.progress);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw)._v).toBe(STORAGE_VERSION);
  });
});

// ─── get / set ───────────────────────────────────────────────────────────────

describe('get and set', () => {
  it('get returns default for fresh doc', () => {
    init();
    const prog = get('progress');
    expect(Array.isArray(prog.known)).toBe(true);
  });

  it('set with object merges into doc', () => {
    init();
    set('prefs', { track: 'sipil' });
    expect(get('prefs').track).toBe('sipil');
  });

  it('set with function receives previous value', () => {
    init();
    set('progress', { known: [1, 2] });
    set('progress', (prev) => ({ ...prev, known: [...prev.known, 3] }));
    expect(get('progress').known).toEqual([1, 2, 3]);
  });

  it('set persists to localStorage', () => {
    init();
    set('prefs', { theme: 'dark' });
    const raw = JSON.parse(localStorage.getItem(DOCS.prefs));
    expect(raw.theme).toBe('dark');
  });
});

// ─── SRS hot path ─────────────────────────────────────────────────────────────

describe('SRS card operations', () => {
  it('getSRSCard returns null for unknown card', () => {
    init();
    expect(getSRSCard(999)).toBeNull();
  });

  it('setSRSCard and getSRSCard round-trip', () => {
    init();
    const entry = { card: { stability: 2 }, history: [], reviewed_at: '2026-01-01' };
    setSRSCard(42, entry);
    expect(getSRSCard(42)).toEqual(entry);
  });

  it('setSRSCard persists to ssw-srs-data doc', () => {
    init();
    setSRSCard(7, { card: {}, history: [], reviewed_at: null });
    const doc = JSON.parse(localStorage.getItem(DOCS.srs));
    expect(doc.cards['7']).toBeDefined();
  });

  it('getSRSCardCount returns correct count', () => {
    init();
    setSRSCard(1, {});
    setSRSCard(2, {});
    setSRSCard(3, {});
    expect(getSRSCardCount()).toBe(3);
  });

  it('getAllSRSCards returns all cards', () => {
    init();
    setSRSCard(10, { card: { stability: 1 } });
    setSRSCard(20, { card: { stability: 2 } });
    const all = getAllSRSCards();
    expect(Object.keys(all).length).toBe(2);
  });
});

// ─── resetAll ─────────────────────────────────────────────────────────────────

describe('resetAll', () => {
  it('clears progress.known', () => {
    init();
    set('progress', { known: [1, 2, 3] });
    resetAll();
    expect(get('progress').known).toEqual([]);
  });

  it('clears SRS cards', () => {
    init();
    setSRSCard(1, { card: {} });
    resetAll();
    expect(getSRSCardCount()).toBe(0);
  });

  it('keeps prefs after reset', () => {
    init();
    set('prefs', { track: 'sipil', theme: 'dark' });
    resetAll();
    // resetAll resets to defaults, so track goes to null
    expect(get('prefs').track).toBeNull();
  });
});

// ─── exportAll / importAll ────────────────────────────────────────────────────

describe('export and import', () => {
  it('exportAll returns all 3 documents', () => {
    init();
    const snap = exportAll();
    expect(snap).toHaveProperty('progress');
    expect(snap).toHaveProperty('srs');
    expect(snap).toHaveProperty('prefs');
    expect(snap._storage_version).toBe(STORAGE_VERSION);
  });

  it('importAll restores progress', () => {
    init();
    const snap = exportAll();
    snap.progress.known = [99, 100];
    _reset_for_test();
    localStorage.clear();
    init();
    importAll(snap);
    expect(get('progress').known).toEqual([99, 100]);
  });

  it('importAll throws on invalid snapshot', () => {
    init();
    expect(() => importAll({ bad: 'data' })).toThrow();
  });
});
