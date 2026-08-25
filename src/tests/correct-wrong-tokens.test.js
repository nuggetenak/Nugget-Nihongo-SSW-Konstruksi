// ─── tests/correct-wrong-tokens.test.js ───────────────────────────────────────
// item 40: AngkaMode, FlashcardMode, and SimulasiMode each used raw hex for
// correct/wrong signaling instead of --ssw-correct/--ssw-wrong -- at least
// three different greens and reds depending on which mode you were in.
// Fixed to the shared tokens; this is a tripwire against it drifting back.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '..');

// The specific literals the plan named, plus their rgba() equivalents (same
// RGB, any alpha) -- these were the actual bypass values found in each file.
const BANNED = [
  /#22c55e/i,
  /#ef4444/i,
  /#F87171/i,
  /#4ADE80/i,
  /#9CA3AF/i,
  /rgba\(\s*34,\s*197,\s*94/i, // #22c55e as rgb
  /rgba\(\s*239,\s*68,\s*68/i, // #ef4444 as rgb
];

function readSrc(relPath) {
  return readFileSync(resolve(root, relPath), 'utf-8');
}

describe('correct/wrong tokens stay tokens (item 40)', () => {
  it('AngkaMode has no raw correct/wrong or muted-grey literals', () => {
    const src = readSrc('modes/AngkaMode.jsx');
    for (const pattern of BANNED) {
      expect(src, `AngkaMode.jsx still matches ${pattern}`).not.toMatch(pattern);
    }
  });

  it('FlashcardMode has no raw correct/wrong literals', () => {
    const src = readSrc('modes/FlashcardMode/index.jsx');
    for (const pattern of BANNED) {
      expect(src, `FlashcardMode/index.jsx still matches ${pattern}`).not.toMatch(pattern);
    }
  });

  it("SimulasiMode's pass/fail signals use the shared tokens, not raw pass/fail hex", () => {
    const src = readSrc('modes/SimulasiMode.jsx');
    // The two lulus-conditional (pass/fail) blocks specifically should use
    // the shared tokens now. #dc2626 legitimately still exists elsewhere in
    // this file (RED_BTN's exam-theme gradient, a deliberately-preserved
    // identity accent -- see the next test) so this checks the pass/fail
    // blocks by their own conditional shape, not the file as a whole.
    const lulusBlocks = src.match(/lulus\s*\?[\s\S]{0,120}/g) ?? [];
    expect(lulusBlocks.length).toBeGreaterThan(0);
    for (const block of lulusBlocks) {
      expect(block, `a lulus-conditional block still has raw hex: ${block}`).not.toMatch(
        /#16a34a\b|#dc2626\b/
      );
    }
    expect(src).toMatch(/var\(--ssw-correct\)/);
    expect(src).toMatch(/var\(--ssw-wrong\)/);
  });

  it("SimulasiMode's exam-theme red buttons are untouched -- identity accents, not semantic state", () => {
    // Confirms this item didn't overreach into the deliberately-red button
    // theme, which docs/DESIGN_SPEC.md §2 now explicitly carves out.
    const src = readSrc('modes/SimulasiMode.jsx');
    expect(src).toMatch(/#7f1d1d/);
  });
});
