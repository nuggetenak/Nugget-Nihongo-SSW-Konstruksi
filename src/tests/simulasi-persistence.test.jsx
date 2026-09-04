// ─── tests/simulasi-persistence.test.jsx ─────────────────────────────────────
// Item 78: "Simulasi loses the entire exam on reload." SimulasiMode touched no
// storage at all — no storageGet/storageSet, no sessionStorage — while running
// a timed 40–60 question exam on a device class whose OS reclaims backgrounded
// tabs. It had gone as far as registering an exit guard, so the app already
// knew losing this session was expensive; the guard just could not see a
// reload.
//
// Also covered here: the results screen's "Latih N Salah", which passed
// `wrongList.map((_, i) => i)` — positions in the wrong-answer list — to a
// prop that navigates to flashcards by card id.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import { CARDS } from '../data/cards.js';
import SimulasiMode from '../modes/SimulasiMode.jsx';

function renderSim(props = {}) {
  const all = { onExit: vi.fn(), onSessionEnd: vi.fn(), onRetryWrong: vi.fn(), ...props };
  const view = render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(AppProvider, null, createElement(SimulasiMode, all))
      )
    )
  );
  return { ...all, view };
}

const start = async () => {
  await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
};
const optionButtons = () => [...document.querySelectorAll('button[aria-pressed]')];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
});

describe('SimulasiMode — a running exam survives a reload', () => {
  it('writes a snapshot of the drawn questions and the answer sheet', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(optionButtons()[0]));

    const questions = JSON.parse(sessionStorage.getItem('ssw-simulasi-questions')).snapshot;
    const progress = JSON.parse(sessionStorage.getItem('ssw-simulasi-progress')).snapshot;
    expect(questions.length).toBe(15); // the default "Latihan Cepat" preset
    expect(Object.keys(progress.answers)).toEqual(['0']);
    // Absolute, so a reload three minutes later comes back with three fewer
    // minutes rather than a refilled clock.
    expect(progress.deadlineAt).toBeGreaterThan(Date.now());
  });

  it('offers the saved exam back on a fresh mount, and resumes it in place', async () => {
    const first = renderSim();
    await start();
    await act(async () => fireEvent.click(optionButtons()[1]));
    await act(async () => fireEvent.click(screen.getByLabelText('Soal 2, belum dijawab')));
    const questionOnScreen = document.querySelector('[class*="questionJp"]')?.textContent;
    first.view.unmount();

    renderSim(); // a reload: same sessionStorage, brand new component
    expect(screen.getByText('Lanjutkan simulasi sebelumnya?')).toBeTruthy();
    expect(screen.getByText(/1\/15 soal terjawab/)).toBeTruthy();

    await act(async () => fireEvent.click(screen.getByText('▶ Lanjutkan')));
    expect(screen.getByText('Soal 2 / 15')).toBeTruthy();
    expect(document.querySelector('[class*="questionJp"]')?.textContent).toBe(questionOnScreen);
  });

  it('does not offer an exam the user deliberately walked away from', async () => {
    const first = renderSim();
    await start();
    await act(async () => fireEvent.click(optionButtons()[0]));
    await act(async () => fireEvent.click(screen.getByText('✕ Keluar')));
    await act(async () => fireEvent.click(await screen.findByText('Keluar, hapus progres')));
    first.view.unmount();

    renderSim();
    expect(screen.queryByText('Lanjutkan simulasi sebelumnya?')).toBeNull();
  });

  it('clears the snapshot once the exam has been submitted', async () => {
    renderSim();
    await start();
    await act(async () => fireEvent.click(optionButtons()[0]));
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    await act(async () => fireEvent.click(await screen.findByText('Kumpulkan sekarang')));

    expect(sessionStorage.getItem('ssw-simulasi-progress')).toBeNull();
    expect(sessionStorage.getItem('ssw-simulasi-questions')).toBeNull();
  });
});

describe('SimulasiMode — "Latih N Salah" sends real card ids', () => {
  it('passes card ids that exist, never wrong-answer list positions', async () => {
    const onRetryWrong = vi.fn();
    renderSim({ onRetryWrong });

    // JAC Official is the source whose questions carry related_card_id.
    await act(async () => fireEvent.click(screen.getByText('JAC Official')));
    await start();
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    await act(async () => fireEvent.click(await screen.findByText('Kumpulkan sekarang')));

    const retry = screen.queryByText(/Latih \d+ Kartu/);
    expect(retry, 'a fully unanswered JAC exam is all wrong, so this must render').toBeTruthy();
    await act(async () => fireEvent.click(retry));

    const ids = onRetryWrong.mock.calls[0][0];
    expect(ids.length).toBeGreaterThan(0);
    const known = new Set(CARDS.map((c) => c.id));
    for (const id of ids) expect(known.has(id), `card ${id} does not exist`).toBe(true);
    expect(new Set(ids).size).toBe(ids.length); // deduplicated
  });

  it('hides the button for a pool exam, whose questions have no linked cards', async () => {
    renderSim();
    await start(); // Teori & Praktik is the default source
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    await act(async () => fireEvent.click(await screen.findByText('Kumpulkan sekarang')));

    expect(screen.getByText('BELUM LULUS')).toBeTruthy();
    expect(screen.queryByText(/Latih \d+ Kartu/)).toBeNull();
  });
});

describe('SimulasiMode — a resumed exam is scored on the answers it restored', () => {
  it('a correct answer given before the reload still counts after it', async () => {
    const first = renderSim();
    await start();

    // Answer question 1 correctly. The correct index isn't visible during the
    // exam (deferred feedback is the point), so read it off the saved snapshot.
    const drawn = JSON.parse(sessionStorage.getItem('ssw-simulasi-questions')).snapshot;
    await act(async () => fireEvent.click(optionButtons()[drawn[0].correctIdx]));
    first.view.unmount();

    renderSim();
    await act(async () => fireEvent.click(screen.getByText('▶ Lanjutkan')));
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    await act(async () => fireEvent.click(await screen.findByText('Kumpulkan sekarang')));

    expect(screen.getByText(/^1 \/ 15 benar/)).toBeTruthy();
  });

  it('breaks the score down by teori and praktik, matching the preset ratio', async () => {
    renderSim();
    await start(); // Latihan Cepat: 9 teori + 6 praktik
    await act(async () => fireEvent.click(screen.getByText('Kumpulkan Ujian')));
    await act(async () => fireEvent.click(await screen.findByText('Kumpulkan sekarang')));

    const rows = [...document.querySelectorAll('[class*="breakdownRow"]')].map(
      (r) => r.textContent
    );
    expect(rows.find((r) => r.includes('Teori'))).toContain('(0/9)');
    expect(rows.find((r) => r.includes('Praktik'))).toContain('(0/6)');
  });
});
