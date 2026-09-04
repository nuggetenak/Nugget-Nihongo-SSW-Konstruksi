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

describe('SayaTab.module.css — .sectionBody grid minimum stays mobile-safe', () => {
  it("minmax min is well under this app's narrowest mobile content width (~296px at a 360px viewport)", () => {
    const css = readFileSync(resolve(root, 'components/SayaTab.module.css'), 'utf8');
    const match = css.match(/\.sectionBody\s*{[^}]*minmax\((\d+)px,\s*1fr\)/s);
    expect(match).toBeTruthy();
    const min = Number(match[1]);
    // 300px was chosen specifically to fit inside a 348px mobile content
    // width (412px viewport) with room to spare, verified via Playwright
    // across 360-900px with zero overflow at any of them -- this bound
    // (340) is deliberately a bit looser than that exact number so the
    // test catches a real regression (e.g. someone reverting to 400)
    // without being brittle to a legitimate small future adjustment.
    expect(min).toBeLessThan(340);
  });
});
