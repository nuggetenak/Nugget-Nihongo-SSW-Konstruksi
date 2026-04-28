# 🎨 UX/UI Overhaul Proposal — SSW Konstruksi v3.0

> **Author:** Crispy (Claude Opus 4.6)
> **Date:** 2026-04-28 (rev.2 — post-codebase audit)
> **Status:** Proposal — execution guide for next agent (Sonnet)
> **Reference:** v87 monolith (`legacy/ssw_flashcards_v87.jsx`, 7389 lines) + v90 screenshots + current modular app

---

## 🚨 Root Problem

The modular rewrite (Phase 1–5) migrated the **architecture** (15 separate mode files, Vite bundler, SRS engine, CI/CD, PWA) but **dropped 50–70% of per-mode features** from the v87/v90 monolith. The current app has better bones but worse UX.

### Evidence: Line-count comparison

| Mode | v87 lines | Current lines | % retained | Verdict |
|------|-----------|--------------|------------|---------|
| FlashcardMode | 247 | 409 | 165%* | *Bigger but MISSING 12 features (see below)* |
| QuizMode | 317 | 140 | 44% | Gutted — delegated to generic QuizShell |
| JACMode | 1183 | 160 | 14% | Severely gutted |
| WaygroundMode | 450 | 179 | 40% | Missing result screen, score, restart |
| SimulasiMode | 384 | 125 | 33% | Missing timer, result, score |
| DangerMode | 216 | 114 | 53% | Halved |
| AngkaMode | 233 | 97 | 42% | Halved |
| StatsMode | 143 | 207 | 145%* | *Enhanced (has SRS stats)* |
| GlossaryMode | 200 | 128 | 64% | Missing A-Z nav |
| SprintMode | 124 | 248 | 200%* | *Properly migrated + enhanced* |
| FocusMode | 124 | 123 | 99% | OK |
| SumberMode | 209 | 144 | 69% | Simplified |
| ExportMode | 93 | 308 | 331%* | *Enhanced (JSON import/export)* |
| SearchMode | 90 | 116 | 129%* | *Slightly enhanced* |
| **JpFront** | 75 | 54 | 72% | Missing 4 smart layouts |
| **DescBlock** | 97 | 15 | 15% | Severely gutted |
| **App (main)** | 680+ | 560 | ~80% | Missing starred, filter popup, last-mode |

**\*Bigger ≠ better** — FlashcardMode grew because it added FSRS 4-button rating but lost 12 other features.

---

## 📋 Exact Missing Features (verified by code diff)

### FlashcardMode — 12 missing features

| # | Feature | v87 has | Current has | Impact |
|---|---------|---------|-------------|--------|
| 1 | **Search bar** (JP/romaji/ID filter) | ✅ `search` state + input | ❌ | High — can't find specific cards |
| 2 | **Star/favorite** (⭐ per card) | ✅ `starred` Set + `toggleStar()` | ❌ | High — can't bookmark hard cards |
| 3 | **Tools row** (Prioritas/Urut/Reset/Review❌) | ✅ 4-button row | ❌ | High — can't control card order |
| 4 | **Stats row** (Total/Hafal/Belum/Sisa boxes) | ✅ 4 colored stat boxes | ❌ | Medium — progress not visible in-mode |
| 5 | **Category pill on card** (top-left badge) | ✅ `catInfo.emoji + label` | ❌ Only shows after flip | High — no context before flipping |
| 6 | **Card # indicator** (#N corner) | ✅ Position number | ❌ | Low |
| 7 | **Smart DescBlock** (①②③ lists, 【brackets】, footnotes) | ✅ 97-line parser | ❌ Only line-split | High — descriptions render flat/ugly |
| 8 | **Smart JpFront** (vs, ・, ：, → layouts) | ✅ 75-line component | ❌ Only plain text | High — compound terms unreadable |
| 9 | **Reset confirm dialog** (2-tap safety) | ✅ `confirmReset` + 3s timeout | ❌ | Medium — accidental resets |
| 10 | **"Review Belum" filter** (show only ❌ cards) | ✅ `unknownCards` filter button | ❌ | High — can't review mistakes |
| 11 | **Status border** (green/red/neutral by known state) | ✅ Dynamic `statusBorder` | ❌ Has SRS border instead | Medium |
| 12 | **Flip gradient** (bg changes to category color) | ✅ `catInfo.color` gradient on flip | ❌ Static surface bg | Medium — less visual feedback |

