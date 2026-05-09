// ─── components/StudyHeatmap.jsx ─────────────────────────────────────────────
// GitHub-style 52-week study activity heatmap using SVG.
// Data from sessions array (capped 180, so ~6 months of real data shown).
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { T } from '../styles/theme.js';
import { isoToLocalDate } from '../utils/date.js';

const CELL = 11;
const GAP  = 2;
const COLS = 18; // ~18 weeks = 126 days, covers the 90-session window
const DAYS = 7;
const DAY_LABELS = ['Min', '', 'Sel', '', 'Kam', '', 'Sab'];

export default function StudyHeatmap({ sessions = [] }) {
  const { cellData, maxCount } = useMemo(() => {
    const today = new Date();
    // Build date → count map
    const byDate = {};
    sessions.forEach((sess) => {
      const d = isoToLocalDate(sess.date);
      if (d) byDate[d] = (byDate[d] ?? 0) + 1;
    });
    // Build grid: COLS * DAYS cells ending today
    const totalDays = COLS * DAYS;
    const cells = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('sv');
      cells.push({ key, count: byDate[key] ?? 0, dayOfWeek: d.getDay() });
    }
    const max = Math.max(...cells.map((c) => c.count), 1);
    return { cellData: cells, maxCount: max };
  }, [sessions]);

  // Arrange into columns (each column = 1 week, 7 rows)
  const columns = [];
  for (let col = 0; col < COLS; col++) {
    columns.push(cellData.slice(col * DAYS, (col + 1) * DAYS));
  }

  const svgW = COLS * (CELL + GAP) + 20; // +20 for day labels
  const svgH = DAYS * (CELL + GAP) + 16;

  function cellColor(count) {
    if (count === 0) return T.border;
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return 'rgba(245,158,11,0.25)';
    if (intensity < 0.5)  return 'rgba(245,158,11,0.50)';
    if (intensity < 0.75) return 'rgba(245,158,11,0.75)';
    return 'rgba(245,158,11,1.0)';
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <svg width={svgW} height={svgH} style={{ display: 'block' }}>
        {/* Day labels */}
        {DAY_LABELS.map((label, row) => label ? (
          <text key={row} x={0} y={row * (CELL + GAP) + CELL - 1}
            fontSize={8} fill={T.textFaint} dominantBaseline="auto">{label}</text>
        ) : null)}
        {/* Cells */}
        {columns.map((week, col) =>
          week.map((cell, row) => (
            <rect
              key={cell.key}
              x={20 + col * (CELL + GAP)}
              y={row * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={cellColor(cell.count)}
              opacity={cell.count === 0 ? 0.4 : 1}
            >
              <title>{cell.key}: {cell.count} sesi</title>
            </rect>
          ))
        )}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, alignItems: 'center', marginTop: 4, fontSize: 9, color: T.textFaint }}>
        <span>Sedikit</span>
        {[0.25, 0.5, 0.75, 1.0].map((v, i) => (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: `rgba(245,158,11,${v})` }} />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  );
}
