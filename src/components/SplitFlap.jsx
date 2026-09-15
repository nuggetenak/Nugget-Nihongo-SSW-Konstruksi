// ─── SplitFlap.jsx ───────────────────────────────────────────────────────────
// A number that arrives the way a station board does: one digit per hinge,
// flipping into place a beat apart.
//
// ── item 158 ─────────────────────────────────────────────────────────────────
// The days-remaining count is the first number a reader sees on the dashboard
// and the one with emotional weight -- "23 hari lagi menuju ujian" is the whole
// reason the hazard rail above it exists. It appeared as plain text.
//
// A departure board is the right register for it: industrial, mechanical, about
// a deadline you do not control. It is also the app's own register --
// DESIGN_SPEC §1's construction-site language, the same place the hazard stripe
// comes from -- so this is not a flourish borrowed from somewhere else.
//
// WHAT IT ACTUALLY ANIMATES, honestly: a countdown changes once a day, and
// almost nobody has the dashboard open at midnight. So the flip a reader will
// really see is the ENTRANCE, every time they open the app. That is what this
// is tuned for, and the per-digit delay is what makes it read as a board
// settling rather than as text appearing.
//
// rotateX on a hinge, so it is transform-only and costs a weak GPU nothing.
import { useState, useEffect, useRef } from 'react';
import { motionAllows } from '../utils/motion.js';
import S from './SplitFlap.module.css';

/**
 * @param {number|string} value  what to display; split into characters
 * @param {string} [className]   applied to the wrapper
 *
 * The rendered characters are the accessible content: no aria-hidden, no
 * duplicate live region. A screen reader reads "23" from the DOM exactly as it
 * would from plain text, because that is all this is -- the hinge is CSS.
 */
export default function SplitFlap({ value, className }) {
  const chars = String(value).split('');
  // `flipKey` changes whenever the value does, which re-keys every digit and so
  // restarts the animation. Keying on the VALUE itself would leave a digit that
  // did not change (the '2' in 23 -> 22) sitting still while its neighbour
  // flipped, which is what a real board does and reads as a glitch on a screen.
  const [flipKey, setFlipKey] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setFlipKey((k) => k + 1);
  }, [value]);

  const animated = motionAllows('count');

  return (
    <span className={className ? `${S.board} ${className}` : S.board}>
      {chars.map((c, i) => (
        <span
          key={`${flipKey}-${i}`}
          className={S.flap}
          data-animated={animated}
          style={{ '--flap-i': i }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}
