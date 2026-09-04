// ─── tests/simulasi-timer.test.jsx ───────────────────────────────────────────
// The exam clock used to be a counter decremented by a setInterval whose effect
// listed finishExam in its dependencies — and finishExam depends on `answers`.
// Every answer therefore tore the interval down and started a fresh one,
// throwing away that second's partial progress, and a browser throttling timers
// in a backgrounded tab lost whatever it did not fire. A deadline can't drift:
// the remaining time is derived from the wall clock on every tick.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import SimulasiMode from '../modes/SimulasiMode.jsx';

function renderSim() {
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
          createElement(SimulasiMode, {
            onExit: vi.fn(),
            onSessionEnd: vi.fn(),
            onRetryWrong: vi.fn(),
          })
        )
      )
    )
  );
}

const clock = () => document.querySelector('[class*="timerValue"]')?.textContent;
const seconds = () => {
  const [m, s] = clock().split(':').map(Number);
  return m * 60 + s;
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
  vi.useFakeTimers({ shouldAdvanceTime: false });
});
afterEach(() => vi.useRealTimers());

describe('SimulasiMode — the exam clock is a deadline, not a counter', () => {
  it('a tick after time passed unobserved subtracts all of it, not one second', async () => {
    renderSim();
    await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
    const startedAt = seconds();
    expect(startedAt).toBe(15 * 2 * 60); // 15 questions x 2 minutes

    // A whole minute passes with no interval callback firing at all — a
    // backgrounded tab, a throttled timer, a device asleep — and then exactly
    // one tick happens. A counter would have subtracted that one tick.
    await act(async () => {
      vi.setSystemTime(Date.now() + 60_000);
      vi.advanceTimersByTime(1000);
    });

    expect(startedAt - seconds()).toBe(61);
  });

  it('answering does not give the clock time back', async () => {
    renderSim();
    await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
    const startedAt = seconds();

    // Ten answers spread over ten seconds. The old implementation restarted the
    // interval on each one, so the second in progress was discarded each time.
    // (advanceTimersByTime moves the fake Date as well as firing callbacks, so
    // it is the only thing advancing the clock here.)
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      await act(async () => {
        fireEvent.click(document.querySelectorAll('button[aria-pressed]')[i % 4]);
      });
    }
    expect(startedAt - seconds()).toBe(10);
  });

  it('pausing stops the clock and resuming does not swallow the paused time', async () => {
    renderSim();
    await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
    const startedAt = seconds();

    await act(async () => fireEvent.click(screen.getByLabelText('Jeda')));
    const atPause = seconds();
    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });
    expect(seconds()).toBe(atPause); // two minutes of break cost nothing

    await act(async () => fireEvent.click(screen.getByLabelText('Lanjutkan')));
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(startedAt - seconds()).toBe(5); // only the 5 seconds actually spent
  });
});
