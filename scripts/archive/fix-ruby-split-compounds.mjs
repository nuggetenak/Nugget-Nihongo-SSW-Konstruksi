// fix-ruby-split-compounds.mjs — 2026-09-13, applied once.
//
// Empties the `docs/RUBY_MISMATCH_AUDIT.md` backlog, and the backlog turned out to
// be describing the smaller half of the problem.
//
// That file recorded 144 readings "not scoped to their own base" and called the
// residue cosmetic: a reading rendered wider than the kanji it sits over. Measured
// through `parseRubyFragments`, the live figure was 39, and reading them in context
// shows most are not a scoping mistake at all. They are a **compound word split in
// two, with a kana inserted between the halves**:
//
//     転《ころ》び落《てんらく》     ->  転落《てんらく》
//     整《ととの》え理《せいり》     ->  整理《せいり》
//     整《ととの》え頓《せいとん》   ->  整頓《せいとん》
//     転《ころ》び倒《てんとう》     ->  転倒《てんとう》
//     安全管《かん》理《あんぜんかんり》 -> 安全管理《あんぜんかんり》
//     上《うえ》水道《じょうすいどう》   -> 上水道《じょうすいどう》
//
// The first kanji was given a *standalone* dictionary reading (転 as ころ, from
// 転ぶ; 整 as ととの, from 整える; 上 as うえ) and the second was left carrying the
// whole compound's reading. The visible Japanese is then not a word: the deck
// showed `転び落`, `整え理`, `整え頓`, `安全管理` spelled with a reading break
// through the middle of 管理. A learner reading 整え理 and 転び落 is learning
// something that does not exist, and no audit could see it, because
// `audit-data-text` checks that markers are well-formed and `ruby-scope` only
// measures how wide a reading renders. Both were true of this data. The word being
// wrong was the part nothing looked at.
//
// So this is filed as a content correction, not a furigana tidy-up, and
// RUBY_MISMATCH_AUDIT.md's "not currently visually broken / cosmetic-accuracy debt"
// framing was wrong in the direction that mattered.
//
// Four sites are deliberately left alone: `雷《かみなり》`, four kana over one
// kanji, is simply how 雷 is read. `ruby-scope.test.js` names them explicitly now
// instead of carrying a budget, because a budget cannot tell a genuinely long
// reading from a backlog of broken ones — which is how 39 broken readings sat behind
// a number for five weeks.
//
//   node scripts/archive/fix-ruby-split-compounds.mjs --check
//   node scripts/archive/fix-ruby-split-compounds.mjs
//
// Then `node scripts/merge-cards.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILES = [
  'src/data/source/cards-common.js',
  'src/data/source/cards-lifeline.js',
  'src/data/cards.js',
];

