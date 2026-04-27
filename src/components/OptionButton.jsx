import { T } from "../styles/theme.js";

/**
 * Quiz option button with number badge and correct/wrong feedback.
 * @param {number}  idx       - Option index (0-3)
 * @param {string}  text      - Option text to display
 * @param {*}       selected  - Currently selected index (null = none)
 * @param {boolean} isCorrect - Whether THIS option is the correct answer
 * @param {Function} onSelect - Called with idx when clicked
 * @param {string}  [subText] - Secondary text below main (e.g., Indonesian translation)
 */
export default function OptionButton({ idx, text, selected, isCorrect, onSelect, subText }) {
  const answered = selected !== null;
  const isSelected = selected === idx;

  let bg = T.surface;
  let border = T.borderLight;
  let badgeBg = "rgba(245,158,11,0.08)";

  if (answered && isCorrect) {
    bg = T.correctBg;
    border = T.correctBorder;
    badgeBg = T.correctBg;
  } else if (answered && isSelected && !isCorrect) {
    bg = T.wrongBg;
    border = T.wrongBorder;
    badgeBg = T.wrongBg;
  }

  return (
    <button
      onClick={() => !answered && onSelect(idx)}
      disabled={answered}
      style={{
        width: "100%",
        padding: "12px 14px",
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: T.fontJP,
        borderRadius: T.r.md,
        background: bg,
        border: `1px solid ${border}`,
        color: T.text,
        cursor: answered ? "default" : "pointer",
        textAlign: "left",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        transition: "all 0.15s",
        opacity: answered && !isCorrect && !isSelected ? 0.45 : 1,
      }}
    >
      <span style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: badgeBg,
        border: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, marginTop: 1,
        color: answered && isCorrect ? T.correct : answered && isSelected ? T.wrong : T.textMuted,
      }}>
        {answered ? (isCorrect ? "✓" : isSelected ? "✗" : idx + 1) : idx + 1}
      </span>
      <span style={{ flex: 1 }}>
        {text}
        {subText && <span style={{ display: "block", fontSize: 11, color: T.textMuted, marginTop: 2 }}>{subText}</span>}
      </span>
    </button>
  );
}
