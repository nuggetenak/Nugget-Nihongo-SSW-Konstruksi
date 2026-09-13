// ─── tests/storage.data-loss-guards.test.js ──────────────────────────────────
// The four ways this engine could still lose a learner's history, each held by a
// test that fails if the guard goes away. All four came out of the 2026-09-10
// external audits (KIMI §1.1/§1.2/§1.3, Genspark §3.4/§3.5), and all four were
// confirmed against this file before anything was changed.
//
// The thing they have in common is worth stating once: none of them is reachable
// by a user doing something unusual. A partially cleared site-data, a truncated
// sync write, a card rating — ordinary events. What made them dangerous is that
// the engine's careful paths (the migration registry, the quarantine, the
// newer-document `>=` rule) all sat next to one branch that wrote defaults.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import LZString from 'lz-string';
import {
  _reset_for_test,
  init,
  get,
  set,
  setSRSCard,
  getSRSCard,
  getLastMutatedAt,
  importAll,
  validateSnapshot,
  validateDelta,
  getCorruptionWarning,
} from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

const write = (key, obj) =>
  localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(obj)));
const read = (key) => JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(key)));

/** A realistic SRS document: the thing that cannot be reconstructed. */
function srsDoc(n = 40) {
  const cards = {};
  for (let i = 1; i <= n; i++) {
    cards[i] = {
      card: {
        due: '2026-10-01T00:00:00.000Z',
        stability: 12.5,
        difficulty: 5.2,
        reps: 7,
        lapses: 1,
      },
      history: [{ rating: 3, at: '2026-09-01T00:00:00.000Z' }],
      reviewed_at: '2026-09-01T00:00:00.000Z',
    };
  }
  return { _v: STORAGE_VERSION, cards };
}

describe('a missing progress document is not a fresh install', () => {
  // The branch this covers ran whenever `ssw-progress` was absent or unusable,
  // and it wrote freshDefaults() over all three documents. Losing one key
  // therefore cost the other two, and the expensive one is the SRS doc.
  it('keeps the SRS document when only progress is gone', () => {
    write(DOCS.srs, srsDoc(40));
    write(DOCS.prefs, { _v: STORAGE_VERSION, theme: 'dark', onboarded: true, dailyGoal: 30 });

    init();

    expect(Object.keys(get('srs').cards)).toHaveLength(40);
    expect(getSRSCard(7).card.stability).toBe(12.5);
    expect(read(DOCS.srs).cards['7'].card.reps).toBe(7);
  });

  it('keeps prefs too, including an onboarded flag', () => {
    write(DOCS.prefs, { _v: STORAGE_VERSION, theme: 'dark', onboarded: true, dailyGoal: 42 });

    init();

    // Losing this one is not history loss, but it does mean a returning user is
    // shown the first-run onboarding again, over data they already have.
    expect(get('prefs').onboarded).toBe(true);
    expect(get('prefs').dailyGoal).toBe(42);
  });

  it('rebuilds the progress document rather than leaving it null', () => {
    write(DOCS.srs, srsDoc(3));
    init();
    expect(get('progress')._v).toBe(STORAGE_VERSION);
    expect(Array.isArray(get('progress').known)).toBe(true);
    expect(read(DOCS.progress)._v).toBe(STORAGE_VERSION);
  });

  it('still writes all three when there is genuinely nothing there', () => {
    init();
    expect(read(DOCS.progress)._v).toBe(STORAGE_VERSION);
    expect(read(DOCS.srs)).toEqual({ _v: STORAGE_VERSION, cards: {} });
    expect(read(DOCS.prefs)._v).toBe(STORAGE_VERSION);
  });

  it('does not warn the user when nothing was actually lost', () => {
    // A rebuilt-but-absent progress doc is silent recovery. Reporting it would
    // put "your data could not be read and has been reset" on screen for a user
    // whose data is entirely intact — item 138's mistake in a new place.
    write(DOCS.srs, srsDoc(2));
    init();
    expect(getCorruptionWarning()).toHaveLength(0);
  });

  it('quarantines an unreadable progress document and keeps the siblings', () => {
    localStorage.setItem(DOCS.progress, 'not json at all{{{');
    write(DOCS.srs, srsDoc(12));

    init();

    expect(Object.keys(get('srs').cards)).toHaveLength(12);
    const warning = getCorruptionWarning();
    expect(warning).toHaveLength(1);
    expect(warning[0].doc).toBe(DOCS.progress);
    expect(localStorage.getItem(warning[0].backupKey)).toBe('not json at all{{{');
  });
});

