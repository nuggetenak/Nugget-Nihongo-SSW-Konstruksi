// ─── tests/landscape-reach.test.js ────────────────────────────────────────────
// item 23: a landscape phone (~360px tall) had FlipCard's 230px min-height
// alone summing past the viewport before ModeHeader or RatingRow were even
// counted. @media (max-height: 480px) compresses FlipCard, .page, and
// ModeHeader -- this locks in that the overrides exist AND land after the
// base rule they override in each file, since a media query positioned
// earlier than its target loses the cascade on equal specificity once the
// query matches (a real ordering bug hit and fixed while writing this item).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function read(relPath) {
  return readFileSync(resolve(__dirname, '..', relPath), 'utf-8');
}

// True if `selector`'s base (non-media-query) rule appears before the
// max-height media query block, AND that block actually mentions selector.
function overrideWinsCascade(css, selector) {
  const escaped = selector.replace('.', '\\.');
  const mediaBlockMatch = css.match(/@media \(max-height: 480px\)\s*{([\s\S]*)}\s*$/);
  if (!mediaBlockMatch) return false;
  const baseMatch = css.match(new RegExp(`\\n${escaped}\\s*{`));
  const mediaBlockStart = css.indexOf(mediaBlockMatch[0]);
  return !!baseMatch && baseMatch.index < mediaBlockStart && mediaBlockMatch[1].includes(selector);
}

describe('landscape-height compression (item 23)', () => {
  it('FlipCard.module.css compresses both .front and .back, after their base rules', () => {
    const css = read('modes/FlashcardMode/FlipCard.module.css');
    expect(css).toMatch(/@media \(max-height: 480px\)/);
    expect(overrideWinsCascade(css, '.front')).toBe(true);
    expect(overrideWinsCascade(css, '.back')).toBe(true);
  });

  it("modes.module.css compresses .page's padding, after its base rule", () => {
    const css = read('modes/modes.module.css');
    expect(overrideWinsCascade(css, '.page')).toBe(true);
  });

  it('ModeHeader.module.css compresses .header, after its base rule', () => {
    const css = read('components/ModeHeader.module.css');
    expect(overrideWinsCascade(css, '.header')).toBe(true);
  });

  it('the compressed FlipCard min-height is meaningfully smaller, not a token bump', () => {
    const css = read('modes/FlashcardMode/FlipCard.module.css');
    const mediaBlock = css.match(/@media \(max-height: 480px\)\s*{([\s\S]*)}\s*$/)[1];
    const heights = [...mediaBlock.matchAll(/min-height:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(heights.length).toBeGreaterThan(0);
    heights.forEach((h) => expect(h).toBeLessThan(230));
  });
});
