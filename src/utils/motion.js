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
let _clearMorph = null;

/**
 * Mark the element a navigation is travelling FROM, so the browser morphs it
 * into its counterpart on the destination instead of crossfading the screen.
 *
 * ── item 153 ───────────────────────────────────────────────────────────────
 * This is the single thing that most separates "a web page" from "an app":
 * tapping a mode card in Belajar does not replace the screen, the card's icon
 * and title TRAVEL into ModeHeader's icon and title and the rest of the screen
 * arrives around them. The browser interpolates position, size and colour for
 * free once both ends carry the same `view-transition-name`.
 *
 * WHY IMPERATIVE, AND WHY ONLY ONE END IS SET HERE. A view-transition-name has
 * to be UNIQUE among rendered elements when the snapshot is taken, and Belajar
 * renders more than twenty mode cards at once -- naming them all would name
 * nothing. So the source is named on the way out, on the one element that was
 * actually tapped, and unnamed again when the transition settles.
 *
 * The destination is not named from here at all: it does not exist yet when
 * this runs. It gets its name from a CSS rule keyed on `data-nav-morph`, which
 * this sets on the root and `done()` clears -- so the header is named for
 * exactly the one transition that is morphing into it, and is an ordinary part
 * of the root snapshot the rest of the time.
 *
 * @param {Element|null} el  the tapped card; its `[data-morph]` descendants are
 *                           what actually travel.
 */
export function markMorphSource(el) {
  if (!el || !motionAllows('shared') || !document.startViewTransition) return;
  const named = [];
  for (const node of el.querySelectorAll('[data-morph]')) {
    const role = node.dataset.morph;
    if (role !== 'icon' && role !== 'label') continue;
    node.style.viewTransitionName = role === 'icon' ? 'morph-icon' : 'morph-title';
    named.push(node);
  }
  if (named.length === 0) return;
  document.documentElement.dataset.navMorph = '1';
  _clearMorph = () => {
    for (const node of named) node.style.viewTransitionName = '';
    delete document.documentElement.dataset.navMorph;
    _clearMorph = null;
  };
}

/**
 * @param {Function} update      the state change to run inside the transition
 * @param {Function} [flushSync] react-dom's flushSync — see above, it is the
 *                               whole reason this helper exists
 * @param {{dir?: 'forward'|'back', flavor?: string}} [opts]
 *
 * `dir` and `flavor` are written to the root as data attributes for the
 * duration of the transition and read by global.css (item 154). Direction is
 * how a native app tells you where you are in a stack: forward enters from the
 * right, back leaves to the right, and the two must be opposites or the stack
 * stops being legible. Flavour is the MODE_SECTIONS key, so entering an exam
 * does not feel like opening the glossary -- the sections already group every
 * mode by what it is FOR, and this makes that grouping something you can feel
 * rather than something only the menu knows.
 *
 * Attributes rather than arguments to the CSS because a View Transition's
 * animation is declared on pseudo-elements that no component can reach. They
 * are cleared when the transition settles, including when it is skipped.
 */
export function withViewTransition(update, flushSync, opts = {}) {
  // Re-entrancy matters here, and it is not theoretical. Both navs wrap the
  // gesture, and AppContext wraps the navigation the gesture calls -- so a mode
  // opened from SideNav goes through this twice. Nesting a second
  // startViewTransition inside the first one's callback is not something the API
  // does anything sensible with, so the inner call just performs the update: the
  // outer transition is already capturing exactly the same before/after pair.
  if (_inTransition || !document.startViewTransition || !motionAllows('page')) {
    // No transition is going to run, so anything markMorphSource just named has
    // to be un-named here -- otherwise the next navigation starts with a stale
    // name already on the page and the morph silently stops working from then
    // on. The re-entrant case is included on purpose: the OUTER transition owns
    // the cleanup, and it has not finished yet, so this must not touch it.
    if (!_inTransition) _clearMorph?.();
    update();
    return;
  }
  _inTransition = true;
  const root = document.documentElement;
  if (opts.dir) root.dataset.navDir = opts.dir;
  if (opts.flavor) root.dataset.navFlavor = opts.flavor;
  const done = () => {
    _inTransition = false;
    // Cleared on BOTH settlements, skip included. A stale data-nav-dir would
    // silently give the next transition the previous one's direction, which is
    // worse than no direction at all -- it would point the wrong way. A leftover
    // view-transition-name is worse still: the name has to be unique when the
    // next snapshot is taken, and two elements sharing one disables the morph
    // for good rather than only once.
    delete root.dataset.navDir;
    delete root.dataset.navFlavor;
    _clearMorph?.();
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

/**
 * The duration scale, in milliseconds, for JS that has to agree with CSS.
 *
 * Fourteen sites hardcode a delay that stands in for "wait for the animation":
 * the flashcard's 400ms post-rating advance, Onboarding's 600ms, QuizShell's
 * autoNextDelay, and the auto-advance in Dengar, Review, Sprint, Angka, Danger
 * and Confusion. Nothing linked any of them to the CSS duration they were
 * waiting on, and nothing failed if one drifted.
 *
 * motion-scale.test.js parses these same numbers out of global.css and asserts
 * they match, so the two cannot separate silently — the "one source per
 * behaviour" argument the repo already makes about role="status" vs aria-live.
 *
 * NOT scaled by --t-mult. A caller wanting the reader's speed setting applied
 * should use `scaled()` below; the raw rungs stay raw so the test above can
 * compare them to the literals in the CSS.
 */
export const T = {
  instant: 80,
  fast: 120,
  base: 200,
  enter: 260,
  slow: 350,
  count: 1000,
  // The gap between one staggered row and the next, not a duration a caller
  // waits on. It lives here because motion-scale.test.js compares this object
  // against the --t-* declarations one for one, and a rung the CSS declares
  // that JS does not know about is the drift the comparison exists to prevent.
  stagger: 40,
};

/**
 * A duration with the reader's Gerakan speed applied — the JS counterpart of
 * resolving `calc(200ms * var(--t-mult))`.
 *
 * Reads the property off the root rather than taking the pref as an argument,
 * for the same reason prefersReducedMotion() does: applyMotion() has already
 * written it there, and utils/ has no business importing React state.
 */
export function scaled(ms) {
  if (typeof document === 'undefined') return ms;
  const mult = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-mult'));
  return Number.isFinite(mult) && mult > 0 ? Math.round(ms * mult) : ms;
}
