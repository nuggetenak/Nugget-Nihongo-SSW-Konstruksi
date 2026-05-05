// ─── BelajarTab.jsx v3.0 — Full Overhaul ──────────────────────────────────────
// Featured-first layout: first mode in each section = large horizontal card,
// remaining modes = compact 2-col grid. Color-coded per section.
// ─────────────────────────────────────────────────────────────────────────────

import s from './BelajarTab.module.css';
import { MODE_META, MODE_SECTIONS } from '../router/modes.js';

// ── Unified amber palette for all sections ────────────────────────────────────
const SECTION_META = {
  pelajari: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  latihan:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  ujian:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  ulasan:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  alat:     { color: 'var(--ssw-textDim)', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.10)' },
};

function SectionHeader({ sectionKey, title }) {
  const sm = SECTION_META[sectionKey] || SECTION_META.alat;
  // Strip emoji, variation selectors, and leading spaces
  const clean = title
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\uFE0F\uFE0E\u200D\s]+/gu, ' ') // eslint-disable-line no-misleading-character-class
    .trim();
  return (
    <div className={s.sectionHeader}>
      <span className={s.sectionDot} style={{ background: sm.color }} />
      <span className={s.sectionLabel}>{clean.toUpperCase()}</span>
      <span className={s.sectionLine} />
    </div>
  );
}

// Large horizontal card — primary mode per section
function FeaturedCard({ modeKey, sectionKey, onSelect, badge = 0 }) {
  const m = MODE_META[modeKey];
  const sm = SECTION_META[sectionKey] || SECTION_META.alat;
  if (!m) return null;
  return (
    <button
      className={s.featuredCard}
      onClick={() => onSelect(modeKey)}
      data-badged={badge > 0}
      aria-label={`${m.label}: ${m.desc}`}
    >
      <span
        className={s.featuredIcon}
        style={{ background: sm.bg, border: `1px solid ${sm.border}` }}
      >
        {m.icon}
      </span>
      <div className={s.featuredBody}>
        <div className={s.featuredLabel}>{m.label}</div>
        <div className={s.featuredDesc}>{m.desc}</div>
      </div>
      {badge > 0 && (
        <span className={s.featuredBadge} style={{ background: sm.color }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span className={s.featuredArrow} style={{ color: sm.color }}>›</span>
    </button>
  );
}

// Small tile — secondary modes in 2-col grid
function CompactCard({ modeKey, sectionKey, onSelect, badge = 0 }) {
  const m = MODE_META[modeKey];
  const sm = SECTION_META[sectionKey] || SECTION_META.alat;
  if (!m) return null;
  return (
    <button
      className={s.compactCard}
      onClick={() => onSelect(modeKey)}
      data-badged={badge > 0}
      aria-label={`${m.label}: ${m.desc}`}
    >
      {badge > 0 && (
        <span className={s.cardBadge} style={{ background: sm.color }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span className={s.compactIcon} style={{ background: sm.bg }}>{m.icon}</span>
      <div className={s.compactLabel}>{m.label}</div>
      <div className={s.compactDesc}>{m.desc}</div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BelajarTab({ onSelect, badges = {} }) {
  return (
    <div className={s.container}>
      <div className={s.pageTitle}>Belajar</div>

      {Object.entries(MODE_SECTIONS).map(([key, section]) => {
        const [featured, ...rest] = section.modes;
        return (
          <div key={key} className={s.section}>
            <SectionHeader sectionKey={key} title={section.title} />

            <FeaturedCard
              modeKey={featured}
              sectionKey={key}
              onSelect={onSelect}
              badge={badges[featured] ?? 0}
            />

            {rest.length > 0 && (
              <div className={s.compactGrid}>
                {rest.map((modeKey) => (
                  <CompactCard
                    key={modeKey}
                    modeKey={modeKey}
                    sectionKey={key}
                    onSelect={onSelect}
                    badge={badges[modeKey] ?? 0}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
