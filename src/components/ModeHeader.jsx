// ─── ModeHeader.jsx ───────────────────────────────────────────────────────
// Always-visible identity for the whatever mode is active (icon + <h1>),
// plus a breadcrumb trail when there's mode-to-mode navigation history.
//
// Replaces ModeRouter's old inline breadcrumb block, which only rendered
// when modeHistory had entries — absent on the common path (entering a mode
// from a tab, which is most entries), and had no page-title role at all.
// UI_UX_PLAN.md item 11 (also resolves most of item 35's "no <h1> on any
// mode screen" finding as a side effect).
//
// Every ancestor in the trail is a real, working button — not just the
// immediate parent — via AppContext's goBack(targetMode), which truncates
// history to jump directly to any point in the (max-3) stack. On compact
// screens (<700px) everything but the immediate parent collapses out of the
// DOM's visible flow via CSS (.earlier), matching this app's established
// "no JS width listener, let CSS own the breakpoint" convention.
import { MODE_META } from '../router/modes.js';
import Icon from './Icon.jsx';
import S from './ModeHeader.module.css';

function Crumb({ modeKey, onBack }) {
  const crumbMeta = MODE_META[modeKey];
  if (!crumbMeta) return null;
  return (
    <span className={S.crumb}>
      <button
        type="button"
        className={S.trailBtn}
        onClick={() => onBack(modeKey)}
        aria-label={`Kembali ke ${crumbMeta.label}`}
      >
        {crumbMeta.short ?? crumbMeta.label}
      </button>
      <span className={S.sep} aria-hidden="true">
        ›
      </span>
    </span>
  );
}

export default function ModeHeader({ mode, modeHistory, onBack }) {
  const meta = MODE_META[mode];
  if (!meta) return null;

  const hasTrail = modeHistory.length > 0;
  const immediateParent = hasTrail ? modeHistory[modeHistory.length - 1] : null;
  const earlierAncestors = hasTrail ? modeHistory.slice(0, -1) : [];

  return (
    <header className={S.header}>
      {hasTrail && (
        <nav aria-label="Jejak navigasi" className={S.trail}>
          {earlierAncestors.length > 0 && (
            <span className={S.earlier}>
              {earlierAncestors.map((m) => (
                <Crumb key={m} modeKey={m} onBack={onBack} />
              ))}
            </span>
          )}
          <Crumb modeKey={immediateParent} onBack={onBack} />
        </nav>
      )}
      <h1 className={S.title}>
        <Icon name={meta.ui} size={18} className={S.titleIcon} />
        <span>{meta.label}</span>
      </h1>
    </header>
  );
}
