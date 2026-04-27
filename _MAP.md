# 🗺️ _MAP.md — SSW Flashcard App · Agent Orientation

> **Last updated:** 2026-04-27 by Crispy (Claude agent)
> **Status:** Architecture refactored from v87 monolith → modular multi-file
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
  id: 42,                        // Unique numeric ID (non-sequential, has gaps)
  category: "listrik",           // Category key (see CATEGORIES)
  source: "text5l",              // Source PDF/CSV identifier
  furi: "せっちぼう",              // Hiragana reading (ONLY on ~708 vocab cards, missing on ~730)
  jp: "接地棒",                   // Japanese text (kanji, may contain inline furigana)
  romaji: "secchibou",           // Romanization
  id_text: "Batang pentanahan",  // Indonesian translation (short)
  desc: "Batang yang didorong..."// Indonesian explanation (long)
}
```

**12 categories:** salam, hukum, jenis_kerja, listrik, telekomunikasi, pipa, isolasi, pemadam, keselamatan, karier, alat_umum, (+ virtual: bintang)

**17 sources:** text1l, text2, text3, text4, text5l, text6l, text7l, tt_sample, tt_sample2, st_sample_l, st_sample2_l, lifeline4, vocab_jac, vocab_core, vocab_exam, vocab_teori

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
  answer: 1,                     // ⚠ 1-BASED INDEX (1 = first option)
  hasPhoto: false,               // Whether original has a photo
  photoDesc: null,               // Text description of photo if hasPhoto
  explanation: "朝礼 = ...",     // Indonesian explanation
  related_card_id: 4             // Links to CARDS[].id
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

### ⚠ CRITICAL: Answer Index Mismatch

| Data Source   | Index Base | `answer: 1` means |
|---------------|-----------|-------------------|
| JAC_OFFICIAL  | 1-based   | First option      |
| WAYGROUND_SETS| 0-based   | **Second** option |

**This is the #1 source of bugs.** Any agent editing questions MUST check which schema they're in.

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
- [ ] **Unify answer indexing** — JAC (1-based) vs Wayground (0-based)
- [ ] **Add furi field to all 730 cards** missing it (text/st/tt sources)
- [ ] **Add bundler** (esbuild or vite) to produce deployable output

### 🟡 MEDIUM Priority
- [ ] **Replace inline styles** with theme tokens (T/S from theme.js) — 767 instances
- [ ] **Integrate shared hooks** into mode components (replace duplicated patterns)
- [ ] **Build `<QuizShell>` wrapper** — unify quiz UX across all modes
- [ ] **Build `<ResultScreen>` component** — unify result screens
- [ ] **Fix romaji typo** in card id:1202 (`supeeसाaa` → `supeesaa`)
- [ ] **Remove duplicate Wayground questions** (wt1 Q4 ≈ Q5)
- [ ] **Normalize source names** to canonical format

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

| Source Key | Origin | Notes |
|-----------|--------|-------|
| text1l | JAC PDF Ch.1 — 挨拶・安全管理 | Greetings, morning assembly, KY, 5S |
| text2 | JAC PDF Ch.2 — 法規 | Laws: labor, safety, construction, recycling |
| text3 | JAC PDF Ch.3 — 工事の種類 | Work types: lifeline, equipment, building |
| text4 | JAC PDF Ch.4 — 施工管理 | Construction management, surveying, formwork |
| text5l | JAC PDF Ch.5 — 工具・機械 | Tools, equipment, measuring instruments |
| text6l | JAC PDF Ch.6 — 配管・保温保冷 | Piping, insulation, HVAC |
| text7l | JAC PDF Ch.7 — キャリア | Career, qualifications, CCUS |
| tt_sample | JAC sample exam — 学科 Set 1 | 25 theory questions with photos |
| tt_sample2 | JAC sample exam — 学科 Set 2 | 36 theory questions |
| st_sample_l | JAC sample exam — 実技 Set 1 | 22 practical questions |
| st_sample2_l | JAC sample exam — 実技 Set 2 | 12 practical questions |
| lifeline4 | Wayground CSV — vocab from sensei | 260 lifeline/equipment vocab cards |
| vocab_jac | Agent-generated from JAC questions | 103 vocab cards from exam content |
| vocab_core | Agent-generated core terms | 22 core construction vocab |
| vocab_exam | Agent-generated exam vocab | 249 exam-focused vocab cards |
| vocab_teori | Agent-generated theory vocab | 54 law/safety management vocab |
| CSV v2 / JAC Official | Wayground CSV teori sets | Used in WAYGROUND_SETS (wt1-wt10) |
| Wayground / Quizizz | Wayground quiz platform | Used in WAYGROUND_SETS (wp1-wp3, wg*) |

Official JAC source: https://global.jac-skill.or.jp/indonesia/examination/documents.php

---

*End of _MAP.md — Last updated 2026-04-27 by Crispy*
