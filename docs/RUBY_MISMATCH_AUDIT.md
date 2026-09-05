# Ruby Mismatch Audit

> **Status re-measured 2026-09-05. 144 of the original 182 findings are still live** (84 in
> `cards-common.js`, 60 in `cards-lifeline.js`); 38 were fixed by other work in the meantime and
> are struck through in the table below. **The mitigation this file originally described no longer
> exists** — see "What changed" immediately below before acting on anything here.
>
> This is a work queue, not a spec: it retires to `docs/archive/` when the list is empty
> (`docs/AGENT_WORKFLOW.md` §3, §4).

Generated 2026-08-27 while investigating a live ruby-rendering bug report (garbled furigana on
wrap, e.g. the "安全確認の8項目" card). Full story and the code-level fix: see the commit that
added this file, and `docs/CARD_CONTENT_SPEC.md` §6 for the ruby rules these violate.

## What this is

182 entries (144 remaining) in `src/data/source/cards-common.js` / `cards-lifeline.js` where a
`《reading》` marker's reading is implausibly long (>4 kana per kanji) for the kanji run
`parseRubyFragments` actually matches it to (`src/components/JpDisplay.jsx`). In every case
checked, the root cause is the same: the reading was authored for a longer phrase --
kanji + a hiragana particle/katakana loanword/number in between + more kanji -- but only the
kanji run touching the marker gets captured as the ruby base.

35 close-by siblings of this same issue were confidently auto-fixed at the time (see that
commit) -- these 182 are the ones a dictionary cross-check against this dataset's own 2,287
already-correct readings could NOT verify with confidence, so nothing was guessed.

## What changed since this was written (2026-09-05)

**The original text said "These are NOT currently visually broken", on the strength of a
JpDisplay.jsx fallback that folded the in-between plain text into the ruby span whenever the
reading looked disproportionate. That fallback was deleted on 2026-09-04** (`CHANGELOG.md`
[6.0.0], "Ruby rendering"): it was itself producing three classes of wrong annotation, including
89 strings where Indonesian prose got folded into a ruby base. Where a base starts is now
*matched* against the reading rather than guessed from shape or length.

So the practical status of the 144 remaining rows changed, and this file said the opposite for
nine days. A reading that cannot be matched to the text before it is now annotated over just the
kanji run touching the marker — the too-wide `<rt>` case — which a browser spreads across its
base. That is the visible failure mode this file was written about. Corpus-wide, readings that
cannot align to the text before them fell from 283 to 122 in the 2026-09-04 pass, and among card
titles from 32 to 3; these rows are what is left.

**Also fixed elsewhere:** 38 of the 182 were resolved by the 2026-09-04 content pass (147 split
words whose second marker carried the whole word's reading, and 33 card titles re-annotated by
hand). They are struck through below rather than deleted, so a re-run of the original scan can be
compared against this list.

`npm run audit:text` (`scripts/audit-data-text.mjs`) guards the two mechanical shapes — pooled
readings and carried-over readings — and passes clean. It cannot see these 144: a reading that is
merely *scoped too wide* is well-formed data, and no script has an independent idea of the right
reading. That is why this list is hand-work.

## Why these weren't auto-fixed

- **Contains a digit**: number pronunciation has unpredictable sound changes (六 -> ろく vs ろっ
  depending on what follows), not safe to guess algorithmically. The 4 instances of this found
  during the initial pass were verified and fixed by hand instead (see that commit) -- none
  remain in the table below, but re-run the scan rather than assuming that stays true forever.
- **Unresolved segment** (rest): the phrase contains a kanji run not seen anywhere else in this
  dataset with a confirmed correct reading, so there's no dictionary entry to check it against.
- **Reconstruction mismatch**: a dictionary match existed but concatenating it against the
  connector text didn't reproduce the given reading exactly (often a small transliteration
  difference, e.g. long-vowel マ mark ー vs spelled-out あ/い/う/え/お -- needs a human call on
  which is the house style, not a guess).

## Suggested next step

Same shape as `docs/UI_UX_PLAN.md` items 58/59: real, scoped, non-urgent work that deserves its
own session with someone who can confirm actual Japanese readings, not a guess-and-ship. It is
**no longer non-urgent in the same way**, though — see "What changed" above: these now render as
a too-wide `<rt>` rather than being masked by a fallback.

