// ─── utils/quiz-classification.js ────────────────────────────────────────────
// Single source of truth for which QUIZ_SETS id belongs to which category.
// Extracted because this exact matching (which prefixes mean Teori vs
// Praktik) was on track to be duplicated in a second file (SimulasiMode's
// teori/praktik-ratio sampling) after already causing real bugs once from
// living un-shared in WaygroundMode alone: a rename (ct/cp -> jmt/jml,
// session 23) silently broke a whole grouping because nothing forced the
// two places that cared about these prefixes to stay in sync -- except
// there was only one place at the time. Now there are two consumers
// (WaygroundMode's display grouping, SimulasiMode's ratio sampling), so
// the underlying prefix rules live here once instead of twice.
//
// wgl10 is why Praktik needs a predicate instead of a plain string prefix:
// it starts with 'wgl1', not 'wgl0', so a naive 'wgl0' prefix would miss it.
// ─────────────────────────────────────────────────────────────────────────────

export const isWaygroundTeoriId = (id) => id.startsWith('wt');
export const isWaygroundPraktikId = (id) => id.startsWith('wgl') && !id.startsWith('wglv');
export const isJacMockupTeoriId = (id) => id.startsWith('jmt');
export const isJacMockupPraktikId = (id) => id.startsWith('jml');
export const isVocabId = (id) => id.startsWith('wglv');

// Combined categories -- what SimulasiMode's teori/praktik ratio sampling
// actually needs: it doesn't care about provenance (Wayground vs JAC
// Mockup), just the teori/praktik axis. WaygroundMode keeps the 4 finer
// predicates above for its own display grouping, which does care.
export const isTeoriId = (id) => isWaygroundTeoriId(id) || isJacMockupTeoriId(id);
export const isPraktikId = (id) => isWaygroundPraktikId(id) || isJacMockupPraktikId(id);
