// fix-ruby-non-kana.mjs — 2026-09-13, applied once.
//
// A 《》 marker in this corpus means "this is how the preceding text is read", and
// a reading is kana. 21 markers held something else: a latin abbreviation (ALGC,
// SDS/MSDS, CCUS), a digit the base text already shows (`時間《6じかん》`), or an
// entire sentence with its commas (`工法《こうじょうでせいさくしたくいを、げんばに…》`).
// Each of those renders as furigana that is not a reading.
//
// HOW THIS LIST WAS ARRIVED AT, because the first attempt was wrong and the wrong
// version would have edited ~200 strings that were fine. A hand-rolled heuristic —
// "take the run of kanji immediately before the marker, flag a reading longer than
// three kana per character" — reported 201 offending strings across the three quiz
// banks. It was ~95% false positives, because it does not model `extendBaseLeft`:
// the parser grows a base leftwards whenever the text before it has kana to pin the
// extension, so `管の据付《かんのすえつけ》` is already annotated correctly and needs
// nothing. Measured through `parseRubyFragments` itself, the real figure was 13
// over-wide readings in 18 sites, and this non-kana class was the sibling of it.
// The lesson is the one AGENT_WORKFLOW §1.3 already states: a claim about the data
// is a claim to check against the code that reads it, and that includes a claim
// this session generated itself.
//
// Two rules were applied, and the difference between them matters:
//
//   - Where the marker is OUR annotation, the reading is scoped to the kanji it can
//     honestly cover and the latin or digit stays in the visible text, exactly as
//     7.4.0 did for `CD管《しいぢいかん》` -> `CD管《かん》`: letters are read as
//     letters, so the reading should only ever have covered the kanji.
//   - Where the marker held a GLOSS rather than a reading (`安全データシート
//     《SDS/MSDS》`), the gloss moves into the visible text in parentheses and the
//     kanji gets its actual reading. A gloss in a reading slot is not a scoping
//     mistake, it is a different field.
//
// The JAC Official sets keep their numerals. `6時間《じかん》`, not `六時間`: the
// numeral is the answer content in that question, and 7.4.0's kanji-numeral fix
// (`1回` -> `一回`) was applied to a bank this repo authored. The Official sets are
// the exam's own wording, so the annotation moves and the text does not.
//
// One replacement is a correction rather than a rescope: `共板《きょうばん》` is wrong.
// 共板フランジ工法 is tomoita — the reading the second, over-wide marker on the same
// string was carrying all along, which is how the error survived.
//
//   node scripts/archive/fix-ruby-non-kana.mjs --check   (report, change nothing)
//   node scripts/archive/fix-ruby-non-kana.mjs           (apply)
//
// After applying, `node scripts/merge-cards.mjs` regenerates src/data/cards.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const FILES = [
  'src/data/source/cards-common.js',
  'src/data/source/cards-lifeline.js',
  'src/data/cards.js',
  'src/data/wayground-sets.js',
  'src/data/jac-mockup-sets.js',
  'src/data/sets/jac/jac-teori.js',
  'src/data/sets/jac/jac-lifeline.js',
  'src/data/angka-kunci.js',
  'src/data/danger-pairs.js',
  'src/data/confusion-pairs.js',
];

