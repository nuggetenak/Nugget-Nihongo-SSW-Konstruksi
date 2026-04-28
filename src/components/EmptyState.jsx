// ─── EmptyState.jsx ───────────────────────────────────────────────────────────
// Reusable empty / zero-state component with CTA button
// ─────────────────────────────────────────────────────────────────────────────

import { T } from '../styles/theme.js';

export default function EmptyState({ icon = '📭', title, desc, ctaLabel, onCta, style = {} }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease',
        ...style,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 14, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: T.text }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: onCta ? 20 : 0 }}>{desc}</div>}
      {onCta && (
        <button
          onClick={onCta}
          style={{ fontFamily: 'inherit', padding: '11px 24px', fontSize: 13, fontWeight: 700, borderRadius: T.r.md, background: T.accent, border: 'none', color: T.textBright, cursor: 'pointer', boxShadow: T.shadow.glow }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
