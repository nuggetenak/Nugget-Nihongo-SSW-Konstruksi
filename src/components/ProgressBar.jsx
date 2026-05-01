// ─── ProgressBar.jsx ─────────────────────────────────────────────────────────
// Thin linear progress bar with full a11y (role=progressbar, aria-valuenow).
// color + height stay inline — per-instance values.
// ─────────────────────────────────────────────────────────────────────────────

import s from './ProgressBar.module.css';

export default function ProgressBar({ current, total, color, height = 4, label }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div
      className={s.track}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(pct)}% selesai`}
    >
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
