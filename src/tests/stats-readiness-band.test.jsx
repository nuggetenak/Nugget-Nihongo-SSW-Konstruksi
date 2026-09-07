// ─── tests/stats-readiness-band.test.jsx ─────────────────────────────────────
// Item 70. Item 56 decided a readiness *number* should never be shown: a
// confident-looking wrong percentage is actively demotivating for someone whose
// visa depends on this exam, so `calcReadinessBand` returns kurang/cukup/siap
// and returns null below 5 scored sessions rather than guessing. The Dashboard
// honoured that; StatsMode still drew "45%" in a big ring from `calcReadiness`,
// so the two screens made different claims from the same value.
//
// These tests hold the decision rather than the layout: the band label must
// appear, and no bare percentage may appear inside the readiness card. The
// percentages elsewhere on the screen (cards memorised, per-category accuracy)
// are a different measurement and are not in scope here.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import StatsMode from '../modes/StatsMode.jsx';

const baseProps = {
  known: new Set([1, 2, 3]),
  unknown: new Set(),
  srs: { cards: {}, stats: { total: 10, mature: 4, young: 3 } },
  streakData: { days: 7, lastDate: '2026-09-06' },
  onExit: () => {},
};

/** Enough scored sessions for calcReadinessBand to return a band at all. */
const scoredSessions = (n, acc) =>
  Array.from({ length: n }, (_, i) => ({
    mode: 'kuis',
    correct: Math.round(10 * acc),
    total: 10,
    durationMs: 60000,
    date: `2026-09-0${(i % 9) + 1}T10:00:00.000Z`,
  }));

/**
 * Scope the assertion to the readiness card. The rest of the screen legitimately
 * shows percentages (cards memorised, per-category accuracy), so slicing the
 * whole textContent would fail on numbers this item never objected to.
 */
function readinessCardText(container) {
  const heading = [...container.querySelectorAll('div')].find(
    (el) => el.textContent.trim() === 'Kesiapan Ujian'
  );
  expect(heading, 'readiness card heading not found').toBeTruthy();
  return heading.parentElement.textContent;
}

describe('StatsMode — exam readiness (item 70)', () => {
  it('shows the band label, not a percentage', () => {
    const { container } = render(<StatsMode {...baseProps} sessions={scoredSessions(6, 0.9)} />);
    const card = readinessCardText(container);
    expect(card).toMatch(/Siap|Cukup siap|Kurang siap/);
    expect(card).not.toMatch(/\d+\s*%/);
  });

  it('uses the same wording as the Dashboard, so the two screens cannot drift', async () => {
    const { calcReadinessBand } = await import('../utils/session-analytics.js');
    const sessions = scoredSessions(6, 0.9);
    const band = calcReadinessBand({
      srs: baseProps.srs,
      sessions,
      streakData: baseProps.streakData,
    });
    expect(band).not.toBeNull();
    const { container } = render(<StatsMode {...baseProps} sessions={sessions} />);
    expect(readinessCardText(container)).toContain(band.label);
  });

  it('says so plainly below 5 scored sessions instead of drawing a number', () => {
    const { container } = render(<StatsMode {...baseProps} sessions={scoredSessions(3, 0.9)} />);
    const card = readinessCardText(container);
    expect(card).not.toMatch(/\d+\s*%/);
    expect(card).toMatch(/belum cukup|minimal 5 kuis/i);
  });

  it('does not count unscored modes towards the 5-session threshold', () => {
    const sessions = Array.from({ length: 8 }, () => ({
      mode: 'kartu',
      correct: 5,
      total: 5,
      durationMs: 1000,
      date: '2026-09-01T10:00:00.000Z',
    }));
    const card = readinessCardText(
      render(<StatsMode {...baseProps} sessions={sessions} />).container
    );
    expect(card).toMatch(/minimal 5 kuis/i);
  });
});
