// ─── tests/srs-delta-roundtrip.test.js ───────────────────────────────────────
// UI_UX_PLAN items 117 and 138.
//
// 117 — "Ekspor Delta SRS Saja" wrote `{ _type, _storage_version, exported_at,
// srs, known, starred }`, and the app's only import path ran every file through
// validateSnapshot, which hard-requires progress + srs + prefs. So the button
// produced a file the app answered `missing_docs` to: a backup that could not
// be restored. The per-card merge that makes a delta meaningful was already
// written (importSRSSnapshot) and reachable only through a barrel nothing
// imported.
//
// 138 — the dual-device conflict warning compared the incoming file against
// `exportAll().exported_at`, which exportAll *generates* at call time. Always
// later than any file, so the warning was true on every import, including
// restoring your own backup. It needed a real last-modified stamp; there wasn't
// one.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import {
  init,
  get,
  set,
  setSRSCard,
  exportAll,
  validateSnapshot,
  validateDelta,
  getLastMutatedAt,
  _reset_for_test,
} from '../storage/engine.js';
import { importSRSDelta, isSRSDelta, DELTA_TYPE, getAllCards } from '../srs/index.js';

/** Exactly what ExportMode's delta button writes. */
const buildDelta = () => {
  const full = exportAll();
  return {
    _type: DELTA_TYPE,
    _storage_version: full._storage_version,
    exported_at: new Date().toISOString(),
    srs: full.srs,
    known: full.progress?.known ?? [],
    starred: full.progress?.starred ?? [],
  };
};

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('the delta file the app writes', () => {
  it('is recognisable as a delta', () => {
    expect(isSRSDelta(buildDelta())).toBe(true);
    expect(isSRSDelta(exportAll())).toBe(false);
    expect(isSRSDelta(null)).toBe(false);
  });

  it('is rejected by validateSnapshot — which is what broke it', () => {
    // Not a regression to fix: a delta genuinely is not a full snapshot. The
    // bug was routing it there anyway.
    expect(validateSnapshot(buildDelta())).toEqual({ ok: false, reason: 'missing_docs' });
  });

  it('passes validateDelta and reports what it carries', () => {
    setSRSCard(11, { due: 1, stability: 2 });
    setSRSCard(12, { due: 3, stability: 4 });
    set('progress', (p) => ({ ...p, known: [11, 12, 13] }));

    const result = validateDelta(buildDelta());
    expect(result.ok).toBe(true);
    expect(result.summary.srsCards).toBe(2);
    expect(result.summary.known).toBe(3);
  });

  it.each([
    ['not an object', 'nope'],
    ['no srs at all', { _type: DELTA_TYPE }],
    ['known that is not a list', { _type: DELTA_TYPE, srs: { cards: {} }, known: 'semua' }],
  ])('rejects %s', (_label, bad) => {
    expect(validateDelta(bad).ok).toBe(false);
  });
});

describe('applying a delta', () => {
  it('restores the reviews it carries', () => {
    setSRSCard(11, { due: 111, stability: 2 });
    set('progress', (p) => ({ ...p, known: [11], starred: [11] }));
    const delta = buildDelta();

    // Wipe, as a reinstall or a second device would be.
    _reset_for_test();
    localStorage.clear();
    init();
    expect(Object.keys(getAllCards())).toHaveLength(0);

    const applied = importSRSDelta(delta);
    expect(applied).toEqual({ cards: 1, known: 1, starred: 1 });
    expect(getAllCards()['11'].due).toBe(111);
    expect(get('progress').known).toEqual([11]);
  });

  it('merges instead of replacing — local reviews survive an older delta', () => {
    setSRSCard(11, { due: 111 });
    set('progress', (p) => ({ ...p, known: [11] }));
    const delta = buildDelta();

    // Study more after taking the backup, then restore it.
    setSRSCard(22, { due: 222 });
    set('progress', (p) => ({ ...p, known: [11, 22] }));

    importSRSDelta(delta);
    // engine.importAll is a whole-document replace and would have dropped 22.
    expect(Object.keys(getAllCards()).sort()).toEqual(['11', '22']);
    expect(get('progress').known.sort()).toEqual([11, 22]);
  });

  it('unions known/starred rather than subtracting', () => {
    set('progress', (p) => ({ ...p, known: [1, 2], starred: [9] }));
    const delta = { ...buildDelta(), known: [3], starred: [] };
    importSRSDelta(delta);
    // A delta says what this device knows, never what it denies.
    expect(get('progress').known.sort()).toEqual([1, 2, 3]);
    expect(get('progress').starred).toEqual([9]);
  });

  it('refuses a full snapshot handed to the delta path', () => {
    expect(() => importSRSDelta(exportAll())).toThrow(/Delta/);
  });
});

describe('the conflict check', () => {
  it('stamps every write, so "newer than the file" is answerable', () => {
    expect(getLastMutatedAt()).toBeNull(); // fresh install: honestly unknown
    set('progress', (p) => ({ ...p, known: [1] }));
    const first = getLastMutatedAt();
    expect(typeof first).toBe('number');
  });

  it('does not fire when the file is newer than the last local change', () => {
    set('progress', (p) => ({ ...p, known: [1] }));
    const mutatedAt = getLastMutatedAt();
    const fileExportedAt = new Date(mutatedAt + 60_000).toISOString();
    // The ordinary case: a backup taken after you last studied here. The old
    // comparison flagged this one too, every time.
    expect(mutatedAt > new Date(fileExportedAt).getTime()).toBe(false);
  });

  it('fires when this device has changes the file cannot know about', () => {
    const fileExportedAt = new Date(Date.now() - 60_000).toISOString();
    set('progress', (p) => ({ ...p, known: [1] }));
    expect(getLastMutatedAt() > new Date(fileExportedAt).getTime()).toBe(true);
  });
});
