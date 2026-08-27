// ─── tests/simulasi-exit-and-options.test.jsx ────────────────────────────────
// Reported: "kalau pencet keluar langsung keluar hilang progressnya" -- ✕
// Keluar called onExit directly during the playing phase with no
// confirmation, unlike the submit-with-unanswered-questions path (which
// already used the same useConfirm hook). A misclick during a 45-minute/
// 1075-question full simulation discarded everything with no recovery.
//
// Also reported: "banyak yang masih kyk ⟨⟨...⟩⟩" -- SimulasiMode built its
// own option pool in buildPool()/the questions memo without stripFuri(),
// unlike every other mode's options (VocabMode etc., which strip before
// handing text to QuizShell/OptionButton -- options render as plain text
// everywhere else in the app, never as live <ruby>). The raw 《reading》
// marker showed up on screen literally instead of being removed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import SimulasiMode from '../modes/SimulasiMode.jsx';

const root = resolve(__dirname, '..');

function renderSimulasi(onExit = vi.fn()) {
  render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(SimulasiMode, { onExit, onSessionEnd: vi.fn(), onRetryWrong: vi.fn() })
        )
      )
    )
  );
  return onExit;
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('SimulasiMode — exit confirmation during an active simulation', () => {
  it('does not exit immediately -- shows a confirm dialog first', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));

    fireEvent.click(screen.getByText('✕ Keluar'));
    // Still on the quiz -- a question should still be visible, dialog pending.
    expect(await screen.findByText('Tetap di sini')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();
  });

  it('cancelling the exit dialog keeps the simulation running', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByText('✕ Keluar'));

    await act(async () => {
      fireEvent.click(await screen.findByText('Tetap di sini'));
    });
    expect(onExit).not.toHaveBeenCalled();
    expect(screen.getByText(/Soal 1 \//)).toBeTruthy();
  });

  it('confirming actually exits', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByText('✕ Keluar'));

    await act(async () => {
      fireEvent.click(await screen.findByText('Keluar, hapus progres'));
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('exiting from the start screen (nothing to lose yet) needs no confirmation', () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('← Kembali'));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('pausing offers an explicit exit path alongside resume, not just a dismiss-to-resume overlay', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByLabelText('Jeda'));

    expect(screen.getByText('Dijeda')).toBeTruthy();
    expect(screen.getByText('▶ Lanjutkan')).toBeTruthy();
    fireEvent.click(screen.getByText('✕ Keluar dari simulasi'));
    await act(async () => {
      fireEvent.click(await screen.findByText('Keluar, hapus progres'));
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe('SimulasiMode — option text never shows raw 《reading》 markup', () => {
  it('strips furigana markers before the options array is built, deterministically', () => {
    // Source-level guarantee (no dependency on which questions a random
    // shuffle happens to sample): the options mapping must run every option
    // through stripFuri before it becomes shuffledOpts. Same convention this
    // file already uses in correct-wrong-tokens.test.js for its own
    // regressions -- read the source, assert the fix's shape is present.
    const src = readFileSync(resolve(root, 'modes/SimulasiMode.jsx'), 'utf8');
    const idx = src.indexOf('q.options.map(');
    expect(idx).toBeGreaterThan(-1);
    // The stripFuri( call should appear within the same statement, well
    // before the next unrelated top-level construct.
    const nearby = src.slice(idx, idx + 200);
    expect(nearby).toMatch(/stripFuri\(/);
  });

  it('strips furigana markers from every rendered option across a full sample', () => {
    renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    // 'quick' preset (default) = 15 questions; run through all of them via
    // the navigator so this doesn't depend on which 15 got shuffled in.
    for (let i = 0; i < 15; i++) {
      const nav = screen.queryByLabelText(new RegExp(`^Soal ${i + 1},`));
      if (nav) fireEvent.click(nav);
      expect(document.body.textContent).not.toMatch(/《.*》/);
    }
  });
});
