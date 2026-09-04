// scripts/audit-integrity.mjs
// Structural audit of the shipped card corpus and its registries.
//
// This script had drifted into uselessness before 2026-09-04: `requiredCardFields`
// still demanded a `furi` field that the card schema dropped when readings moved
// inline into `jp` as 《》 markers, so every run reported 2 × 1438 = 2876 phantom
// issues and exited 1. An audit that always fails is an audit nobody runs, which
// is how the registry rot below (5 sources declared with zero cards) survived.
// Fields are now derived from what the corpus actually carries; see the
// FIELD_RULES table for the reasoning behind each one.
import { CARDS } from '../src/data/cards.js';
import { CATEGORIES, SOURCE_META, SOURCE_GROUPS, VOCAB_SOURCES } from '../src/data/categories.js';

const issues = [];
const warnings = [];

// Every card carries these; each must be a non-empty string (except `id`,
// checked separately as a positive integer). Verified against the real corpus
// rather than copied from a spec: `usage` is deliberately absent because only
// vocab-type cards have it (1244 of 1438), so requiring it would reintroduce
// exactly the false-positive flood this script was rewritten to remove.
const REQUIRED_STRING_FIELDS = ['category', 'source', 'jp', 'id_text', 'desc', 'type'];

const catKeys = new Set(CATEGORIES.map((c) => c.key));
const sourceKeys = new Set(Object.keys(SOURCE_META));

const ids = new Set();
for (const [index, c] of CARDS.entries()) {
  const row = index + 1;

  if (typeof c.id !== 'number' || !Number.isInteger(c.id) || c.id <= 0) {
    issues.push(`Card row ${row} has invalid id: ${String(c.id)}`);
  }
  if (ids.has(c.id)) issues.push(`Duplicate card id: ${c.id}`);
  ids.add(c.id);

  for (const key of REQUIRED_STRING_FIELDS) {
    if (!(key in c)) {
      issues.push(`Card id ${c.id} missing field: ${key}`);
    } else if (typeof c[key] !== 'string' || c[key].trim().length === 0) {
      issues.push(`Card id ${c.id} has empty/non-string field: ${key}`);
    }
  }

  if (!catKeys.has(c.category)) issues.push(`Card id ${c.id} has unknown category: ${c.category}`);
  if (!sourceKeys.has(c.source)) issues.push(`Card id ${c.id} has unknown source: ${c.source}`);
}

// Card ids are deliberately non-contiguous — renumbering would invalidate every
// saved SRS state, note and starred id in existing installs (see
// src/storage/card-id-map-v4.js for the one time it was done, and what it cost).
// Gaps are expected; a *duplicate* id is the real failure, and it's checked above.
// Reported as an informational line, never as a warning that trains people to
// ignore this script's output.
const sortedIds = [...ids].sort((a, b) => a - b);
const gaps = sortedIds.length ? sortedIds[sortedIds.length - 1] - sortedIds.length : 0;

// ── Registry rot ────────────────────────────────────────────────────────────
// A source or category declared here but carried by no card renders as an empty
// row in SumberMode ("0 kartu") and an empty filter chip elsewhere — dead UI the
// user has to read past. These are issues, not warnings: they are always wrong
// and always cheap to fix (delete the entry, or add the missing content).
const usedSources = new Set(CARDS.map((c) => c.source));
const usedCategories = new Set(CARDS.map((c) => c.category));

for (const key of sourceKeys) {
  if (!usedSources.has(key)) issues.push(`Source declared in SOURCE_META but used by 0 cards: ${key}`);
}
for (const c of CATEGORIES) {
  // 'all' and 'bintang' are UI-only pseudo-categories (a filter-all chip and the
  // starred view); no card is ever stored under either.
  if (!['all', 'bintang'].includes(c.key) && !usedCategories.has(c.key)) {
    issues.push(`Category declared but used by 0 cards: ${c.key}`);
  }
}

for (const src of VOCAB_SOURCES) {
  if (!sourceKeys.has(src)) issues.push(`VOCAB_SOURCES references unknown source: ${src}`);
}
for (const group of SOURCE_GROUPS) {
  for (const key of group.keys) {
    if (!sourceKeys.has(key))
      issues.push(`SOURCE_GROUPS (${group.label}) references unknown source: ${key}`);
  }
}

const summary = {
  cards: CARDS.length,
  categories: CATEGORIES.length,
  sources: sourceKeys.size,
  idRangeGaps: gaps,
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
