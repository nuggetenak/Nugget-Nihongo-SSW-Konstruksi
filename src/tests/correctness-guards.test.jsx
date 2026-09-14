// ─── tests/correctness-guards.test.jsx ───────────────────────────────────────
// Five defects from the 2026-09-10 external audits that were not about losing
// data, but about the app quietly computing the wrong thing. Each was confirmed
// against the code first; each is held here.
//
// The double-rating one is the reason this file exists. It corrupts the FSRS
// memory model — the thing every other number in the app is derived from — and it
// is triggered by being *eager*: tapping twice, or pressing two rating keys
// quickly. The users most likely to hit it are the ones using the app hardest.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../components/ConfirmDialog.jsx';
import { ToastProvider, useToast } from '../components/Toast.jsx';
import { generateQuiz } from '../utils/quiz-generator.js';

describe('ConfirmDialog: a superseded dialog settles its promise', () => {
  // A second confirm() while one was open overwrote the state slot and dropped the
  // first `resolve`. Nothing settled it, so the awaiting caller waited forever —
  // and the caller that matters is the exam exit guard, which awaits this before
  // letting you leave. A guard that never settles is a screen with no way out.
  function Harness({ onResult }) {
    const confirm = useConfirm();
    return (
      <button
        onClick={() => {
          confirm('pertama').then((v) => onResult(`first:${v}`));
          confirm('kedua').then((v) => onResult(`second:${v}`));
        }}
      >
        go
      </button>
    );
  }

  it('resolves the first caller false rather than leaving it pending', async () => {
    const results = [];
    render(
      <ConfirmProvider>
        <Harness onResult={(r) => results.push(r)} />
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText('go'));
    // The superseded one settles immediately; false, because "superseded" is not
    // "confirmed" and this dialog only ever guards destructive actions.
    await vi.waitFor(() => expect(results).toContain('first:false'));

    // The dialog on screen is the second one, and it still works.
    expect(screen.getByText('kedua')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ya'));
    await vi.waitFor(() => expect(results).toContain('second:true'));
  });

  it('both callers settle — neither is left hanging', async () => {
    const results = [];
    render(
      <ConfirmProvider>
        <Harness onResult={(r) => results.push(r)} />
      </ConfirmProvider>
    );
    fireEvent.click(screen.getByText('go'));
    fireEvent.click(screen.getByText('Batal'));
    await vi.waitFor(() => expect(results).toHaveLength(2));
  });
});

describe('Toast: the queue is not drained by an impure updater', () => {
  // `dismiss` used to `queueRef.current.shift()` inside the `setToasts` callback.
  // An updater must be pure — React may call it twice for one update — and the
  // second call would consume a second queued toast and return it in place of the
  // first, so a queued toast disappears without ever being shown. That silent
  // drop is the exact bug the queue was added (item 16) to fix.
  function Harness() {
    const { show, dismiss } = useToast();
    return (
      <>
        <button onClick={() => ['a', 'b', 'c', 'd'].forEach((m) => show(m, { duration: 999999 }))}>
          fill
        </button>
        <button onClick={() => dismiss(1)}>drop-1</button>
        <button onClick={() => dismiss(1)}>drop-1-again</button>
      </>
    );
  }

  it('promotes exactly one queued toast per dismissal', async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('fill'));
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.queryByText('c')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('drop-1'));
    expect(screen.queryByText('a')).not.toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
    // 'd' is still queued, not consumed alongside 'c'.
    expect(screen.queryByText('d')).not.toBeInTheDocument();
  });

  it('a dismissal that matches nothing does not eat a queued toast', async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('fill'));
    fireEvent.click(screen.getByText('drop-1'));
    // Same id again — 'a' is already gone, so there is no freed slot. The queue
    // must not lose 'd' to a dismissal that removed nothing.
    fireEvent.click(screen.getByText('drop-1-again'));
    expect(screen.getByText('c')).toBeInTheDocument();

    const remaining = screen.getByText('c');
    expect(remaining).toBeInTheDocument();
    // 'd' still reachable: dismiss the visible one and it should appear.
    fireEvent.click(screen.getAllByLabelText('Tutup notifikasi')[0]);
    await vi.waitFor(() => expect(screen.getByText('d')).toBeInTheDocument());
  });
});

