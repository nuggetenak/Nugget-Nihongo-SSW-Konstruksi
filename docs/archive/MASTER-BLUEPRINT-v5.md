# 🏗️ SSW Konstruksi — Master Blueprint v5 (Corpus-Deepened)

> **Repository:** [`nuggetenak/Nugget-Nihongo-SSW-Konstruksi`](https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi)
> **Current Version:** v3.6.1 (Phase 1–10 RELEASED ✅)
> **Blueprint Author:** Agent Sonnet 4.6 · 2026-05-01 (v4-POLISHED)
> **v5 Author:** Agent Sonnet 4.6 · 2026-05-01 (second corpus read — deeper sections)
> **Supersedes:** MASTER-BLUEPRINT-v4-POLISHED.md
> **Corpus basis:** v4-POLISHED corpus (743 citations) + SECOND PASS: §15 (VS cluster, 26 citations) + §10 (GF/GE/GM/HB/SL/BF clusters, 39 citations) + §12 (OT cluster, output theory) + §13 (ID cluster, 43 citations) + §17 (AL cluster, 11 citations) + §9 (multimedia/DDM) + §18 (synthesis) + DESIGN-DECISION-MASTER-v1 (DDM-P1/P2) + CURRICULUM-BLUEPRINT-v1
> **Status:** 📋 ACTIVE — Approved for Opus 4.6 handoff

---

## ⚡ What's New in v5

v4-POLISHED covered: SRS science, PWA platform evidence, gamification design principles (surface level), malu/face-concern, SSW visa context, Nation's Four Strands, and semantic interleaving.

**v5 adds six new evidence layers** not present in v4-POLISHED:

1. **§0.7 — LSP Framework** (VS cluster): SSW Konstruksi is a Language for Specific Purposes product. Every question must trace to an authentic Target Situation Analysis (TSA) task.
2. **§0.8 — Andragogy** (AL cluster): Knowles's four adult learning principles generate concrete design obligations — including a mandatory SSW workplace relevance signal on every card.
3. **§0.9 — Individual Differences & FLCA** (ID cluster): Language anxiety is a cognitive, not just affective, impairment. Meta-analysis: r = −.33 with performance. Design obligations beyond malu.
4. **§0.10 — Output Hypothesis** (OT cluster): Pushed production is a distinct acquisition mechanism from input. App currently has no production features — documented gap, v5 spec.
5. **§0.11 — Gamification Meta-Analytics** (GF/GE clusters): Bai et al. (2020) g = 0.50 but with strong novelty-decay. Sailer et al. (2017) element-by-element SDT analysis. Habit formation (§10.6) > gamification for long-term retention.
6. **§0.12 — Expertise Reversal Effect & Furigana Policy** (DDM + OD cluster): Showing furigana to advanced users is demonstrably harmful. Level-differentiated furigana is the evidence-based design.

**New C proposals** (C-10 through C-14): Type-answer production mode, SSW relevance signal standard, habit trigger design, growth mindset language, metalinguistic card back standard.

**New Appendix F**: LSP Content Authoring Standard — a per-question checklist for Phase 12 sipil/bangunan content authors.

**New Appendix G**: Andragogy Design Checklist — per-card and per-mode checklist.

All Phase 11–17 specifications are **unchanged** from v4-POLISHED.

---

## 📑 Daftar Isi

