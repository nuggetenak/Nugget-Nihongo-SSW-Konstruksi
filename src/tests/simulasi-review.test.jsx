// ─── tests/simulasi-review.test.jsx ──────────────────────────────────────────
// Items 100 and 101, which only make sense together.
//
// 101: a real exam — Prometric's delivery included — lets you mark a question
// and move on rather than stalling on it. The navigator already distinguished
// answered from unanswered, so a parallel `flagged` set was the whole feature.
//
// 100: the review list showed wrong answers only, truncated their explanation
// at 160 characters with nothing behind the ellipsis, and carried no question
// number — so a row could not be matched back to the navigator, and a lucky
// guess was indistinguishable from knowledge. On a 100-minute paper that list
// is the entire payload of the session.
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
import { buildSimulasiResults } from '../utils/simulasi-scoring.js';

function renderSim(props = {}) {
  const all = { onExit: vi.fn(), onSessionEnd: vi.fn(), onRetryWrong: vi.fn(), ...props };
  const view = render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(ProgressProvider, null, createElement(SimulasiMode, all))
        )
      )
    )
  );
  return { ...all, view };
}

const start = async () => {
  await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
};
const optionButtons = () => [
  ...screen.getByRole('group', { name: 'Pilihan jawaban' }).querySelectorAll('button'),
];
// The navigator cell for question 1 also mentions "soal 1" and, once flagged,
// "ditinjau ulang" — so match the flag toggle on how its own label starts.
const flagButton = () => screen.getByRole('button', { name: /^(Tandai|Hapus tanda) /i });
const snapshot = () => JSON.parse(sessionStorage.getItem('ssw-simulasi-progress')).snapshot;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
});

describe('SimulasiMode — flagging a question (item 101)', () => {
  it('toggles on, and the button says which state it is in', async () => {
    renderSim();
    await start();
    expect(screen.getByText('Tandai')).toBeTruthy();

    await act(async () => fireEvent.click(flagButton()));
    expect(screen.getByText('Ditandai')).toBeTruthy();
    expect(screen.getByText(/1 ditandai/)).toBeTruthy();

    await act(async () => fireEvent.click(flagButton()));
    expect(screen.getByText('Tandai')).toBeTruthy();
    expect(screen.queryByText(/1 ditandai/)).toBeNull();
  });

  it('is orthogonal to answering — a question can be both answered and flagged', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(optionButtons()[0]));
    await act(async () => fireEvent.click(flagButton()));

    expect(
      screen.getByLabelText(/^Soal 1, sudah dijawab, ditandai untuk ditinjau ulang/)
    ).toBeTruthy();
  });

  it('survives a reload, like the answer sheet it sits beside', async () => {
    const first = renderSim();
    await start();
    await act(async () => fireEvent.click(flagButton()));
    // A Set serialises to {}, so it is stored as an array on purpose.
    expect(snapshot().flagged).toEqual([0]);
    first.view.unmount();

    renderSim();
    await act(async () => fireEvent.click(screen.getByText('▶ Lanjutkan')));
    expect(screen.getByText('Ditandai')).toBeTruthy();
  });

  it('a fresh exam starts with nothing flagged', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(flagButton()));
    // 🔄 Ulang goes through the same startExam path as the first draw.
    expect(snapshot().flagged).toEqual([0]);
    await act(async () => fireEvent.click(screen.getByLabelText(/^Soal 2/)));
    expect(screen.getByText('Tandai')).toBeTruthy(); // question 2 is not flagged
  });
});

describe('buildSimulasiResults — what the review list is given (items 100, 101)', () => {
  const questions = [
    { jp: 'A', opts: [{ text: 'a' }, { text: 'b' }], correctIdx: 0, explanation: 'x' },
    { jp: 'B', opts: [{ text: 'a' }, { text: 'b' }], correctIdx: 1, explanation: 'y' },
    { jp: 'C', opts: [{ text: 'a' }, { text: 'b' }], correctIdx: 0, explanation: 'z' },
  ];

  it('numbers every row from 1, in question order', () => {
    const rs = buildSimulasiResults(questions, {});
    expect(rs.map((r) => r.number)).toEqual([1, 2, 3]);
  });

  it('marks the flagged rows, from a Set or an array', () => {
    expect(buildSimulasiResults(questions, {}, new Set([0, 2])).map((r) => r.wasFlagged)).toEqual([
      true,
      false,
      true,
    ]);
    expect(buildSimulasiResults(questions, {}, [1]).map((r) => r.wasFlagged)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('flags nothing when the argument is omitted, rather than throwing', () => {
    expect(buildSimulasiResults(questions, {}).every((r) => r.wasFlagged === false)).toBe(true);
  });

  it('still counts a blank as wrong', () => {
    const rs = buildSimulasiResults(questions, { 0: { selectedIdx: 0, isCorrect: true } });
    expect(rs.map((r) => r.isCorrect)).toEqual([true, false, false]);
  });
});

describe('SimulasiMode — the review list (item 100)', () => {
  /** Answer every question, then submit. Returns how many were answered right. */
  const runWholeExam = async () => {
    await start();
    let total = 0;
    for (;;) {
      total += 1;
      await act(async () => fireEvent.click(optionButtons()[0]));
      const next = screen.queryByText('Selanjutnya →');
      if (!next) break;
      await act(async () => fireEvent.click(next));
    }
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    return total;
  };

  it('offers correct answers for review, not only wrong ones', async () => {
    renderSim();
    await runWholeExam();

    // Every question was answered with option A, so both buckets are non-empty
    // on any real draw — and the counts must sum to the whole paper.
    const salah = screen.getByRole('button', { name: /✗ Salah \(\d+\)/ });
    const benar = screen.getByRole('button', { name: /✓ Benar \(\d+\)/ });
    const n = (btn) => Number(btn.textContent.match(/\((\d+)\)/)[1]);
    expect(n(salah) + n(benar)).toBe(15);
  });

  it('labels each reviewed row with its question number', async () => {
    renderSim();
    await runWholeExam();
    // Whichever bucket is showing, every row in it is identified.
    const rows = [...document.querySelectorAll('[class*="reviewItem"]')];
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => expect(row.textContent).toMatch(/Soal \d+/));
  });

  it('a flagged question can be found again after the exam', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(flagButton()));
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    // Two warnings (unanswered + flagged) arrive as one dialog.
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan sekarang')));

    const tandai = screen.getByRole('button', { name: /🚩 Ditandai \(1\)/ });
    await act(async () => fireEvent.click(tandai));
    const rows = [...document.querySelectorAll('[class*="reviewItem"]')];
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toMatch(/Soal 1/);
  });
});
