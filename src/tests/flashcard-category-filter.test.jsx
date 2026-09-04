// ─── tests/flashcard-category-filter.test.jsx ────────────────────────────────
// UI_UX_PLAN item 55 — FilterPopup wired into FlashcardMode.
//
// The mode's filter state used to be a single search string doing three jobs:
// free text, '__cat:<key>' for one category, and '__starred__'. That made them
// mutually exclusive, capped categories at one, and left the category filter
// reachable only by tapping the badge of a card already on screen. These lock
// the replacement: a real Set of categories, composing with the text query,
// with the old string values still migrating cleanly.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

// 3 haikan · 2 denki · 1 anzen = 6.
const CARDS = [
  { id: 1, jp: '配管', id_text: 'perpipaan', category: 'haikan' },
  // "kabel" deliberately appears in both haikan and denki, so a query alone
  // and a query inside a category give different answers.
  { id: 2, jp: '継手', id_text: 'sambungan kabel', category: 'haikan' },
  { id: 3, jp: '弁', id_text: 'katup', category: 'haikan' },
  { id: 4, jp: '電線', id_text: 'kabel listrik', category: 'denki' },
  { id: 5, jp: '配電盤', id_text: 'panel listrik', category: 'denki' },
  { id: 6, jp: '安全帯', id_text: 'sabuk pengaman', category: 'anzen' },
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

const openPicker = () => fireEvent.click(screen.getByLabelText('Filter kategori'));
const apply = () => fireEvent.click(screen.getByText(/^✓ Terapkan/));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('ssw-fc-sort', 'original');
  _reset_for_test();
  init();
});

describe('flashcard — category picker', () => {
  it('opens a picker listing every category present in the deck, with counts', () => {
    setup();
    openPicker();

    expect(screen.getByText('Filter Kategori')).toBeTruthy();
    expect(screen.getByText('配管工事')).toBeTruthy();
    expect(screen.getByText('電気工事')).toBeTruthy();
    expect(screen.getByText('安全衛生')).toBeTruthy();
    // The other eight categories carry no cards in this deck, so they are not
    // shown at all rather than listed as eight greyed-out zeroes.
    expect(screen.queryByText('消防設備')).toBeNull();
  });

  it('selecting two categories narrows the deck to their union', () => {
    setup();
    expect(screen.getByText('1/6')).toBeTruthy();

    openPicker();
    fireEvent.click(screen.getByText('配管工事'));
    fireEvent.click(screen.getByText('電気工事'));
    apply();

    // 3 haikan + 2 denki. Multi-select is the whole point — the old
    // '__cat:<key>' string could only ever hold one.
    expect(screen.getByText('1/5')).toBeTruthy();
    expect(screen.getByText(/2 kategori · 5 kartu/)).toBeTruthy();
  });

  it('a category filter and a text query apply together', () => {
    setup();

    // "kabel" on its own matches one haikan card and one denki card.
    fireEvent.click(screen.getByLabelText('Cari kartu'));
    fireEvent.change(screen.getByLabelText('Cari kartu'), { target: { value: 'kabel' } });
    expect(screen.getByText('1/2')).toBeTruthy();

    // Narrowing to 配管工事 leaves only the haikan one. Under the old
    // single-string filter this was impossible: setting a category REPLACED
    // the query, and typing a query REPLACED the category.
    openPicker();
    fireEvent.click(screen.getByText('配管工事'));
    apply();

    expect(screen.getByText('1/1')).toBeTruthy();
    expect(screen.getByLabelText('Cari kartu').value).toBe('kabel');
  });

  it('clearing the filter puts every card back and forgets it across a remount', () => {
    const { unmount } = setup();
    openPicker();
    fireEvent.click(screen.getByText('安全衛生'));
    apply();
    expect(screen.getByText('1/1')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Hapus filter kategori'));
    expect(screen.getByText('1/6')).toBeTruthy();

    unmount();
    setup();
    expect(screen.getByText('1/6')).toBeTruthy();
  });

  it('the filter survives leaving and re-entering the mode', () => {
    const { unmount } = setup();
    openPicker();
    fireEvent.click(screen.getByText('電気工事'));
    apply();
    expect(screen.getByText('1/2')).toBeTruthy();

    unmount();
    setup();
    expect(screen.getByText('1/2')).toBeTruthy();
    expect(screen.getByText(/電気工事 · 2 kartu/)).toBeTruthy();
  });

  it("the ToolStrip star button and the picker's Bintang cell are the same filter", () => {
    setup({ starred: new Set([1, 4]) });

    fireEvent.click(screen.getByLabelText(/Saring kartu berbintang/));
    expect(screen.getByText('1/2')).toBeTruthy();
    expect(screen.getByText(/⭐ Bintang · 2 kartu/)).toBeTruthy();

    // The picker opens reflecting that state rather than its own separate one.
    openPicker();
    expect(screen.getByText('Bintang').closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('a legacy "__cat:" search string migrates into the category set', () => {
    // A tab left open across the upgrade. Read as a literal query this matches
    // nothing, and the deck would come up empty with no explanation.
    sessionStorage.setItem('ssw-fc-search', '__cat:haikan');
    setup();

    expect(screen.getByText('1/3')).toBeTruthy();
    expect(screen.getByText(/配管工事 · 3 kartu/)).toBeTruthy();
    expect(screen.getByLabelText('Cari kartu').value).toBe('');
  });

  it('a legacy "__starred__" search string migrates into the star filter', () => {
    sessionStorage.setItem('ssw-fc-search', '__starred__');
    setup({ starred: new Set([6]) });

    expect(screen.getByText('1/1')).toBeTruthy();
    expect(screen.getByText(/⭐ Bintang · 1 kartu/)).toBeTruthy();
  });

  it('an empty result offers a reset that also clears the stored filter', () => {
    setup();
    openPicker();
    fireEvent.click(screen.getByText('安全衛生'));
    apply();
    fireEvent.change(screen.getByLabelText('Cari kartu'), { target: { value: 'zzzz' } });

    fireEvent.click(screen.getByText(/Reset|Hapus/));

    expect(screen.getByText('1/6')).toBeTruthy();
    // Clearing React state alone used to leave the filter in sessionStorage,
    // so a "reset" filter came back on the next entry.
    expect(sessionStorage.getItem('ssw-fc-cats')).toBeNull();
    expect(sessionStorage.getItem('ssw-fc-search')).toBeNull();
  });
});