const REPLACEMENTS = [
  // ── A compound split by an inserted kana; the visible word was wrong ───────
  ['転《ころ》び落《てんらく》', '転落《てんらく》', '転落, not 転び落'],
  ['整《ととの》え理《せいり》', '整理《せいり》', '整理, not 整え理'],
  ['整《ととの》え頓《せいとん》', '整頓《せいとん》', '整頓, not 整え頓'],
  ['転《ころ》び倒《てんとう》', '転倒《てんとう》', '転倒, not 転び倒'],
  ['機体重《かさ》ね量《きたいじゅうりょう》', '機体重量《きたいじゅうりょう》', '機体重量, not 機体重ね量'],
  ['重《かさ》ね量《じゅうりょう》', '重量《じゅうりょう》', '重量, not 重ね量'],
  ['法施行《おこな》う令《ほうしこうれい》', '法施行令《ほうしこうれい》', '道路法施行令, not 法施行う令'],

  // ── A compound annotated twice, the first half with a reading it does not have
  ['安全管《かん》理《あんぜんかんり》', '安全管理《あんぜんかんり》', 'one word, one marker'],
  ['上《うえ》水道《じょうすいどう》', '上水道《じょうすいどう》', '上 here is じょう, not うえ'],
  ['橋《はし》梁《きょうりょう》', '橋梁《きょうりょう》', '橋 here is きょう, not はし'],
  ['下部《ぶ》工《かぶこう》', '下部工《かぶこう》', '部 is read inside the compound'],
  ['不《ふ》良《ふりょう》', '不良《ふりょう》', 'one word, one marker'],
  ['屋上《うえ》緑化《おくじょうりょっか》', '屋上緑化《おくじょうりょっか》', '上 here is じょう'],
  ['地上《うえ》躯体《ちじょうくたい》', '地上躯体《ちじょうくたい》', 'as above'],
  ['通《つう》り芯《とおりしん》', '通り芯《とおりしん》', '通り here is とおり, not つう'],
  ['立《た》て墨《たてずみ》', '立て墨《たてずみ》', 'one term; the て is real okurigana'],
  [
    '上着前《まえ》開《うわぎまえびらき》け禁止《うわぎまええきんし》',
    '上着《うわぎ》前開《まえびら》け禁止《きんし》',
    'three words, three markers — and the third reading had a stray え in it',
  ],
  ['締《し》め固《しめかた》め', '締《し》め固《かた》め', '固 is かた; しめかた was the whole verb'],

  // ── The reading transliterated katakana or spelled a digit ─────────────────
  [
    'ケーブル繰り出し機《けえぷるくりだしき》',
    'ケーブル繰《く》り出《だ》し機《き》',
    'katakana reads itself; three kanji need three readings',
  ],
  [
    '発泡スチロール断熱材《はっぽうすちろるだんねつざい》',
    '発泡《はっぽう》スチロール断熱材《だんねつざい》',
    'as above',
  ],
  [
    'テスター / 万用計《てすたあばにょうけい》',
    'テスター / 万用計《ばんようけい》',
    'the reading transliterated テスター and then misspelled ばんよう as ばにょう',
  ],
  ['の3層《さんそう》', 'の三層《さんそう》', "a card we authored, so 7.4.0's kanji-numeral fix applies"],
  ['1月《いちがつ》', '1月《がつ》', 'a date keeps its digit; the annotation moves'],

  // ── A whole title or sentence in one marker ───────────────────────────────
  [
    '建設業法の5つの目的《けんせつぎょうほうのいつつのもくてき》',
    '建設業法《けんせつぎょうほう》の5つの目的《もくてき》',
    'a card title read out as one string',
  ],
  [
    '上下水道工事の3種類の事故リスク《じょうげすいどうこうじのしゅるいのじこりすく》',
    '上下水道工事《じょうげすいどうこうじ》の3種類《しゅるい》の事故《じこ》リスク',
    'as above, and the reading had dropped 3つの entirely',
  ],
  [
    'よろしくお願いします《よろしくおねがいします》',
    'よろしくお願《ねが》いします',
    'a set phrase; only 願 needs a reading',
  ],
  ['ちょっと待ってください《ちょっとまってください》', 'ちょっと待《ま》ってください', 'as above'],
  ['お疲れ様でした《おつかれさまでした》', 'お疲《つか》れ様《さま》でした', 'as above'],

  // ── Wrong reading, caught while here ──────────────────────────────────────
  [
    'GX形ダクタイル鋳鉄管《こうかん》',
    'GX形《がた》ダクタイル鋳鉄管《ちゅうてつかん》',
    '鋳鉄管 is ちゅうてつかん; こうかん is 鋼管, a different card',
  ],
  ['曲げ配管《まがりはいかん》', '曲《ま》げ配管《はいかん》', '曲げ is まげ; まがり would be 曲がり'],
];

const check = process.argv.includes('--check');
let total = 0;
for (const rel of FILES) {
  const path = join(ROOT, rel);
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  let n = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (!text.includes(from)) continue;
    n += text.split(from).length - 1;
    text = text.split(from).join(to);
  }
  if (n > 0) {
    console.log(`  ${String(n).padStart(3)}  ${rel}`);
    total += n;
    if (!check) writeFileSync(path, text);
  }
}
console.log(`${check ? 'would replace' : 'replaced'} ${total} occurrence(s)`);
if (!check && total > 0) console.log('now run: node scripts/merge-cards.mjs');
