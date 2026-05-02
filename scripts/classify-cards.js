#!/usr/bin/env node
// ─── scripts/classify-cards.js ────────────────────────────────────────────────
// Classifies jenis_kerja and alat_umum cards into proper track-specific or
// common categories based on content keyword analysis.
// 
// Usage:
//   node scripts/classify-cards.js          → dry run (show classification)
//   node scripts/classify-cards.js --apply  → write changes to cards.js
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'fs';

// ── Keyword rules ──────────────────────────────────────────────────────────
// Priority: first matching rule wins. More specific rules go first.

const RULES = [
  // ── Lifeline-specific (MEP) ──
  { match: /電気工事|電工|配線|コンセント|ブレーカー|電力量計|分電盤|幹線|内線工事|外線工事|接地工事|PF管|合成樹脂|CD管|EM.*ケーブル/, to: 'denki' },
  { match: /配管|パイプ|管工事|給排水衛生|バルブ|フランジ|継手.*管|管.*継手|溶接接合.*管|ねじ.*管|水圧テスト|排水トラップ|通気管|給水.*管|排水.*管|浄化槽|ヘッダー工法/, to: 'haikan' },
  { match: /通信工事|光ファイバ|同軸ケーブル|LAN配線|電話工事|通信機器/, to: 'tsushin' },
  { match: /消防設備|消火|スプリンクラー|火災報知|感知器|避難.*消防|消防.*分類/, to: 'shoubou' },
  { match: /保温保冷|保温工事|保冷|ラッキング|グラスウール|ロックウール|配管.*断熱/, to: 'hoon' },
  { match: /空調|ダクト|エアコン|冷凍|冷媒|加湿器|除湿器|冷凍空気調和|換気/, to: 'setsubi_kougu' },  // lifeline HVAC → L6 bucket
  { match: /ガス工事|都市ガス|ガス管|ガス配管/, to: 'haikan' },  // gas piping → L1
  { match: /ライフライン工事|設備工事$/, to: 'setsubi_kougu' },  // overview of lifeline
  { match: /築炉|耐火物|炉/, to: 'setsubi_kougu' },  // furnace work → lifeline

  // ── Bangunan (Kenchiku) — check BEFORE Sipil to avoid ローラー/アスファルト overlap ──
  { match: /型枠|支保工.*型枠|型枠.*支保工|せき板|セパレーター/, to: 'kenchiku_kutai' },
  { match: /鉄筋|継手.*鉄筋|鉄筋.*継手|配筋|かぶり厚/, to: 'kenchiku_kutai' },
  { match: /コンクリート圧送|生コン|レディミクスド|コンクリート.*チーム/, to: 'kenchiku_kutai' },
  { match: /左官|漆喰|モルタル.*仕上|研ぎ出し|洗い出し/, to: 'kenchiku_shiage' },
  { match: /防水工事|ウレタン.*防水|FRP|シート.*防水|アスファルト.*防水|シーリング.*防水/, to: 'kenchiku_shiage' },
  { match: /塗装工事|はけ.*ローラー|エアスプレー/, to: 'kenchiku_shiage' },
  { match: /タイル|クロス|壁紙/, to: 'kenchiku_shiage' },
  { match: /建具|サッシ|カバー工法|シャッター|自動ドア|ガラス/, to: 'kenchiku_shiage' },
  { match: /軽天|LGS|ボード貼り|石膏ボード|軽量鉄骨/, to: 'kenchiku_shiage' },
  { match: /木造|軸組|在来|大工|宮大工/, to: 'kenchiku_kutai' },
  { match: /鉄骨構造|ブレース.*ラーメン|S造|RC造|SRC造|CB造|構造種類|重量鉄骨/, to: 'kenchiku_kutai' },
  { match: /建て逃げ|水平積み上げ/, to: 'kenchiku_kutai' },
  { match: /石工事|大理石|御影石/, to: 'kenchiku_shiage' },
  { match: /造園|植栽|屋上緑化/, to: 'kenchiku_shiage' },
  { match: /コンバージョン/, to: 'kenchiku_kutai' },
  { match: /雨仕舞/, to: 'kenchiku_shiage' },
  { match: /山留め|支保工$/, to: 'kenchiku_kutai' },
  { match: /耐震|制振|免振/, to: 'kenchiku_kutai' },
  { match: /アンカー|あと施工/, to: 'kenchiku_kutai' },
  { match: /コンクリートブロック/, to: 'kenchiku_kutai' },
  { match: /吹付けウレタン/, to: 'kenchiku_shiage' },

  // ── Sipil (Doboku) ──
  { match: /土工事|掘削|盛り土|切り土|埋め戻し|根切り|余堀り|鋤取り|床付け|段切り|突き固め|水締め/, to: 'doboku_doko' },
  { match: /舗装|道路|路床|路盤|表層|基層|アスファルト.*フィニッシャ|転圧|ローラー/, to: 'doboku_hoso' },
  { match: /橋梁|トンネル|ダム|シールド|NATM|推進|開削|ケーソン|防波堤/, to: 'doboku_doko' },
  { match: /河川|海岸|護岸|堤防|水路|港湾|岸壁|浚渫|埋立|海洋土木|治水|利水/, to: 'doboku_doko' },
  { match: /法面|モルタル吹付け|植生工法/, to: 'doboku_doko' },
  { match: /排水工事|暗渠|側溝|ディープウェル|ウェルポイント/, to: 'doboku_haisui' },
  { match: /杭工事|杭.*材料|場所打ち杭|既成杭|支持層|ボーリング調査|地盤/, to: 'doboku_haisui' },
  { match: /鉄道工事|災害復旧/, to: 'doboku_doko' },
  { match: /遣り方|水貫|水盛り|丁張り/, to: 'doboku_doko' },
  { match: /上下水道|浄水場|下水処理/, to: 'doboku_haisui' },
  { match: /さく井|温泉井|地熱井/, to: 'doboku_haisui' },

  // ── Common / Construction Management (K4) ──
  { match: /施工管理|品質|工程管理|原価管理|安全管理/, to: 'sekou' },
  { match: /測量|トランシット|トータルステーション|レベル.*器|水準器|コンベックス|墨出し|墨つぼ|下げ振り/, to: 'sekou' },
  { match: /解体工事|アスベスト/, to: 'sekou' },
  { match: /溶接.*分類|融接|圧接|ろう接/, to: 'sekou' },
  { match: /足場|とび工事|とび.*種類/, to: 'sekou' },
  { match: /受注一品/, to: 'sekou' },
  { match: /丸ダクト/, to: 'setsubi_kougu' },  // specific duct technique → lifeline
];

