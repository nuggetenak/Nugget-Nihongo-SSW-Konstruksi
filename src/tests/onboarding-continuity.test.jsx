// ─── tests/onboarding-continuity.test.jsx ─────────────────────────────────────
// item 24: two gaps. (1) onboarding never asked for an exam date, so the
// dashboard's countdown -- "the single strongest motivational device in the
// app" per the plan -- was off by default for every new user. (2) a track
// reset (onboarded stays true, only track goes null) replayed the *entire*
// onboarding sequence, including Welcome and the flashcard Demo, for what's
// really a one-field settings confirmation now that track has no picker step.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test, init, get } from '../storage/engine.js';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import Onboarding from '../components/Onboarding.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('Onboarding — startStep re-entry (item 24)', () => {
  it('defaults to the welcome step when no startStep is given', () => {
    render(createElement(Onboarding, { onComplete: () => {} }));
    expect(screen.getByText('Selamat Datang!')).toBeInTheDocument();
  });

  it('startStep="goal" skips Welcome, Demo, and the exam-date step entirely', () => {
    render(createElement(Onboarding, { onComplete: () => {}, startStep: 'goal' }));
    expect(screen.queryByText('Selamat Datang!')).toBeNull();
    expect(screen.queryByText('Coba Balik Kartu Ini')).toBeNull();
    expect(screen.queryByText('Kapan Ujianmu?')).toBeNull();
    expect(screen.getByText('Target Harian')).toBeInTheDocument();
  });

  it('a startStep="goal" re-entry still sends track: "lifeline" on completion', () => {
    let payload;
    render(createElement(Onboarding, { onComplete: (p) => (payload = p), startStep: 'goal' }));
    fireEvent.click(screen.getByText('30 kartu'));
    fireEvent.click(screen.getByText('Mulai Belajar 🚀'));
    expect(payload.track).toBe('lifeline');
    expect(payload.dailyGoal).toBe(30);
  });
});

describe('Onboarding — exam-date step (item 24)', () => {
  it('skipping the exam-date step (no date entered) still proceeds to Goal', () => {
    render(createElement(Onboarding, { onComplete: () => {}, startStep: 'examdate' }));
    expect(screen.getByText('Kapan Ujianmu?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lewati →'));
    expect(screen.getByText('Target Harian')).toBeInTheDocument();
  });

  it('setting a date changes the button label and carries the date through to onComplete', () => {
    let payload;
    render(
      createElement(Onboarding, { onComplete: (p) => (payload = p), startStep: 'examdate' })
    );
    fireEvent.change(screen.getByLabelText('Tanggal ujian'), {
      target: { value: '2026-12-01' },
    });
    expect(screen.getByText('Lanjut →')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lanjut →'));
    fireEvent.click(screen.getByText('20 kartu'));
    fireEvent.click(screen.getByText('Mulai Belajar 🚀'));
    expect(payload.examDate).toBe('2026-12-01');
  });

  it('skipping sends examDate: null through to onComplete, not undefined', () => {
    let payload;
    render(
      createElement(Onboarding, { onComplete: (p) => (payload = p), startStep: 'examdate' })
    );
    fireEvent.click(screen.getByText('Lewati →'));
    fireEvent.click(screen.getByText('20 kartu'));
    fireEvent.click(screen.getByText('Mulai Belajar 🚀'));
    expect(payload.examDate).toBeNull();
  });
});

describe('completeOnboarding — examDate undefined-vs-null (item 24)', () => {
  function Harness({ onCtx }) {
    const app = useApp();
    onCtx(app);
    return null;
  }
  function renderApp() {
    let ctx;
    render(
      createElement(
        ToastProvider,
        null,
        createElement(AppProvider, null, createElement(Harness, { onCtx: (c) => (ctx = c) }))
      )
    );
    return () => ctx;
  }

  it('an already-stored examDate survives a re-entry payload that never mentions it (undefined)', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().completeOnboarding({ track: 'lifeline', dailyGoal: 20, examDate: '2026-11-15' });
    });
    expect(get('prefs').examDate).toBe('2026-11-15');

    // Simulates the startStep='goal' re-entry: examDate is never set by that
    // run, so Onboarding's own state stays undefined and completeOnboarding
    // must leave storage alone -- this is the bug the undefined/null
    // distinction exists to prevent.
    act(() => {
      getCtx().completeOnboarding({ track: 'lifeline', dailyGoal: 30, examDate: undefined });
    });
    expect(get('prefs').examDate).toBe('2026-11-15'); // untouched
    expect(get('prefs').dailyGoal).toBe(30); // this field did update
  });

  it('an explicit null (the step was reached and skipped) does overwrite a stale prior value', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().completeOnboarding({ track: 'lifeline', dailyGoal: 20, examDate: '2026-11-15' });
    });
    act(() => {
      getCtx().completeOnboarding({ track: 'lifeline', dailyGoal: 20, examDate: null });
    });
    expect(get('prefs').examDate).toBeNull();
  });
});
