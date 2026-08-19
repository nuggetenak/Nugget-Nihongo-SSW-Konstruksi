#!/usr/bin/env node
/**
 * verify-content.mjs — zero-dependency data integrity check for content-dq
 *
 * WHY THIS EXISTS (session 23, 2026-07-11):
 * content-dq has no package.json / scripts / build / lint / test — see README-CONTENT-DQ.md.
 * That means nothing catches a broken data file until it reaches `main`'s toolchain at merge
 * time. This session found 5 cards with invalid JS in src/data/source/ (a stray backslash —
 * `type: \'vocab\',` instead of `type: 'vocab',`) that had sat undetected across at least one
 * full session. This script is the cheap fix: run it, it tells you if anything is broken.
 *
 * WHAT IT DOES (no npm install needed, just `node scripts/verify-content.mjs`):
 *   1. Parse-checks every .js file under src/data/ — reports any file that isn't valid JS
 *   2. Deep-analyzes cards.js + source/cards-*.js: total count, type breakdown, duplicate IDs
 *   3. Cross-checks cards.js total against source/ mirrors and against the split files under
 *      src/data/cards/ — flags any mismatch
 *   4. Exits 1 if anything is broken, 0 if clean — safe to treat as a pass/fail gate
 *
 * HOW: each target file is transformed (`export const X` -> `module.exports.X`) and loaded via
 * a temp .cjs file + require(), which gives real Node syntax errors with real line numbers —
 * more precise than eyeballing a diff. Works with zero dependencies because it never needs to
 * actually understand JS, just delegates to Node's own parser.
 *
 * Run this before every commit that touches src/data/, and again before writing HANDOFF.md at
 * the end of a session — don't hand-carry-forward numbers from the previous handoff, re-derive
 * them here instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_ROOT = path.join(REPO_ROOT, 'src', 'data');

let failures = 0;
const log = (...a) => console.log(...a);
const fail = (...a) => {
  failures++;
  console.log('❌', ...a);
};
const ok = (...a) => console.log('✅', ...a);

/** Recursively list .js files under a directory. */
function listJsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

/**
 * Load a data file that uses `export const X = ...` by rewriting to CommonJS and requiring it.
 * Returns { ok: true, exports } | { ok: false, error } | { skipped: true, reason }.
 *
 * Files using `import ... from` or `export { X } from` (barrel/shim files with cross-file
 * dependencies) are skipped rather than force-transformed: a naive per-file regex transform
 * can't resolve a chain of relative imports correctly, and reporting a transform limitation as
 * a "FAIL" would be a false positive — exactly the kind of cry-wolf that makes a check like this
 * get ignored. Leaf data files (the ones actually at risk of the corruption this tool exists to
 * catch — hand-edited card arrays) never use import/export-from, so this doesn't reduce coverage
 * where it matters.
 */
