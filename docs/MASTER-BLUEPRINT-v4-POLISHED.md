# 🏗️ SSW Konstruksi — Master Blueprint v4 (Research-Polished)

> **Repository:** [`nuggetenak/Nugget-Nihongo-SSW-Konstruksi`](https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi)
> **Current Version:** v3.6.1 (Phase 1–10 RELEASED ✅)
> **Blueprint Author:** Agent Sonnet 4.6 · 2026-05-01
> **Polish Author:** Agent Sonnet 4.6 · 2026-05-01 (post corpus read)
> **Corpus basis:** Nugget Nihongo Research Foundation (743 citations, 21 sections) + SECTION8-PWA-v3 (~145 citations) + Curriculum Blueprint v1
> **Audit basis:** Full source read — 99 files, 15,978 lines verified before writing
> **Status:** 📋 ACTIVE — Approved by Nugget, ready for Opus 4.6 handoff

---

## ⚡ What's New in This Polished Version

This file is **MASTER-BLUEPRINT-v4.md + research evidence layer** from the Nugget Nihongo corpus (`nugget-nihongo` repo, `develop` branch). All phases are identical to v4 — this version adds:

1. **§0 — Research Foundation** (new): why SSW Konstruksi's design decisions are evidence-backed
2. **Research callouts** embedded in Phase 11–17 rationale sections
3. **Phase 13 strengthened**: Daily Mission grounded in SDT + gamification evidence
4. **Phase 16 strengthened**: Audio rationale + malu/anxiety evidence added
5. **Appendix B** (new): Key corpus citations applicable to SSW Konstruksi

All code-level specifications, bug fixes, and file verdicts are **unchanged** from v4.

---

## 🔍 Sonnet 4.6 Audit Notes (Pre-Blueprint)

*(Unchanged from v4 — see MASTER-BLUEPRINT-v4.md §Audit Notes)*

---

## 📑 Daftar Isi

