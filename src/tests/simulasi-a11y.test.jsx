// ─── tests/simulasi-a11y.test.jsx ────────────────────────────────────────────
// Item 95. `QuizShell` gives every other quiz mode `useQuizKeyboard`, an
// aria-live "Soal X dari Y", and QuizAnnouncer. `simulasi` builds its own
// playing screen and had none of it — no shortcuts at all, and no live region,
// so the question counter and the countdown both changed silently. On the one
// screen a learner sits in front of for a hundred minutes.
//
// Its navigator compounded that: one button per question, in document order
// *before* Prev/Next and Kumpulkan, so a 51-question JAC exam put 51 buttons
// between a keyboard user and "submit".
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import SimulasiMode, { QuestionNavigator } from '../modes/SimulasiMode.jsx';

function renderSim() {
  return render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(
            ProgressProvider,
            null,
            createElement(SimulasiMode, {
              onExit: vi.fn(),
              onSessionEnd: vi.fn(),
              onRetryWrong: vi.fn(),
            })
          )
        )
      )
    )
  );
}

const start = async () => {
  await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
};
const options = () => [
  ...screen.getByRole('group', { name: 'Pilihan jawaban' }).querySelectorAll('button'),
];
const press = async (key) => {
  await act(async () => fireEvent.keyDown(window, { key }));
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
});

