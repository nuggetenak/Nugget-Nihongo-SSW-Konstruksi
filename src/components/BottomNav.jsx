import s from './BottomNav.module.css';

const TABS = [
  { key: 'home',    icon: '🏠', label: 'Beranda' },
  { key: 'belajar', icon: '📖', label: 'Belajar'  },
  { key: 'saya',    icon: '👤', label: 'Saya'     },
];

export default function BottomNav({ active, onChange, dueBadge = 0 }) {
  return (
    <nav className={s.nav}>
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
              {isActive && <div className={s.activePill} />}
              {badge > 0 && (
                <span className={s.badge}>{badge > 99 ? '99+' : badge}</span>
              )}
              <span className={s.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { TABS };
