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

// Owner decision, 2026-09-08: the default is `kecil`, deliberately NOT the
// 100% no-op. This is worth reading before "restoring" it, because every other
// artefact in this repo argues the other way and will look like the authority.
//
// What it costs, measured: --space-* is rem on purpose (DESIGN_SPEC §4), so 90%
// shrinks spacing as well as text -- the whole layout gets ~10% denser.
// --fs-body 15 -> 13.5px, --fs-small 13 -> 11.7px, --fs-micro 11 -> 9.9px, and
// the furigana floor 11 -> 9.9px. A census of the running app found 85% of its
// text at <=13px and called that "the app's largest usability problem"; the
// whole fluid rem scale exists to fix it, and this walks part of it back.
// --tap-min stays px, so tap targets are unaffected.
//
// It ships because the owner asked for it directly, and the control is one tap
// away in Saya. It is a decision, not drift. `text-scale.test.js` carries the
// same statement in a test name so a failure says so out loud.
export const DEFAULT_TEXT_SCALE = 'kecil';

const DEFAULT_INDEX = TEXT_SCALES.findIndex((s) => s.key === DEFAULT_TEXT_SCALE);

export function getTextScale(key) {
  // Derived from DEFAULT_TEXT_SCALE, not a literal index: the old `TEXT_SCALES[1]`
  // encoded the default a second time, so changing it in one place left the
  // fallback pointing at the old rung.
  return TEXT_SCALES.find((s) => s.key === key) ?? TEXT_SCALES[DEFAULT_INDEX];
}

/** Next scale in the cycle — the settings Row pattern this app uses is a
 *  tap-to-advance, not a picker. */
export function nextTextScale(key) {
  const i = TEXT_SCALES.findIndex((s) => s.key === key);
  return TEXT_SCALES[(i === -1 ? DEFAULT_INDEX : i + 1) % TEXT_SCALES.length].key;
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
