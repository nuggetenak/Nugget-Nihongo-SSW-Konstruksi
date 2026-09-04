// ─── tests/flashcard-freeflip.test.jsx ───────────────────────────────────────
// A flipped card could not be turned back over on a touch screen.
//
// The front face carried the flip handler and went pointerEvents:none once
// flipped; the back face carried no handler at all, and the "🔄 Balik" button
// had been removed 2026-09-04 as redundant with tapping the card — true of the
// front, false of the back. So the only way back to the Japanese was Space on a
// physical keyboard, which the target audience (Android phones) does not have.
//
// These lock the v87 behaviour that was restored: flip freely in both
// directions, keep the rating row and its shortcuts alive across a flip-back,
// and never let a swipe mean "rate this card".
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

const CARDS = [
  {
    id: 1,
    jp: '配管',
    id_text: 'perpipaan',
    category: 'haikan',
    desc: 'Penjelasan singkat soal pipa.',
  },
  { id: 2, jp: '電気', id_text: 'listrik', category: 'denki' },
];

function setup(props = {}) {
  const utils = render(
    <ToastProvider>
      <ConfirmProvider>
        <AppProvider>
          <FlashcardMode
            cards={CARDS}
            known={new Set()}
            unknown={new Set()}
            onMark={() => {}}
            onResetProgress={() => {}}
            onExit={() => {}}
            starred={new Set()}
            onToggleStar={() => {}}
            {...props}
          />
        </AppProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
  return {
    ...utils,
    isFlipped: () => utils.container.querySelector('.fc-card').classList.contains('is-flipped'),
  };
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  // The default 'priority' sort shuffles, which would make "card 1 is first"
  // a coin flip. Corpus order keeps the assertions about *which* card is on
  // screen meaningful; nothing here is testing the sort.
  sessionStorage.setItem('ssw-fc-sort', 'original');
  _reset_for_test();
  init();
});

describe('flashcard — flipping back and forth', () => {
  it('tapping the card flips it, and tapping it again flips it back', () => {
    const { isFlipped } = setup();
    expect(isFlipped()).toBe(false);

    // Exactly one face is labelled at a time — whichever is showing.
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    expect(isFlipped()).toBe(true);

    // This is the click that used to land on nothing at all.
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    expect(isFlipped()).toBe(false);
  });

  it('the nav flip button toggles in both directions and names its state', () => {
    const { isFlipped } = setup();

    // Scoped to the emoji: "📖 Lihat penjelasan" on the back face is always in
    // the DOM and would otherwise match too.
    fireEvent.click(screen.getByRole('button', { name: '👁 Lihat' }));
    expect(isFlipped()).toBe(true);

    const back = screen.getByRole('button', { name: '🔄 Balik' });
    expect(back).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(back);
    expect(isFlipped()).toBe(false);
  });

  it('the rating row survives a flip back to the front, and so do the 1-4 shortcuts', () => {
    const marks = [];
    const { isFlipped } = setup({ onMark: (id, state) => marks.push([id, state]) });

    expect(screen.queryByText('Seberapa hafal kamu?')).toBeNull();

    fireEvent.click(screen.getByLabelText('Balik kartu'));
    expect(screen.getByText('Seberapa hafal kamu?')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Balik kartu'));
    expect(isFlipped()).toBe(false);
    // Still there — it used to vanish the moment the front came back up.
    expect(screen.getByText('Seberapa hafal kamu?')).toBeTruthy();

    fireEvent.keyDown(document.body, { key: '3' });
    expect(marks).toEqual([[1, 'known']]);
  });

  it('moving to another card hides the rating row again', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    expect(screen.getByText('Seberapa hafal kamu?')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Kartu berikutnya'));
    expect(screen.queryByText('Seberapa hafal kamu?')).toBeNull();
  });

  it('reading the description does not flip the card out from under you', () => {
    const { isFlipped } = setup();
    fireEvent.click(screen.getByLabelText('Balik kartu'));

    fireEvent.click(screen.getByText(/Lihat penjelasan/));
    const desc = screen.getByText('Penjelasan singkat soal pipa.');
    expect(isFlipped()).toBe(true);

    fireEvent.click(desc);
    expect(isFlipped()).toBe(true);
  });

  it('arrow keys and the nav arrows still change cards while the card is flipped', () => {
    setup();
    fireEvent.click(screen.getByLabelText('Balik kartu'));

    expect(screen.getByText('1/2')).toBeTruthy();
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(screen.getByText('2/2')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Kartu sebelumnya'));
    expect(screen.getByText('1/2')).toBeTruthy();
  });

  it('a horizontal swipe navigates instead of rating, flipped or not', () => {
    const marks = [];
    const { container } = setup({ onMark: (id, state) => marks.push([id, state]) });
    const scene = container.querySelector('.fc-scene');

    fireEvent.click(screen.getByLabelText('Balik kartu'));

    // Swipe left on a face-up card. This used to send rating 1 (Again) and
    // auto-advance; it must simply move to the next card.
    fireEvent.touchStart(scene, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(scene, { changedTouches: [{ clientX: 100, clientY: 100 }] });

    expect(screen.getByText('2/2')).toBeTruthy();
    expect(marks).toEqual([]);
  });

  it('an upward swipe flips the card rather than rating it Easy', () => {
    const marks = [];
    const { container, isFlipped } = setup({ onMark: (id, state) => marks.push([id, state]) });
    const scene = container.querySelector('.fc-scene');

    fireEvent.touchStart(scene, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchEnd(scene, { changedTouches: [{ clientX: 100, clientY: 100 }] });

    expect(isFlipped()).toBe(true);
    expect(marks).toEqual([]);
  });
});
