// ─── tests/response-timing.test.jsx ──────────────────────────────────────────
// Item 58 end to end: the field is recorded on the review, and reaches the
// learner as a list they read — with nothing in between touching the scheduler.
//
// The negative assertion is the point of the item, not a detail. Its decision
// record (docs/UI_UX_PLAN.md 58) rejects the tempting shortcut of nudging the
// FSRS rating based on how long someone took, on the grounds that there is no
// principled formula for the adjustment and it would break the algorithm's own
// assumption that a rating reflects self-assessed recall. So: same rating in,
// same schedule out, whether the answer took one second or twenty.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';
import { _reset_for_test } from '../storage/engine.js';
import { initStore, getCard } from '../srs/fsrs-store.js';
import { recordReview } from '../srs/fsrs-scheduler.js';
import { hesitantCards, HESITATION_MIN_SAMPLES } from '../utils/hesitation.js';
import { CARDS } from '../data/cards.js';
import { stripFuri } from '../utils/jp-helpers.js';
import StatsMode from '../modes/StatsMode.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  initStore();
});

describe('recordReview — responseMs', () => {
  it('rides on the history entry when it was measured', () => {
    recordReview(1, 3, new Date('2026-09-07T10:00:00Z'), { responseMs: 4200 });
    const h = getCard(1).history.at(-1);
    expect(h.rating).toBe(3);
    expect(h.responseMs).toBe(4200);
  });

  it('is absent, not null, when nothing measured it', () => {
    // "Absent" is the honest value for a review taken before this shipped, and
    // it is what timedReviews() keys off — a null would have to be special-cased
    // at every read instead.
    recordReview(1, 3, new Date('2026-09-07T10:00:00Z'));
    expect(getCard(1).history.at(-1)).not.toHaveProperty('responseMs');
  });

  it('refuses a nonsensical value rather than storing it', () => {
    recordReview(1, 3, new Date('2026-09-07T10:00:00Z'), { responseMs: -5 });
    expect(getCard(1).history.at(-1)).not.toHaveProperty('responseMs');
  });

  it('does not change the schedule the rating produces', () => {
    const now = new Date('2026-09-07T10:00:00Z');
    const quick = recordReview(101, 3, now, { responseMs: 800 });
    _reset_for_test();
    initStore();
    const slow = recordReview(101, 3, now, { responseMs: 45000 });
    expect(slow.interval).toBe(quick.interval);
    expect(slow.entry.card.due).toEqual(quick.entry.card.due);
    expect(slow.isKnown).toBe(quick.isKnown);
  });
});

describe('StatsMode — Sempat Ragu', () => {
  const baseProps = {
    known: new Set([1]),
    unknown: new Set(),
    quizWrong: {},
    streakData: { days: 3, lastDate: '2026-09-06' },
    sessions: [],
  };

  /** A store where `slowId` was answered correctly but four times too slowly. */
  function storeWithHesitation(slowId) {
    const cards = {};
    for (let i = 0; i < HESITATION_MIN_SAMPLES; i++) {
      cards[9000 + i] = { card: {}, history: [{ rating: 3, responseMs: 2000 }] };
    }
    cards[slowId] = { card: {}, history: [{ rating: 3, responseMs: 8000 }] };
    return cards;
  }

  it('names the cards and shows how far past the learner’s own pace each was', () => {
    const slow = CARDS[0];
    const hesitation = hesitantCards(storeWithHesitation(slow.id));
    render(<StatsMode {...baseProps} srs={{ cards: {}, stats: {}, hesitation }} />);

    expect(screen.getByText('Sempat Ragu')).toBeTruthy();
    expect(screen.getByText(stripFuri(slow.jp).slice(0, 20))).toBeTruthy();
    expect(screen.getByText('4.0× lebih lama')).toBeTruthy();
    // The baseline is stated, so the ratio is a claim the learner can check
    // rather than a verdict.
    expect(screen.getByText(/2,0 detik/)).toBeTruthy();
  });

  it('is absent entirely when there is not enough timing data to say anything', () => {
    const hesitation = hesitantCards({
      1: { card: {}, history: [{ rating: 3, responseMs: 9000 }] },
    });
    render(<StatsMode {...baseProps} srs={{ cards: {}, stats: {}, hesitation }} />);
    expect(screen.queryByText('Sempat Ragu')).toBeNull();
  });

  it('renders without the field at all, for a build that has never timed anything', () => {
    render(<StatsMode {...baseProps} srs={{ cards: {}, stats: {} }} />);
    expect(screen.queryByText('Sempat Ragu')).toBeNull();
  });
});

