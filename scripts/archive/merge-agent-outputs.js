#!/usr/bin/env node
// ─── scripts/merge-agent-outputs.js ───────────────────────────────────────────
// Merges 10 agent output files back into a single cards.js
//
// Usage:
//   1. Place all cards-output.json files in a folder:
//      outputs/agent-01-cards-output.json
//      outputs/agent-02-cards-output.json
//      ...
//      outputs/agent-10-cards-output.json
//
//   2. Run: node scripts/merge-agent-outputs.js outputs/
//
//   3. Result: src/data/cards.js is overwritten with merged cards
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outputDir = process.argv[2];
if (!outputDir) {
  console.error('Usage: node scripts/merge-agent-outputs.js <outputs-folder>');
  process.exit(1);
}

// Read all output files
const files = readdirSync(outputDir).filter(f => f.endsWith('.json')).sort();
console.log('Found', files.length, 'output files:');
files.forEach(f => console.log('  ' + f));

if (files.length !== 10) {
  console.warn('⚠ Expected 10 files, got', files.length);
}

// Parse and merge
const allCards = [];
const errors = [];
const seenIds = new Set();

for (const file of files) {
  const raw = readFileSync(join(outputDir, file), 'utf-8');
  let cards;
  try {
    cards = JSON.parse(raw);
  } catch (e) {
    // Try stripping markdown fences
    const cleaned = raw.replace(/^```json?\n?/gm, '').replace(/^```\n?/gm, '').trim();
    try {
      cards = JSON.parse(cleaned);
    } catch (e2) {
      errors.push({ file, error: 'Invalid JSON: ' + e2.message });
      continue;
    }
  }

  if (!Array.isArray(cards)) {
    errors.push({ file, error: 'Not an array' });
    continue;
  }

  // Validate each card
  let valid = 0, invalid = 0, dupes = 0;
  for (const card of cards) {
    if (!card.id || !card.jp || !card.category) {
      invalid++;
      continue;
    }
    if (seenIds.has(card.id)) {
      dupes++;
      continue;
    }
    seenIds.add(card.id);
    allCards.push(card);
    valid++;
  }

  console.log(`  ${file}: ${valid} valid, ${invalid} invalid, ${dupes} dupes`);
}

if (errors.length > 0) {
  console.error('\n❌ ERRORS:');
  errors.forEach(e => console.error('  ' + e.file + ': ' + e.error));
  process.exit(1);
}

// Sort by ID
allCards.sort((a, b) => a.id - b.id);

console.log('\nTotal merged cards:', allCards.length);

// Build cards.js
const header = `// SSW Flashcards: All Cards — Content Architecture v2
// ${allCards.length} cards across ${new Set(allCards.map(c=>c.category)).size} categories
// Content improved by 10 parallel Sonnet agents
// Last updated: ${new Date().toISOString().slice(0,10)}

export const CARDS = [\n`;

const esc = (s) => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const lines = allCards.map(c => {
  return `  { id: ${c.id}, category: "${esc(c.category)}", source: "${esc(c.source)}", furi: "${esc(c.furi)}", jp: "${esc(c.jp)}", romaji: "${esc(c.romaji)}", id_text: "${esc(c.id_text)}", desc: "${esc(c.desc)}" },`;
});

const output = header + lines.join('\n') + '\n];\n';
writeFileSync('src/data/cards.js', output, 'utf-8');
console.log('✅ Written to src/data/cards.js');
console.log('\nNext: run npm test to verify');