describe('generateQuiz: no question shows the same option twice', () => {
  // All 1,626 shipped cards have distinct `id_text` and audit-integrity.mjs now
  // asserts that, so this is about the pool a *caller* hands in — the signature
  // takes `allCards`, so the generator cannot assume the corpus invariant holds.
  const card = (id, id_text, category = 'sekou') => ({
    id,
    id_text,
    category,
    jp: `語${id}`,
  });

  it('drops a distractor whose gloss matches the correct answer', () => {
    const target = card(1, 'Perancah');
    const pool = [target, card(2, 'perancah  '), card(3, 'Beton'), card(4, 'Semen')];
    const [q] = generateQuiz([target], pool, 'hard');
    const texts = q.options.map((o) => o.text.trim().toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
    expect(q.options.filter((o) => o.correct)).toHaveLength(1);
  });

  it('drops a distractor whose gloss matches another distractor', () => {
    const target = card(1, 'Perancah');
    const pool = [target, card(2, 'Beton'), card(3, 'beton'), card(4, 'Semen')];
    const [q] = generateQuiz([target], pool, 'hard');
    const texts = q.options.map((o) => o.text.trim().toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('still produces four options when the pool is clean', () => {
    const target = card(1, 'Perancah');
    const pool = [target, card(2, 'Beton'), card(3, 'Semen'), card(4, 'Bekisting')];
    const [q] = generateQuiz([target], pool, 'hard');
    expect(q.options).toHaveLength(4);
  });

  it('marks exactly one option correct in every difficulty', () => {
    const target = card(1, 'Perancah');
    const pool = [
      target,
      card(2, 'Beton', 'sekou'),
      card(3, 'Semen', 'anzen'),
      card(4, 'Bekisting', 'anzen'),
      card(5, 'Pasir', 'anzen'),
    ];
    for (const d of ['easy', 'medium', 'hard']) {
      const [q] = generateQuiz([target], pool, d);
      expect(
        q.options.filter((o) => o.correct),
        d
      ).toHaveLength(1);
    }
  });
});

describe('ReviewMode: one exposure records one FSRS review', () => {
  // The 600 ms window between rating a card and advancing to the next one left
  // `flipped` true and `currentId` unchanged, and `handleRate` guarded on those
  // two alone. So a double tap, "1" then "3", or a swipe landing just after a
  // button press each ran `srs.review()` again on the same card: two full FSRS
  // schedules for one exposure, `reps` incremented twice, two history entries.
  // Nothing surfaces it — the numbers just drift away from the learner's memory,
  // fastest for the users tapping hardest.
  let ReviewMode;
  beforeEach(async () => {
    ReviewMode = (await import('../modes/ReviewMode.jsx')).default;
  });

  // Shaped after the real `useSRS` return value and `getCardSRSInfo`, not guessed:
  // ReviewMode reads `info.strength.color` straight into a style, so a thinner
  // stub crashes the render rather than testing it.
  function stubSRS(calls) {
    return {
      ready: true,
      dueCount: 2,
      stats: null,
      hesitation: null,
      getDue: () => [1, 2],
      previewFor: () => ({ 1: '1h', 2: '1d', 3: '3d', 4: '7d' }),
      getInfo: () => ({
        seen: false,
        status: 'Baru',
        strength: { label: 'Baru', color: '#94a3b8' },
        R: 0,
        nextDue: null,
        reps: 0,
        lapses: 0,
        history: [],
      }),
      RATING_META: {
        1: {
          id: 'Lagi',
          emoji: '\u{1F534}',
          color: '#f87171',
          bg: 'rgba(0,0,0,0)',
          border: '#333',
        },
        2: {
          id: 'Susah',
          emoji: '\u{1F7E0}',
          color: '#fb923c',
          bg: 'rgba(0,0,0,0)',
          border: '#333',
        },
        3: { id: 'Oke', emoji: '\u{1F7E2}', color: '#4ade80', bg: 'rgba(0,0,0,0)', border: '#333' },
        4: {
          id: 'Mudah',
          emoji: '\u{1F535}',
          color: '#60a5fa',
          bg: 'rgba(0,0,0,0)',
          border: '#333',
        },
      },
      review: (id, rating) => {
        calls.push({ id, rating });
        return { isKnown: rating >= 3 };
      },
    };
  }

  // Inside a ToastProvider because ReviewMode now reports a failed review to the
  // learner instead of letting the exception escape the event handler (item 186),
  // and useToast throws without a provider. In the app that provider is mounted
  // in main.jsx above everything, so this makes the harness match production
  // rather than relaxing the component.
  function renderReview(calls) {
    return render(
      <ToastProvider>
        <ReviewMode
          srs={stubSRS(calls)}
          onExit={() => {}}
          onSessionEnd={() => {}}
          onGoKartu={() => {}}
        />
      </ToastProvider>
    );
  }

  it('a second rating inside the advance window is ignored', () => {
    const calls = [];
    renderReview(calls);

    // Flip, then rate twice in the same window, as a double tap would.
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: '3' });
    fireEvent.keyDown(window, { key: '1' });

    expect(calls).toHaveLength(1);
    expect(calls[0].rating).toBe(3);
  });

  it('four rapid rating keys still record one review', () => {
    const calls = [];
    renderReview(calls);
    fireEvent.keyDown(window, { key: ' ' });
    for (const k of ['1', '2', '3', '4']) fireEvent.keyDown(window, { key: k });
    expect(calls).toHaveLength(1);
  });

  it('the next card can be rated once the queue advances', async () => {
    const calls = [];
    renderReview(calls);
    fireEvent.keyDown(window, { key: ' ' });
    await act(async () => {
      fireEvent.keyDown(window, { key: '3' });
      await new Promise((r) => setTimeout(r, 700));
    });
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: '2' });
    expect(calls).toHaveLength(2);
    expect(calls[1].id).toBe(2);
  });

  it('skipping a card that is already rated does not advance twice', async () => {
    const calls = [];
    renderReview(calls);
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: '3' });
    // `s` for skip, inside the window: the card is already on its way, and
    // skipping now would step over card 2 without ever showing it.
    fireEvent.keyDown(window, { key: 's' });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: '2' });
    expect(calls.map((c) => c.id)).toEqual([1, 2]);
  });
});

