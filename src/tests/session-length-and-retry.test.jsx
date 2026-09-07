// ─── tests/session-length-and-retry.test.jsx ─────────────────────────────────
// Items 79 and 80 — two audits of the same thing: a capability that exists in
// some modes and silently not in others, with no rule saying which.
//
// 80: `QUIZ_COUNTS` reached `kuis` and `dengar` only; `angka`, `jebak` and
// `mirip` always drilled the whole shuffled pool. And the auto-advance delay
// was offered by two of the four modes that share QuizShell, leaving
// `wayground` and `vocab` pinned to its 2000 ms default with no way out.
//
// 79: the "practise what you got wrong" bridge. Reading the four modes the item
// named turned up that two of its premises were wrong — `angka` and `mirip`
// record no wrong answers at all — and that the ones that can be wired have
// exact ids, while the ones that cannot would be guessing.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { render, screen } from '@testing-library/react';
import { _reset_for_test, init, get, set } from '../storage/engine.js';
import {
  QUIZ_COUNTS,
  QUIZ_COUNT_ALL,
  AUTO_NEXT_DELAYS,
  resolveQuizCount,
} from '../utils/constants.js';
import { storedAutoNextDelay, saveAutoNextDelay } from '../utils/auto-next.js';
import SessionLengthPicker, { storedQuizCount } from '../components/SessionLengthPicker.jsx';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';
import { CARDS } from '../data/cards.js';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(resolve(SRC, f), 'utf-8');

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('session length is one preference (item 80)', () => {
  it('a count past the pool is the whole pool, not a broken slice', () => {
    expect(resolveQuizCount(30, 12)).toBe(12);
    expect(resolveQuizCount(10, 12)).toBe(10);
  });

  it('"Semua" is a sentinel, not a pool size', () => {
    // It used to be stored as the deck's own length, so a choice made in one
    // mode arrived in the next as a fixed count that meant nothing there.
    expect(resolveQuizCount(QUIZ_COUNT_ALL, 29)).toBe(29);
    expect(resolveQuizCount(QUIZ_COUNT_ALL, 3)).toBe(3);
  });

  it('an unset preference means the whole pool rather than zero questions', () => {
    expect(resolveQuizCount(undefined, 20)).toBe(20);
    expect(resolveQuizCount(null, 20)).toBe(20);
  });

  it('the picker offers only counts the pool can actually give, plus Semua', () => {
    render(<SessionLengthPicker total={20} value={10} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '10' })).toBeTruthy();
    // 20 and 30 would both just be "all 20" under another name.
    expect(screen.queryByRole('button', { name: '20' })).toBeNull();
    expect(screen.queryByRole('button', { name: '30' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Semua (20)' })).toBeTruthy();
  });

  it('renders nothing when the pool is too small to offer a choice', () => {
    const { container } = render(<SessionLengthPicker total={5} value={5} onChange={() => {}} />);
    expect(container.textContent).toBe('');
  });

  it('the choice persists, and comes back resolved against the next pool', () => {
    const { rerender } = render(<SessionLengthPicker total={100} value={10} onChange={() => {}} />);
    screen.getByRole('button', { name: 'Semua (100)' }).click();
    expect(get('prefs').quizQuestionCount).toBe(QUIZ_COUNT_ALL);
    // A different mode, a smaller pool: still "all of it", not 100.
    expect(storedQuizCount(29)).toBe(29);
    rerender(<SessionLengthPicker total={100} value={100} onChange={() => {}} />);
  });
});

describe('auto-advance is one preference (item 80)', () => {
  it('defaults to the shell default when nothing is stored', () => {
    expect(storedAutoNextDelay()).toBe(2000);
  });

  it('round-trips, and treats Manual (0) as a real choice rather than falsy', () => {
    saveAutoNextDelay(0);
    expect(storedAutoNextDelay()).toBe(0);
    saveAutoNextDelay(1000);
    expect(storedAutoNextDelay()).toBe(1000);
  });

  it('offers one list, including Manual', () => {
    // Two lists of different shapes ({ms,label} and {v,l}) is how the four
    // modes sharing one shell ended up offering different pacing.
    expect(AUTO_NEXT_DELAYS.map((d) => d.ms)).toContain(0);
    AUTO_NEXT_DELAYS.forEach((d) => {
      expect(typeof d.ms).toBe('number');
      expect(typeof d.label).toBe('string');
    });
  });

  it('the modes with no options panel read the same preference', () => {
    // wayground and vocab render QuizShell from a set list with nowhere to put
    // a picker, which is why the delay is a preference and not a session choice.
    for (const f of ['modes/WaygroundMode.jsx', 'modes/VocabMode.jsx']) {
      expect(read(f), `${f} does not read the shared delay`).toMatch(/storedAutoNextDelay/);
      expect(read(f), `${f} does not pass it to QuizShell`).toMatch(
        /autoNextDelay=\{autoNextDelay\}/
      );
    }
  });
});

describe('the retry-wrong bridge (item 79)', () => {
  it('angka can resolve its wrong answers to real cards, from the data', () => {
    // The one mode in the item's list where the ids are explicit rather than
    // inferred from matching Japanese strings against the corpus.
    const ids = new Set(CARDS.map((c) => c.id));
    const linked = ANGKA_KUNCI.filter((a) => typeof a.kartu === 'number' && ids.has(a.kartu));
    expect(linked.length).toBeGreaterThan(ANGKA_KUNCI.length * 0.8);
  });

  it('sprint records its wrong answers by card id, so its bridge is exact too', () => {
    const src = read('modes/SprintMode.jsx');
    expect(src).toMatch(/onRetryWrong\(wrongIds\)/);
  });

  it('every mode handed onRetryWrong passes card ids, never list positions', () => {
    // SimulasiMode once passed `wrongList.map((_, i) => i)` — positions in the
    // wrong-answer list — to a prop that navigates by card id, so one wrong
    // answer opened an empty deck and twenty opened cards 1..19.
    const router = read('router/ModeRouter.jsx');
    const handlers = [...router.matchAll(/onRetryWrong:\s*\(([^)]*)\)\s*=>/g)].map((m) => m[1]);
    expect(handlers.length).toBeGreaterThan(0);
    handlers.forEach((arg) => expect(arg.trim()).toBe('ids'));
  });

  it('vocab can drill only what it got wrong, like wayground', () => {
    // Both write `${setId}-${q.id}` into their own store; only one of them read
    // it back.
    const src = read('modes/VocabMode.jsx');
    expect(src).toMatch(/getSetWrongCount/);
    expect(src).toMatch(/Ulang \{wrongCount\} salah/);
  });

  it('dengar can drill only what it got wrong, like kuis', () => {
    const src = read('modes/DengarMode.jsx');
    expect(src).toMatch(/Mode Lemah/);
    expect(src).toMatch(/lemahMode \? lemahCards : cards/);
  });
});

describe('the results screen counts cards, not questions (item 79)', () => {
  it('labels the retry button with what it will actually open', () => {
    const src = read('components/ResultScreen.jsx');
    expect(src).toMatch(/retryWrongCount \?\? wrongCount/);
  });
});
