// ─── tests/defaults-new-install-only.test.js ─────────────────────────────────
// Changing a value in DEFAULTS.prefs must reach new installs and nobody else.
//
// This holds because of how the engine loads: a document already at
// STORAGE_VERSION is loaded as-is, `get('prefs')` returns it directly, and
// there is no defaults-merge for a current doc -- so a stored value wins. It is
// worth a test rather than a comment, because the alternative (silently
// resizing the text or repainting the theme of someone mid-study) is the kind
// of thing a well-meaning "let's make the migration consistent" change would
// introduce, and nothing else would catch it.
//
// STORAGE_VERSION deliberately stays 7 for the 7.2.0 default changes: a
// migration is for reinterpreting data that already exists, and a changed
// default is not that.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import LZString from 'lz-string';
import { init, get, _reset_for_test } from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';
import { DEFAULT_TEXT_SCALE } from '../utils/text-scale.js';

/**
 * Seed a complete install the way the engine writes one.
 *
 * All three documents, deliberately: `init()` decides fresh-vs-existing from
 * the *progress* doc's `_v` alone, so seeding only prefs is read as a fresh
 * install and the seeded prefs are overwritten with defaults. That is worth
 * knowing when writing any storage test -- and it is the same behaviour that
 * makes a progress doc which parses but carries no `_v` get silently wiped.
 */
function seedInstall(prefFields) {
  const write = (key, doc) =>
    localStorage.setItem(key, LZString.compressToUTF16(JSON.stringify(doc)));
  write(DOCS.progress, { ...DEFAULTS.progress, _v: STORAGE_VERSION });
  write(DOCS.srs, { ...DEFAULTS.srs, _v: STORAGE_VERSION });
  write(DOCS.prefs, { ...DEFAULTS.prefs, _v: STORAGE_VERSION, ...prefFields });
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('a fresh install gets the current defaults', () => {
  it('starts at kecil and light', () => {
    init();
    expect(get('prefs').textScale).toBe('kecil');
    expect(get('prefs').theme).toBe('light');
  });

  it('DEFAULTS.prefs.textScale is DEFAULT_TEXT_SCALE — one value, not two literals', () => {
    expect(DEFAULTS.prefs.textScale).toBe(DEFAULT_TEXT_SCALE);
  });
});

describe('an existing install keeps what it had', () => {
  it('keeps a stored textScale of normal — the new default does not reach it', () => {
    seedInstall({ textScale: 'normal' });
    init();
    expect(get('prefs').textScale).toBe('normal');
  });

  it('keeps a stored theme of dark', () => {
    seedInstall({ theme: 'dark' });
    init();
    expect(get('prefs').theme).toBe('dark');
  });

  it('keeps a deliberately-chosen larger size', () => {
    seedInstall({ textScale: 'sangat-besar' });
    init();
    expect(get('prefs').textScale).toBe('sangat-besar');
  });
});

describe('the no-migration decision', () => {
  it('STORAGE_VERSION is still 7 — changed defaults never need a migration', () => {
    expect(STORAGE_VERSION).toBe(7);
  });
});
