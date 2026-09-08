// ─── tests/untested-modes.test.jsx ───────────────────────────────────────────
// UI_UX_PLAN item 119 — the 13 modes no test had ever rendered.
//
// That blind spot is 6,009 lines, 56% of the modes layer, and it is why a
// filtered deck could re-render without bound for months, why the notes screen
// could report zero notes while showing them, and why the search box could miss
// 224 cards whose own displayed text was typed into it.
//
// These are the defects that pass every other check the repo has: each one is
// well-formed code that produces a wrong screen.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { init, set as storageSet, _reset_for_test } from '../storage/engine.js';
import { CARDS } from '../data/cards.js';
import SprintMode from '../modes/SprintMode.jsx';
import QuizMode from '../modes/QuizMode.jsx';
import SearchMode from '../modes/SearchMode.jsx';
import CatatanMode from '../modes/CatatanMode.jsx';

const wrap = (ui) => (
  <ToastProvider>
    <ConfirmProvider>
      <AppProvider>{ui}</AppProvider>
    </ConfirmProvider>
  </ToastProvider>
);

const DECK = [
  { id: 1, jp: '配管', id_text: 'perpipaan', category: 'haikan' },
  { id: 2, jp: '継手', id_text: 'sambungan', category: 'haikan' },
  { id: 3, jp: '電線', id_text: 'kabel listrik', category: 'denki' },
];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
  init();
});

describe('the filtered-deck render loop, across every mode that takes filterIds', () => {
  // Sumber launches all three of these with a `filterIds`. Two of them were
  // still allocating the deck inline at the top of the component body, feeding
  // an effect that set state — the loop that made "Lihat" do nothing in Kartu
  // and froze Sprint's setup screen at mount, before any tap.
  it('SprintMode renders a filtered deck instead of looping', () => {
    const { container } = render(
      wrap(<SprintMode cards={DECK} filterIds={[1, 3]} onExit={() => {}} />)
    );
    // Reaching this line at all is the assertion: the loop never yielded, so
    // render() itself did not return and the runner had to be killed.
    expect(container.textContent.length).toBeGreaterThan(0);
    expect(screen.getByText(/Mulai/)).toBeTruthy();
  });

  it('QuizMode renders a filtered deck instead of looping', () => {
    const { container } = render(
      wrap(
        <ProgressProvider>
          <QuizMode cards={DECK} filterIds={[1, 3]} onExit={() => {}} />
        </ProgressProvider>
      )
    );
    expect(container.textContent.length).toBeGreaterThan(0);
  });

  it('no mode allocates its filtered deck inline any more', async () => {
    // The mechanical form of the bug, guarded across the whole modes layer:
    // `cards.filter((c) => filterIds.includes(c.id))` in a component body is a
    // new identity every render. useScopedDeck is the only sanctioned spelling.
    const { readFileSync, readdirSync } = await import('fs');
    const { resolve } = await import('path');
    const dir = resolve(process.cwd(), 'src/modes');
    const files = readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.jsx'));
    for (const f of files) {
      const src = readFileSync(resolve(dir, String(f)), 'utf8');
      expect(src, `${f} filters by filterIds inline`).not.toMatch(
        /=\s*filterIds\s*\?\s*cards\.filter\(/
      );
    }
  });
});

describe('Cari searches the text it shows you', () => {
  it('finds a card by the form displayed on screen, not the raw one', () => {
    // Every surface renders the furigana-stripped form and the copy button
    // copies it; the haystack was built from the raw `jp`, readings and all. So
    // typing what you just copied returned "Tidak ditemukan… periksa ejaan
    // kamu" for 224 of the 1,626 cards.
    const card = CARDS.find((c) => c.jp.includes('《') && c.jp.indexOf('《') > 1);
    const displayed = card.jp.slice(0, card.jp.indexOf('《'));
    render(wrap(<SearchMode track={null} starred={new Set()} toggleStar={() => {}} />));
    fireEvent.change(screen.getByPlaceholderText(/Cari/i), { target: { value: displayed } });
    // 120ms debounce; findByText polls for a second.
    return screen.findByText(card.id_text).then((el) => expect(el).toBeTruthy());
  });
});

describe('Buku Catatan counts the notes it is showing', () => {
  it('reports the real number, not zero', () => {
    // `Object.keys()` gives strings and `c.id` is a number, so the `===`
    // cross-check never matched and the count was permanently 0 — on the screen
    // whose entire purpose is those notes, right after saving one.
    storageSet('prefs', (p) => ({ ...p, notes: { 1: 'catatan satu', 3: 'catatan tiga' } }));
    render(wrap(<CatatanMode cards={DECK} />));
    expect(screen.getByText(/2 catatan/)).toBeTruthy();
    expect(screen.getByText(/Ada Catatan \(2\)/)).toBeTruthy();
  });

  it('does not count an emptied note', () => {
    storageSet('prefs', (p) => ({ ...p, notes: { 1: 'ada', 2: '' } }));
    render(wrap(<CatatanMode cards={DECK} />));
    expect(screen.getByText(/1 catatan/)).toBeTruthy();
  });
});
