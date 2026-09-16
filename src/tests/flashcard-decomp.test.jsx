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

  it('the flip is declared in CSS, in a stylesheet every caller can reach (TD-05, item 165)', () => {
    // TD-05's property was that the flip is CSS rather than a <style> element
    // injected from JS -- the FLIP_STYLE assertion below is the other half of
    // it. WHERE the CSS lived was incidental, and this test pinned it to
    // flashcard.module.css, which turned out to be the wrong place.
    //
    // `:global(.fc-card)` inside a CSS Module reads like a shared definition
    // and is not one: that file ships inside FlashcardMode's chunk, so on any
    // screen that has not loaded FlashcardMode the rules simply do not exist.
    // Onboarding's demo card points at these same class names and was measured
    // in Chromium with `perspective: none`, `transform-style: flat` and a 0s
    // transition -- the first flip a new reader ever saw was a plain 2D swap,
    // and the "one flip implementation" of item 165 had not actually shared
    // anything. A shared rule has to live somewhere every sharer can reach.
    const globalCss = readFileSync(resolve(root, 'styles/global.css'), 'utf-8');
    for (const needed of [
      '.fc-scene',
      '.fc-card',
      'is-flipped',
      'backface-visibility',
      'preserve-3d',
      'perspective:',
    ]) {
      expect(globalCss, `${needed} is not declared in global.css`).toContain(needed);
    }

    // And not back in a mode's own module, where it would ship in that chunk.
    // Layout may stay there; the 3D and the motion may not.
    const modeCss = readFileSync(
      resolve(root, 'modes/FlashcardMode/flashcard.module.css'),
      'utf-8'
    );
    expect(modeCss, 'the flip rotation is back in a mode chunk').not.toMatch(/is-flipped/);
    expect(modeCss, 'backface-visibility is back in a mode chunk').not.toMatch(
      /backface-visibility/
    );
    expect(modeCss, 'perspective is back in a mode chunk').not.toMatch(/perspective:/);
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