0. [Research Foundation — Why These Decisions](#0-research-foundation)
1. [Architecture Health — Actual State](#1-architecture-health--actual-state)
2. [Confirmed Bugs (Fix Before Phase 11)](#2-confirmed-bugs-fix-before-phase-11)
3. [Technical Debt Register](#3-technical-debt-register)
4. [v4 Vision & Constraints](#4-v4-vision--constraints)
5. [Phase 11 — Bug Fixes & Storage Hardening](#5-phase-11--bug-fixes--storage-hardening)
6. [Phase 12 — Content: Sipil & Bangunan Tracks](#6-phase-12--content-sipil--bangunan-tracks)
7. [Phase 13 — Adaptive Learning (Daily Mission + FSRS+)](#7-phase-13--adaptive-learning-daily-mission--fsrs)
8. [Phase 14 — Export/Import Refinement](#8-phase-14--exportimport-refinement)
9. [Phase 15 — FlashcardMode Decomposition](#9-phase-15--flashcardmode-decomposition)
10. [Phase 16 — Exam Countdown + Audio (Hybrid)](#10-phase-16--exam-countdown--audio-hybrid)
11. [Phase 17 — QA, SW Auto-bump, Release v4.0](#11-phase-17--qa-sw-auto-bump-release-v40)
12. [Non-Goals (Explicitly Out of Scope)](#12-non-goals-explicitly-out-of-scope)
13. [File-by-File Verdict (Verified)](#13-file-by-file-verdict-verified)
- [Appendix A — Phase Summary Table](#appendix-a--phase-summary-table)
- [Appendix B — Key Corpus Citations for SSW Konstruksi](#appendix-b--key-corpus-citations-for-ssw-konstruksi)

---

## 0. Research Foundation

> *Why does SSW Konstruksi make the design choices it does? This section grounds each major decision in the Nugget Nihongo corpus (~743 peer-reviewed citations) and SECTION8-PWA-v3 (~145 citations).*

### 0.1 — Why FSRS (not SM-2, not Leitner)

**Evidence:** Kim & Webb (2022) meta-analysis of 48 L2 vocabulary experiments (N=3,411) — spaced practice produces significantly better long-term retention than massed practice. Adesope et al. (2017) meta-analysis of 217 studies — retrieval practice outperforms restudying (effect size g=0.61). Rowland (2014) meta-analytic review — medium-to-large testing effect (g=0.50), grows with retention interval length.

**FSRS specifically:** Validated in KDD 2022 proceedings (Ye et al. 2022) and IEEE TKDE (Su et al. 2023) on the open Anki dataset of 780M reviews. FSRS-4.5 achieves lower mean absolute error on retention prediction than SM-2 on the same dataset. **Caveat (Agent 2, C1):** No independent RCT has compared FSRS 4.0 specifically against SM-2 in a language learning context. We cite FSRS as "theoretically grounded with strong community benchmark performance."

**Design implication for Phase 11/13:** FSRS calibration hooks already present in `fsrs-core.js`. Phase 13's `getOverdueRatio()` addition to `fsrs-scheduler.js` is precisely the kind of instrument the corpus recommends for adaptive task selection.

**SRS ceiling (important for content decisions):** Laufer (2003) and Webb & Nation (2017) establish that SRS is most efficient for the first 2,000–3,000 high-frequency words. Beyond this threshold, extensive reading becomes the primary acquisition route. **For SSW Konstruksi:** The 1,438-card corpus is well within this ceiling — SRS is the right tool for the entire content scope.

### 0.2 — Why PWA (not native app)

**Evidence (SECTION8-PWA-v3, §8.10):**

- **Market size:** Japan Foundation (2023) — 732,914 Japanese language learners in Indonesia, 2nd globally after China. Self-study / community learners (the primary SSW Konstruksi target) = ~183,000 addressable users. These learners are not in formal institutions — they need a zero-friction install path.
- **Mobile-first is structural:** APJII (2023) — 95.4% of Indonesian internet users access via smartphone. Haristiani & Rifa'I (2020) — the only published study of Indonesian Japanese learners specifically: 78% smartphone-exclusive access.
- **Android dominance:** StatCounter (2024) — 88.7% Android market share in Indonesia. PWA add-to-home-screen is a three-tap flow on Android Chrome — functionally equivalent to native app install.
- **Offline is not optional:** GSMA Intelligence (2023) — variable 4G coverage, especially outer islands and peri-urban areas. A PWA requiring continuous connectivity fails ~30% of the addressable market. **The current SW + cache-first strategy is market-correct architecture.**
- **iOS objection resolved:** Firtman (2023) — iOS 16.4+ (March 2023) enables Web Push for PWAs. ~85–90% of active iOS devices now on 16.4+. The historical "iOS PWA limitation" is no longer a blocking concern.

**Design implication for Phase 17:** SW CACHE_VERSION auto-bump (TD-06) is not just a DX nicety — it is a **market-access issue**. Indonesian users on variable connections who get stale cache cannot learn. Automating the bump removes human error from a market-critical path.

### 0.3 — Why No Gamification Dark Patterns

**Evidence (corpus §10, gamification cluster GE/GF/GM):**

- Przybylski, Rigby & Ryan (2010) — motivational model distinguishing need-satisfying vs. need-frustrating game mechanics. Hearts, gem scarcity, and daily streak pressure are need-frustrating; they produce engagement but not learning.
- Mekler et al. (2017) — individual gamification elements (points, badges, leaderboards) improve performance on rote tasks but do **not** improve intrinsic motivation or learning quality in educational contexts.
- Hanus & Fox (2015) — longitudinal study: gamification elements (points, badges, leaderboard) decreased intrinsic motivation, mastery goal orientation, and performance over a 16-week semester compared to non-gamified control.
- Van Roy & Zaman (2018) — need-supporting gamification (autonomy, competence, relatedness) improves motivation over time; need-controlling gamification degrades it.
- **Nicholson (2015)** — "meaningful gamification" framework: game elements must be meaningful to the learner's goals, not arbitrary. A "7-day streak" badge is meaningful for SSW exam preparation because it reinforces the study discipline actually needed for the exam.

**Design implication:** The Daily Mission (Phase 13) is designed as **need-supporting** gamification — it provides competence feedback (you studied X cards today) and autonomy (user can dismiss or choose a different mode). It does **not** punish non-completion, does not create scarcity, does not compare users socially. This is the correct design per corpus evidence.

**Deci, Koestner & Ryan (1999)** meta-analysis (101 experiments): extrinsic rewards for interesting tasks undermine intrinsic motivation. The corpus is clear: the goal is to make the *activity itself* feel rewarding, not to layer external rewards on top.

### 0.4 — Why Malu-Aware Design

**Evidence (corpus §8, Study 3 — malu/face-concern cluster):**

- Markus & Kitayama (1991) — interdependent self-construal: self-concept defined by relationships and social standing, not individual achievement. Mistakes in public = threat to relational self, not just ego. IDV score for Indonesia = 14/100 (Hofstede), one of the lowest globally, confirming high interdependence.
- Horwitz, Horwitz & Cope (1986) — Foreign Language Classroom Anxiety Scale: fear of negative evaluation, communication apprehension, and test anxiety are distinct constructs, all significantly higher in collectivist cultural contexts.

**Design implication for the platform:** SSW Konstruksi's **private, local-only progress** (no leaderboards, no social comparison, no cloud upload) is not a technical simplification — it is a **malu-aware privacy design**. Users can make mistakes without fear of social visibility. The export/import system (Phase 14) makes the user the sole owner of their data. This is a pedagogical design decision grounded in cross-cultural psychology.

**Caveat (Agent 2, C10):** Malu intensity varies by regional culture within Indonesia. Javanese learners experience it differently from Batak or Minang learners. We hedge: "designed for learners in Indonesian cultural contexts" without claiming universality.

### 0.5 — Why SSW Konstruksi Needs Content Completion (Phase 12 Priority)

**Evidence (corpus §VS — Vocational/SSW cluster):**

- Ministry of Health, Labour and Welfare, Japan (2019) — Specified Skilled Worker (特定技能) system overview: JLPT N4 is the **minimum regulatory requirement** for SSW visa eligibility across all 14 designated sectors including construction (建設業).
- Immigration Services Agency of Japan (2023) — construction sector is one of the top 3 SSW destination sectors by headcount.
- Noyama (2012) — JLPT N4 passers still report communication difficulties in authentic work settings. Functional target should be N3 for communication-heavy roles.
- Kamata & Tanaka (2021) — Japanese language demands in construction/care settings: vocabulary, scene-specific, and discourse-level competencies are distinct. Domain-specific vocabulary (construction terminology) is not well-covered by general JLPT preparation materials.

**Design implication:** The current `SipilMode` and `BangunanMode` stubs represent the biggest content gap relative to actual learner need. Users preparing for 土木/建築 SSW certification cannot find relevant construction-specific practice in the app today. Phase 12 is the highest-impact content investment.

### 0.6 — Why Nation's Four Strands Shapes Mode Design

**Evidence:** Nation (2007) — an effective language course must balance four strands equally: meaning-focused input, meaning-focused output, language-focused learning, and fluency development.

**Current strand mapping for SSW Konstruksi:**

| Strand | Platform Feature | Status |
|---|---|---|
| Meaning-focused input | Example sentences in FlashcardMode back; JpDisplay | ✅ Present |
| Meaning-focused output | ID→JP production format (planned), SprintMode | ⚠️ Partial |
| Language-focused learning | SRS review, QuizMode, JACMode, WaygroundMode | ✅ Strong |
| Fluency development | SprintMode (timed), DangerMode, SimulasiMode | ✅ Present |

**Implication for Phase 13 (Daily Mission):** The mission engine should not always recommend the same strand. If a user has done QuizMode (language-focused) every day for a week, the mission should consider recommending FlashcardMode (meaning-focused input) or SprintMode (fluency) to maintain strand balance. Add `prog.sessions[].mode` tracking enables this.

---

## 1. Architecture Health — Actual State

*(Unchanged from v4)*

### 1.1 Stack (verified)

| Layer | Tech | Status |
|---|---|---|
| UI | React 19 + Vite 6 | ✅ |
| SRS | ts-fsrs v5 (3-layer wrapper) | ✅ |
| Storage | localStorage, 3-document model, v2 schema | ✅ |
| Styling | CSS Modules (16 files) + theme.js tokens | ✅ |
| Testing | Vitest 4.1.5 — 223 tests, 10 files | ✅ |
| Lint | ESLint flat config v10 | ✅ |
| CI/CD | GitHub Actions (ci.yml + deploy.yml) | ✅ |
| PWA | Manual SW, CACHE_VERSION bump, cache-first/network-first | ✅ (manual bump = risk) |

### 1.2 Dependency count: **3 prod** (react, react-dom, ts-fsrs) — target: keep ≤5

### 1.3 Actual Health Scorecard

| Dimension | Score | Basis |
|---|:---:|---|
| Architecture | **A−** | 3-doc + 3-context + lazy modes = correct. Minus: Dashboard reads storage directly bypassing context; dead exports from Dashboard |
| SRS Engine | **A** | Clean 3-layer separation (core/store/scheduler). Calibration hooks ready |
| CSS / Styling | **B+** | 16 CSS modules. 487 justified inline remain. FLIP_STYLE injection = anti-pattern |
| A11y | **B+** | 46 aria attrs, WCAG AA contrast. Missing: skip-nav, focus sentinel, keyboard-only path |
| Performance | **A−** | Lazy modes + manual chunks. `csv-sets.js` (3998 lines) loaded per VocabMode lazy chunk — acceptable |
| Offline / PWA | **A−** | Cache strategy correct. Manual `CACHE_VERSION` bump = stale cache risk |
| Tests | **B+** | 223 tests, mostly unit + component. Missing: flow tests (onboarding→quiz→SRS write-back) |
| DX | **A** | Clean scripts, ESLint, audit:integrity, bundle visualizer |
| Content | **C+** | Lifeline track full. Sipil & Bangunan = stubs. User-facing gap |
| Export/Import | **B−** | Two incompatible export paths. `ExportMode` uses raw format; `SayaTab` uses engine format |
| Analytics | **D** | Streak + daily count exist. No time-on-card, no accuracy curve, no session metrics |

---

## 2. Confirmed Bugs (Fix Before Phase 11)

### BUG-01 — Dashboard streak/count stale after quiz session
**File:** `src/components/Dashboard.jsx` lines 66–68
**Root cause:** `useMemo(() => getStreak(), [])` — empty deps. Reads storage once at mount. When user plays quiz and returns to Dashboard tab without unmounting, streak and dailyCount do not update.
**Fix:** Dashboard should consume `streakData` and `dailyCount` from `ProgressContext` (already available), not read storage directly. Remove the 3 dead functions `recordStudyDay`, `incrementDailyCount`, `pushRecentCard` from Dashboard exports.

### BUG-02 — `_seenPool` module-scope hidden global state
**File:** `src/modes/QuizMode.jsx` line 3
**Root cause:** `const _seenPool = new Set()` at module level. Not reset on HMR. If user exits and re-enters QuizMode in same session without triggering `onExit`, pool carries over and distorts "unseen first" logic.
**Fix:** Move to `useRef` inside the component, initialize to `new Set()`. Reset on `cards` prop change.

### BUG-03 — `_newKnownSize` reserved but unused, milestone toast incomplete
**File:** `src/contexts/ProgressContext.jsx` line 63
**Root cause:** `const _newKnownSize = knownSet.size; // reserved for milestone toast` — dead code. `milestoneQuiz70` is set via `setMilestoneQuiz70()` but no UI consumes it and no trigger fires for `milestoneStreak7` toast.
**Fix:** Wire milestone toasts in `App.jsx` (check on `prog` change → fire `toast.show`) or remove dead milestone code entirely. Recommendation: keep data fields, add toast triggers in `App.jsx` using `useEffect` watching `prog.milestoneStreak7`.

---

## 3. Technical Debt Register

### TD-01 — ExportMode uses incompatible export format (HIGH)
`ExportMode.jsx` calls custom `collectProgressData()` + `exportSRSSnapshot()` (raw localStorage keys). `SayaTab` calls `engine.exportAll()` (3-doc format). The two output schemas are different — a file from ExportMode cannot be reliably imported by SayaTab's `importAll()`. **ExportMode should be deleted and its UI merged into SayaTab.**

### TD-02 — Dead exports from Dashboard.jsx (MEDIUM)
`recordStudyDay`, `incrementDailyCount`, `pushRecentCard` exported from `Dashboard.jsx` but `ProgressContext.handleMark` already handles all three. These exports are not imported anywhere. Remove them.

### TD-03 — wrong-tracker.js: `STORAGE_KEYS` references v1 key names (MEDIUM)
`wrong-tracker.js` still exports `STORAGE_KEYS` with `'ssw-known'`, `'ssw-quiz-wrong'` etc. — v1 keys that no longer exist in v2 schema. Remove dead exports: `STORAGE_KEYS`, `loadFromStorage`, `saveToStorage`, `removeFromStorage`.

### TD-04 — `useStreak` naming ambiguity (LOW-MEDIUM)
`useStreak` hook = correct-answer streak (in-session, not persisted). `streakData` in ProgressContext = study-day streak (persisted). Rename `useStreak` → `useAnswerStreak`.

### TD-05 — FLIP_STYLE injected to document.head (LOW)
`FlashcardMode.jsx` injects a `<style>` tag at runtime on mount. Move to `global.css` under a scoped `.fc-scene` selector.

### TD-06 — SW CACHE_VERSION manual bump (MEDIUM)
`public/sw.js` line 10: `const CACHE_VERSION = 'ssw-v2026-04-28'`. **Research grounding:** GSMA Intelligence (2023) documents variable connectivity for Indonesian users — stale cache directly blocks learning. Auto-bump via CI is a market-access fix, not just a DX nicety.

### TD-07 — `data/index.js` barrel re-export (LOW)
Leave unless it causes circular import issues (it doesn't currently).

### TD-08 — Legacy arrays in `modes.js` (LOW)
`BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` — unused. Safe to remove after verification.

---

## 4. v4 Vision & Constraints

### 4.1 North Star

*From "polished SSW flashcard app" → "adaptive SSW learning platform that knows when you're weak and what to study next."*

**Research grounding:** The corpus identifies three structural barriers for Indonesian SSW candidates studying Japanese:
1. **Content gap** — general JLPT materials don't cover construction-specific vocabulary (Kamata & Tanaka 2021)
2. **Motivation friction** — "what do I study today?" decision fatigue is a documented dropout cause in self-directed L2 learning (Ushioda 2011 — autonomy support; Ryan & Deci 2000 — SDT)
3. **Progress invisibility** — learners cannot see their trajectory, leading to motivation collapse (Van Roy & Zaman 2018 — need for competence feedback)

Three features directly address these barriers:
1. **Phase 12** → Content completeness (Sipil & Bangunan)
2. **Phase 13** → Daily Mission removes decision friction
3. **Phase 13** → Session analytics + StatsMode extension makes progress visible

### 4.2 Hard Constraints (Non-Negotiable)

- **No backend / cloud sync** — localStorage only. Export/import is the sync mechanism. *Research basis: malu-aware privacy design (§0.4)*
- **No new prod dependencies** — stay at 3 prod deps (react, react-dom, ts-fsrs). New features use Web APIs.
- **No breaking storage migration without versioned migration path** — `STORAGE_VERSION` bump to 3 must come with `migrate_v2_to_v3()` in `migrations.js`.
- **All audio via Web Speech API only** — no audio file bundle (avoids 45MB+ asset overhead).
- **Branding: Nugget Nihongo** throughout.
- **No i18n extraction** — Indonesian strings stay hardcoded. Revisit at v5.
- **No LLM coach** — keep zero-latency, fully offline.

### 4.3 Guiding Principles

- Fix before feature: BUG-01, BUG-02, BUG-03 land in Phase 11 before any new feature work
- Additive not rewriting: phases should not break existing functionality
- Test before ship: every phase should include tests for the new behavior
- Honest UI: Sipil/Bangunan stub modes show "Coming Soon" until Phase 12 populates them
- **Need-supporting, not need-frustrating:** all gamification elements must satisfy autonomy, competence, or relatedness (Ryan & Deci SDT framework). No hearts, no scarcity, no social pressure.

---

## 5. Phase 11 — Bug Fixes & Storage Hardening

**Goal:** Zero known bugs. Storage layer fully consistent. Dead code removed.
**Scope:** Non-breaking. No new features.
**Test target:** 223 → ~250 tests

### 11.1 Fix BUG-01 (Dashboard stale data)
- `Dashboard.jsx`: remove `useMemo([])` blocks for streak/dailyCount/recentCards
- Import and consume `useProgress()` → destructure `streakData`, `dailyCount`, `recentCards`
- Remove exported `recordStudyDay`, `incrementDailyCount`, `pushRecentCard` functions
- Remove direct `storageGet`/`storageSet` from Dashboard entirely

### 11.2 Fix BUG-02 (_seenPool)
- `QuizMode.jsx`: move `_seenPool` to `useRef(new Set())` inside component
- Add `useEffect(() => { seenPool.current.clear(); }, [cards])` to reset on card set change

### 11.3 Fix BUG-03 (milestone toast)
- `App.jsx`: add `useEffect` watching `prog` — when `milestoneStreak7` transitions false→true, fire `toast.show('🔥 7 hari streak!')`. Same for milestoneQuiz70.
- Remove `_newKnownSize` dead variable from ProgressContext

### 11.4 Consolidate wrong-tracker (TD-01, TD-03)
- Delete `ExportMode.jsx` — its functionality already exists better in `SayaTab`
- Remove `src/modes/ekspor` from `MODE_COMPONENTS` and `MODE_META` in `modes.js`
- Remove dead exports from `wrong-tracker.js`: `STORAGE_KEYS`, `loadFromStorage`, `saveToStorage`, `removeFromStorage`
- Keep: `getWrongCount`, `getWrongTime`, `makeWrongEntry`

### 11.5 Remove dead Dashboard exports (TD-02)
Already covered by 11.1.

### 11.6 STORAGE_VERSION 2 → 3 (schema hardening)
- Add `examDate: null` to `DEFAULTS.prefs` (needed for Phase 16)
- Add `dailyMission: null` to `DEFAULTS.progress` (needed for Phase 13)
- Add `sessions: []` to `DEFAULTS.progress` (needed for Phase 13 analytics)
- Bump `STORAGE_VERSION = 3` in `schema.js`
- Add `migrate_v2_to_v3()` in `migrations.js`: copies all v2 fields, adds new fields with defaults
- Update `init()` in `engine.js` to handle v2→v3 migration path

### 11.7 Rename useStreak → useAnswerStreak (TD-04)
- Rename `src/hooks/useStreak.js` → `src/hooks/useAnswerStreak.js`
- Update all imports (QuizShell, hooks/index.js)
- Export as `useAnswerStreak`

### 11.8 Remove legacy nav arrays (TD-08)
- Grep confirms `BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` are unused
- Remove from `modes.js`

### 11.9 Tests to add
- `migrations.v2-to-v3.test.js` — verify all v2 fields survive, new fields initialized
- `dashboard.staleness.test.jsx` — mount Dashboard, trigger handleMark via context, verify re-render
- `quiz.seenpool.test.jsx` — verify _seenPool resets on cards prop change

---

## 6. Phase 12 — Content: Sipil & Bangunan Tracks

**Goal:** Both stub modes replaced with real question content from existing JAC Official data.
**Research grounding:** Kamata & Tanaka (2021) — construction/care-specific Japanese vocabulary is not covered by general JLPT materials. SSW Construction candidates (土木・建築) need domain-specific practice, not generic flashcards. MHLW (2019) — SSW eligibility requires demonstrable domain vocabulary competence assessed via sector-specific skills test, separate from JLPT.
**Constraint:** No new source files — use JAC Official (`jac-official.js`) as the base, filtered by construction domain. Add dedicated sets to `wayground-sets.js` or a new `sipil-sets.js`.

### 12.1 Content strategy

JAC Official has 95 questions across 4 sets (st1, st2, tt1, tt2). Most are 設備/lifeline-focused. For Sipil and Bangunan, content must come from:
- Filtering JAC `実技` questions relevant to 土木/建築 domains
- A new `src/data/sipil-sets.js` using the same question schema as `wayground-sets.js`
- A new `src/data/bangunan-sets.js` with the same schema

**Domain vocabulary guidance (from corpus §VS):**
- 土木 (Sipil/Civil engineering): 掘削, 土留め, 切梁, 法面, 盛土, 転圧, 舗装, 排水, 測量, 地盤改良
- 建築 (Bangunan/Building construction): 基礎, 躯体, 型枠, 鉄筋, コンクリート, 防水, 断熱, 仕上げ, 内装, 外壁

**Schema reference** (from `wayground-sets.js`):
```js
{
  id: 'wt1', title: 'Set Title', emoji: '📝', color: '#f97316',
  subtitle: 'JP subtitle', questions: [
    { id: 'q01', q: 'JP question', hint: 'hint', opts: ['A','B','C','D'],
      opts_id: ['ID-A','ID-B','ID-C','ID-D'], ans: 0, exp: 'explanation' }
  ]
}
```

### 12.2 SipilMode.jsx — full replacement
Replace stub with `WaygroundMode`-style implementation:
- Reads from `sipil-sets.js`
- Full quiz flow using `QuizShell`
- Score persistence to `progress.sipilScores` (add to schema in Phase 11)

### 12.3 BangunanMode.jsx — full replacement
Same pattern as SipilMode, reads `bangunan-sets.js`.

### 12.4 Update MODE_META
```js
sipil:    { icon: '⛏️', label: 'Sipil · 土木',    desc: 'Soal teknis 土木施工' },
bangunan: { icon: '🏗️', label: 'Bangunan · 建築',  desc: 'Soal teknis 建築施工' },
```

### 12.5 Tests to add
- `data.sipil.test.js` — verify schema, answer indices in range, no empty questions
- `data.bangunan.test.js` — same

---

## 7. Phase 13 — Adaptive Learning (Daily Mission + FSRS+)

**Goal:** User never has to think "what do I open today?" — the app tells them.
**Research grounding:**
- **SDT (Ryan & Deci 2000):** Autonomy-supportive design — the mission provides a recommendation, not a mandate. User can dismiss or choose differently. This satisfies the autonomy need while reducing decision fatigue.
- **Nation (2007) — Four Strands:** Mission engine should rotate across strands to maintain balance. If user has done only language-focused learning (quiz/SRS) for 3+ sessions, mission should recommend meaning-focused input (flashcard reading) or fluency (sprint).
- **Nicholson (2015) — Meaningful Gamification:** Mission counts, streaks, and completion indicators must connect directly to the user's stated goal (exam preparation). A "5 cards due" prompt is meaningful because it directly reduces the user's SRS debt. An arbitrary "earn 100 gems" prompt is not.
- **Mekler et al. (2017):** Avoid badge inflation — only milestone badges (7-day streak, 100 cards mastered, first track completed) not arbitrary micro-badges for every action.

**New features:** Daily Mission widget, FSRS accuracy telemetry (local-only, opt-in OFF), session tracking.

### 13.1 Daily Mission Engine (`src/utils/daily-mission.js`)

```js
// Pure function, no storage access. Testable in isolation.
export function generateDailyMission(prog, srsStats, prefs) {
  // Returns: { target: 'ulasan'|'kuis'|'kartu', count: N, reason: string, urgency: 'high'|'medium'|'low' }
  // Priority:
  // 1. If srsStats.due > 0 → 'ulasan', count = due, urgency = 'high'
  // 2. If dailyCount < dailyGoal/2 → 'kartu', count = dailyGoal - dailyCount, urgency = 'medium'
  // 3. If quizWrong entries > 5 → 'fokus', urgency = 'medium'
  // 4. If strand imbalance detected (sessions[] shows 3+ consecutive same-strand) → recommend alternate strand
  // 5. Default → 'kuis', urgency = 'low'
}
```

**Strand balance check (addition from corpus §0.6):**
```js
function detectStrandImbalance(sessions) {
  const recent = sessions.slice(-3);
  if (recent.length < 3) return null;
  const modes = recent.map(s => s.mode);
  const quizModes = ['kuis', 'jac', 'wayground', 'sipil', 'bangunan'];
  const allQuiz = modes.every(m => quizModes.includes(m));
  if (allQuiz) return 'kartu'; // suggest flashcard (meaning-focused input)
  return null;
}
```

### 13.2 Daily Mission UI

Location: `Dashboard.jsx` — replace the static "quick action" CTA with a dynamic mission card.

```
┌─────────────────────────────────────────────────┐
│ 📋 Misi Hari Ini                          H:M  │  ← countdown to midnight
│                                                  │
│  🔁 Ulang 12 kartu SRS         urgency: HIGH   │
│  Terakhir: 3 hari lalu                          │
│                              [ Mulai Sekarang ] │
└─────────────────────────────────────────────────┘
```

**UX note:** Mission card should be dismissable ("Lewati hari ini" link). Non-completion is never punished — consistent with SDT autonomy support and malu-aware design (never shame the user for not studying).

### 13.3 Session tracking (local, stored in `progress.sessions`)

```js
// Schema (added to progress doc in Phase 11):
sessions: [
  { date: '2026-05-01', mode: 'kuis', correct: 8, total: 10, durationMs: 142000 }
  // max 90 entries (3 months), FIFO eviction
]
```

`QuizShell` already has `onFinish({ correct, total })`. Add `startTime` ref on mount, compute `durationMs = Date.now() - startTime` in `onFinish`, pass back.

### 13.4 StatsMode extension

Add session accuracy chart (last 14 days, bar chart):
- X axis: date
- Y axis: % correct
- Rendered as pure HTML/CSS bars (no chart library — stay zero-dep)
- Include mode breakdown: which strands the user has practiced

### 13.5 FSRS local telemetry (opt-in OFF)

- Add `prefs.fsrsTelemetry: false` to schema (Phase 11 already adds this)
- In `fsrs-scheduler.js`, if telemetry enabled: write to `progress.fsrsLog[]` — `{ cardId, rating, stability, difficulty, date }` (max 500 entries)
- No upload, no network. Purely for "show me my retention curve" in StatsMode v2

### 13.6 Tests to add
- `daily-mission.test.js` — all 5 priority branches including strand imbalance
- `session-tracking.test.js` — verify session written on quiz finish, max 90 eviction

---

## 8. Phase 14 — Export/Import Refinement

**Goal:** Single, reliable export/import path. User can safely move progress between devices.
**Research grounding:** The malu-aware, privacy-first architecture (§0.4) means export/import IS the cloud sync. If it is unreliable, users lose their progress when switching devices — a catastrophic UX failure for long-term SSW exam candidates.

### 14.1 Delete ExportMode (covered in Phase 11 TD-01)

Already handled. This phase focuses on making SayaTab's export/import excellent.

### 14.2 Export UI improvements in SayaTab

**Export:**
- Show data summary before download: "Ekspor berisi: X kartu hafal, Y kartu SRS, Z sesi"
- File name includes version: `ssw-progress-v3-2026-05-01.json`
- Toast confirms with summary

**Import:**
- Show diff before applying: "File ini berisi X kartu hafal (kamu saat ini: Y). Lanjutkan?"
- Version check: if `snapshot._storage_version < STORAGE_VERSION`, run migration before import
- Validate schema before applying (already throws on missing docs, add field validation)
- Rollback on error: snapshot current state before import, restore if `importAll` throws

### 14.3 Import validation (`engine.js`)

```js
export function validateSnapshot(snapshot) {
  if (!snapshot?.progress || !snapshot?.srs || !snapshot?.prefs) return { ok: false, reason: 'missing_docs' };
  if (!Array.isArray(snapshot.progress.known)) return { ok: false, reason: 'invalid_known' };
  // ... other checks
  return { ok: true, summary: { known: snapshot.progress.known.length, ... } };
}
```

### 14.4 Tests to add
- `import.validation.test.js` — valid snapshot, missing docs, wrong types, old version
- `import.rollback.test.js` — verify state unchanged after failed import

---

## 9. Phase 15 — FlashcardMode Decomposition

**Goal:** `FlashcardMode.jsx` (447 lines) split into focused sub-components. FLIP_STYLE moved to CSS.
**Constraint:** No behavioral change. All existing functionality must work identically.

### 15.1 Component split plan

```
src/modes/FlashcardMode/
  index.jsx          (orchestrator, ~80 lines)
  FlipCard.jsx       (3D card face, front + back, ~100 lines)
  RatingRow.jsx      (FSRS 4-button row, ~50 lines)
  ToolStrip.jsx      (sort/filter/reset/star buttons, ~60 lines)
  FilterBar.jsx      (search input + star button, ~40 lines)
  flashcard.module.css  (consolidates fc-scene + all card styles)
```

### 15.2 FLIP_STYLE → CSS

Move `FLIP_STYLE` constant to `src/styles/global.css`:

```css
.fc-scene { perspective: 1200px; }
.fc-card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
}
.fc-card.is-flipped { transform: rotateY(180deg); }
.fc-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.fc-face--back { transform: rotateY(180deg); }
@keyframes fcHintFade { 0%, 70% { opacity: 1; } 100% { opacity: 0; pointer-events: none; } }
```

Remove `ensureStyle()` and `FLIP_STYLE` from `FlashcardMode/index.jsx`.

Note: tilt transform on card (`rotateY + translateX + rotate`) stays inline — it's runtime-computed from `swipeDelta`.

### 15.3 Tests to add
- `flashcard.flip.test.jsx` — card flips on tap/space, FSRS rating row appears after flip
- `flashcard.filter.test.jsx` — search filters correctly, star filter shows only starred

---

## 10. Phase 16 — Exam Countdown + Audio (Hybrid)

**Goal:** User can set exam date → app shows days remaining + adjusts Daily Mission urgency. Audio via Web Speech API for JP terms.

**Research grounding (exam countdown):**
- SSW construction exam (特定技能評価試験 建設分野) has fixed date windows published by JAC (一般社団法人建設技能人材機構). Indonesian candidates must pass within a specific registration window. A countdown to their specific exam date — not a generic "daily goal" — directly connects practice to real exam stakes.
- **Urgency multiplier < 14 days:** Based on spaced repetition theory (Bahrick et al. 1993 — spacing effect), the last 2 weeks before an exam are the highest-leverage review window. Daily Mission urgency escalation reflects this scientifically.

**Research grounding (audio):**
- **Oral practice and phonological recoding:** The corpus §8 (MALL cluster) documents that pronunciation feedback is a documented gap in text-only vocabulary apps. Haristiani & Rifa'I (2020) — Indonesian learners specifically cite inability to practice pronunciation as a barrier.
- **Web Speech API feasibility:** Available in Chrome 33+, Safari 14.5+, Firefox 49+. Indonesian Android (88.7% of market) = Chrome-dominant. `ja-JP` voice available on all modern Android devices. No external dependency, no bundle cost.
- **Malu-aware audio:** Audio is opt-in, private (device speaker or headphones). No recording of user voice in v4 (speaking practice deferred — would require recording + evaluation, which has privacy implications).

### 16.1 Exam Countdown

**Storage:** `prefs.examDate: null` (added in Phase 11 schema v3)

**UI location:** `SayaTab.jsx` — new "Ujian" section:
```
┌──────────────────────────────────────┐
│ 🎯 Target Ujian                       │
│ 12 Mei 2026                  [Ubah]  │
│ 🗓️ 11 hari lagi                       │
│ Sisa waktu cukup untuk ulasan penuh  │
└──────────────────────────────────────┘
```

**Dashboard integration:** if `examDate` set and < 30 days away, show countdown chip in header.

**Daily Mission urgency multiplier:** if `daysLeft < 14`, bump all urgencies one level.

**Date picker:** native `<input type="date">` — no library, works on all mobile browsers.

### 16.2 Audio — Web Speech API (hybrid)

**Implementation:** `src/utils/speak.js`
```js
let _synth = null;
function getSynth() { return _synth ??= window.speechSynthesis; }

export function speakJP(text, { rate = 0.8, pitch = 1.0 } = {}) {
  if (!window.speechSynthesis) return;
  getSynth().cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ja-JP';
  utt.rate = rate;
  utt.pitch = pitch;
  getSynth().speak(utt);
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
```

**UI integration:**
- `FlashcardMode` front face: 🔊 button next to JP term (appears only if `canSpeak()`)
- `ReviewMode` card front: same
- `JpDisplay.jsx`: optional `onSpeak` prop → shows 🔊 icon

**Prefs:** `prefs.audioEnabled: true` — toggle in SayaTab settings

### 16.3 Tests to add
- `exam-countdown.test.js` — daysLeft calculation, urgency multiplier at <14 days
- `speak.test.js` — canSpeak() returns false in jsdom; speakJP no-ops gracefully

---

## 11. Phase 17 — QA, SW Auto-bump, Release v4.0

**Goal:** Clean release. All phases integrated, tested, SW auto-bumps on deploy.

### 17.1 SW CACHE_VERSION auto-bump (TD-06)

In `deploy.yml`, before building:
```yaml
- name: Bump SW cache version
  run: |
    VERSION="ssw-v$(date +%Y%m%d%H%M)"
    sed -i "s/const CACHE_VERSION = .*/const CACHE_VERSION = '$VERSION';/" public/sw.js
```

**Research grounding:** GSMA Intelligence (2023) — ~30% of Indonesian users on variable connectivity. Stale cache from a forgotten manual bump directly blocks learning. This automation removes a market-access failure mode.

### 17.2 Coverage thresholds

Add to `vitest.config.js`:
```js
coverage: {
  provider: 'v8',
  thresholds: { lines: 70, functions: 70, branches: 60 }
}
```

### 17.3 Flow tests (integration)

Tests that span multiple components/contexts:
- `flow.onboarding.test.jsx` — full onboarding 4 steps → completeOnboarding called with correct payload
- `flow.quiz-srs.test.jsx` — start quiz → answer wrong → SRS card written → progress.quizWrong updated
- `flow.flashcard-star.test.jsx` — star card → exit mode → re-enter → card still starred
- `flow.export-import.test.js` — exportAll → importAll → verify all 3 docs match

### 17.4 Release checklist
- [ ] All Phase 11–16 tests passing (target: ~350 tests)
- [ ] Lint: 0 errors, 0 warnings
- [ ] Build: clean, bundle visualizer reviewed (no chunk > 200KB gzip)
- [ ] Manual smoke test: Onboarding → Flashcard → Quiz → Review → Export → Import
- [ ] SW CACHE_VERSION auto-bumped in deploy workflow
- [ ] `package.json` version → `4.0.0`
- [ ] CHANGELOG entry `[4.0.0]`
- [ ] `_MAP.md` updated

---

## 12. Non-Goals (Explicitly Out of Scope)

| Feature | Decision | Research basis | Revisit |
|---|---|---|---|
| Cloud sync / backend | ❌ Out. localStorage + export/import only | Malu-aware privacy design (Markus & Kitayama 1991) | v5 |
| i18n extraction | ❌ Out. ID strings hardcoded | Single-language app, overhead not justified | v5 |
| LLM Coach | ❌ Out. Offline-first constraint | Zero-latency, fully offline requirement | v5 |
| Pre-baked audio files | ❌ Out. Web Speech API sufficient | Web Speech covers 88.7% Android market; bundle cost unjustified | v5 |
| Leaderboard / social | ❌ Out. No backend | Mekler et al. (2017) — leaderboards harm intrinsic motivation | Never unless requirements change |
| Playwright / E2E | ❌ Out. Manual QA covers device-specific behavior | — | v5 |
| New prod dependencies | ❌ Hard constraint. Max 3 prod deps | — | — |
| `vitest/ui` dev dep | ✅ Fine to add as dev dep only | — | Phase 17 |
| Speaking practice (recording) | ❌ Out. Privacy implications | Malu/face-concern; requires user voice data | v5 |

---

## 13. File-by-File Verdict (Verified)

*(Unchanged from v4 — all line counts and verdicts from direct source read on 2026-05-01.)*

### Root & Config

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `package.json` | — | ✅ lean, 3 prod deps | 17: add vitest coverage |
| `vite.config.js` | — | ✅ manual chunks correct | — |
| `eslint.config.js` | — | ✅ flat config v10 | — |
| `vitest.config.js` | — | ✅ | 17: add coverage thresholds |
| `public/sw.js` | — | ⚠️ CACHE_VERSION manual | 17: auto-bump via CI |
| `CHANGELOG.md` | — | ✅ | — |
| `_MAP.md` | — | ✅ excellent agent doc | Update each phase |

### `src/storage/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `engine.js` | 156 | ✅ solid, clean API | 11: add v2→v3 migration path |
| `schema.js` | 45 | ✅ | 11: STORAGE_VERSION 3, add examDate/dailyMission/sessions |
| `migrations.js` | 143 | ✅ v1→v2 working | 11: add migrate_v2_to_v3() |

### `src/contexts/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `AppContext.jsx` | 111 | ✅ | — |
| `ProgressContext.jsx` | 161 | ⚠️ _newKnownSize dead var | 11: remove, wire milestones |
| `SRSContext.jsx` | 32 | ✅ thin, correct | — |

### `src/srs/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `fsrs-core.js` | 204 | ✅ clean, calibration hook comments present | 13: no change needed |
| `fsrs-store.js` | 57 | ✅ thin wrapper | — |
| `fsrs-scheduler.js` | 149 | ✅ | 13: add getOverdueRatio() for Daily Mission |
| `index.js` | 38 | ✅ barrel | — |

### `src/hooks/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `useStreak.js` | 35 | ⚠️ naming ambiguity | 11: rename → useAnswerStreak |
| `useSRS.js` | 55 | ✅ | — |
| `usePersistedState.js` | 26 | ⚠️ legacy, bypasses engine | Deprecate after Phase 11 confirms nothing uses it for new fields |
| `useQuizKeyboard.js` | 45 | ✅ | — |

### `src/utils/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `quiz-generator.js` | 50 | ✅ | — |
| `jp-helpers.js` | 66 | ✅ | — |
| `wrong-tracker.js` | 55 | ⚠️ dead exports | 11: remove dead exports |
| `shuffle.js` | 9 | ✅ | — |
| `speak.js` | — | 🆕 new file | 16: create |
| `daily-mission.js` | — | 🆕 new file | 13: create |

### `src/components/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `Dashboard.jsx` | 165 | 🔴 useMemo([]) BUG-01, dead exports | 11 |
| `BelajarTab.jsx` | 60 | ✅ | — |
| `SayaTab.jsx` | 169 | ⚠️ import handler — verify complete | 14: export/import UI + 16: exam countdown |
| `Onboarding.jsx` | 310 | ✅ 4-step, complete | — |
| `QuizShell.jsx` | 171 | ✅ | 13: add startTime for session tracking |
| `ResultScreen.jsx` | 94 | ✅ | — |
| `OptionButton.jsx` | 32 | ✅ | — |
| `ProgressBar.jsx` | 30 | ✅ aria added | — |
| `ProgressRing.jsx` | 55 | ✅ aria-hidden | — |
| `JpDisplay.jsx` | 207 | ✅ | 16: add onSpeak prop |
| `FilterPopup.jsx` | 140 | ✅ | — |
| `EmptyState.jsx` | 92 | ✅ | — |
| `ConfirmDialog.jsx` | 49 | ✅ | — |
| `Toast.jsx` | 68 | ✅ | — |
| `Skeleton.jsx` | 72 | ✅ | — |
| `TrackPicker.jsx` | 114 | ✅ | — |

### `src/modes/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `FlashcardMode.jsx` | 447 | ⚠️ FLIP_STYLE injection, large | 15: decompose |
| `ReviewMode.jsx` | 190 | ✅ | — |
| `QuizMode.jsx` | 161 | 🔴 BUG-02 _seenPool | 11 |
| `JACMode.jsx` | 116 | ✅ | — |
| `WaygroundMode.jsx` | 123 | ✅ | — |
| `VocabMode.jsx` | 133 | ✅ | — |
| `SimulasiMode.jsx` | 192 | ✅ | — |
| `AngkaMode.jsx` | 225 | ⚠️ panel+quiz in one file | Consider split in Phase 15 |
| `DangerMode.jsx` | 215 | ⚠️ same pattern | Consider split in Phase 15 |
| `SprintMode.jsx` | 104 | ✅ | — |
| `FocusMode.jsx` | 78 | ✅ | 13: use session data for better weakness detection |
| `StatsMode.jsx` | 95 | ⚠️ extend | 13: session accuracy chart + strand breakdown |
| `SearchMode.jsx` | 84 | ✅ | — |
| `GlossaryMode.jsx` | 138 | ✅ | — |
| `SumberMode.jsx` | 69 | ✅ | — |
| `ExportMode.jsx` | 149 | 🔴 delete — duplicate + incompatible format | 11 |
| `SipilMode.jsx` | 68 | 🔴 stub | 12 |
| `BangunanMode.jsx` | 70 | 🔴 stub | 12 |

### `src/data/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `cards.js` | 1599 | ✅ | — |
| `categories.js` | 143 | ✅ | — |
| `jac-official.js` | 975 | ✅ 95 questions, 4 sets | 12: use as base for Sipil/Bangunan |
| `wayground-sets.js` | 860 | ✅ | — |
| `csv-sets.js` | 3998 | ✅ loaded per lazy chunk | — |
| `angka-kunci.js` | 40 | ✅ | — |
| `danger-pairs.js` | 152 | ✅ | — |
| `index.js` | 31 | ✅ barrel | — |
| `sipil-sets.js` | — | 🆕 new file | 12: create |
| `bangunan-sets.js` | — | 🆕 new file | 12: create |

### `src/tests/` (223 tests, 10 files)

| File | Verdict |
|---|---|
| `data.test.js` | ✅ 42 tests |
| `storage.test.js` | ✅ 27 tests |
| `components.quizshell.test.jsx` | ✅ 21 tests |
| `scheduler.test.js` | ✅ 24 tests |
| `components.dashboard.test.jsx` | ✅ 20 tests (BUG-01 fix will need update here) |
| `components.resultscreen.test.jsx` | ✅ 18 tests |
| `utils.test.js` | ✅ 32 tests |
| `offline.sw.test.js` | ✅ 14 tests |
| `srs.test.js` | ✅ 16 tests |
| `quiz.test.js` | ✅ 9 tests |

---

## Appendix A — Phase Summary Table

| Phase | Name | Bugs Fixed | Features | Est. Tests Added |
|---|---|---|---|---|
| 11 | Bug Fixes & Storage Hardening | BUG-01, BUG-02, BUG-03 + 5 TD | None | +27 |
| 12 | Content: Sipil & Bangunan | — | 2 full modes | +20 |
| 13 | Adaptive Learning | — | Daily Mission, sessions, StatsMode+ | +25 |
| 14 | Export/Import Refinement | TD-01 | Export diff, import validation, rollback | +20 |
| 15 | FlashcardMode Decomposition | TD-05 | Refactor only | +15 |
| 16 | Exam Countdown + Audio | — | examDate UI, Web Speech | +15 |
| 17 | QA + Release v4.0 | — | Flow tests, SW auto-bump, coverage | +30 |
| **Total** | | | | **~350 tests** |

---

## Appendix B — Key Corpus Citations for SSW Konstruksi

> *Extracted from Nugget Nihongo Research Foundation (743 citations) and SECTION8-PWA-v3 (~145 citations). Most relevant to SSW Konstruksi's design decisions.*

### SRS & Retrieval Practice
- **Kim & Webb (2022)** — meta-analysis, 48 L2 experiments (N=3,411): spaced practice > massed practice for retention. *Justifies FSRS architecture.*
- **Adesope et al. (2017)** — meta-analysis, 217 studies: retrieval practice > restudying (g=0.61). *Justifies active recall in all quiz modes.*
- **Rowland (2014)** — testing effect meta-analysis: g=0.50, grows with retention interval. *Justifies long-interval FSRS scheduling.*
- **Bahrick et al. (1993)** — spacing effect in foreign vocabulary maintenance. *Justifies Phase 16 urgency multiplier in final 2 weeks before exam.*
- **Ye et al. (2022) / Su et al. (2023)** — FSRS algorithm validation (KDD/IEEE TKDE). *Basis for FSRS choice over SM-2.*

### PWA & Mobile Design
- **Japan Foundation (2023)** — 732,914 Indonesian Japanese learners; 183,000 self-study/community = addressable market. *Justifies platform investment.*
- **APJII (2023)** — 95.4% Indonesian internet via smartphone. *Justifies mobile-first PWA architecture.*
- **Haristiani & Rifa'I (2020)** — 78% Indonesian Japanese learners smartphone-exclusive. *Only study specific to our target population.*
- **StatCounter (2024)** — 88.7% Android market share in Indonesia. *Justifies PWA-first distribution.*
- **GSMA Intelligence (2023)** — variable 4G coverage, ~30% users on unreliable connections. *Justifies aggressive offline-first SW caching and Phase 17 auto-bump.*
- **Firtman (2023)** — iOS 16.4+ enables Web Push for PWAs. *Resolves historical iOS PWA limitation.*

### Gamification & Motivation
- **Ryan & Deci (2000)** — Self-Determination Theory: intrinsic motivation requires autonomy, competence, relatedness. *Framework for Daily Mission design (Phase 13).*
- **Mekler et al. (2017)** — individual gamification elements don't improve intrinsic motivation in educational contexts. *Justifies no badge inflation.*
- **Hanus & Fox (2015)** — leaderboards decrease intrinsic motivation over 16 weeks. *Justifies no leaderboard, ever.*
- **Van Roy & Zaman (2018)** — need-supporting gamification improves motivation over time. *Framework for milestone toast design (Phase 11).*
- **Nicholson (2015)** — meaningful gamification must connect to learner's actual goals. *Justifies mission framing around exam preparation, not arbitrary points.*
- **Deci, Koestner & Ryan (1999)** — extrinsic rewards undermine intrinsic motivation for interesting tasks. *Justifies no point/coin economy.*

### Indonesian Learner Psychology
- **Markus & Kitayama (1991)** — interdependent self-construal; Hofstede IDV=14 for Indonesia. *Basis for malu-aware design.*
- **Horwitz, Horwitz & Cope (1986)** — foreign language anxiety: fear of negative evaluation, communication apprehension. *Justifies private progress, no public scoring.*
- **Ushioda (2011)** — autonomy support in L2 motivation. *Basis for dismissable Daily Mission.*

### SSW / Vocational Context
- **Ministry of Health, Labour and Welfare, Japan (2019)** — SSW system overview: JLPT N4 minimum, sector-specific skills test separate from JLPT. *Justifies construction-specific content (Phase 12) alongside JLPT cards.*
- **Immigration Services Agency of Japan (2023)** — construction sector = top 3 SSW destination. *Confirms market demand for Sipil/Bangunan modes.*
- **Kamata & Tanaka (2021)** — construction/care Japanese: vocabulary, scene, and discourse demands distinct from general JLPT. *Justifies domain-specific content, not just general vocabulary.*
- **Noyama (2012)** — N4 passers still report communication difficulties in work settings; functional target = N3. *Justifies exam countdown urgency escalation at N3-level card completion.*

### Pedagogy & Nation's Four Strands
- **Nation (2007)** — Four Strands: effective course balances meaning-focused input, meaning-focused output, language-focused learning, fluency development. *Basis for Phase 13 strand balance detection in Daily Mission.*
- **Pienemann (1998) / Di Biase & Kawaguchi (2002)** — Processability Theory: PT stage sequencing for Japanese morphosyntax. *Framework for grammar card ordering (future N4+ content).*
- **Krashen (1982)** — Comprehensible Input (i+1). *Basis for difficulty scaling in quiz modes.*

---

*Blueprint v4 (polished) authored by Agent Sonnet 4.6 on 2026-05-01.*
*Research layer added from Nugget Nihongo Research Foundation (743 citations) and SECTION8-PWA-v3 corpus.*
*All code-level specifications unchanged from MASTER-BLUEPRINT-v4.md (commit aa041a3).*
*Prior proposal credit: Genspark AI Architect (structural analysis and health scorecard).*
