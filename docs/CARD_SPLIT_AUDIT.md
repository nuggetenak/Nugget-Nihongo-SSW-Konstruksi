# Card split audit — every card, one verdict each

Companion to `docs/RUBY_MISMATCH_AUDIT.md`, same shape: a row per card, and a status you
can grep. This one is the worksheet for the multi-vocabulary split, and the permanent
record of **why 113 cards were left whole** — that half matters more than the
split list, because it is the part a future pass would otherwise redo from scratch.

Derived: 2026-09-07 against 1438 cards.

## Outcome

This table is the decision record, taken against the corpus as it stood at 1,438
cards. What actually shipped, for anyone reconciling the two:

| | |
|---|---|
| Starting corpus | 1,438 |
| Duplicate cards merged before splitting | −16 |
| Bundles split, and their children | **1,626** |

The split ran in four passes — a mechanical batch where no Indonesian had to be
invented, two agent-authored batches, and a hand-written tail after the agent
budget ran out. Between them, 199 of the 229 SPLIT verdicts were executed.

Three cards keep their bundle deliberately and are reclassified header-only:
**1308**, **1328** and **1390** name a category in `jp` and list their real items
only in `desc`, so splitting each means authoring new headwords with new ruby
rather than cutting a string. 1390 additionally promises "5種の屋根工事" that the
card never enumerates.

Splitting created 121 duplicate terms of its own — 親墨 came out of three separate
bundles — which were merged on lowest id, and nine more pairs that differed only
by a `type` inherited from a recap card. Both are described in the commits that
made them.

## Method

Twelve agents over twelve line-shards of `src/data/source/cards-{common,lifeline}.js`,
each shard read in full — no sampling. Every shard reported a tally that reconciles to its
own card count, and the twelve sum to 1438. Where two shards judged near-identical
content differently, the conflict is recorded and resolved below rather than silently picked.

## Totals

| Verdict | Cards |
|---|---|
| SPLIT | 229 |
| KEEP | 113 |
| MERGE (duplicate of another card) | 3 |
| clean (single lemma, no signal) | 1093 |
| **total** | **1438** |

The 229 SPLIT cards yield **583 children from the 204 whose terms are
in `jp`**, plus 25 header-only cards whose item lists live in `desc` and must be
enumerated by hand. Final corpus size is derived by script after the split, never estimated —
`CARD_CONTENT_SPEC.md` §1.3 records what happened last time a pre-split count was typed from
a document instead of computed.

## Scope

Owner decision: split all three shapes — `・` lists, `：` headers, and `vs` pairs.

That promotes the 37 contrast cards carrying an explicit `vs` (`加湿器 vs 除湿器`) out of
KEEP. It deliberately does **not** promote the other rule-4 rows, which several shards labelled
"contrast" loosely but which are rules, procedures or single official categories —
`ポイ捨て禁止・ガムを噛みながらの作業禁止` is a sentence, `危ない！よけろっ！` is one shout, and
`墜落・転落` is one accident category in Japanese OSH, not two.

Splitting a contrast pair loses the comparison that was the lesson, so each child carries its
opposite in `desc` as one clause. The pairs also already live in `CONFUSION_PAIRS` and
`DANGER_PAIRS`, which reference cards by Japanese string rather than id — so they survive both
the split and the renumbering untouched.

## Rules for keeping a card whole

1. **`・` internal to one katakana loanword** — e.g. `パワー・ハラスメント（パワハラ）`, `セクシャル・ハラスメント（セクハラ）`, `C・C・BOX（シーシーボックス）`
2. **Named concept whose parts are its definition** — e.g. `QCDSE`, `5M`, `三大災害`
3. **Headword + parenthetical variants** — e.g. `硬質塩化ビニル管（VP/VU）`, `労災保険の特別加入制度（一人親方・中小企業主）`, `電気工事士（一種・二種）`
4. **Deliberate contrast pair** — e.g. `休憩時間の規定（6時間・8時間）`, `汚水・雑排水`, `接続・結線`
5. **Synonyms for one referent** — e.g. `テスター / 万用計`, `発泡スチロール断熱材 / ポリスチレンフォーム`, `振り子・下げ振り`
6. **A rule/sentence, or one official category** — e.g. `墜落・転落`, `管路と埋設物の離隔距離`, `飛来・落下`

## Cross-shard conflicts, resolved

Three pairs of overlapping cards drew different verdicts from different shards. All three turn
out to be the same finding — duplicate content — and resolve the same way under the owner's
"split, then dedupe":

| Conflict | Resolution |
|---|---|
| `1334 遣り方・水貫・水盛り・地縄張り・水糸` SPLIT vs `1290 遣り方・水貫・水盛り` KEEP | 1290's three terms are a subset of 1334's five. Split 1334; **1290 merges away**. |
| `1381 耐震・制振・免振の3種類` SPLIT vs `1353 耐震・制振・免振` KEEP | Same three terms, same lesson. Split into three; **1381 merges into 1353**. |
| `210 低圧・高圧・特別高圧` KEEP vs `898 高圧・低圧` SPLIT | 210 is the named 電圧の区分 classification and stays. 898's two halves already exist as standalone cards 1013/1014, so **898 merges away**. |

## Header-only cards — the expensive 25

These name a category in `jp` and list their items only in `desc`/`usage`. Splitting them is not
cutting a string: each child needs a `jp` headword with its own ruby, authored from the
description. Several also carry a data fault worth fixing at the same time — `1354` promises
4 種類 and describes 3; `1362` describes 4 items while its `usage` names 5 different ones.

- **177** `機械土工事の代表機械` — Alat berat tanah
- **348** `ハンマーの種類` — 4 jenis palu konstruksi
- **444** `まくれ（バリ）とライニング管用リーマ` — Reamer khusus pipa lining
- **476** `漏電と漏電遮断機` — Arus bocor dan pemutus
- **552** `塗装工事の3工法` — 3 metode pengecatan
- **607** `ガス溶接の3種類` — 3 jenis las gas
- **1272** `CCUSの4レベルと条件` — 4 level CCUS dan syaratnya
- **1274** `建設業法の許可業種（設備関係）` — Izin usaha sektor utilitas
- **1281** `とび職の6種類` — 6 jenis tukang tobi
- **1282** `鉄骨構造の3種類と2工法` — 3 tipe & 2 metode konstruksi baja
- **1286** `航空障害灯とドローン規制の数値` — Lampu rintangan & angka regulasi drone
- **1305** `とび工事の種類` — Jenis pekerjaan tobi
- **1313** `舗装の4層` — 4 lapisan perkerasan (komposisi)
- **1314** `杭の材料3種` — 3 material tiang pondasi
- **1325** `トンネルの4種類（工法で分類）` — 4 jenis terowongan
- **1326** `NATM工法（山岳トンネル）` — NATM: 3 elemen penyangga
- **1330** `土工事の作業6種類` — 6 jenis pekerjaan tanah
- **1331** `舗装工事の4層構造` — 4 lapisan perkerasan (konstruksi)
- **1332** `とび工事の6種類` — 6 jenis pekerjaan tobi
- **1333** `海洋土木の4工事` — 4 pekerjaan sipil laut
- **1354** `鉄筋継手工事の4種類` — 4 metode penyambungan
- **1358** `防水工事の5種類` — 5 jenis waterproofing
- **1362** `造園工事の5種類` — 5 jenis pekerjaan
- **1383** `型枠工事と支保工（かたわく大工）` — Bekisting & perancah
- **1388** `サッシ工事とカバー工法（金属建具の取付け）` — Pekerjaan sash logam +

## Full verdict table

`children` is the term count read out of `jp`; `?` marks a header-only card counted above.