describe('QuizShell: an expired timer does not inflate the score', () => {
  // `results` only ever held answered questions and `total` was `results.length`,
  // so answering one of four in time and letting three lapse scored 1/1 = 100%.
  // SimulasiMode — the mode that models the real exam — counts a blank as wrong,
  // because that is what the exam does. One app should not hold two definitions of
  // a score, and if it must pick one it should not be the lenient one in the modes
  // people use to decide whether they are ready to sit the real thing.
  //
  // Real timers, one second of them: the countdown is a chain of setTimeouts that
  // each re-run the effect, and driving that with fake timers needs the flush
  // interleaved by hand for no extra coverage.
  const questions = [1, 2, 3, 4].map((n) => ({
    question: `soal ${n}`,
    options: [{ text: `benar ${n}` }, { text: `salah ${n}` }],
    correctIdx: 0,
    explanation: '',
    _cardId: null,
  }));

  it('counts every unanswered question as wrong, over the full total', async () => {
    const QuizShell = (await import('../components/QuizShell.jsx')).default;
    const onFinish = vi.fn();
    render(
      <QuizShell
        questions={questions}
        timer={1}
        onFinish={onFinish}
        onExit={() => {}}
        title="t"
        autoNextDelay={0}
      />
    );

    fireEvent.click(screen.getByText('benar 1'));

    await vi.waitFor(() => expect(onFinish).toHaveBeenCalled(), { timeout: 4000 });
    const { correct, total } = onFinish.mock.calls.at(-1)[0];
    expect(total).toBe(4); // not 1
    expect(correct).toBe(1);
  });

  it('labels the lapsed questions rather than showing them as wrong answers', async () => {
    const QuizShell = (await import('../components/QuizShell.jsx')).default;
    render(
      <QuizShell
        questions={questions}
        timer={1}
        onFinish={() => {}}
        onExit={() => {}}
        title="t"
        autoNextDelay={0}
      />
    );
    fireEvent.click(screen.getByText('benar 1'));
    // One answered, three lapsed — so three labelled rows, not four, and not a
    // red cross against an em dash that reads like a wrong answer.
    await vi.waitFor(() => expect(screen.getAllByText(/Tidak dijawab/).length).toBe(3), {
      timeout: 4000,
    });
  });
});
