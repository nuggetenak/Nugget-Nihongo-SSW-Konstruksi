// ─── components/SideNav.jsx ──────────────────────────────────────────────────
// Wide-screen navigation. Renders only at >=1040px (AppShell decides); the
// bottom pill handles narrower screens.
//
// This is also the structural fix for the content-overlap bug: on wide screens
// nav occupies its own column instead of floating over a scroll area, so it
// cannot cover the last row of content.
//
// Below the 3 top-level tabs, the full mode registry (item 13, 2026-08-20):
// on a desktop-width screen every mode used to require a trip to the Belajar
// tab. MODE_SECTIONS already groups all 19 modes (Pelajari/Latihan/Ujian/
// Ulasan/Alat) — this just renders that existing registry instead of adding
// a new mapping. Native <details>/<summary> for collapse, not custom JS —
// correct keyboard and AT semantics for free, and the active mode's own
// section auto-opens (see activeSectionKey below) so arriving at a mode via
// deep-link or the mode header's own trail doesn't leave the side nav
// looking like it doesn't know where you are.
// ─────────────────────────────────────────────────────────────────────────────

import { flushSync } from 'react-dom';
import { withViewTransition } from '../utils/motion.js';
import Icon from './Icon.jsx';
import { TOTAL_CARDS } from '../utils/constants.js';
import { MODE_SECTIONS, MODE_META } from '../router/modes.js';
import { formatCount } from '../utils/format.js';
import s from './SideNav.module.css';

const TABS = [
  { key: 'home', icon: 'home', label: 'Beranda' },
  { key: 'belajar', icon: 'belajar', label: 'Belajar' },
  { key: 'saya', icon: 'saya', label: 'Saya' },
];

// Which MODE_SECTIONS group contains the currently active mode, if any —
// used to auto-expand that one section rather than showing all 5 collapsed
// (or all 19 modes flat) regardless of where the user actually is.
function activeSectionKey(mode) {
  if (!mode) return null;
  for (const [key, section] of Object.entries(MODE_SECTIONS)) {
    if (section.modes.includes(mode)) return key;
  }
  return null;
}

export default function SideNav({ active, onChange, dueBadge = 0, mode, onSelectMode }) {
  const openSection = activeSectionKey(mode);

  // Both navs are always mounted and CSS picks which is visible, so these are
  // the same navigations BottomNav performs -- and until now only BottomNav
  // wrapped them. A tab switch crossfaded on a phone and hard-cut on a desktop,
  // for no reason anyone had decided. Same helper, same reduced-motion check.
  const goTab = (key) => withViewTransition(() => onChange(key), flushSync);
  const goMode = (m) => withViewTransition(() => onSelectMode(m), flushSync);

  return (
    <nav className={s.side} aria-label="Navigasi utama">
      <div className={s.brand}>
        <div className={s.brandName}>SSW Konstruksi</div>
        <div className={s.brandSub}>by Nugget Nihongo</div>
      </div>

      <ul className={s.list}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const badge = tab.key === 'belajar' && dueBadge > 0 ? dueBadge : 0;
          return (
            <li key={tab.key}>
              <button
                className={s.item}
                data-active={isActive}
                onClick={() => goTab(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${tab.label}${badge > 0 ? `, ${badge} notifikasi` : ''}`}
              >
                <Icon name={tab.icon} size={19} />
                <span className={s.itemLabel}>{tab.label}</span>
                {badge > 0 && <span className={s.badge}>{badge > 99 ? '99+' : badge}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {onSelectMode && (
        <div className={s.modeSections}>
          {Object.entries(MODE_SECTIONS).map(([key, section]) => (
            <details key={key} className={s.sectionGroup} open={openSection === key}>
              <summary className={s.sectionSummary}>{section.title}</summary>
              <ul className={s.modeList}>
                {section.modes.map((m, i) => {
                  const meta = MODE_META[m];
                  if (!meta) return null;
                  const isActive = mode === m;
                  return (
                    <li key={m}>
                      <button
                        type="button"
                        // Staggered because this list APPEARS: <details> opens
                        // one section at a time, so the rows arriving in order
                        // is the answer to "what just happened" (item 166).
                        className={`${s.modeItem} stagger-item`}
                        style={{ '--stagger-i': i }}
                        data-active={isActive}
                        onClick={() => goMode(m)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon name={meta.ui} size={16} />
                        <span className={s.modeItemLabel}>{meta.short ?? meta.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      )}

      <div className={s.foot}>{formatCount(TOTAL_CARDS)} kartu · konten siap offline</div>
    </nav>
  );
}
