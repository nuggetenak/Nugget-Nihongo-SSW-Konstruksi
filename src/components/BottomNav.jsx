// ─── BottomNav.jsx ──────────────────────────────────────────────────────────
import { prefersReducedMotion } from '../utils/motion.js';
import Icon from './Icon.jsx';
import s from './BottomNav.module.css';

// Icons come from the shared Icon component so nav art stays in step with the
// rest of the UI (and picks up generated assets automatically).
const TABS = [
  { key: 'home', icon: 'home', label: 'Beranda' },
  { key: 'belajar', icon: 'belajar', label: 'Belajar' },
  { key: 'saya', icon: 'saya', label: 'Saya' },
];

export default function BottomNav({ active, onChange, dueBadge = 0 }) {
  // View Transitions API — crossfade between tabs (progressive enhancement).
  // item 21: this is JS-invoked, not a CSS animation/transition property, so
  // global.css's prefers-reduced-motion catch-all can't reach it — needs its
  // own check, same as the plan warns any JS-driven motion will. The check
  // moved to utils/motion.js when GlossaryMode turned out to need it too
  // (item 137), so there is one of it rather than one per site.
  const handleTabChange = (newTab) => {
    if (document.startViewTransition && !prefersReducedMotion()) {
      document.startViewTransition(() => onChange(newTab));
    } else {
      onChange(newTab);
    }
  };
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
              onClick={() => handleTabChange(tab.key)}
              aria-label={`${tab.label}${badge > 0 ? `, ${badge} notifikasi` : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={s.iconWrap}>
                {badge > 0 && (
                  <span className={s.badge} aria-label={`${badge} ulasan`}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
                <Icon name={tab.icon} size={20} />
              </span>
              <span className={s.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
