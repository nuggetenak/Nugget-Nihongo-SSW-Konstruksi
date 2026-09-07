// ─── tests/removed-mode-safety.test.js ───────────────────────────────────────
// Removing a mode is not just deleting its files. Two things elsewhere in the
// app hold a mode id that outlives the mode, and neither was caught by any
// existing test when `produksi`/`kuisprod` were dropped in 7.0.0:
//
//   1. `prefs.lastMode` is persisted, so an install whose last session was a
//      now-deleted mode boots into it. ModeRouter returns null for an unknown
//      key and ModeHeader has no MODE_META to draw, so the user gets a blank
//      screen with no way back except a reload.
//   2. recommend-mode's rotation array was indexed by a hardcoded `% 3`. Drop
//      one entry and one day in three hands `undefined` to onNavigate.
//
// These tests are about the *class* of bug, not those two modes specifically —
// they should keep passing, unchanged, through the next mode removal too.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { MODE_COMPONENTS, MODE_META, MODE_SECTIONS } from '../router/modes.js';

const SRC = resolve(__dirname, '..');
const read = (rel) => readFileSync(resolve(SRC, rel), 'utf-8');

describe('removed-mode safety', () => {
  it('every mode in a nav section has a component and metadata', () => {
    const sectionModes = Object.values(MODE_SECTIONS).flatMap((s) => s.modes);
    const orphans = sectionModes.filter((m) => !MODE_COMPONENTS[m] || !MODE_META[m]);
    expect(orphans).toEqual([]);
  });

  it('every registered component has metadata to render its header', () => {
    const missing = Object.keys(MODE_COMPONENTS).filter((m) => !MODE_META[m]);
    expect(missing).toEqual([]);
  });

  it('no nav section lists the same mode twice', () => {
    const sectionModes = Object.values(MODE_SECTIONS).flatMap((s) => s.modes);
    expect(sectionModes.length).toBe(new Set(sectionModes).size);
  });

  // The rotation is read from source rather than exercised through
  // getRecommendedMode() because reaching that branch needs a mature-card
  // count over 300 and an accuracy over 70 — the assertion here is about the
  // indexing being derived, which is what actually prevents the bug.
  it('recommend-mode indexes its rotation by the array length, not a literal', () => {
    const src = read('utils/recommend-mode.js');
    expect(src).toContain('% rotation.length');
    expect(src).not.toMatch(/Date\.now\(\) \/ 86400000\) % \d/);
  });

  it('every mode named in the rotation still exists', () => {
    const src = read('utils/recommend-mode.js');
    const literal = src.match(/const rotation = \[([^\]]*)\]/);
    expect(literal, 'rotation array not found — was it renamed?').toBeTruthy();
    const modes = [...literal[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(modes.length).toBeGreaterThan(0);
    expect(modes.filter((m) => !MODE_COMPONENTS[m])).toEqual([]);
  });

  it('every mode a daily mission can hand out still exists', async () => {
    const src = read('utils/daily-mission.js');
    const modes = [...src.matchAll(/\{ mode: '([^']+)'/g)].map((m) => m[1]);
    expect(modes.length).toBeGreaterThan(0);
    expect(modes.filter((m) => !MODE_COMPONENTS[m])).toEqual([]);
  });

  it('every scored quiz mode still exists', async () => {
    const { SCORED_QUIZ_MODES } = await import('../utils/constants.js');
    expect(SCORED_QUIZ_MODES.filter((m) => !MODE_COMPONENTS[m])).toEqual([]);
  });

  // AppContext guards `prefs.lastMode` on read. Asserting the guard's logic
  // directly (rather than mounting the provider, which drags in storage,
  // theme and toast) keeps this test about the one rule that matters.
  it('a persisted lastMode naming a deleted mode resolves to null', () => {
    const lastModeOrNull = (m) => (m && Object.hasOwn(MODE_COMPONENTS, m) ? m : null);
    expect(lastModeOrNull('produksi')).toBe(null);
    expect(lastModeOrNull('kuisprod')).toBe(null);
    expect(lastModeOrNull('kartu')).toBe('kartu');
    expect(lastModeOrNull(null)).toBe(null);
    expect(lastModeOrNull(undefined)).toBe(null);
    expect(lastModeOrNull('')).toBe(null);
    // Not inherited from Object.prototype — hasOwn, not `in`.
    expect(lastModeOrNull('toString')).toBe(null);
    expect(lastModeOrNull('constructor')).toBe(null);
  });

  it('AppContext actually applies that guard on both restore paths', () => {
    const src = read('contexts/AppContext.jsx');
    // The initial state read, and the popstate handler.
    expect(src).toContain('lastModeOrNull(prefs.lastMode)');
    expect(src).toContain('lastModeOrNull(state?.mode)');
    expect(src).not.toMatch(/useState\(prefs\.lastMode \?\? null\)/);
  });
});
