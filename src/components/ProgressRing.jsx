// ─── components/ProgressRing.jsx ──────────────────────────────────────────────
// Circular SVG progress ring. Phase 6: 0 inline styles.
// ─────────────────────────────────────────────────────────────────────────────

import s from './ProgressRing.module.css';

export default function ProgressRing({
  current = 0,
  total = 1,
  size = 140,
  stroke = 10,
  label = null,
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  const fontSize = size >= 120 ? 28 : 20;
  const subSize  = size >= 120 ? 12 : 10;

  return (
    <div className={s.container} style={{ width: size, height: size }}>
      <svg
        className={s.svg}
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <circle
          className={s.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className={s.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={s.center}>
        <div className={s.pct} style={{ fontSize }}>{Math.round(pct)}%</div>
        <div className={s.sub} style={{ fontSize: subSize }}>
          {label ?? `${current}/${total}`}
        </div>
      </div>
    </div>
  );
}
