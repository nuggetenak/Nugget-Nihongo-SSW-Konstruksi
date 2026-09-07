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
import SimulasiMode from '../modes/SimulasiMode.jsx';

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
