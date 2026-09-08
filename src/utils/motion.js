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
// reduced-motion.test.js can grep for the literal that bypasses it.
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
