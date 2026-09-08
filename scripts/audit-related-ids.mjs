// scripts/audit-related-ids.mjs
// Cross-ref script: validates related_card_id in JAC data against current CARDS.
// Run: node scripts/audit-related-ids.mjs
// If errors: patch jac-teori.js + jac-lifeline.js to set broken refs → null
//
// Import paths corrected 2026-09-04: both files moved to src/data/sets/jac/ at
// the 2026-08-18 merge and this script was never updated, so every run since has
// died with ERR_MODULE_NOT_FOUND instead of auditing anything. It isn't wired
// into any npm script, which is how that went unnoticed — `npm run audit:full`
// now includes it.
//
// Widened 2026-09-07 to cover QUIZ_SETS as well (item 96). It only ever looked
// at the 95 JAC questions because they were the only ones carrying the field;
// 305 of the 980 now do, and a link that resolves is the one thing a script can
// actually check. (What it still cannot check is whether the card is the RIGHT
// one — see src/tests/related-card-links.test.js, written after 72 of the 95
// JAC links turned out to point at the wrong card while passing this audit
// every time.)
import { CARDS } from '../src/data/cards.js';
import { JAC_TEORI } from '../src/data/sets/jac/jac-teori.js';
import { JAC_LIFELINE } from '../src/data/sets/jac/jac-lifeline.js';
import { QUIZ_SETS } from '../src/data/quiz-sets.js';

const cardIds = new Set(CARDS.map((c) => c.id));
const broken = [];

const quizQuestions = QUIZ_SETS.flatMap((set) =>
  (set.questions ?? []).map((q) => ({ ...q, id: `${set.id}/${q.id}` }))
);
const checked = [...JAC_TEORI, ...JAC_LIFELINE, ...quizQuestions];

for (const q of checked) {
  if (q.related_card_id != null && !cardIds.has(q.related_card_id)) {
    broken.push({ qId: q.id, badRef: q.related_card_id });
  }
}

if (broken.length) {
  console.log(`❌ ${broken.length} broken related_card_id refs (set to null in data):`);
  broken.forEach((b) => console.log(`  ${b.qId} → card ${b.badRef}`));
  console.log('\nFix: set these related_card_id values to null in jac-teori.js / jac-lifeline.js');
  process.exit(1);
}
const linked = checked.filter((q) => q.related_card_id != null).length;
console.log(
  `✅ All related_card_id refs valid (${linked} links across ${checked.length} questions checked).`
);
