#!/usr/bin/env node
// scripts/renumber-cards.mjs
// One-shot: renumber all card IDs to be contiguous 1…N.
// Updates: cards-common.js, cards-lifeline.js, jac-teori.js, jac-lifeline.js,
//          angka-kunci.js, and emits the ID mapping for the storage migration.

import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

// ── 1. Load all source cards to build the mapping ────────────────────────────
const sourceFiles = [
  { file: path.join(SRC, 'data/source/cards-common.js'), name: 'CARDS_COMMON' },
  { file: path.join(SRC, 'data/source/cards-lifeline.js'), name: 'CARDS_LIFELINE' },
  { file: path.join(SRC, 'data/source/cards-doboku.js'), name: 'CARDS_DOBOKU' },
  { file: path.join(SRC, 'data/source/cards-kenchiku.js'), name: 'CARDS_KENCHIKU' },
];

const allCards = [];
for (const { file, name } of sourceFiles) {
  const mod = await import(pathToFileURL(file));
  for (const c of mod[name] ?? []) allCards.push(c);
}

allCards.sort((a, b) => a._origIndex - b._origIndex || a.id - b.id);

// ── 2. Build old→new map ──────────────────────────────────────────────────────
const idMap = new Map(); // oldId → newId
const sortedByOldId = [...allCards].sort((a, b) => a.id - b.id);
sortedByOldId.forEach((c, i) => idMap.set(c.id, i + 1));

console.log(
  `Mapping ${idMap.size} card IDs (max old: ${Math.max(...idMap.keys())}, new max: ${idMap.size})`
);

// Show sample of changes
let changedCount = 0;
for (const [old, nw] of idMap) {
  if (old !== nw) changedCount++;
}
console.log(`${changedCount} IDs will change, ${idMap.size - changedCount} stay the same`);

// ── 3. Rewrite source card files ──────────────────────────────────────────────
function rewriteCardFile(filePath, exportName) {
  const raw = readFileSync(filePath, 'utf8');
  // Replace id: NNN with id: NEW — only where it's a card id field
  // Pattern: "  id: 123," at start of card object
  const rewritten = raw.replace(/\bid:\s*(\d+)\b/g, (match, numStr) => {
    const old = parseInt(numStr, 10);
    const nw = idMap.get(old);
    if (nw === undefined) return match; // not a card id we know
    return `id: ${nw}`;
  });
  writeFileSync(filePath, rewritten, 'utf8');
  console.log(`✅ Rewrote: ${path.relative(ROOT, filePath)}`);
}

rewriteCardFile(path.join(SRC, 'data/source/cards-common.js'), 'CARDS_COMMON');
rewriteCardFile(path.join(SRC, 'data/source/cards-lifeline.js'), 'CARDS_LIFELINE');

// ── 4. Rewrite JAC related_card_id ───────────────────────────────────────────
function rewriteRelatedIds(filePath) {
  let raw = readFileSync(filePath, 'utf8');
  raw = raw.replace(/related_card_id:\s*(\d+)/g, (match, numStr) => {
    const old = parseInt(numStr, 10);
    const nw = idMap.get(old);
    if (nw === undefined) {
      console.warn(`  ⚠️  related_card_id ${old} not found in map — setting null`);
      return 'related_card_id: null';
    }
    return `related_card_id: ${nw}`;
  });
  writeFileSync(filePath, raw, 'utf8');
  console.log(`✅ Rewrote related_card_id: ${path.relative(ROOT, filePath)}`);
}

rewriteRelatedIds(path.join(SRC, 'data/jac-teori.js'));
rewriteRelatedIds(path.join(SRC, 'data/jac-lifeline.js'));

// ── 5. Rewrite angka-kunci kartu field ───────────────────────────────────────
function rewriteKartuField(filePath) {
  let raw = readFileSync(filePath, 'utf8');
  raw = raw.replace(/\bkartu:\s*(\d+)/g, (match, numStr) => {
    const old = parseInt(numStr, 10);
    const nw = idMap.get(old);
    if (nw === undefined) {
      console.warn(`  ⚠️  kartu ref ${old} not found in map — setting null`);
      return 'kartu: null';
    }
    return `kartu: ${nw}`;
  });
  writeFileSync(filePath, raw, 'utf8');
  console.log(`✅ Rewrote kartu field: ${path.relative(ROOT, filePath)}`);
}

rewriteKartuField(path.join(SRC, 'data/angka-kunci.js'));

// ── 6. Emit mapping JSON for storage migration ────────────────────────────────
const mapObj = Object.fromEntries(idMap);
const mapPath = path.join(SRC, 'storage/card-id-map-v4.json');
writeFileSync(mapPath, JSON.stringify(mapObj), 'utf8');
console.log(`✅ ID map written: ${path.relative(ROOT, mapPath)}`);
console.log('\n✅ Done. Run: node scripts/merge-cards.mjs && node scripts/validate-data.mjs');