**Current HAS but v87 doesn't:** FSRS 4-button rating ✅, SRS strength badge ✅, swipe gestures ✅, interval preview ✅

### QuizMode — 9 missing features

| # | Feature | v87 has | Current has |
|---|---------|---------|-------------|
| 1 | **Quiz count selector** (10/20/30/All) | ✅ Button row | ❌ Hardcoded `Math.min(15, cards.length)` |
| 2 | **Lemah mode** (focus on wrong-history cards) | ✅ `lemahMode` + `lemahCards` | ❌ |
| 3 | **Streak display** (current + max) | ✅ In-quiz UI | ❌ QuizShell has it but not surfaced well |
| 4 | **Anti-repeat** (`seenPoolRef` across restarts) | ✅ Prevents same card twice | ❌ |
| 5 | **Settings panel** (in-quiz toggle) | ✅ `showSettings` gear icon | ❌ Settings only on pre-start screen |
| 6 | **Auto-next configurable** (1s/1.5s/2s) | ✅ | ❌ Hardcoded 2s in QuizShell |
| 7 | **JpFront smart rendering** on question card | ✅ | ❌ Plain text |
| 8 | **After-answer reveal** (all options show JP+romaji+ID) | ✅ | ❌ Only color change |
| 9 | **Wrong answer review** (end screen with details) | ✅ | ⚠️ QuizShell has basic ResultScreen |

### JACMode — 5 missing features

| # | Feature | v87 has | Current has |
|---|---------|---------|-------------|
| 1 | **Chapter detail view** (browse questions per chapter) | ✅ Full navigation | ❌ Just set picker → quiz |
| 2 | **Score tracking per chapter** | ✅ | ❌ |
| 3 | **showHira toggle** (furigana on/off for questions AND options) | ✅ Applies to options too | ⚠️ Partial — `showFuri` exists |
| 4 | **Result review** (wrong answers with explanations) | ✅ | ⚠️ Via QuizShell |
| 5 | **Auto-advance delay** | ✅ Configurable | ❌ Hardcoded |

### WaygroundMode — 4 missing features

| # | Feature | v87 has | Current has |
|---|---------|---------|-------------|
| 1 | **WaygroundQuizMode** (dedicated quiz UI) | ✅ Separate component | ❌ Uses generic QuizShell |
| 2 | **WaygroundResult** (score + maxStreak + review) | ✅ 73-line component | ❌ Generic ResultScreen |
| 3 | **Score + maxStreak** tracking per set | ✅ | ❌ |
| 4 | **Restart with same set** | ✅ | ❌ |

### SimulasiMode — 5 missing features

| # | Feature | v87 has | Current has |
|---|---------|---------|-------------|
| 1 | **Countdown timer** (visual display) | ✅ `timeLeft` + `countdown` | ❌ Timer prop exists but no UI |
| 2 | **Time-up auto-finish** | ✅ | ❌ |
| 3 | **Score tracking** | ✅ | ❌ |
| 4 | **Result screen** (pass/fail + score) | ✅ | ❌ |
| 5 | **Wrong answer review** | ✅ | ❌ |

### JpFront / JpDisplay — 4 missing layouts

| # | Pattern | v87 renders as | Current renders as |
|---|---------|----------------|-------------------|
| 1 | `A vs B` | Stacked with VS divider | Plain text "A vs B" |
| 2 | `A・B・C` | Stacked with HR dividers | Plain text "A・B・C" |
| 3 | `Title：Subtitle` | Title + divider + subtitle | Plain text |
| 4 | `A → B → C` | Stacked with ↓ arrows | Plain text |

### DescBlock — 3 missing render modes

