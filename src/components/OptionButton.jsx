import { T } from '../styles/theme.js';

export default function OptionButton({ idx, text, selected, isCorrect, onSelect, subText }) {
  const answered = selected !== null;
  const isSelected = selected === idx;

  const getBg = () => {
    if (!answered) return T.surface;
    if (isCorrect) return T.correctBg;
    if (isSelected) return T.wrongBg;
    return T.surface;
  };
  const getBorder = () => {
    if (!answered) return T.borderLight;
    if (isCorrect) return T.correctBorder;
    if (isSelected) return T.wrongBorder;
    return T.border;
  };
  const getBadge = () => {
    if (answered && isCorrect) return { bg: T.correctBg, color: T.correct, text: '✓' };
    if (answered && isSelected) return { bg: T.wrongBg, color: T.wrong, text: '✗' };
    return { bg: 'rgba(245,158,11,0.06)', color: T.textDim, text: idx + 1 };
  };
  const badge = getBadge();

  return (
    <button
      onClick={() => !answered && onSelect(idx)}
      disabled={answered}
      style={{
        width: '100%',
        padding: '13px 14px',
        fontSize: 13,
        lineHeight: 1.55,
        fontFamily: T.fontJP,
        borderRadius: T.r.md,
        background: getBg(),
        border: `1.5px solid ${getBorder()}`,
        color: T.text,
        cursor: answered ? 'default' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        opacity: answered && !isCorrect && !isSelected ? 0.4 : 1,
        transform: answered && (isCorrect || isSelected) ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          flexShrink: 0,
          background: badge.bg,
          border: `1.5px solid ${getBorder()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          marginTop: 1,
          color: badge.color,
          transition: 'all 0.2s',
        }}
      >
        {badge.text}
      </span>
      <span style={{ flex: 1 }}>
        {text}
        {subText && (
          <span
            style={{
              display: 'block',
              fontSize: 11,
              color: T.textMuted,
              marginTop: 2,
              fontFamily: T.font,
            }}
          >
            {subText}
          </span>
        )}
      </span>
    </button>
  );
}
