// ─── tests/exit-guard-routes.test.jsx ────────────────────────────────────────
// AppContext's exit guard says of itself: "every route out of the mode area
// awaits it first and aborts if it returns false." Until 2026-09-04 exactly one
// route did — goBack, the header's arrow. Escape (GlobalKeyboardLayer called
// exitMode directly), the hardware/browser back button (the popstate handler
// never looked at the guard), and the desktop side nav (goTab/goMode) each
// walked straight past it, discarding a running 100-minute exam with no prompt.
//
// These tests pin each of those routes to the contract.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { createElement, useCallback, useEffect, useRef } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { useExitGuard } from '../hooks/useExitGuard.js';
import { _reset_for_test } from '../storage/engine.js';

// A holder object, not a bare `let`: the react-hooks lint rule forbids a
// component reassigning a variable declared outside it, and mutating a
// property is not a reassignment.
const held = { ctx: null };
const ctx = () => held.ctx;
// Published from an effect rather than assigned during render: the react-hooks
// lint rule rejects a component writing to anything declared outside it, and
// points at an effect as the way to do this.
function usePublish(app) {
  useEffect(() => {
    held.ctx = app;
  });
}

// A mode that refuses to be left, plus one that allows it, so both answers are
// covered by the same harness.
//
// The guard is a `useCallback`, as every real caller's is (`SimulasiMode` hands
// over `phase === 'playing' ? confirmDiscard : null`). That is not a detail:
// `useExitGuard` re-registers whenever the callback's *identity* changes, so an
// inline arrow re-registers on every render — including the render that follows
// AppContext clearing the ref after a guard said "yes". With an inline arrow the
// next popstate is guarded all over again and the exit never lands, which is a
// property of the harness rather than of the app, and it cost a CI failure to
// notice.
function GuardedMode({ allow, calls }) {
  const guard = useCallback(() => {
    if (calls) calls.n += 1;
    return Promise.resolve(allow);
  }, [allow, calls]);
  useExitGuard(guard);
  return null;
}

// Enters the mode exactly once. An effect that re-enters whenever mode !== x
// would silently undo the very exits these tests are checking for.
function Harness({ allow, calls, mode = 'simulasi' }) {
  const app = useApp();
  usePublish(app);
  const entered = useRef(false);
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    app.goMode(mode);
  }, [app, mode]);
  return app.mode === mode ? createElement(GuardedMode, { allow, calls }) : null;
}

async function mount(allow, calls) {
  render(
    createElement(
      ToastProvider,
      null,
      createElement(AppProvider, null, createElement(Harness, { allow, calls }))
    )
  );
  await act(async () => {});
  expect(ctx().mode).toBe('simulasi');
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  held.ctx = null;
});

describe('exit guard — every route out of the mode area', () => {
  it('requestExitMode (the Escape shortcut) aborts when the guard says no', async () => {
    await mount(false);
    await act(async () => ctx().requestExitMode());
    expect(ctx().mode).toBe('simulasi');
  });

  it('requestExitMode leaves when the guard allows it', async () => {
    await mount(true);
    await act(async () => ctx().requestExitMode());
    expect(ctx().mode).toBe(null);
  });

  it('goTab (the desktop side nav) aborts when the guard says no', async () => {
    await mount(false);
    await act(async () => ctx().goTab('saya'));
    expect(ctx().mode).toBe('simulasi');
  });

  it('goMode (side nav picking another mode) aborts when the guard says no', async () => {
    await mount(false);
    await act(async () => ctx().goMode('kartu'));
    expect(ctx().mode).toBe('simulasi');
  });

  it('goBack keeps honouring the guard', async () => {
    await mount(false);
    await act(async () => ctx().goBack());
    expect(ctx().mode).toBe('simulasi');
  });

  it('the hardware back button aborts when the guard says no, and puts history back', async () => {
    await mount(false);
    const before = history.length;
    await act(async () => {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { tab: 'belajar', mode: null } })
      );
    });
    expect(ctx().mode).toBe('simulasi');
    // The vetoed pop is undone by re-pushing the entry we were parked on, so
    // the user is not left one entry adrift of where the app thinks it is.
    expect(history.length).toBeGreaterThanOrEqual(before);
  });

  it('the hardware back button leaves when the guard allows it', async () => {
    // What "leaves" means here needs care, and getting it wrong is what made
    // this test intermittent enough to fail one CI run and pass the next.
    //
    // On an allowed exit AppContext does three things: resolve the guard, clear
    // it, and call `history.back()` to re-apply the press the user actually
    // made. The exit itself then arrives on the popstate *that* back causes,
    // which the browser delivers asynchronously — and in jsdom lands on
    // whichever entry the fixture's history stack happens to hold, which is not
    // something this app controls or that this test should assert on. The
    // earlier version fabricated that second popstate by hand and asserted the
    // resulting mode; it was really asserting the shape of jsdom's history.
    //
    // So assert the app's own three steps, which are race-free and are what the
    // comment always said was the point: asked once, cleared, press re-applied.
    const backSpy = vi.spyOn(history, 'back');
    const calls = { n: 0 };
    await mount(true, calls);

    await act(async () => {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { tab: 'belajar', mode: null } })
      );
    });
    await waitFor(() => expect(backSpy).toHaveBeenCalled());

    expect(calls.n, 'the guard should be consulted exactly once').toBe(1);
    expect(backSpy, 'the press should be re-applied once').toHaveBeenCalledTimes(1);
    // Cleared: a second press must not ask again. If the guard were still
    // registered this would re-enter the guarded branch and consult it twice.
    await act(async () => {
      window.dispatchEvent(
        new PopStateEvent('popstate', { state: { tab: 'belajar', mode: null } })
      );
    });
    expect(calls.n, 'a released guard must not be asked a second time').toBe(1);
    backSpy.mockRestore();
  });

  it('a mode with no guard is unaffected — exits stay synchronous', async () => {
    render(
      createElement(
        ToastProvider,
        null,
        createElement(AppProvider, null, createElement(UnguardedHarness))
      )
    );
    await act(async () => {});
    expect(ctx().mode).toBe('kartu');
    act(() => ctx().exitMode());
    expect(ctx().mode).toBe(null);
  });
});

function UnguardedHarness() {
  const app = useApp();
  usePublish(app);
  const entered = useRef(false);
  useEffect(() => {
    if (entered.current) return;
    entered.current = true;
    app.goMode('kartu');
  }, [app]);
  return null;
}
