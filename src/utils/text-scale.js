// ─── utils/text-scale.js ──────────────────────────────────────────────────────
// The reader-facing size control for the whole type scale.
//
// Every `--fs-*` token is a clamp whose preferred term carries a rem component
// (see global.css), so scaling the root font size scales the entire scale —
// body, headings, labels, and the furigana floor with them. That property was
// the point of converting the tokens to rem (item 53, 2026-08-31), but nothing
// ever exposed it: the stated benefit was "responds to a user's OS/browser
// text-size preference", and on Android that setting is several menus deep and
// most people never find it.
//
// This is that same mechanism with a control on it. A census of the running app
// found 85% of its text at 13px or smaller; the scale rebuild fixed the default,
// and this covers the readers for whom the default still isn't enough — an
// audience working on construction sites, frequently in their 30s-50s, reading a
// script they are still learning.
//
// Percentages, not pixels: they compose with whatever the browser's own base
// size already is, so a reader who HAS raised their OS text size gets both
// rather than having it overridden.
export const TEXT_SCALES = [
  { key: 'kecil', label: 'Kecil', pct: 90, emoji: '🔉' },
  { key: 'normal', label: 'Normal', pct: 100, emoji: '🔊' },
  { key: 'besar', label: 'Besar', pct: 112, emoji: '🔊' },
  { key: 'sangat-besar', label: 'Sangat Besar', pct: 125, emoji: '📢' },
];

export const DEFAULT_TEXT_SCALE = 'normal';

export function getTextScale(key) {
  return TEXT_SCALES.find((s) => s.key === key) ?? TEXT_SCALES[1];
}

/** Next scale in the cycle — the settings Row pattern this app uses is a
 *  tap-to-advance, not a picker. */
export function nextTextScale(key) {
  const i = TEXT_SCALES.findIndex((s) => s.key === key);
  return TEXT_SCALES[(i === -1 ? 1 : i + 1) % TEXT_SCALES.length].key;
}

/**
 * Apply a scale to the document root.
 *
 * Sets `font-size` on <html>, which is what rem resolves against. Deliberately
 * not a `zoom` or a transform: those scale layout as well as text, so a larger
 * setting would show LESS content rather than the same content more legibly —
 * the opposite of what someone reaching for this wants.
 */
export function applyTextScale(key) {
  if (typeof document === 'undefined') return;
  const { pct } = getTextScale(key);
  document.documentElement.style.fontSize = pct === 100 ? '' : `${pct}%`;
  document.documentElement.dataset.textScale = key;
}
