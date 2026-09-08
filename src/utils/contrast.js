// ─── utils/contrast.js ───────────────────────────────────────────────────────
// Pick a readable ink for a background chosen at runtime.
//
// UI_UX_PLAN item 64 said `--ssw-onAmber` exists and 21 sites hardcode `#fff`
// instead, and item 142 recorded that 19 of them were still unchanged. Both were
// measuring the right thing and prescribing the wrong fix: `--ssw-onAmber` is
// `#1a0a00`, an ink for a *light* surface, and most of those `#fff` sites sit on
// the blue offline banner, the red data warning and the red confirm button,
// where white is correct and near-black would be a serious regression. Measured
// rather than assumed: white on `#dc2626` is 4.83:1, white on `#3b82f6` is
// 3.68:1, and `--ssw-onAmber` on `#92400e` -- the dark end of the CTA gradient --
// is 2.72:1, worse than what is there now.
//
// The sites that genuinely fail are the ones whose background is not fixed at
// all: BelajarTab's two mode badges take `background: sm.color`, one of the 19
// mode accent colours. White fails the 3:1 large-text floor on 14 of them, and
// on `#facc15` (Angka Kunci) it is 1.53:1 -- a bold numeral that is effectively
// invisible. No literal can be right there, which is why this is a function.
//
// So item 64 stands corrected rather than executed: the fixed-surface `#fff`
// values stay, and the variable-surface ones are computed.
// ─────────────────────────────────────────────────────────────────────────────

/** Ink for a light surface. Matches --ssw-onAmber; kept in sync deliberately. */
export const INK_DARK = '#1a0a00';
export const INK_LIGHT = '#ffffff';

function toRgb(color) {
  const hex = String(color).trim().replace('#', '');
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hex)) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(color) {
  const rgb = toRgb(color);
  if (!rgb) return null;
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

/** WCAG contrast ratio between two hex colours, 1:1 to 21:1. */
export function contrastRatio(a, b) {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The more readable of white and the dark ink, for `bg`.
 *
 * Falls back to white for anything it cannot parse (a gradient, a CSS variable,
 * `currentColor`), which is what those sites use today — an unreadable colour is
 * bad, an exception during render is worse.
 */
export function readableOn(bg) {
  const light = contrastRatio(INK_LIGHT, bg);
  const dark = contrastRatio(INK_DARK, bg);
  if (light === null || dark === null) return INK_LIGHT;
  return dark > light ? INK_DARK : INK_LIGHT;
}
