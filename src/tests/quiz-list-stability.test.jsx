// ─── tests/quiz-list-stability.test.jsx ──────────────────────────────────────
// Found while wiring item 78's persistence into the exam modes, and reproduced
// before it was fixed: in WaygroundMode and JACMode the live question list was
// a useMemo whose dependency array included the wrong-answer tally those same
// modes write to on every wrong answer. Answering wrongly therefore recomputed
// the memo, re-ran shuffle(), and replaced the question on screen with a
// different one — while QuizShell was still showing the ✓/✗ badges and the
// explanation belonging to the question just answered.
//
// The probe that caught it, verbatim: "5S活動の最初の「整理」とは何をするか？"
// became "KY活動の4ステップで最初に行うことは？" on the answer click.
//
// Determinism: Math.random is pinned so the component's shuffle() and this
// file's own shuffle() draw the same order, which is what lets the test know
// which option is wrong without guessing at one.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { JAC_OFFICIAL } from '../data/index.js';
import { shuffle } from '../utils/shuffle.js';
import WaygroundMode from '../modes/WaygroundMode.jsx';
import JACMode from '../modes/JACMode.jsx';

function wrap(el) {
  return createElement(
    ToastProvider,
    null,
    createElement(
      ConfirmProvider,
      null,
      createElement(AppProvider, null, createElement(ProgressProvider, null, el))
    )
  );
}

const questionText = () => document.querySelector('[class*="questionText"]')?.textContent;
const optionButtons = () => [...document.querySelectorAll('[class*="options"] button')];
const backLabel = () => document.querySelector('[class*="btnBack"]')?.textContent ?? '';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});
afterEach(() => vi.restoreAllMocks());

describe('answering does not re-draw the question list underneath the user', () => {
  it('WaygroundMode keeps the same question on screen after a wrong answer', async () => {
    render(wrap(createElement(WaygroundMode, { onSessionEnd: vi.fn() })));

    // The "DISARANKAN BERIKUTNYA" button opens a deterministic set (the first
    // one with no saved score, and nothing is scored on a fresh profile).
    const suggested = [...document.querySelectorAll('button')].find((b) =>
      /DISARANKAN BERIKUTNYA/.test(b.textContent || '')
    );
    await act(async () => fireEvent.click(suggested));

    const set = QUIZ_SETS.find((s) => backLabel().includes(s.title));
    expect(set, 'could not identify which set opened').toBeTruthy();
    const first = shuffle(set.questions)[0];
    const wrongIdx = first.ans === 0 ? 1 : 0;

    const before = questionText();
    expect(before, 'no question rendered — the assertion below would be vacuous').toBeTruthy();
    await act(async () => fireEvent.click(optionButtons()[wrongIdx]));

    expect(optionButtons()[wrongIdx].dataset.state).toBe('wrong'); // really a wrong answer
    expect(questionText()).toBe(before);
  });

  it('JACMode keeps the same question on screen after a wrong answer', async () => {
    render(wrap(createElement(JACMode, { onSessionEnd: vi.fn() })));

    const setBtn = [...document.querySelectorAll('button')].find((b) =>
      /学科 Set 1/.test(b.textContent || '')
    );
    await act(async () => fireEvent.click(setBtn));

    const first = shuffle(JAC_OFFICIAL.filter((q) => q.set === 'tt1'))[0];
    const wrongIdx = first.ans === 0 ? 1 : 0;

    const before = questionText();
    expect(before, 'no question rendered — the assertion below would be vacuous').toBeTruthy();
    await act(async () => fireEvent.click(optionButtons()[wrongIdx]));

    expect(optionButtons()[wrongIdx].dataset.state).toBe('wrong');
    expect(questionText()).toBe(before);
  });
});

describe('item 78: the modes that had QuizShell persistence switched off', () => {
  it('WaygroundMode offers an interrupted set back and resumes it in place', async () => {
    const first = render(wrap(createElement(WaygroundMode, { onSessionEnd: vi.fn() })));
    const suggested = [...document.querySelectorAll('button')].find((b) =>
      /DISARANKAN BERIKUTNYA/.test(b.textContent || '')
    );
    await act(async () => fireEvent.click(suggested));
    await act(async () => fireEvent.click(optionButtons()[0]));
    const onScreen = questionText();
    first.unmount();

    render(wrap(createElement(WaygroundMode, { onSessionEnd: vi.fn() })));
    const resume = [...document.querySelectorAll('button')].find((b) =>
      /^Lanjutkan$/.test(b.textContent || '')
    );
    expect(resume, 'no resume offer after an interrupted set').toBeTruthy();
    await act(async () => fireEvent.click(resume));
    // Restored against the saved list, not a fresh shuffle of the same set.
    expect(questionText()).toBe(onScreen);
  });

  it('JACMode does the same', async () => {
    const first = render(wrap(createElement(JACMode, { onSessionEnd: vi.fn() })));
    const setBtn = [...document.querySelectorAll('button')].find((b) =>
      /学科 Set 1/.test(b.textContent || '')
    );
    await act(async () => fireEvent.click(setBtn));
    await act(async () => fireEvent.click(optionButtons()[0]));
    const onScreen = questionText();
    first.unmount();

    render(wrap(createElement(JACMode, { onSessionEnd: vi.fn() })));
    const resume = [...document.querySelectorAll('button')].find((b) =>
      /^Lanjutkan$/.test(b.textContent || '')
    );
    expect(resume).toBeTruthy();
    await act(async () => fireEvent.click(resume));
    expect(questionText()).toBe(onScreen);
  });
});
