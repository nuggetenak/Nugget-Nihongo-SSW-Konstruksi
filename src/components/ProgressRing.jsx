// ─── components/ProgressRing.jsx ──────────────────────────────────────────────
// Circular SVG progress ring.
// ─────────────────────────────────────────────────────────────────────────────

import s from './ProgressRing.module.css';
import { formatCount } from '../utils/format.js';

export default function ProgressRing({
  current = 0,
  total = 1,
  size = 140,
  stroke = 10,
  label = null,
  centerText = null,
  ariaLabel = null,
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  // `centerText` replaces the percentage without changing what the arc draws —
  // for a caller that wants the shape of the progress but not a number for it
  // (StatsMode's readiness band, item 70). Words need more room than two digits,
  // so they get a smaller size and are allowed to wrap.
  const fontSize = centerText ? (size >= 120 ? 18 : 14) : size >= 120 ? 28 : 20;
  const subSize = size >= 120 ? 12 : 10;

  return (
    <div className={s.container} style={{ width: size, height: size }}>
      <svg
        className={s.svg}
        width={size}
        height={size}
        role="img"
        aria-label={
          ariaLabel ?? `Progress: ${Math.round(pct)}% — ${current} dari ${total} kartu hafal`
        }
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <circle className={s.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
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
        <div
          className={s.pct}
          style={{
            fontSize,
            ...(centerText
              ? { letterSpacing: 0, lineHeight: 1.15, maxWidth: size - stroke * 4 }
              : null),
          }}
        >
          {centerText ?? `${Math.round(pct)}%`}
        </div>
        <div className={s.sub} style={{ fontSize: subSize }}>
          {/* Corpus-scale by every current caller (SayaTab passes known/1438),
              so it gets the same thousands separator as the numbers around it —
              the ring read "140/1438" directly beside "1.438 kartu". */}
          {label ?? `${formatCount(current)}/${formatCount(total)}`}
        </div>
      </div>
    </div>
  );
}
