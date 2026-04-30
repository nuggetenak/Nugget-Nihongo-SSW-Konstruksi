// ─── EmptyState.jsx ───────────────────────────────────────────────────────────
import S from './EmptyState.module.css';

export default function EmptyState({ icon = '📭', title, desc, ctaLabel, onCta, style = {} }) {
  return (
    <div className={S.wrap} style={style}>
      <div className={S.icon}>{icon}</div>
      <div className={S.title}>{title}</div>
      {desc && (
        <div className={`${S.desc}${onCta ? '' : ' ' + S.descNoBtn}`}>{desc}</div>
      )}
      {onCta && (
        <button className={S.cta} onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
