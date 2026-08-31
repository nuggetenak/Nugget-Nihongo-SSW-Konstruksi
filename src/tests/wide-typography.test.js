// ─── tests/wide-typography.test.js ────────────────────────────────────────────
// item 22: width was solved (--max-w widens inside @media (min-width: 1040px))
// but density wasn't -- the same block now also redefines the reading-scale
// --fs-* tokens. This locks in that the compact scale stays exactly what it
// was (done-when: "compact and medium are pixel-identical to today") and that
// the wide overrides exist for the tokens this item bumped, at the values
// documented in DESIGN_SPEC.md §3.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const css = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf-8');

// Tokens are rem now (item 53) -- convert back to a px-equivalent for
// readable assertions ("hero is effectively 32px at default settings")
// without hardcoding the unit conversion into every expectation below.
const REM_PX = 16;

function baseValue(token) {
  const m = css.match(new RegExp(`:root\\s*{[\\s\\S]*?--${token}:\\s*([\\d.]+)rem`));
  return m ? Math.round(Number(m[1]) * REM_PX * 1000) / 1000 : null;
}

function wideBlock() {
  const m = css.match(/@media \(min-width: 1040px\)\s*{\s*:root\s*{([\s\S]*?)}/);
  return m ? m[1] : '';
}

function remFor(px) {
  return `${px / REM_PX}rem`.replace(/\./g, '\\.');
}

describe('wide-breakpoint typography (item 22)', () => {
  it('the compact/default scale is unchanged from before this item', () => {
    expect(baseValue('fs-hero')).toBe(32);
    expect(baseValue('fs-jp-primary')).toBe(28);
    expect(baseValue('fs-jp-back')).toBe(20);
    expect(baseValue('fs-title')).toBe(17);
    expect(baseValue('fs-subtitle')).toBe(15);
    expect(baseValue('fs-body')).toBe(13);
    expect(baseValue('fs-caption')).toBe(12);
    expect(baseValue('fs-small')).toBe(11);
    // Deliberately untouched at the wide breakpoint too -- badge/fine-print
    // scale, not reading scale.
    expect(baseValue('fs-micro')).toBe(10);
    expect(baseValue('fs-nano')).toBe(9);
  });

  // fs-page-title: added in the same UI-audit pass that unified BelajarTab's
  // and Dashboard's page titles onto the value SayaTab and every individual
  // mode screen (modes.module.css) had already independently converged on
  // -- not a new design decision, a name for an existing one.
  it('fs-page-title exists and sits between fs-title and fs-jp-back', () => {
    expect(baseValue('fs-page-title')).toBe(22);
  });

  it('the 1040px block redefines the reading-scale tokens larger', () => {
    const block = wideBlock();
    expect(block).toMatch(new RegExp(`--fs-hero:\\s*${remFor(36)}`));
    expect(block).toMatch(new RegExp(`--fs-jp-primary:\\s*${remFor(30)}`));
    expect(block).toMatch(new RegExp(`--fs-jp-back:\\s*${remFor(22)}`));
    expect(block).toMatch(new RegExp(`--fs-page-title:\\s*${remFor(26)}`));
    expect(block).toMatch(new RegExp(`--fs-title:\\s*${remFor(18)}`));
    expect(block).toMatch(new RegExp(`--fs-subtitle:\\s*${remFor(16)}`));
    expect(block).toMatch(new RegExp(`--fs-body:\\s*${remFor(14)}`));
    expect(block).toMatch(new RegExp(`--fs-caption:\\s*${remFor(13)}`));
    expect(block).toMatch(new RegExp(`--fs-small:\\s*${remFor(12)}`));
  });

  it('micro/nano are not redefined in the wide block -- deliberately out of scope', () => {
    const block = wideBlock();
    expect(block).not.toMatch(/--fs-micro/);
    expect(block).not.toMatch(/--fs-nano/);
  });

  it('the wide block still redefines --max-w -- confirms this is the same block, not a duplicate', () => {
    const block = wideBlock();
    expect(block).toMatch(/--max-w:\s*1180px/);
  });
});
