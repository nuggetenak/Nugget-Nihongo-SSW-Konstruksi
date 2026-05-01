// ─── tests/flashcard-decomp.test.jsx ─────────────────────────────────────────
// Phase E: Verify decomposition — correct structure, FLIP_STYLE removed from JS,
//          sub-components exist, furiganaPolicy wired.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(__dirname, '..');

describe('Phase E — FlashcardMode decomposition', () => {
  it('FlashcardMode.jsx is now a re-export shim (not the full component)', () => {
    const src = readFileSync(resolve(root, 'modes/FlashcardMode.jsx'), 'utf-8');
    // Should re-export, not define the full component inline
    expect(src).toMatch(/export.*default.*from.*FlashcardMode\/index/);
    // Should NOT contain the old FLIP_STYLE constant
    expect(src).not.toMatch(/FLIP_STYLE/);
    // Should NOT contain ensureStyle
    expect(src).not.toMatch(/ensureStyle/);
  });

  it('FlashcardMode/index.jsx exists and is the orchestrator', () => {
    const path = resolve(root, 'modes/FlashcardMode/index.jsx');
    expect(existsSync(path)).toBe(true);
    const src = readFileSync(path, 'utf-8');
    expect(src).toMatch(/export default function FlashcardMode/);
    expect(src).toMatch(/FlipCard/);
    expect(src).toMatch(/RatingRow/);
    expect(src).toMatch(/ToolStrip/);
    expect(src).toMatch(/FilterBar/);
  });

  it('FlipCard.jsx exists as sub-component', () => {
    expect(existsSync(resolve(root, 'modes/FlashcardMode/FlipCard.jsx'))).toBe(true);
  });

  it('RatingRow.jsx exists as sub-component', () => {
    expect(existsSync(resolve(root, 'modes/FlashcardMode/RatingRow.jsx'))).toBe(true);
  });

  it('ToolStrip.jsx exists as sub-component', () => {
    expect(existsSync(resolve(root, 'modes/FlashcardMode/ToolStrip.jsx'))).toBe(true);
  });

  it('FilterBar.jsx exists as sub-component', () => {
    expect(existsSync(resolve(root, 'modes/FlashcardMode/FilterBar.jsx'))).toBe(true);
  });

  it('flashcard.module.css contains fc-scene and fc-card rules (TD-05)', () => {
    const css = readFileSync(resolve(root, 'modes/FlashcardMode/flashcard.module.css'), 'utf-8');
    expect(css).toMatch(/fc-scene/);
    expect(css).toMatch(/fc-card/);
    expect(css).toMatch(/is-flipped/);
    expect(css).toMatch(/backface-visibility/);
  });

  it('TD-05: FLIP_STYLE constant does NOT exist in index.jsx', () => {
    const src = readFileSync(resolve(root, 'modes/FlashcardMode/index.jsx'), 'utf-8');
    expect(src).not.toMatch(/FLIP_STYLE/);
    expect(src).not.toMatch(/ensureStyle/);
    expect(src).not.toMatch(/document\.createElement\('style'\)/);
  });

  it('E.3 TD-10: JpDisplay.jsx exports JpFront with furiganaPolicy prop', () => {
    const src = readFileSync(resolve(root, 'components/JpDisplay.jsx'), 'utf-8');
    expect(src).toMatch(/furiganaPolicy/);
    expect(src).toMatch(/furiganaPolicy = 'always'/);
    expect(src).toMatch(/hidden/);
  });
});
