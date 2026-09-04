// ─── HowToPlayCard.jsx ─────────────────────────────────────────────────────
// item 20: ProductionMode and QuizProduksiMode each hand-rolled an identical
// "💡 Cara main" card -- same structure, own copy of the keyboard-shortcut
// line. Generalized into one component; the keyboard line is now hidden on
// touch devices (CSS media query, not JS -- see .kbLine in this file's
// module.css) instead of always shown regardless of whether the reader has
// a keyboard to use it with.
import S from '../modes/modes.module.css';
import H from './HowToPlayCard.module.css';

export default function HowToPlayCard({ explanation, keyboardHint }) {
  return (
    <div className={S.card} style={{ marginBottom: 24, fontSize: 'var(--fs-caption)' }}>
      <div className={H.title}>💡 Cara main</div>
      <div className={H.explanation}>{explanation}</div>
      {keyboardHint && <div className={H.kbLine}>{keyboardHint}</div>}
    </div>
  );
}