| # | Pattern | v87 renders as | Current renders as |
|---|---------|----------------|-------------------|
| 1 | `①②③` numbered items | Parsed into styled list with orange numbers | Plain text with line breaks |
| 2 | `【keyword】` brackets | Parsed into labeled segments with colored badges | Plain text |
| 3 | `(Sumber: ...)` footnotes | Extracted as faint italic footer | Inline text |

### App-level — 3 missing features

| # | Feature | v87 has | Current has |
|---|---------|---------|-------------|
| 1 | **Starred cards system** (localStorage persist) | ✅ `starred` Set + auto-save | ❌ |
| 2 | **Category filter popup** (3-col grid, emoji, count, "Terapkan" button) | ✅ `filterOpen` + grid | ❌ Only pills row |
| 3 | **Last-mode persistence** (resume on reload) | ✅ `ssw-last-mode` | ❌ Always starts at home |

---

## ✅ Current App Advantages (keep these)

These are things the current modular app has that v87/v90 does NOT:

1. **FSRS spaced repetition** (ts-fsrs v5, ReviewMode, 4-button rating, interval preview)
2. **Track system** (土木/建築/ライフライン with per-track filtering)
3. **Light/dark theme** (CSS vars, toggle, no flash)
4. **PWA** (offline, installable, service worker)
5. **CI/CD** (GitHub Actions: lint → test → build → deploy)
6. **72 unit tests**
7. **Modular architecture** (15 separate mode files, shared hooks/utils)
8. **Code splitting** (React.lazy per mode, manual chunks in Vite)
9. **ExportMode** (JSON import/export with diff dialog)
10. **SRS strength badges** (on cards, in dashboard)

**These MUST NOT be broken or removed during the overhaul.**

---

## 🎯 Design Principles

### P1. Mobile-first, thumb-zone
Primary actions in bottom 60% of screen. Tap targets ≥ 44×44px.

### P2. Indonesian-first, JP always visible
Body text Indonesian. JP terms always show kanji + romaji.

### P3. Show progress everywhere
Every screen has at least one progress indicator.

### P4. One primary action per screen
Clear "what should I do" — visually dominant.

### P5. Forgive misclicks
Reset/clear require confirm. Mark actions have undo.

### P6. Calm, not noisy
One animation at a time. High contrast but warm.

### P7. Beginner-first defaults
Konsep first, quiz starts at 10, SRS defaults to "Oke".

### P8. Respect data + battery
No autoplay. Lazy-load. Cache aggressively.

---

## 🛠 Implementation Phases

### Phase 1 — Smart Text Components (1 session)

**Goal:** Restore JpFront and DescBlock to v87 feature parity.

**Files to edit:**
- `src/components/JpDisplay.jsx`

**Tasks:**
1. **JpFront** — port v87's smart layout logic:
   - `A vs B` → stacked with VS divider
   - `A・B・C` → stacked with HR dividers
   - `Title：Subtitle` → title + divider + subtitle
   - `A → B → C` → stacked with ↓ arrows
   - Plain text → current behavior (keep)
   - Use `T.*` tokens for colors instead of v87's hardcoded hex
2. **DescBlock** — port v87's smart parsing:
   - ①②③ circled-number list → styled numbered list
   - 【keyword】 brackets → labeled segments with amber badges
   - (Sumber: ...) footnotes → extracted as faint italic footer
   - Plain text → current behavior (keep)
   - Use `T.*` tokens

**Acceptance:**
- A card with `朝礼 vs 夕礼` renders stacked
- A card with `ほうき・ちりとり・ブロアー` renders stacked with dividers
- A card desc with `①安全 ②注意 ③危険` renders as colored numbered list
- A card desc with `【屋内消火栓】...【屋外消火栓】...` renders with labeled badges
- No existing tests broken
- Both light and dark themes render correctly

---

### Phase 2 — FlashcardMode Feature Restore (2 sessions)

**Goal:** Restore 12 missing features from v87 while keeping FSRS.

**File to edit:**
- `src/modes/FlashcardMode.jsx`
- `src/App.jsx` (for starred state)

