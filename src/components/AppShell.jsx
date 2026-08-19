// ─── components/AppShell.jsx ─────────────────────────────────────────────────
// Owns the responsive frame around every tab.
//
// Two responsibilities, both previously missing:
//   1. Navigation placement. Bottom pill on phones/tablets, side column on
//      wide screens. CSS decides via media query — both are always mounted,
//      so there is no resize flash and no JS width listener.
//   2. Bottom safe space. The old layout applied nav padding inline in
//      App.jsx, which each mode screen then had to remember; several didn't,
//      which is why content sat under the nav. It lives here now, once.
// ─────────────────────────────────────────────────────────────────────────────

import BottomNav from './BottomNav.jsx';
import SideNav from './SideNav.jsx';
import s from './AppShell.module.css';

export default function AppShell({ tab, onTabChange, dueBadge = 0, children }) {
  return (
    <div className={s.shell}>
      <div className={s.sideSlot}>
        <SideNav active={tab} onChange={onTabChange} dueBadge={dueBadge} />
      </div>

      <div className={s.contentCol}>
        <div className={s.content}>{children}</div>
      </div>

      <div className={s.bottomSlot}>
        <BottomNav active={tab} onChange={onTabChange} dueBadge={dueBadge} />
      </div>
    </div>
  );
}