describe('a gap in the migration registry does not become a write of defaults', () => {
  // Seeded at `_v: 2.5` on purpose: `from` is only non-null for a version >= 2,
  // so anything below that lands in the fresh-install branch instead, and 2.5 is
  // the cheapest value that is >= 2 with no MIGRATIONS entry behind it.
  //
  // Unreachable today — every version 1-6 has an entry. It becomes reachable the
  // moment someone bumps STORAGE_VERSION without adding the registry line, and
  // the old code's failure mode was to keep running with a null cache, so the
  // first `set()` merged onto DEFAULTS and wrote that over the stored document.
  // The data survived until the user touched anything.
  it('loads the stored documents instead of running on defaults', () => {
    write(DOCS.progress, { _v: 2.5, known: [4, 5, 6], starred: [4] });
    write(DOCS.srs, srsDoc(5));

    init();

    expect(get('progress').known).toEqual([4, 5, 6]);
    expect(Object.keys(get('srs').cards)).toHaveLength(5);
  });

  it('a write after the gap preserves the fields it did not touch', () => {
    write(DOCS.progress, { _v: 2.5, known: [4, 5, 6], starred: [4], dailyGoal: 99 });
    init();

    set('progress', { starred: [4, 5] });

    const onDisk = read(DOCS.progress);
    expect(onDisk.known).toEqual([4, 5, 6]);
    expect(onDisk.starred).toEqual([4, 5]);
    expect(onDisk.dailyGoal).toBe(99);
  });

  it('reports the gap so the banner can say the data is stale, not corrupt', () => {
    write(DOCS.progress, { _v: 2.5, known: [1] });
    init();
    const warning = getCorruptionWarning();
    expect(warning).toHaveLength(1);
    expect(warning[0].migrationGap).toBe(2.5);
  });
});

describe('SRS activity moves the last-mutated stamp', () => {
  // `set()` stamps; `setSRSCard()` did not, and rating a card is the one action
  // the whole app is built around. A learner who only ever reviews read as a
  // device that had never changed, so the conflict warning that exists to stop an
  // old backup overwriting fresh work never fired for the work it most protects.
  it('rating a card is visible to getLastMutatedAt', () => {
    init();
    const before = getLastMutatedAt();

    setSRSCard(12, { card: { due: '2026-10-01T00:00:00.000Z', stability: 3 }, history: [] });

    const after = getLastMutatedAt();
    expect(after).not.toBeNull();
    if (before !== null) expect(after).toBeGreaterThanOrEqual(before);
    expect(read(DOCS.srs).updatedAt).toBe(after);
  });

  it('an SRS-only device is not mistaken for an untouched one', () => {
    // The concrete scenario: no quizzes, no notes, no starring — just reviews.
    write(DOCS.progress, { _v: STORAGE_VERSION, known: [], starred: [] });
    write(DOCS.prefs, { _v: STORAGE_VERSION, onboarded: true });
    write(DOCS.srs, { _v: STORAGE_VERSION, cards: {} });
    init();

    expect(getLastMutatedAt()).toBeNull(); // nothing has happened yet
    setSRSCard(1, { card: { due: null }, history: [] });
    expect(getLastMutatedAt()).toBeTypeOf('number');
  });

  it('restoring a backup counts as this device changing', () => {
    init();
    const old = Date.parse('2026-01-01T00:00:00.000Z');
    importAll({
      progress: { ...DEFAULTS.progress, known: [1, 2], updatedAt: old },
      srs: { cards: {}, updatedAt: old },
      prefs: { ...DEFAULTS.prefs, updatedAt: old },
    });
    // Carrying the file's own stamp through would have this device claiming it
    // had not changed since January, immediately after replacing everything on it.
    expect(getLastMutatedAt()).toBeGreaterThan(old);
  });
});

