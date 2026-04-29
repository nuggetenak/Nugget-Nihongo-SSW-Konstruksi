// ─── components/BelajarTab.jsx ────────────────────────────────────────────────
// "Belajar" tab — all modes in sections. Phase 6: 0 inline styles.
// ─────────────────────────────────────────────────────────────────────────────

import s from './BelajarTab.module.css';
import { MODE_META, MODE_SECTIONS } from '../router/modes.js';

function SectionHeader({ title, subtitle }) {
  return (
    <div className={s.sectionHeader}>
      <div className={s.sectionTitle}>{title}</div>
      <div className={s.sectionSub}>{subtitle}</div>
    </div>
  );
}

function ModeCard({ modeKey, onSelect, badge = 0 }) {
  const m = MODE_META[modeKey];
  if (!m) return null;
  return (
    <button
      className={s.modeCard}
      data-badged={badge > 0}
      onClick={() => onSelect(modeKey)}
    >
      {badge > 0 && (
        <span className={s.cardBadge}>{badge > 99 ? '99+' : badge}</span>
      )}
      <span className={s.cardIcon}>{m.icon}</span>
      <div>
        <div className={s.cardLabel}>{m.label}</div>
        <div className={s.cardDesc}>{m.desc}</div>
      </div>
    </button>
  );
}

export default function BelajarTab({ onSelect, badges = {} }) {
  return (
    <div className={s.container}>
      <div className={s.pageTitle}>Belajar</div>

      {Object.entries(MODE_SECTIONS).map(([key, section]) => (
        <div key={key}>
          <SectionHeader title={section.title} subtitle={section.subtitle} />
          <div className={`${s.grid} ${section.modes.length === 1 ? s.gridSingle : s.gridDouble}`}>
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
