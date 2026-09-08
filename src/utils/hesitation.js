// ─── utils/hesitation.js ─────────────────────────────────────────────────────
// Item 58, the half that faces the learner.
//
// `responseMs` rides on every SRS history entry from storage v7 onward, and the
// decision record for this item (docs/UI_UX_PLAN.md item 58, and the v6→v7 note
// in storage/migrations.js) is explicit that it must never reach FSRS: the
// algorithm's Rating enum has no timing channel, and the only way to sneak one
// in would be to silently change which of the four ratings gets sent. So the
// field earns its keep here instead — as something the learner reads, not
// something the scheduler acts on.
//
// The signal is the one the item names: a card answered *correctly but slowly*.
// Rating it Good means "I knew it"; taking four times your usual to say so
// means you reconstructed it rather than recalled it. Nothing else in the app
// can see that — the rating alone cannot, and session timing averages it away.
//
// Two rules keep this honest rather than a number dressed up as insight:
//
// 1. **The baseline is the learner's own median, not a constant.** "Slow" for
//    someone reading kanji for the first month is not slow for someone in their
//    sixth. An absolute threshold (">5 seconds") would be exactly the kind of
//    unbacked heuristic INDONESIAN_CALIBRATION refuses to ship inert-until-
//    proven, and it would misfire hardest on the beginners this app is for.
// 2. **It never claims more than it knows.** Below MIN_SAMPLES timed reviews a
//    median is noise, so the list is empty rather than confidently wrong, and
//    each row shows its own ratio so the learner can judge the claim instead of
//    taking a verdict on trust.
//
// The 1.5x floor is a display cutoff and nothing more: it decides which rows are
// worth a learner's attention, changes no scheduling, and can move without
// consequence. That is the whole difference between it and the rating
// adjustment this item rejected.
// ─────────────────────────────────────────────────────────────────────────────

// Below this many timed reviews the learner has no stable personal pace yet.
export const HESITATION_MIN_SAMPLES = 20;
// How far past their own median counts as hesitation, for display purposes.
export const HESITATION_RATIO = 1.5;
// A review is a "knew it" review at Good (3) or Easy (4). Again/Hard already
// tell the learner they struggled -- and already tell FSRS -- so a slow Again
// is not news.
const KNEW_IT_RATINGS = new Set([3, 4]);
// Anything past this is someone who walked away mid-card, not someone thinking.
// A single 40-minute entry would drag a median of twenty reviews sideways.
export const HESITATION_MAX_PLAUSIBLE_MS = 120000;

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Every timed review across the store, oldest first, as plain millisecond
// numbers. Entries without `responseMs` are pre-v7 or were never on screen long
// enough to time, and are absent rather than zero -- see recordReview.
export function timedReviews(srsCards = {}) {
  const out = [];
  for (const entry of Object.values(srsCards ?? {})) {
    for (const h of entry?.history ?? []) {
      if (typeof h.responseMs === 'number' && h.responseMs > 0) {
        if (h.responseMs <= HESITATION_MAX_PLAUSIBLE_MS) out.push(h.responseMs);
      }
    }
  }
  return out;
}

/**
 * Cards the learner got right but laboured over, worst first.
 *
 * `srsCards` is the raw store dict (id → { card, history }). Returns
 * `{ baselineMs, samples, cards: [{ id, ms, ratio }] }` — `cards` empty (and
 * `baselineMs` null) until there are enough timed reviews to have a baseline
 * at all, which is a real state the UI has to render, not an error.
 *
 * Only the most recent timed review of each card counts. A card you once
 * laboured over and now answer instantly is not a card you hesitate on, and
 * averaging its history would keep it on the list long after it stopped being
 * true.
 */
export function hesitantCards(srsCards = {}, { limit = 8 } = {}) {
  const samples = timedReviews(srsCards);
  if (samples.length < HESITATION_MIN_SAMPLES) {
    return { baselineMs: null, samples: samples.length, cards: [] };
  }
  const baselineMs = median(samples);
  if (!baselineMs) return { baselineMs: null, samples: samples.length, cards: [] };

  const cards = [];
  for (const [id, entry] of Object.entries(srsCards ?? {})) {
    const last = [...(entry?.history ?? [])]
      .reverse()
      .find((h) => typeof h.responseMs === 'number' && h.responseMs > 0);
    if (!last || last.responseMs > HESITATION_MAX_PLAUSIBLE_MS) continue;
    if (!KNEW_IT_RATINGS.has(last.rating)) continue;
    const ratio = last.responseMs / baselineMs;
    if (ratio < HESITATION_RATIO) continue;
    cards.push({ id: Number(id), ms: last.responseMs, ratio });
  }
  cards.sort((a, b) => b.ratio - a.ratio);
  return { baselineMs, samples: samples.length, cards: cards.slice(0, limit) };
}
