// ─── OptionButton.jsx ────────────────────────────────────────────────────────
// Quiz option button. Phase 6: 0 inline styles.
// ─────────────────────────────────────────────────────────────────────────────

import s from './OptionButton.module.css';

export default function OptionButton({ idx, text, selected, isCorrect, onSelect, subText }) {
  const answered  = selected !== null;
  const isSelected = selected === idx;

  // Three visual states: correct · wrong · dim (answered but neither)
  const btnState  = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : 'dim';
  const badgeState = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : null;
  const badgeText  = answered && isCorrect ? '✓' : answered && isSelected ? '✗' : idx + 1;

  return (
    <button
      className={s.btn}
      data-state={btnState}
      onClick={() => !answered && onSelect(idx)}
      disabled={answered}
    >
      <span className={s.badge} data-state={badgeState}>
        {badgeText}
      </span>
      <span className={s.text}>
        {text}
        {subText && <span className={s.sub}>{subText}</span>}
      </span>
    </button>
  );
}
