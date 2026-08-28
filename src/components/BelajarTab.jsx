// ─── BelajarTab.jsx ─────────────────────────────────────────────────────────
// Featured-first layout: first mode in each section = large horizontal card,
// remaining modes = compact 2-col grid. Color-coded per section.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Icon from './Icon.jsx';
import s from './BelajarTab.module.css';
import { MODE_META, MODE_SECTIONS } from '../router/modes.js';

// ── Unified amber palette for all sections ────────────────────────────────────
const SECTION_META = {
  pelajari: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  latihan: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  ujian: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  ulasan: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.18)' },
  alat: {
    color: 'var(--ssw-textDim)',
    bg: 'rgba(245,158,11,0.05)',
    border: 'rgba(245,158,11,0.10)',
  },
};

// Section header doubles as the accordion toggle when there's a secondary
// (compact-grid) group to collapse. The featured card underneath always
// stays visible regardless -- collapsing hides only the secondary items,
// never the primary/most-used mode in a section. Chevron sits in a round
// "bubble" rather than floating bare, per direct feedback that a plain
// glyph didn't read as tappable.
function SectionHeader({ sectionKey, title, expanded, onToggle, collapsible }) {
  const sm = SECTION_META[sectionKey] || SECTION_META.alat;
  // Strip emoji, variation selectors, and leading spaces
  const clean = title
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\uFE0F\uFE0E\u200D\s]+/gu, ' ') // eslint-disable-line no-misleading-character-class
    .trim();
  const Tag = collapsible ? 'button' : 'div';
  return (
    <Tag
      className={s.sectionHeader}
      {...(collapsible ? { type: 'button', onClick: onToggle, 'aria-expanded': expanded } : {})}
    >
      <span className={s.sectionDot} style={{ background: sm.color }} />
      <span className={s.sectionLabel}>{clean.toUpperCase()}</span>
      <span className={s.sectionLine} />
      {collapsible && (
        <span className={s.sectionToggle} data-expanded={expanded} aria-hidden="true">
          ⌄
        </span>
      )}
    </Tag>
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
        <Icon name={m.ui} size={24} />
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
      <span className={s.featuredArrow} style={{ color: sm.color }}>
        ›
      </span>
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
      <span className={s.compactIcon} style={{ background: sm.bg }}>
        <Icon name={m.ui} size={20} />
      </span>
      <div className={s.compactLabel}>{m.label}</div>
      <div className={s.compactDesc}>{m.desc}</div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BelajarTab({ onSelect, badges = {} }) {
  // Collapsed by default -- the featured card (most-used mode per section)
  // stays visible either way, so this only hides secondary items, cutting
  // the tab's default scroll length substantially (LATIHAN alone goes from
  // 8 always-visible secondary items to 0 until expanded). Local state, not
  // persisted -- resets on remount, same as any other in-session UI state
  // in this tab.
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const toggleSection = (key) =>
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className={s.container}>
      <h1 className={s.pageTitle}>Belajar</h1>

      {Object.entries(MODE_SECTIONS).map(([key, section]) => {
        const [featured, ...rest] = section.modes;
        const hasSecondary = rest.length > 0;
        const expanded = expandedSections.has(key);
        return (
          <div key={key} className={s.section}>
            <SectionHeader
              sectionKey={key}
              title={section.title}
              collapsible={hasSecondary}
              expanded={expanded}
              onToggle={() => toggleSection(key)}
            />

            <FeaturedCard
              modeKey={featured}
              sectionKey={key}
              onSelect={onSelect}
              badge={badges[featured] ?? 0}
            />

            {hasSecondary && (
              <div className={s.collapsible} data-expanded={expanded}>
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
