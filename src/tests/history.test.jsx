// ─── tests/history.test.jsx ───────────────────────────────────────────────────
// item 10 (scoped route): entering a mode pushes one history entry; the
// hardware/browser back button (popstate) returns to the tab level rather
// than exiting the app. See AppContext.jsx for the full design notes.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  // Each test starts from a clean, single history entry so push/replace
  // counts below are unaffected by whatever a previous test left behind.
  history.replaceState(null, '', '#/');
});

function Capture({ onCtx }) {
  const ctx = useApp();
  onCtx(ctx);
  return null;
}

function renderApp() {
  let ctx;
  render(
    createElement(
      ToastProvider,
      null,
      createElement(AppProvider, null, createElement(Capture, { onCtx: (c) => (ctx = c) }))
    )
  );
  return () => ctx;
}

describe('AppContext — browser history integration', () => {
  it('entering a mode from the tab level pushes exactly one entry', () => {
    const pushSpy = vi.spyOn(history, 'pushState');
    const getCtx = renderApp();

    act(() => {
      getCtx().goMode('kartu');
    });

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(history.state).toMatchObject({ mode: 'kartu' });
    pushSpy.mockRestore();
  });

  it('moving between modes while already in the mode area replaces, not pushes', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });

    const pushSpy = vi.spyOn(history, 'pushState');
    act(() => {
      getCtx().goMode('kuis');
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(history.state).toMatchObject({ mode: 'kuis' });
    pushSpy.mockRestore();
  });

  it('switching tabs at the top level does not push a new entry', () => {
    const getCtx = renderApp();
    const pushSpy = vi.spyOn(history, 'pushState');

    act(() => {
      getCtx().goTab('belajar');
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(getCtx().tab).toBe('belajar');
    pushSpy.mockRestore();
  });

  it('hardware back from inside a mode returns to the tab level, not out of the app', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });
    expect(getCtx().mode).toBe('kartu');

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }));
    });

    expect(getCtx().mode).toBeNull();
    expect(getCtx().tab).toBe('home');
  });

  it('popping past everything this app pushed (state: null) lands on the home tab, not a broken state', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    });

    expect(getCtx().mode).toBeNull();
    expect(getCtx().tab).toBe('home');
  });

  it('a popstate-driven change does not itself push another entry (no loop)', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });

    const pushSpy = vi.spyOn(history, 'pushState');
    const replaceSpy = vi.spyOn(history, 'replaceState');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }));
    });

    expect(pushSpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    pushSpy.mockRestore();
    replaceSpy.mockRestore();
  });

  it('restores modeHistory from the popped state so further in-mode back still works', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });
    act(() => {
      getCtx().goMode('kuis'); // replaced in place; modeHistory now ['kartu']
    });
    expect(getCtx().modeHistory).toEqual(['kartu']);

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: { tab: 'home', mode: 'kuis', modeHistory: ['kartu'] },
        })
      );
    });

    expect(getCtx().modeHistory).toEqual(['kartu']);
    expect(getCtx().mode).toBe('kuis');
  });

  // Item 52 (2026-08-26): exiting a mode via an in-app control used to
  // always replace, never pop, so hardware back afterward needed two
  // presses. exitMode now pops (in addition to its original direct state
  // change, unconditionally kept -- see the redesign note on exitMode
  // itself for why the visible update can't depend on the async pop alone)
  // when it's confirmed safe (canPopRef).
  it('exitMode pops the extra history entry (in addition to its always-direct state change) when it was safely pushed by mode-area entry', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });

    const backSpy = vi.spyOn(history, 'back').mockImplementation(() => {
      // jsdom doesn't actually navigate on history.back() -- simulate what
      // a real browser would do: fire the popstate the app is listening for.
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }));
    });

    act(() => {
      getCtx().exitMode();
    });

    // The real assertion: history.back() was actually attempted. mode being
    // null is expected either way now (exitMode's direct update guarantees
    // it synchronously, before this mock's simulated popstate even fires),
    // so it's a sanity check on the end state, not proof the pop happened.
    expect(backSpy).toHaveBeenCalledTimes(1);
    expect(getCtx().mode).toBeNull();
    backSpy.mockRestore();
  });

  it('exitMode does not call history.back() when popping was never confirmed safe (the direct state change still happens either way)', () => {
    const getCtx = renderApp();
    // Deliberately not entering a mode first -- canPopRef starts false, and
    // this exercises exitMode being called without the tracked
    // tab-area -> mode-area push ever having happened.
    const backSpy = vi.spyOn(history, 'back');

    act(() => {
      getCtx().exitMode();
    });

    expect(backSpy).not.toHaveBeenCalled();
    expect(getCtx().mode).toBeNull();
    backSpy.mockRestore();
  });

  it('a real popstate landing outside mode area clears modeParams (found while wiring item 52 -- was stale even for the original hardware-back path, not something this item introduced)', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu', { filterIds: ['1', '2'] });
    });
    expect(getCtx().modeParams).toEqual({ filterIds: ['1', '2'] });

    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }));
    });

    expect(getCtx().modeParams).toBeNull();
  });

  it('canPopRef is invalidated by a real popstate, so a second exitMode call after one does not pop again', () => {
    const getCtx = renderApp();
    act(() => {
      getCtx().goMode('kartu');
    });
    // Simulate the user having already pressed hardware back once --
    // the browser's position has moved for a reason exitMode didn't
    // initiate, so it must not assume it's still safe to pop from here.
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }));
    });

    const backSpy = vi.spyOn(history, 'back');
    act(() => {
      getCtx().exitMode();
    });

    expect(backSpy).not.toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
