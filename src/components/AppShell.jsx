// ─── components/AppShell.jsx ─────────────────────────────────────────────────
// Owns the responsive frame for EVERY screen — tabs and mode screens alike.
//
// Responsibilities:
//   1. Navigation placement. Bottom pill on phones/tablets, side column on wide
//      screens. CSS decides via media query — both are always mounted, so there
//      is no resize flash and no JS width listener.
//   2. Content width. Screens must not set their own max-width; if they do, they
//      render as a narrow column floating inside a wider shell.
//   3. Bottom safe space, so a fixed bottom nav can never cover the last row.
//
// `chrome` controls which navigation is offered:
//   'tabs' — the three top-level tabs. Both navs available.
//   'mode' — an active study mode. The mode supplies its own back affordance,
//            so the bottom pill is suppressed on small screens (it would
//            compete with the mode's own controls and steal vertical space).
//            The side column stays on wide screens, where there is room for it
//            and losing all navigation would be disorienting.
// ─────────────────────────────────────────────────────────────────────────────

import BottomNav from './BottomNav.jsx';
import SideNav from './SideNav.jsx';
import s from './AppShell.module.css';

export default function AppShell({
  tab,
  onTabChange,
  dueBadge = 0,
  chrome = 'tabs',
  width = 'default',
  children,
}) {
  const showBottomNav = chrome === 'tabs';

  return (
    <div className={s.shell} data-chrome={chrome}>
      <div className={s.sideSlot}>
        <SideNav active={tab} onChange={onTabChange} dueBadge={dueBadge} />
      </div>

      <div className={s.contentCol}>
        <div className={s.content} data-width={width} data-nav-safe={showBottomNav}>
          {children}
        </div>
      </div>

      {showBottomNav && (
        <div className={s.bottomSlot}>
          <BottomNav active={tab} onChange={onTabChange} dueBadge={dueBadge} />
        </div>
      )}
    </div>
  );
}
