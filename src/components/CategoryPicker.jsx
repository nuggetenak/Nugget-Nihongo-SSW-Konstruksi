// ─── components/CategoryPicker.jsx ───────────────────────────────────────────
// Item 77's other half. Single-select category selection was written three
// times, in three shapes, over the same `['all', ...categories]` list:
//
//   QuizMode      pills, emoji + label, no counts
//   SprintMode    list rows, emoji + label + "N kartu", scrollable
//   GlossaryMode  compact emoji chips, count on the active one only
//
// They are one component with a variant, not three components — the differences
// are presentation, and every one of them was re-deriving the same `all`
// pseudo-category and the same active styling by hand.
//
// `FilterPopup` is deliberately *not* what these collapse into, which is the
// part of this item that needed a decision rather than a refactor. It is a
// multi-select modal sheet over the flashcard deck (item 55); these are
// single-select controls sitting inline on a setup screen. Folding an inline
// one-tap filter into a modal would cost a tap and a focus trap on three
// screens to save a component that does something else.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../styles/theme.js';
import { pillStyle } from '../styles/pill.js';
import S from '../modes/modes.module.css';

const ALL = 'all';

/**
 * @param {Array<{key,label,emoji}>} cats  categories to offer, excluding `all`
 * @param {string} value                   selected key (`all` for no filter)
 * @param {(key: string) => void} onChange
 * @param {'pills'|'rows'|'compact'} variant
 * @param {Object<string, number>} [counts] per-key counts, `all` included.
 *   Passed rather than derived so a caller whose "Semua" means something
 *   narrower than the whole deck (GlossaryMode, where a search is active) can
 *   say so instead of being overruled.
 * @param {{label: string, emoji: string}} [allOption]
 * @param {string} [countSuffix]  e.g. 'kartu', for the rows variant
 */
export default function CategoryPicker({
  cats,
  value,
  onChange,
  variant = 'pills',
  counts = null,
  allOption = { label: 'Semua', emoji: '📚' },
  countSuffix = '',
  label = null,
  maxHeight = null,
}) {
  const items = [{ key: ALL, ...allOption }, ...cats];
  // One real category plus "Semua" is not a choice.
  if (items.length < 3) return null;

  const countFor = (key) => counts?.[key];
  const fmt = (n) => (countSuffix ? `${n} ${countSuffix}` : String(n));

  if (variant === 'rows') {
    return (
      <>
        {label && <div className={S.sectionLabel}>{label}</div>}
        <div
          className={S.list}
          style={{
            marginBottom: 'var(--space-16)',
            ...(maxHeight ? { maxHeight, overflowY: 'auto' } : null),
          }}
        >
          {items.map((c) => {
            const active = value === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onChange(c.key)}
                className={S.btnItem}
                aria-pressed={active}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-10)',
                  background: active ? 'rgba(245,158,11,0.10)' : T.surface,
                  border: `1px solid ${active ? `${T.amber}66` : T.border}`,
                  color: active ? T.amber : T.text,
                }}
              >
                <span>{c.emoji}</span>
                <span style={{ fontSize: 'var(--fs-body)' }}>{c.label}</span>
                {countFor(c.key) !== undefined && (
                  <span
                    style={{ marginLeft: 'auto', fontSize: 'var(--fs-small)', color: T.textDim }}
                  >
                    {fmt(countFor(c.key))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        {items.map((c) => {
          const active = value === c.key;
          const n = countFor(c.key);
          return (
            <button
              key={c.key}
              onClick={() => onChange(c.key)}
              aria-label={c.label}
              aria-pressed={active}
              style={{
                ...pillStyle(active),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
              }}
            >
              <span aria-hidden="true">{c.emoji}</span>
              {active && n !== undefined && <span style={{ opacity: 0.7 }}>{n}</span>}
            </button>
          );
        })}
      </>
    );
  }

  return (
    <>
      {label && (
        <div
          style={{
            fontSize: 'var(--fs-body)',
            fontWeight: 600,
            color: T.text,
            marginBottom: 'var(--space-8)',
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {items.map((c) => {
          const active = value === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onChange(c.key)}
              aria-pressed={active}
              style={{ ...pillStyle(active), fontSize: 'var(--fs-small)' }}
            >
              {c.emoji} {c.label}
              {countFor(c.key) !== undefined ? ` (${countFor(c.key)})` : ''}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Per-key counts for a card list, with `all` included. */
export function countByCategory(cards) {
  const counts = { [ALL]: cards.length };
  cards.forEach((c) => (counts[c.category] = (counts[c.category] ?? 0) + 1));
  return counts;
}