describe('simulasi keyboard (item 95)', () => {
  it('1–4 pick an option', async () => {
    renderSim();
    await start();
    await press('2');
    expect(options()[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('a second key changes the answer — this paper is re-markable', async () => {
    // Deliberately not QuizShell's shared hook, which only fires while nothing
    // is selected: item 48 says answers can be changed until you hand in.
    renderSim();
    await start();
    await press('1');
    await press('3');
    expect(options()[0]).toHaveAttribute('aria-pressed', 'false');
    expect(options()[2]).toHaveAttribute('aria-pressed', 'true');
  });

  it('arrows move between questions, and stop at the ends', async () => {
    renderSim();
    await start();
    expect(screen.getByText('Soal 1 / 15')).toBeTruthy();
    await press('ArrowLeft'); // already at the first
    expect(screen.getByText('Soal 1 / 15')).toBeTruthy();
    await press('ArrowRight');
    expect(screen.getByText('Soal 2 / 15')).toBeTruthy();
    await press('ArrowLeft');
    expect(screen.getByText('Soal 1 / 15')).toBeTruthy();
  });

  it('F flags the question you are reading', async () => {
    renderSim();
    await start();
    await press('f');
    expect(screen.getByText('Ditandai')).toBeTruthy();
    await press('f');
    expect(screen.getByText('Tandai')).toBeTruthy();
  });

  it('does nothing while paused', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(screen.getByLabelText('Jeda')));
    await press('2');
    // The pause overlay is up; the paper underneath must not take input.
    expect(screen.queryByText(/1\/15 soal/)).toBeNull();
    await act(async () => fireEvent.click(screen.getByLabelText('Lanjutkan')));
    expect(options().every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });
});

describe('simulasi screen-reader support (item 95)', () => {
  it('announces which question is showing, politely', async () => {
    renderSim();
    await start();
    const live = document.querySelector('[aria-live="polite"].sr-only');
    expect(live).toBeTruthy();
    expect(live.textContent).toMatch(/Soal 1 dari 15/);
    // Polite, not assertive: the countdown must not interrupt a reader
    // mid-question, which is the whole reason this screen has a clock.
    expect(live.getAttribute('aria-live')).toBe('polite');
  });

  it('says whether the current question is answered and flagged', async () => {
    renderSim();
    await start();
    await press('1');
    await press('f');
    const live = document.querySelector('[aria-live="polite"].sr-only');
    expect(live.textContent).toMatch(/ditandai/);
    expect(live.textContent).toMatch(/sudah dijawab/);
  });

  it('offers a way past the navigator to the submit button', async () => {
    renderSim();
    await start();
    const skip = screen.getByRole('link', { name: /Kumpulkan Ujian/ });
    expect(skip.getAttribute('href')).toBe('#simulasi-kumpulkan');
    expect(document.getElementById('simulasi-kumpulkan')).toBeTruthy();
  });

  it('the skip link comes before the navigator it skips', async () => {
    renderSim();
    await start();
    const skip = screen.getByRole('link', { name: /Kumpulkan Ujian/ });
    const firstCell = screen.getByLabelText(/^Soal 1, /);
    // A skip link after the thing it skips is decoration.
    expect(skip.compareDocumentPosition(firstCell) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// ─── Pause overlay vs the exit confirmation (item 187) ───────────────────────
// The pause overlay is a real dialog: role, aria-modal and a focus trap, added
// because a keyboard or screen-reader user could otherwise Tab straight through
// the dim into the exam behind it. But its own "✕ Keluar dari simulasi" button
// opens the exit-guard confirmation, which is a Sheet -- also aria-modal, also
// focus-trapped. Two modals claiming the document at once is undefined for
// assistive tech: aria-modal on an ancestor is what hides everything outside it,
// so two of them disagree about what "outside" means.
//
// Escape is NOT part of this. GlobalKeyboardLayer stands every key down while
// any [role="dialog"] is mounted, so the pause overlay already blocks it -- an
// external audit reported otherwise and the code was right.
describe('simulasi pause overlay + exit confirm (item 187)', () => {
  const pauseBtn = () => screen.getByLabelText('Jeda');

  it('never has two aria-modal dialogs open at once', async () => {
    renderSim();
    await start();

    await act(async () => fireEvent.click(pauseBtn()));
    expect(document.querySelectorAll('[aria-modal="true"]')).toHaveLength(1);

    await act(async () => fireEvent.click(screen.getByText(/Keluar dari simulasi/i)));

    // The confirm Sheet is open on top of the paused exam. Exactly one of the
    // two may claim modality.
    expect(document.querySelectorAll('[aria-modal="true"]')).toHaveLength(1);
  });

  it('still traps and announces the pause overlay when no confirm is open', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(pauseBtn()));

    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe('simulasi-paused-title');
    expect(screen.getByText('Dijeda')).toBeTruthy();
  });
});

// ─── The 1 Hz re-render (item 188) ───────────────────────────────────────────
// `timeLeft` is state on SimulasiMode, so every tick re-rendered the whole
// component -- including one button per question. On a 51-question JAC exam
// that is 51 buttons reconciled every second for up to a hundred minutes, on
// the cheap Android phones this app was built for. The navigator is memoised
// now and nothing in it depends on the clock.
//
// Note on what is NOT asserted here: comparing the navigator's DOM nodes before
// and after a tick proves nothing, because React reuses DOM nodes across
// re-renders whether or not the subtree was skipped. A test written that way
// passes with the memo removed, which makes it worse than no test. So the
// memoisation is asserted structurally, and the tick is asserted separately.
describe('simulasi timer does not re-render the navigator (item 188)', () => {
  it('the navigator is a memo component', () => {
    // Symbol-level check: survives any refactor of the component's insides, and
    // fails the moment someone unwraps memo() -- which is the regression that
    // would silently restore the 51-buttons-per-second cost.
    expect(QuestionNavigator.$$typeof).toBe(Symbol.for('react.memo'));
  });

  it('the clock still ticks', async () => {
    vi.useFakeTimers();
    try {
      renderSim();
      await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
      const readClock = () =>
        [...document.querySelectorAll('div')]
          .map((d) => d.textContent)
          .find((t) => /^\d{1,3}:\d{2}$/.test(t || ''));
      const before = readClock();
      expect(before, 'a clock should be on screen').toBeTruthy();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(readClock(), 'the exam clock must still be counting down').not.toBe(before);
    } finally {
      vi.useRealTimers();
    }
  });
});