describe('get() does not hand out the live DEFAULTS object', () => {
  it('mutating what a caller read cannot poison later reads', () => {
    _reset_for_test();
    const first = get('progress');
    first.known.push(99999);
    _reset_for_test();
    expect(get('progress').known).not.toContain(99999);
    expect(DEFAULTS.progress.known).not.toContain(99999);
  });
});

describe('quarantine copies are capped at one per document', () => {
  it('a second corruption event replaces the first copy rather than adding one', () => {
    localStorage.setItem(DOCS.progress, 'garbage one');
    init();
    const firstKey = getCorruptionWarning()[0].backupKey;

    // A recurring cause — a flaky sync writing a truncated key — hits this twice.
    _reset_for_test();
    localStorage.setItem(DOCS.progress, 'garbage two');
    init();

    // Enumerated the only way that is actually specified — see the comment on
    // quarantineCorruptDoc; Object.keys on a Storage returns its methods here.
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(`${DOCS.progress}_corrupt_`)) keys.push(k);
    }
    expect(keys).toHaveLength(1);
    expect(localStorage.getItem(keys[0])).toBe('garbage two');
    if (keys[0] !== firstKey) expect(localStorage.getItem(firstKey)).toBeNull();
  });
});

describe('validateSnapshot rejects entries the scheduler cannot use', () => {
  const base = () => ({
    progress: { ...DEFAULTS.progress },
    prefs: { ...DEFAULTS.prefs },
    srs: { cards: {} },
  });

  it('accepts a well-formed snapshot', () => {
    const snap = base();
    snap.srs.cards = {
      1: { card: { due: '2026-10-01T00:00:00.000Z', stability: 4 }, history: [] },
    };
    expect(validateSnapshot(snap).ok).toBe(true);
  });

  it('rejects a card whose due date is not a date', () => {
    // This is the one that mattered: it imported cleanly, then threw inside
    // ts-fsrs on the first rating, leaving the entry persisted — so the card was
    // unrateable on every later visit too.
    const snap = base();
    snap.srs.cards = { 1: { card: { due: 'garbage' }, history: [] } };
    const r = validateSnapshot(snap);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('invalid_srs_card:1');
  });

  it('rejects a history that is not an array', () => {
    const snap = base();
    snap.srs.cards = { 9: { card: { due: null }, history: 'oops' } };
    expect(validateSnapshot(snap).ok).toBe(false);
  });

  it('rejects non-numeric scheduling numbers', () => {
    const snap = base();
    snap.srs.cards = { 3: { card: { due: null, stability: 'high' }, history: [] } };
    expect(validateSnapshot(snap).ok).toBe(false);
  });

  it('rejects prefs that are not an object', () => {
    const snap = base();
    snap.prefs = 42;
    expect(validateSnapshot(snap).reason).toBe('invalid_prefs');
  });

  it('tolerates older entries that simply carry fewer fields', () => {
    // This runs on files a user is restoring, so it must not reject a shape that
    // an earlier version of the app legitimately wrote.
    const snap = base();
    snap.srs.cards = { 1: { card: {}, history: [] }, 2: { card: { due: null } } };
    expect(validateSnapshot(snap).ok).toBe(true);
  });

  it('applies the same per-entry check to a delta', () => {
    expect(validateDelta({ srs: { cards: { 5: { card: { due: 'nope' } } } } }).ok).toBe(false);
    expect(validateDelta({ srs: { cards: { 5: { card: { due: null } } } } }).ok).toBe(true);
  });
});
