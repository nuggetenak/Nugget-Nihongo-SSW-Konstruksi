// ─── tests/format-count.test.js ───────────────────────────────────────────────
// item 42: corpus-scale counts (card totals) rendered as "1.438" in some
// places and "1438" a few lines away in others -- Dashboard's own knownN sat
// unformatted two lines above a toLocaleString('id-ID') one. One helper now,
// used at every genuinely corpus-scale count site.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { formatCount } from '../utils/format.js';

const root = resolve(__dirname, '..');

function findSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'tests') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findSourceFiles(full, out);
    else if (entry.endsWith('.jsx') || (entry.endsWith('.js') && !entry.endsWith('.module.js')))
      out.push(full);
  }
  return out;
}

describe('formatCount', () => {
  it('formats corpus-scale numbers with Indonesian thousands separators', () => {
    expect(formatCount(1438)).toBe('1.438');
    expect(formatCount(10000)).toBe('10.000');
  });

  it('small numbers pass through readably (no separator needed under 1000)', () => {
    expect(formatCount(5)).toBe('5');
    expect(formatCount(999)).toBe('999');
  });

  it('handles zero', () => {
    expect(formatCount(0)).toBe('0');
  });
});

describe('no raw toLocaleString(\'id-ID\') outside the shared helper (item 42)', () => {
  it('every id-ID thousands-formatting call goes through formatCount, not a local toLocaleString', () => {
    const offenders = findSourceFiles(root)
      .filter((f) => f !== resolve(root, 'utils/format.js'))
      .filter((f) => readFileSync(f, 'utf-8').includes("toLocaleString('id-ID')"));
    expect(offenders).toEqual([]);
  });

  it('the ISO-date toLocaleDateString(\'sv\') trick is untouched -- not the same thing, not this item\'s scope', () => {
    const dateUtil = readFileSync(resolve(root, 'utils/date.js'), 'utf-8');
    expect(dateUtil).toMatch(/toLocaleDateString\('sv'\)/);
  });
});
