// ─── OptionButton.jsx ────────────────────────────────────────────────────────
// Quiz option button.
// Plays haptic feedback on answer reveal.
//
// ── item 174 (2026-09-15) ───────────────────────────────────────────────────
// Four modes -- Angka, Danger, Confusion, Dengar -- hand-rolled this button in
// an inline style object, and each carried its own copy of the same three
// things: the correct/wrong/dim derivation, the flash/shake trigger, and the
// haptic call. Four copies of one behaviour is how the answer feedback ended up
// arriving differently depending which drill you were in, and it is the same
// drift DESIGN_SPEC items 21 and 50 already cleaned up once.
//
// They differed in exactly one thing that was not accidental -- how big the
// option text is -- so that is the one thing this takes as a prop. Everything
// else they disagreed about (radius 12 vs --r-lg, border 1.5px vs 2px, whether
// a number badge existed, whether a check mark appeared) was drift, not
// intent, and is gone.
import { haptic } from '../utils/haptic.js';
import s from './OptionButton.module.css';

/**
 * @param {'default'|'lg'|'numeric'} [variant]
 *   default — body text. Prose options: a definition, a phrase, a gloss.
 *   lg      — a step up, for Dengar. You read these WHILE audio is playing and
 *             looking away from the screen is the point of the exercise, so the
 *             options are deliberately larger there.
 *   numeric — tabular figures, for Angka. Its options are numerals, and
 *             proportional digits make two similar numbers harder to tell
 *             apart, which is the whole skill that drill trains.
 */
export default function OptionButton({
  idx,
  text,
  selected,
  isCorrect,
  onSelect,
  subText,
  variant = 'default',
}) {
  const answered = selected !== null;
  const isSelected = selected === idx;

  // Three visual states: correct · wrong · dim (answered but neither)
  const btnState = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : 'dim';
  const badgeState = !answered ? null : isCorrect ? 'correct' : isSelected ? 'wrong' : null;
  const badgeText = answered && isCorrect ? '✓' : answered && isSelected ? '✗' : idx + 1;

  const handleClick = () => {
    if (answered) return;
    onSelect(idx);
    // Fire haptic on selection — actual correct/wrong state fires after parent re-renders
    // so we read isCorrect at the time of click (the option the user tapped)
    if (isCorrect) haptic.correct();
    else haptic.wrong();
  };

  return (
    <button
      className={s.btn}
      data-state={btnState}
      data-variant={variant}
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
