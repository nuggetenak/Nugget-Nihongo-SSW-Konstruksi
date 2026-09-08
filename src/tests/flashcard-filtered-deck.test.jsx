// ─── tests/flashcard-filtered-deck.test.jsx ──────────────────────────────────
// UI_UX_PLAN item 118 — FlashcardMode with `filterIds` re-rendered forever.
//
// `baseCards` was a bare `cards.filter(...)` in the component body, so with any
// `filterIds` it was a new array every render. It is a dependency of
// `rebuildOrder`, which is a dependency of the effect that calls
// `setOrder(rebuildOrder(...))` + `setFlipped(false)` + `setIdx(0)`. New array
// into state is never Object.is-equal, so the commit re-rendered, which rebuilt
// `baseCards`, which re-ran the effect. Unbounded.
//
// The learner-visible symptom, reported 2026-09-08 with a screen recording:
// "Lihat" did nothing and Prev/Next did nothing, because every iteration reset
// `flipped` and `idx` before the next paint. It broke every filtered deck --
// eight modes' "Latih N Salah", Sumber's browse, and Terakhir dipelajari.
//
// Item 118 filed this as a jsdom quirk. It was not. These tests exist because
// the only prop that produces the filtered-deck banner is the one prop that
// used to make the component unrenderable, so nothing about a filtered deck
// could ever be tested -- which is how it went years unnoticed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

const CARDS = [
  { id: 11, jp: '配管', id_text: 'perpipaan', category: 'haikan' },
  { id: 12, jp: '継手', id_text: 'sambungan', category: 'haikan' },
  { id: 13, jp: '電線', id_text: 'kabel listrik', category: 'denki' },
  { id: 14, jp: '安全帯', id_text: 'sabuk pengaman', category: 'anzen' },
];

function setup(props = {}) {
  return render(
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
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('ssw-fc-sort', 'original');
  _reset_for_test();
  init();
});

describe('FlashcardMode on a filtered deck', () => {
  it('renders at all — a filtered deck used to loop forever', () => {
    setup({ filterIds: [11] });
    expect(screen.getByText('perpipaan')).toBeTruthy();
  });

  it('flips when you tap Lihat, and stays flipped', () => {
    setup({ filterIds: [11] });
    // Named exactly: the card's own back face is also role=button ("Balik
    // kartu"), so a loose /Balik/ matches two nodes.
    const flip = screen.getByRole('button', { name: '👁 Lihat' });
    expect(flip.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(flip);
    // Same node, re-labelled: the loop used to reset `flipped` to false on the
    // very next commit, so this stayed "Lihat" no matter how often it was hit.
    const flipped = screen.getByRole('button', { name: '🔄 Balik' });
    expect(flipped.getAttribute('aria-pressed')).toBe('true');
  });

  it('advances with Next on a multi-card filtered deck', () => {
    setup({ filterIds: [11, 13] });
    expect(screen.getByText('perpipaan')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Kartu berikutnya' }));
    // `setIdx(0)` fired on every loop iteration, so Next never landed.
    expect(screen.getByText('kabel listrik')).toBeTruthy();
  });

  it('scopes the deck to filterIds and says so in the banner', () => {
    setup({ filterIds: [11, 13], filterReason: 'recent' });
    expect(screen.getByText(/Terakhir dipelajari · 2 kartu/)).toBeTruthy();
    expect(screen.queryByText('sabuk pengaman')).toBeNull();
  });

  it('keeps the red wrong-answer banner for the wrong-answer drill', () => {
    setup({ filterIds: [11], filterReason: 'wrong' });
    expect(screen.getByText(/Latihan kartu salah · 1 kartu/)).toBeTruthy();
  });
});
