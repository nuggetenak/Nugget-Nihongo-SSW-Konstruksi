// ─── OptionButton.jsx ────────────────────────────────────────────────────────
// Quiz option button.
// Plays haptic feedback on answer reveal.
// ─────────────────────────────────────────────────────────────────────────────

import { haptic } from '../utils/haptic.js';
import s from './OptionButton.module.css';

export default function OptionButton({ idx, text, selected, isCorrect, onSelect, subText }) {
  const answered   = selected !== null;
  const isSelected = selected === idx;

  // Three visual states: correct · wrong · dim (answered but neither)
  const btnState   = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : 'dim';
  const badgeState = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : null;
  const badgeText  = answered && isCorrect ? '✓' : answered && isSelected ? '✗' : idx + 1;

  const handleClick = () => {
    if (answered) return;
    onSelect(idx);
    // Fire haptic on selection — actual correct/wrong state fires after parent re-renders
    // so we read isCorrect at the time of click (the option the user tapped)
    if (isCorrect) haptic.correct();
    else           haptic.wrong();
  };

  return (
    <button
      className={s.btn}
      data-state={btnState}
      onClick={handleClick}
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
