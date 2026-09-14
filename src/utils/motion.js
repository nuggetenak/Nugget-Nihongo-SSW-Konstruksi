// ─── utils/motion.js ─────────────────────────────────────────────────────────
// Reduced-motion, for motion the CSS catch-all cannot reach.
//
// global.css carries a `prefers-reduced-motion: reduce` block that zeroes
// animations, transitions and `scroll-behavior`. It reaches everything declared
// in CSS and nothing driven from JS -- and an explicit `behavior: 'smooth'` in a
// scrollTo call is JS, overriding the CSS `scroll-behavior` the catch-all sets.
//
// DESIGN_SPEC §4 said BottomNav's View Transition "was the one instance". It was
// not: GlossaryMode had two scrollTo calls doing the same thing (item 137). One
// exported helper instead of two hand-rolled matchMedia calls, so the next
// JS-driven motion has somewhere obvious to reach for, and
// a11y-polish.test.js's source sweep can grep for the literal that bypasses it.
// ─────────────────────────────────────────────────────────────────────────────

/** True when the OS asks for reduced motion. Safe where matchMedia is absent. */
export function prefersReducedMotion() {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The `behavior` to hand scrollTo/scrollIntoView. Never write `'smooth'` as a
 * literal — that is the bug this exists for.
 */
export function scrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Run a navigation's state update inside a View Transition, so the browser
 * crossfades the old screen into the new one instead of hard-cutting.
 *
 * `flushSync` is the whole point, and it is not defensive coding. Measured in
 * Chromium against the running app before this existed: BottomNav already called
 * `document.startViewTransition(() => onChange(tab))`, and the page content was
 * IDENTICAL at the moment the callback returned and a frame later -- React had
 * not committed inside the callback, so the browser captured the same DOM as
 * both the "old" and the "new" snapshot and the crossfade shipped as a silent
 * no-op. `motion-haptics.test.jsx` passed the whole time, because it asserts the
 * function was CALLED, not that anything moved.
 *
 * That is the same class of defect 7.5.1 wrote up as "a comment naming a guard
 * is not a guard", one level down: a test asserting a call is not a test
 * asserting an effect. Forcing the commit inside the callback is what makes the
 * transition real.
 *
 * Callers pass the state update itself, not a promise -- a View Transition
 * holds the old frame until the callback settles, and an async update would
 * freeze the screen for however long it took.
 */
let _inTransition = false;

export function withViewTransition(update, flushSync) {
  // Re-entrancy matters here, and it is not theoretical. Both navs wrap the
  // gesture, and AppContext wraps the navigation the gesture calls -- so a mode
  // opened from SideNav goes through this twice. Nesting a second
  // startViewTransition inside the first one's callback is not something the API
  // does anything sensible with, so the inner call just performs the update: the
  // outer transition is already capturing exactly the same before/after pair.
  if (_inTransition || !document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  _inTransition = true;
  const done = () => {
    _inTransition = false;
  };
  const transition = document.startViewTransition(() => {
    // flushSync is injected rather than imported so this module stays free of a
    // react-dom dependency: utils/ sits below the component layer everywhere
    // else in this repo, and one import would be the exception that erodes that.
    if (flushSync) flushSync(update);
    else update();
  });
  // finished rejects when a transition is skipped (another one starts, the tab
  // is hidden mid-flight). Either way the flag has to come back down, or the
  // first skipped transition disables every transition after it.
  transition.finished.then(done, done);
}
