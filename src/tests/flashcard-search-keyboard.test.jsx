// ─── tests/flashcard-search-keyboard.test.jsx ─────────────────────────────────
// UI_UX_PLAN.md item 31 — regression test.
//
// FlashcardMode/index.jsx binds a window-level keydown handler (Space to flip,
// ArrowLeft/ArrowRight to navigate, 1-4 to rate) for hands-free study. FilterBar
// renders a text search input in the same tree. Before this fix, the handler had
// no check for whether a text field was focused: Space was swallowed by
// preventDefault() and flipped the card instead of typing a space, and the arrow
// keys navigated cards instead of moving the text caret — making multi-word
// search impossible. Fixed via utils/keyboard.js's isTypingTarget() guard.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

const CARDS = [
  { id: 1, jp: '現場', id_text: 'lokasi kerja', category: 'jenis_kerja', module: 'lifeline' },
  { id: 2, jp: '安全', id_text: 'keselamatan', category: 'jenis_kerja', module: 'lifeline' },
];

function setup() {
  const utils = render(
    <ToastProvider>
      <FlashcardMode
        cards={CARDS}
        known={new Set()}
        unknown={new Set()}
        onMark={() => {}}
        onExit={() => {}}
        starred={new Set()}
        onToggleStar={() => {}}
      />
    </ToastProvider>
  );
  // FilterBar (and its search input) is collapsed behind the "Cari kartu"
  // toggle by default — open it so the input is in the DOM.
  fireEvent.click(screen.getByLabelText('Cari kartu'));
  return utils;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
  init();
});

describe('item 31 — FlashcardMode search box vs global keydown handler', () => {
  it('typing a space into the search box inserts a space, not a card flip', () => {
    setup();
    const input = screen.getByPlaceholderText(/Cari JP/i);
    input.focus();

    fireEvent.change(input, { target: { value: 'lokasi' } });
    const spaceEvent = fireEvent.keyDown(input, { key: ' ', code: 'Space' });

    // fireEvent returns false only if preventDefault() was called on the event.
    // The old handler called preventDefault() unconditionally on Space.
    expect(spaceEvent).toBe(true);
  });

  it('typing a full multi-word query into the search box works end to end', () => {
    setup();
    const input = screen.getByPlaceholderText(/Cari JP/i);
    input.focus();

    fireEvent.change(input, { target: { value: 'lokasi kerja' } });

    expect(input.value).toBe('lokasi kerja');
  });

  it('ArrowLeft/ArrowRight while the search box is focused do not throw and do not consume the event', () => {
    setup();
    const input = screen.getByPlaceholderText(/Cari JP/i);
    input.focus();

    const left = fireEvent.keyDown(input, { key: 'ArrowLeft' });
    const right = fireEvent.keyDown(input, { key: 'ArrowRight' });

    expect(left).toBe(true);
    expect(right).toBe(true);
  });

  it('Space still flips the card when focus is NOT in a text field', () => {
    setup();
    // Move focus off the input (e.g. back to the document body), matching how a
    // real user's focus sits after using touch/mouse to view the card rather
    // than typing in the search box.
    document.body.focus();

    const spaceEvent = fireEvent.keyDown(document.body, { key: ' ', code: 'Space' });

    // The shortcut is still active for non-field targets — preventDefault() is
    // still called, so this must be false. Confirms the fix is a scoped guard,
    // not a removal of the keyboard shortcut.
    expect(spaceEvent).toBe(false);
  });
});
