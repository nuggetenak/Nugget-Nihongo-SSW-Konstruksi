#!/usr/bin/env node
// scripts/split-cards.mjs
// One-time migration: splits src/data/cards.js into 8 track source files
// Run once from repo root: node scripts/split-cards.mjs
// Output goes to: src/data/source/

import { mkdirSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';

const ROOT = process.cwd();
const SRC  = path.join(ROOT, 'src', 'data');
const OUT  = path.join(SRC, 'source');

const { CARDS } = await import(pathToFileURL(path.join(SRC, 'cards.js')));
const { CATEGORIES, VOCAB_SOURCES } = await import(pathToFileURL(path.join(SRC, 'categories.js')));

const ALL_3 = ['doboku', 'kenchiku', 'lifeline'];
const catTrack = {};
for (const cat of CATEGORIES) {
  if (!cat.key || cat.key === 'all' || cat.key === 'bintang') continue;
  const tracks = cat.tracks ?? [];
  const hasAll = ALL_3.every(t => tracks.includes(t));
  if (hasAll)                            catTrack[cat.key] = 'common';
  else if (tracks.includes('lifeline'))  catTrack[cat.key] = 'lifeline';
  else if (tracks.includes('kenchiku'))  catTrack[cat.key] = 'kenchiku';
  else if (tracks.includes('doboku'))    catTrack[cat.key] = 'doboku';
  else                                   catTrack[cat.key] = 'common';
}

const buckets = {
  'common':          [],
  'common-vocab':    [],
  'lifeline':        [],
  'lifeline-vocab':  [],
  'kenchiku':        [],
  'kenchiku-vocab':  [],
  'doboku':          [],
  'doboku-vocab':    [],
};

// Embed _origIndex so merge-cards.mjs can restore exact original order
CARDS.forEach((card, i) => {
  const isVocab = VOCAB_SOURCES.includes(card.source);
  const track   = catTrack[card.category] ?? 'common';
  const bucket  = isVocab ? `${track}-vocab` : track;
  buckets[bucket].push({ ...card, _origIndex: i });
});

const CONST_NAME = {
  'common':         'CARDS_COMMON',
  'common-vocab':   'CARDS_COMMON_VOCAB',
  'lifeline':       'CARDS_LIFELINE',
  'lifeline-vocab': 'CARDS_LIFELINE_VOCAB',
  'kenchiku':       'CARDS_KENCHIKU',
  'kenchiku-vocab': 'CARDS_KENCHIKU_VOCAB',
  'doboku':         'CARDS_DOBOKU',
  'doboku-vocab':   'CARDS_DOBOKU_VOCAB',
};

function serializeCard(card) {
  const pairs = Object.entries(card)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');
  return `  { ${pairs} }`;
}

mkdirSync(OUT, { recursive: true });

let totalOut = 0;
for (const [bucket, cards] of Object.entries(buckets)) {
  const constName = CONST_NAME[bucket];
  const filename  = `cards-${bucket}.js`;
  const header = [
    `// cards-${bucket}.js — auto-generated source file`,
    `// DO NOT edit cards.js directly — edit this file instead.`,
    `// Re-merge with: node scripts/merge-cards.mjs`,
    `// Cards in this file: ${cards.length}`,
    `// _origIndex: used by merge-cards.mjs to restore original order — do not remove`,
    ``,
    `export const ${constName} = [`,
  ].join('\n');

  writeFileSync(
    path.join(OUT, filename),
    header + '\n' + cards.map(serializeCard).join(',\n') + '\n];\n',
    'utf8'
  );
  console.log(`  ✓ ${filename.padEnd(30)} ${cards.length} cards`);
  totalOut += cards.length;
}

console.log(`\nTotal: ${totalOut} cards written (original: ${CARDS.length})`);
if (totalOut !== CARDS.length) {
  console.error('⚠️  Count mismatch!');
  process.exit(1);
}
console.log('\nDone. Run `node scripts/merge-cards.mjs` to verify round-trip.');