**Tasks:**
1. **Search bar** — add `search` state + input field above card. Filter `displayCards` by JP/romaji/ID.
2. **Star system** — add `starred` Set to App.jsx state, persist to localStorage `ssw-starred`. Pass to FlashcardMode. Add ⭐/☆ toggle button next to search.
3. **Category pill on card** — show `cat.emoji + cat.label` badge at card top-left (not just after flip).
4. **Card # indicator** — show `#N` at card bottom-right.
5. **Stats row** — add 4 colored stat boxes below search (Total / Hafal / Belum / Sisa) like v90 screenshot.
6. **Tools row** — add 4-button row below mark area:
   - **Prioritas** → sets order to unknown → untouched → known (current default — just button for explicit toggle)
   - **Urut** → toggles between shuffle / original order
   - **Reset** → 2-tap confirm (first tap: "Yakin?", 3s timeout). Clears known/unknown for current filter.
   - **Review ❌ N** → filters to only `unknown` cards. Badge shows count.
7. **Flip gradient** — when flipped, card bg changes to `catInfo.color` gradient (like v87 line 132).
8. **Status border** — card border: green if known, red if unknown, neutral if untouched.
9. **DescBlock integration** — use new smart DescBlock on card back.
10. **JpFront integration** — use new smart JpFront on card front.
11. **Reset confirm** — `confirmReset` state with 3s auto-cancel.
12. **"Review Belum" filter** — when active, `displayCards = cards.filter(c => unknown.has(c.id))`.

**Keep existing:** FSRS 4-button rating, swipe gestures, SRS badge, keyboard shortcuts.

**FSRS + Binary mark coexistence:**
- `✓ Sudah hafal` → FSRS rating 3 (Good)
- `✗ Belum hafal` → FSRS rating 1 (Again)
- Long-press ✓ → shows full 4-button FSRS rating
- This replaces the current always-visible 4-button grid (which is intimidating for beginners)

**Acceptance:**
- Search filters cards by JP/romaji/ID in real-time
- Star persists across sessions (localStorage)
- Tools row all functional
- Reset requires 2 taps
- Card front shows JpFront smart layout
- Card back shows DescBlock smart rendering
- Flip changes card bg to category gradient

---

### Phase 3 — QuizMode Feature Restore (2 sessions)

**Files to edit:**
- `src/modes/QuizMode.jsx`
- `src/components/QuizShell.jsx`
- `src/components/OptionButton.jsx`

**Tasks:**
1. **Quiz count selector** — button row: 10 / 20 / 30 / All. Default 10.
2. **Lemah mode toggle** — `lemahMode` switch. Shows `⚠ Fokus Lemah (N)` when wrong-history cards exist.
3. **Anti-repeat** — `seenPoolRef` tracks card IDs across quiz restarts within session. Only repeats when pool exhausted.
4. **Settings panel** — ⚙ gear icon top-right opens inline settings (difficulty, auto-next delay, lemah mode).
5. **Auto-next configurable** — add delay picker (1s / 1.5s / 2s / manual) in settings.
6. **JpFront on question card** — use smart JpFront component.
7. **After-answer full reveal** — when answered:
   - Question card: reveal romaji + ID translation (divider line + text)
   - Each option: show JP + romaji below ID text (requires storing `optionCardId` per option)
   - Correct option: green border + ✓
   - Wrong picked: red border + ✗
   - Other options: dim
8. **Streak display** — show 🔥N streak counter in header during quiz.
9. **Result screen enhancement** — wrong answers show: question JP + romaji + ID + user's wrong pick + correct answer.

**Acceptance:**
- Quiz count buttons work (10/20/30/All)
- Lemah mode filters to previously-wrong cards
- After answering, all 4 options show JP + romaji context
- Question card reveals full translation after answer
- Settings gear opens inline panel
- Anti-repeat prevents same card in consecutive quizzes

---

### Phase 4 — JACMode + WaygroundMode + SimulasiMode Restore (2 sessions)

