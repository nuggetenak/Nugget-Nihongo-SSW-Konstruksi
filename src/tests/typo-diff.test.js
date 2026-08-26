// ─── tests/typo-diff.test.js ───────────────────────────────────────────────
// diffChars (item 60) — correctness of the alignment itself. Verified
// against both exact expected sequences (where the alignment is
// unambiguous) and general properties (total edit distance) for cases
// where multiple equally-valid alignments could exist, rather than
// asserting one arbitrary tie-break as if it were the only correct answer.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { diffChars } from '../utils/typo-diff.js';

function editDistance(ops) {
  return ops.filter((o) => o.op !== 'match').length;
}

describe('diffChars', () => {
  it('an exact match produces only match ops', () => {
    const ops = diffChars('keselamatan', 'keselamatan');
    expect(ops.every((o) => o.op === 'match')).toBe(true);
    expect(ops.map((o) => o.char).join('')).toBe('keselamatan');
  });

  it("the plan's own example: a single-letter substitution is localized exactly, not smeared across the rest of the word", () => {
    const ops = diffChars('keselamaton', 'keselamatan');
    const subs = ops.filter((o) => o.op === 'sub');
    expect(subs).toHaveLength(1);
    expect(subs[0]).toMatchObject({ from: 'o', to: 'a' });
    // Everything else should be an untouched match, not collateral damage.
    expect(ops.filter((o) => o.op === 'match')).toHaveLength(10);
    expect(editDistance(ops)).toBe(1);
  });

  it('a missing letter is one insertion, not a cascade of substitutions for every character after it', () => {
    // "keselamtan" (missing the second 'a') vs "keselamatan"
    const ops = diffChars('keselamtan', 'keselamatan');
    expect(editDistance(ops)).toBe(1); // one missing letter = edit distance 1
    expect(ops.filter((o) => o.op === 'ins')).toHaveLength(1);
    expect(ops.filter((o) => o.op === 'sub')).toHaveLength(0);
  });

  it('an extra letter is one deletion, not a cascade of substitutions', () => {
    // "keselammatan" (extra 'm') vs "keselamatan"
    const ops = diffChars('keselammatan', 'keselamatan');
    expect(editDistance(ops)).toBe(1);
    expect(ops.filter((o) => o.op === 'del')).toHaveLength(1);
    expect(ops.filter((o) => o.op === 'sub')).toHaveLength(0);
  });

  it('empty input against a real answer is all insertions (nothing typed)', () => {
    const ops = diffChars('', 'apel');
    expect(ops.every((o) => o.op === 'ins')).toBe(true);
    expect(ops.map((o) => o.char).join('')).toBe('apel');
  });

  it('a real answer against empty expected is all deletions (should not happen in practice, but must not crash)', () => {
    const ops = diffChars('apel', '');
    expect(ops.every((o) => o.op === 'del')).toBe(true);
  });

  it('two completely different single characters is exactly one substitution', () => {
    const ops = diffChars('x', 'y');
    expect(ops).toEqual([{ op: 'sub', from: 'x', to: 'y' }]);
  });

  it('reconstructs to the correct answer when only "to"/"char" pieces relevant to the answer are joined', () => {
    const ops = diffChars('keselamaton', 'keselamatan');
    const reconstructed = ops
      .filter((o) => o.op !== 'del')
      .map((o) => (o.op === 'sub' ? o.to : o.char))
      .join('');
    expect(reconstructed).toBe('keselamatan');
  });

  it('the computed edit distance matches a known Levenshtein value for an unrelated word pair', () => {
    // "kitten" -> "sitting" is the textbook edit-distance-3 example.
    const ops = diffChars('kitten', 'sitting');
    expect(editDistance(ops)).toBe(3);
  });
});
