import { CARDS } from '../src/data/cards.js';
import { CATEGORIES, SOURCE_META, SOURCE_GROUPS, VOCAB_SOURCES } from '../src/data/categories.js';

const issues = [];
const warnings = [];

const requiredCardFields = ['id', 'category', 'source', 'furi', 'jp', 'romaji', 'id_text', 'desc'];

const catKeys = new Set(CATEGORIES.map((c) => c.key));
const sourceKeys = new Set(Object.keys(SOURCE_META));

const ids = new Set();
for (const [index, c] of CARDS.entries()) {
  const row = index + 1;

  for (const key of requiredCardFields) {
    if (!(key in c)) issues.push(`Card row ${row} missing field: ${key}`);
  }

  if (typeof c.id !== 'number' || !Number.isInteger(c.id) || c.id <= 0) {
    issues.push(`Card row ${row} has invalid id: ${String(c.id)}`);
  }

  if (ids.has(c.id)) issues.push(`Duplicate card id: ${c.id}`);
  ids.add(c.id);

  if (!catKeys.has(c.category)) issues.push(`Card id ${c.id} has unknown category: ${c.category}`);
  if (!sourceKeys.has(c.source)) issues.push(`Card id ${c.id} has unknown source: ${c.source}`);

  for (const key of ['furi', 'jp', 'romaji', 'id_text', 'desc']) {
    if (typeof c[key] !== 'string' || c[key].trim().length === 0) {
      issues.push(`Card id ${c.id} has empty/non-string field: ${key}`);
    }
  }
}

const sortedIds = [...ids].sort((a, b) => a - b);
for (let i = 0; i < sortedIds.length; i++) {
  const expected = i + 1;
  if (sortedIds[i] !== expected) {
    warnings.push(`Card id sequence is not contiguous at position ${i + 1}: got ${sortedIds[i]}, expected ${expected}`);
    break;
  }
}

for (const src of VOCAB_SOURCES) {
  if (!sourceKeys.has(src)) issues.push(`VOCAB_SOURCES references unknown source: ${src}`);
}

for (const group of SOURCE_GROUPS) {
  for (const key of group.keys) {
    if (!sourceKeys.has(key)) issues.push(`SOURCE_GROUPS (${group.label}) references unknown source: ${key}`);
  }
}

const usedCategories = new Set(CARDS.map((c) => c.category));
for (const c of CATEGORIES) {
  if (!['all', 'bintang'].includes(c.key) && !usedCategories.has(c.key)) {
    warnings.push(`Category declared but unused by cards: ${c.key}`);
  }
}

const summary = {
  cards: CARDS.length,
  categories: CATEGORIES.length,
  sources: sourceKeys.size,
  issues: issues.length,
  warnings: warnings.length,
};

console.log('=== AUDIT INTEGRITY SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`- ${w}`);
}

if (issues.length) {
  console.log('\nIssues:');
  for (const e of issues) console.log(`- ${e}`);
  process.exit(1);
}

console.log('\nIntegrity audit passed.');
