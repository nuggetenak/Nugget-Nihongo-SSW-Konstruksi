// ─── tests/context-direct-write.test.jsx ─────────────────────────────────────
// A context setter must never clobber a write made straight to the engine.
//
// Both contexts used to build a full document from their own React state --
// seeded once at mount, never re-synced -- and hand that finished object to
// `engine.set()`, whose object branch is `{ ...current, ...updater }`. Since
// the finished object carried every key, each stale value overwrote the fresh
// one in the cache.
//
// That mattered because eight modules write `prefs` and six write `progress`
// without going through a context, all of them correctly (functional updaters
// against the live cache). The observable bug: write a note in Buku Catatan,
// change any setting in Saya, note gone. Or finish a Wayground set, mark one
// card known in Kartu, and the set's wrong answers were gone.
//
// No test in the suite wrote storage directly and then called a context setter,
// which is exactly the interleaving that loses data -- so this file exists to
// pin the direction: a context write merges onto the engine's cache, it never
// replays a snapshot over it.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { _reset_for_test, get as storageGet, set as storageSet } from '../storage/engine.js';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

function Capture({ hook, onReady }) {
  onReady(hook());
  return null;
}

describe('prefs: a context write does not undo a direct write', () => {
  it('keeps notes written straight to the engine when a setting changes', () => {
    let ctx;
    render(
      <ToastProvider>
        <AppProvider>
          <Capture hook={useApp} onReady={(c) => (ctx = c)} />
        </AppProvider>
      </ToastProvider>
    );

    // CatatanMode's write path -- straight to the engine, bypassing the context.
    act(() => {
      storageSet('prefs', (p) => ({ ...p, notes: { 42: 'ampere = kuat arus' } }));
    });

    // Any settings tap in Saya.
    act(() => ctx.setPref('textScale', 'besar'));

    expect(storageGet('prefs').notes).toEqual({ 42: 'ampere = kuat arus' });
    expect(storageGet('prefs').textScale).toBe('besar');
  });

  it('keeps a sprint personal best across an unrelated pref change', () => {
    let ctx;
    render(
      <ToastProvider>
        <AppProvider>
          <Capture hook={useApp} onReady={(c) => (ctx = c)} />
        </AppProvider>
      </ToastProvider>
    );

    act(() => {
      storageSet('prefs', (p) => ({ ...p, sprintBests: { 60: { score: 31, timeline: [] } } }));
    });
    act(() => ctx.setPref('dailyGoal', 30));

    expect(storageGet('prefs').sprintBests[60].score).toBe(31);
    expect(storageGet('prefs').dailyGoal).toBe(30);
  });
});

describe('progress: a context write does not undo a direct write', () => {
  it('keeps quiz-mode wrong answers when a card is marked known', () => {
    let prog;
    render(
      <ToastProvider>
        <ProgressProvider>
          <Capture hook={useProgress} onReady={(p) => (prog = p)} />
        </ProgressProvider>
      </ToastProvider>
    );

    // WaygroundMode's write path.
    act(() => {
      storageSet('progress', (p) => ({ ...p, wgWrong: { 'wt01-3': { count: 1, lastWrong: 1 } } }));
    });

    // The most frequent write in the app.
    act(() => prog.handleMark(7, 'known'));

    expect(storageGet('progress').wgWrong['wt01-3']).toEqual({ count: 1, lastWrong: 1 });
    expect(storageGet('progress').known).toContain(7);
  });
});
