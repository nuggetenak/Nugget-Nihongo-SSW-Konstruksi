// ─── utils/format.js ──────────────────────────────────────────────────────────
// item 42: card counts rendered as "1.438" in some places and "1438" a few
// lines away in others (Dashboard's own knownN sat unformatted two lines
// above a toLocaleString('id-ID') one). One helper, used only where a number
// is genuinely corpus-scale -- a streak of 5 or a score of 7/10 doesn't need
// a thousands separator and shouldn't get one.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a corpus-scale count using Indonesian thousands-separator
 * convention ('.' not ','), e.g. 1438 -> "1.438".
 * Not for small numbers (streaks, scores, percentages) -- those read fine
 * unformatted and formatting them is just noise.
 */
export function formatCount(n) {
  return n.toLocaleString('id-ID');
}
