// ─── tests/text-scale.test.js ────────────────────────────────────────────────
// Saya → Ukuran Teks. The mechanism is one line (a percentage font-size on
// <html>), and it only works because every --fs-* token's clamp carries a rem
// term — see typography-scale.test.js, which asserts that half. This file
// asserts the control half.
//
// Worth pinning because the failure mode is silent in both directions: a `zoom`
// or transform would appear to work while scaling layout as well as text (so a
// larger setting shows LESS content, the opposite of what someone reaching for
// it wants), and a bare-vw preferred term anywhere in the scale would leave part
// of the type not responding at all.
import { describe, it, expect, beforeEach } from 'vitest';
import {
  TEXT_SCALES,
  DEFAULT_TEXT_SCALE,
  getTextScale,
  nextTextScale,
  applyTextScale,
} from '../utils/text-scale.js';

beforeEach(() => {
  document.documentElement.style.fontSize = '';
  delete document.documentElement.dataset.textScale;
});

describe('text scale', () => {
  it('has a default that is exactly 100% — the no-op', () => {
    expect(getTextScale(DEFAULT_TEXT_SCALE).pct).toBe(100);
  });

  it('offers a smaller option as well as larger ones', () => {
    // Not only "bigger": the scale rebuild raised every default size, and a
    // reader who preferred the old density needs a way back.
    const pcts = TEXT_SCALES.map((s) => s.pct);
    expect(Math.min(...pcts)).toBeLessThan(100);
    expect(Math.max(...pcts)).toBeGreaterThan(100);
  });

  it('is strictly increasing, so tapping through never repeats a size', () => {
    const pcts = TEXT_SCALES.map((s) => s.pct);
    expect([...pcts].sort((a, b) => a - b)).toEqual(pcts);
    expect(new Set(pcts).size).toBe(pcts.length);
  });

  it('cycles through every option and returns to the start', () => {
    let key = DEFAULT_TEXT_SCALE;
    const seen = [key];
    for (let i = 0; i < TEXT_SCALES.length - 1; i++) {
      key = nextTextScale(key);
      seen.push(key);
    }
    expect(new Set(seen).size).toBe(TEXT_SCALES.length);
    expect(nextTextScale(key)).toBe(DEFAULT_TEXT_SCALE);
  });

  it('an unknown stored value falls back to the default rather than breaking', () => {
    // prefs come from localStorage, which a user can edit or an old export can
    // carry a since-renamed key in.
    expect(getTextScale('nonsense').pct).toBe(100);
    expect(() => applyTextScale('nonsense')).not.toThrow();
  });

  it('scales the root font size, and nothing else', () => {
    applyTextScale('sangat-besar');
    expect(document.documentElement.style.fontSize).toBe('125%');
    // No zoom/transform: those scale layout too, which would mean a bigger
    // setting fits LESS on screen.
    expect(document.documentElement.style.zoom ?? '').toBe('');
    expect(document.documentElement.style.transform ?? '').toBe('');
  });

  it('clears the override at 100% rather than pinning the root size', () => {
    // Leaving `font-size: 100%` set would override a reader's own browser
    // default, quietly undoing the OS-level setting this is meant to add to.
    applyTextScale('besar');
    expect(document.documentElement.style.fontSize).toBe('112%');
    applyTextScale('normal');
    expect(document.documentElement.style.fontSize).toBe('');
  });

  it('records the active scale on the root for CSS and debugging', () => {
    applyTextScale('kecil');
    expect(document.documentElement.dataset.textScale).toBe('kecil');
  });
});
