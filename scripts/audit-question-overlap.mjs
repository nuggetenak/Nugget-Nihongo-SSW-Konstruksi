// scripts/audit-question-overlap.mjs
// Compares the two practice banks against each other. Run: node scripts/audit-question-overlap.mjs
//
// Why this exists: nothing in the other five audits ever compared a question in
// one source file against a question in another, and that gap cost real
// teaching. `KY活動の4ステップで最後のステップは？` appears in both banks and
// they gave different answers -- Wayground said 目標宣言 (correct: the KYT
// rounds are 現状把握 → 本質追究 → 対策樹立 → 目標設定), JAC Mockup said
// 対策を決めて実行する, which is round 3. A learner drilling both banks was
// taught two answers to one hazard-prediction question and marked wrong for the
// correct one in half of them. Every audit passed the whole time, because each
// only ever looked at one file.
//
// What it checks:
//   1. CONTRADICTIONS -- two questions that normalise to the same text but have
//      different correct answers. Fails the build unless the pair is on the
//      reviewed allowlist below.
//   2. OVERLAP CEILING -- how much of the corpus is duplicated at all. A budget
//      in the shape src/tests/ruby-scope.test.js uses: it may fall, it must not
//      rise. Half the 980 questions already sit in a duplicate group, which is a
//      content-consolidation question rather than a bug, but it should not get
//      quietly worse.
//
// Normalisation strips furigana 《》, whitespace and bracket characters, because
// the two banks were authored separately and differ in all three. Comparing
// verbatim text finds barely half of these.
import { WAYGROUND_SETS } from '../src/data/wayground-sets.js';
import { JAC_MOCKUP_SETS } from '../src/data/jac-mockup-sets.js';

// Ceiling, not a target. Lower it when duplicates are genuinely consolidated.
const MAX_DUPLICATE_GROUPS = 258;

// Pairs whose answers differ only in phrasing -- one bank spells the answer out
// and the other abbreviates it (安全データシート vs 安全データシートSDS/MSDS).
// All 23 were read individually on 2026-09-08; none is a teaching conflict, and
// they must NOT be "fixed" into identical strings. Anything not on this list is
// treated as a real contradiction and fails.
const REVIEWED_VARIANTS = new Set([
  // KY危険予知活動  |  KY活動
  'jmt01/27 ~ wt01/8',
  // 清潔に保つ  |  清潔に保つ衛生管理
  'jmt04/23 ~ wt01/14',
  // 安全データシート  |  安全データシートSDS/MSDS
  'jmt01/1 ~ wt02/9 ~ wt06/7',
  // 事業主が全額負担する  |  事業主使用者が全額負担する
  'jmt01/18 ~ wt03/18',
  // 1件500万円以上  |  1件500万円以上建築工事は1500万円以上
  'jmt02/3 ~ wt04/3',
  // 現場で働くすべての労働者の安全を管理する  |  現場で働くすべての労働者下請含むの安全を管理する
  'jmt02/9 ~ wt05/4',
  // 119番  |  119番消防・救急
  'jmt03/17 ~ wt08/6',
  // 元請負業者  |  元請負業者現場の施工管理責任者
  'jmt02/29 ~ wt08/20',
  // 元請業者  |  元請業者施工管理者
  'jmt04/11 ~ wt09/1',
  // 維持  |  維持しつけ
  'jmt04/20 ~ wt09/3',
  // 土留めを設置する  |  土留め矢板などを設置する
  'jmt04/22 ~ wt09/4',
  // 統括安全衛生管理体制  |  統括安全衛生管理体制混在作業における安全管理
  'jmt06/11 ~ wt10/11',
  // 強い光と飛散物から目を守る  |  強い光アーク光と飛散物から目を守る
  'jml05/6 ~ wgl03/11',
  // 厚さ計  |  厚さ計ノギスまたは専用ゲージ
  'jml05/12 ~ wgl03/17',
  // アルミガラス布  |  アルミガラス布ALGC
  'jml05/19 ~ wgl04/19',
  // 75度程度  |  75度程度開き止め金具を確実に
  'jml02/3 ~ wgl07/3',
  // 最低部  |  最低部末端
  'jml02/5 ~ wgl07/5',
  // ろう付け  |  ろう付けブレージング
  'jml02/11 ~ wgl07/11',
  // 2m以内  |  2m以内ショックアブソーバー含む
  'jml02/14 ~ wgl07/14',
  // 対角順  |  対角順クロス締め
  'jml02/20 ~ wgl07/20',
  // 先芯  |  先芯鉄先・樹脂先
  'jml03/5 ~ wgl08/5',
  // 安全帯  |  安全帯墜落防止
  'jml03/6 ~ wgl08/6',
  // 断熱材  |  断熱材吹付け
  'jml04/1 ~ wgl09/1',
]);

