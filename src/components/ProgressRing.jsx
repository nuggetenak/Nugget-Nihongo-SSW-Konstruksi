// ─── components/ProgressRing.jsx ──────────────────────────────────────────────
// Circular SVG progress ring. Replaces both stats bar AND linear progress bar.
// ─────────────────────────────────────────────────────────────────────────────

import { T } from '../styles/theme.js';

export default function ProgressRing({
  current = 0,
  total = 1,
  size = 140,
  stroke = 10,
  label = null,   // optional label below percentage (e.g., track name)
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={T.border}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={T.amber}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>

      {/* Center text */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div
          style={{
            fontSize: size >= 120 ? 28 : 20,
            fontWeight: 800,
            lineHeight: 1,
            color: T.text,
          }}
        >
          {Math.round(pct)}%
        </div>
        <div
          style={{
            fontSize: size >= 120 ? 12 : 10,
            color: T.textDim,
            marginTop: 4,
            lineHeight: 1.2,
          }}
        >
          {label ?? `${current}/${total}`}
        </div>
      </div>
    </div>
  );
}
