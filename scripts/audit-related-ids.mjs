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
import { CARDS } from '../src/data/cards.js';
import { JAC_TEORI } from '../src/data/sets/jac/jac-teori.js';
import { JAC_LIFELINE } from '../src/data/sets/jac/jac-lifeline.js';

const cardIds = new Set(CARDS.map((c) => c.id));
const broken = [];

for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.related_card_id !== null && !cardIds.has(q.related_card_id)) {
    broken.push({ qId: q.id, badRef: q.related_card_id });
  }
}

if (broken.length) {
  console.log(`❌ ${broken.length} broken related_card_id refs (set to null in data):`);
  broken.forEach((b) => console.log(`  ${b.qId} → card ${b.badRef}`));
  console.log('\nFix: set these related_card_id values to null in jac-teori.js / jac-lifeline.js');
  process.exit(1);
}
console.log(
  `✅ All related_card_id refs valid (${[...JAC_TEORI, ...JAC_LIFELINE].length} questions checked).`
);
