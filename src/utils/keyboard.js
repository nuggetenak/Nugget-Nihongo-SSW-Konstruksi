// ─── keyboard.js ──────────────────────────────────────────────────────────
// isTypingTarget(event) — true if a keydown's target is somewhere the user is
// actively typing (input, textarea, contenteditable, or a <select>).
//
// WHY THIS EXISTS (UI_UX_PLAN.md item 31, 2026-08-20):
// FlashcardMode/index.jsx bound a window-level keydown handler (Space to flip,
// arrows to navigate, 1-4 to rate) with no check for whether focus was in the
// search input rendered in the same tree. Space was swallowed by
// preventDefault() and flipped the card instead of typing a space; arrows
// moved cards instead of the text caret. Multi-word search was impossible.
// No global keydown handler anywhere in this app checked focus target before
// this fix — that's the actual bug, not anything specific to FlashcardMode.
//
// Kept as a shared, barrel-exported util (not inlined in FlashcardMode) so any
// future global key handler — see UI_UX_PLAN.md item 20's proposed app-level
// keyboard layer — starts from a handler that already knows not to hijack a
// focused field, instead of reintroducing this bug on every screen it touches.
export function isTypingTarget(event) {
  const el = event.target;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}