/** [from, to, why] — `why` is the reason, not a restatement of the diff. */
const REPLACEMENTS = [
  // ── Latin prefix inside the reading ────────────────────────────────────────
  ['A呼称《Aこしょう》', 'A呼称《こしょう》', 'the A is read as a letter'],
  ['B呼称《Bこしょう》', 'B呼称《こしょう》', 'the B is read as a letter'],
  ['KY活動《KYかつどう》', 'KY活動《かつどう》', 'KY is read as letters'],
  ['EF接合《EFせつごう》', 'EF接合《せつごう》', 'EF is read as letters'],
  ['ＥＦ接合《ＥＦせつごう》', 'ＥＦ接合《せつごう》', 'full-width twin of the above'],
  ['FRP防水工事《FRPぼうすいこうじ》', 'FRP防水工事《ぼうすいこうじ》', 'FRP is read as letters'],
  [
    'EF接合の斜め切断許容限度《EFせつごうのななめせつだんきょようげんど》',
    'EF接合《せつごう》の斜《なな》め切断《せつだん》許容限度《きょようげんど》',
    'one marker for a four-word phrase; split per word',
  ],
  [
    'CCUSの4レベルと条件《CCUSのよんれべるとじょうけん》',
    'CCUSの4レベルと条件《じょうけん》',
    'the reading spelled the acronym, the digit and the katakana back out',
  ],
  [
    'GX形ダクタイル鋳鉄管《GXがただくたいるちゅうてつかん》',
    'GX形《がた》ダクタイル鋳鉄管《ちゅうてつかん》',
    'GX and the katakana read themselves; two kanji runs need readings',
  ],
  [
    'GX形ダクタイル鋳鉄管《GXがたダクタイルちゅうてつかん》',
    'GX形《がた》ダクタイル鋳鉄管《ちゅうてつかん》',
    'the quiz-bank spelling of the same term',
  ],
  [
    '光パルス試験機《ひかりぱるすしけんき（OTDR）》（OTDR）',
    '光《ひかり》パルス試験機《しけんき》（OTDR）',
    'the reading carried a parenthesised acronym the visible text already shows',
  ],

  // ── A gloss in a reading slot: fixed in the RENDERER, not here ────────────
  // `安全データシート《SDS/MSDS》`, `アルミガラス布《ALGC》` and `建設キャリアアップ
  // システム《CCUS》` are the same authoring convention as `危険予知活動《KY活動》`,
  // which JpDisplay already passes through as literal text — they differ only in
  // that their gloss has no kanji in it to be recognised by. So the fix belongs in
  // `isGlossNotReading`, and the data is left exactly as written.
  //
  // This was first done the other way, moving each abbreviation into the visible
  // text as `（ALGC）`. It worked and it was wrong twice over, and both ways are worth
  // recording, because a transform that matches on string content is exactly this
  // fragile:
  //
  //   1. Adding seven visible characters to a correct answer pushed two JAC Mockup
  //      questions back over item 114's per-question gap bound — the tell 7.4.0 had
  //      just spent a session closing on that bank. A ruby fix is not allowed to
  //      re-open a distractor-balance fix. `question-option-shuffle.test.js` caught it.
  //   2. Undoing it then matched a string in `wayground-sets.js` that was *already*
  //      `アルミガラス布《ぬの》（ALGC）` on `main` — the very form being proposed — and
  //      rewrote it to the JAC bank's `《ALGC》` spelling. The two banks' wordings for
  //      that question then normalised identically and `audit:overlap` failed on a
  //      259th duplicate group. The existing corpus already used this convention; the
  //      wayground string is left exactly as `main` had it, and only the JAC
  //      occurrences were ever touched by this script.
  //
  // The second one reached CI, because a grep for success markers over `npm run
  // validate` output hid a non-zero exit for three commits. Read the exit code.

  // ── Digit inside the reading (JAC Official: annotate, never rewrite) ───────
  ['時間《6じかん》', '時間《じかん》', 'the 6 is the answer; it belongs in the text'],
  ['時間《8じかん》', '時間《じかん》', 'as above'],
  ['時間《12じかん》', '時間《じかん》', 'as above'],
  ['100A以上《100Aいじょう》', '100A以上《いじょう》', 'the rating is the answer'],
  ['15A以下《15Aいか》', '15A以下《いか》', 'as above'],
  ['1日《いちにち》', '1日《にち》', 'scoped to the kanji; the numeral stays as the exam prints it'],
  ['１日《いちにち》', '１日《にち》', 'full-width twin'],
  ['１組《ひとくみ》', '１組《くみ》', 'as above'],

  // ── A whole phrase or sentence as one reading ─────────────────────────────
  [
    '下請負業者《したうけおいぎょうしゃ》',
    '下請《したうけ》負業者《おいぎょうしゃ》',
    'a pure-kanji prefix gives extendBaseLeft no anchor, so the base stayed at 負業者',
  ],
  [
    // Wayground had already split 下請 off and then left the whole phrase's reading
    // on the remainder, which is the same defect wearing a partial fix.
    '下請《したうけ》負業者《したうけおいぎょうしゃ》',
    '下請《したうけ》負業者《おいぎょうしゃ》',
    'the second marker repeated the reading the first had already given',
  ],
  [
    'ダクト接続《せつぞく》方法《ダクトのせつぞくほうほう》',
    'ダクト接続《せつぞく》方法《ほうほう》',
    'the second marker repeated the whole phrase the first had already scoped',
  ],
  [
    '共板《きょうばん》フランジ工法《ともいたフランジこうほう》',
    '共板《ともいた》フランジ工法《こうほう》',
    'a correction: 共板フランジ工法 is tomoita, and the over-wide marker knew it',
  ],
  [
    'ベンダー曲《ま》げ加工《ベンダーまげかこう》',
    'ベンダー曲《ま》げ加工《かこう》',
    '曲 was already annotated; the second marker re-read the whole term',
  ],
  [
    '興味を持たないこと《きょうみをもたないこと》',
    '興味《きょうみ》を持《も》たないこと',
    'a clause in one marker',
  ],
  [
    '上着のボタンは外したままにする《うわぎのボタンははずしたままにする》',
    '上着《うわぎ》のボタンは外《はず》したままにする',
    'a full sentence in one marker',
  ],
  [
    '適切な睡眠と食事をとること《てきせつなすいみんとしょくじをとること》',
    '適切《てきせつ》な睡眠《すいみん》と食事《しょくじ》をとること',
    'a full clause in one marker',
  ],
  [
    '喫煙は、まわりから見えない場所で隠れてする《きつえんは、まわりからみえないばしょでかくれてする》',
    '喫煙《きつえん》は、まわりから見《み》えない場所《ばしょ》で隠《かく》れてする',
    'a full sentence, commas included, as furigana',
  ],
  [
    '工場で製作した杭を、現場に運んで打ち込む工法《こうじょうでせいさくしたくいを、げんばにはこんでうちこむこうほう》',
    '工場《こうじょう》で製作《せいさく》した杭《くい》を、現場《げんば》に運《はこ》んで打《う》ち込《こ》む工法《こうほう》',
    'the longest of them: 30 kana of sentence over one kanji',
  ],
  [
    'インジケーター確認《いんじけえたあかくにん》',
    'インジケーター確認《かくにん》',
    'the reading transliterated the katakana as well',
  ],
  [
    'アングルフランジ工法《アングルフランジこうほう》',
    'アングルフランジ工法《こうほう》',
    'the katakana reads itself',
  ],
];

const check = process.argv.includes('--check');
let total = 0;
const perFile = [];

for (const rel of FILES) {
  const path = join(ROOT, rel);
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    continue; // a file this tree does not have
  }
  const before = text;
  let fileCount = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (!text.includes(from)) continue;
    const n = text.split(from).length - 1;
    text = text.split(from).join(to);
    fileCount += n;
  }
  if (fileCount > 0) {
    perFile.push([rel, fileCount]);
    total += fileCount;
    if (!check && text !== before) writeFileSync(path, text);
  }
}

for (const [rel, n] of perFile) console.log(`  ${String(n).padStart(3)}  ${rel}`);
console.log(`${check ? 'would replace' : 'replaced'} ${total} occurrence(s)`);
if (!check && total > 0) console.log('now run: node scripts/merge-cards.mjs');
