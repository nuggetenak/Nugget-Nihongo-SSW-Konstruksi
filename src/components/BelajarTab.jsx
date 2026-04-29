// ─── components/BelajarTab.jsx ────────────────────────────────────────────────
// "Belajar" tab: all study modes in one scrollable page, grouped by intent.
// Replaces the 3-tab (Belajar / Ujian / Lainnya) structure.
// ─────────────────────────────────────────────────────────────────────────────

import { T } from '../styles/theme.js';
import { MODE_META, MODE_SECTIONS } from '../router/modes.js';

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ padding: '20px 0 10px' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{title}</div>
      <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>{subtitle}</div>
    </div>
  );
}

function ModeCard({ modeKey, onSelect, badge = 0 }) {
  const m = MODE_META[modeKey];
  if (!m) return null;
  return (
    <button
      onClick={() => onSelect(modeKey)}
      style={{
        fontFamily: 'inherit',
        padding: '16px 14px',
        borderRadius: T.r.lg,
        cursor: 'pointer',
        background: T.surface,
        border: `1px solid ${badge > 0 ? T.borderLight : T.border}`,
        color: T.text,
        textAlign: 'left',
        position: 'relative',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {badge > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 9,
            fontWeight: 800,
            minWidth: 16,
            height: 16,
            padding: '0 4px',
            borderRadius: T.r.pill,
            background: T.amber,
            color: T.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span style={{ fontSize: 22, lineHeight: 1 }}>{m.icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
        <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.3 }}>{m.desc}</div>
      </div>
    </button>
  );
}

export default function BelajarTab({ onSelect, badges = {} }) {
  const sections = Object.entries(MODE_SECTIONS);

  return (
    <div
      style={{
        padding: '0 16px 24px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Page title */}
      <div style={{ padding: '16px 0 4px' }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            background: T.accent,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Belajar
        </span>
      </div>

      {sections.map(([sectionKey, section]) => (
        <div key={sectionKey}>
          <SectionHeader title={section.title} subtitle={section.subtitle} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: section.modes.length === 1 ? '1fr' : '1fr 1fr',
              gap: 10,
            }}
          >
            {section.modes.map((modeKey) => (
              <ModeCard
                key={modeKey}
                modeKey={modeKey}
                onSelect={onSelect}
                badge={badges[modeKey] ?? 0}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
