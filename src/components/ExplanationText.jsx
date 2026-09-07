// ─── components/ExplanationText.jsx ──────────────────────────────────────────
// Item 100. Both results screens truncated their explanation to a fixed number
// of characters and appended an ellipsis, with nothing behind it — SimulasiMode
// at 160, ResultScreen at 180, two hand-picked limits for the same job. On a
// 100-minute exam the review list *is* the payload, and the sentence that says
// why the right answer is right is exactly the part a cut at 160 tends to lose.
//
// The truncation itself is worth keeping: a wall of full explanations makes a
// 50-row list unscannable. What was missing was the way back to the rest of it.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { stripFuri } from '../utils/jp-helpers.js';
import { T } from '../styles/theme.js';

const TOGGLE_STYLE = {
  marginLeft: 'var(--space-6)',
  padding: 0,
  border: 'none',
  background: 'none',
  color: T.amber,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'underline',
};

export default function ExplanationText({ text, limit = 160, className }) {
  const [expanded, setExpanded] = useState(false);
  // stripFuri because these render as plain text, the same convention every
  // option button in the app uses — the 《》 markers would otherwise be visible.
  const clean = stripFuri(text ?? '');
  if (!clean) return null;

  const isLong = clean.length > limit;
  const shown = !isLong || expanded ? clean : `${clean.slice(0, limit).trimEnd()}…`;

  return (
    <div className={className}>
      💡 {shown}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={TOGGLE_STYLE}
        >
          {expanded ? 'Ringkas' : 'Selengkapnya'}
        </button>
      )}
    </div>
  );
}
