// ─── components/ProgressRing.jsx ──────────────────────────────────────────────
// Circular SVG progress ring.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import s from './ProgressRing.module.css';
import { formatCount } from '../utils/format.js';
import { motionAllows } from '../utils/motion.js';
import { useCountUp } from '../hooks/useCountUp.js';

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

  // item 160. The ring has transitioned its stroke-dashoffset at --t-count
  // since it was written, and never once ran that transition: it MOUNTED at its
  // final offset, and a property that never changes never animates. So the one
  // element in the app whose whole job is to show how far you have come simply
  // appeared, complete, as if it had always been that full.
  //
  // One frame at the empty offset first, then the real one, which is what gives
  // the existing transition something to do. A rAF rather than a layout effect:
  // the browser has to have PAINTED the empty state for the change to be a
  // change at all.
  const [drawn, setDrawn] = useState(() => !motionAllows('count'));
  useEffect(() => {
    if (drawn) return undefined;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [drawn]);

  // The percentage climbs with the arc (item 159). `pct` itself stays exact --
  // the aria-label below reads it, and a screen reader must be told the value,
  // not a frame of the animation.
  const shownPct = useCountUp(Math.round(pct));

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
          strokeDashoffset={drawn ? offset : circumference}
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
          {centerText ?? `${shownPct}%`}
        </div>
        <div className={s.sub} style={{ fontSize: subSize }}>
          {/* Corpus-scale by every current caller (SayaTab passes known/TOTAL_CARDS),
              so it gets the same thousands separator as the numbers around it —
              the ring read "140/1438" directly beside "1.438 kartu" when item 42
              found it. Named rather than numbered here: the literal went stale the
              moment the corpus grew to 1,626. */}
          {label ?? `${formatCount(current)}/${formatCount(total)}`}
        </div>
      </div>
    </div>
  );
}