**Files to edit:**
- `src/modes/JACMode.jsx`
- `src/modes/WaygroundMode.jsx`
- `src/modes/SimulasiMode.jsx`

**Tasks (JACMode):**
1. Add score tracking per set (persisted `ssw-jac-scores`)
2. showHira toggle applies to options too (not just question)
3. Enhance result review to show wrong answers with explanation
4. Add auto-advance delay option

**Tasks (WaygroundMode):**
1. Restore score + maxStreak tracking per set
2. Add dedicated result screen (score / maxStreak / restart / review wrong)
3. "Restart with same set" button
4. Show last score on set picker cards

**Tasks (SimulasiMode):**
1. Implement real countdown timer UI (big visible clock)
2. Auto-finish when time runs out
3. Score tracking + pass/fail threshold (60% = lulus)
4. Result screen: "LULUS ✓" / "BELUM LULUS ✗" + score + breakdown
5. Wrong answer review
6. Add pre-exam screen with instructions

**Acceptance:**
- JAC shows score history per set on picker
- Wayground shows maxStreak + restart option
- Simulasi timer counts down visually, auto-finishes, shows pass/fail

---

### Phase 5 — DangerMode + AngkaMode Polish (1 session)

**Files to edit:**
- `src/modes/DangerMode.jsx`
- `src/modes/AngkaMode.jsx`

**Tasks (DangerMode):**
1. After answer: show side-by-side comparison of confused pair
2. Highlight differentiating kanji/character
3. "Explain the difference" section after reveal

**Tasks (AngkaMode):**
1. Group by category (waktu / dosis / panjang / etc)
2. Add flashcard-style browse mode (not just quiz)
3. "Wajib hafal sebelum ujian" badge

**Acceptance:**
- DangerMode shows pair comparison after answer
- AngkaMode lets user browse by category, not just quiz

---

### Phase 6 — Category Filter Popup + Star System + App UX (2 sessions)

**Files to edit:**
- `src/App.jsx`
- `src/components/Dashboard.jsx`
- New file: `src/components/FilterPopup.jsx`

**Tasks:**
1. **Category filter popup** — replace pills row with "Filter ▼" button that opens a 3-column grid:
   - Each cell: emoji + JP label + count
   - "すべて" row at top with total
   - ★ Bintang cell (starred cards)
   - "✓ Terapkan N kategori (M kartu)" button at bottom
   - Matches v90 screenshot exactly
2. **Starred cards system** — `starred` Set in App.jsx, persisted to localStorage:
   - Auto-save on change
   - Load on mount
   - Pass `starred` + `toggleStar` to FlashcardMode
   - Show "Bintang" in filter grid with starred count
3. **Last-mode persistence** — save `ssw-last-mode` to localStorage:
   - On reload, restore last active mode (not just home)
   - Optional: controlled by setting
4. **Materi toggle** (Konsep/Vocab) — make the current `vocabMode` toggle more prominent:
   - Large segmented control on Dashboard (like v90 screenshot)
   - Show card count per segment

**Acceptance:**
- Filter popup opens/closes with animation
- Grid shows correct counts per category × track
- Star button on FlashcardMode persists across sessions
- Starred cards appear in Bintang filter category
- App remembers last mode on reload

---

### Phase 7 — Dashboard Overhaul (2 sessions)

**File to edit:**
- `src/components/Dashboard.jsx`

**Tasks:**
1. **Quick Start card** — large CTA card at top:
   - Smart logic: show SRS due → flashcard → quiz → JAC → simulasi based on progress
   - Gradient bg, big icon, prominent button
2. **Materi toggle** — segmented control (Konsep 750 | Vocab 688)
3. **Mode Belajar grid** — 2×2 tiles with icon + title + description + time estimate
4. **Stats bar** — 4 colored boxes inline (Total / Hafal / Belum / Sisa) matching v90
5. **Recently studied** — last 5 cards marked, stored in `ssw-recent` localStorage
6. **Streak display** — 🔥 N hari from useStreak hook
7. **Daily progress bar** — track cards reviewed today (`ssw-daily-count` + reset at midnight)