0. [Research Foundation](#0-research-foundation)
1. [Architecture Health — Actual State](#1-architecture-health--actual-state)
2. [Confirmed Bugs](#2-confirmed-bugs-fix-before-phase-11)
3. [Technical Debt Register](#3-technical-debt-register)
4. [v5 Vision & Constraints](#4-v5-vision--constraints)
5–11. [Phase 11–17](#5-phase-11--bug-fixes--storage-hardening) *(unchanged from v4-POLISHED)*
12. [Non-Goals](#12-non-goals-explicitly-out-of-scope)
13. [File-by-File Verdict](#13-file-by-file-verdict-verified)
- [Appendix A — Phase Summary Table](#appendix-a--phase-summary-table)
- [Appendix B — Key Corpus Citations](#appendix-b--key-corpus-citations-for-ssw-konstruksi)
- [Appendix C — Research-Driven Design Upgrades](#appendix-c--research-driven-design-upgrades-post-corpus-read)
- [Appendix D — Scope Gaps Not in v4](#appendix-d--scope-gaps-not-in-v4-corpus-identified)
- [Appendix E — Agent Trail](#appendix-e--agent-trail--session-log)
- [Appendix F — LSP Content Authoring Standard](#appendix-f--lsp-content-authoring-standard-phase-12)
- [Appendix G — Andragogy Design Checklist](#appendix-g--andragogy-design-checklist)

---

## 0. Research Foundation

> *Carries forward all §0.1–§0.6 from v4-POLISHED unchanged. New subsections §0.7–§0.12 follow.*

*(§0.1 — Why FSRS: Kim & Webb 2022, Adesope et al. 2017, Rowland 2014, Ye et al. 2022 / §0.2 — Why PWA: Japan Foundation 2023, APJII 2023, Haristiani & Rifa'I 2020, StatCounter 2024, GSMA 2023 / §0.3 — Why No Dark Patterns: Przybylski et al. 2010, Mekler et al. 2017, Hanus & Fox 2015, Deci et al. 1999 / §0.4 — Why Malu-Aware: Markus & Kitayama 1991, Horwitz et al. 1986, Hofstede IDV=14 / §0.5 — Why Phase 12 Priority: MHLW 2019, ISA 2023, Kamata & Tanaka 2021 / §0.6 — Why Four Strands: Nation 2007 — all unchanged from v4-POLISHED.)*

---

### 0.7 — Why SSW Konstruksi Is an LSP Product, Not a Vocabulary App

**Evidence (VS cluster — §15):**

Language for Specific Purposes (LSP) theory establishes that learners preparing for occupational contexts are not engaged in general-language acquisition — they are engaged in purposive, task-justified language preparation. Hutchinson and Waters (1987) **[VS-01]** define this through a three-component needs analysis: **target needs** (what the learner must do in the target situation), **learning needs** (what the learner needs to learn), and the gap between them. This is not an English-language construct — it applies directly to Japanese for Indonesian SSW construction workers.

Long (2005) **[VS-04]** distinguishes three types of needs: **perceived needs** (what stakeholders believe is needed), **felt needs** (learner-reported gaps), and **objective needs** (what authentic task-corpus analysis reveals). The SSW construction sector's formal Japanese requirement (JFT-Basic / JLPT N4) represents perceived needs — the regulatory minimum. Authentic communicative demands on a 土木 or 建築 worksite (reading safety signage, communicating with supervisors about structural specifications, understanding tool orders under time pressure) represent objective needs that are substantially higher than N4.

Dudley-Evans and St John (1998) **[VS-02]** extend this with **Target Situation Analysis (TSA)**: the specific language tasks that occur authentically in the target setting. For construction SSW, the TSA includes: safety briefings (読み聞かせ), tool ordering under noise conditions, reading written work orders (作業指示書), emergency procedures (緊急手順), supervisor corrections during work. **Every question in `sipil-sets.js` and `bangunan-sets.js` must be traceable to a TSA task. Content not justifiable against a TSA belongs in the general vocabulary deck, not the SSW sector deck.**

**Design implication for Phase 12:** Basturkmen (2006) **[VS-03]** distinguishes product-oriented (vocabulary items) from process-oriented (task-based) syllabus design. SSW Konstruksi is unavoidably product-oriented (cards are discrete items), but the *selection criterion* must be process-oriented: does this term appear in authentic construction worksite communication? This operationalizes at the card level as a simple filter: "Would a supervisor or safety officer say this on a construction site?" If no — the card is a vocabulary item, not an SSW construction item.

**Caveat:** Published LSP research for Japanese construction contexts is underresourced relative to care, medical, and business Japanese. The objective TSA for 土木/建築 must be derived from the JAC official materials, JAC textbook chapters, and the existing `jac-official.js` dataset — these are the closest available authentic-task proxies.

---

### 0.8 — Why Andragogy Shapes Every Phase 12 Card

**Evidence (AL cluster — §17):**

Knowles (1980) **[AL-01]** identifies four interlocking assumptions about adult learners that distinguish andragogical from pedagogical design:

1. **Self-directed**: adults prefer to manage their own learning pace and focus
2. **Goal-oriented**: they require an explicit answer to "why does this matter for me now?" before investing effort
3. **Experience-centered**: new material is processed through — and sometimes distorted by — existing schemas
4. **Relevance-oriented**: learning must be immediately applicable to a life role, not deferred to an abstract future

The SSW Konstruksi learner is paradigmatically andragogical: an adult construction worker, managing self-study between shifts, with a specific and time-bound exam goal. The design obligation from AL-01 is not optional — it means **every card must carry an explicit SSW construction workplace relevance signal**. A card that shows 足場 (あしば) → Perancah without context satisfies the vocabulary requirement but fails the andragogical requirement. Adding "Wajib dicek setiap pagi sebelum memanjat — diatur UU K3 Jepang" to the `desc` field satisfies both.

Cross (1981) **[AL-02]** — CAL model: adults engage when learning is immediately useful and situational barriers (time, cost) are low. **The PWA micro-session architecture is not just a UX preference — it is the empirically correct modality for this learner population.** Session-aware mission design (C-05 in v4-POLISHED) aligns directly with Cross's finding that adult learners in occupational contexts average 12–15 minutes of self-directed study before motivational fatigue begins.

Mezirow (1991) **[AL-03]** — transformative learning theory: acquiring a professional language is not additive (adding vocabulary) but transformative — the learner is constructing a new professional identity. **This means card framing matters.** "You as a construction SSW worker using this phrase on a Japanese worksite" is not rhetorical decoration — it reflects how adult professional identity acquisition actually works. The back card description field should frame usage in first-person SSW context where possible.

**Design implication:** Three specific additions to the Phase 12 content authoring standard (see Appendix F):
1. Every `desc` field must include an SSW workplace usage context
2. Every question `exp` field must answer "why you need this on site, not just in the exam"
3. `opts_id` (Indonesian translations of options) must use construction-worker register, not textbook register

---

### 0.9 — Why FLCA Is a Cognitive Problem, Not Just an Emotional One

**Evidence (ID cluster — §13):**

Horwitz, Horwitz and Cope (1986) **[ID-01]** defined Foreign Language Classroom Anxiety (FLCA) as situation-specific anxiety with three components: communication apprehension, test anxiety, and fear of negative evaluation. Aida (1994) **[ID-03]** — the only construct validation of FLCA specifically on Japanese-language learners — confirms FLCA as a significant predictor of final competence, independent of motivation.

**The critical finding for SSW Konstruksi** is MacIntyre and Gardner (1994) **[ID-02]**: FLCA is not merely an emotional state — it imposes measurable cognitive costs. Working memory capacity is partially consumed by self-monitoring worry, input retrieval slows, and recall accuracy declines. Zhang (2019) meta-analysis (95 studies, N=8,712): mean correlation between FLCA and performance is **r = −.33** — a medium-strong effect, consistent across languages, proficiency levels, and age groups.

**Why this matters beyond malu (§0.4):** v4-POLISHED grounds privacy-first design in malu/face-concern (cultural). The ID-cluster adds a second, non-cultural justification: anxiety impairs cognitive processing. Even for learners who do not experience strong face-concern, the cognitive load of public performance monitoring degrades SRS retention. The local-only progress design is justified on two independent grounds — cultural (malu) and cognitive (anxiety-induced WM depletion).

Young (1991) **[ID-05]** identifies three design-actionable interventions for low-anxiety learning environments:
1. Eliminate unnecessary public evaluation (✅ already implemented — no leaderboards, no social comparison)
2. Normalize errors as part of the learning process (⚠️ partially implemented — "Jangan Menyerah!" is correct in direction, but BUG-03 milestone toast has not been wired. When a user gets 5 wrong in a row, no supportive message appears.)
3. Allow adequate preparation time before production (✅ SRS scheduling provides this by definition)

**Design implication for Phase 11 (BUG-03 wire-up):** When wiring milestone toasts, add an *anxiety-reduction* toast for losing streaks. If a user answers 5 consecutive questions wrong (tracked via `useAnswerStreak`), show: "Wajar salah — artinya ini baru untukmu. Coba mode Kartu dulu." This is an evidence-backed intervention (Young 1991), not just encouraging copy.

---

### 0.10 — Why SSW Konstruksi Needs Output Features

**Evidence (OT/KR cluster — §12):**

Swain (1985, 1995) **[KR-09 / OT-01]** — Output Hypothesis: comprehensible input alone is insufficient for full L2 acquisition. **Pushed output** — production that forces the learner beyond their current interlanguage comfort — is a distinct acquisition mechanism with three functions:

1. **Noticing function**: attempting production reveals gaps the learner cannot see from input alone
2. **Hypothesis-testing function**: each production is an implicit hypothesis about grammar; feedback (correct/incorrect) tests it
3. **Metalinguistic function**: producing language forces syntactic, not just semantic, processing

Current SSW Konstruksi study modes — FlashcardMode (receptive: JP→ID), all quiz modes (receptive: choose the correct answer) — are entirely input-side. **The app has zero production features.** Nation's Four Strands (§0.6) requires meaning-focused *output* strand, currently served only by SprintMode (timed recall) — a partial proxy, not genuine production.

Izumi (2002) **[OT-11]** — output practice followed by input significantly outperforms input-only for noticing of target forms. The sequence "attempt production → see feedback → review input" is more effective than "review input" alone. This sequence cannot occur in a purely receptive app.

**Design implication for v5 (new Phase 18 proposal):** ID→JP production mode is the highest-impact unimplemented feature. The schema and data structure already support it (`cards.js` has `jp`, `id_text`, and `furi` fields). Implementation requires:
- A new `ProduksiMode.jsx` that shows `id_text` → user types/selects `jp` reading
- Leniency layer: `furi` (reading only) counts as correct for N5-N4; full `jp` kanji required for N3+
- Corrective feedback on wrong production: show the target form + explanation (C-02 standard applies)

**For v4 scope (Phase 13 Daily Mission):** The Daily Mission engine (§13 of blueprint) should, once every 5 missions, recommend SprintMode as the "output strand" recommendation. This satisfies Four Strands balance (§0.6) without requiring a new mode.

**Caveat:** DeKeyser (1997) **[OT-07]** — proceduralization of declarative knowledge: even with correct production features, extended practice is required before production knowledge becomes automatic. Adding a production mode solves the input/output imbalance but does not guarantee rapid automatization. User expectations should be calibrated: production is hard, errors are normal, improvement is gradual.

---

### 0.11 — Why Habit Formation Matters More Than Gamification Long-Term

**Evidence (GF/GE/HB/BF clusters — §10):**

Bai, Hew, and Huang (2020) — most rigorous meta-analysis of educational gamification (45 studies): pooled effect **g = 0.50** on learning outcomes. Critical moderator: **short-term (< 4 weeks) g = 0.68, long-term g = 0.35**. The novelty effect is real and documented. For SSW exam preparation (60–90 day typical preparation window), gamification cannot be the primary retention mechanism — the novelty effect decays within 2–3 weeks.

Sailer et al. (2017) — the only experimental study examining specific gamification elements individually on SDT needs:
- **Progress visualization** (progress bar, ring) → satisfies competence + autonomy → evidence-backed ✅ (ProgressRing already implemented)
- **Badges** → satisfies competence only → acceptable if milestone-gated (not trivial) ✅ (milestone toasts in Phase 11)
- **Leaderboards** → positive for top-ranked, **negative for lower-ranked** → contraindicated ❌ (already excluded)
- **Points/coins** → no evidence of SDT satisfaction without social comparison context → neutral to negative ❌ (correctly excluded)

**Habit formation is the long-term mechanism (Fogg 2009, Clear 2018 — §10.6 HB/BF clusters):**

BJ Fogg's Behavior Model: `B = MAP` — Behavior occurs when Motivation, Ability, and Prompt (trigger) converge at the same moment. The Daily Mission (Phase 13) is the **Prompt** component. Reducing app load time (Ability) and maintaining intrinsic motivation through need-satisfying design (Motivation) complete the triad.

Clear (2018) — Atomic Habits — the **habit loop**: cue → craving → response → reward. For SSW Konstruksi:
- Cue = Daily Mission notification / app icon
- Craving = wanting to see today's mission complete / streak maintained
- Response = opening app and studying
- Reward = Daily count increment + mission complete animation

**Critical insight from §10.6:** The reward must be *immediate* and *satisfying* — not deferred (no "study now to unlock content later"). The toast after completing a mission must fire immediately. The progress ring fill animation must be visible immediately. Deferred rewards undermine the habit loop.

**Design implication for Phase 13 (Daily Mission):** Add a `completedAt` timestamp to mission state. When `completedAt` is set, show a full-screen "Misi Selesai! 🎉" overlay that fades after 1.5 seconds — not just a toast. This is the reward component of the habit loop. One second of celebration is evidence-backed, not gratuitous.

---

### 0.12 — Why Furigana Must Be Level-Differentiated

**Evidence (DDM + OD cluster — §9 + Design Decision Master):**

Kalyuga (2007) **[CL-07]** — Expertise Reversal Effect: scaffolding that aids novices becomes extraneous cognitive load for experts, actively harming performance. Furigana is scaffolding for kanji readings.

Chikamatsu (2006) **[OD-13]** — romanization dependency: learners who consistently see readings alongside kanji develop a processing dependency that measurably slows kanji recognition development. The same applies to furigana — always-visible furigana trains learners to read the furigana *instead of* developing kanji recognition.

**Design Decision Master (DDM-P1-003) recommendation:**

| Level | Furigana on Card Front | Furigana on Card Back |
|-------|------------------------|----------------------|
| N5–N4 (beginner) | ✅ Always visible | ✅ Always visible |
| N3 (intermediate) | ⚠️ Tap-to-reveal | ✅ Visible |
| N2–N1 (advanced) | ❌ Hidden by default | ⚠️ Tap-to-reveal |

**Current state in SSW Konstruksi:** Furigana is always visible via `JpDisplay.jsx`. The current user base is N5-N4 (SSW construction exam targets N4 proficiency) — so this is *not a current bug*, but it becomes one when users progress. The `prefs` system already supports future level tracking.

**Design implication for Phase 15 (FlashcardMode decomposition):** Add `furiganaPolicy: 'always' | 'tap' | 'hidden'` to `prefs` (add in Phase 11 schema v3). Default: `'always'` (correct for N5-N4 SSW learners). `JpDisplay.jsx` already accepts an `onSpeak` prop — add `furiganaPolicy` prop in Phase 15. SayaTab settings: "Furigana: Selalu / Tap / Tersembunyi" with a one-line explanation. This is a power-user setting; the default is correct for the primary user and requires zero migration.

---

## 1. Architecture Health — Actual State

*(Unchanged from v4-POLISHED — full scorecard in that document.)*

Summary: Architecture A−, SRS Engine A, CSS/Styling B+, A11y B+, Performance A−, PWA A−, Tests B+, DX A, **Content C+ (Sipil/Bangunan stubs)**, Export/Import B−, Analytics D.

---

## 2. Confirmed Bugs (Fix Before Phase 11)

*(Unchanged from v4-POLISHED — BUG-01/02/03 with BUG-02.5 addition:)*

### BUG-02.5 — No Anxiety-Reduction Toast on Wrong Streaks (NEW in v5)
**Evidence basis:** Young (1991) **[ID-05]** — normalizing errors is an evidence-based low-anxiety intervention.
**Symptom:** When `useAnswerStreak` returns −3 or lower (3+ consecutive wrong answers), no supportive message appears. User is silently penalized by session flow continuing without acknowledgment.
**Fix (alongside BUG-03 milestone toast wiring):** In `App.jsx`, watch `answerStreak` from `QuizShell` result. If `consecutive_wrong >= 5` → toast: `"Banyak salah? Wajar — artinya materi ini masih baru. Coba mode Kartu dulu 💪"`. This is *not* a streak reset — it is a low-anxiety reframe. Duration: 4s (longer than standard 2s — user needs time to read it).

---

## 3. Technical Debt Register

*(Unchanged from v4-POLISHED — TD-01 through TD-08. Adding:)*

### TD-09 — Card `desc` Field: Missing SSW Workplace Context (MEDIUM — Phase 12)
**Evidence basis:** AL-01, AL-02, AL-03 (Andragogy cluster)
**Issue:** Many `desc` fields in `cards.js` are encyclopedia-style definitions ("Batang yang digunakan untuk menghubungkan struktur...") rather than andragogically grounded workplace-context descriptions. Adult learners require immediate relevance signals, not definitions. Phase 12 content authoring (sipil/bangunan) must not repeat this pattern. Backfill of existing `cards.js` entries is a v5+ content task.

### TD-10 — Furigana Always-Visible Regardless of User Level (LOW — Phase 15)
**Evidence basis:** DDM-P1-003, Kalyuga 2007, Chikamatsu 2006
**Issue:** `prefs` has no `furiganaPolicy` field; `JpDisplay.jsx` always renders furigana. Not a bug for the current N5-N4 user base, but a design debt for progressing users.

---

## 4. v5 Vision & Constraints

*(All §4.1–§4.3 constraints from v4-POLISHED unchanged.)*

### 4.4 — New Evidence-Based Constraints (v5 additions)

**EC-01 — LSP Content Standard (Phase 12):** No question enters `sipil-sets.js` or `bangunan-sets.js` without a traceable TSA justification. "This term appears in JAC Chapter X, which describes authentic on-site tasks" is sufficient. "This is a common Japanese word" is not.

**EC-02 — Andragogy Card Standard (Phase 12):** Every `desc` field in new content must include an SSW workplace context sentence framing usage from the learner's perspective as a Japanese construction worker. Textbook-definition-only descriptions fail the andragogical standard.

**EC-03 — Metalinguistic Feedback Standard (Phase 12, extends C-02):** Every `exp` (explanation) field in quiz questions must include: (a) why the correct answer is correct, (b) the most common wrong answer and why it's wrong. Showing only the correct answer is a recast — the lowest-uptake feedback type (Lyster & Ranta 1997 EA-14).

**EC-04 — No Production Regression:** Any future mode or feature must not reduce or remove SprintMode (the only production-adjacent mode). The output strand is currently underweight — do not further reduce it.

---

## 5. Phase 11 — Bug Fixes & Storage Hardening

*(Identical to v4-POLISHED §5, with one addition:)*

### 11.10 — Anxiety-Reduction Toast (BUG-02.5)
- `QuizShell.jsx`: track consecutive wrong count in `useRef`; pass back via `onFinish({ correct, total, maxConsecutiveWrong })`
- `App.jsx`: if `maxConsecutiveWrong >= 5` → `toast.show('Banyak salah? Wajar...', { duration: 4000 })`
- Test: `quiz.anxiety-toast.test.jsx` — verify toast appears on 5 consecutive wrongs, does not appear on <5

---

## 6. Phase 12 — Content: Sipil & Bangunan Tracks

*(Identical to v4-POLISHED §6, with significant additions to content authoring standard — see Appendix F for the full per-question checklist.)*

### 12.6 — LSP Content Authoring Protocol (NEW in v5)

Before writing any question for `sipil-sets.js` or `bangunan-sets.js`, the content author must run the LSP filter:

**Filter Question 1 (TSA check):** "In what specific on-site scenario would a Japanese supervisor use or expect to hear this term?" If the answer is "in a textbook" rather than "on site," reconsider inclusion.

**Filter Question 2 (Objective needs check):** "Does a construction SSW worker need to recognize this term for safety, communication, or compliance?" If yes → include. If the term is culturally interesting but not occupationally critical → general deck.

**Filter Question 3 (Metalinguistic standard):** Does the `exp` field contain: (a) explicit reason the correct answer is correct, (b) the most probable error an Indonesian speaker would make and why? If not → add before committing.

**Domain vocabulary (expanded from v4-POLISHED §12.1):**

| 土木 (Sipil) domain | 建築 (Bangunan) domain |
|---------------------|------------------------|
| 掘削 (penggalian) | 基礎 (pondasi) |
| 土留め (penahan tanah) | 躯体 (struktur utama) |
| 切梁 (strut/penopang) | 型枠 (bekisting/formwork) |
| 法面 (lereng galian) | 鉄筋 (besi tulangan) |
| 盛土 (timbunan) | コンクリート (beton) |
| 転圧 (pemadatan) | 防水 (waterproofing) |
| 舗装 (perkerasan jalan) | 断熱 (insulasi termal) |
| 排水 (drainase) | 仕上げ (finishing) |
| 測量 (survei/pengukuran) | 内装 (interior) |
| 地盤改良 (perbaikan tanah) | 外壁 (dinding luar) |
| 安全帯 (harness keselamatan) | 足場 (perancah) |
| 墜落防止 (pencegahan jatuh) | 型枠支保工 (sistem bekisting) |

**Semantic interleaving (C-01 applies):** Each set of 10 questions must sample at least 3 different semantic domains (e.g. not all 土留め questions in one set). This is evidence-based (Tinkham 1997, Erten & Tekin 2008) and required for `sipil-sets.js` authoring.

---

## 7–11. Phase 13–17

*(Identical to v4-POLISHED §7–§11. Key v5 additions to Phase 13:)*

### Phase 13 addendum — Habit Loop Completion (§0.11)

Add to `daily-mission.js`: `completedAt` field in `progress.dailyMission`. When mission completes, set `completedAt = Date.now()`.

Add to `Dashboard.jsx`: if `completedAt` is set today → show "Misi Selesai! 🎉" overlay for 1.5 seconds (CSS fade-out, not blocking). This is the **reward** component of the habit loop (Clear 2018 — §10.6). Toast is insufficient — the reward signal must be emotionally salient.

```jsx
// In Dashboard.jsx, after mission status check:
const missionDoneToday = mission?.completedAt &&
  new Date(mission.completedAt).toDateString() === new Date().toDateString();

{missionDoneToday && <MissionCompleteOverlay />}
```

---

## 12. Non-Goals

*(Identical to v4-POLISHED §12, with addition:)*

| Feature | Decision | Research basis | Revisit |
|---|---|---|---|
| All existing non-goals from v4-POLISHED | (unchanged) | | |
| Full VLT placement assessment | ❌ Out of v5. C-04 10-item placement still valid. | Nation VLT requires curated level wordlists; SSW domain words are not in standard VLT lists | v6 with domain-specific wordlist |
| Confusion pair mode (ConfusionMode) | ❌ Out of v5. Schema prepared in Phase 11. | C-06 in v4-POLISHED — content authoring bottleneck | v6 |
| Production mode (ID→JP) | ❌ Out of v5 scope. Documented as Phase 18 proposal. | Swain 1985, Izumi 2002 — high-value, high-effort. Phase 11–17 is sufficient for v4 release. | v5/Phase 18 planning |

---

## 13. File-by-File Verdict (Verified)

*(Identical to v4-POLISHED §13, with the following additions/updates:)*

| File | v5 Note |
|---|---|
| `src/styles/theme.js` | Add `furiganaPolicy` default to prefs schema (Phase 11) |
| `src/components/JpDisplay.jsx` | Add `furiganaPolicy` prop in Phase 15 |
| `src/data/sipil-sets.js` | 🆕 Phase 12 — all questions must pass LSP filter (Appendix F) |
| `src/data/bangunan-sets.js` | 🆕 Phase 12 — same standard |
| `src/components/Dashboard.jsx` | Phase 13: add MissionCompleteOverlay (habit loop reward) |
| `src/hooks/useAnswerStreak.js` | (renamed from useStreak per TD-04) — expose `consecutiveWrong` count |

---

## Appendix A — Phase Summary Table

*(Identical to v4-POLISHED Appendix A.)*

| Phase | Name | Tests Added |
|---|---|---|
| 11 | Bug Fixes & Storage Hardening | +30 (+3 for BUG-02.5) |
| 12 | Content: Sipil & Bangunan | +25 (LSP filter adds validation tests) |
| 13 | Adaptive Learning | +28 (habit loop overlay, strand balance) |
| 14 | Export/Import Refinement | +20 |
| 15 | FlashcardMode Decomposition | +20 (furiganaPolicy prop) |
| 16 | Exam Countdown + Audio | +15 |
| 17 | QA + Release v4.0 | +30 |
| **Total** | | **~370 tests** |

---

## Appendix B — Key Corpus Citations for SSW Konstruksi

*(Carries forward all citations from v4-POLISHED Appendix B. NEW additions:)*

### LSP & SSW Context (VS cluster — §15)
- **Hutchinson & Waters (1987)** — LSP foundational framework: needs analysis (target, learning, gap). *Justifies treating SSW Konstruksi as an LSP product, not a vocabulary app.*
- **Dudley-Evans & St John (1998)** — Target Situation Analysis (TSA): distinguishes TSA, PSA, LSA. *Basis for EC-01 LSP content standard.*
- **Basturkmen (2006)** — LSP syllabus design: product vs process orientation. *Justifies process-oriented selection criteria on a product-oriented platform.*
- **Long (2005)** — Objective vs perceived vs felt needs. *Establishes that JLPT N4 is a regulatory minimum, not an authentic communicative target.*

### Adult Learning (AL cluster — §17)
- **Knowles (1980)** — Andragogy: four adult learner assumptions. *Justifies SSW workplace relevance signal on every card (EC-02).*
- **Cross (1981)** — CAL model: occupational advancement + micro-session modality. *Validates PWA micro-session as the empirically correct modality.*
- **Mezirow (1991)** — Transformative learning: professional identity acquisition. *Justifies first-person SSW framing in card descriptions.*

### Individual Differences & FLCA (ID cluster — §13)
- **Horwitz, Horwitz & Cope (1986) [ID-01]** — FLCA as situation-specific anxiety (three components). *Foundational.*
- **MacIntyre & Gardner (1994) [ID-02]** — FLCA impairs cognitive processing speed and recall. *Cognitive, not just affective, justification for anxiety-aware design.*
- **Aida (1994) [ID-03]** — FLCA validation specifically for Japanese-language learners. *Only source validating FLCA in our exact target domain.*
- **Zhang (2019)** — meta-analysis (95 studies, N=8,712): FLCA–performance correlation r = −.33. *Quantifies the cognitive cost of anxiety.*
- **Young (1991) [ID-05]** — three design-actionable low-anxiety interventions. *Basis for BUG-02.5 anxiety-reduction toast.*

### Output & Production (OT/KR cluster — §12)
- **Swain (1985, 1995) [KR-09 / OT-01]** — Output Hypothesis: three functions of pushed output (noticing, hypothesis-testing, metalinguistic). *Justifies Phase 18 production mode proposal.*
- **Izumi (2002) [OT-11]** — output → input sequence outperforms input-only for noticing. *Specific acquisition benefit of production features.*
- **DeKeyser (1997) [OT-07]** — proceduralization takes extended practice. *Calibrates user expectations on production features.*

### Gamification Meta-Analytics (GF/GE clusters — §10)
- **Bai, Hew & Huang (2020)** — educational gamification meta-analysis (45 studies): g=0.50 overall, g=0.68 short-term, g=0.35 long-term. *Documents novelty-decay; habit formation is the long-term mechanism.*
- **Sailer et al. (2017)** — SDT needs by gamification element: progress visualization → competence + autonomy; badges → competence; leaderboards → negative for lower-ranked. *Justifies ProgressRing and milestone badges; confirms no leaderboard.*
- **Fogg (2009) / Clear (2018)** — Behavior Model + habit loop: cue → craving → response → reward. *Basis for Phase 13 MissionCompleteOverlay (habit loop reward).*

### Multimedia & Furigana Policy (OD/CL cluster — §9 + DDM)
- **Kalyuga (2007) [CL-07]** — Expertise Reversal Effect: scaffolding becomes extraneous load at higher proficiency. *Justifies level-differentiated furigana policy (§0.12, TD-10).*
- **Chikamatsu (2006) [OD-13]** — romanization/furigana dependency slows kanji recognition. *Specific empirical justification for furigana reduction at N3+.*

---

## Appendix C — Research-Driven Design Upgrades (Post-Corpus Read)

*(Carries forward C-01 through C-09 from v4-POLISHED unchanged. New proposals:)*

---

### C-10 — Type-Answer Production Mode (Phase 18 / SprintMode enhancement)

**Research basis:** Adesope et al. (2017) — short-answer retrieval (g=0.78) significantly outperforms multiple-choice (g=0.43). Lyster (2004) — prompts that elicit self-repair outperform recasts for morphosyntactic targets. DDM-P1-001: card front must prompt active retrieval, not passive recognition, for morphosyntactic targets.

**Current state:** All quiz modes are multiple-choice (recognition). Recognition practice has g=0.43 vs production practice g=0.78. The gap is substantial.

**Proposed implementation (Phase 18 — `SprintMode` enhancement):**

```jsx
// In SprintMode.jsx, add a "Produksi" toggle:
// Off (default): shows ID → select JP option (multiple choice, current behavior)
// On: shows ID → type JP reading in romaji or hiragana
// Romaji-to-kana conversion via existing jp-helpers.js (check availability)
// Leniency: any valid reading of the target term counts as correct

const [productionMode, setProductionMode] = useState(false);
```

**Why SprintMode, not a new mode:** SprintMode already has time pressure and a minimal UI. Adding a toggle is additive, not restructuring. The timed production format (type before time runs out) is the closest available approximation to authentic workplace communication pressure.

**Note:** This is explicitly a Phase 18 feature — not Phase 11–17 scope. Document here so the SprintMode decomposition in Phase 15 does not inadvertently close the door.

---

### C-11 — SSW Workplace Relevance Signal (Phase 12 Content Standard)

**Research basis:** Knowles (1980) AL-01 — adults require "why does this matter for me now?" before investing effort. Mezirow (1991) AL-03 — cards should frame the learner as an active professional in the target context, not a passive student.

**Current state:** Many `desc` fields in `cards.js` are dictionary-style. Example: `"Batang besi yang ditanam ke dalam tanah untuk menghubungkan konduktor ke bumi"`. This satisfies the definition requirement but fails the andragogical standard.

**Required format for Phase 12 content (`sipil-sets.js` and `bangunan-sets.js`):**

```js
// BEFORE (dictionary style — fails andragogy):
desc: 'Perancah sementara untuk bekerja di ketinggian.'

// AFTER (andragogical style — satisfies AL-01, AL-03):
desc: 'Perancah sementara dari baja/kayu untuk bekerja di ketinggian. ' +
      'Sebagai pekerja SSW: kamu WAJIB mengecek kondisinya setiap pagi ' +
      'sebelum naik — diatur UU K3 (労働安全衛生法) Jepang. ' +
      'Atasan akan tanya: 足場の点検、しましたか？'
```

Three mandatory components:
1. **What it is** (definition, 1 sentence)
2. **What you do with it on site** (task context, 1 sentence)
3. **What the supervisor says/asks** (authentic dialogue fragment, 1 sentence)

The authentic dialogue fragment is the implementation of Mezirow's transformative learning — it places the learner *in* the professional context, not *studying about* it.

---

### C-12 — Habit Trigger Design in Daily Mission (Phase 13 enhancement)

**Research basis:** Fogg (2009) — Behavior Model: `B = MAP`. Behavior = Motivation × Ability × Prompt. The Daily Mission is the Prompt. Clear (2018) — habit stacking: anchor a new habit to an existing one ("After I [existing habit], I will [new habit]").

**Current Daily Mission spec (v4-POLISHED §13.2):** Shows mission card in Dashboard with a countdown to midnight. This is a Prompt, but it is not *anchored* to an existing behavior.

**Proposed enhancement — Optional "Waktu Belajarku" setting:**

```jsx
// Add to SayaTab settings:
// "Kapan biasanya kamu belajar?"
// [Pagi-pagi sebelum kerja | Istirahat makan siang | Malam setelah makan]
// → prefs.studyAnchor: 'morning' | 'lunch' | 'evening' | null

// Dashboard shows contextual reminder text based on anchor:
// morning: "Waktu sarapanmu — ada 5 menit untuk 10 kartu?"
// lunch: "Istirahat siang — sempat 8 kartu SRS?"  
// evening: "Sudah makan malam? Mulai misi hari ini 🌙"
```

**Why this works:** Habit stacking (Clear 2018) — linking the study habit to an existing anchor (sarapan, makan siang) dramatically increases compliance vs a floating time-agnostic prompt. The Fogg Behavior Model predicts that Ability (low friction) and Prompt (timely, contextual) are more actionable than Motivation (which fluctuates). This is a 15-line addition to `SayaTab.jsx` + 5 lines to `Dashboard.jsx`.

---

### C-13 — Growth Mindset Language in Result Screens and Toasts (Phase 11/Phase 13)

**Research basis:** Dweck (2006) — growth vs fixed mindset: framing error as "not yet" rather than failure preserves intrinsic motivation and persistence. Dweck & Leggett (1988) — mastery goal orientation (improve through effort) vs performance goal orientation (look good). ID-cluster [ID-33 through ID-37] — mindset moderates response to failure feedback.

**Current state:** Result screen Path B (< 50% score) shows "Jangan Menyerah!" — correct direction, but generic encouragement. BUG-03 milestone toasts not yet wired.

**Proposed language upgrades:**

| Context | Current | Proposed (Growth Mindset) | Basis |
|---|---|---|---|
| < 50% result | "Jangan Menyerah!" | "Belum. Tapi kamu sudah tahu apa yang perlu dipelajari." | Dweck 2006 "not yet" framing |
| 5 wrong streak | (none — BUG-02.5) | "Banyak salah? Artinya kamu sedang belajar sesuatu yang baru." | Young 1991 error normalization |
| First quiz attempt | (none) | "Percobaan pertama — gunakan hasilnya untuk tahu fokus belajarmu." | Mastery goal orientation |
| SRS card lapses (4+ lapses) | "Lagi" button only | Add dim text: "Sudah 4x lupa — ini adalah kartu yang paling berharga." | Izumi 2002 — forgetting reveals gaps |

**Implementation note:** All four are string constants in `ResultScreen.jsx`, `QuizShell.jsx`, and `App.jsx`. Zero architectural change — pure copy improvement with evidence-backed rationale.

---

### C-14 — Card Front: Signaling for Sentence-Context Questions (Phase 12)

**Research basis:** De Koning et al. (2009) — signaling/cueing effect: typographically distinguishing target elements in complex displays increases recall (d ≈ 0.46). DDM-P1-004: target word must be bold or color-highlighted when embedded in a sentence-format question.

**Current state:** JAC Official questions (`jac-official.js`) sometimes embed the target term in a full sentence: "安全帯は___に取り付けて使用する。" The target blank (`___`) is already implicit signaling. Quiz option buttons show 4 choices without visual emphasis on the correct level of processing needed.

**Proposed for Phase 12 questions:** When a question has the target term embedded in a sentence and the options are all single terms (not full sentences), add a subtle hint line: `hint: "Pilih kata yang tepat untuk melengkapi kalimat ini"`. This is a low-cost signaling cue that directs attentional resources to the correct processing level (lexical selection, not sentence interpretation).

**For `QuizShell.jsx`:** If `question.hint` is set, show below the question in muted caption-size text. Already implemented for some modes — standardize.

---

## Appendix D — Scope Gaps Not in v4 (Corpus-Identified)

*(Carries forward D-01 through D-03 from v4-POLISHED unchanged. New:)*

### D-04 — High Variability Phonetic Training for Audio (Phase 16 refinement)

**Source:** §11 (PH cluster — Speech Learning Model + HVPT)

Flege (1995) — Speech Learning Model: phonetically *similar* L2 sounds (Japanese long/short vowel distinction: おばさん vs おばあさん; geminate consonants: きて vs きって) are harder to acquire than phonetically dissimilar ones, because the similar-but-different feature is assimilated into an existing L1 category rather than forming a new one. For Indonesian speakers, the mora-timing contrast is precisely this type: Indonesian syllable timing does not predict Japanese mora timing, and the distinction is subtle enough to be systematically missed.

Logan et al. (1991) — High Variability Phonetic Training (HVPT): exposure to high variability in talker, rate, and context produces more robust L2 phonological categories than exposure to single-speaker, single-rate input. HVPT is the only phonological training paradigm with robust empirical support for L2 phonological acquisition.

**Phase 16 implication for `speak.js`:** Web Speech API uses the device's TTS engine — typically a single voice at a single rate. This is low-variability input by definition. To partially compensate, add a "Variasi" option that alternates pitch (male-range: pitch=0.85, female-range: pitch=1.15) and rate (0.70 / 0.80 / 0.90) across consecutive playbacks. Three presses of 🔊 = three variations. This is a 5-line change to `speakJP()` and is a closer approximation to HVPT than single-rate single-pitch audio.

```js
let _playCount = 0;
const HVPT_PARAMS = [
  { rate: 0.70, pitch: 0.85 },  // slow, lower
  { rate: 0.80, pitch: 1.0  },  // standard
  { rate: 0.90, pitch: 1.15 },  // natural pace, higher
];

export function speakJP(text) {
  const params = HVPT_PARAMS[_playCount++ % 3];
  // ... use params.rate, params.pitch
}
```

### D-05 — Working Memory Constraints in Quiz Design

**Source:** §13.3 (ID cluster — working memory)

Baddeley (1986, 2000) — Working Memory Model. Individual working memory capacity (measured by operation span, reading span) is one of the strongest predictors of L2 vocabulary acquisition rate (Masoura & Gathercole 1999). Indonesian SSW construction learners — adults managing full-time work + self-study — are likely to be in cognitively depleted states (post-shift fatigue) for a significant portion of their study sessions.

**Design implication (v6 consideration):** Session-aware difficulty scaling. If `session.durationMs < 5min AND session.correct/session.total < 0.5` → the next mission recommendation should prioritize short-exposure modes (Sprint, Kartu) over high-working-memory modes (Simulasi with long questions, JAC with complex sentence stems). This is a refinement to the session-length awareness in C-05 (v4-POLISHED) — adding accuracy as a second signal for WM-depletion detection.

---

## Appendix E — Agent Trail & Session Log

*(Carries forward Session 2026-05-01 Agent Sonnet 4.6 from v4-POLISHED unchanged.)*

### Session: 2026-05-01 — Agent Sonnet 4.6 (Second Pass / v5)

**Session type:** Blueprint v5 — deeper corpus read beyond v4-POLISHED
**Additional files read from corpus (`nugget-nihongo/corpus/v17-pass15`):**
- `corpus/sections/SECTION15-SSW.md` — VSP cluster (26 citations) — full read
- `corpus/sections/SECTION10-GAMIFICATION-HABIT.md` — GF/GE/GM/HB/SL/BF clusters (39 citations) — §10.1–§10.3 + habit formation
- `corpus/sections/SECTION12-OUTPUT-THEORY.md` — OT cluster — §12.1 full + §12.4–12.5
- `corpus/sections/SECTION13-INDIVIDUAL-DIFFS.md` — ID cluster (43 citations) — §13.1 FLCA full
- `corpus/sections/SECTION17-ADULT.md` — AL cluster — AL-01, AL-02, AL-03
- `corpus/sections/SECTION11-PHONOLOGY.md` — PH cluster — §11.1 SLM, §11.5 HVPT
- `corpus/sections/synthesis/SECTION18-SYNTHESIS-v1.md` — §18.0–18.1 (overview model)
- `blueprint/DESIGN-DECISION-MASTER-v1.md` — DDM-P1-NNN (card front/back design decisions)

**Files written to `Nugget-Nihongo-SSW-Konstruksi`:**
- `docs/MASTER-BLUEPRINT-v5.md` — this document

**Key decisions made this session:**
1. Preserved all Phase 11–17 code specs from v4-POLISHED unchanged
2. Added §0.7–§0.12 (LSP, Andragogy, FLCA, Output, Gamification analytics, Furigana policy)
3. Added C-10 through C-14 upgrade proposals
4. Added D-04 (HVPT for audio), D-05 (WM constraints)
5. Added Appendix F (LSP Content Authoring Standard) and Appendix G (Andragogy Checklist)
6. Added BUG-02.5 (anxiety-reduction toast — Young 1991)
7. Added EC-01 through EC-04 evidence-based constraints
8. Added TD-09 and TD-10 new debt items

**What I did NOT change:**
- Phase 11–17 implementation specs (any change risks destabilizing the handoff)
- Appendix A phase summary (only minor test count additions)
- File verdicts (only added 6 rows to the table)

**Confidence assessment (new proposals):**
- C-10 (type-answer): HIGH evidence, LOW feasibility in v4 — correctly deferred to Phase 18
- C-11 (SSW relevance signal): HIGH evidence (Knowles, Mezirow), HIGH feasibility — 3 sentences per card
- C-12 (habit trigger): HIGH evidence (Fogg, Clear), HIGH feasibility — 15 lines of code
- C-13 (growth mindset language): HIGH evidence (Dweck), TRIVIAL feasibility — string changes
- C-14 (signaling): MEDIUM evidence, LOW feasibility impact — minor UX polish
- D-04 (HVPT audio): MEDIUM evidence (HVPT research strong, TTS approximation is weak), LOW-MEDIUM feasibility
- D-05 (WM constraints): MEDIUM evidence, LOW-MEDIUM feasibility — v6

**Handoff note for Opus 4.6:**
- v5 adds substantial new evidence but no new phases — start at Phase 11 as before
- **Highest-ROI new additions to incorporate immediately:**
  1. C-13 (growth mindset language) — trivial to implement, high learner wellbeing impact
  2. C-12 (habit trigger / study anchor) — 15 lines, significant retention impact
  3. BUG-02.5 (anxiety-reduction toast) — ~10 lines, grounded in meta-analysis r=−.33
  4. C-11 (SSW relevance signal) — content authoring standard for Phase 12
- **LSP filter (Appendix F) must be run on every Phase 12 question** — this is non-negotiable
- Appendix B citations are all corpus-verified against the v17-pass15 bibliography

---

## Appendix F — LSP Content Authoring Standard (Phase 12)

> *Per-question checklist for every entry in `sipil-sets.js` and `bangunan-sets.js`. Run before committing.*

### Per-Question Checklist

```
QUESTION: [ paste question here ]

□ F1 — TSA JUSTIFICATION
   In what specific on-site scenario would a supervisor/coworker say this?
   Answer: ___________________________
   If answer is "only in a textbook" → REJECT or move to general deck.

□ F2 — OBJECTIVE NEEDS CHECK
   Is this term required for: (a) safety, (b) task communication, or (c) regulatory compliance?
   [ ] Safety (安全)
   [ ] Task communication (作業指示)
   [ ] Regulatory compliance (法規・規則)
   If none → REJECT or move to general deck.

□ F3 — METALINGUISTIC EXPLANATION (exp field)
   Does `exp` contain:
   [ ] Why the correct answer is correct (not just "correct answer is B")
   [ ] The most probable wrong answer for an Indonesian speaker and why
   If both not present → ADD before commit.

□ F4 — ANDRAGOGICAL desc FIELD
   Does `desc` contain:
   [ ] What it is (1 sentence)
   [ ] What you do with it on site / what happens if you get it wrong (1 sentence)
   [ ] Authentic supervisor dialogue or question (1 sentence)
   If any missing → ADD before commit.

□ F5 — SEMANTIC INTERLEAVE CHECK
   Are there already 3 consecutive questions in this set from the same semantic domain?
   [ ] No → OK to add
   [ ] Yes → INSERT this question earlier or later to break the cluster.

□ F6 — ANSWER INDEX CHECK
   Is `ans` 0-based and pointing to the correct option in `opts[]`?
   [ ] Verified
   (Common data entry error — always verify.)

□ F7 — OPTIONS LANGUAGE REGISTER
   Are `opts_id[]` translations using construction-worker register (not textbook)?
   [ ] Yes — "dikaitkan di titik jangkar" not "dihubungkan pada lokasi tambatan"
```

### Domain Approval Table

| Domain | Target Set Count | Minimum Questions per Set | TSA Sources Available |
|--------|-----------------|--------------------------|----------------------|
| 土木 (Sipil) | 3 sets | 15 questions each | JAC textbook Ch.3–5, `jac-official.js` 実技 questions |
| 建築 (Bangunan) | 3 sets | 15 questions each | JAC textbook Ch.6–8, `jac-official.js` 実技 questions |

### Rejected Terms Register

*(Maintain this list to prevent duplicate rejection decisions)*

| Term | Reason for Rejection | Destination |
|---|---|---|
| (example) 美しい建物 | Aesthetic, not occupational | General deck |
| (example) 建設業の歴史 | Historical, not TSA-traceable | General deck or SumberMode |

---

## Appendix G — Andragogy Design Checklist

> *For any new content (Phase 12) or new mode (Phase 13+). Grounded in AL-01, AL-02, AL-03.*

### For Each New Card (`desc` field)

```
□ G1 — GOAL ORIENTATION (AL-01 principle 2)
   Does the card make clear why this term matters for the learner's SSW goal?
   Test: Can the learner answer "why do I need this word?" after reading the desc?

□ G2 — RELEVANCE (AL-01 principle 4)
   Is the content immediately applicable to a construction worksite?
   Not: "this word may be useful someday"
   Yes: "your supervisor will ask this during the morning safety briefing"

□ G3 — EXPERIENCE-CENTERED (AL-01 principle 3)
   Does the desc activate existing Indonesian construction knowledge?
   Example: "Seperti 'bekisting' dalam konstruksi Indonesia, tapi sistem-nya berbeda"

□ G4 — PROFESSIONAL IDENTITY (AL-03)
   Is the learner positioned as an SSW worker, not as a student?
   Not: "この単語を覚えましょう"
   Yes: "Sebagai pekerja bangunan SSW, kamu akan sering dengar ini dari mandor"
```

### For Each New Mode

```
□ G5 — SELF-DIRECTION (AL-01 principle 1)
   Does the mode give learners control over: (a) session length, (b) content filter?
   If not — add exit-any-time + count selector before launch.

□ G6 — MICRO-SESSION FRIENDLY (AL-02 CAL model)
   Can a user complete a meaningful session in under 5 minutes?
   If no — add a "mini mode" option (5-card/5-question subset).

□ G7 — IMMEDIATE FEEDBACK (AL-01 + Fogg Behavior Model)
   Does every interaction produce visible feedback within 100ms?
   If not — fix before phase ships.
```

---

*Blueprint v5 (corpus-deepened, third agent pass) — Agent Sonnet 4.6 · 2026-05-01*
*Second corpus read: §15 (VS), §10 (GF/GE/HB), §12 (OT), §13 (ID), §17 (AL), §11 (PH), §18 synthesis, DESIGN-DECISION-MASTER-v1*
*Delta from v4-POLISHED: +6 §0 subsections, +5 C proposals (C-10–C-14), +2 D gaps (D-04, D-05), Appendix F (LSP Standard), Appendix G (Andragogy Checklist), BUG-02.5, EC-01–EC-04, TD-09/TD-10*
*All Phase 11–17 code specifications remain unchanged from MASTER-BLUEPRINT-v4-POLISHED.md.*
