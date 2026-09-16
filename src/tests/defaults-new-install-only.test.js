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
import { DEFAULT_MOTION } from '../utils/motion-pref.js';
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

// ─── Gerakan: the one default that is not simply "the new value" ─────────────
// `motion` is additive and stores 'penuh', so everyone who installed before
// 7.6.0 reads as full motion -- which is truthful, since that is what they have
// been getting, and is why there is no migration.
//
// The exception is a fresh install on a device that asks for reduced motion.
// That is an accessibility declaration made to the OS, not a preference, and an
// app whose FIRST impression ignores it has already failed the reader once
// before they can find the setting. main.jsx starts such an install at 'mati'.
//
// New-install only, in both directions, and the second direction is the one
// that matters: a reader who turns motion back ON despite the OS setting has
// made a choice, and nothing may quietly undo it on the next launch.
describe('Gerakan defaults', () => {
  it('stores penuh, so an existing install is unchanged by the upgrade', () => {
    expect(DEFAULTS.prefs.motion.preset).toBe('penuh');
    expect(DEFAULTS.prefs.motion).toEqual(DEFAULT_MOTION);
  });

  it('a fresh install with no OS preference gets full motion', () => {
    init();
    expect(get('prefs').motion.preset).toBe('penuh');
  });

  it('DEFAULTS.prefs.motion is DEFAULT_MOTION — one value, not two literals', () => {
    // Same argument as textScale's: a second literal is a second thing to
    // forget when the default moves.
    expect(DEFAULTS.prefs.motion).toBe(DEFAULT_MOTION);
  });

  it('a stored choice survives, including one that disagrees with the OS', () => {
    seedInstall({ motion: { preset: 'penuh', features: null, speed: 1 } });
    init();
    expect(get('prefs').motion.preset, 'the reader turned it back on; leave it').toBe('penuh');
  });
});
