# 🗺️ _MAP.md — SSW Flashcard App · Agent Orientation

> **Last updated:** 2026-04-27 by Crispy (Phase 1 Foundation complete)
> **Status:** Phase 1 DONE — data normalized, IDs sequential, furi 100%, answer indexing unified
> **Original:** `legacy/ssw_flashcards_v87.jsx` (7,390 lines, 1.34 MB, WORKING)

---

## 1. What This App Is

A React-based study tool for the **JAC SSW (Specified Skilled Worker) Construction exam** in Japan. Interface is in **Indonesian** (Bahasa Indonesia), content is **Japanese↔Indonesian bilingual**. It helps Indonesian construction workers study for the SSW visa exam covering safety, law, construction techniques, tools, and vocabulary.

The app runs as a **Claude.ai artifact** (single JSX file rendered in-browser) and also as a **static GitHub Pages site** (HTML wrapper around the same JSX).

**Live v87:** https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi-v87/

---

## 2. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                    ← YOU ARE HERE (read this first!)
├── README.md                  ← Public-facing readme
├── docs/
│   └── PROPOSAL.md            ← Full refactor proposal (7 pillars, roadmap)
├── legacy/
│   └── ssw_flashcards_v87.jsx ← Original working monolith (7,390 lines)
│
├── src/
│   ├── App.jsx                ← Root component (nav, routing, category filter)
│   │
│   ├── data/                  ← ALL content data (cards, questions, metadata)
│   │   ├── index.js           ← Barrel export + derived constants
│   │   ├── cards.js           ← CARDS array (1,438 flashcards, 1,601 lines)
│   │   ├── jac-official.js    ← JAC_OFFICIAL array (~95 exam questions)
│   │   ├── wayground-sets.js  ← WAYGROUND_SETS (~598 quiz questions in 12 sets)
│   │   ├── angka-kunci.js     ← ANGKA_KUNCI (~45 key numbers)
│   │   ├── danger-pairs.js    ← DANGER_PAIRS (~40 confusing term pairs)
│   │   └── categories.js      ← CATEGORIES, SOURCE_META, getCatInfo, etc.
│   │
│   ├── modes/                 ← One file per app mode/screen
│   │   ├── FlashcardMode.jsx  ← Swipeable flashcards + known/unknown marking
│   │   ├── QuizMode.jsx       ← Auto-generated quiz from cards
│   │   ├── JACMode.jsx        ← Official JAC exam questions
│   │   ├── AngkaMode.jsx      ← Key numbers reference + quiz
│   │   ├── DangerMode.jsx     ← Confusing term pairs drill
│   │   ├── SimulasiMode.jsx   ← Full exam simulation with timer
│   │   ├── StatsMode.jsx      ← Progress statistics
│   │   ├── SearchMode.jsx     ← Full-text card search
│   │   ├── SprintMode.jsx     ← Speed-round drill
│   │   ├── FocusMode.jsx      ← Weakness-focused study
│   │   ├── GlossaryMode.jsx   ← Sorted glossary of all terms
│   │   ├── SumberMode.jsx     ← Browse cards by PDF source
│   │   └── WaygroundMode.jsx  ← Wayground technical quiz sets
│   │
│   ├── components/            ← Shared display components
│   │   └── JpDisplay.jsx      ← JpFront + DescBlock (Japanese text renderers)
│   │
│   ├── hooks/                 ← Custom React hooks
│   │   ├── index.js           ← Barrel export
│   │   ├── usePersistedState.js  ← window.storage persistence
│   │   ├── useQuizKeyboard.js    ← Keyboard shortcuts for quiz modes
│   │   └── useStreak.js          ← Answer streak tracking
│   │
│   ├── utils/                 ← Pure utility functions
│   │   ├── index.js           ← Barrel export
│   │   ├── shuffle.js         ← Fisher-Yates shuffle
│   │   ├── jp-helpers.js      ← stripFuri, extractReadings, jpFontSize, hasJapanese
│   │   ├── wrong-tracker.js   ← getWrongCount, makeWrongEntry, storage helpers
│   │   └── quiz-generator.js  ← generateQuiz (distractor selection by difficulty)
│   │
│   └── styles/
│       └── theme.js           ← Design tokens (T), shared style presets (S), getGrade()
```

---

## 3. Data Schemas

### 3.1 CARDS (flashcards)

```js
{
  id: 42,                        // Unique numeric ID — SEQUENTIAL 1-1438, no gaps
  category: "listrik",           // Category key (see CATEGORIES)
  source: "jac-ch5",             // Canonical source key (see list below)
  furi: "せっちぼう",              // Hiragana reading — ALL 1438 cards have this field
  jp: "接地棒",                   // Japanese text (kanji, may contain inline furigana)
  romaji: "secchibou",           // Romanization
  id_text: "Batang pentanahan",  // Indonesian translation (short)
  desc: "Batang yang didorong..."// Indonesian explanation (long)
}
```

**12 categories:** salam, hukum, jenis_kerja, listrik, telekomunikasi, pipa, isolasi, pemadam, keselamatan, karier, alat_umum, (+ virtual: bintang)

**16 canonical sources:** jac-ch1, jac-ch2, jac-ch3, jac-ch4, jac-ch5, jac-ch6, jac-ch7, jac-gakka1, jac-gakka2, jac-jitsugi1, jac-jitsugi2, vocab-lifeline, vocab-jac, vocab-core, vocab-exam, vocab-teori

### 3.2 JAC_OFFICIAL (exam questions)

```js
{
  id: "tt1_q01",                 // String ID: {set}_{question}
  set: "tt1",                    // Set key: tt1, tt2, st1, st2
  setLabel: "学科 Set 1",        // Human-readable set name
  jp: "作業開始前に...",           // Question in Japanese
  hiragana: "さぎょう...",        // Full hiragana reading (separate field!)
  id_text: "Pertemuan harian...", // Question in Indonesian
  options: ["朝礼（...）", ...],  // Array of option strings (mixed JP+ID)
  answer: 0,                     // 0-BASED INDEX — UNIFIED with Wayground (Phase 1)
  hasPhoto: false,               // Whether original has a photo
  photoDesc: null,               // Text description of photo if hasPhoto
  explanation: "朝礼 = ...",     // Indonesian explanation
  related_card_id: 1             // Links to CARDS[].id (renumbered in Phase 1)
}
```

### 3.3 WAYGROUND_SETS (quiz sets)

```js
{
  id: "wt1",                     // Set ID
  title: "Teori Set 1 · 20qs",  // Display title
  subtitle: "安全管理...",        // Subtitle
  emoji: "🎯",                   // Icon
  color: "#f97316",              // Theme color
  grad: "linear-gradient(...)",  // Gradient CSS
  source: "CSV Teori v2 / JAC Official",
  questions: [{
    id: 1,                       // Numeric, per-set (not globally unique)
    q: "KY活動《かつどう》...",   // Question (furigana uses 《》 format)
    hint: "Langkah pertama...",  // Indonesian hint
    opts: ["対策を決める", ...],   // Japanese options
    opts_id: ["Menentukan...", ...], // Indonesian options (parallel array)
    ans: 1,                      // ⚠ 0-BASED INDEX (0 = first option)
    exp: "4 langkah KY: ...",    // Indonesian explanation
  }]
}
```

### ✅ Answer Indexing — UNIFIED (Phase 1)

| Data Source    | Index Base | `answer: 0` means |
|----------------|-----------|-------------------|
| JAC_OFFICIAL   | 0-based   | First option      |
| WAYGROUND_SETS | 0-based   | First option      |

Both sources now use **0-based indexing**. This was unified in Phase 1 (JAC was previously 1-based).

---

## 4. Mode Components Reference

| Mode | File | Purpose | Has Storage | Has Keyboard |
|------|------|---------|-------------|-------------|
| FlashcardMode | FlashcardMode.jsx | Swipeable card viewer | known/unknown (App-level) | ← → Space |
| QuizMode | QuizMode.jsx | Auto-generated quiz | ssw-quiz-wrong | 1/2/3 Enter |
| JACMode | JACMode.jsx | Official JAC questions | ssw-wrong-counts | Enter/Space |
| AngkaMode | AngkaMode.jsx | Key numbers | — | 1/2/3/4 Enter |
| DangerMode | DangerMode.jsx | Confusing pairs drill | — | 1/2/3 Enter |
| SimulasiMode | SimulasiMode.jsx | Exam simulation | — | Enter |
| StatsMode | StatsMode.jsx | Progress stats | reads all keys | — |
| SearchMode | SearchMode.jsx | Full-text search | — | — |
| SprintMode | SprintMode.jsx | Speed drill | — | — |
| FocusMode | FocusMode.jsx | Weakness drill | reads all keys | — |
| GlossaryMode | GlossaryMode.jsx | Sorted glossary | — | — |
| SumberMode | SumberMode.jsx | Browse by source | — | — |
| WaygroundMode | WaygroundMode.jsx | Technical quiz sets | ssw-wg-wrong-{id} | Enter/Space |

---

## 5. Persistent Storage Keys

| Key | Owner | Format | Content |
|-----|-------|--------|---------|
| `ssw-quiz-wrong` | QuizMode | `{cardId: {count, lastWrong}}` | Wrong counts from auto-generated quizzes |
| `ssw-wrong-counts` | JACMode | `{qId: {count, lastWrong}}` | Wrong counts from JAC official questions |
| `ssw-wg-wrong-{setId}` | WaygroundMode | `{qIdx: {count, lastWrong}}` | Wrong counts per Wayground set |
| `ssw-known` | App (via FlashcardMode) | `[cardId, ...]` | Cards marked "known" |
| `ssw-unknown` | App (via FlashcardMode) | `[cardId, ...]` | Cards marked "unknown" |
| `ssw-starred` | App | `[cardId, ...]` | Starred/bookmarked cards |

---

## 6. Architecture Decisions & Trade-offs

### Current State (post-refactor)
- **Files extracted but NOT yet wired:** The mode files still reference functions/constants from the monolith via `import`. They are syntactically extracted but not yet tested as a working multi-file app.
- **The legacy monolith (`legacy/ssw_flashcards_v87.jsx`) is the last-known-working version.** Do NOT delete it until the refactored version is fully working.
- **Shared hooks (`usePersistedState`, `useQuizKeyboard`, `useStreak`) are created but NOT yet integrated into mode components.** Mode components still use inline implementations of the same patterns. Integration should happen mode-by-mode.
- **Theme tokens (`T`, `S`) are defined but NOT yet applied.** All 767 inline styles still exist in mode files. Migration should be gradual.

### Deployment Strategy
The app can be deployed as:
1. **Claude.ai artifact:** Concatenate all files back into single JSX → render in Claude chat
2. **GitHub Pages static site:** Bundle with esbuild/vite → single HTML with inline JS
3. **Cloudflare Pages:** Auto-deploy from GitHub push (Nugget has CF connected)

Currently there is NO bundler configured. The monolith in `legacy/` works as-is.

---

## 7. Known Issues & TODO

### 🔴 HIGH Priority
- [ ] **Wire up multi-file imports** — files are extracted but not bundled/tested together
- [x] ~~**Unify answer indexing** — JAC (1-based) → all 0-based~~ ✅ Phase 1
- [x] ~~**Add furi field to all 730 cards** missing it~~ ✅ Phase 1 (romaji→hiragana auto-converted)
- [ ] **Add bundler** (esbuild or vite) to produce deployable output

### 🟡 MEDIUM Priority
- [ ] **Replace inline styles** with theme tokens (T/S from theme.js) — 767 instances
- [ ] **Integrate shared hooks** into mode components (replace duplicated patterns)
- [ ] **Build `<QuizShell>` wrapper** — unify quiz UX across all modes
- [ ] **Build `<ResultScreen>` component** — unify result screens
- [x] ~~**Fix romaji typo** in card id:1202 (`supeeसाaa` → `supeesaa`)~~ ✅ Phase 1
- [x] ~~**Remove duplicate Wayground questions** (wt1 Q4 ≈ Q5)~~ ✅ Phase 1 (Q5 removed, Q4 kept with merged explanation)
- [x] ~~**Normalize source names** to canonical format~~ ✅ Phase 1 (16 canonical names)

### 🟢 LOW Priority
- [ ] Add onboarding flow for new users
- [ ] Add breadcrumb navigation
- [ ] Implement spaced repetition (SM-2 or Leitner)
- [ ] Add study plan mode (4-week guided plan)
- [ ] PWA manifest + service worker
- [ ] Export/import progress JSON
- [ ] Add card images for tool recognition questions

---

## 8. Agent Instructions

### When Starting a New Session
1. Read this `_MAP.md` first
2. Check `docs/PROPOSAL.md` for the full refactor plan
3. Ask Nugget which phase/task to work on
4. Test changes against `legacy/ssw_flashcards_v87.jsx` to ensure no regressions

### Code Conventions
- **Language:** Indonesian for UI text and user-facing strings
- **Comments:** English for code comments
- **Git identity:** `Crispy <crispy@nugget.local>`
- **Commit style:** Descriptive, prefixed (e.g., `refactor: extract QuizMode to separate file`)
- **Data edits:** Always note the source (PDF page, CSV row, agent-generated)

### Working with Data Files
- `src/data/cards.js` is 1,601 lines — don't re-read the whole thing unless needed
- When adding cards, use the next available ID after the current max
- When adding questions, check the answer index convention for that data file
- Cross-reference `related_card_id` when adding JAC questions

### Nugget's Workflow
- Uploads ZIP → states task → receives new ZIP → deploys via GitHub drag-and-drop
- Communicates casually in Indonesian with English/Japanese code-switching
- Uses expressions like "GAS," "BOOM," "MANTAB" to signal enthusiasm
- Target: make this tool usable by junior SSW candidates

---

## 9. Content Sources Traceability

| Source Key | Old Key | Origin | Notes |
|-----------|---------|--------|-------|
| jac-ch1 | text1l | JAC PDF Ch.1 — 挨拶・安全管理 | Greetings, morning assembly, KY, 5S |
| jac-ch2 | text2 | JAC PDF Ch.2 — 法規 | Laws: labor, safety, construction, recycling |
| jac-ch3 | text3 | JAC PDF Ch.3 — 工事の種類 | Work types: lifeline, equipment, building |
| jac-ch4 | text4 | JAC PDF Ch.4 — 施工管理 | Construction management, surveying, formwork |
| jac-ch5 | text5l | JAC PDF Ch.5 — 工具・機械 | Tools, equipment, measuring instruments |
| jac-ch6 | text6l | JAC PDF Ch.6 — 配管・保温保冷 | Piping, insulation, HVAC |
| jac-ch7 | text7l | JAC PDF Ch.7 — キャリア | Career, qualifications, CCUS |
| jac-gakka1 | tt_sample | JAC sample exam — 学科 Set 1 | 25 theory questions with photos |
| jac-gakka2 | tt_sample2 | JAC sample exam — 学科 Set 2 | 36 theory questions |
| jac-jitsugi1 | st_sample_l | JAC sample exam — 実技 Set 1 | 22 practical questions |
| jac-jitsugi2 | st_sample2_l | JAC sample exam — 実技 Set 2 | 12 practical questions |
| vocab-lifeline | lifeline4 | Wayground CSV — vocab from sensei | 260 lifeline/equipment vocab cards |
| vocab-jac | vocab_jac | Agent-generated from JAC questions | 103 vocab cards from exam content |
| vocab-core | vocab_core | Agent-generated core terms | 22 core construction vocab |
| vocab-exam | vocab_exam | Agent-generated exam vocab | 249 exam-focused vocab cards |
| vocab-teori | vocab_teori | Agent-generated theory vocab | 54 law/safety management vocab |

Old→new ID mapping: `docs/id-mapping-v87-to-v90.json` (1438 entries)

Official JAC source: https://global.jac-skill.or.jp/indonesia/examination/documents.php

---

*End of _MAP.md — Last updated 2026-04-27 by Crispy*

---

## 10. v90 Design Overhaul Changelog

### Design System: Cold Slate → Warm Amber (matching nugget-nihongo.pages.dev)

| Token | v87 (old) | v90 (new) | Purpose |
|-------|-----------|-----------|---------|
| Background | `#0f172a` (cold slate) | `#0D0B08` (warm dark) | Main bg |
| Primary text | `#e2e8f0` (cool gray) | `#FEF3C7` (warm cream) | Body text |
| Bright text | `#f1f5f9` | `#FFFBEB` | Headlines |
| Muted text | `#94a3b8` | `rgba(254,243,199,0.56)` | Secondary |
| Accent gradient | `#f6d365 → #fda085` | `#92400E → #B45309 → #F59E0B` | Brand amber |
| Info color | `#93c5fd` (blue) | `#FBBF24` (gold) | Highlights |
| Borders | `rgba(255,255,255,0.09)` | `rgba(245,158,11,0.10)` | Warm tint |
| Surfaces | `rgba(255,255,255,0.0X)` | `rgba(245,158,11,0.0X)` | Warm tint |

### UX Additions
- **Onboarding flow** — 4-step welcome screen for first-time users
- **DM Sans font** — Matching main site typography
- **Warm amber borders** — All borders have amber tint instead of cold white
- **Brand gradient buttons** — CTA buttons use `#92400E → #F59E0B`

### Files
- `src/App-v90.jsx` — Complete working artifact (7,462 lines)
- `legacy/ssw_flashcards_v87.jsx` — Previous version for comparison
