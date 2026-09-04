// ─── tests/typography-scale.test.js ──────────────────────────────────────────
// Replaces wide-typography.test.js (item 22), which locked in the fixed
// two-step scale this file's subject replaced on 2026-09-04.
//
// WHY THE SCALE WAS REBUILT: a census of every rendered text node across all 24
// screens of the running app found **85% of visible text at 13px or smaller** —
// 29% at 11px, 8% at 10px, 4% at 9px, and 9% at 7px. For readers looking at
// Japanese on cheap phones, outdoors, that was the app's largest usability
// problem, and it was invisible from the code: no single declaration looks
// wrong, the sizes just accumulate at the bottom of the scale.
//
// A unit test cannot re-run that census. What it CAN pin is the arithmetic that
// produced the worst of it, and the properties that keep the scale honest.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf-8');
const rubyCss = readFileSync(resolve(__dirname, '../components/JpDisplay.module.css'), 'utf-8');
const REM_PX = 16;

// Reading order, smallest first.
const SCALE = [
  'fs-nano',
  'fs-micro',
  'fs-small',
  'fs-caption',
  'fs-body',
  'fs-subtitle',
  'fs-title',
  'fs-jp-back',
  'fs-page-title',
  'fs-jp-primary',
  'fs-hero',
];

/** { min, max } in px for a `clamp(<min>rem, … , <max>rem)` token. */
function bounds(token) {
  const m = css.match(
    new RegExp(`--${token}:\\s*clamp\\(\\s*([\\d.]+)rem\\s*,([^,]+),\\s*([\\d.]+)rem\\s*\\)`)
  );
  if (!m) return null;
  return { min: Number(m[1]) * REM_PX, preferred: m[2].trim(), max: Number(m[3]) * REM_PX };
}

describe('the type scale', () => {
  it.each(SCALE)('--%s is a clamp with both bounds declared', (token) => {
    expect(bounds(token), `--${token} is not a clamp() with rem bounds`).toBeTruthy();
  });

  it('every token grows with the viewport and never shrinks', () => {
    for (const token of SCALE) {
      const b = bounds(token);
      expect(b.max, `--${token} max is not above its min`).toBeGreaterThan(b.min);
    }
  });

  it('is monotonic — each step is larger than the one below it', () => {
    for (let i = 1; i < SCALE.length; i++) {
      const lo = bounds(SCALE[i - 1]);
      const hi = bounds(SCALE[i]);
      expect(hi.min, `--${SCALE[i]} is not larger than --${SCALE[i - 1]}`).toBeGreaterThan(lo.min);
    }
  });

  it('the preferred value is rem-based, never bare vw', () => {
    // This is the property that keeps the scale responsive to a reader's
    // font-size preference — item 53's whole point, and what the in-app Ukuran
    // Teks control drives. A pure-vw preferred term would silently undo it,
    // because vw does not scale with the root font size.
    for (const token of SCALE) {
      const { preferred } = bounds(token);
      expect(preferred, `--${token}'s preferred value has no rem term`).toMatch(/rem/);
    }
  });

  it('body text starts at 15px, not 13px', () => {
    // 13px was the old value and 20% of the app's text sat there.
    expect(bounds('fs-body').min).toBeGreaterThanOrEqual(15);
  });

  it('nothing in the scale starts below 10px', () => {
    for (const token of SCALE) {
      expect(bounds(token).min, `--${token} starts below 10px`).toBeGreaterThanOrEqual(10);
    }
  });

  it('there is no per-breakpoint redefinition of the scale left', () => {
    // The fluid clamps interpolate continuously; a leftover @media override
    // would fight them and reintroduce the step this replaced.
    const wide = css.match(/@media \(min-width: 1040px\)\s*{\s*:root\s*{([\s\S]*?)}/);
    for (const token of SCALE) {
      expect(wide?.[1] ?? '', `--${token} is still redefined at 1040px`).not.toContain(
        `--${token}:`
      );
    }
  });
});

describe('furigana size — the number this overhaul was really about', () => {
  it('has an absolute floor, not just an em ratio', () => {
    // The arithmetic that produced 5–7px furigana: rt was a flat 0.44em, and
    // jpFontSize's floor for a long string was 13px, so 0.44 × 13 = 5.7px.
    // Neither number looks wrong on its own; they were set in different files
    // and nobody multiplied them. The floor makes that impossible to repeat.
    const m = rubyCss.match(
      /\.ruby rt\s*{[^}]*font-size:\s*max\(\s*([\d.]+)em\s*,\s*([\d.]+)rem\s*\)/
    );
    expect(m, '.ruby rt should size with max(<ratio>em, <floor>rem)').toBeTruthy();
    expect(Number(m[1]), 'ruby ratio dropped below the browser default').toBeGreaterThanOrEqual(
      0.5
    );
    expect(Number(m[2]) * REM_PX, 'ruby floor is under 11px').toBeGreaterThanOrEqual(11);
  });
});
