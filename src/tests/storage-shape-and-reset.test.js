// ─── tests/storage-shape-and-reset.test.js ───────────────────────────────────
// UI_UX_PLAN items 132 and 133.
//
// 132 — readDoc only ever asked "does this parse?", never "is this a document?".
// A key holding `null`, `[]`, `42` or `{}` came back ok, resolved to version 0
// via `?._v ?? 0`, and took the fresh-install branch: overwritten with defaults,
// no quarantine copy, no warning. The quarantine path exists precisely for
// "this doc is unreadable, keep the bytes and tell the user", and shape
// corruption walked straight past it.
//
// 133 — resetAll() rewrote the three managed documents and nothing else, so the
// GitHub PAT and the backup gist id survived a control labelled "Hapus semua
// progress — tidak bisa dibatalkan".
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import LZString from 'lz-string';
import {
  init,
  get,
  set,
  resetAll,
  getCorruptionWarning,
  _reset_for_test,
} from '../storage/engine.js';
import { DOCS, STORAGE_VERSION, UNMANAGED_KEYS } from '../storage/schema.js';

const write = (key, value) =>
  localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(value)));

const seedValidDocs = () => {
  write(DOCS.progress, { _v: STORAGE_VERSION, known: [7, 8], unknown: [], starred: [] });
  write(DOCS.srs, { _v: STORAGE_VERSION, cards: {} });
  write(DOCS.prefs, { _v: STORAGE_VERSION, notes: { 7: 'catatan saya' } });
};

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('a document that parses but is not a document', () => {
  // Every one of these is valid JSON, which is the whole problem.
  it.each([
    ['null', null],
    ['an array', [1, 2, 3]],
    ['a number', 42],
    ['a string', 'progress'],
    ['an object with no _v', { known: [1, 2] }],
    ['an object whose _v is not a number', { _v: 'seven', known: [1] }],
  ])('quarantines %s instead of silently overwriting it', (_label, value) => {
    write(DOCS.progress, value);
    write(DOCS.srs, { _v: STORAGE_VERSION, cards: {} });
    write(DOCS.prefs, { _v: STORAGE_VERSION });
    init();

    const warning = getCorruptionWarning();
    expect(warning).toHaveLength(1);
    expect(warning[0].doc).toBe(DOCS.progress);
    // The bytes are kept under a side key so a support conversation can look.
    expect(localStorage.getItem(warning[0].backupKey)).toBeTruthy();
  });

  it('leaves a genuinely absent document alone — that is a fresh install', () => {
    init();
    expect(getCorruptionWarning()).toHaveLength(0);
    expect(get('progress').known).toEqual([]);
  });

  it('still loads a well-formed document untouched', () => {
    seedValidDocs();
    init();
    expect(getCorruptionWarning()).toHaveLength(0);
    expect(get('progress').known).toEqual([7, 8]);
    expect(get('prefs').notes).toEqual({ 7: 'catatan saya' });
  });
});

describe('resetAll', () => {
  it('clears the GitHub token and the backup gist id, not just the documents', () => {
    seedValidDocs();
    init();
    localStorage.setItem('ssw-gist-pat', 'ghp_averyrealtokenvalue');
    localStorage.setItem('ssw-gist-id', 'abc123def456');

    resetAll();

    // The point of the item: a resold or handed-on phone kept a live credential
    // after a control that promised to erase everything.
    for (const key of UNMANAGED_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('still resets the three documents', () => {
    seedValidDocs();
    init();
    set('progress', (p) => ({ ...p, known: [1, 2, 3] }));
    resetAll();
    expect(get('progress').known).toEqual([]);
    expect(get('prefs').notes ?? {}).toEqual({});
  });

  it('names every unmanaged key it knows about', () => {
    // If a future feature adds a side key and forgets this list, reset lies
    // again. The list is the contract; this is the reminder.
    expect(UNMANAGED_KEYS).toEqual(['ssw-gist-pat', 'ssw-gist-id']);
  });
});
