// ─── styles/pill.js ──────────────────────────────────────────────────────────
// The selectable pill used by every mode's setup screen.
//
// This was copied five times (item 77). Two of those copies went with
// ProductionMode and QuizProduksiMode when those modes were removed; the three
// that remained were not quite identical, which is exactly why they needed
// reading side by side to consolidate:
//
//   JACMode and WaygroundMode were byte-for-byte the same — the small pill.
//   QuizMode's was a larger variant: more padding, body-size text, and the
//   themed surfaceActive/borderActive/amber trio instead of hardcoded amber
//   rgba values.
//
// Both survive here as one function with a size, rather than being flattened
// into a single look: QuizMode's pills are the primary control on its setup
// screen and are deliberately bigger than the topic filters on JAC/Wayground.
//
// `modes.module.css` also carried an unused `.pill` class from an earlier
// attempt at this. It is removed with this change — the active state is
// dynamic and token-driven, which is why the inline form won out.
import { T } from './theme.js';

/**
 * @param {boolean} active  whether this pill is the selected one
 * @param {'sm'|'md'} size  'sm' for filter rows, 'md' for a primary picker
 */
export const pillStyle = (active, size = 'sm') =>
  size === 'md'
    ? {
        fontFamily: 'inherit',
        padding: 'var(--space-8) var(--space-16)',
        fontSize: 'var(--fs-body)',
        borderRadius: T.r.pill,
        cursor: 'pointer',
        fontWeight: active ? 700 : 400,
        background: active ? T.surfaceActive : T.surface,
        border: `1px solid ${active ? T.borderActive : T.border}`,
        color: active ? T.amber : T.textMuted,
      }
    : {
        fontFamily: 'inherit',
        fontSize: 'var(--fs-small)',
        padding: 'var(--space-6) var(--space-12)',
        borderRadius: T.r.pill,
        cursor: 'pointer',
        background: active ? 'rgba(251,191,36,0.15)' : T.surface,
        border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`,
        color: active ? T.gold : T.textMuted,
      };
