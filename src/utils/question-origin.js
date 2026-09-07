// ─── utils/question-origin.js ────────────────────────────────────────────────
// Item 106. While answering, a learner cannot tell a question from the official
// JAC book apart from Nugget practice material — and on an exam-prep app that
// is a trust question, not a cosmetic one. "This is what the real exam asked"
// and "this is what we wrote to drill you" deserve different weight.
//
// Three tiers, from data that already exists:
//
//   resmi   JAC_OFFICIAL — the official book's own 95 questions.
//   mockup  QUIZ_SETS whose `source` is 'jac-mockup' — written in the exam's
//           style, but written by us.
//   latihan everything else (the six `wayground-*` sources) — practice.
//
// Note while here: SimulasiMode's pool mapper tested `set.source?.startsWith('csv')`,
// and no set's source starts with 'csv' — the six real values are
// wayground-teori/-jac/-quizizz/-lifeline-vocab/-vocab and jac-mockup. That
// branch was dead, which is exactly how the official/practice distinction had
// stayed invisible: nothing carried it.
// ─────────────────────────────────────────────────────────────────────────────

export const ORIGIN_META = {
  resmi: { label: 'Soal resmi JAC', short: '🏛️ Resmi', color: '#16a34a' },
  mockup: { label: 'Mockup gaya JAC', short: '📋 Mockup', color: '#d97706' },
  latihan: { label: 'Soal latihan', short: '✏️ Latihan', color: '#6b7280' },
};

/** Origin tier for a QUIZ_SETS set. JAC_OFFICIAL questions are 'resmi' directly. */
export function originForSet(setSource) {
  return setSource === 'jac-mockup' ? 'mockup' : 'latihan';
}

export const originMeta = (key) => ORIGIN_META[key] ?? ORIGIN_META.latihan;
