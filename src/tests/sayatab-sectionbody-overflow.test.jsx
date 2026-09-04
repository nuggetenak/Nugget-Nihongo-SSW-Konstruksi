// ─── tests/sayatab-sectionbody-overflow.test.jsx ─────────────────────────────
// Reported: the whole Saya tab needed pinch-zooming out to see properly --
// every section (daily challenge, achievements, SRS, settings, data, info)
// overflowed the viewport by a consistent 52px, confirmed via Playwright
// (scrollWidth 400 against a 348px clientWidth on every .sectionBody, not
// content-specific -- ruled out via a systematic hide-each-section-and-
// remeasure sweep before finding the real cause).
//
// Root cause: .sectionBody's grid-template-columns was
// repeat(auto-fit, minmax(400px, 1fr)) -- with a flexible (1fr) max,
// auto-fit's column COUNT is governed by the MIN (opposite of the
// BelajarTab compactGrid bug fixed earlier the same day, where a *fixed*
// max governed count -- see docs/LAYOUT_SPEC.md's Variant A vs B). 400px
// is wider than this app's entire mobile content column, and minmax's min
// is a hard floor: the one column that renders still gets forced to 400px,
// genuinely overflowing rather than just failing to add a second column.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '..');

// Generalised 2026-09-04 from .sectionBody to every auto-fit grid in the app.
// GlossaryMode had exactly this bug the whole time -- minmax(430px, 1fr), so its
// rows were 430px wide inside a 390px viewport and the document scrolled
// sideways -- and a test scoped to one selector in one file could never have
// caught it. The rule is general, so the test is now general too.
//
// Two ways to be safe, both accepted below:
//   min(Xpx, 100%)  the floor can never exceed the container. Correct at any
//                   width, including ones nobody has measured yet.
//   a bare Xpx      only safe while X fits the narrowest content column.
function minmaxFloors(css) {
  // Strip comments first: the surrounding prose documents the old broken values
  // ("Was minmax(400px, 1fr)"), and matching those instead of the live
  // declaration is how this test came to report a 400 that no rule contained.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...code.matchAll(/minmax\(\s*(min\([^)]*\)|[^,]+?)\s*,/g)].map((m) => m[1].trim());
}

const GRID_FILES = [
  'components/SayaTab.module.css',
  'components/BelajarTab.module.css',
  'modes/GlossaryMode.module.css',
  'modes/StatsMode.module.css',
];

// The narrowest content column this app renders into: a 360px viewport less the
// shell's 16px gutters and a section's own padding.
const NARROWEST_CONTENT = 300;

describe('auto-fit grids never force a track wider than the phone', () => {
  it.each(GRID_FILES)('%s', (file) => {
    const css = readFileSync(resolve(root, file), 'utf8');
    for (const floor of minmaxFloors(css)) {
      if (floor.startsWith('min(')) continue; // capped at the container, safe anywhere
      const px = Number(floor.replace('px', ''));
      expect(
        Number.isFinite(px) && px <= NARROWEST_CONTENT,
        `minmax floor ${floor} in ${file} is a hard minimum — it cannot shrink, so on a narrower viewport it pushes the whole document sideways. Wrap it: minmax(min(${floor}, 100%), ...)`
      ).toBe(true);
    }
  });
});