The regenerator script (dictionary cross-check + safe auto-apply) described here was never
committed; it lived in a chat session and is gone. Recreate it from this file's row list rather
than looking for it. The 2026-09-04 pass shows the shape that works: fix the mechanically
detectable classes in bulk, guard them in `scripts/audit-data-text.mjs` so they cannot come back,
and hand-annotate the rest from the card's own `desc`/`usage` fields, which in this corpus often
already carry the correct form.

## Full list (card id, dataset file, the phrase as currently written, the reading it carries)

~~Struck-through rows~~ were fixed by other work and no longer appear in the source files as
written; re-verified 2026-09-05 by matching each phrase against the current `src/data/source/`.

| id | file | phrase (as written) | reading | status |
|---|---|---|---|---|
| 14 | cards-common.js | 協定《さぶろくきょうてい》 | さぶろくきょうてい |  |
| 24 | cards-common.js | 業種《けんせつぎょうほうのにじゅうきゅうぎょうしゅ》 | けんせつぎょうほうのにじゅうきゅうぎょうしゅ |  |
| 107 | cards-common.js | り場《にゅうじょう》 | にゅうじょう |  |
| 107 | cards-common.js | 教育《しんきにゅうじょうしゃきょういく》 | しんきにゅうじょうしゃきょういく |  |
| 113 | cards-common.js | ~~疲労防止《ひろうぼうしてきせつなすいみんとしょくじ》~~ | ~~ひろうぼうしてきせつなすいみんとしょくじ~~ | fixed 2026-09-04 |
| 142 | cards-common.js | 原則《ちんぎんしはらいのごげんそく》 | ちんぎんしはらいのごげんそく |  |
| 143 | cards-common.js | 休憩時間の規定《きゅうけいじかんのきてい》 | きゅうけいじかんのきてい |  |
| 147 | cards-common.js | 給付《ろうさいほけんのよんきゅうふ》 | ろうさいほけんのよんきゅうふ |  |
| 152 | cards-common.js | 賠償予定の禁止《ばいしょうよていのきんし》 | ばいしょうよていのきんし |  |
| 152 | cards-common.js | 条《だいじゅうろくじょう》 | だいじゅうろくじょう |  |
| 153 | cards-common.js | ~~強制労働の禁止《きかいきんとうのげんそくきょうせいろうどうのきんし》~~ | ~~きかいきんとうのげんそくきょうせいろうどうのきんし~~ | fixed 2026-09-04 |
| 154 | cards-common.js | ~~解雇制限《かいこせいげんしょうびょうりょうようちゅうわかいこきんし》~~ | ~~かいこせいげんしょうびょうりょうようちゅうわかいこきんし~~ | fixed 2026-09-04 |
| 155 | cards-common.js | ~~労働条件の明示《ろうどうじょうけんのめいじろくこうもん》~~ | ~~ろうどうじょうけんのめいじろくこうもん~~ | fixed 2026-09-04 |
| 158 | cards-common.js | ~~法定休日《ほうていきゅうじつまいしゅうすくなくともいっかい》~~ | ~~ほうていきゅうじつまいしゅうすくなくともいっかい~~ | fixed 2026-09-04 |
| 159 | cards-common.js | 有給休暇の買い取り禁止《ゆうきゅうきゅうかのかいとりきんし》 | ゆうきゅうきゅうかのかいとりきんし |  |
| 166 | cards-common.js | 種類《しかくのさんしゅるい》 | しかくのさんしゅるい |  |
| 169 | cards-common.js | ~~タイル張り工事《たいるはりこうじらっかりすくたしょくしゅれんけい》~~ | ~~たいるはりこうじらっかりすくたしょくしゅれんけい~~ | fixed 2026-09-04 |
| 170 | cards-common.js | クレーン・移動式クレーン資格《くれえんいどうしきくれえんしかくしきい》 | くれえんいどうしきくれえんしかくしきい |  |
| 171 | cards-common.js | ~~高所作業車の資格境界《こうしょさぎょうしゃしかくきょうかい》~~ | ~~こうしょさぎょうしゃしかくきょうかい~~ | fixed 2026-09-04 |
| 172 | cards-common.js | ~~車両系建設機械の資格境界《しゃりょうけいけんせつきかいしかくきょうかい》~~ | ~~しゃりょうけいけんせつきかいしかくきょうかい~~ | fixed 2026-09-04 |
| 172 | cards-common.js | ね量《きたいじゅうりょう》 | きたいじゅうりょう |  |
| 173 | cards-common.js | ・アーク溶接の資格《あーくようせつのしかく》 | あーくようせつのしかく |  |
| 177 | cards-common.js | ~~機械土工事の代表機械《きかいどこうこうじだいひょうきかいぶるどおざあゆあつしょべるほいいるろおだあ》~~ | ~~きかいどこうこうじだいひょうきかいぶるどおざあゆあつしょべるほいいるろおだあ~~ | fixed 2026-09-04 |
| 178 | cards-common.js | ~~建築基準法の耐震基準《けんちくきじゅんほうたいしんきじゅんしんどきょうきょう》~~ | ~~けんちくきじゅんほうたいしんきじゅんしんどきょうきょう~~ | fixed 2026-09-04 |
| 182 | cards-common.js | ~~ゴンドラ操作《ごんどらそうさとくべつきょういくこうそうびるがいへきさぎょう》~~ | ~~ごんどらそうさとくべつきょういくこうそうびるがいへきさぎょう~~ | fixed 2026-09-04 |
| 186 | cards-common.js | ・仕上げ墨《しあげずみ》 | しあげずみ |  |
| 187 | cards-common.js | り芯《とおりしん》 | とおりしん |  |
| 220 | cards-common.js | 作業員詰め所《さぎょういんつめしょ》 | さぎょういんつめしょ |  |
| 231 | cards-common.js | 水セメント比《みずせめんとひ》 | みずせめんとひ |  |
| 242 | cards-common.js | 服装の注意《ふくそうのちゅうい》 | ふくそうのちゅうい |  |
| 242 | cards-common.js | 開《うわぎまえびらき》 | うわぎまえびらき |  |
| 242 | cards-common.js | け禁止《うわぎまええきんし》 | うわぎまええきんし |  |
| 298 | cards-common.js | レーザー墨出し器《すみだしき》 | すみだしき |  |
| 308 | cards-common.js | 度《やくななじゅうごど》 | やくななじゅうごど |  |
| 315 | cards-common.js | 釘打ち機《くぎうちき》 | くぎうちき |  |
| 348 | cards-common.js | ハンマーの種類《はんまあのしゅるい》 | はんまあのしゅるい |  |
| 414 | cards-common.js | 自然条件による影響《しぜんじょうけんによるえいきょう》 | しぜんじょうけんによるえいきょう |  |
| 418 | cards-common.js | キャリアアップカード・作業免許《きゃりああっぷかあど・さぎょうめんきょ》 | きゃりああっぷかあど・さぎょうめんきょ |  |
| 429 | cards-common.js | ~~軍手でのねじ加工は絶対禁止《ぐんてでのねじかこうぜったいきんし》~~ | ~~ぐんてでのねじかこうぜったいきんし~~ | fixed 2026-09-04 |
| 463 | cards-common.js | ~~以内は人力掘削《きそんまいせつかんしゅうへんごじゅっせんちいないはじんりきくっさく》~~ | ~~きそんまいせつかんしゅうへんごじゅっせんちいないはじんりきくっさく~~ | fixed 2026-09-04 |
| 505 | cards-common.js | 基準《ひょうかのさんきじゅん》 | ひょうかのさんきじゅん |  |
| 517 | cards-common.js | ~~火災《ゆうがいぶつせっしょく / おぼれる / かさい》~~ | ~~ゆうがいぶつせっしょく / おぼれる / かさい~~ | fixed 2026-09-04 |
| 526 | cards-common.js | ~~月《ねんいちがつ》~~ | ~~ねんいちがつ~~ | fixed 2026-09-04 |
| 530 | cards-common.js | ~~安全靴《しいるどめんつきへるめっと / あんぜんぐつ》~~ | ~~しいるどめんつきへるめっと / あんぜんぐつ~~ | fixed 2026-09-04 |
| 532 | cards-common.js | 熱中症の症状《ねっちゅうしょうのしょうじょう》 | ねっちゅうしょうのしょうじょう |  |
| 533 | cards-common.js | ~~救急箱《みどりじゅうじ / あんぜんえいせいき / きゅうきゅうばこ》~~ | ~~みどりじゅうじ / あんぜんえいせいき / きゅうきゅうばこ~~ | fixed 2026-09-04 |
| 539 | cards-common.js | ~~パワハラ防止法《ぱわあはらすめんとぼうしほうろうどうしさくそうごうすいしんほう》~~ | ~~ぱわあはらすめんとぼうしほうろうどうしさくそうごうすいしんほう~~ | fixed 2026-09-04 |
| 542 | cards-common.js | 労働者の責務《ろうどうしゃのせきむ》 | ろうどうしゃのせきむ |  |
| 545 | cards-common.js | つの目的《けんせつぎょうほうのいつつのもくてき》 | けんせつぎょうほうのいつつのもくてき |  |
| 546 | cards-common.js | 建ぺい率《けんぺいりつ》 | けんぺいりつ |  |
| 549 | cards-common.js | 大分類《けんせつこうじのさんだいぶんるい》 | けんせつこうじのさんだいぶんるい |  |
| 554 | cards-common.js | 種類《けんせつこうじのしかくさんしゅるい》 | けんせつこうじのしかくさんしゅるい |  |
| 563 | cards-common.js | での使い方《つかいかた》 | つかいかた |  |
| 566 | cards-common.js | ・仕上げ墨《しあげずみ》 | しあげずみ |  |
| 599 | cards-common.js | 巻き尺《まきじゃく》 | まきじゃく |  |
| 601 | cards-common.js | ハンドミキサ・かくはん機《はんどみきさ・かくはんき》 | はんどみきさ・かくはんき |  |
| 622 | cards-common.js | 外国人労働者の死亡災害《がいこくじんろうどうしゃのしぼうさいがい》 | がいこくじんろうどうしゃのしぼうさいがい |  |
| 700 | cards-common.js | のシール性《シールせい》 | シールせい |  |
| 725 | cards-common.js | ね量《じゅうりょう》 | じゅうりょう |  |
| 779 | cards-common.js | 理《あんぜんかんり》 | あんぜんかんり |  |
| 812 | cards-common.js | 尺《いっしゃく》 | いっしゃく |  |
| 841 | cards-common.js | してから仕上げ材《しあげざい》 | しあげざい |  |
| 943 | cards-common.js | フランジ面《フランジめん》 | フランジめん |  |
| 1097 | cards-common.js | 杭《ピーシーぐい》 | ピーシーぐい |  |
| 1098 | cards-common.js | 杭《ピーエイチシーぐい》 | ピーエイチシーぐい |  |
| 1103 | cards-common.js | 打ち継ぎ目《うちつぎめ》 | うちつぎめ |  |
| 1106 | cards-common.js | 杭打ち機《くいうちき》 | くいうちき |  |
| 1114 | cards-common.js | バックアップ材《バックアップざい》 | バックアップざい |  |
| 1149 | cards-common.js | ネットワーク工程表《ネットワークこうていひょう》 | ネットワークこうていひょう |  |
| 1178 | cards-common.js | フルハーネス型《ふるはーねすがた》 | ふるはーねすがた |  |
| 1272 | cards-common.js | レベルと条件《CCUSのよんれべるとじょうけん》 | CCUSのよんれべるとじょうけん |  |
| 1274 | cards-common.js | 建設業法の許可業種《けんせつぎょうほうのきょかぎょうしゅ》 | けんせつぎょうほうのきょかぎょうしゅ |  |
| 1275 | cards-common.js | ~~建設労働者雇用改善法の重点施策《けんせつろうどうしゃこようかいぜんほうじゅうてんしさく》~~ | ~~けんせつろうどうしゃこようかいぜんほうじゅうてんしさく~~ | fixed 2026-09-04 |
| 1281 | cards-common.js | 種類《とびしょくのろくしゅるい》 | とびしょくのろくしゅるい |  |
| 1282 | cards-common.js | 工法《てっこつこうぞうのさんしゅるいとにこうほう》 | てっこつこうぞうのさんしゅるいとにこうほう |  |
| 1283 | cards-common.js | ~~境界《しゃりょうけいけんせつきかいとさんトンきょうかい》~~ | ~~しゃりょうけいけんせつきかいとさんトンきょうかい~~ | fixed 2026-09-04 |
| 1284 | cards-common.js | 産業廃棄物の保管とマニフェスト義務《さんぱいほかんとまにふぇすとぎむ》 | さんぱいほかんとまにふぇすとぎむ |  |
| 1285 | cards-common.js | 対策《ねっちゅうしょうよぼうのさんたいさく》 | ねっちゅうしょうよぼうのさんたいさく |  |
| 1286 | cards-common.js | ~~航空障害灯とドローン規制の数値《こうくうしょうがいとうとどろーんすうち》~~ | ~~こうくうしょうがいとうとどろーんすうち~~ | fixed 2026-09-04 |
| 1294 | cards-common.js | 工《じょうぶこう》 | じょうぶこう |  |
| 1299 | cards-common.js | ~~杭工事《くいこうじばしょうちくいきせいくい》~~ | ~~くいこうじばしょうちくいきせいくい~~ | fixed 2026-09-04 |
| 1303 | cards-common.js | 種類《さくせいこうじしゅるい》 | さくせいこうじしゅるい |  |
| 1305 | cards-common.js | とび工事の種類《とびこうじのしゅるい》 | とびこうじのしゅるい |  |
| 1305 | cards-common.js | 梁《きょうりょう》 | きょうりょう |  |
| 1310 | cards-common.js | ~~上下水道工事《じょうげすいどうこうじじょうすいじょうげすいしょりじょう》~~ | ~~じょうげすいどうこうじじょうすいじょうげすいしょりじょう~~ | fixed 2026-09-04 |
| 1313 | cards-common.js | ~~層《ほうそうそうろしょうろばんきそうひょうそうあすふるといにっしゃあ》~~ | ~~ほうそうそうろしょうろばんきそうひょうそうあすふるといにっしゃあ~~ | fixed 2026-09-04 |
| 1314 | cards-common.js | ~~種《くいのざいりょうしゅるいきくいこうくいこんくりいとくい》~~ | ~~くいのざいりょうしゅるいきくいこうくいこんくりいとくい~~ | fixed 2026-09-04 |
| 1322 | cards-common.js | 場所打ちコン杭工法《ばしょううちこんくいこうほう》 | ばしょううちこんくいこうほう |  |
| 1329 | cards-common.js | 海洋土木工事の特徴と主要施設《かいよどぼくこうじのとくちょとしゅよしせつ》 | かいよどぼくこうじのとくちょとしゅよしせつ |  |
| 1330 | cards-common.js | 種類《どこうじのさぎょうろくしゅるい》 | どこうじのさぎょうろくしゅるい |  |
| 1331 | cards-common.js | ~~層構造《ほそうこうじのよんそうこうぞうきそうをわすれずに》~~ | ~~ほそうこうじのよんそうこうぞうきそうをわすれずに~~ | fixed 2026-09-04 |
| 1332 | cards-common.js | 種類《とびこうじのろくしゅるい》 | とびこうじのろくしゅるい |  |
| 1332 | cards-common.js | 梁《きょうりょう》 | きょうりょう |  |
| 1333 | cards-common.js | ~~工事《かいよどぼくのよんこうじしゅんせつうめたてがんぺきぼおはていけえそん》~~ | ~~かいよどぼくのよんこうじしゅんせつうめたてがんぺきぼおはていけえそん~~ | fixed 2026-09-04 |
| 1340 | cards-common.js | 梁《きょうりょう》 | きょうりょう |  |
| 1348 | cards-common.js | ~~鉄骨構造の種類《ぶれすらあめんとらす》~~ | ~~ぶれすらあめんとらす~~ | fixed 2026-09-04 |
| 1349 | cards-common.js | 水平積み上げ方式《すいへいつみあげほうしき》 | すいへいつみあげほうしき |  |
| 1349 | cards-common.js | と水平積み上げ方式《すいへいつみあげほうしき》 | すいへいつみあげほうしき |  |
| 1358 | cards-common.js | 種類《ぼうすいこうじしゅるい》 | ぼうすいこうじしゅるい |  |
| 1361 | cards-common.js | ~~方法《とそうこうじほうほうはけろおらあえあすぷれえ》~~ | ~~とそうこうじほうほうはけろおらあえあすぷれえ~~ | fixed 2026-09-04 |
| 1362 | cards-common.js | 種類《ぞおえんこうじしゅるい》 | ぞおえんこうじしゅるい |  |
| 1362 | cards-common.js | 緑化《おくじょうりょっか》 | おくじょうりょっか |  |
| 1365 | cards-common.js | ~~石工事《いしこうじだいりいしみかげいしぎいし》~~ | ~~いしこうじだいりいしみかげいしぎいし~~ | fixed 2026-09-04 |
| 1376 | cards-common.js | 造《あーるしーぞう》 | あーるしーぞう |  |
| 1376 | cards-common.js | 造《えすあーるしーぞう》 | えすあーるしーぞう |  |
| 1377 | cards-common.js | 墨出し線《すみだしせん》 | すみだしせん |  |
| 1379 | cards-common.js | 種類《けんちくぶつのこうぞうごしゅるい》 | けんちくぶつのこうぞうごしゅるい |  |
| 1382 | cards-common.js | 種類《てっきんひつぎてのよんしゅるい》 | てっきんひつぎてのよんしゅるい |  |
| 1386 | cards-common.js | 吹付けウレタン断熱工事《ふきつけうれたんだんねつこうじにせいぶん》 | ふきつけうれたんだんねつこうじにせいぶん |  |
| 1389 | cards-common.js | 建築大工工事の種類《けんちくだいくこうじのしゅるい》 | けんちくだいくこうじのしゅるい |  |
| 1398 | cards-common.js | 建込み後《たてこみご》 | たてこみご |  |
| 1399 | cards-common.js | 造《あーるしーぞう》 | あーるしーぞう |  |
| 1399 | cards-common.js | 造《えすあーるしーぞう》 | えすあーるしーぞう |  |
| 1399 | cards-common.js | 造《しいびいぞう》 | しいびいぞう |  |
| 73 | cards-lifeline.js | 硬質塩化ビニル管《こうしつえんかびにるかんう》 | こうしつえんかびにるかんう |  |
| 73 | cards-lifeline.js | 硬質塩化ビニル管《こうしつえんかびにるかん》 | こうしつえんかびにるかん |  |
| 74 | cards-lifeline.js | 耐衝撃性塩ビ管《たいしょうげっきせいえんびかん》 | たいしょうげっきせいえんびかん |  |
| 74 | cards-lifeline.js | 耐衝撃性塩ビ管《たいしょうげきせいえんびかん》 | たいしょうげきせいえんびかん |  |
| 80 | cards-lifeline.js | ねじ切り機《ねじきりき》 | ねじきりき |  |
| 85 | cards-lifeline.js | ~~ねじ接合《ねじせつごうあからあ》~~ | ~~ねじせつごうあからあ~~ | fixed 2026-09-04 |
| 89 | cards-lifeline.js | 発泡スチロール断熱材《はっぽうすちろるだんねつざい》 | はっぽうすちろるだんねつざい |  |
| 93 | cards-lifeline.js | けい酸カルシウム保温材《けいさんかるしうむほおんざい》 | けいさんかるしうむほおんざい |  |
| 95 | cards-lifeline.js | スプリンクラー設備《すぷりんくらあせつび》 | すぷりんくらあせつび |  |
| 174 | cards-lifeline.js | ~~冷凍空気調和機器工事の代表機器《れいとうくうきちょうわききこうじだいひょうきき》~~ | ~~れいとうくうきちょうわききこうじだいひょうきき~~ | fixed 2026-09-04 |
| 175 | cards-lifeline.js | 分類《しょうぼうせつびのさんぶんるい》 | しょうぼうせつびのさんぶんるい |  |
| 176 | cards-lifeline.js | 各種炉の種類《かくしゅろのしゅるい》 | かくしゅろのしゅるい |  |
| 179 | cards-lifeline.js | ~~種類《だくとしゅるいはいえんくうちょうはいき》~~ | ~~だくとしゅるいはいえんくうちょうはいき~~ | fixed 2026-09-04 |
| 257 | cards-lifeline.js | 管《しいぢいかん》 | しいぢいかん |  |
| 257 | cards-lifeline.js | 管《ぴいえふかん》 | ぴいえふかん |  |
| 280 | cards-lifeline.js | 耐熱性硬質塩化ビニル管《たいねつせいこうしつえんかびにるかん》 | たいねつせいこうしつえんかびにるかん |  |
| 281 | cards-lifeline.js | 水道用硬質塩化ビニルライニング鋼管《すいどうようこうしつえんかびにるらいにんぐこうかん》 | すいどうようこうしつえんかびにるらいにんぐこうかん |  |
| 330 | cards-lifeline.js | 光ファイバー融着接続《ひかりふぁいばあゆうちゃくせつぞく》 | ひかりふぁいばあゆうちゃくせつぞく |  |
| 331 | cards-lifeline.js | 光パルス試験機《ひかりぱるすしけんき（OTDR）》 | ひかりぱるすしけんき（OTDR） |  |
| 333 | cards-lifeline.js | ~~パイプねじ切機《ぱいぷまんりき / ぱいぷねじきりき》~~ | ~~ぱいぷまんりき / ぱいぷねじきりき~~ | fixed 2026-09-04 |
| 334 | cards-lifeline.js | 面取り器《めんとりき》 | めんとりき |  |
| 337 | cards-lifeline.js | 硬質ポリ塩化ビニル管《こうしつぽりえんかびにるかん》 | こうしつぽりえんかびにるかん |  |
| 339 | cards-lifeline.js | 石綿セメント管《せきめんせめんとかん》 | せきめんせめんとかん |  |
| 362 | cards-lifeline.js | さを仕上げ厚《しあげあつ》 | しあげあつ |  |
| 369 | cards-lifeline.js | アースボンド線《ああすぼんどせん》 | ああすぼんどせん |  |
| 371 | cards-lifeline.js | ケーブル繰り出し機《けえぷるくりだしき》 | けえぷるくりだしき |  |
| 387 | cards-lifeline.js | ~~けけ盤《かべかけばん》~~ | ~~かべかけばん~~ | fixed 2026-09-04 |
| 430 | cards-lifeline.js | シールテープの巻き方《しいるてえぷのまきかた》 | しいるてえぷのまきかた |  |
| 435 | cards-lifeline.js | 液状シール剤《えきじょうシールざい》 | えきじょうシールざい |  |
| 437 | cards-lifeline.js | 被覆アーク溶接《ひふくああくようせつ》 | ひふくああくようせつ |  |
| 449 | cards-lifeline.js | 最小曲げ半径《さいしょうまげはんけい》 | さいしょうまげはんけい |  |
| 453 | cards-lifeline.js | ~~保温材の形状《ほおんざいのけいじょういたじょうおびじょうつつじょう》~~ | ~~ほおんざいのけいじょういたじょうおびじょうつつじょう~~ | fixed 2026-09-04 |
| 456 | cards-lifeline.js | 形ダクタイル鋳鉄管《GXがただくたいるちゅうてつかん》 | GXがただくたいるちゅうてつかん |  |
| 468 | cards-lifeline.js | アングルフランジ工法《アングルフランジこうほう》 | アングルフランジこうほう |  |
| 469 | cards-lifeline.js | 共板フランジ工法《ともいたふらんじこうほう》 | ともいたふらんじこうほう |  |
| 482 | cards-lifeline.js | う令《ほうしこうれい》 | ほうしこうれい |  |
| 488 | cards-lifeline.js | 原則《れんがずみのろくげんそく》 | れんがずみのろくげんそく |  |
| 490 | cards-lifeline.js | 水温上昇防止用逃がし配管《すいおんじょうしょうぼうしようにがしはいかん》 | すいおんじょうしょうぼうしようにがしはいかん |  |
| 552 | cards-lifeline.js | 工法《とそうこうじのさんこうほう》 | とそうこうじのさんこうほう |  |
| 607 | cards-lifeline.js | 種類《がすようせつのさんしゅるい》 | がすようせつのさんしゅるい |  |
| 608 | cards-lifeline.js | 硬質塩化ビニル管《こうしつえんかびにるかん》 | こうしつえんかびにるかん |  |
| 609 | cards-lifeline.js | 硬質塩化ビニル管《こうしつえんかびにるかん》 | こうしつえんかびにるかん |  |
| 612 | cards-lifeline.js | インジケーター確認《いんじけえたあかくにん》 | いんじけえたあかくにん |  |
| 615 | cards-lifeline.js | ~~形ダクタイル鋳鉄管の曲げ配管《GXがただくたいるちゅうてつかんのまがりはいかん》~~ | ~~GXがただくたいるちゅうてつかんのまがりはいかん~~ | fixed 2026-09-04 |
| 618 | cards-lifeline.js | ~~電柱を建てる手順《でんちゅうをたてるてじゅんすてっぷ》~~ | ~~でんちゅうをたてるてじゅんすてっぷ~~ | fixed 2026-09-04 |
| 619 | cards-lifeline.js | ベンダー曲げ加工《べんだあまげかこう》 | べんだあまげかこう |  |
| 619 | cards-lifeline.js | 最小曲げ半径《さいしょうまげはんけい》 | さいしょうまげはんけい |  |
| 619 | cards-lifeline.js | チューブベンダーで最小曲げ半径《さいしょうまげはんけい》 | さいしょうまげはんけい |  |
| 620 | cards-lifeline.js | ろう付け後の確認《ろうづけごのかくにん》 | ろうづけごのかくにん |  |
| 875 | cards-lifeline.js | けて吹き出し口《ふきだしぐち》 | ふきだしぐち |  |
| 881 | cards-lifeline.js | 挿し口の挿入《さしくちのそうにゅう》 | さしくちのそうにゅう |  |
| 889 | cards-lifeline.js | 水道配水用ポリエチレン管《すいどうはいすいようぽりえちれんかん》 | すいどうはいすいようぽりえちれんかん |  |
| 912 | cards-lifeline.js | するときは最小曲げ半径《さいしょうまげはんけい》 | さいしょうまげはんけい |  |
| 920 | cards-lifeline.js | 個《さんろスイッチにこ》 | さんろスイッチにこ |  |
| 935 | cards-lifeline.js | ポリブテン管《ポリブテンかん》 | ポリブテンかん |  |
| 957 | cards-lifeline.js | 吊下げ式《つりさげしき》 | つりさげしき |  |
| 957 | cards-lifeline.js | 立てかけ式《たてかけしき》 | たてかけしき |  |
| 990 | cards-lifeline.js | 保温厚さ計算《ほおんあつさけいさん》 | ほおんあつさけいさん |  |
| 1015 | cards-lifeline.js | 接地工事の種類《せっちこうじのしゅるい》 | せっちこうじのしゅるい |  |
| 1030 | cards-lifeline.js | グルーブド接合《グルーブドせつごう》 | グルーブドせつごう |  |
| 1067 | cards-lifeline.js | 光ケーブルの曲げ半径《ひかりけーぶるのまげはんけい》 | ひかりけーぶるのまげはんけい |  |
| 1107 | cards-lifeline.js | システム天井《システムてんじょう》 | システムてんじょう |  |
| 1118 | cards-lifeline.js | ロックウール吸音板《ロックウールきゅうおんばん》 | ロックウールきゅうおんばん |  |
| 1254 | cards-lifeline.js | 区分《けんせつこうじのさんくぶん》 | けんせつこうじのさんくぶん |  |
| 1258 | cards-lifeline.js | 保温保冷工事の安全機能《ほおんほれいこうじのあんぜんきのう》 | ほおんほれいこうじのあんぜんきのう |  |
| 1260 | cards-lifeline.js | 推進管の種類《すいしんかんのしゅるい》 | すいしんかんのしゅるい |  |
| 1267 | cards-lifeline.js | さく井工事の種類《さくせいこうじのしゅるい》 | さくせいこうじのしゅるい |  |
| 1268 | cards-lifeline.js | 電気通信工事の通信土木《でんきつうしんこうじのつうしんどぼく》 | でんきつうしんこうじのつうしんどぼく |  |