// ── Alat_umum rules (tools) ──────────────────────────────────────────────
const TOOL_RULES = [
  // Lifeline-specific tools
  { match: /電工ナイフ|ワイヤストリッパ|圧着|絶縁テープ|検電器|クランプメータ|テスタ|ストリップゲージ|リングスリーブ|ペンチ.*電|活線/, to: 'denki' },
  { match: /パイプレンチ|パイプカッター|パイプ万力|パイプねじ切|管.*カッター|フレアツール|ベンダー.*管|チューブカッター|パイプバイス/, to: 'haikan' },
  { match: /ファイバカッター|通信.*工具/, to: 'tsushin' },
  { match: /ラッキング.*工具|保温.*工具/, to: 'hoon' },

  // Genuinely common tools (used across all tracks)
  { match: /サンダー|グラインダー|ドリル|ハンマー|スパナ|レンチ|ドライバー|ノコギリ|ペンチ(?!.*電)|プライヤ|ニッパ|水平器|墨つぼ|コンベックス|バール|玄能|カッター(?!.*パイプ|.*ファイバ)|スケール|差し金|鑿|鉋|釘|ビス|ボルト|ナット|ワッシャ/, to: 'sekou' },
  { match: /万力|バイス(?!.*パイプ)|クランプ(?!.*メータ)|ジャッキ|チェーンブロック/, to: 'sekou' },
  { match: /溶接.*機|アーク|TIG|半自動/, to: 'sekou' },
  
  // Survey/measurement tools → common
  { match: /トランシット|トータルステーション|レベル|水準器|オートレベル|セオドライト/, to: 'sekou' },
  
  // Heavy machinery → depends on context, default common
  { match: /クレーン|バックホウ|ユンボ|ブルドーザ|ショベル|ダンプ/, to: 'sekou' },
];

// ── Main ──────────────────────────────────────────────────────────────────

const cardsPath = new URL('../src/data/cards.js', import.meta.url).pathname;
const raw = readFileSync(cardsPath, 'utf-8');

// Parse cards array - extract the export
const match = raw.match(/export const CARDS = \[([\s\S]*)\];/);
if (!match) { console.error('Could not parse cards.js'); process.exit(1); }

// Use dynamic import instead
const { CARDS } = await import('../src/data/cards.js');

const changes = [];
let unchanged = 0;

for (const card of CARDS) {
  if (card.category !== 'jenis_kerja' && card.category !== 'alat_umum') continue;
  
  const text = card.jp + ' ' + (card.id_text || '') + ' ' + (card.desc || '');
  const rules = card.category === 'alat_umum' ? [...TOOL_RULES, ...RULES] : RULES;
  
  let newCat = null;
  for (const rule of rules) {
    if (rule.match.test(text)) {
      newCat = rule.to;
      break;
    }
  }
  
  if (!newCat) {
    // Fallback: keep as sekou (common construction management)
    newCat = 'sekou';
  }
  
  if (newCat !== card.category) {
    changes.push({ id: card.id, jp: card.jp, from: card.category, to: newCat });
  } else {
    unchanged++;
  }
}

// Summary
const byCat = {};
changes.forEach(c => {
  byCat[c.to] = (byCat[c.to] || 0) + 1;
});

console.log(`\n=== CLASSIFICATION RESULTS ===`);
console.log(`Cards to reclassify: ${changes.length}`);
console.log(`Cards unchanged: ${unchanged}`);
console.log(`\nBy new category:`);
Object.entries(byCat).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

// Show some examples per category
console.log(`\n=== SAMPLES ===`);
const seen = new Set();
for (const c of changes) {
  if (!seen.has(c.to)) {
    seen.add(c.to);
    const samples = changes.filter(x => x.to === c.to).slice(0, 3);
    console.log(`\n[${c.to}]`);
    samples.forEach(s => console.log(`  #${s.id} ${s.jp} (was: ${s.from})`));
  }
}

if (process.argv.includes('--apply')) {
  console.log(`\n=== APPLYING CHANGES ===`);
  let modified = raw;
  let applied = 0;
  for (const c of changes) {
    // Cards are single-line: { id: XX, category: "old_cat", ...
    const pattern = `id: ${c.id}, category: "${c.from}"`;
    const replacement = `id: ${c.id}, category: "${c.to}"`;
    if (modified.includes(pattern)) {
      modified = modified.replace(pattern, replacement);
      applied++;
    } else {
      console.warn(`  ⚠ Could not find: ${pattern}`);
    }
  }
  writeFileSync(cardsPath, modified, 'utf-8');
  console.log(`  ✅ Applied ${applied}/${changes.length} changes to cards.js`);
} else {
  console.log(`\nDry run. Use --apply to write changes.`);
}