**Acceptance:**
- Quick Start shows different CTA based on user state
- Stats bar shows accurate live numbers
- Recently studied updates after FlashcardMode mark
- Streak shows correctly (resets if missed a day)

---

### Phase 8 — Visual Polish + Animations + Empty States (2 sessions)

**Files to edit:** all mode files + components

**Tasks:**
1. **Empty states** for every mode — designed with icon + title + desc + CTA:
   - ReviewMode 0 due: "🎉 Semua kartu sudah terulang! Datang lagi besok."
   - FocusMode no weak cards: "✨ Belum ada kartu lemah. Lanjutkan kuis dulu."
   - SearchMode no query: "🔍 Cari kosakata. Coba 'denki' atau '電気'"
   - Each empty state has a primary CTA to the next logical action
2. **Flip animation** — CSS 3D `rotateY(180deg)` with `backface-visibility: hidden`
3. **Page transition** — crossfade 200ms on mode enter/exit
4. **Reduced motion** — respect `prefers-reduced-motion: reduce`
5. **Toast system** — `useToast` hook + `<ToastProvider>` at root:
   - "Kartu ditandai hafal" with Undo button (5s)
   - "Progres direset" confirmation
   - Stack max 2, bottom-center, above nav
6. **Confirm dialog** — `useConfirm` hook + `<ConfirmDialog>`:
   - Used by Reset, Clear, Delete actions
   - Slide-up from bottom, tap backdrop = cancel
7. **Time estimates** on mode tiles:
   - Kartu: ~10 mnt
   - Kuis: ~5 mnt
   - Sprint: ~3 mnt
   - JAC: ~15 mnt
   - Simulasi: ~30 mnt

**Acceptance:**
- Every mode has a designed empty state (not blank screen)
- Card flip is smooth 3D rotation
- Toast appears on mark actions with working Undo
- Confirm dialog on all destructive actions
- Reduced-motion users see crossfade instead of rotation

---

### Phase 9 — Beginner UX Features (1 session)

**Tasks:**
1. **First-time tooltip** in FlashcardMode:
   - "Ketuk kartu untuk balik"
   - "Geser kiri-kanan untuk navigasi"
   - "Tandai sesuai pemahamanmu"
   - Shows once, dismissed on tap, stored `ssw-tutorial-flashcard`
2. **Help tooltips** (ⓘ icons):
   - "SRS" → "Sistem ulasan cerdas — muncul saat kamu hampir lupa"
   - "JAC" → "Japan Agricultural Cooperative — penyelenggara ujian SSW"
3. **Recommended starter pack** (new users with knownN === 0):
   - "Paket Awalan" section on Dashboard
   - Pre-filtered to 20 easiest salutation + safety cards
   - "Mulai dari sini →" CTA
4. **Milestone celebrations**:
   - First 10 cards marked: toast "🎉 10 kartu pertama!"
   - First quiz ≥70%: toast "✨ Quiz pertama lulus!"
   - 7-day streak: toast "🔥 Seminggu berturut-turut!"

**Acceptance:**
- Tutorial shows once per mode, never again
- Help tooltips accessible and correct
- Starter pack visible only for brand-new users
- Milestones fire at correct thresholds

---

### Phase 10 — QA + Performance + Release (1 session)