const norm = (s = '') =>
  s
    .replace(/《[^》]*》/g, '')
    .replace(/\s+/g, '')
    .replace(/[（）()｛｝[\]「」『』]/g, '');

const all = [];
for (const set of [...WAYGROUND_SETS, ...JAC_MOCKUP_SETS]) {
  for (const q of set.questions ?? []) {
    all.push({
      key: `${set.id}/${q.id}`,
      q: q.q,
      nq: norm(q.q),
      na: norm(q.opts?.[q.ans]),
    });
  }
}

const groups = new Map();
for (const q of all) {
  if (!groups.has(q.nq)) groups.set(q.nq, []);
  groups.get(q.nq).push(q);
}
const duplicates = [...groups.values()].filter((g) => g.length > 1);
const conflicts = duplicates.filter((g) => new Set(g.map((q) => q.na)).size > 1);

const idOf = (g) =>
  g
    .map((q) => q.key)
    .sort()
    .join(' ~ ');

const unreviewed = conflicts.filter((g) => !REVIEWED_VARIANTS.has(idOf(g)));
const stale = [...REVIEWED_VARIANTS].filter((id) => !conflicts.some((g) => idOf(g) === id));

let failed = false;

if (unreviewed.length) {
  failed = true;
  console.log(`❌ ${unreviewed.length} question(s) answered differently in the two banks:`);
  for (const g of unreviewed) {
    console.log(`\n  ${g[0].q.slice(0, 80)}`);
    for (const q of g) console.log(`    ${q.key.padEnd(12)} → ${q.na}`);
  }
  console.log(
    '\nDecide which answer is right and fix the wrong one. If the two answers are' +
      '\nthe same thing phrased differently, add the id line to REVIEWED_VARIANTS' +
      '\nin this file with the answers in a comment above it.'
  );
}

if (duplicates.length > MAX_DUPLICATE_GROUPS) {
  failed = true;
  console.log(
    `\n❌ Duplicate groups rose to ${duplicates.length} (ceiling ${MAX_DUPLICATE_GROUPS}).` +
      '\nAsking the same question twice is not a bug, but the overlap is already' +
      '\nover half the corpus and should not grow. Consolidate, or raise the' +
      '\nceiling deliberately and say why.'
  );
}

if (failed) process.exit(1);

if (stale.length) {
  console.log(
    `ℹ️  ${stale.length} REVIEWED_VARIANTS entr${stale.length === 1 ? 'y no longer conflicts' : 'ies no longer conflict'} — safe to delete:`
  );
  for (const id of stale) console.log(`    ${id}`);
}

const inGroup = duplicates.reduce((a, g) => a + g.length, 0);
console.log(
  `✅ No contradictions across the two banks ` +
    `(${all.length} questions, ${duplicates.length}/${MAX_DUPLICATE_GROUPS} duplicate groups ` +
    `covering ${inGroup}, ${REVIEWED_VARIANTS.size} reviewed phrasing variants).`
);
