# 📚 CONTENT-BLUEPRINT — SSW Konstruksi Content Architecture

> **Author:** Crunchy (Opus 4.6) · 2026-05-02
> **Status:** PROPOSAL — awaiting Nugget approval
> **Repository:** `nuggetenak/Nugget-Nihongo-SSW-Konstruksi`
> **Companion to:** `MASTER-BLUEPRINT-v6.md` (code architecture)

---

## 0. The Problem (Why This Document Exists)

I audited every piece of content in the app. Here's the truth:

### What the user sees

```
Onboarding Track Picker:
  🏗️ Sipil (土木)     → 934 cards
  🏠 Bangunan (建築)   → 934 cards    ← SAME 934 cards!
  ⚡ Lifeline (設備)   → 953 cards
```

### What's actually in those 934 "sipil/bangunan" cards

```
jenis_kerja (320): ライフライン工事, 電気工事, ガス工事, 空調設備工事...
alat_umum (165):   パイプカッター, 電工ナイフ, ストリップゲージ...
keselamatan (172): genuinely common — safety is shared ✓
karier (146):      genuinely common — career/HR vocab ✓
hukum (91):        genuinely common — legal terms ✓
salam (40):        genuinely common — greetings ✓
```

**The problem: `jenis_kerja` and `alat_umum` are labeled as shared
sipil/bangunan categories, but the actual cards inside are lifeline
content (piping tools, electrical work, telecom).** A sipil (civil
engineering) worker studying 電工ナイフ (electrician's knife) is
wasting time on irrelevant material.

**Sipil and Bangunan tracks show identical card pools.** Zero
differentiation. A user who picks "Sipil" and a user who picks
"Bangunan" get the exact same flashcards.

**The 45 sipil + 45 bangunan quiz questions** (seed data from
Phase B) are the only track-specific content, but they were written
from general knowledge — not extracted from JAC official PDFs.

### Content inventory (honest audit)

| Content | Count | Source | Actually about |
|---------|-------|--------|---------------|
| Flashcards | 1438 | JAC textbook Ch.1–7 + vocab | ~80% lifeline/MEP |
| JAC Official quiz | ~95 | st_sample_l.pdf, tt_sample.pdf | Lifeline praktek + shared teori |
| Wayground quiz | 659 | Wayground/external | Mostly lifeline + general |
| CSV quiz | 300 | CSV batch | Mixed lifeline + general |
| Sipil quiz | 45 | Seed data (Crunchy) | Generic sipil (not from JAC PDF) |
| Bangunan quiz | 45 | Seed data (Crunchy) | Generic bangunan (not from JAC PDF) |

**Bottom line: this is a lifeline app pretending to have 3 tracks.**

---

## 1. What JAC Actually Offers

From `https://global.jac-skill.or.jp/indonesia/examination/documents.php`:

### Textbooks (free PDF download)

```
SHARED (学科 / Teori):
  text1.pdf      Ch.1 建設業の概要 (Overview konstruksi)
  text2.pdf      Ch.2 安全衛生管理 (K3 management)
  text3.pdf      Ch.3 関係法令 (Peraturan terkait)
  text4.pdf      Ch.4 施工管理 (Manajemen konstruksi)
  ↳ text1-4_id.pdf  Indonesian translations

SIPIL (土木 / Doboku):
  text5d.pdf     Ch.5 土木工事の内容 (Isi pekerjaan sipil)
  text6d.pdf     Ch.6 土木の材料・工具 (Material & alat sipil)
  text7d.pdf     Ch.7 土木の機械 (Mesin sipil)
  ctextd.pdf     Compressed version (ringkasan)
  ↳ ctextd_id.pdf   Indonesian translation

BANGUNAN (建築 / Kenchiku):
  text5k.pdf     Ch.5 建築工事の内容 (Isi pekerjaan bangunan)
  text6k.pdf     Ch.6 建築の材料・工具 (Material & alat bangunan)
  text7k.pdf     Ch.7 建築の機械 (Mesin bangunan)
  ctextk.pdf     Compressed version (ringkasan)
  ↳ ctextk_id.pdf   Indonesian translation

LIFELINE (設備 / Setsubi):
  text5l.pdf     Ch.5 設備工事の内容 (Isi pekerjaan lifeline)
  text6l.pdf     Ch.6 設備の材料・工具 (Material & alat lifeline)
  text7l.pdf     Ch.7 設備の機械 (Mesin lifeline)
  ctextl.pdf     Compressed version (ringkasan)
  ↳ ctextl_id.pdf   Indonesian translation
```

### Sample Exam Questions (free PDF)

```
SHARED:
  tt_sample.pdf      学科 sample 1
  tt_sample2.pdf     学科 sample 2

SIPIL:
  st_sample_d.pdf    実技 sample 1 (sipil)
  st_sample2_d.pdf   実技 sample 2 (sipil)

BANGUNAN:
  st_sample_k.pdf    実技 sample 1 (bangunan)
  st_sample2_k.pdf   実技 sample 2 (bangunan)

LIFELINE:
  st_sample_l.pdf    実技 sample 1 (lifeline) ← this is what we have now
  st_sample2_l.pdf   実技 sample 2 (lifeline)
```

**Key insight: JAC structures everything as shared Ch.1–4 + track-specific Ch.5–7.** Our app should mirror this.

---

## 2. Proposed Content Architecture

### 2.1 Three-Layer Model

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: 共通 KYŌTSŪ (Common)                      │
│  → Everyone studies this regardless of track         │
│  → Source: JAC Ch.1–4 + tt_sample                    │
│  → ~400–500 flashcards + ~100 quiz questions         │
│                                                      │
│  Modules:                                            │
│    K1: 建設業の概要 — Overview & Greetings            │
│    K2: 安全衛生     — Safety & K3                     │
│    K3: 法令         — Laws & Regulations              │
│    K4: 施工管理     — Construction Management         │
│    K5: キャリア     — Career, Employment, Life        │
└─────────────────────────────────────────────────────┘
         │
         ├── Layer 2A: 土木 DOBOKU (Sipil) ─── only if track=doboku
         │   → Source: JAC Ch.5d–7d + st_sample_d
         │   → ~300–400 flashcards + ~80 quiz questions
         │   Modules:
         │     D1: 土工事       — Earthwork
         │     D2: 舗装・道路    — Paving & Roads
         │     D3: 排水・基礎    — Drainage & Foundation
         │     D4: 土木機械     — Civil Machinery
         │     D5: 土木材料・工具 — Civil Materials & Tools
         │
         ├── Layer 2B: 建築 KENCHIKU (Bangunan) ─── only if track=kenchiku
         │   → Source: JAC Ch.5k–7k + st_sample_k
         │   → ~300–400 flashcards + ~80 quiz questions
         │   Modules:
         │     B1: 躯体工事     — Structural Work (formwork, rebar, concrete)
         │     B2: 仕上げ工事    — Finishing (plastering, tiling, painting)
         │     B3: 設備・内装    — MEP & Interior
         │     B4: 建築機械     — Building Machinery
         │     B5: 建築材料・工具 — Building Materials & Tools
         │
         └── Layer 2C: 設備 LIFELINE (Lifeline) ─── only if track=lifeline
             → Source: JAC Ch.5l–7l + st_sample_l ← ALREADY HAVE THIS
             → ~500 flashcards (existing) + ~150 quiz (existing)
             Modules:
               L1: 配管工事     — Piping
               L2: 電気工事     — Electrical
               L3: 通信工事     — Telecom
               L4: 消防設備     — Fire Protection
               L5: 保温保冷     — Insulation
               L6: 設備機械・工具 — Lifeline Machinery & Tools

┌─────────────────────────────────────────────────────┐
│  Layer 3: 練習 RENSHŪ (Practice)                     │
│  → Pulls from Layer 1 + user's Layer 2               │
│  → Modes: Quiz, Sprint, Simulasi, JAC, Focus         │
│  → Already exists in app                             │
└─────────────────────────────────────────────────────┘
```

### 2.2 What Changes in the App

#### Categories overhaul

Current categories → new categories:

```
KEEP AS-IS (truly common):
  keselamatan → K2 安全衛生          tracks: [all]
  hukum       → K3 法令             tracks: [all]
  karier      → K5 キャリア          tracks: [all]
  salam       → K1 建設業の概要      tracks: [all]

RE-TAG (currently mislabeled):
  jenis_kerja → SPLIT:
    Cards about lifeline work types → L1–L5 (lifeline only)
    Cards about general construction → K4 施工管理 (common)
    Cards about sipil/bangunan work → new D1–D5 / B1–B5

  alat_umum → SPLIT:
    Cards about lifeline tools → L6 (lifeline only)
    Cards about genuinely common tools → K4 (common)
    Cards about sipil tools → D5 (sipil only)
    Cards about bangunan tools → B5 (bangunan only)

KEEP (lifeline-specific, already correct):
  pipa           → L1 配管
  listrik        → L2 電気
  telekomunikasi → L3 通信
  pemadam        → L4 消防
  isolasi        → L5 保温保冷

ADD NEW:
  doboku_jikkou  → D1–D3 (sipil work types)
  doboku_kikai   → D4 (sipil machinery)
  doboku_zairyo  → D5 (sipil materials/tools)
  kenchiku_kutai → B1 (structural)
  kenchiku_shiage→ B2 (finishing)
  kenchiku_setsubi→ B3 (building MEP/interior)
  kenchiku_kikai → B4 (building machinery)
  kenchiku_zairyo→ B5 (building materials/tools)
  sekou_kanri    → K4 (construction management — common)
```

#### BelajarTab restructure

```
BelajarTab (after content overhaul)
│
├── 📖 Materi Umum (共通)
│   ├── Flashcard: K1–K5 cards (filtered from common pool)
│   ├── Quiz: Teori sets (tt_sample questions)
│   └── Vocab: Common construction vocabulary
│
├── 🔧 Sipil (土木)                    ← only visible if track=doboku
│   ├── Flashcard: D1–D5 cards
│   ├── Quiz: Sipil sets (from st_sample_d)
│   └── Vocab: Sipil-specific vocabulary
│
├── 🏠 Bangunan (建築)                 ← only visible if track=kenchiku
│   ├── Flashcard: B1–B5 cards
│   ├── Quiz: Bangunan sets (from st_sample_k)
│   └── Vocab: Bangunan-specific vocabulary
│
├── ⚡ Lifeline (設備)                  ← only visible if track=lifeline
│   ├── Flashcard: L1–L6 cards (EXISTING — already here)
│   ├── Quiz: Lifeline sets (from st_sample_l — EXISTING)
│   └── Vocab: Lifeline vocabulary (EXISTING)
│
└── 📝 Latihan & Ujian
    ├── Sprint 60 Detik
    ├── Simulasi JAC
    ├── Fokus Kelemahan
    └── Ulasan SRS
```

---

## 3. Content Migration Plan

### Phase C-1: Re-tag Existing Cards (~2 hours agent work)

The 1438 existing cards need honest re-categorization.

**Method:** Script-assisted audit. For each card, check:
1. Is this term used ONLY in lifeline/MEP? → tag lifeline-only
2. Is this term used across ALL construction? → tag common
3. Is this term sipil-specific? → tag sipil (rare in current data)
4. Is this term bangunan-specific? → tag bangunan (rare in current data)

**Expected outcome after re-tag:**

| New category | Estimated cards | Source |
|-------------|----------------|--------|
| K1 概要・挨拶 | ~40 | existing salam |
| K2 安全衛生 | ~172 | existing keselamatan |
| K3 法令 | ~91 | existing hukum |
| K4 施工管理 | ~80 | split from jenis_kerja + alat_umum |
| K5 キャリア | ~146 | existing karier |
| L1 配管 | ~200 | existing pipa |
| L2 電気 | ~154 | existing listrik |
| L3 通信 | ~65 | existing telekomunikasi |
| L4 消防 | ~40 | existing pemadam |
| L5 保温保冷 | ~45 | existing isolasi |
| L6 設備工具 | ~165 | split from alat_umum + jenis_kerja |
| **Common** | **~529** | |
| **Lifeline** | **~669** | |
| **Sipil** | **~0** | ← THE GAP |
| **Bangunan** | **~0** | ← THE GAP |

This re-tag is ZERO new content. Just honest labels on existing data.

### Phase C-2: Extract Sipil Content from JAC PDFs

**Input PDFs needed (upload from JAC site):**
1. `ctextd_id.pdf` — Compressed sipil textbook (Indonesian) ★★★
2. `ctextd.pdf` — Compressed sipil textbook (Japanese) ★★★
3. `st_sample_d.pdf` — Sipil praktek sample 1 ★★★
4. `st_sample2_d.pdf` — Sipil praktek sample 2 ★★★
5. `text5d.pdf`–`text7d.pdf` — Full chapters (for images) ★★

**Output:**
- `src/data/cards-sipil.js` — ~300 new flashcards (D1–D5)
- `src/data/sipil-sets.js` — REWRITE with JAC-sourced questions
- `public/images/sipil/` — tool/machine photos extracted from PDFs

**Per-concept workflow:**

```
JAC PDF concept: 掘削（くっさく）

→ Flashcard:
  {
    id: 2001,
    category: 'doboku_jikkou',
    source: 'jac-ch5d',
    jp: '掘削',
    furi: 'くっさく',
    romaji: 'kussaku',
    id_text: 'Penggalian',
    desc: 'Pekerjaan menggali tanah. Di proyek sipil: kamu akan
           lihat backhoe/excavator gali fondasi, parit, saluran.
           Kalau atasan bilang「掘削を始めてください」artinya
           mulai gali sesuai gambar kerja.'
  }

→ Quiz question (in sipil-sets.js):
  {
    q: '掘削（くっさく）作業（さぎょう）を行（おこな）う前（まえ）に
        必（かなら）ず確認（かくにん）することは？',
    img: 'sipil/excavation-site.webp',
    opts: ['地下埋設物の有無', '天気予報', '作業員の年齢', '昼食のメニュー'],
    opts_id: ['Ada/tidak utilitas bawah tanah', 'Prakiraan cuaca',
              'Usia pekerja', 'Menu makan siang'],
    ans: 0,
    exp: 'WAJIB cek utilitas bawah tanah sebelum gali — pipa gas,
         kabel listrik. Kesalahan umum orang Indonesia: pilih
         "prakiraan cuaca" — penting tapi bukan prioritas K3.',
    cat: 'doboku_jikkou'
  }

→ Image: extract excavation photo from text5d.pdf
```

### Phase C-3: Extract Bangunan Content from JAC PDFs

Same workflow as C-2 but with:
- `ctextk_id.pdf`, `ctextk.pdf`, `st_sample_k.pdf`, `st_sample2_k.pdf`
- Output: `cards-bangunan.js` (~300 cards), rewritten `bangunan-sets.js`

### Phase C-4: Curate — The Pedagogical Layer

This is where "curate" happens. Raw JAC extraction gives you
textbook-accurate terms. Curation adds:

#### 4a. Workplace Context in Every `desc` Field

JAC textbook says: `掘削 — 土を掘ること`
App curated version: `掘削 — Penggalian tanah. Di proyek sipil: kamu
akan sering dengar ini saat mandor briefing pagi. Kalau atasan bilang
「掘削を始めてください」artinya mulai gali sesuai gambar kerja.
Salah lokasi gali = pipa gas pecah.`

**Rule: every desc answers "as a new SSW worker, when will I
encounter this and what happens if I get it wrong?"**

#### 4b. Indonesian Speaker Error Prediction

For every quiz question's `exp` field, include:
- WHY the correct answer is correct
- The most common wrong answer for Indonesians specifically, and WHY

Example patterns:
- 養生 → Indonesian speakers think "rest/recovery" (medical meaning).
  In construction = curing/protection.
- 手元 → think "in hand" literally. In construction = helper worker.
- 2メートル → Indonesian standard is 5m for height work. Japan = 2m.

#### 4c. Furigana in Questions

JAC exam format puts furigana on everything. Our questions must too:

```
Bad:  q: '掘削作業を行う前に確認することは？'
Good: q: '掘削（くっさく）作業（さぎょう）を行（おこな）う前（まえ）に確認（かくにん）することは？'
```

This serves double duty: exam format familiarity + reading practice.

#### 4d. Photo-Based Questions

JAC exam is ~40% photo-based: "写真の工具は何か" (what tool is this?).

For every tool/machine concept:
1. Extract or source a clear photo
2. Create a 写真-type question with `img` field
3. Create a companion text-based question for the same concept

This means each tool concept has 2 questions: visual recognition + text knowledge.

#### 4e. Difficulty Sequencing Within Modules

Each module (D1, D2, etc.) orders questions by:
1. **Recognition** — "Xとは何か" (what is X?)
2. **Function** — "Xの目的は？" (purpose of X?)
3. **Procedure** — "Xの前に確認することは？" (what to check before X?)
4. **Judgment** — "Xが失敗したらどうなる？" (what happens if X fails?)

SRS handles spaced repetition. Module ordering handles initial
exposure scaffolding.

---

## 4. Data Architecture Changes

### 4.1 New Card File Structure

```
src/data/
  cards.js            → RENAME to cards-common.js (re-tagged K1–K5)
  cards-lifeline.js   → NEW (split from old cards.js, re-tagged L1–L6)
  cards-sipil.js      → NEW (from JAC sipil PDFs, D1–D5)
  cards-bangunan.js   → NEW (from JAC bangunan PDFs, B1–B5)
  index.js            → updated barrel export combining all card files
```

Or simpler — keep one `cards.js` but fix category tags. Either way works.

**Recommended: keep single `cards.js`** but with correct categories.
Add new cards by appending to the array. Benefit: no import changes
needed anywhere.

### 4.2 New Category Schema

```js
// categories.js — v2

export const CATEGORIES = [
  // ── Common (everyone) ──
  { key: 'gaiyou',       label: '建設概要',    emoji: '🏛️',  tracks: ['doboku','kenchiku','lifeline'], module: 'K1' },
  { key: 'anzen',        label: '安全衛生',    emoji: '🦺',  tracks: ['doboku','kenchiku','lifeline'], module: 'K2' },
  { key: 'hourei',       label: '法令',       emoji: '⚖️',  tracks: ['doboku','kenchiku','lifeline'], module: 'K3' },
  { key: 'sekou',        label: '施工管理',    emoji: '📋',  tracks: ['doboku','kenchiku','lifeline'], module: 'K4' },
  { key: 'career',       label: 'キャリア',    emoji: '👷',  tracks: ['doboku','kenchiku','lifeline'], module: 'K5' },

  // ── Sipil only ──
  { key: 'doboku_doko',  label: '土工事',     emoji: '⛏️',  tracks: ['doboku'], module: 'D1' },
  { key: 'doboku_hoso',  label: '舗装・道路',  emoji: '🛣️',  tracks: ['doboku'], module: 'D2' },
  { key: 'doboku_haisui',label: '排水・基礎',  emoji: '🌊',  tracks: ['doboku'], module: 'D3' },
  { key: 'doboku_kikai', label: '土木機械',    emoji: '🚜',  tracks: ['doboku'], module: 'D4' },
  { key: 'doboku_zairyo',label: '土木材料・工具',emoji: '🔩', tracks: ['doboku'], module: 'D5' },

  // ── Bangunan only ──
  { key: 'kenchiku_kutai',  label: '躯体工事',     emoji: '🏗️',  tracks: ['kenchiku'], module: 'B1' },
  { key: 'kenchiku_shiage', label: '仕上げ工事',    emoji: '🎨',  tracks: ['kenchiku'], module: 'B2' },
  { key: 'kenchiku_setsubi',label: '設備・内装',    emoji: '🚿',  tracks: ['kenchiku'], module: 'B3' },
  { key: 'kenchiku_kikai',  label: '建築機械',     emoji: '🏗️',  tracks: ['kenchiku'], module: 'B4' },
  { key: 'kenchiku_zairyo', label: '建築材料・工具', emoji: '🪚', tracks: ['kenchiku'], module: 'B5' },

  // ── Lifeline only (EXISTING content, rename categories) ──
  { key: 'haikan',    label: '配管工事',    emoji: '🔧',  tracks: ['lifeline'], module: 'L1' },
  { key: 'denki',     label: '電気工事',    emoji: '⚡',  tracks: ['lifeline'], module: 'L2' },
  { key: 'tsushin',   label: '通信工事',    emoji: '📡',  tracks: ['lifeline'], module: 'L3' },
  { key: 'shoubou',   label: '消防設備',    emoji: '🔥',  tracks: ['lifeline'], module: 'L4' },
  { key: 'hoon',      label: '保温保冷',    emoji: '🌡️',  tracks: ['lifeline'], module: 'L5' },
  { key: 'setsubi_kougu', label: '設備工具', emoji: '🔨', tracks: ['lifeline'], module: 'L6' },
];
```

### 4.3 Quiz Set File Structure

```
src/data/
  jac-official.js      → RENAME to jac-lifeline.js (honest label)
  jac-sipil.js         → NEW (from st_sample_d + curated)
  jac-bangunan.js      → NEW (from st_sample_k + curated)
  jac-teori.js         → NEW (from tt_sample — shared)
  wayground-sets.js    → KEEP (tag as lifeline-oriented)
  csv-sets.js          → KEEP (tag as lifeline-oriented)
  sipil-sets.js        → REWRITE from JAC PDFs (replace seed data)
  bangunan-sets.js     → REWRITE from JAC PDFs (replace seed data)
```

---

## 5. Migration Execution Order

This is designed so the app NEVER breaks. Each step ships independently.

### Step 1: Category rename migration (code only, no new content)

```
Old key       → New key         (in cards.js, every card)
─────────────────────────────────────────────────
salam         → gaiyou
keselamatan   → anzen
hukum         → hourei
karier        → career
pipa          → haikan
listrik       → denki
telekomunikasi→ tsushin
pemadam       → shoubou
isolasi       → hoon
```

For `jenis_kerja` and `alat_umum`: needs per-card audit.

Write a migration script: `scripts/migrate-categories.js`
- Read cards.js
- For simple renames (salam→gaiyou etc.), bulk replace
- For jenis_kerja/alat_umum, use a lookup table mapping card IDs to new categories
- Write updated cards.js
- Update categories.js to new schema
- Update all tests

**This step's deliverable:** same 1438 cards, honest category labels.
Sipil/bangunan tracks will be "empty" (0 track-specific cards) — that's
honest. Common layer (K1–K5, ~529 cards) shows for everyone.
Lifeline layer (L1–L6, ~669 cards) shows only for lifeline track.

### Step 2: Upload JAC sipil PDFs → extract sipil content

Need from user:
- `ctextd_id.pdf` + `ctextd.pdf` + `st_sample_d.pdf` + `st_sample2_d.pdf`

Agent produces:
- ~300 new flashcards appended to cards.js with D1–D5 categories
- Rewritten sipil-sets.js with JAC-sourced quiz questions
- Extracted images in public/images/sipil/

### Step 3: Upload JAC bangunan PDFs → extract bangunan content

Same as Step 2 but for bangunan.

### Step 4: Upload JAC teori PDFs → extract shared teori quiz

Need: `tt_sample.pdf` + `tt_sample2.pdf`

Agent produces:
- `jac-teori.js` — shared theory quiz questions for all tracks

### Step 5: Curate pass

Run every card and question through the Content Authoring Standard
(already in MASTER-BLUEPRINT-v6.md Appendix):
- F0: JAC source traceability
- F1: TSA justification
- F2: Objective needs check
- F3: Metalinguistic exp
- F4: Andragogical desc
- F5: Semantic interleave
- F6: Answer index check
- F7: Worker register

---

## 6. Target Content Inventory (After All Steps)

| Layer | Flashcards | Quiz Questions | Total |
|-------|-----------|---------------|-------|
| K Common | ~530 | ~100 (teori) | ~630 |
| D Sipil | ~300 | ~80 | ~380 |
| B Bangunan | ~300 | ~80 | ~380 |
| L Lifeline | ~670 | ~500 (existing) | ~1170 |
| **Grand total** | **~1800** | **~760** | **~2560** |

**Per track experience:**

| Track | Flashcards available | Quiz questions |
|-------|---------------------|---------------|
| Sipil user | 530 (K) + 300 (D) = **830** | 100 + 80 = **180** |
| Bangunan user | 530 (K) + 300 (B) = **830** | 100 + 80 = **180** |
| Lifeline user | 530 (K) + 670 (L) = **1200** | 100 + 500 = **600** |

Lifeline users get the richest experience (because content already
exists). Sipil/bangunan will catch up after Steps 2–3.

---

## 7. UX Changes Summary

### Track Picker (Onboarding)

Keep 3 tracks. Add card count per track so user knows what they're getting:

```
🔧 Sipil (土木)      830 kartu
🏠 Bangunan (建築)    830 kartu
⚡ Lifeline (設備)   1200 kartu
```

### BelajarTab

Add module-based navigation. Instead of flat mode list, group by:

```
📖 Materi Umum (5 modul)      ← always visible
🔧 Materi Sipil (5 modul)     ← if track=doboku
📝 Latihan Ujian               ← always visible
```

Each module card shows: title, progress bar (cards known / total in module),
last studied date.

### Dashboard

Daily Mission engine already knows about modules. Can say:
"Misi: Pelajari 10 kartu dari modul D2 舗装・道路"
instead of generic "Pelajari Kartu".

### StatsMode

Show per-module completion ring charts. User sees which modules
they're weak on.

---

## 8. What I Need From You (Nugget)

1. **Approval** of this architecture (or adjustments)
2. **Download & upload** these JAC PDFs to a new chat session:
   - Priority 1: `ctextd_id.pdf` + `ctextk_id.pdf` (Indonesian ringkasan)
   - Priority 2: `st_sample_d.pdf` + `st_sample_k.pdf` (sample ujian)
   - Priority 3: `tt_sample.pdf` + `tt_sample2.pdf` (teori shared)
   - Priority 4: `ctextd.pdf` + `ctextk.pdf` (Japanese ringkasan)
3. **Decision:** Do Step 1 (re-tag) first, or wait until PDFs are ready and do everything at once?

My recommendation: **Do Step 1 first.** It's code-only, no new content,
and immediately fixes the lie of sipil=bangunan=identical. After that,
each PDF upload session produces one Step's worth of content.

---

*Content Blueprint — Crunchy (Opus 4.6) · 2026-05-02*
*Audit basis: 1438 cards, 95 JAC questions, 659 Wayground questions, 300 CSV questions*
