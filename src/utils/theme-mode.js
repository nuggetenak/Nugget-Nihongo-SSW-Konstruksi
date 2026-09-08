// ─── utils/theme-mode.js ──────────────────────────────────────────────────────
// The reader-facing theme control, kept separate from the palette itself.
//
// `styles/theme.js` owns the colours (THEMES) and how they reach the document
// (applyTheme). This file owns the *setting*: which options exist, what the
// default is, how tapping advances it, and how a stored preference resolves to
// "is it dark right now". Same split as utils/text-scale.js vs the --fs-*
// tokens in global.css, and the same shape -- a settings Row cycles it.
//
// The third option is why this file exists. `theme` used to be a strict binary
// with a `toggleTheme` that flipped it, so "follow the phone" could not be
// expressed at all: a reader whose device switches to dark in the evening had
// to change the app by hand twice a day. Light stays the default -- following
// the OS is opt-in, not assumed.
// ─────────────────────────────────────────────────────────────────────────────

export const THEME_MODES = [
  { key: 'light', label: 'Terang', emoji: '☀️' },
  { key: 'dark', label: 'Gelap', emoji: '🌙' },
  { key: 'sistem', label: 'Ikuti Sistem', emoji: '🖥️' },
];

export const DEFAULT_THEME = 'light';

const DEFAULT_INDEX = THEME_MODES.findIndex((m) => m.key === DEFAULT_THEME);

export function getThemeMode(key) {
  return THEME_MODES.find((m) => m.key === key) ?? THEME_MODES[DEFAULT_INDEX];
}

/** Next mode in the cycle — the settings Row pattern is tap-to-advance. */
export function nextTheme(key) {
  const i = THEME_MODES.findIndex((m) => m.key === key);
  return THEME_MODES[(i === -1 ? DEFAULT_INDEX : i + 1) % THEME_MODES.length].key;
}

/**
 * Does the device currently ask for dark?
 *
 * Optional call, never a throw: matchMedia is absent under SSR, and two test
 * files replace it with a bare `{ matches }` object. Same idiom as
 * BottomNav.jsx's reduced-motion check.
 */
export function prefersDarkOS() {
  return (
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  );
}

/**
 * The one place a stored theme preference becomes a boolean.
 *
 * `osDark` is injected rather than read inside, so this stays pure and
 * testable, and so main.jsx's pre-paint call works with no React state. An
 * unrecognised key resolves light, which is both the default and the safe
 * answer for a value that predates this file.
 */
export function resolveIsDark(themeKey, osDark = prefersDarkOS()) {
  return themeKey === 'dark' || (themeKey === 'sistem' && osDark);
}
