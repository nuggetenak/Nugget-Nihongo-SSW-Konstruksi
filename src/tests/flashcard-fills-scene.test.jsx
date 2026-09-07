// ─── tests/flashcard-fills-scene.test.jsx ────────────────────────────────────
// Item 74. The card used to sit at its own height inside a scene that had
// already grown: 179px of air on a 390x844 phone, 401px on an 820x1180 tablet,
// measured in Chromium. The blocker was `.back` — `position: absolute` with
// top/left/right and no `bottom`, so it was content-height whatever the card
// did, and stretching the card would have rendered the back shorter than the
// front.
//
// jsdom computes no layout, so the heights themselves were verified in a real
// browser (see the item's write-up in docs/UI_UX_PLAN.md). What is held here is
// the set of invariants that make the layout stable, each of which is checkable
// without a layout engine — and each of which, if broken, brings back a visible
// resize on the flip.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { render, screen, fireEvent } from '@testing-library/react';
import RatingRow from '../modes/FlashcardMode/RatingRow.jsx';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(resolve(SRC, rel), 'utf-8');

/** The declarations of one class in a CSS module, as a single string. */
function block(css, selector) {
  const i = css.indexOf(`${selector} {`);
  expect(i, `${selector} not found`).toBeGreaterThanOrEqual(0);
  return css.slice(i, css.indexOf('}', i));
}

describe('flip card fills its scene (item 74)', () => {
  const flip = () => read('modes/FlashcardMode/FlipCard.module.css');
  const scene = () => read('modes/FlashcardMode/flashcard.module.css');

  it('the back face has a bottom edge, so both faces are the same box', () => {
    // Without this the back is content-height and a stretched card renders its
    // two faces at different heights — the whole reason this item was blocked.
    expect(block(flip(), '.back')).toMatch(/\bbottom:\s*0/);
  });

  it('the card grows into the scene, and the front grows into the card', () => {
    expect(block(scene(), ':global(.fc-card)')).toMatch(/flex:\s*1 1 auto/);
    expect(block(flip(), '.front')).toMatch(/flex:\s*1 1 auto/);
  });

  it('the scene no longer centres a smaller card in itself', () => {
    // The centring existed to distribute the air. There is no air now, and
    // leaving it in would fight the growth above.
    expect(block(scene(), '.scene')).not.toMatch(/justify-content/);
  });

  it('nothing measures the back face any more', () => {
    // The ResizeObserver kept the two faces equal by measurement. `bottom: 0`
    // does it by construction, and re-introducing the observer would pin the
    // card back to the back's *content* height — which is, by definition, not
    // its container's.
    // Matched on the construction, not the word: the comment explaining why it
    // is gone names it, and should not be what keeps this test honest.
    expect(read('modes/FlashcardMode/FlipCard.jsx')).not.toMatch(/new ResizeObserver/);
  });
});

describe('nothing below the card changes the page height (item 74)', () => {
  const props = { srsPreviews: { 1: 0.02, 2: 1, 3: 3, 4: 10 }, onRate: () => {} };

  /** Buttons a user can actually reach — getByRole honours aria-hidden. */
  const offered = () => screen.queryAllByRole('button', { name: /^Nilai / }).length;
  /** Buttons present at all, reachable or not — what reserves the height. */
  const present = () => document.querySelectorAll('button[aria-label^="Nilai "]').length;

  it('reserves the four rating buttons before the card has been flipped', () => {
    render(<RatingRow seen={false} rated={false} {...props} />);
    expect(present()).toBe(4);
    expect(offered()).toBe(0);
  });

  it('offers them once the card has been seen', () => {
    render(<RatingRow seen rated={false} {...props} />);
    expect(present()).toBe(4);
    expect(offered()).toBe(4);
  });

  it('keeps reserving them after rating, while the confirmation shows', () => {
    render(<RatingRow seen rated {...props} />);
    expect(present()).toBe(4);
    expect(offered()).toBe(0);
    expect(screen.getByText(/Dinilai/)).toBeTruthy();
  });

  it('a hidden rating button cannot be clicked', () => {
    const rates = [];
    render(<RatingRow seen={false} rated={false} srsPreviews={{}} onRate={(r) => rates.push(r)} />);
    fireEvent.click(document.querySelector('button[aria-label^="Nilai "]'));
    expect(rates).toEqual([]);
  });

  it('the two hint lines are hidden rather than unmounted', () => {
    // Both used to mount on the first flip: one under the rating row, one at
    // the very bottom of the tool strip. Either one moves the page height, and
    // the page height is now the card's height.
    expect(read('modes/FlashcardMode/index.jsx')).toMatch(
      /visibility: seen && !rated \? 'visible' : 'hidden'/
    );
    expect(read('modes/FlashcardMode/ToolStrip.jsx')).toMatch(
      /visibility: seen && !rated \? 'visible' : 'hidden'/
    );
  });
});
