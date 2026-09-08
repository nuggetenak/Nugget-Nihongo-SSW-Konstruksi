// ─── tests/theme-system.test.jsx ─────────────────────────────────────────────
// The "Ikuti Sistem" wiring end to end: mount, live OS flip, and cleanup.
//
// The live flip is the part worth testing, because it is the whole point of the
// option -- a reader whose phone switches to dark at sunset should not have to
// reopen the app. It is also the part a refactor would quietly drop, since
// everything still looks right on a reload.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import LZString from 'lz-string';
import { _reset_for_test } from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';

const realMatchMedia = window.matchMedia;

/** A media query list whose `change` listeners can be fired by the test. */
function makeMQL(initial) {
  const listeners = new Set();
  return {
    mql: {
      matches: initial,
      addEventListener: (_t, fn) => listeners.add(fn),
      removeEventListener: (_t, fn) => listeners.delete(fn),
    },
    flip(next) {
      this.mql.matches = next;
      listeners.forEach((fn) => fn({ matches: next }));
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

function seedTheme(theme) {
  const write = (k, d) => localStorage.setItem(k, LZString.compressToUTF16(JSON.stringify(d)));
  write(DOCS.progress, { ...DEFAULTS.progress, _v: STORAGE_VERSION });
  write(DOCS.srs, { ...DEFAULTS.srs, _v: STORAGE_VERSION });
  write(DOCS.prefs, { ...DEFAULTS.prefs, _v: STORAGE_VERSION, theme });
}

const themeAttr = () => document.documentElement.getAttribute('data-theme');

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});
afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.restoreAllMocks();
});

function mount() {
  return render(
    <ToastProvider>
      <AppProvider>
        <div />
      </AppProvider>
    </ToastProvider>
  );
}

describe('theme: sistem', () => {
  it('paints dark on mount when the OS asks for dark', () => {
    const h = makeMQL(true);
    window.matchMedia = () => h.mql;
    seedTheme('sistem');
    mount();
    expect(themeAttr()).toBe('dark');
  });

  it('repaints live when the OS flips while the app is open', () => {
    const h = makeMQL(false);
    window.matchMedia = () => h.mql;
    seedTheme('sistem');
    mount();
    expect(themeAttr()).toBe('light');

    act(() => h.flip(true));
    expect(themeAttr()).toBe('dark');

    act(() => h.flip(false));
    expect(themeAttr()).toBe('light');
  });

  it('ignores the OS when the stored theme is explicit', () => {
    const h = makeMQL(true);
    window.matchMedia = () => h.mql;
    seedTheme('light');
    mount();
    expect(themeAttr()).toBe('light');
    act(() => h.flip(false));
    expect(themeAttr()).toBe('light');
  });

  it('removes its listener on unmount', () => {
    const h = makeMQL(false);
    window.matchMedia = () => h.mql;
    seedTheme('sistem');
    const { unmount } = mount();
    expect(h.listenerCount).toBe(1);
    unmount();
    expect(h.listenerCount).toBe(0);
  });
});

describe('theme: hostile matchMedia shapes', () => {
  it('does not throw when matchMedia exposes neither addEventListener nor addListener', () => {
    // Exactly the stub shape motion-haptics.test.jsx installs.
    window.matchMedia = () => ({ matches: false });
    seedTheme('sistem');
    expect(() => mount()).not.toThrow();
  });

  it('does not throw when matchMedia is absent entirely', () => {
    delete window.matchMedia;
    seedTheme('sistem');
    expect(() => mount()).not.toThrow();
    expect(themeAttr()).toBe('light');
  });
});
