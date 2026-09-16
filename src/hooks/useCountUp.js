// ─── useCountUp.js ────────────────────────────────────────────────────────────
// A number that climbs to its value instead of simply being it.
//
// ── item 159 ─────────────────────────────────────────────────────────────────
// A score that LANDS is a result. A score that CLIMBS is a small event -- and
// this app is about progress measured over months, so the three places a number
// carries weight (a quiz result, the stats tiles, the ring on Saya) are worth
// the two hundred milliseconds. Everywhere else a number is just a number and
// should not move at all; this is a hook rather than a wrapper component so
// reaching for it stays a decision.
//
// WHY IT IS JS AND NOT CSS. There is no way to interpolate the TEXT of an
// element in CSS -- `@property` can animate a custom property through a counter,
// but only into generated content, which is unreadable to assistive tech and
// unselectable. So this is a requestAnimationFrame loop, which means the CSS
// reduced-motion catch-all cannot reach it and it has to ask motionAllows
// itself. That is the exact rule DESIGN_SPEC §4 states and a11y-polish's source
// sweep enforces.
import { useState, useEffect, useRef } from 'react';
import { motionAllows, scaled, T } from '../utils/motion.js';

/**
 * @param {number} value      the number to reach
 * @param {number} [duration] milliseconds; scaled by the reader's speed setting
 * @returns {number} the value to render this frame
 *
 * Counts from whatever was last displayed, so a value that changes mid-flight
 * continues from where the eye already is rather than snapping back to zero.
 * On first mount it counts from zero, which is the case that makes a result
 * screen feel like an arrival.
 *
 * When `count` motion is off it returns `value` synchronously, on the first
 * render, with no frame in between -- a reader who asked for less motion must
 * never see a 0 that then becomes something else.
 */
export function useCountUp(value, duration = T.count) {
  const target = Number.isFinite(value) ? value : 0;
  const allowed = motionAllows('count');
  const [display, setDisplay] = useState(allowed ? 0 : target);
  const fromRef = useRef(allowed ? 0 : target);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!allowed) {
      fromRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = fromRef.current;
    if (from === target) return undefined;

    const ms = Math.max(1, scaled(duration));
    // The clock is the FIRST FRAME'S OWN timestamp, not performance.now().
    //
    // Those are not guaranteed to share a time origin, and where they do not,
    // `now - started` is a large number of the wrong sign -- which the ease
    // below turns into a value nowhere near the range being counted across.
    // Caught by the overshoot test, which saw -174221 on its way to 50. A real
    // browser happens to agree on the origin; depending on that is how you get
    // a bug that only exists somewhere you were not looking.
    //
    // Clamped at both ends for the same reason: a frame that arrives with a
    // timestamp before the one that scheduled it must produce the start value,
    // never a negative fraction of the distance.
    let started = null;
    const step = (now) => {
      if (started === null) started = now;
      const t = Math.min(1, Math.max(0, (now - started) / ms));
      // Ease-out cubic: fast at first, settling at the end. A linear count
      // reads as a machine ticking; this reads as a number arriving.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (target - from) * eased);
      fromRef.current = next;
      setDisplay(next);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, allowed]);

  return display;
}
