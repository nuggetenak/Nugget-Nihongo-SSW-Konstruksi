// scripts/validate-data.mjs
// Pre-build data integrity checker. Called by package.json prebuild.
// Exits 1 if any error found.
import { CARDS } from '../src/data/cards.js';
import { JAC_TEORI } from '../src/data/sets/jac/jac-teori.js';
import { JAC_LIFELINE } from '../src/data/sets/jac/jac-lifeline.js';
import { ANGKA_KUNCI } from '../src/data/angka-kunci.js';

let errors = 0;
let warnings = 0;
const cardIds = new Set(CARDS.map(c => c.id));

// 1. Duplicate card IDs
const seen = new Set();
for (const c of CARDS) {
  if (seen.has(c.id)) {
    console.error(`❌ Duplicate card id: ${c.id}`);
    errors++;
  }
  seen.add(c.id);
}

// 2. Broken related_card_id
for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.related_card_id !== null && !cardIds.has(q.related_card_id)) {
    console.error(`❌ Broken related_card_id: ${q.id} → card ${q.related_card_id}`);
    errors++;
  }
}

// 3. Photo-dependent questions need a real photoDesc substitute (the app has no
//    actual image asset pipeline — public/jac-photos/ was never populated, this
//    check used to warn on every single photo question, forever, for that reason)
for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.photoDesc !== undefined && q.photoDesc !== null) {
    if (typeof q.photoDesc !== 'string' || q.photoDesc.trim().length < 10) {
      console.warn(`⚠️  photoDesc present but too short/empty to substitute for the missing image: ${q.id}`);
      warnings++;
    }
  }
}

// 4. ANGKA_KUNCI broken kartu refs
for (const a of ANGKA_KUNCI) {
  if (a.kartu !== null && !cardIds.has(a.kartu)) {
    console.error(`❌ ANGKA_KUNCI broken kartu ref: "${a.angka}" → card ${a.kartu}`);
    errors++;
  }
}

// 5. Quiz answer index validity (ans < opts.length) — spot check CARDS type:quiz
const quizCards = CARDS.filter(c => c.type === 'quiz' && c.ans !== undefined && c.opts);
for (const c of quizCards) {
  if (c.ans >= c.opts.length) {
    console.error(`❌ Card ${c.id}: ans=${c.ans} >= opts.length=${c.opts.length}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s), ${warnings} warning(s). Fix before build.`);
  process.exit(1);
}
console.log(`✅ Data validation passed. ${warnings > 0 ? warnings + ' warning(s).' : ''} Cards: ${CARDS.length}`);
