#!/usr/bin/env node
// scripts/audit-data-text.mjs
// Text-level audit of every file under src/data: 《reading》 furigana markers,
// and characters that render as one thing while being another.
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

// The second shape of the same defect, and the one that had no whitespace to
// catch it on (2026-09-04). A word gets split across two markers and the second
// one carries the WHOLE word's reading instead of its own part:
//
//   給湯《きゅうとう》管《きゅうとうかん》     ← きゅうとうかん over one 管
//   型《かた》枠《かたわく》
//   保温材《ほおんざい》の切断《ほおんざいのせつだん》
//   通信《つうしん》ケーブル《つうしんケーブル》   ← reading repeats its own base
//
// Found from a screenshot, not from the data: a flashcard rendered
// タイル張り工事 with a reading three times too long, and a browser spreads a
// too-wide <rt> across its base, so the Japanese itself came apart into spaced
// characters. 147 occurrences across cards and quiz sets, all fixed in the same
// pass. The tell is exact and needs no judgement: two markers with nothing but
// word characters between them, where the second reading STARTS WITH the first
// one in full. Nothing legitimate does that — a real second reading starts
// where the first left off.
const kataToHira = (t) => t.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const ADJACENT_PAIR = /《([^》]+)》([一-龯々〆ヵヶぁ-んァ-ヺーA-Za-z0-9]{1,12})《([^》]+)》/g;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

// Characters that render identically to the right one and are semantically a
// different character, so nothing on screen ever reveals them. Two real cases had
// been in this data since before 2026-08-26, when the font-subsetting work found
// and documented both as out of its own scope:
//
//   Kangxi Radicals (U+2F00–U+2FDF) / CJK Radicals Supplement (U+2E80–U+2EFF) —
//   ⽅ (U+2F45) where 方 (U+65B9) belongs, 21 occurrences in wayground-sets.js.
//   Search, sort and any future text processing treat the two as unrelated, and
//   a learner typing 方 would never match.
//
//   Cyrillic а/р inside a Latin word — "gambарkan" for "gambarkan".
//
// Both fixed 2026-09-04; this keeps them fixed. The check lives here rather than
// in audit-integrity.mjs because that script only sees the CARDS corpus, and the
// Kangxi occurrences were all in quiz data — which is exactly why they survived
// three years of audits.
const LOOKALIKE = [
  [/[\u2F00-\u2FDF\u2E80-\u2EFF]/g, 'Kangxi/CJK radical codepoint — use the CJK ideograph'],
  [/[\u0400-\u04FF]/g, 'Cyrillic character — Latin look-alike typo'],
];

const findings = { unbalanced: [], empty: [], pooled: [], carriedOver: [], lookalike: [] };

for (const file of walk(DATA)) {
  const rel = path.relative(ROOT, file);
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;

    for (const [re, why] of LOOKALIKE) {
      for (const m of line.matchAll(re)) {
        findings.lookalike.push({
          at,
          marker: `${JSON.stringify(m[0])} (U+${m[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}) — ${why}`,
        });
      }
    }

    for (const m of line.matchAll(ADJACENT_PAIR)) {
      const [, r1, between, r2] = m;
      const h1 = kataToHira(r1);
      const h2 = kataToHira(r2);
      // Two characters of overlap can happen by chance; a whole reading cannot.
      if (h1.length < 2 || h2.length <= h1.length || !h2.startsWith(h1)) continue;
      if (/[一-龯]/.test(r1) || /[一-龯]/.test(r2)) continue; // glosses, not readings
      findings.carriedOver.push({ at, marker: `《${r1}》${between}《${r2}》` });
    }

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
  carriedOver:
    'Carried-over reading — a split word whose second marker repeats the first’s reading',
  lookalike: 'Look-alike codepoint (renders right, is the wrong character)',
};

let total = 0;
for (const [key, list] of Object.entries(findings)) {
  const unique = [...new Map(list.map((f) => [f.marker ?? f.line, f])).values()];
  total += list.length;
  console.log(`\n${LABELS[key]}: ${list.length} occurrence(s), ${unique.length} unique`);
  for (const f of unique) console.log(`  ${f.at}  ${f.marker ?? f.line}`);
}

if (total > 0) {
  console.log(`\n${total} data-text issue(s) — each one is invisible on screen and wrong underneath.`);
  process.exit(1);
}
console.log(
  '\n✅ audit-data-text: every 《reading》 marker is well-formed and scoped to its own base, and no look-alike codepoints.'
);
