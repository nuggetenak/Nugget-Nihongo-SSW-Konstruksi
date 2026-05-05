#!/usr/bin/env node
// scripts/migrate-cs02.mjs
// CS-02: Remove `romaji` field, add `type` field to all 8 source files.
// Run from repo root: node scripts/migrate-cs02.mjs

import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT   = process.cwd();
const SOURCE = path.join(ROOT, 'src', 'data', 'source');

// ── Type assignment rules (from task spec) ───────────────────────────────────
const VOCAB_SOURCES = [
  'vocab-lifeline', 'vocab-jac', 'vocab-core',
  'vocab-exam', 'vocab-teori', 'vocab-supplementary', 'vocab-general',
];
const HUKUM_CATS    = ['hourei', 'career'];
const HUKUM_SOURCES = ['jac-ch2'];
const HUKUM_JP_TERMS = ['雇用保険法', '労働安全衛生法', '建設業法'];

function assignType(card) {
  if (VOCAB_SOURCES.includes(card.source)) return 'vocab';
  if (HUKUM_SOURCES.includes(card.source) && HUKUM_CATS.includes(card.category)) return 'hukum';
  if (HUKUM_JP_TERMS.some(t => (card.jp || '').includes(t))) return 'hukum';
  return 'konsep';
}

// ── Source files to process ──────────────────────────────────────────────────
const SOURCES = [
  { file: 'cards-common.js',         name: 'CARDS_COMMON' },
  { file: 'cards-common-vocab.js',   name: 'CARDS_COMMON_VOCAB' },
  { file: 'cards-lifeline.js',       name: 'CARDS_LIFELINE' },
  { file: 'cards-lifeline-vocab.js', name: 'CARDS_LIFELINE_VOCAB' },
  { file: 'cards-kenchiku.js',       name: 'CARDS_KENCHIKU' },
  { file: 'cards-kenchiku-vocab.js', name: 'CARDS_KENCHIKU_VOCAB' },
  { file: 'cards-doboku.js',         name: 'CARDS_DOBOKU' },
  { file: 'cards-doboku-vocab.js',   name: 'CARDS_DOBOKU_VOCAB' },
];

// ── Serialise a card: desired field order ────────────────────────────────────
// id, category, source, type, furi, jp, id_text, desc  (+ _origIndex preserved)
// romaji is omitted entirely.
const FIELD_ORDER = ['id', 'category', 'source', 'type', 'furi', 'jp', 'id_text', 'desc', '_origIndex'];

function serializeCard(card) {
  const ordered = {};
  for (const key of FIELD_ORDER) {
    if (key in card) ordered[key] = card[key];
  }
  // Catch any extra fields not in FIELD_ORDER (just in case)
  for (const key of Object.keys(card)) {
    if (!(key in ordered)) ordered[key] = card[key];
  }
  const pairs = Object.entries(ordered)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');
  return `  { ${pairs} }`;
}

// ── Stats ─────────────────────────────────────────────────────────────────────
let totalCards = 0, totalVocab = 0, totalHukum = 0, totalKonsep = 0, totalRomajiRemoved = 0;

// ── Process each source file ──────────────────────────────────────────────────
for (const { file, name } of SOURCES) {
  const fullPath = path.join(SOURCE, file);
  const mod = await import(pathToFileURL(fullPath));
  const cards = mod[name];

  const transformed = cards.map(card => {
    const { romaji, ...rest } = card;          // strip romaji
    if (romaji !== undefined) totalRomajiRemoved++;
    const type = assignType(rest);             // assign type
    const newCard = { ...rest, type };         // type is inserted — serializeCard orders it
    return newCard;
  });

  // Count types
  for (const c of transformed) {
    totalCards++;
    if (c.type === 'vocab')  totalVocab++;
    else if (c.type === 'hukum') totalHukum++;
    else                         totalKonsep++;
  }

  // Rebuild file text
  // Read original header lines (comments) to preserve them, then replace the array
  const origText = readFileSync(fullPath, 'utf8');
  const exportLineIdx = origText.indexOf(`export const ${name}`);
  const headerText = origText.slice(0, exportLineIdx);

  const body = transformed.map(serializeCard).join(',\n');
  const newText = headerText
    + `export const ${name} = [\n`
    + body
    + '\n];\n';

  writeFileSync(fullPath, newText, 'utf8');
  console.log(`  ✓ ${file.padEnd(30)} ${transformed.length} cards`);
}

console.log(`
Summary:
  Total cards    : ${totalCards}
  romaji removed : ${totalRomajiRemoved}
  type=vocab     : ${totalVocab}
  type=hukum     : ${totalHukum}
  type=konsep    : ${totalKonsep}
`);

if (totalCards !== totalVocab + totalHukum + totalKonsep) {
  console.error('❌ Type count mismatch!');
  process.exit(1);
}

console.log('✅ Done. Run `node scripts/merge-cards.mjs` to regenerate cards.js.');
