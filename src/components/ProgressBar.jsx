import { T } from "../styles/theme.js";

export default function ProgressBar({ current, total, color = T.amber }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ height: 4, background: T.surface, borderRadius: T.r.pill, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: T.r.pill, transition: "width 0.3s ease" }} />
    </div>
  );
}
