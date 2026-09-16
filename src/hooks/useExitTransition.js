// ─── useExitTransition.js ─────────────────────────────────────────────────────
// Lets a component animate itself out before the thing that mounted it takes it
// away.
//
// Every overlay in this app entered and then VANISHED. Sheet's backdrop fades in
// and its body slides up; both disappear on the frame the caller stops rendering
// them. Toast has `toastIn` and nothing for the way out -- the matching
// `toastOut` keyframe was deleted in the 2026-09-04 consolidation as
// unreferenced, which meant it had never been wired, not that it had stopped
// being used. An entrance without an exit reads worse than neither: the thing
// arrives with weight and is then simply gone, which is the moment people
// describe as the app "jumping".
//
// WHY THIS SHAPE and not a `mounted` flag. Sheet and Toast are both unmounted by
// their PARENT -- the provider drops the toast from its array, the caller stops
// rendering the sheet -- so the child cannot keep itself alive. What it can do
// is delay telling the parent. `requestClose()` starts the exit and forwards the
// real close when the animation is done, so no caller changes at all.
//
// WHY NOT `transitionend`. There is no transitionend or animationend listener
// anywhere in this codebase; every "wait, then advance" is already a setTimeout
// (fourteen of them). A hook keyed to the same --t-* scale matches what the app
// does -- and, deciding it, transitionend never fires under jsdom, so an exit
// built on it could not be tested.
import { useState, useRef, useEffect, useCallback } from 'react';
import { motionAllows, T } from '../utils/motion.js';

/**
 * @param {Function} onClose  what to call once the exit has played
 * @param {number}   ms       exit duration; defaults to the --t-fast rung
 * @returns {{ closing: boolean, requestClose: Function }}
 *
 * Hang `data-closing={closing}` on the element and let CSS own the animation.
 *
 * When motion is off -- the OS asking for reduced motion, or Gerakan at Mati or
 * Hemat -- `onClose` fires synchronously and `closing` never goes true. That is
 * deliberate: the fallback for "no animation" must be the instant behaviour
 * these overlays already had, not a silent pause where an animation would be.
 */
export function useExitTransition(onClose, ms = T.fast) {
  const [closing, setClosing] = useState(false);
  const timer = useRef(null);
  const closed = useRef(false);

  /**
   * Start the exit; `onClose` follows when it has played.
   *
   * It takes no arguments deliberately, so it can be handed straight to an
   * onClick without a wrapper -- and so there is exactly one way out of any
   * component using it. A caller whose button means something more than
   * "close" does that something FIRST and then calls this; see ConfirmBody,
   * where the ordering is the whole point.
   */
  const requestClose = useCallback(() => {
    // Guarded, because a backdrop click and an Escape can both arrive inside
    // the exit window — and a second call would queue a second close, which
    // for ConfirmDialog means resolving the same promise twice.
    if (closed.current) return;
    closed.current = true;
    if (!motionAllows('entrance')) {
      onClose?.();
      return;
    }
    setClosing(true);
    timer.current = setTimeout(() => onClose?.(), ms);
  }, [onClose, ms]);

  // Unmounting mid-exit must not leave a timer holding a callback on a gone
  // component -- the same cleanup ReviewMode's advance timer needed.
  useEffect(() => () => clearTimeout(timer.current), []);

  return { closing, requestClose };
}
