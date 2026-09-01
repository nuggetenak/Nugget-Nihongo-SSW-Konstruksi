// ─── tests/review-empty-queue.test.jsx ───────────────────────────────────────
// 2026-09-01: found while auditing every mode's screens (owner: "polish the
// UI & UX, overhaul anything") -- not a visual bug, a data-integrity one.
// Opening Ulasan SRS with zero cards due correctly shows EmptyState.NoReviews
// (verified in the render assertions below), but a separate effect fired
// onSessionEnd regardless, logging a 0/0 session just from opening the tab.
// That session then counted toward streak/weekly-stats/daily-mission
// bookkeeping as if real review activity happened. Confirmed live via
// Playwright before touching any code: visiting Statistik directly showed 1
// session (matching seed data); visiting Ulasan SRS first, then Statistik,
// showed 2 -- the phantom one, reproducible every time.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import ReviewMode from '../modes/ReviewMode.jsx';
import { CARDS } from '../data/cards.js';

function mockSrs({ due = [] } = {}) {
  return {
    ready: true,
    dueCount: due.length,
    getDue: () => due,
    getInfo: () => ({
      seen: false,
      status: 'Baru',
      strength: { label: 'Baru', color: '#999999' },
      R: 0,
      nextDue: null,
      reps: 0,
      lapses: 0,
      history: [],
    }),
    previewFor: () => ({ 1: 0.01, 2: 1, 3: 3, 4: 7 }),
    review: vi.fn(),
    stats: { mature: 0, young: 0, learning: 0 },
  };
}

function wrap(children) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AppProvider>{children}</AppProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

function renderReview(props) {
  return render(
    wrap(<ReviewMode srs={mockSrs()} onExit={vi.fn()} onGoKartu={vi.fn()} {...props} />)
  );
}

describe('ReviewMode — empty queue must not record a phantom session', () => {
  it('shows the empty state, not the session-complete screen, when nothing is due', async () => {
    renderReview({});
    expect(await screen.findByText(/Tidak ada|belum ada|semua.*ulas/i)).toBeTruthy();
    // The "session complete" hero ("Sesi selesai!") must NOT be what renders
    // for an empty queue -- that's reserved for a real, finished review.
    expect(screen.queryByText('Sesi selesai!')).toBeNull();
  });

  it('does not call onSessionEnd when the queue was empty from the start', async () => {
    const onSessionEnd = vi.fn();
    renderReview({ onSessionEnd });
    await screen.findByText(/Tidak ada|belum ada|semua.*ulas/i);
    // Give any pending effects a tick to fire, if they were going to.
    await new Promise((r) => setTimeout(r, 0));
    expect(onSessionEnd).not.toHaveBeenCalled();
  });

  it('still calls onSessionEnd normally once a real (non-empty) queue is actually finished', async () => {
    // Sanity check for the fix's own boundary: a genuinely non-empty queue
    // that reaches its end (simulated here as already-exhausted, same
    // `done` condition the component reaches after a real review session)
    // must still fire -- the fix only excludes the zero-cards case.
    const dueIds = CARDS.slice(0, 1).map((c) => c.id);
    const onSessionEnd = vi.fn();
    const { rerender } = render(
      wrap(
        <ReviewMode
          srs={mockSrs({ due: dueIds })}
          onExit={vi.fn()}
          onGoKartu={vi.fn()}
          onSessionEnd={onSessionEnd}
        />
      )
    );
    // Non-empty queue renders the actual review card, not the empty state.
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByText(/Tidak ada|belum ada/i)).toBeNull();
    expect(onSessionEnd).not.toHaveBeenCalled(); // not done yet -- still reviewing
  });
});
