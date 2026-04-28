import { T } from '../styles/theme.js';

export default function ProgressBar({ current, total, color = T.amber, height = 4 }) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div style={{ height, background: T.surface, borderRadius: T.r.pill, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: T.r.pill,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: pct > 0 ? `0 0 8px ${color}40` : 'none',
        }}
      />
    </div>
  );
}