describe('FlashcardMode — the clock the learner actually experiences', () => {
  const cards = [{ id: 1, jp: '配管《はいかん》', id_text: 'perpipaan', category: 'haikan' }];

  function setup(srs) {
    return render(
      <ToastProvider>
        <ConfirmProvider>
          <AppProvider>
            <FlashcardMode
              cards={cards}
              known={new Set()}
              unknown={new Set()}
              onMark={() => {}}
              onResetProgress={() => {}}
              onExit={() => {}}
              starred={new Set()}
              onToggleStar={() => {}}
              srs={srs}
            />
          </AppProvider>
        </ConfirmProvider>
      </ToastProvider>
    );
  }

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('ssw-fc-sort', 'original');
  });

  it('times from the flip, not from arrival, and hands the number to review()', () => {
    // Timing from arrival would measure how long the front was studied, which
    // is a different thing and mostly measures reading speed. The clock the
    // item is about starts when the answer is visible to judge yourself
    // against.
    const review = vi.fn(() => ({ isKnown: true }));
    const srs = { ready: true, review, getInfo: () => null, previewFor: () => null };
    setup(srs);
    // A moving clock rather than mockReturnValueOnce: React and the mode's own
    // effects call Date.now too, so a queue of one-shot values gets eaten by
    // whoever asks first and the assertion silently measures nothing.
    let now = 10_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    now = 13_500;
    fireEvent.click(screen.getByRole('button', { name: /^Nilai Oke/ }));
    vi.restoreAllMocks();

    expect(review).toHaveBeenCalledTimes(1);
    const [, rating, opts] = review.mock.calls[0];
    expect(rating).toBe(3);
    expect(opts.responseMs).toBe(3500);
  });

  it('starts a new clock on the next card instead of carrying the last one over', () => {
    // The failure this guards against is not hypothetical shape-checking: a ref
    // that is only ever set and never cleared makes every card after the first
    // report the time since the *first* flip, so the numbers grow all session
    // and every card past a few looks like hesitation.
    const review = vi.fn(() => ({ isKnown: true }));
    const srs = { ready: true, review, getInfo: () => null, previewFor: () => null };
    render(
      <ToastProvider>
        <ConfirmProvider>
          <AppProvider>
            <FlashcardMode
              cards={[
                { id: 1, jp: '配管《はいかん》', id_text: 'perpipaan', category: 'haikan' },
                { id: 2, jp: '電気', id_text: 'listrik', category: 'denki' },
              ]}
              known={new Set()}
              unknown={new Set()}
              onMark={() => {}}
              onResetProgress={() => {}}
              onExit={() => {}}
              starred={new Set()}
              onToggleStar={() => {}}
              srs={srs}
            />
          </AppProvider>
        </ConfirmProvider>
      </ToastProvider>
    );

    let now = 10_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    now = 14_000;
    fireEvent.click(screen.getByRole('button', { name: /^Nilai Oke/ }));
    fireEvent.click(screen.getByLabelText('Kartu berikutnya'));
    // Two seconds pass on the next card's front before it is flipped.
    now = 16_000;
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    now = 17_000;
    fireEvent.click(screen.getByRole('button', { name: /^Nilai Oke/ }));
    vi.restoreAllMocks();

    expect(review.mock.calls.map((c) => c[2].responseMs)).toEqual([4000, 1000]);
  });
});
