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

/**
 * True when motion should be suppressed: either the OS asks for it, or the
 * reader has turned it off in Pengaturan Gerakan.
 *
 * Keeps its name and its meaning, so all its existing callers are unchanged.
 * It reads the DOM rather than taking the pref as an argument because
 * applyMotion() has already written it to the root -- the same trick
 * applyTextScale uses, and the reason a util below the component layer can
 * answer a question about user preference at all.
 */
export function prefersReducedMotion() {
  if (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'mati') {
    return true;
  }
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Whether one named motion feature is on — 'page', 'shared', 'press',
 * 'entrance', 'stagger', 'count', 'celebrate', 'card', 'furi'.
 *
 * The OS setting still wins over everything: a reader who asked their device
 * for less motion gets less motion regardless of what this app's preset says.
 * That is not negotiable and is why this defers to prefersReducedMotion first.
 */
export function motionAllows(feature) {
  if (prefersReducedMotion()) return false;
  if (typeof document === 'undefined') return true;
  return !document.documentElement.hasAttribute(`data-motion-no-${feature}`);
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
  if (_inTransition || !document.startViewTransition || !motionAllows('page')) {
    update();
    return;
  }
  _inTransition = true;
  const done = () => {
    _inTransition = false;
  };
  let transition;
  try {
    transition = document.startViewTransition(() => {
      // flushSync is injected rather than imported so this module stays free of
      // a react-dom dependency: utils/ sits below the component layer everywhere
      // else in this repo, and one import would be the exception that erodes it.
      if (flushSync) flushSync(update);
      else update();
    });
  } catch {
    // The update already ran inside the callback if we got that far; if the API
    // itself threw before calling it, run it directly. Either way the screen
    // must end up on the new state -- a failed animation may not cost the user
    // their navigation.
    done();
    update();
    return;
  }
  // `finished` rejects when a transition is SKIPPED (another starts, the tab is
  // hidden mid-flight), so both settlements clear the flag: one that only
  // cleared on success would let the first skip disable every transition after
  // it, permanently, for the life of the page.
  //
  // The optional chaining is not defensive noise. The real API returns a
  // ViewTransition, but a stub or a polyfill can return undefined -- CI caught
  // exactly that against the test double in motion-haptics.test.jsx, and the
  // TypeError it threw stranded _inTransition at true, which is the same
  // permanent-disable failure by another route.
  if (transition?.finished?.then) transition.finished.then(done, done);
  else done();
}
