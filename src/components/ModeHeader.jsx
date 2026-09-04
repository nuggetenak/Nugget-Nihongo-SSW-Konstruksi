// ─── ModeHeader.jsx ───────────────────────────────────────────────────────
// The one header every mode screen gets: back control, breadcrumb trail when
// there's mode-to-mode history, and the mode's identity as the page's <h1>.
//
// Replaces ModeRouter's old inline breadcrumb block, which only rendered when
// modeHistory had entries — absent on the common path (entering a mode from a
// tab, which is most entries) — and had no page-title role at all.
// UI_UX_PLAN.md item 11 (also resolves most of item 35's "no <h1> on any mode
// screen" finding as a side effect).
//
// Every ancestor in the trail is a real, working button — not just the
// immediate parent — via AppContext's goBack(targetMode), which truncates
// history to jump directly to any point in the (max-3) stack. On compact
// screens (<700px) everything but the immediate parent collapses out of the
// DOM's visible flow via CSS (.earlier), matching this app's established
// "no JS width listener, let CSS own the breakpoint" convention.
//
// ── The back control (2026-09-04) ────────────────────────────────────────
// It lives here now. Every one of the 21 modes used to render its own
// `← Kembali` immediately below this header, and 20 of them then rendered their
// own <h2> page title under that — repeating the label this header had already
// shown, one line further down. Screenshots of every mode at 390px made the cost
// obvious: three stacked rows of chrome (header, back button, duplicate title)
// before any actual content, on the screen size this app is built for.
//
// Consolidating also fixes the inconsistency underneath it. AppShell hides the
// bottom nav in mode chrome on phones, so a mode's own back button was the only
// way out — and it was placed, labelled and sized per mode: a circular icon
// button in FlashcardMode, `← Keluar` in ReviewMode, `← Kembali` in the other
// 25 places, some sticky, most scrolling away with the content. One control, in
// the sticky header, always reachable.
//
// It calls goBack rather than exitMode: goBack pops one level of mode-to-mode
// history if there is any and falls through to exitMode when there isn't, which
// is what a single back affordance should do. Modes still own their INTERNAL
// back controls (leaving a quiz for its own setup screen, closing a source
// detail) — those navigate within the mode and are a different action.
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
  // With history, back goes up one level; without it, back leaves the mode area
  // entirely. goBack already does both — the label just has to say which.
  const backLabel = hasTrail
    ? `Kembali ke ${MODE_META[immediateParent]?.label ?? 'sebelumnya'}`
    : 'Kembali ke menu';

  return (
    <header className={S.header}>
      <div className={S.bar}>
        <button type="button" className={S.backBtn} onClick={() => onBack()} aria-label={backLabel}>
          <span aria-hidden="true">←</span>
        </button>
        <div className={S.identity}>
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
            <Icon name={meta.ui} size={20} className={S.titleIcon} />
            <span className={S.titleText}>{meta.label}</span>
          </h1>
        </div>
      </div>
    </header>
  );
}
