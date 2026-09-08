// ─── tests/theme-mode.test.js ────────────────────────────────────────────────
// The theme setting, separate from the palette. See utils/theme-mode.js.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, afterEach } from 'vitest';
import {
  THEME_MODES,
  DEFAULT_THEME,
  getThemeMode,
  nextTheme,
  prefersDarkOS,
  resolveIsDark,
} from '../utils/theme-mode.js';

const realMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe('the setting', () => {
  it('keeps light as the default — following the OS is opt-in', () => {
    expect(DEFAULT_THEME).toBe('light');
  });

  it('offers exactly the three documented modes', () => {
    expect(THEME_MODES.map((m) => m.key)).toEqual(['light', 'dark', 'sistem']);
  });

  it('falls back to the default for a value it does not recognise', () => {
    // A stored theme can predate this file, or be hand-edited in localStorage.
    expect(getThemeMode('nonsense').key).toBe(DEFAULT_THEME);
    expect(getThemeMode(undefined).key).toBe(DEFAULT_THEME);
  });

  it('cycles through all three and returns to the start', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('sistem');
    expect(nextTheme('sistem')).toBe('light');
  });

  it('resumes from the default when the stored value is unknown', () => {
    expect(nextTheme('nonsense')).toBe(DEFAULT_THEME);
  });
});

describe('resolveIsDark', () => {
  it('an explicit dark is dark whatever the OS says', () => {
    expect(resolveIsDark('dark', false)).toBe(true);
    expect(resolveIsDark('dark', true)).toBe(true);
  });

  it('an explicit light is light even when the OS is dark', () => {
    expect(resolveIsDark('light', true)).toBe(false);
  });

  it('sistem follows the OS in both directions', () => {
    expect(resolveIsDark('sistem', true)).toBe(true);
    expect(resolveIsDark('sistem', false)).toBe(false);
  });

  it('treats an unknown or missing value as light, the pre-sistem behaviour', () => {
    expect(resolveIsDark(undefined, true)).toBe(false);
    expect(resolveIsDark('nonsense', true)).toBe(false);
  });
});

describe('prefersDarkOS', () => {
  it('returns false rather than throwing when matchMedia is absent', () => {
    // SSR, and the shape two existing test files stub it with.
    delete window.matchMedia;
    expect(() => prefersDarkOS()).not.toThrow();
    expect(prefersDarkOS()).toBe(false);
  });

  it('reads the media query when one is available', () => {
    window.matchMedia = () => ({ matches: true });
    expect(prefersDarkOS()).toBe(true);
  });
});
