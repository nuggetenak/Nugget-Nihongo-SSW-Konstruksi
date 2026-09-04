#!/usr/bin/env node
// scripts/audit-ruby.mjs
// Shape audit for the 《reading》 furigana markers in src/data.
//
// WHY THIS EXISTS (2026-09-04): src/tests/ruby-audit-round3.test.jsx already
// sweeps the whole corpus through the real renderer and asserts no unexplained
// raw bracket survives. That check answers "does the renderer produce garbage?"
// It cannot answer "does the renderer produce the RIGHT annotation?", because it
// has no independent idea what the right reading is — a limitation that test's
// own header calls out, and the reason two more defect classes shipped past it:
//
//   1. Pooled readings. `免振 vs 制振 vs 耐震《めんしん vs せいしん vs たいしん》`
//      packs three terms' readings into one marker attached to the last term.
//      The renderer happily emits <ruby>耐震<rt>めんしん vs せいしん vs たいしん</rt>,
//      which is well-formed markup and a wrong annotation, so the sweep passes.
// Two more classes found in the same pass — a reading reaching past its own base
// (`ラジオ体操《らじおたいそう》` annotating only 体操) and a kanji-bearing
// parenthetical rendered as furigana (`180度《完全に開く》`) — turned out to be
// renderer bugs against *correct* data, so they are fixed in
// src/components/JpDisplay.jsx and asserted in ruby-audit-round3.test.jsx rather
// than reported here. This script covers what no renderer can repair: markers
// whose content is wrong in the data itself.
//
// Zero dependencies, same as verify-content.mjs, so it runs in a content-only
// checkout with no npm install.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src', 'data');

const MARKER = /《([^》]*)》/g;

// A furigana reading is one word's pronunciation, so it never contains
// whitespace — that's the whole rule. Every pooled marker in this corpus is a
// list ("ちすい vs りすい", "そけっとれんち / ぼっくすれんち / ろっかくれんち",
// "こうあつ ・ていあつ"), and every one of them has a space in it, whatever
// separator was used. Anchoring on whitespace rather than on the separator
// characters also keeps a latin abbreviation glossed with a slash and no spaces
// (安全データシート《SDS/MSDS》, ロックアウト・タグアウト《LO/TO》) out of the
// results, which is correct: those are glosses, not readings.
const HAS_KANA = /[ぁ-んァ-ヶ]/;
const POOLED = /\s/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

const findings = { unbalanced: [], empty: [], pooled: [] };

for (const file of walk(DATA)) {
  const rel = path.relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;

    const opens = (line.match(/《/g) || []).length;
    const closes = (line.match(/》/g) || []).length;
    if (opens !== closes) findings.unbalanced.push({ at, line: line.trim().slice(0, 160) });

    for (const m of line.matchAll(MARKER)) {
      const reading = m[1];
      // 《 》 with a single space is the app's fill-in-the-blank cloze marker,
      // not a reading — deliberate, documented, and not a defect.
      if (reading.trim() === '') {
        if (reading !== ' ') findings.empty.push({ at, marker: m[0] });
        continue;
      }
      // A kanji-bearing marker is a parenthetical gloss, not a reading (see
      // KANJI_RE in JpDisplay.jsx) — a legitimate second use of 《》 in this
      // corpus, so it is not a finding and must not be tested for pooling.
      if (/[一-龯]/.test(reading)) continue;
      if (HAS_KANA.test(reading) && POOLED.test(reading)) {
        findings.pooled.push({ at, marker: m[0] });
      }
    }
  });
}

const LABELS = {
  unbalanced: 'Unbalanced 《》 on one line',
  empty: 'Empty marker (not the documented 《 》 cloze)',
  pooled: 'Pooled reading — one marker carrying several terms’ readings',
};

let total = 0;
for (const [key, list] of Object.entries(findings)) {
  const unique = [...new Map(list.map((f) => [f.marker ?? f.line, f])).values()];
  total += list.length;
  console.log(`\n${LABELS[key]}: ${list.length} occurrence(s), ${unique.length} unique`);
  for (const f of unique) console.log(`  ${f.at}  ${f.marker ?? f.line}`);
}

if (total > 0) {
  console.log(`\n${total} ruby-marker issue(s). Each one renders as a wrong annotation on screen.`);
  process.exit(1);
}
console.log('\n✅ audit-ruby: every 《reading》 marker is well-formed and scoped to its own base.');
