// ─── tests/category-picker.test.jsx ──────────────────────────────────────────
// Item 77's other half. Single-select category selection was written three
// times in three shapes over the same `['all', ...categories]` list — pills in
// QuizMode, list rows with counts in SprintMode, emoji chips in GlossaryMode —
// each re-deriving the `all` pseudo-category and the active styling by hand.
//
// One component with a variant. `FilterPopup` is deliberately not what they
// collapsed into: it is a multi-select modal sheet over the flashcard deck
// (item 55), and these are inline single-select controls on setup screens.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import CategoryPicker, { countByCategory } from '../components/CategoryPicker.jsx';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(resolve(SRC, f), 'utf-8');

const CATS = [
  { key: 'anzen', label: 'Keselamatan', emoji: '🦺' },
  { key: 'sekou', label: 'Konstruksi', emoji: '🔩' },
];

describe('CategoryPicker (item 77)', () => {
  it('owns the "Semua" entry so no caller has to invent it', () => {
    render(<CategoryPicker cats={CATS} value="all" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Semua/ })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders nothing when there is only one real category to choose', () => {
    // "Semua" plus one is not a choice — all three call sites guarded for this
    // separately before, and two of them guarded on a list that already
    // included `all`, so their thresholds differed.
    const { container } = render(
      <CategoryPicker cats={[CATS[0]]} value="all" onChange={() => {}} />
    );
    expect(container.textContent).toBe('');
  });

  it('reports the key that was picked', () => {
    const onChange = vi.fn();
    render(<CategoryPicker cats={CATS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Keselamatan/ }));
    expect(onChange).toHaveBeenCalledWith('anzen');
  });

  it('marks the selected one for a screen reader, not only visually', () => {
    render(<CategoryPicker cats={CATS} value="sekou" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Konstruksi/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /Semua/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('takes counts rather than deriving them, so a caller can mean something narrower', () => {
    // GlossaryMode's "Semua" means what the current search matched, not the
    // size of the corpus. Deriving would overrule it.
    render(
      <CategoryPicker
        cats={CATS}
        value="all"
        onChange={() => {}}
        variant="rows"
        counts={{ all: 7, anzen: 3, sekou: 4 }}
        countSuffix="kartu"
      />
    );
    expect(screen.getByText('7 kartu')).toBeTruthy();
    expect(screen.getByText('3 kartu')).toBeTruthy();
  });

  it('shows no counts at all when the caller passes none', () => {
    render(<CategoryPicker cats={CATS} value="all" onChange={() => {}} variant="rows" />);
    expect(screen.queryByText(/kartu/)).toBeNull();
  });

  it('the compact variant labels its emoji-only chips for a screen reader', () => {
    render(<CategoryPicker cats={CATS} value="all" onChange={() => {}} variant="compact" />);
    // Emoji alone is not a label; the name has to come from somewhere.
    expect(screen.getByRole('button', { name: 'Keselamatan' })).toBeTruthy();
  });

  it('countByCategory counts the list it is given, all included', () => {
    const counts = countByCategory([
      { category: 'anzen' },
      { category: 'anzen' },
      { category: 'sekou' },
    ]);
    expect(counts).toEqual({ all: 3, anzen: 2, sekou: 1 });
  });

  it('all three call sites use it, and none keeps a local copy', () => {
    for (const f of ['modes/QuizMode.jsx', 'modes/SprintMode.jsx', 'modes/GlossaryMode.jsx']) {
      expect(read(f), `${f} does not use the shared picker`).toMatch(/CategoryPicker/);
    }
  });
});