function loadDataModule(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  if (/^\s*import\s/m.test(src) || /^\s*export\s*\{/m.test(src)) {
    return {
      skipped: true,
      reason:
        'uses import/re-export syntax (barrel or shim file) — not a leaf data file, verify manually if edited',
    };
  }
  const transformed = src.replace(/^export\s+const\s+/gm, 'module.exports.');
  const tmpFile = path.join(os.tmpdir(), `verify-${crypto.randomBytes(6).toString('hex')}.cjs`);
  fs.writeFileSync(tmpFile, transformed);
  try {
    delete require.cache[require.resolve(tmpFile)];
    const exp = require(tmpFile);
    return { ok: true, exports: exp };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

/** First array-valued export in a module.exports object — works regardless of the export's name. */
function firstArrayExport(exp) {
  for (const k of Object.keys(exp)) if (Array.isArray(exp[k])) return { name: k, value: exp[k] };
  return null;
}

log(`\n=== PART 1: parse-check every .js file under src/data/ ===\n`);
const allFiles = listJsFiles(DATA_ROOT);
let parseFailCount = 0;
let skipCount = 0;
for (const f of allFiles) {
  const rel = path.relative(REPO_ROOT, f);
  const res = loadDataModule(f);
  if (res.skipped) {
    skipCount++;
  } else if (!res.ok) {
    parseFailCount++;
    fail(`${rel} — INVALID JS: ${res.error}`);
  }
}
log(`   (${skipCount} barrel/shim file(s) skipped — see function comment above)`);
if (parseFailCount === 0)
  ok(`all ${allFiles.length - skipCount} checked leaf files under src/data/ parse cleanly`);
else
  fail(
    `${parseFailCount} of ${allFiles.length - skipCount} checked files under src/data/ FAILED to parse`
  );

log(`\n=== PART 2: cards.js — count + type breakdown + duplicate IDs ===\n`);
const cardsPath = path.join(DATA_ROOT, 'cards.js');
const cardsRes = loadDataModule(cardsPath);
let cardsTotal = null;
if (cardsRes.ok) {
  const arr = firstArrayExport(cardsRes.exports);
  if (!arr) {
    fail('cards.js loaded but no array export found');
  } else {
    const cards = arr.value;
    cardsTotal = cards.length;
    const byType = {};
    for (const c of cards) byType[c.type] = (byType[c.type] || 0) + 1;
    const ids = cards.map((c) => c.id);
    const dupCount = ids.length - new Set(ids).size;
    ok(`cards.js: ${cardsTotal} total | by type: ${JSON.stringify(byType)}`);
    if (dupCount > 0) fail(`cards.js: ${dupCount} duplicate id(s) found`);
    else ok(`cards.js: no duplicate ids`);
    const vocabNoUsage = cards.filter((c) => c.type === 'vocab' && !c.usage).length;
    log(`   vocab missing usage: ${vocabNoUsage} / ${byType.vocab || 0}`);
  }
} else {
  fail(`cards.js FAILED TO PARSE: ${cardsRes.error} — cannot run count/type checks`);
}

log(`\n=== PART 3: source/ mirrors vs cards.js vs split files — cross-check totals ===\n`);
const sourceDir = path.join(DATA_ROOT, 'source');
let sourceTotal = 0;
let sourceOk = true;
if (fs.existsSync(sourceDir)) {
  for (const f of listJsFiles(sourceDir)) {
    const res = loadDataModule(f);
    const rel = path.relative(REPO_ROOT, f);
    if (res.skipped) continue;
    if (!res.ok) {
      sourceOk = false;
      fail(`${rel} — cannot include in total (parse error, see Part 1 above)`);
      continue;
    }
    const arr = firstArrayExport(res.exports);
    if (arr) {
      log(`   ${rel}: ${arr.value.length}`);
      sourceTotal += arr.value.length;
    }
  }
  if (sourceOk) log(`   source/ total: ${sourceTotal}`);
}

const cardsDir = path.join(DATA_ROOT, 'cards');
let splitTotal = 0;
let splitOk = true;
if (fs.existsSync(cardsDir)) {
  for (const f of listJsFiles(cardsDir)) {
    const res = loadDataModule(f);
    if (res.skipped) continue;
    if (!res.ok) {
      splitOk = false;
      continue;
    }
    const arr = firstArrayExport(res.exports);
    if (arr) splitTotal += arr.value.length;
  }
  log(`   split files (src/data/cards/**) total: ${splitTotal}`);
}

if (cardsTotal !== null) {
  if (sourceOk && sourceTotal === cardsTotal)
    ok(`source/ mirror total (${sourceTotal}) matches cards.js (${cardsTotal})`);
  else if (sourceOk)
    fail(`source/ mirror total (${sourceTotal}) DOES NOT MATCH cards.js (${cardsTotal})`);
  if (splitOk && splitTotal === cardsTotal)
    ok(`split-files total (${splitTotal}) matches cards.js (${cardsTotal})`);
  else if (splitOk)
    fail(`split-files total (${splitTotal}) DOES NOT MATCH cards.js (${cardsTotal})`);
}

log(`\n=== RESULT ===\n`);
if (failures === 0) {
  ok(`Clean. Numbers above are freshly derived — safe to copy into HANDOFF.md as-is.`);
  process.exit(0);
} else {
  fail(`${failures} problem(s) found. Fix before claiming any task "done" in HANDOFF.md.`);
  process.exit(1);
}
