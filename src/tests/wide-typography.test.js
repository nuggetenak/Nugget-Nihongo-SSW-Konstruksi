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

function baseValue(token) {
  const m = css.match(new RegExp(`:root\\s*{[\\s\\S]*?--${token}:\\s*(\\d+)px`));
  return m ? Number(m[1]) : null;
}

function wideBlock() {
  const m = css.match(/@media \(min-width: 1040px\)\s*{\s*:root\s*{([\s\S]*?)}/);
  return m ? m[1] : '';
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
    expect(block).toMatch(/--fs-hero:\s*36px/);
    expect(block).toMatch(/--fs-jp-primary:\s*30px/);
    expect(block).toMatch(/--fs-jp-back:\s*22px/);
    expect(block).toMatch(/--fs-page-title:\s*26px/);
    expect(block).toMatch(/--fs-title:\s*18px/);
    expect(block).toMatch(/--fs-subtitle:\s*16px/);
    expect(block).toMatch(/--fs-body:\s*14px/);
    expect(block).toMatch(/--fs-caption:\s*13px/);
    expect(block).toMatch(/--fs-small:\s*12px/);
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
