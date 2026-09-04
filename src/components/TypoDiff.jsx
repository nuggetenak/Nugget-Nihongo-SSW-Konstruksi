// ─── TypoDiff.jsx ────────────────────────────────────────────────────────────
// Item 60 (2026-08-26): renders diffChars()'s output with visual highlighting
// -- the actual typo lesson, not just the raw operation list. Kept separate
// from typo-diff.js's algorithm so the alignment logic stays testable without
// rendering anything.
import { T } from '../styles/theme.js';

export default function TypoDiff({ ops }) {
  return (
    <span style={{ fontFamily: 'inherit' }}>
      {ops.map((o, i) => {
        if (o.op === 'match') {
          return <span key={i}>{o.char}</span>;
        }
        if (o.op === 'sub') {
          return (
            <span key={i} style={{ color: T.wrong, textDecoration: 'underline', fontWeight: 700 }}>
              {o.to}
            </span>
          );
        }
        if (o.op === 'ins') {
          // A letter the answer has that the input was missing.
          return (
            <span key={i} style={{ color: T.wrong, fontWeight: 700 }}>
              {o.char}
            </span>
          );
        }
        // 'del' ops (extra letters the user typed) are intentionally not
        // rendered here -- this component renders the *answer* string with
        // the discrepancy highlighted, not the user's raw input. The
        // caller still shows "Kamu: {input}" separately, unchanged.
        return null;
      })}
    </span>
  );
}
