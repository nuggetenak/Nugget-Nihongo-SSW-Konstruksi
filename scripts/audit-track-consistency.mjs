#!/usr/bin/env node
/**
 * audit-track-consistency.mjs — checks src/data/source/cards-*.js (mirrors) against
 * src/data/cards/{common,lifeline}/*.js (split files) for per-card track agreement.
 *
 * WHY THIS EXISTS (session 24, 2026-07-15):
 * verify-content.mjs confirms totals balance (source/ mirrors sum to 1438, split files sum to
 * 1438, cards.js is 1438) but never checks that the SAME ids make up each side of that total.
 * Found by accident while fixing an unrelated ruby issue (P1/H2): id=211 lives in
 * source/cards-lifeline.js but src/data/cards/common/ch4.js — split-file folder says common,
 * mirror says lifeline. A quick manual check on 12 cards found 4 more (211, 379, 596, 623). This
 * script runs the same check across all 1438, not just the ones touched by chance.
 *
 * IMPORTANT — this only checks the split-file/mirror EDITING layer. cards.js is built by
 * scripts/merge-cards.mjs (main-only) directly from src/data/source/cards-*.js — the split
 * files under src/data/cards/ are NOT read by that script at all. So whatever this script
 * finds is an editing-layer/organizational inconsistency, not a live-app bug: cards.js and
 * the mirrors already agree with each other (that's what verify-content.mjs's Part 3 confirms).
 * It's specifically the split files that may have drifted from the mirrors.
 *
 * HOW: extracts every `id: N` from each file with a regex (not a real parser — good enough for
 * an id list, matches the approach already used ad hoc this session). Reports:
 *   1. Per-mirror vs per-split-folder id-set sizes (will not match — that's the point)
 *   2. ids in the common mirror but a lifeline split file, and vice versa
 *   3. any id present in a mirror but missing from both split folders, or vice versa
 *      (a structural gap, not just a track swap — none found as of session 24, but re-run
 *      to check, don't assume that still holds)
 *
 * Run: node scripts/audit-track-consistency.mjs
 */

import { readFileSync } from 'fs';
import { globSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

function idsIn(filePath) {
  const text = readFileSync(filePath, 'utf-8');
  const ids = new Set();
  for (const m of text.matchAll(/\bid:\s*(\d+)\b/g)) ids.add(Number(m[1]));
  return ids;
}

function idsInGlob(pattern) {
  const ids = new Set();
  for (const f of globSync(pattern)) {
    for (const id of idsIn(f)) ids.add(id);
  }
  return ids;
}

const commonMirror = idsIn(path.join(ROOT, 'src/data/source/cards-common.js'));
const lifelineMirror = idsIn(path.join(ROOT, 'src/data/source/cards-lifeline.js'));
const commonSplit = idsInGlob(path.join(ROOT, 'src/data/cards/common/*.js'));
const lifelineSplit = idsInGlob(path.join(ROOT, 'src/data/cards/lifeline/*.js'));

const setDiff = (a, b) => [...a].filter((x) => !b.has(x)).sort((x, y) => x - y);
const setAnd = (a, b) => [...a].filter((x) => b.has(x)).sort((x, y) => x - y);

console.log('=== AUDIT: mirror vs split-file track agreement ===\n');
console.log(`common mirror:   ${commonMirror.size}   |  common split files:   ${commonSplit.size}`);
console.log(
  `lifeline mirror: ${lifelineMirror.size}   |  lifeline split files: ${lifelineSplit.size}\n`
);

const mirrorCommonSplitLifeline = setAnd(commonMirror, lifelineSplit);
const mirrorLifelineSplitCommon = setAnd(lifelineMirror, commonSplit);

console.log(`mirror=common, split=lifeline: ${mirrorCommonSplitLifeline.length} ids`);
console.log(mirrorCommonSplitLifeline.join(', ') || '(none)');
console.log(`\nmirror=lifeline, split=common: ${mirrorLifelineSplitCommon.length} ids`);
console.log(mirrorLifelineSplitCommon.join(', ') || '(none)');

const missingFromSplit = [
  ...setDiff(commonMirror, new Set([...commonSplit, ...lifelineSplit])),
  ...setDiff(lifelineMirror, new Set([...commonSplit, ...lifelineSplit])),
];
const missingFromMirror = [
  ...setDiff(commonSplit, new Set([...commonMirror, ...lifelineMirror])),
  ...setDiff(lifelineSplit, new Set([...commonMirror, ...lifelineMirror])),
];

console.log(
  `\nin a mirror but in NEITHER split folder (structural gap): ${missingFromSplit.length}`
);
if (missingFromSplit.length) console.log(missingFromSplit.join(', '));
console.log(
  `in a split folder but in NEITHER mirror (structural gap): ${missingFromMirror.length}`
);
if (missingFromMirror.length) console.log(missingFromMirror.join(', '));

const totalMismatch = mirrorCommonSplitLifeline.length + mirrorLifelineSplitCommon.length;
console.log(
  `\n=== RESULT: ${totalMismatch} of ${commonMirror.size + lifelineMirror.size} cards ` +
    `disagree between mirror and split-file track ===`
);
console.log(
  totalMismatch > 0
    ? '⚠️  Non-zero. See HANDOFF.md for status/decision on whether and how to reconcile.'
    : '✅ Clean.'
);
