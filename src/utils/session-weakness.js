// ─── session-weakness.js ──────────────────────────────────────────────────
// Item 57: "12 salah di 電気設備 — latih kategori itu" from a results screen.
//
// Deliberately not reusing FocusMode's catStats computation — that answers
// "which categories am I weak in overall" (known/wrong across every card,
// all time). This answers a narrower question: "in THIS session's wrong
// answers, is there a category worth drilling right now." Different inputs
// (a session's results array vs. the whole known/quizWrong state), so a
// shared function would need to serve two shapes for no real reuse benefit.
// ─────────────────────────────────────────────────────────────────────────────

import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';

/**
 * Given this session's wrong-answer records, find the category with the
 * clearest concentration of mistakes.
 *
 * Each record needs either a `.category` string directly, or a `.cardId`
 * that resolves to a CARDS entry with one. Records with neither are
 * silently skipped -- not every mode's data maps to the CATEGORIES
 * taxonomy (angka-kunci numbers, confusion/danger pairs, JAC exam
 * questions), and this is meant to degrade to "no suggestion" rather than
 * mis-group unrelated content.
 *
 * Returns null rather than a weak/noisy suggestion when: there's nothing to
 * group, the wrong answers are spread too thin to point at one category, or
 * fewer than 2 wrong answers land in the same category (one wrong answer in
 * a category isn't a pattern worth interrupting the results screen for).
 */
export function findWeakestCategory(wrongRecords) {
  if (!Array.isArray(wrongRecords) || wrongRecords.length === 0) return null;

  const counts = {};
  for (const r of wrongRecords) {
    const cat = r?.category ?? CARDS.find((c) => c.id === r?.cardId)?.category;
    if (!cat) continue;
    counts[cat] = (counts[cat] ?? 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;
  const [key, count] = sorted[0];
  if (count < 2) return null;

  const meta = CATEGORIES.find((c) => c.key === key);
  if (!meta) return null;

  return { key, label: meta.label, emoji: meta.emoji, count };
}
