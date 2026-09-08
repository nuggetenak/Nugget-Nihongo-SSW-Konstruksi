// ─── modes/FlashcardMode/use-scoped-deck.js ──────────────────────────────────
// Scopes the card deck to a `filterIds` list, with a STABLE array identity.
//
// This is one `useMemo`, and it lives in its own file because the identity is
// the entire contract and the identity is what broke. In FlashcardMode this was
// a bare expression in the component body:
//
//     const baseCards = filterIds ? cards.filter(...) : cards;
//
// `.filter()` allocates, so with any `filterIds` that value was new on every
// render. It feeds `rebuildOrder`, which feeds the effect that calls
// `setOrder(rebuildOrder(...))` together with `setFlipped(false)` and
// `setIdx(0)`. A new array into state is never Object.is-equal to the old one,
// so that commit re-rendered, which rebuilt the deck, which re-ran the effect:
// an unbounded render loop for the whole life of the mode.
//
// The learner saw a card that would not turn over and Prev/Next that did
// nothing -- every iteration reset `flipped` and `idx` before the next paint.
// It hit every filtered deck: eight modes' "Latih N Salah", Sumber's card
// browse, and Terakhir dipelajari.
//
// It is extracted rather than left inline because the loop cannot be caught by
// an integration test: rendering the broken component hangs the runner instead
// of failing it, so a regression would stall CI rather than report. As a hook
// the invariant is a two-line assertion that fails in milliseconds --
// use-scoped-deck.test.js re-renders with identical props and demands the same
// reference back.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';

/**
 * @param {Array} cards      full deck
 * @param {Array|null} filterIds  card ids to scope to, or null for the whole deck
 * @returns {Array} the scoped deck — referentially stable while the inputs are
 */
export function useScopedDeck(cards, filterIds) {
  return useMemo(() => {
    if (!filterIds) return cards;
    // Set, not Array#includes: this runs over the whole 1,626-card corpus and
    // a wrong-answer drill can carry dozens of ids.
    const wanted = new Set(filterIds);
    return cards.filter((c) => wanted.has(c.id));
  }, [cards, filterIds]);
}
