import { T } from '../styles/theme.js';

const TABS = [
  { key: 'home',   icon: '🏠', label: 'Beranda' },
  { key: 'belajar',icon: '📖', label: 'Belajar'  },
  { key: 'saya',   icon: '👤', label: 'Saya'     },
];

export default function BottomNav({ active, onChange, dueBadge = 0 }) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: T.navH,
        background: 'var(--ssw-navBg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', width: '100%', maxWidth: T.maxW }}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const badge = tab.key === 'belajar' && dueBadge > 0 ? dueBadge : 0;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '6px 0',
                fontFamily: 'inherit',
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? T.amber : T.textDim,
                transition: 'color 0.15s',
                position: 'relative',
              }}
            >
              {/* Active pill indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 3,
                    borderRadius: '0 0 4px 4px',
                    background: T.amber,
                    transition: 'width 0.2s ease',
                  }}
                />
              )}
              {/* Badge */}
              {badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: '22%',
                    fontSize: 9,
                    fontWeight: 800,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    background: T.amber,
                    color: T.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { TABS };