| id | file | jp | verdict | children | content | note |
|---:|---|---|---|---:|---|---|
| 1 | common | 朝礼 | clean |  |  |  |
| 2 | common | 危険予知活動（KY活動） | clean |  |  |  |
| 3 | common | ラジオ体操 | clean |  |  |  |
| 4 | common | 指差し呼称 | clean |  |  |  |
| 5 | common | 労働基準法 | clean |  |  |  |
| 6 | common | 労働安全衛生法 | clean |  |  |  |
| 7 | common | 最低賃金法 | clean |  |  |  |
| 8 | common | 建設業法 | clean |  |  |  |
| 9 | common | 建築基準法 | clean |  |  |  |
| 10 | common | 消防法 | clean |  |  |  |
| 11 | common | 水道法 | clean |  |  |  |
| 12 | common | 電気事業法 | clean |  |  |  |
| 13 | common | 電気通信事業法 | clean |  |  |  |
| 14 | common | 36協定 | clean |  |  |  |
| 15 | common | 労災保険 | clean |  |  |  |
| 16 | common | マニフェスト | clean |  |  |  |
| 17 | common | 建設リサイクル法 | clean |  |  |  |
| 18 | common | 雇用保険法 | clean |  |  |  |
| 19 | common | ガス事業法 | clean |  |  |  |
| 20 | common | 下水道法 | clean |  |  |  |
| 21 | common | 廃棄物処理法 | clean |  |  |  |
| 22 | common | 労災かくし | clean |  |  |  |
| 23 | common | 電気工事業法 | clean |  |  |  |
| 24 | common | 建設業法の29業種 | clean |  |  |  |
| 25 | common | アスベスト（石綿） | clean |  |  |  |
| 26 | common | 大気汚染防止法 | clean |  |  |  |
| 27 | lifeline | ライフライン工事 | clean |  |  |  |
| 28 | common | 設備工事 | clean |  |  |  |
| 29 | lifeline | 電気工事 | clean |  |  |  |
| 30 | lifeline | 都市ガス工事 | clean |  |  |  |
| 31 | lifeline | 通信工事 | clean |  |  |  |
| 32 | lifeline | 空調設備工事 | clean |  |  |  |
| 33 | lifeline | 消防設備工事 | clean |  |  |  |
| 34 | lifeline | 保温保冷工事 | clean |  |  |  |
| 35 | lifeline | 給排水衛生設備工事 | clean |  |  |  |
| 36 | lifeline | 加湿器 vs 除湿器 | SPLIT | 2 | MECHANICAL | 加湿器 + 除湿器 |
| 37 | lifeline | 築炉工事（耐火物） | clean |  |  |  |
| 38 | lifeline | 丸ダクト | clean |  |  |  |
| 39 | common | 受注一品生産 | clean |  |  |  |
| 40 | common | 施工管理 | clean |  |  |  |
| 41 | lifeline | 検電器 | clean |  |  |  |
| 42 | lifeline | 検相器 | clean |  |  |  |
| 43 | lifeline | テスター / 万用計 | KEEP |  |  | rule 5 — synonyms for one referent |
| 44 | lifeline | クランプメーター | clean |  |  |  |
| 45 | lifeline | 電線管 | clean |  |  |  |
| 46 | lifeline | フレキシブル管 | clean |  |  |  |
| 47 | lifeline | プルボックス | clean |  |  |  |
| 48 | lifeline | ケーブルラック | clean |  |  |  |
| 49 | lifeline | VVFケーブル | clean |  |  |  |
| 50 | lifeline | 圧着端子 | clean |  |  |  |
| 51 | lifeline | ブレーカー（NFB） | clean |  |  |  |
| 52 | lifeline | 接地棒 | clean |  |  |  |
| 53 | lifeline | ハンドホール | clean |  |  |  |
| 54 | lifeline | 配電盤 | clean |  |  |  |
| 55 | lifeline | 短絡 | clean |  |  |  |
| 56 | lifeline | 電工ナイフ | clean |  |  |  |
| 57 | lifeline | 光ファイバー | clean |  |  |  |
| 58 | lifeline | 光ファイバーケーブル | clean |  |  |  |
| 59 | lifeline | 同軸ケーブル | clean |  |  |  |
| 60 | lifeline | UTPケーブル | clean |  |  |  |
| 61 | lifeline | 融着接続機 | clean |  |  |  |
| 62 | lifeline | 光コネクタ | clean |  |  |  |
| 63 | lifeline | OTDR | clean |  |  |  |
| 64 | lifeline | ルーター | clean |  |  |  |
| 65 | lifeline | スイッチングハブ | clean |  |  |  |
| 66 | lifeline | 融着 vs コネクタ vs メカニカルスプライス | SPLIT | 3 | MECHANICAL | 融着 + コネクタ + メカニカルスプライス |
| 67 | lifeline | 管路 | clean |  |  |  |
| 68 | lifeline | ファイバーカッター（光ファイバー用） | clean |  |  |  |
| 69 | lifeline | 手掘り・穴掘建柱車・探針棒（埋設物確認） | SPLIT | 3 | MECHANICAL | 手掘り + 穴掘建柱車 + 探針棒 |
| 70 | lifeline | 光パワーメーター | clean |  |  |  |
| 71 | lifeline | 共同溝 | clean |  |  |  |
| 72 | lifeline | 炭素鋼鋼管（SGP） | clean |  |  |  |
| 73 | lifeline | 硬質塩化ビニル管（VP/VU） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 74 | lifeline | 耐衝撃性塩ビ管（HIVP） | clean |  |  |  |
| 75 | lifeline | ダクタイル鋳鉄管 | clean |  |  |  |
| 76 | lifeline | 銅管 | clean |  |  |  |
| 77 | lifeline | シールテープ | clean |  |  |  |
| 78 | lifeline | パイプカッター | clean |  |  |  |
| 79 | lifeline | パイプレンチ（ピレン） | clean |  |  |  |
| 80 | lifeline | ねじ切り機 | clean |  |  |  |
| 81 | lifeline | スリーブ | clean |  |  |  |
| 82 | lifeline | エルボ | clean |  |  |  |
| 83 | lifeline | チーズ（チー） | clean |  |  |  |
| 84 | lifeline | ポリエチレン管（EF接合） | clean |  |  |  |
| 85 | lifeline | SGP ねじ接合 | clean |  |  |  |
| 86 | lifeline | パイプ万力 | clean |  |  |  |
| 87 | lifeline | グラスウール断熱材 | clean |  |  |  |
| 88 | lifeline | ロックウール断熱材 | clean |  |  |  |
| 89 | lifeline | 発泡スチロール断熱材 / ポリスチレンフォーム | KEEP |  |  | rule 5 — synonyms for one referent |
| 90 | lifeline | 冷媒管（被覆銅管） | clean |  |  |  |
| 91 | lifeline | グラスウール vs ロックウール | SPLIT | 2 | MECHANICAL | グラスウール + ロックウール |
| 92 | lifeline | ラッキングカバー | clean |  |  |  |
| 93 | lifeline | けい酸カルシウム保温材 | clean |  |  |  |
| 94 | lifeline | 消火器 | clean |  |  |  |
| 95 | lifeline | スプリンクラー設備 | clean |  |  |  |
| 96 | lifeline | 屋外消火栓設備 | clean |  |  |  |
| 97 | lifeline | 粉末消火設備 | clean |  |  |  |
| 98 | lifeline | 屋外消火栓 vs 屋内消火栓 | SPLIT | 2 | MECHANICAL | 屋外消火栓 + 屋内消火栓 |
| 99 | common | 安全第一 | clean |  |  |  |
| 100 | common | フルハーネス型墜落制止用器具 | clean |  |  |  |
| 101 | common | 墜落・転落 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 102 | common | QCDSE | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 103 | common | 5M | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 104 | common | アンカーポイント | clean |  |  |  |
| 105 | common | 酸素欠乏 | clean |  |  |  |
| 106 | common | 土留め≥ 1.5m | clean |  |  |  |
| 107 | common | 新規入場者教育 vs 新入者安全衛生教育 | SPLIT | 2 | MECHANICAL | 新規入場者教育 + 新入者安全衛生教育 |
| 108 | common | 三大災害 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 109 | common | 始業前点検 | clean |  |  |  |
| 110 | common | バックホウ（油圧ショベル）の安全 | clean |  |  |  |
| 111 | common | 素掘り | clean |  |  |  |
| 112 | common | ドライワーク（ウェルポイント工法） | clean |  |  |  |
| 113 | common | 疲労防止 | clean |  |  |  |
| 114 | common | 建設キャリアアップシステム（CCUS） | clean |  |  |  |
| 115 | common | 元請け | clean |  |  |  |
| 116 | common | 下請（専門工事業者） | clean |  |  |  |
| 117 | common | 5S（整理・整頓・清掃・清潔・しつけ） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 118 | common | パワー・ハラスメント（パワハラ） | KEEP |  |  | rule 1 — `・` internal to one katakana loanword |
| 119 | common | 資格の種類：電気工事士・工事担任者・消防設備士 | SPLIT | 3 | MECHANICAL | 電気工事士 + 工事担任者 + 消防設備士 |
| 120 | common | セクシャル・ハラスメント（セクハラ） | KEEP |  |  | rule 1 — `・` internal to one katakana loanword |
| 121 | common | 水準器（レベル） | clean |  |  |  |
| 122 | common | トランシット | clean |  |  |  |
| 123 | common | トータルステーション | clean |  |  |  |
| 124 | common | 墨出し | clean |  |  |  |
| 125 | common | コンベックス | clean |  |  |  |
| 126 | common | 振り子・下げ振り | KEEP |  |  | rule 5 — synonyms for one referent |
| 127 | common | サンダー | clean |  |  |  |
| 128 | common | 墨つぼ | clean |  |  |  |
| 129 | common | 墨出し用語：陸墨・逃げ墨・地墨 | SPLIT | 3 | MECHANICAL | 陸墨 + 逃げ墨 + 地墨 |
| 130 | common | ベンチマーク（BM）・GL・FL | SPLIT | 3 | MECHANICAL | ベンチマーク + GL + FL |
| 131 | common | 通り芯・壁芯・柱芯 | SPLIT | 3 | MECHANICAL | 通り芯 + 壁芯 + 柱芯 |
| 132 | common | 台車 | clean |  |  |  |
| 133 | common | 一輪車 | clean |  |  |  |
| 134 | common | 割増賃金率 | clean |  |  |  |
| 135 | common | 通勤災害 vs 業務災害 | SPLIT | 2 | MECHANICAL | 通勤災害 + 業務災害 |
| 136 | common | 技能検定 / 技能士 | SPLIT | 2 | MECHANICAL | 技能検定 + 技能士 |
| 137 | common | 特定技能外国人の雇用保険（失業給付） | clean |  |  |  |
| 138 | common | 雇用保険の支給要件（12ヶ月以上） | clean |  |  |  |
| 139 | common | ストレスチェック（50人以上の事業場） | clean |  |  |  |
| 140 | common | ドローン登録義務（≥100g） | clean |  |  |  |
| 141 | common | 航空障害灯（≥60m） | clean |  |  |  |
| 142 | common | 賃金支払いの5原則 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 143 | common | 休憩時間の規定（6時間・8時間） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 144 | common | 解雇予告 | clean |  |  |  |
| 145 | common | 騒音規制法・低騒音型機械 | SPLIT | 2 | MECHANICAL | 騒音規制法 + 低騒音型機械 |
| 146 | common | 電波法 | clean |  |  |  |
| 147 | common | 労災保険の4給付（療養・休業・遺族・介護） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 148 | common | 労災保険の特別加入制度（一人親方・中小企業主） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 149 | common | 建設労働者雇用改善法 | clean |  |  |  |
| 150 | common | 駐車場法 | clean |  |  |  |
| 151 | common | 水質汚濁防止法 | clean |  |  |  |
| 152 | common | 賠償予定の禁止 | clean |  |  |  |
| 153 | common | 機会均等の原則 / 強制労働の禁止 | SPLIT | 2 | MECHANICAL | 機会均等の原則 + 強制労働の禁止 |
| 154 | common | 解雇制限 | clean |  |  |  |
| 155 | common | 労働条件の明示 | clean |  |  |  |
| 156 | common | 地域別最低賃金 | clean |  |  |  |
| 157 | common | 認定訓練 | clean |  |  |  |
| 158 | common | 法定休日 | clean |  |  |  |
| 159 | common | 有給休暇の買い取り禁止 | clean |  |  |  |
| 160 | common | 健康診断 | clean |  |  |  |
| 161 | common | 発破 | clean |  |  |  |
| 162 | common | 溶接の3分類（融接・圧接・ろう接） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 163 | common | バイブレータ（コンクリート締固め） | clean |  |  |  |
| 164 | lifeline | 外線工事 vs 内線工事（がいせん・ないせん） | SPLIT | 2 | MECHANICAL | がいせん + ないせん |
| 165 | common | 玉掛け | clean |  |  |  |
| 166 | common | 資格の3種類：国家免許・技能講習・特別教育 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 167 | common | 発破技士免許 | clean |  |  |  |
| 168 | common | 解体工事 | clean |  |  |  |
| 169 | common | タイル張り工事 | clean |  |  |  |
| 170 | common | クレーン・移動式クレーン資格 | SPLIT | 2 | MECHANICAL | クレーン + 移動式クレーン資格 |
| 171 | common | 高所作業車の資格境界 | clean |  |  |  |
| 172 | common | 車両系建設機械の資格境界 | clean |  |  |  |
| 173 | common | ガス溶接・アーク溶接の資格 | SPLIT | 2 | MECHANICAL | ガス溶接 + アーク溶接の資格 |
| 174 | lifeline | 冷凍空気調和機器工事の代表機器 | clean |  |  |  |
| 175 | lifeline | 消防設備の3分類（消火・警報・避難） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 176 | lifeline | 各種炉の種類（築炉工事詳細） | clean |  |  |  |
| 177 | common | 機械土工事の代表機械 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 178 | common | 建築基準法の耐震基準 | clean |  |  |  |
| 179 | lifeline | ダクトの3種類 | KEEP |  |  | borderline, resolved to KEEP |
| 180 | common | 電気工事士（一種・二種） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 181 | common | 工事担任者・電気通信主任技術者 | KEEP |  |  | borderline, resolved to KEEP |
| 182 | common | ゴンドラ操作 | clean |  |  |  |
| 183 | common | 酸素欠乏危険作業主任者 | clean |  |  |  |
| 184 | common | 石綿（アスベスト）取り扱い作業者 | clean |  |  |  |
| 185 | common | 有機溶剤作業主任者 | clean |  |  |  |
| 186 | common | 立て墨・仕上げ墨 | SPLIT | 2 | MECHANICAL | 立て墨 + 仕上げ墨 |
| 187 | common | 親墨 | clean |  |  |  |
| 188 | common | 矩を振る・墨付け | SPLIT | 2 | MECHANICAL | 矩を振る + 墨付け |
| 189 | common | 基準墨 | clean |  |  |  |
| 190 | common | FH・SL・CH（高さ記号） | SPLIT | 3 | MECHANICAL | FH + SL + CH |
| 191 | common | 擁壁・矢板・鋼矢板 | SPLIT | 3 | MECHANICAL | 擁壁 + 矢板 + 鋼矢板 |
| 192 | common | 釜場・水替え・万棒 | SPLIT | 3 | MECHANICAL | 釜場 + 水替え + 万棒 |
| 193 | common | 地業・ベタ基礎・フーチング・杭基礎 | SPLIT | 4 | MECHANICAL | 地業 + ベタ基礎 + フーチング + 杭基礎 |
| 194 | common | スラブ（構造スラブ・基礎スラブ・フラットスラブ） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 195 | common | 足場の種類：枠組み・単管・くさび | SPLIT | 3 | MECHANICAL | 枠組み + 単管 + くさび |
| 196 | common | 作業床・仮囲い | SPLIT | 2 | MECHANICAL | 作業床 + 仮囲い |
| 197 | common | 捨てコンクリート | clean |  |  |  |
| 198 | common | 結束・ハッカー | SPLIT | 2 | MECHANICAL | 結束 + ハッカー |
| 199 | common | 打ち重ね vs 打ち継ぎ | SPLIT | 2 | MECHANICAL | 打ち重ね + 打ち継ぎ |
| 200 | common | パンク（型枠崩壊） | clean |  |  |  |
| 201 | common | 納まり・取合い | SPLIT | 2 | MECHANICAL | 納まり + 取合い |
| 202 | common | 面一・不陸・目違い | SPLIT | 3 | MECHANICAL | 面一 + 不陸 + 目違い |
| 203 | common | 駄目・手直し・手戻り・段取り | SPLIT | 4 | MECHANICAL | 駄目 + 手直し + 手戻り + 段取り |
| 204 | common | 建端・上端・下端 | SPLIT | 3 | MECHANICAL | 建端 + 上端 + 下端 |
| 205 | common | 一間・一尺・一寸・一坪 | SPLIT | 4 | MECHANICAL | 一間 + 一尺 + 一寸 + 一坪 |
| 206 | common | ピッチ（割り付けの間隔） | clean |  |  |  |
| 207 | lifeline | 絶縁・漏電・接地・アース | SPLIT | 4 | MECHANICAL | 絶縁 + 漏電 + 接地 + アース |
| 208 | lifeline | 架空配線 vs 埋設配線 | SPLIT | 2 | MECHANICAL | 架空配線 + 埋設配線 |
| 209 | lifeline | 隠ぺい配管 vs 露出配管 | SPLIT | 2 | MECHANICAL | 隠ぺい配管 + 露出配管 |
| 210 | lifeline | 低圧・高圧・特別高圧（電圧の区分） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 211 | lifeline | 直流（DC）vs 交流（AC） | SPLIT | 2 | MECHANICAL | 直流 + 交流 |
| 212 | lifeline | MDF（通信分配盤） | clean |  |  |  |
| 213 | lifeline | Φ（ファイ / パイ） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 214 | lifeline | 通電・あたる・かしめる・飛ぶ/落ちる | SPLIT | 5 | MECHANICAL | 通電 + あたる + かしめる + 飛ぶ + 落ちる |
| 215 | lifeline | 空調・換気・排煙 | SPLIT | 3 | MECHANICAL | 空調 + 換気 + 排煙 |
| 216 | lifeline | 汚水・雑排水 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 217 | lifeline | 漏洩試験：水圧試験・満水試験 | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 218 | lifeline | ライニング・逆流・勾配 | SPLIT | 3 | MECHANICAL | ライニング + 逆流 + 勾配 |
| 219 | common | ほうれんそう（報告・連絡・相談） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 220 | common | 作業員詰め所のルール | clean |  |  |  |
| 221 | common | 見付け・見え掛かり・見え隠れ | SPLIT | 3 | MECHANICAL | 見付け + 見え掛かり + 見え隠れ |
| 222 | common | 反り vs 起り・陸 | SPLIT | 3 | MECHANICAL | 反り + 起り + 陸 |
| 223 | common | 転び・逃げ | SPLIT | 2 | MECHANICAL | 転び + 逃げ |
| 224 | common | 見切る・見切り材・馴染み | SPLIT | 3 | MECHANICAL | 見切る + 見切り材 + 馴染み |
| 225 | common | ベタ・ふかし | SPLIT | 2 | MECHANICAL | ベタ + ふかし |
| 226 | common | 通りを見る | clean |  |  |  |
| 227 | common | 拾い出し | clean |  |  |  |
| 228 | common | 場所打ち・打つ／打設する | SPLIT | 3 | MECHANICAL | 場所打ち + 打つ + 打設する |
| 229 | common | ノロ・アンコ | SPLIT | 2 | MECHANICAL | ノロ + アンコ |
| 230 | common | 転用・釘仕舞 | SPLIT | 2 | MECHANICAL | 転用 + 釘仕舞 |
| 231 | common | 配合・練り混ぜ・タンピング | SPLIT | 3 | MECHANICAL | 配合 + 練り混ぜ + タンピング |
| 232 | lifeline | 配線・離隔・貫通 | SPLIT | 3 | MECHANICAL | 配線 + 離隔 + 貫通 |
| 233 | lifeline | 通線・配管する・スラブ配管・仕込む | SPLIT | 4 | MECHANICAL | 通線 + 配管する + スラブ配管 + 仕込む |
| 234 | lifeline | 避雷針 vs 避雷器 | SPLIT | 2 | MECHANICAL | 避雷針 + 避雷器 |
| 235 | lifeline | 被覆・一次側・二次側 | SPLIT | 3 | MECHANICAL | 被覆 + 一次側 + 二次側 |
| 236 | lifeline | 増し締め・マーキング | SPLIT | 2 | MECHANICAL | 増し締め + マーキング |
| 237 | lifeline | 振る・競る・伏せる | SPLIT | 3 | MECHANICAL | 振る + 競る + 伏せる |
| 238 | lifeline | 衛生設備・死水 | SPLIT | 2 | MECHANICAL | 衛生設備 + 死水 |
| 239 | common | バリ・バリ取り | SPLIT | 2 | MECHANICAL | バリ + バリ取り |
| 240 | lifeline | 分岐・伸縮・蛇腹 | SPLIT | 3 | MECHANICAL | 分岐 + 伸縮 + 蛇腹 |
| 241 | lifeline | 芯・先（配管用語） | SPLIT | 2 | MECHANICAL | 芯 + 先 |
| 242 | common | 服装の注意4項目 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 243 | common | 後片付け・消火確認 | SPLIT | 2 | MECHANICAL | 後片付け + 消火確認 |
| 244 | common | 捨て材料 | clean |  |  |  |
| 245 | common | 追う・寸法 | SPLIT | 2 | MECHANICAL | 追う + 寸法 |
| 246 | lifeline | 接続・結線 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 247 | lifeline | バイブレーター・打ち込み | SPLIT | 2 | MECHANICAL | バイブレーター + 打ち込み |
| 248 | common | 面・矩・拝む | SPLIT | 3 | MECHANICAL | 面 + 矩 + 拝む |
| 249 | common | 5Sの各定義：整理・整頓・清掃・清潔・しつけ | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 250 | common | お先に失礼します | clean |  |  |  |
| 251 | lifeline | 圧着ペンチ・リングスリーブ | SPLIT | 2 | MECHANICAL | 圧着ペンチ + リングスリーブ |
| 252 | common | ポイ捨て禁止・ガムを噛みながらの作業禁止 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 253 | common | ロードローラ・タイヤローラ・振動ローラ | SPLIT | 3 | MECHANICAL | ロードローラ + タイヤローラ + 振動ローラ |
| 254 | common | ホイールローダ | clean |  |  |  |
| 255 | common | タワークレーン | clean |  |  |  |
| 256 | lifeline | ベンダー | clean |  |  |  |
| 257 | lifeline | CD管 vs PF管 | SPLIT | 2 | MECHANICAL | CD管 + PF管 |
| 258 | lifeline | C管（薄鋼電線管）vs G管（厚鋼電線管） | SPLIT | 2 | MECHANICAL | C管 + G管 |
| 259 | lifeline | ボイド管 | clean |  |  |  |
| 260 | lifeline | アウトレットボックス | clean |  |  |  |
| 261 | lifeline | 圧着ペンチ（端子用=赤・リングスリーブ用=黄） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 262 | lifeline | リングスリーブ | clean |  |  |  |
| 263 | lifeline | 呼び線 | clean |  |  |  |
| 264 | lifeline | レースウェイ | clean |  |  |  |
| 265 | lifeline | 吊りボルト（全ねじボルト） | clean |  |  |  |
| 266 | lifeline | ワイヤーストリッパー | clean |  |  |  |
| 267 | lifeline | CVケーブル vs EM-EEF | SPLIT | 2 | MECHANICAL | CVケーブル + EM-EEF |
| 268 | lifeline | CT / VCT（移動用電線） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 269 | lifeline | サーマルリレー | clean |  |  |  |
| 270 | lifeline | クロージャ | clean |  |  |  |
| 271 | lifeline | つり線（メッセンジャーワイヤー） | clean |  |  |  |
| 272 | lifeline | 張線器+ 掴線器 | SPLIT | 2 | MECHANICAL | 張線器 + 掴線器 |
| 273 | lifeline | 整流器 vs 蓄電池 | SPLIT | 2 | MECHANICAL | 整流器 + 蓄電池 |
| 274 | lifeline | LANテスター | clean |  |  |  |
| 275 | lifeline | 配管vs ダクト | SPLIT | 2 | MECHANICAL | 配管 + ダクト |
| 276 | lifeline | チューブカッター vs パイプカッター | SPLIT | 2 | MECHANICAL | チューブカッター + パイプカッター |
| 277 | lifeline | フレアリングツール | clean |  |  |  |
| 278 | lifeline | エキスパンダー（拡管器） | clean |  |  |  |
| 279 | lifeline | 水圧試験器（テストポンプ） | clean |  |  |  |
| 280 | lifeline | 耐熱性硬質塩化ビニル管（HT管・HTVP管） | KEEP |  |  | rule 5 — synonyms for one referent |
| 281 | lifeline | 水道用硬質塩化ビニルライニング鋼管 | clean |  |  |  |
| 282 | lifeline | ガスコック（末端vs 中間） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 283 | lifeline | ガス漏れ警報器 | clean |  |  |  |
| 284 | lifeline | 弁（バルブ）vs ダンパー | SPLIT | 2 | MECHANICAL | 弁 + ダンパー |
| 285 | lifeline | トラップ（排水管） | clean |  |  |  |
| 286 | lifeline | 衛生設備（給排水衛生設備の6分野） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 287 | common | 冷却コイル vs 温水コイル | KEEP |  |  | borderline, resolved to KEEP |
| 288 | lifeline | 水噴霧消火設備 | clean |  |  |  |
| 289 | lifeline | 泡消火設備 | clean |  |  |  |
| 290 | lifeline | 不活性ガス消火設備 | clean |  |  |  |
| 291 | lifeline | ハロゲン化物消火設備 | clean |  |  |  |
| 292 | common | ドリルドライバー vs インパクトドライバー | KEEP |  |  | borderline, resolved to KEEP |
| 293 | common | ディスクグラインダー 高速型 vs 低速型 | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 294 | common | 丸のこ | clean |  |  |  |
| 295 | common | 高速切断機 vs チップソー切断機 | SPLIT | 2 | MECHANICAL | 高速切断機 + チップソー切断機 |
| 296 | common | 剣スコップ vs 角スコップ（てこ禁止） | SPLIT | 2 | MECHANICAL | 剣スコップ + 角スコップ |
| 297 | common | ランマ vs バイブロコンパクタ vs プレートコ | SPLIT | 3 | MECHANICAL | ランマ + バイブロコンパクタ + プレートコ |
| 298 | common | レーザー墨出し器（赤レーザー vs 緑レーザー） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 299 | common | 水平器 | clean |  |  |  |
| 300 | common | さしがね（裏面= 表面の√2 ≈ 1.414倍） | clean |  |  |  |
| 301 | common | 水糸 | clean |  |  |  |
| 302 | common | たがね（ハツリ作業） | clean |  |  |  |
| 303 | common | バール（てこの原理） | clean |  |  |  |
| 304 | common | チェーンブロック vs レバーホイスト | SPLIT | 2 | MECHANICAL | チェーンブロック + レバーホイスト |
| 305 | common | ワイヤーロープ（玉掛け用・台付け用） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 306 | common | シャックル | clean |  |  |  |
| 307 | common | ジャッキ（ネジ式・歯車式・油圧式） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 308 | common | はしご（角度 約75度・補助者必須） | clean |  |  |  |
| 309 | common | 脚立 | clean |  |  |  |
| 310 | common | ローリングタワー（移動式足場） | clean |  |  |  |
| 311 | common | モンキーレンチ（上あごに力をかけて回す） | clean |  |  |  |
| 312 | common | 養生用ポリシート | clean |  |  |  |
| 313 | common | 垂直養生ネット vs 水平養生ネット | SPLIT | 2 | MECHANICAL | 垂直養生ネット + 水平養生ネット |
| 314 | common | トロ箱（トロ舟） | clean |  |  |  |
| 315 | common | 釘打ち機（コンプレッサー使用） | clean |  |  |  |
| 316 | common | フォークリフト | clean |  |  |  |
| 317 | common | 親綱緊張器 | clean |  |  |  |
| 318 | common | 油圧ショベル（バックホウ） | clean |  |  |  |
| 319 | common | トラクターショベル | clean |  |  |  |
| 320 | common | トラッククレーン vs クローラクレーン | SPLIT | 2 | MECHANICAL | トラッククレーン + クローラクレーン |
| 321 | lifeline | E管（ねじなし鋼製電線管） | clean |  |  |  |
| 322 | lifeline | カップリング vs コンビネーションカップリング | SPLIT | 2 | MECHANICAL | カップリング + コンビネーションカップリング |
| 323 | lifeline | ダクターチャンネル（コの字型断面） | clean |  |  |  |
| 324 | lifeline | ダブルナット / サドル | SPLIT | 2 | MECHANICAL | ダブルナット + サドル |
| 325 | lifeline | VVR（丸型）vs VVF（平型） | SPLIT | 2 | MECHANICAL | VVR + VVF |
| 326 | lifeline | リレー vs サーマルリレー | SPLIT | 2 | MECHANICAL | リレー + サーマルリレー |
| 327 | lifeline | 自己融着テープ | clean |  |  |  |
| 328 | lifeline | 差し込みコネクタ / T型コネクタ | SPLIT | 2 | MECHANICAL | 差し込みコネクタ + T型コネクタ |
| 329 | lifeline | 電工ドラム | clean |  |  |  |
| 330 | lifeline | 光ファイバー融着接続（3方式） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 331 | lifeline | 光パルス試験機（OTDR） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 332 | lifeline | 自己支持ケーブル | clean |  |  |  |
| 333 | lifeline | パイプ万力 / パイプねじ切機 | SPLIT | 2 | MECHANICAL | パイプ万力 + パイプねじ切機 |
| 334 | lifeline | 面取り器 | clean |  |  |  |
| 335 | lifeline | シール材（液状/ シールテープ） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 336 | lifeline | 配管用炭素鋼鋼管（SGP / ガス管） | KEEP |  |  | rule 5 — synonyms for one referent |
| 337 | lifeline | 硬質ポリ塩化ビニル管（VP管vs VU管） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 338 | lifeline | ねじ込み式可鍛鋳鉄製管継手 | clean |  |  |  |
| 339 | lifeline | 石綿セメント管（アスベスト管） | clean |  |  |  |
| 340 | lifeline | 屋内消火栓設備（1号/ 易操作/ 2号） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 341 | common | レシプロソー | clean |  |  |  |
| 342 | common | ダブルスコップ（深い穴掘り用） | clean |  |  |  |
| 343 | common | つるはし（鶴嘴） | clean |  |  |  |
| 344 | common | チョークライン vs 墨つぼ | SPLIT | 2 | MECHANICAL | チョークライン + 墨つぼ |
| 345 | common | ポンチ（センターポンチ） | clean |  |  |  |
| 346 | common | トランシット / セオドライト | clean |  |  |  |
| 347 | common | おおがね（大矩） | clean |  |  |  |
| 348 | common | ハンマーの種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 349 | common | サンドペーパー | clean |  |  |  |
| 350 | common | ソケットレンチ / ボックスレンチ / 六角レンチ | SPLIT | 3 | MECHANICAL | ソケットレンチ + ボックスレンチ + 六角レンチ |
| 351 | common | モルタルミキサ vs コンクリートミキサ | SPLIT | 2 | MECHANICAL | モルタルミキサ + コンクリートミキサ |
| 352 | common | ターンバックル | clean |  |  |  |
| 353 | common | チルホール（手動式ウインチ） | clean |  |  |  |
| 354 | common | キリンジャッキ | clean |  |  |  |
| 355 | common | レバーブロック | clean |  |  |  |
| 356 | common | 可搬式作業台（伸び馬） | clean |  |  |  |
| 357 | common | ブロアー（送風機） | clean |  |  |  |
| 358 | common | ファン（送風機vs 排風機） | KEEP |  |  | borderline, resolved to KEEP |
| 359 | lifeline | コンテスター | clean |  |  |  |
| 360 | lifeline | 電動ハンマー | clean |  |  |  |
| 361 | lifeline | 廻し挽き | clean |  |  |  |
| 362 | lifeline | 塗代カバー | clean |  |  |  |
| 363 | lifeline | ボックスコネクタ | clean |  |  |  |
| 364 | lifeline | ラジアスクランプ | clean |  |  |  |
| 365 | lifeline | 圧縮端子 vs 圧着端子 | SPLIT | 2 | MECHANICAL | 圧縮端子 + 圧着端子 |
| 366 | lifeline | 棒端子 | clean |  |  |  |
| 367 | lifeline | COS（Change Over Switch） | clean |  |  |  |
| 368 | lifeline | ベルマウス | clean |  |  |  |
| 369 | lifeline | アースボンド線 vs ノンボンド継手 | SPLIT | 2 | MECHANICAL | アースボンド線 + ノンボンド継手 |
| 370 | lifeline | エンドカバー / スタットバー | SPLIT | 2 | MECHANICAL | エンドカバー + スタットバー |
| 371 | lifeline | ケーブル繰り出し機（滑車式） | clean |  |  |  |
| 372 | lifeline | 金車 | clean |  |  |  |
| 373 | lifeline | ポンプ（配管内の水を遠く・高くへ） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 375 | common | レーキ vs ジョレン | SPLIT | 2 | MECHANICAL | レーキ + ジョレン |
| 376 | common | のこぎり | clean |  |  |  |
| 377 | common | くい切り（ニッパー）vs ペンチ | SPLIT | 2 | MECHANICAL | くい切り + ペンチ |
| 378 | common | やすり（金属用/ 木工用）+ ワイヤーブラシ | clean |  |  |  |
| 379 | common | タッピングねじ vs 釘の種類 | clean |  |  |  |
| 380 | common | ふるい | clean |  |  |  |
| 381 | common | ウェス・バケツ・ひしゃく | clean |  |  |  |
| 382 | common | ブルーシート vs ベニヤ（養生材料） | SPLIT | 2 | MECHANICAL | ブルーシート + ベニヤ |
| 383 | common | そり vs ころ（重量物の移動） | SPLIT | 2 | MECHANICAL | そり + ころ |
| 384 | common | ほうき + ちりとり + ブロアー | clean |  |  |  |
| 385 | common | 可搬式作業台 vs 脚立 vs ローリングタワー | SPLIT | 3 | MECHANICAL | 可搬式作業台 + 脚立 + ローリングタワー |
| 386 | lifeline | チューブベンダー（銅管専用） | clean |  |  |  |
| 387 | lifeline | 盤 | clean |  |  |  |
| 388 | lifeline | IV（屋内ビニル絶縁電線） | clean |  |  |  |
| 389 | lifeline | 露出ボックス vs 露出スイッチボックス | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 390 | common | 集塵機 vs 集塵丸のこ | SPLIT | 2 | MECHANICAL | 集塵機 + 集塵丸のこ |
| 391 | common | 高所作業車（バスケット高さ 2m以上） | clean |  |  |  |
| 392 | common | 電動ブロックカッター vs 丸のこ | SPLIT | 2 | MECHANICAL | 電動ブロックカッター + 丸のこ |
| 393 | common | 下げ振り | clean |  |  |  |
| 394 | common | ダンプトラック | clean |  |  |  |
| 395 | lifeline | VVFストリッパー | clean |  |  |  |
| 396 | lifeline | ストリップゲージ | clean |  |  |  |
| 397 | lifeline | コンセント（埋込型・露出型） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 398 | lifeline | 役物 | clean |  |  |  |
| 399 | lifeline | 振れ止め | clean |  |  |  |
| 400 | lifeline | 吊りボルト支持金具 | clean |  |  |  |
| 401 | lifeline | リード端子 | clean |  |  |  |
| 402 | lifeline | メタルケーブル（同軸・ツイストペア） | SPLIT | 2 | MECHANICAL | 同軸 + ツイストペア |
| 403 | lifeline | ファイバー保護スリーブ | clean |  |  |  |
| 404 | lifeline | ファイバーホルダ | clean |  |  |  |
| 405 | lifeline | ジャケットリムーバ | clean |  |  |  |
| 406 | lifeline | 同軸ケーブルチェッカー | clean |  |  |  |
| 407 | lifeline | 冷媒用銅管 | clean |  |  |  |
| 408 | lifeline | エアフィルター（空調） | clean |  |  |  |
| 409 | lifeline | 衛生器具設備 | clean |  |  |  |
| 410 | common | 砥石 | clean |  |  |  |
| 411 | common | ドライバー（プラス・マイナス） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 412 | common | ボルト・ナット・ワッシャー | SPLIT | 3 | MECHANICAL | ボルト + ナット + ワッシャー |
| 413 | common | 土地の制約 | clean |  |  |  |
| 414 | common | 自然条件による影響 | clean |  |  |  |
| 415 | common | 社会的制約 | clean |  |  |  |
| 416 | common | 施工計画 | clean |  |  |  |
| 417 | common | 施工要領書 | clean |  |  |  |
| 418 | common | キャリアアップカード・作業免許 | clean |  |  |  |
| 419 | common | 品質管理 | clean |  |  |  |
| 420 | common | 予算の管理 | clean |  |  |  |
| 421 | common | 工程管理 | clean |  |  |  |
| 422 | common | 安全管理 | clean |  |  |  |
| 423 | common | 環境保全管理 | clean |  |  |  |
| 424 | common | レーザー照射器 | clean |  |  |  |
| 425 | common | 基準墨・親墨 | SPLIT | 2 | MECHANICAL | 基準墨 + 親墨 |
| 426 | lifeline | A呼称 vs B呼称 | SPLIT | 2 | MECHANICAL | A呼称 + B呼称 |
| 427 | common | バンドソー管切断機 | clean |  |  |  |
| 428 | lifeline | 斜め切れ・段切れ ≥1.0mm | SPLIT | 2 | MECHANICAL | 斜め切れ + 段切れ ≥1.0mm |
| 429 | common | 軍手でのねじ加工は絶対禁止 | clean |  |  |  |
| 430 | lifeline | シールテープの巻き方 | clean |  |  |  |
| 431 | lifeline | ねじ込みのコツ | clean |  |  |  |
| 432 | lifeline | 錆のあるねじは絶対使用禁止 | clean |  |  |  |
| 433 | common | ねじゲージ | clean |  |  |  |
| 434 | common | チェーザ（ねじ切り盤の切削工具） | clean |  |  |  |
| 435 | lifeline | 液状シール剤 | clean |  |  |  |
| 436 | lifeline | ガス溶接接合法 | clean |  |  |  |
| 437 | lifeline | 被覆アーク溶接接合法（SMAW） | clean |  |  |  |
| 438 | lifeline | 開先加工 | clean |  |  |  |
| 439 | lifeline | 仮付け溶接 | clean |  |  |  |
| 440 | lifeline | メカニカル接合方法 | clean |  |  |  |
| 441 | lifeline | 飲み込みのマーキング | clean |  |  |  |
| 442 | lifeline | 接着剤（塩ビ管用）の塗布手順 | clean |  |  |  |
| 443 | common | ライニング鋼管のガス溶断絶対禁止 | clean |  |  |  |
| 444 | lifeline | まくれ（バリ）とライニング管用リーマ | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 445 | lifeline | 管端防食継手 | clean |  |  |  |
| 446 | common | 銅管の切断に金ノコ・グラインダー禁止 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 447 | lifeline | バリ取りは銅管を下向きに | clean |  |  |  |
| 448 | lifeline | サイジングツール（冷媒管用真円修正） | clean |  |  |  |
| 449 | lifeline | 最小曲げ半径 | clean |  |  |  |
| 450 | lifeline | フレア接合 | clean |  |  |  |
| 451 | lifeline | ろう接合 | clean |  |  |  |
| 452 | lifeline | 保温材の収縮（最大2%） | clean |  |  |  |
| 453 | lifeline | 保温材の形状 | clean |  |  |  |
| 454 | lifeline | ALGC（アルミガラスクロス）/ ALK | SPLIT | 2 | MECHANICAL | ALGC + ALK |
| 455 | lifeline | 亀甲金網 | clean |  |  |  |
| 456 | lifeline | GX形ダクタイル鋳鉄管 | clean |  |  |  |
| 457 | lifeline | ロックリング / ロックリングホルダ | SPLIT | 2 | MECHANICAL | ロックリング + ロックリングホルダ |
| 458 | lifeline | 滑剤 | clean |  |  |  |
| 459 | lifeline | EF接合（エレクトロフュージョン） | clean |  |  |  |
| 460 | lifeline | EF接合の斜め切断許容限度 | clean |  |  |  |
| 461 | common | 高速砥石タイプの切断工具 | clean |  |  |  |
| 462 | common | 地下埋設物表示シートの色コード | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 463 | common | 既存埋設管周辺50cm以内は人力掘削 | clean |  |  |  |
| 464 | common | 酸素欠乏危険作業主任者 | clean |  |  |  |
| 465 | common | 硫化水素濃度 | clean |  |  |  |
| 466 | common | ケガキ針 / デバイダ | SPLIT | 2 | MECHANICAL | ケガキ針 + デバイダ |
| 467 | common | 金床（アンビル）/ 定盤 | SPLIT | 2 | MECHANICAL | 金床 + 定盤 |
| 468 | lifeline | アングルフランジ工法 | clean |  |  |  |
| 469 | lifeline | 共板フランジ工法 | clean |  |  |  |
| 470 | lifeline | スライドオンフランジ工法 | clean |  |  |  |
| 471 | lifeline | 丸ダクトのフランジ工法 | clean |  |  |  |
| 472 | lifeline | PAS（高圧気中開閉器） | clean |  |  |  |
| 473 | lifeline | キュービクル | clean |  |  |  |
| 474 | lifeline | 活線 | clean |  |  |  |
| 475 | lifeline | 地絡 | clean |  |  |  |
| 476 | lifeline | 漏電と漏電遮断機 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 477 | lifeline | 圧着不良 | clean |  |  |  |
| 478 | common | 架空線の切断事故 | clean |  |  |  |
| 479 | common | 道路使用許可証 | clean |  |  |  |
| 480 | common | 架空設備の地上高 | clean |  |  |  |
| 481 | lifeline | C・C・BOX（シーシーボックス） | KEEP |  |  | rule 1 — `・` internal to one katakana loanword |
| 482 | lifeline | 土被り | clean |  |  |  |
| 483 | lifeline | 管路と埋設物の離隔距離 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 485 | lifeline | 気密試験（管路布設後） | clean |  |  |  |
| 486 | lifeline | 耐火煉瓦 / 耐火断熱煉瓦 | SPLIT | 2 | MECHANICAL | 耐火煉瓦 + 耐火断熱煉瓦 |
| 487 | lifeline | 熱硬性モルタル vs 気硬性モルタル | SPLIT | 2 | MECHANICAL | 熱硬性モルタル + 気硬性モルタル |
| 488 | lifeline | 煉瓦積みの6原則 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 489 | lifeline | 呼水装置 | clean |  |  |  |
| 490 | lifeline | 水温上昇防止用逃がし配管 | clean |  |  |  |
| 491 | lifeline | 性能試験装置 | clean |  |  |  |
| 492 | lifeline | 内面ライニング鋼管の使用禁止 | clean |  |  |  |
| 493 | common | 施工体制 | clean |  |  |  |
| 494 | common | 発注者 | clean |  |  |  |
| 495 | common | 監理者 | clean |  |  |  |
| 496 | common | 設計者 | clean |  |  |  |
| 497 | common | ゼネコン | clean |  |  |  |
| 498 | common | 現場監督 | clean |  |  |  |
| 499 | common | 専門工事業者 | clean |  |  |  |
| 500 | common | 職長 | clean |  |  |  |
| 501 | common | 技能者 | clean |  |  |  |
| 502 | common | 施主 | clean |  |  |  |
| 503 | common | 工務店 | clean |  |  |  |
| 504 | common | 元請け | clean |  |  |  |
| 505 | common | CCUS評価の3基準 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 506 | common | 新規入場者 | clean |  |  |  |
| 507 | common | 安全唱和・タッチアンドコール | SPLIT | 2 | MECHANICAL | 安全唱和 + タッチアンドコール |
| 508 | common | ゼロ災で行こう、ヨシ！！ | clean |  |  |  |
| 509 | common | KY活動の4ステップ | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 510 | common | KYボード | clean |  |  |  |
| 511 | common | 全体朝礼の6項目 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 512 | common | 安全確認の8項目 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 513 | common | 一体感 | clean |  |  |  |
| 514 | common | 転倒 | clean |  |  |  |
| 515 | common | 飛来・落下 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 516 | common | 激突され/ はさまれ・巻き込まれ | SPLIT | 3 | MECHANICAL | 激突され + はさまれ + 巻き込まれ |
| 517 | common | 有害物接触 / おぼれ / 火災 | SPLIT | 3 | MECHANICAL | 有害物接触 + おぼれ + 火災 |
| 519 | common | 土留め | clean |  |  |  |
| 520 | common | 鋼矢板 | clean |  |  |  |
| 521 | common | 保安設備・誘導員（ほあんせつび・ゆうどういん） | SPLIT | 2 | MECHANICAL | ほあんせつび + ゆうどういん |
| 522 | common | キーロック方式ロープ（移動用ロープの安全機構） | clean |  |  |  |
| 523 | common | 安全施工サイクルの8ステップ | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 524 | common | 新入者安全衛生教育の8項目 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 525 | common | 新規入場者教育 | clean |  |  |  |
| 526 | common | フルハーネス義務高さ | clean |  |  |  |
| 527 | common | 保護メガネ | clean |  |  |  |
| 528 | common | 保護マスク・じん肺（ほごますく・じんぱい） | SPLIT | 2 | MECHANICAL | ほごますく + じんぱい |
| 529 | common | 手袋（軍手）禁止 | clean |  |  |  |
| 530 | common | シールド面付きヘルメット / 安全靴 | SPLIT | 2 | MECHANICAL | シールド面付きヘルメット + 安全靴 |
| 531 | common | WBGT（暑さ指数）・真夏日・猛暑日 | SPLIT | 3 | MECHANICAL | WBGT + 真夏日 + 猛暑日 |
| 532 | common | 熱中症の症状 | clean |  |  |  |
| 533 | common | 緑十字 / 安全衛生旗 / 救急箱 | SPLIT | 3 | MECHANICAL | 緑十字 + 安全衛生旗 + 救急箱 |
| 534 | common | ヒューマンエラー（12種類の概要） | KEEP |  |  | borderline, resolved to KEEP |
| 535 | common | ヒューマンエラー①〜③：認知ミス・不注意・注意低下 | SPLIT | 3 | MECHANICAL | 認知ミス + 不注意 + 注意低下 |
| 536 | common | ヒューマンエラー④〜⑤：経験不足・慣れによる手抜き | SPLIT | 2 | MECHANICAL | 経験不足 + 慣れによる手抜き |
| 537 | common | ヒューマンエラー⑥〜⑧ | clean |  |  |  |
| 538 | common | ヒューマンエラー⑨〜⑫ | clean |  |  |  |
| 539 | common | パワハラ防止法 | clean |  |  |  |
| 540 | common | 年次有給休暇の付与テーブル | clean |  |  |  |
| 541 | common | 安全衛生教育の2トリガー | clean |  |  |  |
| 542 | common | 労働者の責務 | clean |  |  |  |
| 543 | common | 安全旗 vs 安全衛生旗 | SPLIT | 2 | MECHANICAL | 安全旗 + 安全衛生旗 |
| 544 | common | 労災死亡原因ランキング5位（令和3年度・建設業） | clean |  |  |  |
| 545 | common | 建設業法の5つの目的 | clean |  |  |  |
| 546 | common | 建築基準法：単体 vs 集団規定 | SPLIT | 2 | MECHANICAL | 単体 + 集団規定 |
| 547 | common | 廃棄物処理法：産廃と責任分担 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 548 | common | 下水道法：禁止排水の6理由 + 工事現場の排水種類 | SPLIT | 2 | MECHANICAL | 禁止排水の6理由 + 工事現場の排水種類 |
| 549 | common | 建設工事の3大分類 | clean |  |  |  |
| 550 | lifeline | ウェルポイント工法（地下水排水・最大10m） | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 551 | common | 溶接の3大分類：融接・圧接・ろう接 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 552 | lifeline | 塗装工事の3工法 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 553 | common | 解体工事（解体ガラ・アスベスト対策） | SPLIT | 2 | MECHANICAL | 解体ガラ + アスベスト対策 |
| 554 | common | 建設工事の資格3種類 | clean |  |  |  |
| 555 | common | クレーン・移動式クレーン・玉掛け資格 | SPLIT | 3 | MECHANICAL | クレーン + 移動式クレーン + 玉掛け資格 |
| 556 | common | 車両系・高所作業車・フォークリフト資格 | SPLIT | 3 | MECHANICAL | 車両系 + 高所作業車 + フォークリフト資格 |
| 557 | common | 溶接・酸欠・発破・足場の資格区分 | SPLIT | 4 | MECHANICAL | 溶接 + 酸欠 + 発破 + 足場の資格区分 |
| 558 | lifeline | 建築板金工事のダクト3種（排煙・空調・排気） | SPLIT | 3 | MECHANICAL | 排煙 + 空調 + 排気 |
| 559 | common | おはようございます（朝のあいさつの基本） | clean |  |  |  |
| 560 | common | ご安全に（建設現場専用のあいさつ） | clean |  |  |  |
| 561 | common | おつかれさまです（感謝・労い） | clean |  |  |  |
| 562 | common | ご苦労さま vs おつかれさまです | SPLIT | 2 | MECHANICAL | ご苦労さま + おつかれさまです |
| 563 | common | 失礼します（3つの場面での使い方） | clean |  |  |  |
| 564 | common | 危ない！よけろっ！（緊急の呼びかけ） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 565 | common | 墨出し・基準墨・通り芯 | SPLIT | 3 | MECHANICAL | 墨出し + 基準墨 + 通り芯 |
| 566 | common | 逃げ墨・陸墨・立て墨・地墨・仕上げ墨（5種類の墨） | SPLIT | 5 | MECHANICAL | 逃げ墨 + 陸墨 + 立て墨 + 地墨 + 仕上げ墨 |
| 567 | common | BM・GL・FH・FL・SL・CH（高さ基準6語） | SPLIT | 6 | MECHANICAL | BM + GL + FH + FL + SL + CH |
| 568 | lifeline | 水替え・釜場・山砂・水締め・万棒（排水・管理5語） | SPLIT | 2 | MECHANICAL | 排水 + 管理5語 |
| 569 | common | 地業・基礎・直接基礎（ベタ基礎・フーチング） | SPLIT | 2 | MECHANICAL | ベタ基礎 + フーチング |
| 570 | common | 足場の種類・作業床・仮囲い（仮設工事3語） | SPLIT | 3 | MECHANICAL | 足場の種類 + 作業床 + 仮囲い |
| 571 | common | 打ち込み・打ち重ね・コールドジョイント・打ち継ぎ | KEEP |  |  | borderline, resolved to KEEP |
| 572 | common | 締固め・タンピング・練り混ぜ・配合 | SPLIT | 4 | MECHANICAL | 締固め + タンピング + 練り混ぜ + 配合 |
| 573 | common | 納まり・取合い・見付け・見え掛かり・見え隠れ | SPLIT | 5 | MECHANICAL | 納まり + 取合い + 見付け + 見え掛かり + 見え隠れ |
| 574 | common | 通り・面一・反り・起り・陸・不陸 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 575 | common | 目違い・拝む・転び・逃げ・見切る | SPLIT | 5 | MECHANICAL | 目違い + 拝む + 転び + 逃げ + 見切る |
| 576 | common | 駄目・手直し・手戻り・段取り・馴染み | SPLIT | 5 | MECHANICAL | 駄目 + 手直し + 手戻り + 段取り + 馴染み |
| 577 | common | ピッチ・追う・寸法・一間・一尺・一寸・一坪 | SPLIT | 7 | MECHANICAL | ピッチ + 追う + 寸法 + 一間 + 一尺 + 一寸 + 一坪 |
| 578 | lifeline | 接続・配線・離隔・絶縁・貫通・管路 | SPLIT | 6 | MECHANICAL | 接続 + 配線 + 離隔 + 絶縁 + 貫通 + 管路 |
| 579 | lifeline | 埋設（3方式）・架空配線 | SPLIT | 2 | MECHANICAL | 埋設 + 架空配線 |
| 580 | lifeline | 配管する・通線・スラブ配管・隠ぺい・露出・伏せる | SPLIT | 6 | MECHANICAL | 配管する + 通線 + スラブ配管 + 隠ぺい + 露出 + 伏せる |
| 581 | lifeline | 感電・漏電・接地（アース）・避雷針・避雷器 | SPLIT | 5 | MECHANICAL | 感電 + 漏電 + 接地 + 避雷針 + 避雷器 |
| 582 | lifeline | 短絡・低圧・高圧・特別高圧・圧着・直流・交流 | SPLIT | 7 | MECHANICAL | 短絡 + 低圧 + 高圧 + 特別高圧 + 圧着 + 直流 + 交流 |
| 583 | lifeline | 点滅・被覆・一次側・増し締め・マーキング・通電 | SPLIT | 6 | MECHANICAL | 点滅 + 被覆 + 一次側 + 増し締め + マーキング + 通電 |
| 584 | lifeline | あたる・かしめる・仕込む・振る・競る・Φ | SPLIT | 6 | MECHANICAL | あたる + かしめる + 仕込む + 振る + 競る + Φ |
| 585 | lifeline | 空調・温度・湿度・換気・排煙・衛生（設備基本6語） | SPLIT | 6 | MECHANICAL | 空調 + 温度 + 湿度 + 換気 + 排煙 + 衛生 |
| 586 | lifeline | 死水・バリ・逆流・分岐・伸縮・蛇腹・ライニング | SPLIT | 7 | MECHANICAL | 死水 + バリ + 逆流 + 分岐 + 伸縮 + 蛇腹 + ライニング |
| 587 | lifeline | 漏洩試験・水圧試験・満水試験・勾配・汚水・雑排水 | SPLIT | 6 | MECHANICAL | 漏洩試験 + 水圧試験 + 満水試験 + 勾配 + 汚水 + 雑排水 |
| 588 | lifeline | 芯・先・面（設備工事の3短語） | SPLIT | 3 | MECHANICAL | 芯 + 先 + 面 |
| 589 | common | 5S活動（整理・整頓・清掃・清潔・しつけ） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 590 | common | 作業員詰め所の6ルール | clean |  |  |  |
| 591 | common | 服装の4禁止事項（建設現場） | clean |  |  |  |
| 593 | common | 後片付け（作業終了後の義務・火の確認） | clean |  |  |  |
| 594 | common | 職業能力開発促進法（技能検定） | clean |  |  |  |
| 595 | common | 法定労働時間（週40時間・1日8時間） | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 596 | lifeline | 配管工事の概要 | clean |  |  |  |
| 597 | lifeline | 過電流遮断機 / ブレーカー / NFB | KEEP |  |  | rule 5 — synonyms for one referent |
| 598 | common | レベル（水準測量機）/ レーザーレベル | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 599 | common | メジャー（巻き尺）・定規 | SPLIT | 2 | MECHANICAL | メジャー + 定規 |
| 600 | lifeline | はさみ・カッターナイフ | SPLIT | 2 | MECHANICAL | はさみ + カッターナイフ |
| 601 | common | ハンドミキサ・かくはん機 | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 602 | common | ブラシ（汚れ落とし）・スポンジ | SPLIT | 2 | MECHANICAL | ブラシ + スポンジ |
| 603 | lifeline | GW / RW / ポリスチレンフォーム | SPLIT | 3 | MECHANICAL | GW + RW + ポリスチレンフォーム |
| 604 | lifeline | 保温工事の場所別仕上げ（4種類） | KEEP |  |  | borderline, resolved to KEEP |
| 605 | lifeline | ダクトの保温保冷工事 | clean |  |  |  |
| 606 | lifeline | 差し込み継手工法（丸ダクト） | clean |  |  |  |
| 607 | lifeline | ガス溶接の3種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 608 | lifeline | 硬質塩化ビニル管（接着剤接合） | clean |  |  |  |
| 609 | lifeline | 硬質塩化ビニル管の面取り | clean |  |  |  |
| 610 | lifeline | ねじ込み配管（通水は養生後） | clean |  |  |  |
| 611 | lifeline | キュービクル（6600V変換） | clean |  |  |  |
| 612 | lifeline | EF接合（インジケーター確認） | clean |  |  |  |
| 613 | lifeline | EF接合 | clean |  |  |  |
| 614 | lifeline | マンドレル通過試験 | clean |  |  |  |
| 615 | lifeline | GX形ダクタイル鋳鉄管の曲げ配管 | clean |  |  |  |
| 616 | lifeline | クロージャの色分け | clean |  |  |  |
| 617 | lifeline | 電線共同溝 | clean |  |  |  |
| 618 | lifeline | 電柱を建てる手順（5ステップ） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 619 | lifeline | ベンダー曲げ加工（最小曲げ半径） | clean |  |  |  |
| 620 | lifeline | ろう付け後の確認 | clean |  |  |  |
| 621 | common | 三大災害 | clean |  |  |  |
| 622 | common | 外国人労働者の死亡災害 | clean |  |  |  |
| 623 | common | 崩壊・倒壊災害の建設特有例 | clean |  |  |  |
| 624 | common | 機械設置工事の死亡事故 | clean |  |  |  |
| 625 | common | 上下水道工事の3種類の事故リスク | clean |  |  |  |
| 626 | common | 新規入場者教育の8項目 | clean |  |  |  |
| 627 | common | 専門工事業者間のチームワーク | clean |  |  |  |
| 628 | lifeline | 配管 | clean |  |  |  |
| 629 | lifeline | 埋設 | clean |  |  |  |
| 630 | lifeline | 地下 | clean |  |  |  |
| 631 | lifeline | 凍結 | clean |  |  |  |
| 632 | lifeline | 真空引き | clean |  |  |  |
| 633 | lifeline | 管端 | clean |  |  |  |
| 634 | lifeline | ガス配管 | clean |  |  |  |
| 635 | lifeline | 接続 | clean |  |  |  |
| 636 | lifeline | 接続部 | clean |  |  |  |
| 637 | lifeline | 間隔 | clean |  |  |  |
| 638 | lifeline | たわみ | clean |  |  |  |
| 639 | lifeline | 流量 | clean |  |  |  |
| 640 | lifeline | 保温材 | clean |  |  |  |
| 641 | lifeline | 断熱材 | clean |  |  |  |
| 642 | lifeline | シーリング材 | clean |  |  |  |
| 643 | lifeline | 絶縁テープ | clean |  |  |  |
| 644 | lifeline | 油 | clean |  |  |  |
| 645 | lifeline | 耐候性 | clean |  |  |  |
| 646 | lifeline | 厚さ | clean |  |  |  |
| 647 | common | 凍結防止 | clean |  |  |  |
| 648 | common | 結露 | clean |  |  |  |
| 649 | common | 多発 | clean |  |  |  |
| 650 | common | 水分 | clean |  |  |  |
| 651 | common | 故障 | clean |  |  |  |
| 652 | common | 漏れ | clean |  |  |  |
| 653 | common | 錆 | clean |  |  |  |
| 654 | common | 劣化 | clean |  |  |  |
| 655 | common | 付着 | clean |  |  |  |
| 656 | common | 侵入 | clean |  |  |  |
| 657 | common | たわみ発生 | clean |  |  |  |
| 658 | common | 異音 | clean |  |  |  |
| 659 | common | ヒートロス | clean |  |  |  |
| 660 | common | 隙間 | clean |  |  |  |
| 661 | common | 圧力試験 | clean |  |  |  |
| 662 | common | ガス漏れ試験 | clean |  |  |  |
| 663 | common | 漏れ検査 | clean |  |  |  |
| 664 | common | 安全確認 | clean |  |  |  |
| 665 | common | 確認 | clean |  |  |  |
| 666 | lifeline | 記録 | clean |  |  |  |
| 667 | common | 防止 | clean |  |  |  |
| 668 | common | 高所作業 | clean |  |  |  |
| 669 | common | 落下 | clean |  |  |  |
| 670 | common | 騒音 | clean |  |  |  |
| 671 | common | 危険 | clean |  |  |  |
| 672 | common | アース | clean |  |  |  |
| 673 | common | 処置 | clean |  |  |  |
| 674 | common | 使用中止 | clean |  |  |  |
| 675 | common | 施工方法 | clean |  |  |  |
| 676 | common | 保温 | clean |  |  |  |
| 677 | common | 溶接 | clean |  |  |  |
| 678 | common | 追加施工 | clean |  |  |  |
| 679 | common | 充填 | clean |  |  |  |
| 680 | common | 発生 | clean |  |  |  |
| 681 | lifeline | 洗浄 | clean |  |  |  |
| 682 | common | 防錆処理 | clean |  |  |  |
| 683 | common | 併用 | clean |  |  |  |
| 684 | common | 防水カバー | clean |  |  |  |
| 685 | lifeline | 電気設備 | clean |  |  |  |
| 686 | lifeline | 電動工具 | clean |  |  |  |
| 687 | lifeline | 電源 | clean |  |  |  |
| 688 | lifeline | 紫外線 | clean |  |  |  |
| 689 | lifeline | 複数 | clean |  |  |  |
| 690 | lifeline | 熱がこもる | clean |  |  |  |
| 691 | common | 不十分 | clean |  |  |  |
| 692 | common | 不足 | clean |  |  |  |
| 693 | common | 安定 | clean |  |  |  |
| 694 | common | 原因 | clean |  |  |  |
| 695 | common | 急変 | clean |  |  |  |
| 696 | common | 直後 | clean |  |  |  |
| 697 | common | 内面 | clean |  |  |  |
| 698 | common | 内部 | clean |  |  |  |
| 699 | common | 図面 | clean |  |  |  |
| 700 | common | シール性 | clean |  |  |  |
| 701 | common | 温度 | clean |  |  |  |
| 702 | common | 有無 | clean |  |  |  |
| 703 | lifeline | 材料 | clean |  |  |  |
| 704 | lifeline | コード | clean |  |  |  |
| 705 | common | 現象 | clean |  |  |  |
| 706 | common | 重量 | clean |  |  |  |
| 707 | common | 圧力計 | clean |  |  |  |
| 708 | common | 低下 | clean |  |  |  |
| 709 | common | 位置 | clean |  |  |  |
| 710 | common | 破損 | clean |  |  |  |
| 711 | common | ブリッジ | clean |  |  |  |
| 712 | common | サーマルギャップ | clean |  |  |  |
| 713 | lifeline | 電線 | clean |  |  |  |
| 714 | common | 屋外 | clean |  |  |  |
| 715 | common | 種類 | clean |  |  |  |
| 716 | common | 目的 | clean |  |  |  |
| 717 | common | 上昇 | clean |  |  |  |
| 718 | common | 測定 | clean |  |  |  |
| 719 | common | 結果 | clean |  |  |  |
| 720 | common | 変化 | clean |  |  |  |
| 721 | lifeline | 流れ | clean |  |  |  |
| 722 | common | 問題 | clean |  |  |  |
| 723 | common | ペンキ塗り | clean |  |  |  |
| 724 | common | 色 | clean |  |  |  |
| 725 | common | 増える | clean |  |  |  |
| 726 | common | 一定 | clean |  |  |  |
| 727 | common | 取り付け | clean |  |  |  |
| 728 | common | 交換 | clean |  |  |  |
| 729 | common | 塗装 | clean |  |  |  |
| 730 | common | 上がる | clean |  |  |  |
| 731 | common | 音 | clean |  |  |  |
| 732 | common | 減る | clean |  |  |  |
| 733 | common | 長さ | clean |  |  |  |
| 734 | common | 変わる | clean |  |  |  |
| 735 | common | 浅い | clean |  |  |  |
| 736 | common | 裸 | clean |  |  |  |
| 737 | common | 注意 | clean |  |  |  |
| 738 | common | 黒色 | clean |  |  |  |
| 739 | common | 計算 | clean |  |  |  |
| 740 | common | 冷やす | clean |  |  |  |
| 741 | common | 強い | clean |  |  |  |
| 742 | common | 将来 | clean |  |  |  |
| 743 | lifeline | 広い | clean |  |  |  |
| 744 | common | そろえる | clean |  |  |  |
| 745 | common | 際 | clean |  |  |  |
| 746 | common | 場合 | clean |  |  |  |
| 747 | common | 巻く | clean |  |  |  |
| 748 | common | 太い | clean |  |  |  |
| 749 | common | 覆う | clean |  |  |  |
| 750 | common | 短い | clean |  |  |  |
| 751 | common | 切る | clean |  |  |  |
| 752 | common | 呼ぶ | clean |  |  |  |
| 753 | common | 主な | clean |  |  |  |
| 754 | common | 施工時 | clean |  |  |  |
| 755 | common | 作業後 | clean |  |  |  |
| 756 | common | 塗る | clean |  |  |  |
| 757 | common | 付ける | clean |  |  |  |
| 758 | lifeline | 束ねる | clean |  |  |  |
| 759 | lifeline | 通す | clean |  |  |  |
| 760 | lifeline | 開く | clean |  |  |  |
| 761 | common | 施工前 | clean |  |  |  |
| 762 | common | 注意点 | clean |  |  |  |
| 763 | common | 必ず | clean |  |  |  |
| 764 | common | まず | clean |  |  |  |
| 765 | common | 特に | clean |  |  |  |
| 766 | lifeline | 埋める | clean |  |  |  |
| 767 | common | 防ぐ | clean |  |  |  |
| 768 | common | 行う | clean |  |  |  |
| 769 | common | 考えられる | clean |  |  |  |
| 770 | common | 使用中 | clean |  |  |  |
| 771 | common | べき | clean |  |  |  |
| 772 | common | 起こる | clean |  |  |  |
| 773 | common | 残る | clean |  |  |  |
| 774 | common | 試験 | clean |  |  |  |
| 775 | common | 検査 | clean |  |  |  |
| 776 | common | 作業 | clean |  |  |  |
| 777 | common | 方法 | clean |  |  |  |
| 778 | lifeline | 工事 | clean |  |  |  |
| 779 | common | 安全 | clean |  |  |  |
| 780 | common | 施工 | clean |  |  |  |
| 781 | common | 取る | clean |  |  |  |
| 782 | common | 整理 | clean |  |  |  |
| 783 | common | 整頓 | clean |  |  |  |
| 784 | common | 清掃 | clean |  |  |  |
| 785 | common | 清潔 | clean |  |  |  |
| 786 | common | しつけ | clean |  |  |  |
| 787 | common | チームワーク | clean |  |  |  |
| 788 | common | 優位性 | clean |  |  |  |
| 789 | common | 苦痛 | clean |  |  |  |
| 790 | common | 労働者 | clean |  |  |  |
| 791 | common | 事業主 | clean |  |  |  |
| 792 | common | 資質 | clean |  |  |  |
| 793 | common | 廃材 | clean |  |  |  |
| 794 | common | 最低限 | clean |  |  |  |
| 795 | common | 軽減 | clean |  |  |  |
| 796 | common | 安価 | clean |  |  |  |
| 797 | common | 技能講習 | clean |  |  |  |
| 798 | common | 特別教育 | clean |  |  |  |
| 799 | common | 免許 | clean |  |  |  |
| 800 | common | 準備工事 | clean |  |  |  |
| 801 | lifeline | 埋戻し | clean |  |  |  |
| 802 | common | 竣工 | clean |  |  |  |
| 803 | common | 着工 | clean |  |  |  |
| 804 | common | 工期 | clean |  |  |  |
| 805 | common | 押土 | clean |  |  |  |
| 806 | common | 運搬 | clean |  |  |  |
| 807 | common | 躯体 | clean |  |  |  |
| 808 | common | 内装 | clean |  |  |  |
| 809 | lifeline | 支保工 | clean |  |  |  |
| 810 | common | 養生 | clean |  |  |  |
| 811 | common | 坪 | clean |  |  |  |
| 812 | common | 尺 | clean |  |  |  |
| 813 | common | 寸 | clean |  |  |  |
| 814 | common | 一間 | clean |  |  |  |
| 815 | lifeline | 管路 | clean |  |  |  |
| 816 | lifeline | 埋設物 | clean |  |  |  |
| 817 | lifeline | 立坑 | clean |  |  |  |
| 818 | lifeline | 共同溝 | clean |  |  |  |
| 819 | lifeline | 土被り | clean |  |  |  |
| 820 | lifeline | 防錆 | clean |  |  |  |
| 821 | lifeline | 絶縁 | clean |  |  |  |
| 822 | lifeline | 接地 | clean |  |  |  |
| 823 | lifeline | 漏電 | clean |  |  |  |
| 824 | lifeline | 短絡 | clean |  |  |  |
| 825 | common | 墜落 | clean |  |  |  |
| 826 | common | 酸素欠乏 | clean |  |  |  |
| 827 | common | 土留め | clean |  |  |  |
| 828 | common | 換気 | clean |  |  |  |
| 829 | common | 施工管理 | clean |  |  |  |
| 830 | common | 品質 | clean |  |  |  |
| 831 | common | 工程 | clean |  |  |  |
| 832 | common | ご安全に | clean |  |  |  |
| 833 | common | お疲れ様です | clean |  |  |  |
| 834 | common | 危ない | clean |  |  |  |
| 835 | common | 仕様書 | clean |  |  |  |
| 836 | common | 建築 | clean |  |  |  |
| 837 | common | 解体 | clean |  |  |  |
| 838 | common | 基礎 | clean |  |  |  |
| 839 | common | 柱 | clean |  |  |  |
| 840 | common | 梁 | clean |  |  |  |
| 841 | common | 床 | clean |  |  |  |
| 842 | common | 墨出し | clean |  |  |  |
| 843 | common | 逃げ墨 | clean |  |  |  |
| 844 | common | 地墨 | clean |  |  |  |
| 845 | lifeline | 接合 | clean |  |  |  |
| 846 | lifeline | 電柱 | clean |  |  |  |
| 847 | lifeline | マンホール | clean |  |  |  |
| 848 | common | 災害 | clean |  |  |  |
| 849 | common | 危険予知活動 | clean |  |  |  |
| 850 | common | 現場監督 | clean |  |  |  |
| 851 | lifeline | 温水管 | clean |  |  |  |
| 852 | lifeline | 開閉弁 | clean |  |  |  |
| 853 | lifeline | 排水路 | clean |  |  |  |
| 854 | lifeline | 給水口 | clean |  |  |  |
| 855 | lifeline | 地中管 | clean |  |  |  |
| 856 | lifeline | 天井管 | clean |  |  |  |
| 857 | lifeline | 止水栓 | clean |  |  |  |
| 858 | common | 水平器 | clean |  |  |  |
| 859 | lifeline | 給湯管 | clean |  |  |  |
| 860 | lifeline | 換気扇 | clean |  |  |  |
| 861 | lifeline | 排気口 | clean |  |  |  |
| 862 | common | 脚立 | clean |  |  |  |
| 863 | common | 梯子 | clean |  |  |  |
| 864 | lifeline | パイプレンチ | clean |  |  |  |
| 865 | common | モンキーレンチ | clean |  |  |  |
| 866 | lifeline | 雨水管 | clean |  |  |  |
| 867 | lifeline | 冷却塔 | clean |  |  |  |
| 868 | lifeline | 換気口 | clean |  |  |  |
| 869 | common | ホース | clean |  |  |  |
| 870 | lifeline | 冷風管 | clean |  |  |  |
| 871 | lifeline | 温風管 | clean |  |  |  |
| 872 | lifeline | 地中ケーブル | clean |  |  |  |
| 873 | lifeline | 地上ケーブル | clean |  |  |  |
| 874 | lifeline | 架空ケーブル | clean |  |  |  |
| 875 | lifeline | グリル | clean |  |  |  |
| 876 | common | 天井内 | clean |  |  |  |
| 877 | lifeline | 車庫 | clean |  |  |  |
| 878 | common | 屋外露出部分 | clean |  |  |  |
| 879 | common | 屋内露出部分 | clean |  |  |  |
| 880 | lifeline | 滑剤の塗布 | clean |  |  |  |
| 881 | lifeline | 挿し口の挿入 | clean |  |  |  |
| 882 | lifeline | ゴム輪のセット | clean |  |  |  |
| 883 | lifeline | ゴム輪の位置 | clean |  |  |  |
| 884 | lifeline | 融着準備 | clean |  |  |  |
| 885 | lifeline | 融着面の清掃 | clean |  |  |  |
| 886 | lifeline | EFソケット | clean |  |  |  |
| 887 | lifeline | コントローラ | clean |  |  |  |
| 888 | lifeline | インジケータ | clean |  |  |  |
| 889 | lifeline | 水道配水用ポリエチレン管 | clean |  |  |  |
| 890 | common | 板金の加工 | clean |  |  |  |
| 891 | common | ケガキ | clean |  |  |  |
| 892 | lifeline | 角ダクトの接続 | clean |  |  |  |
| 893 | lifeline | ダクト接続方法 | clean |  |  |  |
| 894 | lifeline | アングルフランジ | clean |  |  |  |
| 895 | common | ワッシャー | clean |  |  |  |
| 896 | common | ナット | clean |  |  |  |
| 897 | common | 管の埋設工事 | clean |  |  |  |
| 898 | lifeline | 高圧・低圧 | MERGE |  |  | duplicate content — fold into 1013 |
| 899 | common | カバー | clean |  |  |  |
| 900 | lifeline | 温水器 | clean |  |  |  |
| 901 | lifeline | 風管 | clean |  |  |  |
| 902 | common | 倉庫 | clean |  |  |  |
| 903 | common | 機械室 | clean |  |  |  |
| 904 | lifeline | キャップ | clean |  |  |  |
| 905 | lifeline | コック | clean |  |  |  |
| 906 | common | バリ取り | clean |  |  |  |
| 907 | common | 面を取る | clean |  |  |  |
| 908 | lifeline | 真円修正 | clean |  |  |  |
| 909 | lifeline | 管加工 | clean |  |  |  |
| 910 | lifeline | 仮付溶接 | clean |  |  |  |
| 911 | lifeline | 開先加工 | clean |  |  |  |
| 912 | lifeline | 手曲げ加工 | clean |  |  |  |
| 913 | lifeline | ベンダー曲げ加工 | clean |  |  |  |
| 914 | common | 点検 | clean |  |  |  |
| 915 | lifeline | 管と継手の挿入・固定 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 916 | lifeline | 地上管 | clean |  |  |  |
| 917 | lifeline | 冷却器 | clean |  |  |  |
| 918 | lifeline | 手工具 | clean |  |  |  |
| 919 | lifeline | 3路スイッチ | clean |  |  |  |
| 920 | lifeline | 4路スイッチ | clean |  |  |  |
| 921 | lifeline | 単極スイッチ | clean |  |  |  |
| 922 | lifeline | テープ巻き | clean |  |  |  |
| 923 | lifeline | 保護テープ | clean |  |  |  |
| 924 | lifeline | 結束バンド | clean |  |  |  |
| 925 | lifeline | 支線 | clean |  |  |  |
| 926 | lifeline | 吸気ファン | clean |  |  |  |
| 927 | lifeline | 防振ゴム | clean |  |  |  |
| 928 | lifeline | 吸音材 | clean |  |  |  |
| 929 | lifeline | 空気清浄機 | clean |  |  |  |
| 930 | lifeline | 作業灯 | clean |  |  |  |
| 931 | lifeline | 送水ポンプ | clean |  |  |  |
| 932 | lifeline | 排水ポンプ | clean |  |  |  |
| 933 | lifeline | 冷却ポンプ | clean |  |  |  |
| 934 | lifeline | 温水循環ポンプ | clean |  |  |  |
| 935 | lifeline | ポリブテン管 | clean |  |  |  |
| 936 | lifeline | 鉛管 | clean |  |  |  |
| 937 | lifeline | 給水タンク | clean |  |  |  |
| 938 | lifeline | パイプバンド | clean |  |  |  |
| 939 | common | モップ | clean |  |  |  |
| 940 | common | たらい | clean |  |  |  |
| 941 | common | 梯子脚立 | clean |  |  |  |
| 942 | common | ゴムパッド | clean |  |  |  |
| 943 | common | シートガスケット | clean |  |  |  |
| 944 | common | 緩衝材 | clean |  |  |  |
| 945 | common | 段差台 | clean |  |  |  |
| 946 | lifeline | 光ケーブル地中配線 | clean |  |  |  |
| 947 | lifeline | 加湿器 | clean |  |  |  |
| 948 | lifeline | スプリンクラーヘッド | clean |  |  |  |
| 949 | lifeline | 開放型スプリンクラー | clean |  |  |  |
| 950 | lifeline | 閉鎖型スプリンクラー | clean |  |  |  |
| 951 | lifeline | 差動式感知器 | clean |  |  |  |
| 952 | lifeline | 定温式感知器 | clean |  |  |  |
| 953 | lifeline | 光電式感知器 | clean |  |  |  |
| 954 | lifeline | イオン化式感知器 | clean |  |  |  |
| 955 | lifeline | 自動火災報知設備 | clean |  |  |  |
| 956 | lifeline | 緩降機 | clean |  |  |  |
| 957 | lifeline | 避難はしご | clean |  |  |  |
| 958 | lifeline | 救助袋 | clean |  |  |  |
| 959 | lifeline | 防火戸 | clean |  |  |  |
| 960 | lifeline | 防火ダンパー | clean |  |  |  |
| 961 | lifeline | 連結散水設備 | clean |  |  |  |
| 962 | lifeline | 連結送水管 | clean |  |  |  |
| 963 | lifeline | 消火ポンプ | clean |  |  |  |
| 964 | lifeline | 非常灯 | clean |  |  |  |
| 965 | lifeline | 誘導灯 | clean |  |  |  |
| 966 | lifeline | 発信機 | clean |  |  |  |
| 967 | lifeline | 受信機 | clean |  |  |  |
| 968 | lifeline | 排煙設備 | clean |  |  |  |
| 969 | lifeline | 粉末消火器 | clean |  |  |  |
| 970 | lifeline | 消防用水 | clean |  |  |  |
| 971 | lifeline | 防火区画 | clean |  |  |  |
| 972 | lifeline | 耐火構造 | clean |  |  |  |
| 973 | lifeline | ロックウール | clean |  |  |  |
| 974 | lifeline | ビーズ法ポリスチレンフォーム | clean |  |  |  |
| 975 | lifeline | 押出法ポリスチレンフォーム | clean |  |  |  |
| 976 | lifeline | 硬質ウレタンフォーム | clean |  |  |  |
| 977 | lifeline | フェノールフォーム | clean |  |  |  |
| 978 | lifeline | パーライト保温材 | clean |  |  |  |
| 979 | lifeline | 外装材 | clean |  |  |  |
| 980 | lifeline | アルミ外装 | clean |  |  |  |
| 981 | lifeline | 防湿層 | clean |  |  |  |
| 983 | lifeline | 伸縮継手カバー | clean |  |  |  |
| 984 | lifeline | 保温筒 | clean |  |  |  |
| 985 | lifeline | 保温帯 | clean |  |  |  |
| 986 | lifeline | 亜鉛鉄線 | clean |  |  |  |
| 987 | lifeline | 熱伝導率 | clean |  |  |  |
| 988 | lifeline | 熱抵抗 | clean |  |  |  |
| 989 | lifeline | 熱貫流率 | clean |  |  |  |
| 990 | lifeline | 保温厚さ計算 | clean |  |  |  |
| 991 | lifeline | 結露防止 | clean |  |  |  |
| 992 | lifeline | 耐熱温度 | clean |  |  |  |
| 993 | lifeline | 吸水率 | clean |  |  |  |
| 994 | lifeline | 防火区画貫通処理 | clean |  |  |  |
| 995 | lifeline | 保温施工手順 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 996 | lifeline | ポリエチレンフォーム | clean |  |  |  |
| 997 | lifeline | 保冷工事 | clean |  |  |  |
| 998 | lifeline | 分電盤 | clean |  |  |  |
| 999 | lifeline | 変圧器 | clean |  |  |  |
| 1000 | lifeline | ジャンクションボックス | clean |  |  |  |
| 1001 | lifeline | 接地抵抗 | clean |  |  |  |
| 1002 | lifeline | ブッシング | clean |  |  |  |
| 1003 | lifeline | 電力量計 | clean |  |  |  |
| 1004 | lifeline | 幹線 | clean |  |  |  |
| 1005 | lifeline | 分岐回路 | clean |  |  |  |
| 1006 | lifeline | 単相 | clean |  |  |  |
| 1007 | lifeline | 三相 | clean |  |  |  |
| 1008 | lifeline | 許容電流 | clean |  |  |  |
| 1009 | lifeline | 絶縁抵抗測定 | clean |  |  |  |
| 1010 | lifeline | 碍子 | clean |  |  |  |
| 1011 | lifeline | 配線用遮断器 | clean |  |  |  |
| 1012 | lifeline | ケーブルトレイ | clean |  |  |  |
| 1013 | lifeline | 低圧 | clean |  |  |  |
| 1014 | lifeline | 高圧 | clean |  |  |  |
| 1015 | lifeline | 接地工事の種類 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1016 | lifeline | 制御ケーブル | clean |  |  |  |
| 1017 | lifeline | アースクランプ | clean |  |  |  |
| 1018 | lifeline | ノックアウト | clean |  |  |  |
| 1019 | lifeline | 電線の識別色 | clean |  |  |  |
| 1020 | lifeline | 引込線 | clean |  |  |  |
| 1021 | lifeline | 電気工事士 | clean |  |  |  |
| 1022 | lifeline | 仕切弁 | clean |  |  |  |
| 1023 | lifeline | 玉形弁 | clean |  |  |  |
| 1024 | lifeline | ボールバルブ | clean |  |  |  |
| 1025 | lifeline | バタフライバルブ | clean |  |  |  |
| 1026 | lifeline | 逆止弁 | clean |  |  |  |
| 1027 | lifeline | 安全弁 | clean |  |  |  |
| 1028 | lifeline | フランジ接合 | clean |  |  |  |
| 1029 | lifeline | ソケット接合 | clean |  |  |  |
| 1030 | lifeline | グルーブド接合 | clean |  |  |  |
| 1031 | lifeline | ストレーナー | clean |  |  |  |
| 1032 | lifeline | レデューサー | clean |  |  |  |
| 1033 | lifeline | ユニオン | clean |  |  |  |
| 1034 | lifeline | Uボルト | clean |  |  |  |
| 1035 | lifeline | 吊りバンド | clean |  |  |  |
| 1036 | lifeline | 防振継手 | clean |  |  |  |
| 1037 | lifeline | 可とう継手 | clean |  |  |  |
| 1038 | lifeline | 通気管 | clean |  |  |  |
| 1039 | lifeline | 呼び径 | clean |  |  |  |
| 1040 | lifeline | 気密試験 | clean |  |  |  |
| 1041 | lifeline | 給水管 | clean |  |  |  |
| 1042 | lifeline | 排水管 | clean |  |  |  |
| 1043 | lifeline | ニップル | clean |  |  |  |
| 1044 | lifeline | 配管図 | clean |  |  |  |
| 1045 | lifeline | 管支持金具 | clean |  |  |  |
| 1046 | lifeline | 水撃作用 | clean |  |  |  |
| 1047 | lifeline | ONU（光回線終端装置） | clean |  |  |  |
| 1048 | lifeline | OLT（光加入者線終端装置） | clean |  |  |  |
| 1049 | lifeline | シングルモードファイバー | clean |  |  |  |
| 1050 | lifeline | マルチモードファイバー | clean |  |  |  |
| 1051 | lifeline | SCコネクタ | clean |  |  |  |
| 1052 | lifeline | LCコネクタ | clean |  |  |  |
| 1053 | lifeline | STコネクタ | clean |  |  |  |
| 1054 | lifeline | 反射損失 | clean |  |  |  |
| 1055 | lifeline | 挿入損失 | clean |  |  |  |
| 1056 | lifeline | デッドゾーン | clean |  |  |  |
| 1057 | lifeline | パッチパネル | clean |  |  |  |
| 1058 | lifeline | STPケーブル | clean |  |  |  |
| 1059 | lifeline | 通信ラック | clean |  |  |  |
| 1060 | lifeline | 通信キャビネット | clean |  |  |  |
| 1061 | lifeline | IDF（中間配線盤） | clean |  |  |  |
| 1062 | lifeline | 接地端子盤 | clean |  |  |  |
| 1063 | lifeline | 保安器 | clean |  |  |  |
| 1064 | lifeline | 端子台 | clean |  |  |  |
| 1065 | lifeline | 成端 | clean |  |  |  |
| 1066 | lifeline | 心線対照 | clean |  |  |  |
| 1067 | lifeline | 光ケーブルの曲げ半径 | clean |  |  |  |
| 1068 | lifeline | Cat5eケーブル | clean |  |  |  |
| 1069 | lifeline | Cat6ケーブル | clean |  |  |  |
| 1070 | lifeline | 光スプリッター | clean |  |  |  |
| 1071 | lifeline | PON（受動光ネットワーク） | clean |  |  |  |
| 1072 | common | 枠組足場 | clean |  |  |  |
| 1073 | common | 単管足場 | clean |  |  |  |
| 1074 | common | くさび緊結式足場 | clean |  |  |  |
| 1075 | common | 安全ネット | clean |  |  |  |
| 1076 | common | 手すり | clean |  |  |  |
| 1077 | common | 中さん | clean |  |  |  |
| 1078 | common | 巾木 | clean |  |  |  |
| 1079 | common | 昇降設備 | clean |  |  |  |
| 1080 | common | 酸素濃度計 | clean |  |  |  |
| 1081 | common | 硫化水素 | clean |  |  |  |
| 1082 | common | 有害ガス検知器 | clean |  |  |  |
| 1083 | common | 送気マスク | clean |  |  |  |
| 1084 | common | ロックアウト・タグアウト | KEEP |  |  | rule 1 — `・` internal to one katakana loanword |
| 1085 | common | 作業主任者 | clean |  |  |  |
| 1086 | common | ツールボックスミーティング | clean |  |  |  |
| 1087 | common | 安全当番 | clean |  |  |  |
| 1088 | common | 安全パトロール | clean |  |  |  |
| 1089 | common | 作業手順書 | clean |  |  |  |
| 1090 | common | 墜落制止用器具 | clean |  |  |  |
| 1091 | common | 飛来・落下 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 1092 | common | 熱中症 | clean |  |  |  |
| 1093 | common | 粉じん | clean |  |  |  |
| 1094 | common | リスクアセスメント | clean |  |  |  |
| 1095 | common | ヒヤリハット | clean |  |  |  |
| 1096 | common | KYT（危険予知訓練） | clean |  |  |  |
| 1097 | common | PC杭 | clean |  |  |  |
| 1098 | common | PHC杭 | clean |  |  |  |
| 1099 | common | シートパイル | clean |  |  |  |
| 1100 | common | 湿潤養生 | clean |  |  |  |
| 1101 | common | 蒸気養生 | clean |  |  |  |
| 1102 | common | 被膜養生 | clean |  |  |  |
| 1103 | common | 打ち継ぎ目 | clean |  |  |  |
| 1104 | common | ブリーディング | clean |  |  |  |
| 1105 | common | クラック | clean |  |  |  |
| 1106 | common | 杭打ち機 | clean |  |  |  |
| 1107 | lifeline | システム天井 | clean |  |  |  |
| 1108 | lifeline | フリーアクセスフロア | clean |  |  |  |
| 1109 | common | ALCパネル | clean |  |  |  |
| 1110 | common | カーテンウォール | clean |  |  |  |
| 1111 | common | サイディング | clean |  |  |  |
| 1112 | common | コーキング | clean |  |  |  |
| 1113 | common | プライマー | clean |  |  |  |
| 1114 | common | バックアップ材 | clean |  |  |  |
| 1115 | common | 水切り | clean |  |  |  |
| 1116 | common | ビニル床シート | clean |  |  |  |
| 1117 | common | 長尺シート | clean |  |  |  |
| 1118 | lifeline | ロックウール吸音板 | clean |  |  |  |
| 1119 | common | ハンマードリル | clean |  |  |  |
| 1120 | common | インパクトドライバー | clean |  |  |  |
| 1121 | common | ウインチ | clean |  |  |  |
| 1122 | lifeline | パイプバイス | clean |  |  |  |
| 1123 | lifeline | パイプベンダー | clean |  |  |  |
| 1124 | common | 油圧ジャッキ | clean |  |  |  |
| 1125 | lifeline | 圧着工具 | clean |  |  |  |
| 1126 | common | トルクレンチ | clean |  |  |  |
| 1127 | common | シャコ万力 | clean |  |  |  |
| 1128 | common | タップ・ダイス | KEEP |  |  | borderline, resolved to KEEP |
| 1129 | common | 金切りのこ | clean |  |  |  |
| 1130 | lifeline | ホールソー | clean |  |  |  |
| 1131 | common | ガスバーナー | clean |  |  |  |
| 1132 | common | 絶縁抵抗計 | clean |  |  |  |
| 1133 | common | 接地抵抗計 | clean |  |  |  |
| 1134 | common | 電動ドリル | clean |  |  |  |
| 1135 | common | エアコンプレッサー | clean |  |  |  |
| 1136 | common | コンクリートカッター | clean |  |  |  |
| 1137 | common | チッパー | clean |  |  |  |
| 1138 | common | ジグソー | clean |  |  |  |
| 1139 | common | ボール盤 | clean |  |  |  |
| 1140 | lifeline | 防爆工具 | clean |  |  |  |
| 1141 | common | スコヤ | clean |  |  |  |
| 1142 | common | プライヤー | clean |  |  |  |
| 1143 | lifeline | 真空ポンプ | clean |  |  |  |
| 1144 | common | 施工計画書 | clean |  |  |  |
| 1145 | common | KYシート | clean |  |  |  |
| 1146 | common | 新規入場者カード | clean |  |  |  |
| 1147 | common | グリーンファイル | clean |  |  |  |
| 1148 | common | バーチャート | clean |  |  |  |
| 1149 | common | ネットワーク工程表 | clean |  |  |  |
| 1150 | common | 出来高 | clean |  |  |  |
| 1151 | common | 歩掛り | clean |  |  |  |
| 1152 | common | 直接仮設 | clean |  |  |  |
| 1153 | common | 共通仮設 | clean |  |  |  |
| 1154 | common | 原価管理 | clean |  |  |  |
| 1155 | common | 設計図書 | clean |  |  |  |
| 1156 | common | 竣工図 | clean |  |  |  |
| 1157 | common | 施工図 | clean |  |  |  |
| 1158 | common | 打合せ記録 | clean |  |  |  |
| 1159 | common | 工事日報 | clean |  |  |  |
| 1160 | common | 材料搬入 | clean |  |  |  |
| 1161 | common | 検収 | clean |  |  |  |
| 1162 | common | 是正 | clean |  |  |  |
| 1163 | common | 引渡し | clean |  |  |  |
| 1164 | common | 施工体制台帳 | clean |  |  |  |
| 1165 | common | 総合施工計画書 | clean |  |  |  |
| 1166 | common | 品質管理計画書 | clean |  |  |  |
| 1167 | common | 許可 | clean |  |  |  |
| 1168 | common | 請負契約 | clean |  |  |  |
| 1169 | common | 元請け | clean |  |  |  |
| 1170 | common | 下請け | clean |  |  |  |
| 1171 | common | 労働基準監督署 | clean |  |  |  |
| 1172 | common | 有給休暇 | clean |  |  |  |
| 1173 | common | 割増賃金 | clean |  |  |  |
| 1174 | common | 罰則 | clean |  |  |  |
| 1175 | common | 安全管理者 | clean |  |  |  |
| 1176 | common | 三大災害 | clean |  |  |  |
| 1177 | common | 安全帯 | clean |  |  |  |
| 1178 | common | フルハーネス型 | clean |  |  |  |
| 1179 | common | 立入禁止 | clean |  |  |  |
| 1180 | common | 保護具 | clean |  |  |  |
| 1181 | common | 感電 | clean |  |  |  |
| 1182 | common | 施工計画 | clean |  |  |  |
| 1183 | common | 工程表 | clean |  |  |  |
| 1184 | common | 発注者 | clean |  |  |  |
| 1185 | common | 専門業者 | clean |  |  |  |
| 1186 | lifeline | 冷媒 | clean |  |  |  |
| 1187 | lifeline | 勾配 | clean |  |  |  |
| 1188 | lifeline | 水圧試験 | clean |  |  |  |
| 1189 | lifeline | 漏れ試験 | clean |  |  |  |
| 1190 | lifeline | サドル | clean |  |  |  |
| 1191 | lifeline | 継手 | clean |  |  |  |
| 1192 | lifeline | フランジ | clean |  |  |  |
| 1193 | lifeline | バルブ | clean |  |  |  |
| 1194 | lifeline | 配線 | clean |  |  |  |
| 1195 | lifeline | 分岐 | clean |  |  |  |
| 1196 | lifeline | 電熱線 | clean |  |  |  |
| 1197 | common | おはようございます | clean |  |  |  |
| 1198 | common | よろしくお願いします | clean |  |  |  |
| 1199 | common | ありがとうございます | clean |  |  |  |
| 1200 | common | すみません | clean |  |  |  |
| 1201 | common | わかりました | clean |  |  |  |
| 1202 | common | わかりません | clean |  |  |  |
| 1203 | common | もう一度言ってください | clean |  |  |  |
| 1204 | common | 手伝ってください | clean |  |  |  |
| 1205 | common | ちょっと待ってください | clean |  |  |  |
| 1206 | common | お先に失礼します | clean |  |  |  |
| 1207 | common | お疲れ様でした | clean |  |  |  |
| 1208 | common | 了解しました | clean |  |  |  |
| 1209 | common | 終わりました | clean |  |  |  |
| 1210 | common | 気をつけて | clean |  |  |  |
| 1211 | common | お願いします | clean |  |  |  |
| 1212 | common | 確認します | clean |  |  |  |
| 1213 | common | 行ってきます／行ってらっしゃい | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1214 | common | お世話になっております | clean |  |  |  |
| 1215 | common | 報告 | clean |  |  |  |
| 1216 | common | 連絡 | clean |  |  |  |
| 1217 | common | 相談 | clean |  |  |  |
| 1218 | common | ほう・れん・そう | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1219 | common | 指示 | clean |  |  |  |
| 1220 | common | 敬語 | clean |  |  |  |
| 1221 | common | 身だしなみ | clean |  |  |  |
| 1222 | common | 遅刻 | clean |  |  |  |
| 1223 | common | 欠勤 | clean |  |  |  |
| 1224 | common | 届け出 | clean |  |  |  |
| 1225 | common | 体調管理 | clean |  |  |  |
| 1226 | common | 体調不良 | clean |  |  |  |
| 1227 | common | 水分補給 | clean |  |  |  |
| 1228 | common | 休憩 | clean |  |  |  |
| 1229 | common | 残業 | clean |  |  |  |
| 1230 | common | 時間厳守 | clean |  |  |  |
| 1231 | common | 給与明細 | clean |  |  |  |
| 1232 | common | 特定技能 | clean |  |  |  |
| 1233 | common | 在留カード | clean |  |  |  |
| 1234 | common | 在留資格 | clean |  |  |  |
| 1235 | common | 在留期間 | clean |  |  |  |
| 1236 | common | 就労 | clean |  |  |  |
| 1237 | common | 更新 | clean |  |  |  |
| 1238 | common | 社会保険 | clean |  |  |  |
| 1239 | common | 健康保険 | clean |  |  |  |
| 1240 | common | 厚生年金 | clean |  |  |  |
| 1241 | common | 雇用保険 | clean |  |  |  |
| 1242 | common | 保険証 | clean |  |  |  |
| 1243 | common | ヘルメット | clean |  |  |  |
| 1244 | common | 安全靴 | clean |  |  |  |
| 1245 | common | 防じんマスク | clean |  |  |  |
| 1246 | common | 耳栓 | clean |  |  |  |
| 1247 | common | 保護めがね | clean |  |  |  |
| 1248 | common | CCUS（建設キャリアアップシステム） | clean |  |  |  |
| 1249 | common | 技能レベル | clean |  |  |  |
| 1250 | lifeline | 室外機 | clean |  |  |  |
| 1251 | lifeline | 室内機 | clean |  |  |  |
| 1252 | lifeline | フレア加工 | clean |  |  |  |
| 1253 | lifeline | ドレン配管 | clean |  |  |  |
| 1254 | lifeline | 建設工事の3区分 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1255 | lifeline | 吹付けウレタン断熱工事 | clean |  |  |  |
| 1256 | lifeline | ウレタン断熱施工品質管理 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1257 | lifeline | 防露工事 | clean |  |  |  |
| 1258 | lifeline | 保温保冷工事の安全機能 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1259 | lifeline | 推進トンネル工事 | clean |  |  |  |
| 1260 | lifeline | 推進管の種類 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1261 | lifeline | 配管工事の基本技能 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1262 | lifeline | 受水槽 | clean |  |  |  |
| 1263 | lifeline | 通気設備 | clean |  |  |  |
| 1264 | lifeline | ウレタン防水工事 | clean |  |  |  |
| 1265 | lifeline | FRP防水工事 | clean |  |  |  |
| 1266 | lifeline | シーリング防水工事 | clean |  |  |  |
| 1267 | lifeline | さく井工事の種類 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1268 | lifeline | 電気通信工事の通信土木 | clean |  |  |  |
| 1269 | lifeline | 上水道工事の流れ | clean |  |  |  |
| 1270 | lifeline | 下水道工事の流れ | clean |  |  |  |
| 1271 | lifeline | 消防法による設置義務 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1272 | common | CCUSの4レベルと条件 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1273 | common | ドローンの飛行禁止5ルール | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1274 | common | 建設業法の許可業種（設備関係） | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1275 | common | 建設労働者雇用改善法の重点施策 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1276 | common | 特定技能外国人・失業時の在留ルール | KEEP |  |  | borderline, resolved to KEEP |
| 1277 | common | 足場の組立て等作業主任者・作業者 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 1278 | common | 地山の掘削及び土止め支保工作業主任者 | clean |  |  |  |
| 1279 | common | ロープ高所作業（特別教育） | clean |  |  |  |
| 1280 | common | 型わく支保工・ずい道等掘削作業主任者 | SPLIT | 2 | MECHANICAL | 型わく支保工 + ずい道等掘削作業主任者 |
| 1281 | common | とび職の6種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1282 | common | 鉄骨構造の3種類と2工法 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1283 | common | 車両系建設機械と3t境界 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1284 | common | 産業廃棄物の保管とマニフェスト義務 | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1285 | common | 熱中症予防の3対策 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1286 | common | 航空障害灯とドローン規制の数値 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1287 | common | 給排水工事 | clean |  |  |  |
| 1288 | common | 転圧 | clean |  |  |  |
| 1289 | common | 路床・路盤・表層（舗装工事の層構造） | SPLIT | 3 | MECHANICAL | 路床 + 路盤 + 表層 |
| 1290 | common | 遣り方・水貫・水盛り | MERGE |  |  | duplicate content — fold into 1334 |
| 1291 | common | 治水vs 利水 | SPLIT | 2 | MECHANICAL | 治水 + 利水 |
| 1292 | common | NATM（ナトム）工法 | clean |  |  |  |
| 1293 | common | シールドトンネル・セグメント | SPLIT | 2 | MECHANICAL | シールドトンネル + セグメント |
| 1294 | common | 橋梁工事（下部工・上部工） | SPLIT | 2 | MECHANICAL | 下部工 + 上部工 |
| 1295 | common | 海洋土木工事 | clean |  |  |  |
| 1296 | common | 浚渫工事 | clean |  |  |  |
| 1297 | common | ケーソン（防波堤工事） | clean |  |  |  |
| 1298 | common | ボーリング調査・支持層 | KEEP |  |  | borderline, resolved to KEEP |
| 1299 | common | 杭工事 | KEEP |  |  | borderline, resolved to KEEP |
| 1300 | common | 根切り | clean |  |  |  |
| 1301 | common | 盛り土vs 切り土 | SPLIT | 2 | MECHANICAL | 盛り土 + 切り土 |
| 1302 | common | 埋め戻し作業 | clean |  |  |  |
| 1303 | common | さく井工事の4種類（水源・観測・温泉・地熱） | SPLIT | 4 | MECHANICAL | 水源 + 観測 + 温泉 + 地熱 |
| 1304 | common | ディープウェル（深井戸排水） | clean |  |  |  |
| 1305 | common | とび工事の種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1306 | common | 開削トンネル | clean |  |  |  |
| 1307 | common | 法面工事 | clean |  |  |  |
| 1308 | common | 河川・海岸の構造物（防波堤・防潮堤・護岸堤防・水路） | SPLIT | 4 | MECHANICAL | 防波堤 + 防潮堤 + 護岸堤防 + 水路 |
| 1309 | common | 鉄道工事 | clean |  |  |  |
| 1310 | common | 上下水道工事 | clean |  |  |  |
| 1311 | common | 災害復旧工事 | clean |  |  |  |
| 1312 | common | 埋立工事 vs 岸壁工事（うめたて・がんぺき） | SPLIT | 2 | MECHANICAL | うめたて + がんぺき |
| 1313 | common | 舗装の4層 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1314 | common | 杭の材料3種 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1315 | common | 温泉井 vs 地熱井（深さと危険性） | SPLIT | 2 | MECHANICAL | 温泉井 + 地熱井 |
| 1316 | common | 地縄張り・水糸 | SPLIT | 2 | MECHANICAL | 地縄張り + 水糸 |
| 1317 | common | 盛り土・段切り | SPLIT | 2 | MECHANICAL | 盛り土 + 段切り |
| 1318 | common | 根切り・余堀り・鋤取り・床付け | SPLIT | 4 | MECHANICAL | 根切り + 余堀り + 鋤取り + 床付け |
| 1319 | common | 埋め戻し・突き固め・水締め | SPLIT | 3 | MECHANICAL | 埋め戻し + 突き固め + 水締め |
| 1320 | common | 杭間さらい・段跳ね | SPLIT | 2 | MECHANICAL | 杭間さらい + 段跳ね |
| 1321 | common | 山砂 | clean |  |  |  |
| 1322 | common | 既成杭工法 vs 場所打ちコン杭工法 | SPLIT | 2 | MECHANICAL | 既成杭工法 + 場所打ちコン杭工法 |
| 1323 | common | タンパー vs たこ（重量突き固め） | SPLIT | 2 | MECHANICAL | タンパー + たこ |
| 1324 | common | ダム工事の目的：治水 vs 利水 | SPLIT | 2 | MECHANICAL | 治水 + 利水 |
| 1325 | common | トンネルの4種類（工法で分類） | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1326 | common | NATM工法（山岳トンネル） | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1327 | common | シールドトンネル工法（立坑・セグメント） | KEEP |  |  | rule 3 — headword + parenthetical variants |
| 1328 | common | 橋梁工事：種類と下部工・上部工 | SPLIT | 2 | MECHANICAL | 種類と下部工 + 上部工 |
| 1329 | common | 海洋土木工事の特徴と主要施設 | clean |  |  |  |
| 1330 | common | 土工事の作業6種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1331 | common | 舗装工事の4層構造 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1332 | common | とび工事の6種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1333 | common | 海洋土木の4工事 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1334 | common | 遣り方・水貫・水盛り・地縄張り・水糸 | SPLIT | 5 | MECHANICAL | 遣り方 + 水貫 + 水盛り + 地縄張り + 水糸 |
| 1335 | common | 盛り土・段切り・締固め・転圧・埋戻し・突固め | SPLIT | 6 | MECHANICAL | 盛り土 + 段切り + 締固め + 転圧 + 埋戻し + 突固め |
| 1336 | common | 路盤・路床・表層（舗装土工事3語） | SPLIT | 3 | MECHANICAL | 路盤 + 路床 + 表層 |
| 1337 | common | 地縄はり・根切り・根入れ長さ・素掘り | SPLIT | 4 | MECHANICAL | 地縄はり + 根切り + 根入れ長さ + 素掘り |
| 1338 | common | 場所打ち・打つ（打設） | SPLIT | 2 | MECHANICAL | 場所打ち + 打つ |
| 1339 | common | 余堀り・鋤取り・床付け・杭間さらい・段跳ね | SPLIT | 5 | MECHANICAL | 余堀り + 鋤取り + 床付け + 杭間さらい + 段跳ね |
| 1340 | common | 土木工事の特徴 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 1341 | common | 敷き均し作業 | clean |  |  |  |
| 1342 | common | 鋼管杭 | clean |  |  |  |
| 1343 | common | 液状化 | clean |  |  |  |
| 1344 | common | 地耐力 | clean |  |  |  |
| 1345 | common | コンバージョン | clean |  |  |  |
| 1346 | common | あと施工アンカー | clean |  |  |  |
| 1347 | common | 軽量鉄骨（LGS） vs 重量鉄骨 | SPLIT | 2 | MECHANICAL | 軽量鉄骨 + 重量鉄骨 |
| 1348 | common | 鉄骨構造の種類（ブレース・ラーメン・トラス） | SPLIT | 3 | MECHANICAL | ブレース + ラーメン + トラス |
| 1349 | common | 建て逃げ方式 vs 水平積み上げ方式 | SPLIT | 2 | MECHANICAL | 建て逃げ方式 + 水平積み上げ方式 |
| 1350 | common | 推進トンネル | clean |  |  |  |
| 1351 | common | 建築物の構造種類（RC・S・SRC・木造・CB造） | SPLIT | 5 | MECHANICAL | RC + S + SRC + 木造 + CB造 |
| 1352 | common | 山留め工事・支保工 | SPLIT | 2 | MECHANICAL | 山留め工事 + 支保工 |
| 1353 | common | 耐震・制振・免振（たいしん・せいしん・めんしん） | SPLIT | 3 | MECHANICAL | たいしん + せいしん + めんしん |
| 1354 | common | 鉄筋継手工事の4種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1355 | common | 型枠工事・支保工（かたわく・しほこう） | SPLIT | 2 | MECHANICAL | かたわく + しほこう |
| 1356 | common | レディミクスドコンクリート（生コン） | clean |  |  |  |
| 1357 | common | 左官工事 | clean |  |  |  |
| 1358 | common | 防水工事の5種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1359 | common | 宮大工 | clean |  |  |  |
| 1360 | common | 雨仕舞 | clean |  |  |  |
| 1361 | common | 塗装工事の3方法（はけ・ローラー・エアスプレー） | SPLIT | 3 | MECHANICAL | はけ + ローラー + エアスプレー |
| 1362 | common | 造園工事の5種類 | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1363 | common | 軽天工事・LGS | KEEP |  |  | borderline, resolved to KEEP |
| 1364 | common | カバー工法（サッシ改修） | clean |  |  |  |
| 1365 | common | 石工事 | clean |  |  |  |
| 1366 | common | コンクリート圧送工事の3役チームワーク | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1367 | common | 左官仕上げ | clean |  |  |  |
| 1368 | common | 在来軸組工法 | clean |  |  |  |
| 1369 | common | 建具の材料種類 + シャッター・自動ドア | SPLIT | 3 | MECHANICAL | 建具の材料種類 + シャッター + 自動ドア |
| 1370 | common | 吹付けウレタン | clean |  |  |  |
| 1371 | common | コンクリートブロック造（CB造） | clean |  |  |  |
| 1372 | common | 法面・地山・山がくる・山留め | SPLIT | 4 | MECHANICAL | 法面 + 地山 + 山がくる + 山留め |
| 1373 | common | 基礎免振 | clean |  |  |  |
| 1374 | common | 配筋・間隔・あき | SPLIT | 3 | MECHANICAL | 配筋 + 間隔 + あき |
| 1375 | common | かぶり厚さ | clean |  |  |  |
| 1376 | common | RC造・S造・SRC造・木造 | SPLIT | 4 | MECHANICAL | RC造 + S造 + SRC造 + 木造 |
| 1377 | common | あそび・建込み | SPLIT | 2 | MECHANICAL | あそび + 建込み |
| 1378 | common | コンクリートブロック造 | clean |  |  |  |
| 1379 | common | 建築物の構造5種類 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1380 | common | 建築工事の流れ（大規模ビル・マンション） | KEEP |  |  | rule 4 — deliberate contrast pair |
| 1381 | common | 耐震・制振・免振の3種類（地震対策） | MERGE |  |  | duplicate content — fold into 1353 |
| 1382 | common | 鉄筋継手の4種類 | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1383 | common | 型枠工事と支保工（かたわく大工） | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1384 | common | コンクリート圧送工事と3者チームワーク | KEEP |  |  | rule 2 — named concept whose parts are its definition |
| 1385 | common | 左官工事（研ぎ出し・洗い出し・漆喰） | SPLIT | 3 | MECHANICAL | 研ぎ出し + 洗い出し + 漆喰 |
| 1386 | common | 吹付けウレタン断熱工事 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 1387 | common | 内装仕上げ工事（LGS・ボード・クロス・床） | SPLIT | 4 | MECHANICAL | LGS + ボード + クロス + 床 |
| 1388 | common | サッシ工事とカバー工法（金属建具の取付け） | SPLIT | ? | NEEDS-NEW-TEXT | items named only in desc — needs new jp headwords |
| 1389 | common | 建築大工工事の種類（町大工・造作大工・宮大工） | SPLIT | 3 | MECHANICAL | 町大工 + 造作大工 + 宮大工 |
| 1390 | common | 屋根工事：瓦ぶきと雨仕舞い + 5種の屋根工事 | SPLIT | 2 | MECHANICAL | 瓦ぶきと雨仕舞い + 5種の屋根工事 |
| 1391 | common | 石工事（石工・大理石・御影石・擬石） | SPLIT | 4 | MECHANICAL | 石工 + 大理石 + 御影石 + 擬石 |
| 1392 | common | 壁芯・柱芯・親墨・矩を振る・墨付け | SPLIT | 5 | MECHANICAL | 壁芯 + 柱芯 + 親墨 + 矩を振る + 墨付け |
| 1393 | common | 土留め・擁壁・矢板・鋼矢板・山留め（崩壊防止5語） | SPLIT | 5 | MECHANICAL | 土留め + 擁壁 + 矢板 + 鋼矢板 + 山留め |
| 1394 | common | 地山・法面・山がくる（自然地盤と崩壊危険） | SPLIT | 3 | MECHANICAL | 地山 + 法面 + 山がくる |
| 1395 | common | 杭基礎・スラブ・杭地業・基礎免振 | SPLIT | 4 | MECHANICAL | 杭基礎 + スラブ + 杭地業 + 基礎免振 |
| 1396 | common | 配筋・拾い出し・あそび・あき・間隔（鉄筋基本5語） | SPLIT | 5 | MECHANICAL | 配筋 + 拾い出し + あそび + あき + 間隔 |
| 1397 | common | 捨てコン・結束（ハッカー）・かぶり厚さ | SPLIT | 3 | MECHANICAL | 捨てコン + 結束 + かぶり厚さ |
| 1398 | common | 建込み・ノロ・アンコ・転用・パンク・釘仕舞 | SPLIT | 6 | MECHANICAL | 建込み + ノロ + アンコ + 転用 + パンク + 釘仕舞 |
| 1399 | common | RC造・S造・SRC造・木造・CB造 | SPLIT | 5 | MECHANICAL | RC造 + S造 + SRC造 + 木造 + CB造 |
| 1400 | common | 道路工事 | clean |  |  |  |
| 1401 | common | 表装工事 | KEEP |  |  | rule 6 — a rule/sentence, or one official category |
| 1402 | common | 鉄骨工事 | clean |  |  |  |
| 1403 | common | コンクリート打設工事 | clean |  |  |  |
| 1404 | common | 躯体 | clean |  |  |  |
| 1405 | common | アースアンカー | clean |  |  |  |
| 1406 | common | 塗膜防水 | clean |  |  |  |
| 1407 | common | スペーサー | clean |  |  |  |
| 1408 | common | セパレーター | clean |  |  |  |
| 1409 | common | 型枠離型剤 | clean |  |  |  |
| 1410 | common | ジャンカ | clean |  |  |  |
| 1411 | common | 鉄筋探査機 | clean |  |  |  |
| 1412 | common | ベースプレート | clean |  |  |  |
| 1413 | common | アンカーボルト | clean |  |  |  |
| 1414 | common | 軽量鉄骨下地 | clean |  |  |  |
| 1415 | common | 天井下地 | clean |  |  |  |
| 1416 | common | 吹付け塗装 | clean |  |  |  |
| 1417 | common | 下地処理 | clean |  |  |  |
| 1418 | common | 壁クロス | clean |  |  |  |
| 1419 | common | ランナー | clean |  |  |  |
| 1420 | common | 不燃材料 | clean |  |  |  |
| 1421 | common | 接着工法 | clean |  |  |  |
| 1422 | common | 遣り方 | clean |  |  |  |
| 1423 | common | 根切り | clean |  |  |  |
| 1424 | common | 締固め | clean |  |  |  |
| 1425 | common | 段切り | clean |  |  |  |
| 1426 | common | 路床 | clean |  |  |  |
| 1427 | common | 敷き均し | clean |  |  |  |
| 1428 | common | 土木 | clean |  |  |  |
| 1429 | common | 水盛り | clean |  |  |  |
| 1430 | common | 掘削 | clean |  |  |  |
| 1431 | common | 山留め | clean |  |  |  |
| 1432 | common | 型枠 | clean |  |  |  |
| 1433 | common | 鉄筋 | clean |  |  |  |
| 1434 | common | 釘仕舞 | clean |  |  |  |
| 1435 | common | 転用 | clean |  |  |  |
| 1436 | common | アスファルト防水 | clean |  |  |  |
| 1437 | common | シート防水 | clean |  |  |  |
| 1438 | common | スランプ試験 | clean |  |  |  |
| 1439 | common | 石膏ボード | clean |  |  |  |
| 1440 | common | 防水シート | clean |  |  |  |
| 1441 | common | 目地 | clean |  |  |  |
| 1442 | common | モルタル | clean |  |  |  |
| 1443 | common | スタッド | clean |  |  |  |
