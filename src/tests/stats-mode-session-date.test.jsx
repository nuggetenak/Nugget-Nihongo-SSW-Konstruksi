// ─── tests/stats-mode-session-date.test.jsx ──────────────────────────────────
// Regression: StatsMode's "7 Hari Terakhir" chart used to build its date key
// with sess.date?.slice(0, 10), which throws (TypeError: ... .slice is not a
// function) for any session whose date isn't a string -- and since there's no
// per-section error handling, that took down the whole mode via the
// ErrorBoundary, not just that one chart. recordSession (ProgressContext.jsx)
// always writes an ISO string today, so this doesn't happen through normal
// use, but validateSnapshot (storage/engine.js) doesn't check individual
// session shapes on Impor Progress, so a hand-edited or differently-shaped
// import is a real path to a session with a non-string date. Found while
// investigating an unrelated BelajarTab layout issue -- see that commit.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatsMode from '../modes/StatsMode.jsx';

const baseProps = {
  known: new Set([1, 2, 3]),
  unknown: new Set(),
  srs: { cards: {} },
  streakData: { days: 1, lastDate: '2026-08-27' },
  onExit: () => {},
};

describe('StatsMode — session.date robustness', () => {
  it('does not throw when a session date is a number (e.g. Date.now())', () => {
    const sessions = [{ mode: 'kartu', correct: 5, total: 8, durationMs: 60000, date: Date.now() }];
    expect(() => render(<StatsMode {...baseProps} sessions={sessions} />)).not.toThrow();
  });

  it('does not throw when a session date is missing or malformed', () => {
    const sessions = [
      { mode: 'kartu', correct: 1, total: 1, durationMs: 0, date: undefined },
      { mode: 'kuis', correct: 1, total: 1, durationMs: 0, date: 'not-a-real-date' },
    ];
    expect(() => render(<StatsMode {...baseProps} sessions={sessions} />)).not.toThrow();
  });

  it('still groups a normal ISO-string session date into the 7-day chart', () => {
    const today = new Date().toISOString();
    const sessions = [{ mode: 'kartu', correct: 3, total: 5, durationMs: 1000, date: today }];
    const { container } = render(<StatsMode {...baseProps} sessions={sessions} />);
    // At least one day column should show a non-zero count on the chart.
    expect(container.textContent).toMatch(/7 Hari Terakhir/);
  });
});
