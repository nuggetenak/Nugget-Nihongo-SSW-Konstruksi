// ─── BottomNav.jsx v2.0 — SVG icons, pill active state ────────────────────────
import s from './BottomNav.module.css';

// Inline SVG icons — clean, scalable, no emoji jank
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="12" y1="6" x2="16" y2="6"/>
    <line x1="12" y1="10" x2="16" y2="10"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const TABS = [
  { key: 'home',    Icon: HomeIcon, label: 'Beranda' },
  { key: 'belajar', Icon: BookIcon, label: 'Belajar'  },
  { key: 'saya',    Icon: UserIcon, label: 'Saya'     },
];

export default function BottomNav({ active, onChange, dueBadge = 0 }) {
  return (
    <nav className={s.nav} role="navigation" aria-label="Navigasi utama">
      <div className={s.inner}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const badge = tab.key === 'belajar' && dueBadge > 0 ? dueBadge : 0;
          return (
            <button
              key={tab.key}
              className={s.tab}
              data-active={isActive}
              onClick={() => onChange(tab.key)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={s.iconWrap}>
                {badge > 0 && (
                  <span className={s.badge} aria-label={`${badge} ulasan`}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
                <tab.Icon />
              </span>
              <span className={s.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { TABS };
