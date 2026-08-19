// ─── components/SideNav.jsx ──────────────────────────────────────────────────
// Wide-screen navigation. Renders only at >=1040px (AppShell decides); the
// bottom pill handles narrower screens.
//
// This is also the structural fix for the content-overlap bug: on wide screens
// nav occupies its own column instead of floating over a scroll area, so it
// cannot cover the last row of content.
// ─────────────────────────────────────────────────────────────────────────────

import Icon from './Icon.jsx';
import { CARDS } from '../data/cards.js';
import s from './SideNav.module.css';

const TABS = [
  { key: 'home', icon: 'home', label: 'Beranda' },
  { key: 'belajar', icon: 'belajar', label: 'Belajar' },
  { key: 'saya', icon: 'saya', label: 'Saya' },
];

export default function SideNav({ active, onChange, dueBadge = 0 }) {
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
                onClick={() => onChange(tab.key)}
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

      <div className={s.foot}>{CARDS.length.toLocaleString('id-ID')} kartu · siap offline</div>
    </nav>
  );
}
