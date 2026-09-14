// apply-wayground-rewrites.mjs — item 114, Wayground pass (2026-09-13).
//
// Applies authored distractor rewrites to src/data/wayground-sets.js from a JSON file
// of `{ "<setId>#<questionId>": { opts: [...], opts_id: [...] } }`, and refuses
// anything that fails a check. Nothing is written unless every entry passes, so a
// partial application is not a state this can leave the data in.
//
// The authoring itself is the part a script cannot do — a distractor has to be wrong
// and plausible, in Japanese, about construction safety — so this is the half that can
// be mechanical: locating the right line, keeping the answer byte-identical, and
// proving nothing else moved.
//
// WHY THE ANSWER SLOT IS CHECKED BYTE-FOR-BYTE. 7.4.0's pass on the other bank had
// three rewrites where furigana drifted in the answer, and they were caught on review
// rather than by a machine. The answers here are correct as written and are what the
// learner is there to read; the whole method is to lengthen distractors, never to touch
// the answer. A check is cheaper than a review.
//
//   node scripts/archive/apply-wayground-rewrites.mjs <rewrites.json> [--check]
//
// Then: node scripts/archive/balance-wayground-lengths.mjs verify
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TARGET = join(ROOT, 'src/data/wayground-sets.js');

const file = process.argv[2];
const check = process.argv.includes('--check');
if (!file) {
  console.error('usage: apply-wayground-rewrites.mjs <rewrites.json> [--check]');
  process.exit(2);
}

const rewrites = JSON.parse(readFileSync(file, 'utf8'));
const lines = readFileSync(TARGET, 'utf8').split('\n');

const strip = (s) => String(s).replace(/《[^》]*》/g, '');
const problems = [];
const applied = [];

/** The opts / opts_id arrays as they appear on a question's single source line. */
function replaceArray(line, name, values) {
  const start = line.indexOf(`${name}: [`);
  if (start === -1) return null;
  let i = start + `${name}: [`.length;
  let depth = 1;
  let inStr = false;
  let esc = false;
  for (; i < line.length; i++) {
    const c = line[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (c === '\\') {
      esc = true;
      continue;
    }
    if (c === '"') inStr = !inStr;
    else if (!inStr && c === '[') depth++;
    else if (!inStr && c === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  const rendered = `${name}: [${values.map((v) => JSON.stringify(v)).join(',')}]`;
  return line.slice(0, start) + rendered + line.slice(i + 1);
}

let currentSet = null;
for (let n = 0; n < lines.length; n++) {
  const setMatch = lines[n].match(/^\s*id: "([^"]+)",\s*title:/);
  if (setMatch) {
    currentSet = setMatch[1];
    continue;
  }
  const qMatch = lines[n].match(/^\s*\{ id: (\d+),/);
  if (!qMatch || !currentSet) continue;
  const key = `${currentSet}#${qMatch[1]}`;
  const rw = rewrites[key];
  if (!rw) continue;

  const ansMatch = lines[n].match(/ans: (\d+)/);
  if (!ansMatch) {
    problems.push(`${key}: could not read \`ans\` from the source line`);
    continue;
  }
  const ans = Number(ansMatch[1]);

  if (!Array.isArray(rw.opts) || rw.opts.length !== 4) {
    problems.push(`${key}: opts must be 4 entries, got ${rw.opts?.length}`);
    continue;
  }
  if (!Array.isArray(rw.opts_id) || rw.opts_id.length !== 4) {
    problems.push(`${key}: opts_id must be 4 entries, got ${rw.opts_id?.length}`);
    continue;
  }

  // The answer slot, in both languages, must be exactly what is already there.
  const currentOpts = JSON.parse(`[${/opts: \[(.*?)\], opts_id:/s.exec(lines[n])?.[1] ?? ''}]`);
  if (currentOpts.length === 4 && currentOpts[ans] !== rw.opts[ans]) {
    problems.push(
      `${key}: answer slot ${ans} changed\n      was: ${currentOpts[ans]}\n      now: ${rw.opts[ans]}`
    );
    continue;
  }

  const seen = new Set();
  for (const [i, o] of rw.opts.entries()) {
    const k = strip(o).trim();
    if (!k) problems.push(`${key}: option ${i} is blank`);
    if (seen.has(k)) problems.push(`${key}: option ${i} duplicates another (${k})`);
    seen.add(k);
  }
  const seenId = new Set();
  for (const [i, o] of rw.opts_id.entries()) {
    const k = String(o).trim();
    if (!k) problems.push(`${key}: opts_id ${i} is blank`);
    if (seenId.has(k)) problems.push(`${key}: opts_id ${i} duplicates another (${k})`);
    seenId.add(k);
  }

  let next = replaceArray(lines[n], 'opts_id', rw.opts_id);
  next = next && replaceArray(next, 'opts', rw.opts);
  if (!next) {
    problems.push(`${key}: could not locate opts/opts_id on the source line`);
    continue;
  }
  lines[n] = next;
  applied.push(key);
}

const missing = Object.keys(rewrites).filter((k) => !applied.includes(k));
for (const k of missing) problems.push(`${k}: no such question found in wayground-sets.js`);

if (problems.length) {
  console.error(`${problems.length} problem(s) — nothing written:\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`${applied.length} question(s) ${check ? 'would be' : ''} rewritten`);
if (!check) {
  writeFileSync(TARGET, lines.join('\n'), 'utf8');
  console.log('now run: node scripts/archive/balance-wayground-lengths.mjs verify');
}
