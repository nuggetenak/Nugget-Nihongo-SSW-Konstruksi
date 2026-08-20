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

import { useEffect } from 'react';
import BottomNav from './BottomNav.jsx';
import SideNav from './SideNav.jsx';
import OfflineBanner from './OfflineBanner.jsx';
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

  // Toast's stack renders outside .shell (ToastProvider wraps everything in
  // main.jsx), so a custom property set on .shell can't cascade to it — they're
  // siblings, not ancestor/descendant. Mirror the signal onto <html> instead,
  // the one true shared ancestor, matching the existing applyTheme() pattern
  // in styles/theme.js of writing custom properties directly from JS rather
  // than inventing a second mechanism. Only the boolean travels through JS;
  // the desktop breakpoint override stays in CSS (global.css), so this needs
  // no resize listener — consistent with this file's own header comment that
  // nav placement is decided by media query, not JS width detection.
  useEffect(() => {
    document.documentElement.dataset.bottomNavChrome = String(showBottomNav);
    return () => {
      delete document.documentElement.dataset.bottomNavChrome;
    };
  }, [showBottomNav]);

  return (
    <div className={s.shell} data-chrome={chrome}>
      <OfflineBanner />

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