**Tasks:**
1. Cross-device testing (small Android, large Android, iOS Safari)
2. Lighthouse: PWA 100, Performance ≥ 85, Accessibility ≥ 90
3. Bundle size review (< 800KB gzip initial)
4. All tests pass + new tests for restored features
5. CHANGELOG + README + _MAP.md updated to v3.0.0
6. Clean up `legacy/` folder (optional, Nugget's call)

**Acceptance:**
- Works on Android Chrome 90+, iOS Safari 14+
- All 72+ tests pass
- Lint clean, format clean
- Build succeeds

---

## 📊 Session Estimates

| Phase | Focus | Sessions |
|-------|-------|----------|
| 1 | Smart Text (JpFront + DescBlock) | 1 |
| 2 | FlashcardMode restore | 2 |
| 3 | QuizMode restore | 2 |
| 4 | JAC + Wayground + Simulasi restore | 2 |
| 5 | DangerMode + AngkaMode | 1 |
| 6 | Filter popup + Star + App UX | 2 |
| 7 | Dashboard overhaul | 2 |
| 8 | Visual polish + empty states | 2 |
| 9 | Beginner UX | 1 |
| 10 | QA + release | 1 |
| **TOTAL** | | **16** |

---

## 📝 Notes for Sonnet (executing agent)

### Before starting

1. Read this ENTIRE document
2. Read `_MAP.md` for architecture context
3. Read `src/styles/theme.js` — all colors use `T.*` tokens
4. Read `legacy/ssw_flashcards_v87.jsx` — this is your feature reference

### Rules

1. **One phase = one commit.** Each phase ends deployable.
2. **Don't break existing tests.** Add new tests for restored features.
3. **Use `T.*` tokens** for ALL colors/spacing. Never hardcode hex.
4. **Keep Indonesian copy warm:** "Mulai" not "Memulai", "Hafal" not "Mengingat".
5. **Don't add libraries** without asking Nugget first.
6. **Don't touch** `legacy/`, `docs/`, `scripts/`, `srs/` unless explicitly needed.
7. **Port v87 LOGIC, not v87 STYLE.** Use current theme system, not v87's hardcoded dark theme.
8. **Phase order matters.** Phase 1 (JpFront + DescBlock) is used by Phase 2-5. Don't skip.
9. **Test on mobile.** Nugget tests on Android phone between iterations.
10. **Update `_MAP.md`** at end of each phase.

### File reference

```
src/
├── styles/theme.js          ← Color tokens, DO NOT hardcode colors
├── App.jsx                  ← Main app, state, routing
├── main.jsx                 ← Entry point
├── components/
│   ├── Dashboard.jsx        ← Home screen
│   ├── JpDisplay.jsx        ← JpFront + DescBlock (PHASE 1)
│   ├── QuizShell.jsx        ← Shared quiz engine
│   ├── OptionButton.jsx     ← Quiz option
│   ├── ResultScreen.jsx     ← Quiz result
│   ├── ProgressBar.jsx      ← Progress bar
│   ├── BottomNav.jsx        ← Bottom navigation
│   └── TrackPicker.jsx      ← Track selection
├── modes/                   ← All 15 mode components
├── hooks/                   ← Custom hooks
├── utils/                   ← Shared utilities
├── data/                    ← Card data, categories
├── srs/                     ← FSRS engine (don't touch)
└── tests/                   ← Unit tests
legacy/
└── ssw_flashcards_v87.jsx   ← FEATURE REFERENCE (read-only)
```

### v87 line ranges for reference

```
FlashcardMode:  lines 2647–2893
QuizMode:       lines 2894–3210
JACMode:        lines 3211–4393
AngkaMode:      lines 4444–4676
DangerMode:     lines 4677–4892
SimulasiMode:   lines 4893–5276
ExportMode:     lines 5277–5369
StatsMode:      lines 5370–5512
SearchMode:     lines 5513–5602
SprintMode:     lines 5603–5726
FocusMode:      lines 5727–5850
GlossaryMode:   lines 5851–6050
SumberMode:     lines 6051–6259
WaygroundMode:  lines 6260–6709
JpFront:        lines 6727–6802
DescBlock:      lines 6803–6900
Main App:       lines 6900–7389
```

---

## ❓ Open Questions (ask Nugget before executing)

1. **FSRS rating: keep 4-button or switch to binary ✓/✗ (with long-press for 4-button)?** Recommendation: binary default, long-press for advanced.
2. **Filter popup or filter pills?** Recommendation: popup (matches v90).
3. **Daily goal default?** Recommendation: 20 cards/day.
4. **Sound effects?** Recommendation: none for v3.0.
5. **Should star system sync to SRS engine?** Recommendation: no, keep separate.

---

*End of UX Overhaul Proposal · v2 · 2026-04-28 · Crispy*
