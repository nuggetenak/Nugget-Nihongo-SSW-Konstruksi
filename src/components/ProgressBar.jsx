// ─── ProgressBar.jsx ─────────────────────────────────────────────────────────
// Thin linear progress bar. Phase 6: near-zero inline styles.
// color + height stay inline — they're per-instance values, not design tokens.
// ─────────────────────────────────────────────────────────────────────────────

import s from './ProgressBar.module.css';

export default function ProgressBar({ current, total, color, height = 4 }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  // color is passed per-instance (amber / green / red) — stays inline
  // height is a sizing prop — stays inline
  return (
    <div className={s.track} style={{ height }}>
      <div
        className={s.fill}
        style={{
          width: `${pct}%`,
          background: color ?? 'var(--ssw-amber)',
          boxShadow: pct > 0 ? `0 0 8px ${color ?? 'var(--ssw-amber)'}40` : 'none',
        }}
      />
    </div>
  );
}
