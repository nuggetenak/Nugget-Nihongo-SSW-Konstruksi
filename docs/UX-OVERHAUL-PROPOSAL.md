# 🎨 UX/UI Overhaul Proposal — SSW Konstruksi

> **Author:** Crispy (Claude Opus 4.7)
> **Date:** 2026-04-28
> **Status:** Proposal — awaiting execution by next agent (Sonnet)
> **Reference:** v90 monolith (`legacy/ssw_flashcards_v87.jsx` + screenshots) + current modular app
> **Target audience:** Indonesian construction workers (N5–N4), beginner Japanese, preparing for SSW Konstruksi exam

---

## 📋 Table of Contents

1. [TL;DR](#tldr)
2. [Context & Goals](#context--goals)
3. [Gap Analysis: Current vs v90](#gap-analysis)
4. [Design Principles](#design-principles)
5. [Visual System](#visual-system)
6. [Information Architecture](#information-architecture)
7. [Component Library Spec](#component-library)
8. [Screen Specs](#screen-specs)
9. [Interaction & Microinteractions](#interactions)
10. [Beginner UX Features](#beginner-ux)
11. [Implementation Phases](#phases)
12. [Acceptance Criteria](#acceptance)
13. [Open Questions for Nugget](#open-questions)

---

## TL;DR

The current modular app has **superior architecture** (15 modes, SRS engine, PWA, CI/CD, 72 tests) but **inferior UX** compared to the v90 monolith. The v90 has richer flashcard interactions, better visual hierarchy, integrated stats, and a category grid filter that beginners can grok instantly.

This proposal outlines a **7-phase overhaul** that brings the v90's UX richness into the current modular structure — without sacrificing the architecture wins. The goal is a beginner-friendly study app that feels delightful, encourages daily use, and respects construction workers' study time (often 15–30 min per session, on mobile, often tired).

**Estimated effort:** 18–25 sessions of focused work across all phases. Each phase ends in a deployable state.

**Theme work already done:** Light/dark CSS-var system shipped in v2.4. All future work uses `T.*` tokens that auto-adapt.

---

## Context & Goals

### Who is the user?

- **Primary:** Indonesian construction workers, age 22–35, currently in Indonesia, planning to work in Japan via SSW (Tokutei Ginou) program
- **Japanese level:** N5–N4 (knows hiragana/katakana, ~500–1500 vocab, basic grammar)
- **Device:** Mobile-only, often older Android phones, sometimes slow networks
- **Study context:** 15–30 min sessions, often tired after work, on commute, or before bed
- **Goal:** Pass JAC SSW Konstruksi exam (Setsubi/Doboku/Kenchiku tracks)

### What we optimize for

| Priority | Metric | Why |
|----------|--------|-----|
| 1 | **Time-to-first-card** (seconds from app open to studying) | Tired users won't navigate menus |
| 2 | **Cards reviewed per session** | Spaced repetition compounds with consistency |
| 3 | **Return rate** (DAU/MAU) | Construction exam needs months of prep |
| 4 | **Mode discoverability** | 15 modes is many; beginners must find the right one |
| 5 | **Error recovery** | Misclicks should be easy to undo |

### What we de-prioritize

- ❌ Power-user features (keyboard shortcuts, batch operations) — already exist, just not surfaced
- ❌ Customization sliders (themes, fonts, layouts) — beginners want defaults
- ❌ Social features (leaderboards, sharing) — adds anxiety for slower learners
- ❌ Gamification overload (XP, levels, achievements) — dignified > playful for adult workers

---

## Gap Analysis

### 🟢 What current modular app has (that v90 lacks)

| Feature | Status |
|---------|--------|
| FSRS spaced repetition engine | ✅ ts-fsrs v5, ReviewMode, 4-button rating |
| Track selection (土木/建築/ライフライン) | ✅ TrackPicker + per-track filtering |
| PWA (install, offline, icons) | ✅ Phase 5 complete |
| Modular architecture (15 mode files) | ✅ Easy to maintain |
| Light/dark theme | ✅ Phase 5.3 (just shipped) |
| Tests + CI/CD | ✅ 72 tests, GitHub Actions |
| ExportMode (cross-device sync) | ✅ JSON export/import |

### 🔴 What v90 has (that current modular lacks or does worse)

#### Home / Dashboard
| v90 element | Current state | Priority |
|-------------|---------------|----------|
| Big bilingual title (`インフラ・設備 フラッシュカード`) | Small "SSW Konstruksi" in header | 🟡 Medium |
| Materi toggle (Konsep / Vocab) — large segmented control | Hidden inside `vocabMode` state, no UI | 🔴 High |
| Mode Belajar grid (2×2, large tiles with desc) | ModeGrid exists but no descriptions, smaller | 🔴 High |
| Stats bar (Total / Hafal / Belum / Sisa, 4 colored boxes) | Exists in Dashboard but separate visual | 🟡 Medium |
| Search bar prominently placed on home | Only in SearchMode (separate screen) | 🟡 Medium |
| Filter pill ("すべて 750 kartu" + Filter button) | Pills row, no popup | 🔴 High |
| Card count + progress bar | Only in modes, not on home | 🟢 Low |

#### FlashcardMode
| v90 element | Current state | Priority |
|-------------|---------------|----------|
| Category pill on card (e.g. `🔔 挨拶・安全`) | Not shown on card | 🔴 High |
| Card # indicator (`#4` corner) | Shown elsewhere | 🟡 Medium |
| Flip with bg gradient change (dark → amber) | Plain flip | 🔴 High |
| `← Prev / 👁️ Lihat / Next →` central nav row | Different pattern | 🔴 High |
| `✗ Belum hafal / ✓ Sudah hafal` mark buttons | Different (FSRS 4-button overlays it) | 🟠 High but tricky |
| Bottom tools row (Prioritas / Urut / Reset / ✗0) | Not present | 🔴 High |
| "Lihat penjelasan" button on back | DescBlock exists but inline | 🟡 Medium |
| Hint text ("ketuk = balik · geser = next") | Not present | 🟢 Low |

#### QuizMode
| v90 element | Current state | Priority |
|-------------|---------------|----------|
| Settings gear top-right | Exists | ✅ |
| Top counter `✓0 ✗0` + progress | Exists similar | ✅ |
| Question card with category pill | Question card exists, no category pill | 🟡 Medium |
| Numbered option buttons (1, 2, 3, 4 in circles) | Different style | 🟡 Medium |
| **After-answer reveal: ALL options show JP+romaji+ID** | Only correct/wrong color | 🔴 High |
| Question card reveals romaji + ID translation after answer | Not done | 🔴 High |
| Hint footer ("1/2/3 pilih · Enter lanjut") | Not present | 🟢 Low |

#### Filter / Categories
| v90 element | Current state | Priority |
|-------------|---------------|----------|
| Category grid popup (3×4 with emoji + JP + count) | Pills row only | 🔴 High |
| "Filter ▲" toggle button | Not present | 🔴 High |
| Category counts visible | Not shown | 🟡 Medium |
| Star button (favorites filter) | Hidden in `bintang` category | 🟡 Medium |

### 🆕 New UX needs (neither v90 nor current has)

These are **beginner-UX gaps** that neither version addresses well:

1. **No "What should I do today?" intelligence** — beginners stare at 15 modes and freeze
2. **No daily goal / streak motivation** beyond raw stats
3. **No celebration on milestones** (first 10 cards, first quiz pass, 7-day streak)
4. **No tutorial overlay** for first-time users in each mode
5. **No empty state messaging** (e.g. ReviewMode when no cards due)
6. **No "Recently studied"** section to resume
7. **No estimated time** per mode ("Quiz takes ~5 min")
8. **No JLPT/SSW context** for cards (which exam this card belongs to)

---

## Design Principles

These principles override aesthetic preferences. When in conflict, principle wins.

### P1. Mobile-first, thumb-zone friendly
- Primary actions in **bottom 60%** of screen (thumb reach)
- Tap targets minimum **44×44px** (WCAG 2.1 AA)
- Critical destructive actions require confirmation OR are easily undoable
- Avoid hover-only states (touch has no hover)

### P2. Indonesian-first, Japanese always visible
- Body text always in Indonesian
- JP terms always show kanji + romaji together (no romaji-hidden mode)
- Keep "buatan Nugget" tone — warm, encouraging, not corporate

### P3. Show progress relentlessly
- Every screen has at least one progress indicator
- Empty states show "you'll see X here when..." not just blank
- Completion percentages computed in real-time, not on next load

### P4. One primary action per screen
- Each screen has a clear "what should I do" — visually dominant
- Secondary actions are smaller, lower contrast
- Tertiary actions hidden behind menu / long-press

### P5. Forgive misclicks
- Marking a card "Sudah hafal" is undoable (toast with Undo button, 5s)
- Quiz answers can be reviewed at end
- Reset/clear actions require explicit confirmation
- Back button never destroys progress

### P6. Calm, not noisy
- One animation playing at a time (no competing motion)
- Sound effects optional, default OFF
- Reduce decorative elements that don't aid comprehension
- High contrast, but not harsh — warm grays, not pure black/white

### P7. Beginner-first defaults
- New users see **Konsep mode** first (easier than Vocab)
- Quiz starts at 5 questions, not 20
- SRS rating defaults to "Oke" (button is largest)
- Filter defaults to "All" not previous selection

### P8. Respect data + battery
- No autoplay videos/sounds
- Lazy-load mode chunks (already done)
- Cache aggressively (already done via SW)
- Keep bundle small — don't add libraries casually

---

## Visual System

### Colors (already shipped — see `src/styles/theme.js`)

**Light theme** (default): cream `#FFFDF5`, warm dark text, amber accents
**Dark theme** (toggle): warm dark `#0D0B08`, cream text, same amber accents

**Key brand colors (both themes):**
- `T.amber` `#F59E0B` — primary CTA
- `T.amberDark` `#92400E` — gradient start
- `T.amberMid` `#B45309` — gradient mid
- `T.gold` `#FBBF24` — highlights, due-card alerts
- `T.correct` `#16a34a` — success
- `T.wrong` `#dc2626` — error

**Track colors** (light theme adjusted):
- 土木 Doboku: `#D97706` (warm orange)
- 建築 Kenchiku: `#0284C7` (sky blue)
- ライフライン Lifeline: `#059669` (emerald)

### Typography Scale

Add to `theme.js` as `T.type`:

```js
type: {
  // Display (hero titles, big JP)
  display: { size: 32, weight: 800, line: 1.15, letter: -0.02 },
  // Heading levels
  h1: { size: 24, weight: 800, line: 1.2 },
  h2: { size: 19, weight: 700, line: 1.25 },
  h3: { size: 16, weight: 700, line: 1.3 },
  // Body
  bodyLg: { size: 15, weight: 500, line: 1.5 },
  body:   { size: 14, weight: 400, line: 1.5 },
  bodySm: { size: 13, weight: 400, line: 1.45 },
  // UI labels
  label: { size: 12, weight: 600, line: 1.3, upper: true, letter: 0.06 },
  caption: { size: 11, weight: 500, line: 1.3 },
  micro: { size: 10, weight: 600, line: 1.2 },
  // JP-specific
  jpHero: { size: 44, weight: 700, line: 1.3 },  // flashcard front
  jpLg:   { size: 28, weight: 600, line: 1.4 },  // quiz question
  jpMd:   { size: 19, weight: 500, line: 1.45 },
  jpSm:   { size: 15, weight: 500, line: 1.5 },
}
```

**Adaptive JP sizing** (already exists as `jpFontSize()` in v87) — keep, extend with the table above.

### Spacing Scale

Already defined as `T.sp = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64]`. Use indices, not raw px:
- `T.sp[2]` for tight (8px)
- `T.sp[4]` for default (16px)
- `T.sp[6]` for section gap (24px)
- `T.sp[8]` for screen edge (40px)

### Radius

Already defined: `T.r = { xs:6, sm:8, md:12, lg:16, xl:20, xxl:24, pill:99 }`

**Consistency rules:**
- Buttons: `T.r.lg` (16) for primary, `T.r.md` (12) for secondary
- Cards: `T.r.xl` (20) for primary cards, `T.r.lg` (16) for nested
- Pills/badges: `T.r.pill`
- Input fields: `T.r.md`
- Modal: `T.r.xxl` (24)

### Shadow

Already defined as CSS vars. Usage rules:
- `T.shadow.sm` — inputs, small cards
- `T.shadow.md` — elevated cards, popovers
- `T.shadow.lg` — modals
- `T.shadow.glow` — primary CTA, due-card alerts (amber glow)
- `T.shadow.glowStrong` — celebrations, milestones

### Animation tokens

Add to `theme.js`:

```js
motion: {
  fast: '0.12s ease-out',     // hover, press
  base: '0.2s ease-out',      // default transitions
  slow: '0.35s ease-in-out',  // page transitions
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // delightful bounce
  flip: '0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',  // card flip
}
```

**Reduce motion** support: respect `prefers-reduced-motion: reduce` — disable flip animations, fades become instant.

---

## Information Architecture

### Decision: Bottom Nav vs Top Tabs

**v90 uses top tabs** (`Belajar | Ujian | Referensi | Progres`).
**Current uses bottom nav** (`Home | Belajar | Ujian | Lainnya`).

**Recommendation: KEEP bottom nav** but improve its design.

**Rationale:**
- Bottom nav is thumb-friendly on tall phones (better than top tabs for one-handed use)
- iOS/Material Design conventions — users expect it
- Top tabs work in v90 because the page scrolls under them (not anchored), but that fights with content scroll
- Bottom nav is fixed, always-accessible

**Caveat:** Rename `Lainnya` → `Lainnya` (keep) but redesign as a sheet/grid with better discovery, not just a list of leftover modes.

### Tab Content Reorganization

| Tab | Icon | Modes |
|-----|------|-------|
| **Beranda** (home) | 🏠 | Dashboard (NEW: with Materi toggle, Quick Start, Recent, Stats) |
| **Belajar** | 📚 | ulasan (Ulang SRS) ★ FIRST, kartu, kuis, sprint, fokus |
| **Ujian** | 📝 | jac, wayground, simulasi, angka, jebak |
| **Lainnya** | ⋯ | cari, glosari, sumber, stats, ekspor + theme toggle, about |

### Mode Priority (within each tab)

**Belajar tab order** — change to put SRS first:
1. **Ulasan** (SRS due cards) — has badge with due count
2. **Kartu** (flashcards)
3. **Kuis** (auto quiz)
4. **Sprint** (timed drill)
5. **Fokus Lemah** (weakest cards)

**Ujian tab order:**
1. **JAC Official** — most authoritative
2. **Simulasi** — full mock exam
3. **Wayground** — sensei materials
4. **Angka Kunci** — must-memorize numbers
5. **Soal Jebak** — confusable pairs

---

## Component Library

These are atomic primitives. Build them, then compose. Each goes in `src/components/ui/`.

### `<Card>` — primary container
```jsx
<Card variant="default | elevated | outlined | ghost" 
      padding="sm | md | lg"
      onClick={...}>
  {children}
</Card>
```
- `default`: surface bg, no border
- `elevated`: surface bg + shadow.md
- `outlined`: transparent + border
- `ghost`: surface bg only on hover/active

### `<Button>` — replace inline buttons
```jsx
<Button 
  variant="primary | secondary | ghost | danger"
  size="sm | md | lg"
  icon="🃏"
  loading={false}
  fullWidth>
  Mulai Belajar
</Button>
```
- `primary`: amber gradient bg, white text
- `secondary`: surface bg, border, text color
- `ghost`: transparent, text color only
- `danger`: red bg, white text

### `<Pill>` — small categorical labels
```jsx
<Pill color="amber | track | semantic" icon="🏗️">
  土木
</Pill>
```

### `<StatBox>` — stat with label
```jsx
<StatBox value="750" label="Total" color="text" />
<StatBox value="42" label="Hafal" color="correct" />
<StatBox value="708" label="Sisa" color="amber" />
```

### `<IconButton>` — square icon-only
```jsx
<IconButton icon="🌙" onClick={toggle} ariaLabel="Theme" />
```

### `<SectionHeader>` — for grouped content
```jsx
<SectionHeader 
  label="MATERI"  // Caps-locked uppercase 
  action={<Button size="sm">Lihat semua</Button>}
/>
```

### `<ProgressBar>` — already exists, extend
```jsx
<ProgressBar 
  value={42} max={750} 
  variant="amber | track | semantic"
  showLabel  // shows "42 / 750 (5%)"
  height={6}
/>
```

### `<Badge>` — count indicator
```jsx
<Badge count={5} max={99} variant="alert | info | track" />
```

### `<EmptyState>` — for empty mode/list
```jsx
<EmptyState
  icon="🎉"
  title="Semua kartu sudah terulang!"
  desc="Datang lagi besok untuk ulasan baru."
  action={<Button>Pelajari kartu baru</Button>}
/>
```

### `<Toast>` — non-blocking notification
```jsx
toast.show({ 
  message: 'Kartu ditandai hafal',
  action: { label: 'Undo', onClick: () => undo() },
  duration: 5000 
})
```

### `<ConfirmDialog>` — destructive action confirmation
```jsx
<ConfirmDialog
  title="Reset semua progres?"
  desc="Tindakan ini tidak bisa dibatalkan."
  confirmLabel="Ya, reset"
  cancelLabel="Batal"
  variant="danger"
/>
```

### Migration plan for primitives
- **Phase A.3** — build all 10 primitives + Storybook-style demo page (private route)
- **Phase B onwards** — migrate one mode at a time to use primitives instead of inline styles
- Inline styles still allowed for one-off layouts; primitives for reusable patterns

---

## Screen Specs

### 🏠 Beranda (Home) — `Dashboard.jsx`

**Goal:** answer "what should I do right now?" in <2 seconds.

**Layout (top to bottom):**

```
┌─────────────────────────────────────┐
│ [Header]                            │
│ SSW Konstruksi · インフラ・設備       │
│ by Nugget Nihongo                   │
│                          [🌙] [🏗️]  │  ← theme + track pills
├─────────────────────────────────────┤
│ [Quick Start Card]    ← LARGE       │
│ 🔁  5 kartu siap diulang            │
│     Lanjut ulasan SRS               │
│                                     │
│  [Mulai →]                          │
├─────────────────────────────────────┤
│ MATERI                              │
│ ┌──────────┬──────────┐             │
│ │ Konsep   │ Vocab    │             │
│ │ 750 kartu│ 688 kartu│             │
│ └──────────┴──────────┘             │  ← segmented toggle
├─────────────────────────────────────┤
│ MODE BELAJAR                        │
│ ┌──────────┬──────────┐             │
│ │ 🃏 Kartu │ ❓ Kuis  │             │
│ │ Belajar  │ Tes diri │             │
│ ├──────────┼──────────┤             │
│ │ ⚡ Sprint│ 🎯 Fokus │             │
│ │ Cepat    │ Lemah    │             │
│ └──────────┴──────────┘             │
├─────────────────────────────────────┤
│ STATS HARI INI                      │
│ ┌───┬───┬───┬───┐                   │
│ │750│ 42│ 18│690│                   │
│ │Tot│Haf│Blm│Sis│                   │
│ └───┴───┴───┴───┘                   │
│ [progress bar 42/750]               │
├─────────────────────────────────────┤
│ TERAKHIR DIPELAJARI                 │
│ • 朝礼 (chorei) — Apel pagi         │
│ • 安全帯 (anzentai) — Sabuk pengaman │
│ • ...                               │
│ [Lihat semua →]                     │
├─────────────────────────────────────┤
│ STREAK                              │
│ 🔥 7 hari · belajar tiap hari!      │
└─────────────────────────────────────┘
```

**Key changes from current Dashboard:**

1. **Quick Start Card** (NEW) — replaces the existing "suggestion" tile at top, but bigger, gradient bg, prominent CTA
2. **Materi toggle** (NEW) — segmented control, persists `vocabMode` state visibly
3. **Mode Belajar grid** (REDESIGN) — 2×2 with description, larger tiles, like v90
4. **Stats hari ini** (KEEP, REDESIGN) — 4 numbered boxes inline like v90
5. **Terakhir dipelajari** (NEW) — last 5 cards user marked, tap to jump
6. **Streak** (NEW) — already tracked via `useStreak`, just surface it

**State logic for Quick Start:**

```js
function getQuickStart({dueCount, knownN, total, vocabMode, isFirstTime}) {
  if (isFirstTime) return { mode: 'kartu', label: 'Mulai dengan Kartu pertama', icon: '👋', desc: 'Tour singkat' };
  if (dueCount > 0) return { mode: 'ulasan', label: `${dueCount} kartu siap diulang`, icon: '🔁', desc: 'SRS jatuh tempo' };
  if (knownN < 10) return { mode: 'kartu', label: 'Lanjutkan kartu', icon: '🃏', desc: 'Bangun pondasi' };
  if (knownN / total < 0.3) return { mode: 'kartu', label: 'Lanjutkan kartu', icon: '🃏', desc: `${knownN} sudah hafal` };
  if (knownN / total < 0.6) return { mode: 'kuis', label: 'Coba kuis', icon: '❓', desc: 'Uji ingatanmu' };
  if (knownN / total < 0.85) return { mode: 'jac', label: 'Soal JAC official', icon: '📋', desc: 'Latihan soal asli' };
  return { mode: 'simulasi', label: 'Simulasi ujian penuh', icon: '🎯', desc: 'Kamu hampir siap!' };
}
```

---

### 🃏 FlashcardMode — major redesign

**Layout:**

```
┌─────────────────────────────────────┐
│ ← [back]    Kartu       [⋯ menu]   │  ← header
│ 1 / 750               42% hafal     │  ← progress
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░       │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔔 挨拶・安全          #4    │  │  ← category pill + card #
│  │                               │  │
│  │                               │  │
│  │           朝 礼              │  │  ← jpHero
│  │                               │  │
│  │           chorei              │  │  ← romaji muted
│  │                               │  │
│  │   ketuk = balik · geser →    │  │  ← hint, faint
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────────────┐ ┌──────┐ │
│ │← Prev│ │ 👁️  Lihat    │ │Next →│ │  ← nav row
│ └──────┘ └──────────────┘ └──────┘ │
│                                     │
│ ┌────────────────┬────────────────┐ │
│ │ ✗ Belum hafal │ ✓ Sudah hafal │ │  ← mark row
│ └────────────────┴────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┐          │
│ │🎯   │ ⏯  │ 🔄  │ ⭐  │          │  ← tools row
│ │Prio │Urut │Reset│ ✗ 0 │          │
│ └─────┴─────┴─────┴─────┘          │
└─────────────────────────────────────┘
```

**Back of card (after flip):**

```
┌───────────────────────────────┐
│ 🔔 挨拶・安全          #4    │
│                               │
│         chorei                │  ← romaji small
│         Apel pagi             │  ← ID translation big
│                               │
│  [📖 Lihat penjelasan]        │  ← reveals desc
│                               │
└───────────────────────────────┘
       ▲ amber gradient bg ▲
```

**Key behaviors:**

1. **Card has gradient background** that intensifies on flip (front: surface, back: amber gradient)
2. **Tap card OR press Lihat = flip**
3. **Swipe left = next, swipe right = prev** (also Prev/Next buttons)
4. **Mark buttons (✓/✗) work even without flipping** — but flipped state preferred
5. **Tools row:**
   - **Prioritas** — opens modal: pick category to focus
   - **Urut** — toggles sort: shuffle / original / hardest first
   - **Reset** — confirms, clears progress for current filter
   - **⭐ ✗N** — toggles starred filter (shows only starred); badge shows count
6. **Long-press card** → quick action menu (mark + star + report issue)
7. **Hint text** appears for first 3 cards only (`localStorage.flashHintShown`), then fades
8. **#4 indicator** = card position within current filter (not global ID)

**FSRS integration:**
- Mark "✓ Sudah hafal" → ratings = 3 (Good)
- Mark "✗ Belum hafal" → rating = 1 (Again)
- For power users: long-press ✓ → choose Susah(2) / Oke(3) / Mudah(4)
- Compatibility: existing 4-button rating UI removed in favor of binary; advanced behind long-press

---

### ❓ QuizMode — answer reveal redesign

**Question state:**

```
┌─────────────────────────────────────┐
│ ← back      Kuis       [⚙]         │
│ 1/10              ✓ 0  ✗ 0          │
│ ▓░░░░░░░░░░░░░░░░░░░░░░░░░         │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🔨 共通工具                  │  │
│  │                               │  │
│  │   ほうき + ちりとり          │  │  ← jpLg
│  │   + ブロアー                  │  │
│  └───────────────────────────────┘  │
│                                     │
│ ┌─┬─────────────────────────────┐   │
│ │1│ Gerobak sorong satu roda    │   │
│ ├─┼─────────────────────────────┤   │
│ │2│ Lantai                      │   │
│ ├─┼─────────────────────────────┤   │
│ │3│ Sapu / Pengki / Blower      │   │
│ ├─┼─────────────────────────────┤   │
│ │4│ Hidran LUAR vs DALAM        │   │
│ └─┴─────────────────────────────┘   │
│                                     │
│ 1/2/3/4 pilih · Enter lanjut       │
└─────────────────────────────────────┘
```

**After-answer state (CRITICAL — current app misses this):**

```
┌─────────────────────────────────────┐
│ 1/10              ✓ 0  ✗ 1          │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🔨 共通工具                  │  │
│  │                               │  │
│  │  ほうき + ちりとり + ブロアー │  │
│  │  ─────────────────            │  │
│  │  houki + chiritori + buroaa  │  │  ← romaji revealed
│  │  🇮🇩 Sapu / Pengki / Blower   │  │  ← ID revealed
│  └───────────────────────────────┘  │
│                                     │
│ ┌─┬───────────────────────────┐ ✗  │  ← user's wrong pick (red bg)
│ │1│ Gerobak sorong satu roda  │    │
│ │ │ 一輪車                     │    │  ← + JP
│ │ │ ichirinsha                │    │  ← + romaji
│ ├─┼───────────────────────────┤    │
│ │2│ Lantai                    │    │  ← dim
│ │ │ 床 yuka                    │    │
│ ├─┼───────────────────────────┤ ✓  │  ← correct (green bg)
│ │3│ Sapu / Pengki / Blower    │    │
│ │ │ ほうき+ちりとり+ブロアー   │    │
│ │ │ houki+chiritori+buroaa    │    │
│ ├─┼───────────────────────────┤    │
│ │4│ Hidran LUAR vs DALAM      │    │
│ │ │ ...                       │    │
│ └─┴───────────────────────────┘    │
│                                     │
│ [Lanjut →]                          │
└─────────────────────────────────────┘
```

**Why this matters:** Beginners learn from seeing the correct answer + their wrong choice + all distractors with full context. Current app just colors the right/wrong cell.

**Implementation:**
- Already have `card.jp` `card.romaji` `card.id_text` for the question
- For each option, need to know which card it represents → store `optionCardIds[]` alongside `options[]`
- After answer: render each option as `<OptionRevealed>` with full info

---

### 📋 JACMode — minor polish

**Current is good. Add:**
- Category pill on question card (which JAC chapter)
- After-answer: same reveal pattern as QuizMode (show JP+romaji+ID for question)
- Footer: "Soal #N · Sumber: Bab X JAC PDF"

---

### 🎮 WaygroundMode — set selector polish

**Current shows 12 sets in a list. Improvement:**
- Card grid (2 cols) per set
- Each card shows: set name + question count + last score (if attempted)
- Empty state if no sets selected: "Pilih set di atas untuk mulai"

---

### 🎯 SimulasiMode — make it feel like a real exam

**Add:**
- Pre-exam screen: "Simulasi Ujian — 30 menit, 30 soal" + [Mulai]
- Timer countdown visible always
- Cannot exit without confirm dialog
- Result screen: pass/fail badge, breakdown by category, weak categories

---

### 🔁 ReviewMode (SRS) — already strong, polish only

**Add:**
- Empty state when 0 due: "🎉 Semua kartu sudah terulang. Datang lagi besok!" + suggestion to learn new
- Completion screen: show next due time ("Berikutnya: 2 jam lagi · 5 kartu")
- Long-press rating button → preview interval ("Lagi: 1 menit, Susah: 6 jam, Oke: 1 hari, Mudah: 4 hari")

---

### ⚡ SprintMode — timer drama

**Add:**
- Pre-sprint: countdown 3-2-1-GO
- Timer in big circle, color shifts: green → amber → red as time depletes
- Completion: lap-style results showing answers per second

---

### 📊 StatsMode — visual upgrade

**Add:**
- Donut chart: known / unknown / untouched
- Streak calendar (last 30 days, fire icon on study days)
- Per-category breakdown bars
- Most-missed cards list (top 10)

---

### 🔍 SearchMode — make it instant

**Add:**
- Search-as-you-type (debounce 200ms)
- Highlight matched text in results
- Recent searches (last 5, localStorage)
- Empty state: "Coba cari 'denki' atau '電気'"

---

### 📖 GlossaryMode — add A-Z jump

**Add:**
- A-Z jump bar on right edge (like iOS contacts)
- Group headers: あ / か / さ / た / な / は / ま / や / ら / わ
- Show stats inline per term (✓ if known)

---

### 📚 SumberMode — already good, polish

**Add:**
- Grouped by source category (JAC chapters, Wayground sets, Vocab packs)
- Card count per source
- Tap → filter cards mode by that source

---

### 💾 ExportMode — clearer messaging

**Add:**
- Visual: file icon + "Unduh progres-mu"
- Show what's included: ✓ Hafal/Belum, ✓ SRS, ✓ Streak
- Import: drag-drop area + file picker
- After import: confirmation dialog showing diff (e.g. "+5 hafal, +2 SRS cards")

---

### 🎲 DangerMode (Soal Jebak) — tighten

**Add:**
- Pre-mode: explain "kartu yang mirip / mudah tertukar"
- After answer: side-by-side comparison of the confused pair
- Visual diff highlighting the differentiating kanji/character

---

### 🔢 AngkaMode — flashcard-style is fine

**Add:**
- Group by category (waktu / dosis / panjang / dll)
- Review pattern same as flashcard
- "Wajib hafal sebelum ujian" badge

---

## Interactions

### Card flip (FlashcardMode)

```css
.card { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4,0,0.2,1); }
.card.flipped { transform: rotateY(180deg); }
.front, .back { backface-visibility: hidden; position: absolute; inset: 0; }
.back { transform: rotateY(180deg); }
```

**Reduced motion fallback:** crossfade instead of rotate.

### Swipe gestures

Use **`useSwipe()`** custom hook (build new):
```js
useSwipe(elemRef, {
  onSwipeLeft: () => goNext(),
  onSwipeRight: () => goPrev(),
  threshold: 50, // px
})
```

**Don't break vertical scroll** — only respond if horizontal delta > vertical delta.

### Long-press

Use **`useLongPress()`** hook (build new):
```js
useLongPress(elemRef, {
  onLongPress: () => openMenu(),
  duration: 500, // ms
})
```

### Toast system

Build a `<ToastProvider>` at root, expose `toast.show()` via context.
- Auto-dismiss after `duration` (default 3s)
- Optional action button (Undo)
- Stack limit: 3 toasts max
- Position: bottom-center, above bottom nav

### ConfirmDialog

Build `<ConfirmDialog>` with portal.
- Modal backdrop dimmer
- Tap backdrop = cancel (treated as Batal)
- Esc/back button = cancel
- Slide-up animation from bottom on mobile

### Page transitions

Mode → Mode: crossfade 200ms. Avoid slide animations (feels janky on slower phones).

### Haptic feedback (optional, behind setting)

```js
const haptic = (type) => {
  if (!navigator.vibrate) return;
  const patterns = { light: 10, medium: 20, heavy: [40, 30, 40] };
  navigator.vibrate(patterns[type] || 10);
}
```

Use cases:
- Card flip: light
- Mark hafal: medium
- Quiz wrong answer: heavy
- Streak milestone: heavy

Default: OFF (battery). Toggle in Settings.

---

## Beginner UX

### F1. Smart "next action" engine

Already specced in Dashboard `getQuickStart()`. Logic-only, no new infra.

### F2. Daily goal system

**State:** `localStorage.ssw-daily-goal = 20` (cards reviewed today)

**Logic:**
- Reset count at midnight (compare last-reset date)
- Show donut on Dashboard: `15 / 20 hari ini`
- On hit: trigger celebration (confetti + toast "🎉 Goal harian tercapai!")
- Settings allow change (5 / 10 / 20 / 50 / custom)

### F3. Streak system

Already implemented in `useStreak.js`. Just **surface it on Dashboard**:
- "🔥 7 hari berturut-turut"
- Yesterday studied? → counter ticks up at next session
- Missed yesterday? → counter resets to 1
- Show calendar of last 30 days (filled days = study)

### F4. Tutorial overlays (first-time)

Each mode shows a one-time tooltip overlay on first visit:

```jsx
<FirstTimeTooltip
  storageKey="ssw-tutorial-flashcard"
  steps={[
    { target: '.card', text: 'Ketuk kartu untuk lihat artinya' },
    { target: '.nav-buttons', text: 'Geser kiri-kanan atau pakai tombol' },
    { target: '.mark-buttons', text: 'Tandai sesuai kemampuanmu' },
  ]}
/>
```

### F5. Help tooltips (info icons)

Small ⓘ next to obscure terms:
- "SRS" → tooltip: "Spaced Repetition — sistem ulasan yang muncul saat kamu mau lupa"
- "FSRS" → tooltip: "Algoritma SRS modern, lebih akurat dari Anki klasik"
- "JAC" → tooltip: "Japan Construction Cooperative — penyelenggara ujian SSW"

### F6. Empty states

Every list/mode has a designed empty state. Pattern:
- Big icon (60px)
- Title (h2)
- Description (body)
- Primary CTA

**Example for ReviewMode (no due cards):**
```
🎉
Semua kartu sudah terulang!
Datang lagi besok untuk ulasan baru.
[Pelajari kartu baru →]
```

**Example for SearchMode (no query):**
```
🔍
Cari kosakata
Coba ketik 'denki' atau '電気'
```

**Example for FocusMode (not enough wrong answers):**
```
✨
Belum ada kartu lemah
Lanjutkan kuis dulu — setelah beberapa jawaban salah, mode ini bantu fokus ke kelemahanmu.
[Mulai kuis →]
```

### F7. Time estimates per mode

Show "~5 min" / "~10 min" / "~30 min" badge on each mode tile so beginners can pick based on available time.

### F8. Recommended starter pack

For brand-new users (knownN === 0), show a "Paket Awalan" section:
- 20 most-frequent salutation cards
- 10 essential safety terms
- 5 common tools
- "Mulai dari sini →" CTA → loads filtered FlashcardMode

---

## Implementation Phases

Each phase ends in a deployable, testable state. PR per phase. Tests + lint must pass.

### Phase A — Design System Foundation (3 sessions)

**Goal:** primitives + tokens locked, no UX changes yet.

**Tasks:**
- A.1 Extend `theme.js` with `T.type` + `T.motion` tokens
- A.2 Create `src/components/ui/` directory
- A.3 Build primitives: `<Card>`, `<Button>`, `<Pill>`, `<StatBox>`, `<IconButton>`, `<SectionHeader>`, `<Badge>`, `<EmptyState>`
- A.4 Build hooks: `useSwipe`, `useLongPress`, `useToast`, `useConfirm`
- A.5 Build providers: `<ToastProvider>`, `<ConfirmProvider>`
- A.6 Create internal demo route `/playground` (only in dev) showing all primitives
- A.7 Update `_MAP.md` with new structure

**Acceptance:**
- All primitives have JSDoc + propTypes
- All primitives respect light/dark theme
- Demo page renders without errors
- 0 lint warnings, all tests pass
- No regressions in existing screens

---

### Phase B — Dashboard Overhaul (3 sessions)

**Goal:** new home screen as specced.

**Tasks:**
- B.1 Replace `Dashboard.jsx` content with new layout
- B.2 Add Materi toggle (segmented control) wired to `vocabMode` state
- B.3 Build Quick Start Card with `getQuickStart()` logic
- B.4 Mode Belajar 2×2 grid with descriptions
- B.5 Stats bar (4 colored boxes) using new `<StatBox>`
- B.6 "Terakhir dipelajari" section (track last 5 marked cards in localStorage `ssw-recent`)
- B.7 Surface streak from `useStreak`
- B.8 Update `App.jsx` to pass `vocabMode` toggle to Dashboard

**Acceptance:**
- All Dashboard sections render correctly in light + dark
- Quick Start logic tested for 6+ scenarios (new user, no due, low%, mid%, high%, all done)
- Tap Materi switches `vocabMode` → cards filter updates
- Mode Belajar tiles tap → enter correct mode
- Stats numbers match `CARDS.length` and known/unknown sets

---

### Phase C — FlashcardMode Overhaul (4 sessions)

**Goal:** v90-style card with prev/next + tools.

**Tasks:**
- C.1 Card layout with category pill + #N indicator + jpHero centered
- C.2 Flip animation with bg gradient (surface → amber gradient on flip)
- C.3 Nav row: ← Prev / 👁️ Lihat / Next →
- C.4 Mark row: ✗ Belum hafal / ✓ Sudah hafal
- C.5 Tools row: Prioritas / Urut / Reset / ⭐ ✗N
- C.6 Implement `useSwipe` for left/right navigation
- C.7 First-time hint overlay ("ketuk = balik · geser = next")
- C.8 Long-press card → action menu
- C.9 Reset confirm dialog
- C.10 Move FSRS rating to long-press of mark buttons
- C.11 DescBlock revealed via "Lihat penjelasan" button on back

**Acceptance:**
- Swipe left/right works smoothly, doesn't trigger on vertical scroll
- Card flip works with reduced-motion fallback
- All tools functional + persisted
- Mark button → updates known/unknown + advances to next
- FSRS rating still recorded (binary mapping: hafal=3, belum=1)

---

### Phase D — QuizMode Reveal Redesign (3 sessions)

**Goal:** v90-style answer reveal with full context.

**Tasks:**
- D.1 Track `optionCardIds[]` alongside `options[]` in quiz-generator
- D.2 Build `<OptionRevealed>` component (number + ID + JP + romaji + correct/wrong state)
- D.3 Update QuizShell to render OptionRevealed after answer
- D.4 Question card: reveal romaji + ID translation after answer (with divider line)
- D.5 Add category pill on question card
- D.6 Settings panel polish (auto-next delay, show romaji always, etc)
- D.7 Apply same pattern to JACMode + WaygroundMode

**Acceptance:**
- All 4 options show full info after answer
- Question card reveals romaji + ID after answer
- Wrong/correct visual states clear (red/green bg + ✗/✓ icon)
- Pattern consistent across QuizMode, JACMode, WaygroundMode

---

### Phase E — Other Modes Polish (3 sessions)

**Goal:** apply primitives + empty states + minor improvements to remaining modes.

**Tasks:**
- E.1 ReviewMode: empty state, completion screen, interval preview on long-press
- E.2 SprintMode: 3-2-1 countdown, timer color shift
- E.3 SimulasiMode: pre-exam screen, exit confirm, result breakdown
- E.4 FocusMode: empty state for new users
- E.5 StatsMode: donut chart (CSS-only, no chart lib), streak calendar
- E.6 SearchMode: instant search, recent searches, highlight match
- E.7 GlossaryMode: A-Z jump bar, group headers
- E.8 SumberMode: grouped by category
- E.9 ExportMode: visual file icon, drag-drop area, import diff
- E.10 DangerMode: side-by-side comparison
- E.11 AngkaMode: category grouping

**Acceptance:**
- All modes use new primitives where applicable
- All modes have empty states
- All modes show progress consistently
- No regressions in existing functionality

---

### Phase F — Navigation & Discovery (2 sessions)

**Goal:** filter accessibility + better mode discovery.

**Tasks:**
- F.1 Build category grid filter popup (3-col grid with emoji + count)
- F.2 Replace pill row with "Filter ▲" toggle that opens grid
- F.3 Star filter button (favorites)
- F.4 BottomNav: replace emoji icons with SVG (better consistency, scalable)
- F.5 BottomNav: Beranda/Belajar/Ujian/Lainnya labels + better tap states
- F.6 Mode tile redesign with time estimate + description

**Acceptance:**
- Filter popup opens/closes smoothly
- Category grid shows correct counts per filter
- Star filter shows only starred cards
- BottomNav tap target ≥ 44px each
- Active tab clearly indicated

---

### Phase G — Beginner UX Features (3 sessions)

**Goal:** smart defaults + tutorials + delight.

**Tasks:**
- G.1 Daily goal system (donut on Dashboard, settings to change goal)
- G.2 Tutorial overlays (`<FirstTimeTooltip>`) for FlashcardMode, QuizMode, ReviewMode
- G.3 Help tooltips (ⓘ icons) on SRS, FSRS, JAC, Wayground
- G.4 Recommended starter pack for new users (filtered FlashcardMode)
- G.5 Recently studied tracking + display
- G.6 Time estimates on mode tiles
- G.7 Celebration animations (confetti on milestones)
- G.8 Onboarding refresh (more interactive, 4 steps with examples)

**Acceptance:**
- Daily goal donut visible on Dashboard
- Tutorials appear once per mode, dismissable, never again
- Help tooltips accessible via tap
- Starter pack visible only when knownN === 0
- Confetti on: first 10 cards, first quiz pass (≥70%), 7-day streak, daily goal hit

---

### Phase H — QA, Performance & Polish (2 sessions)

**Goal:** final pass before public release.

**Tasks:**
- H.1 Cross-device testing (small Android, large Android, iOS Safari, desktop)
- H.2 Lighthouse audit: PWA, Performance, Accessibility, SEO
- H.3 Reduce-motion + screen-reader pass
- H.4 Bundle size review (target: < 800KB gzip total)
- H.5 Update CHANGELOG, README, _MAP.md to v3.0
- H.6 Public Twitter/post announcement (optional, Nugget's choice)

**Acceptance:**
- Lighthouse: PWA 100, Performance ≥ 85, Accessibility ≥ 90
- Works on Android Chrome 90+, iOS Safari 14+
- Bundle: < 800KB gzip initial, < 2MB total
- All known bugs filed/fixed/wontfix-tagged
- Version bumped to 3.0.0

---

## Acceptance

### Per-phase quality gate

Every phase ends with:
- ✅ All primitives/components have light + dark theme tested
- ✅ All tests pass (`npm test`)
- ✅ Lint clean (`npm run lint`)
- ✅ Format clean (`npm run format:check`)
- ✅ Build succeeds (`npm run build`)
- ✅ Manual smoke test: open app, run through changed flows
- ✅ `_MAP.md` updated with phase notes
- ✅ `CHANGELOG.md` entry added

### Final UX acceptance (post-Phase H)

A new beginner user must be able to:
1. **Open app → start studying within 10 seconds** (no menus, no tutorials blocking)
2. **Find their preferred study mode within 3 taps** (from any screen)
3. **Understand their progress instantly** (visible on home, no math required)
4. **Recover from misclicks easily** (Undo toast on every destructive action)
5. **Complete a 5-minute session with ≥10 cards reviewed**
6. **Return tomorrow and see exactly where to continue** (Quick Start Card)

---

## Open Questions

These need Nugget's decision before/during execution. **Sonnet should ASK before assuming.**

### Q1. Bottom nav vs top tabs?
**Recommendation:** Keep bottom nav (P1: thumb zone).
**Alternative:** Hybrid — top tabs for content categories (Belajar/Ujian/...), bottom nav for global actions (Home/Search/Settings).
**Decision needed before Phase F.**

### Q2. Track picker — first-run only, or accessible always?
**Current:** Set once, change via Dashboard pill.
**Alternative:** Allow toggle freely without progress reset.
**Recommendation:** Keep current behavior, but add "Lihat semua kartu" override for power users.

### Q3. Onboarding — keep or remove?
**Current:** 4-step welcome before track picker.
**Alternative:** Skip onboarding for returning users (already does); make first-time tour optional.
**Recommendation:** Reduce to 1 screen with single "Mulai" CTA + inline help on first FlashcardMode visit (Phase G.2).

### Q4. Daily goal default value?
**Recommendation:** 20 cards/day (matches typical SRS load + leaves room for new study).
**Decision needed in Phase G.1.**

### Q5. Sound effects?
**Current:** None.
**Recommendation:** None for v3.0. Add behind setting in v3.1 if requested.

### Q6. Branding — keep "by Nugget Nihongo" subtitle?
**Recommendation:** Yes. Personal, warm, differentiator.

### Q7. Color of "✓ Sudah hafal" — green or amber?
**Recommendation:** Green (`T.correct`) for clarity. Don't overload amber.

### Q8. Should FlashcardMode show FSRS interval previews?
**Recommendation:** Hidden by default. Surface via long-press of mark buttons (Phase C.10).

### Q9. Konsep vs Vocab — explain the difference somewhere?
**Current:** No explanation, users discover by tapping.
**Recommendation:** Tooltip on Materi toggle: "Konsep = istilah dengan penjelasan · Vocab = kosakata + arti"

### Q10. After import, should we merge or replace?
**Recommendation:** Merge by default. Show diff dialog. Allow "replace" via advanced option.

---

## Out of Scope (for v3.0)

These are explicitly NOT in this proposal — file as future work:

- ❌ Backend / cloud sync (stay localStorage)
- ❌ User accounts / login
- ❌ Multiplayer / social
- ❌ AI tutor / chat
- ❌ Audio pronunciation (no TTS budget)
- ❌ Image cards (no image budget for tools)
- ❌ Custom card creation by user
- ❌ Localization (stays Indonesian only)
- ❌ Tablet/desktop optimized layouts (mobile-first only)
- ❌ Native iOS/Android apps (PWA only)

---

## Notes for Sonnet (executing agent)

1. **Read this WHOLE file before starting.** Don't skim, don't rely on summary.
2. **Read `_MAP.md` after.** It shows current architecture and constraints.
3. **Ask Nugget about Open Questions Q1, Q3, Q4 before Phase F/G** — those affect design decisions.
4. **Phase order matters.** Phase A primitives are dependencies for B/C/D. Don't reorder.
5. **One phase = one PR**. Don't bundle phases.
6. **Update `_MAP.md` at end of each phase** with what changed.
7. **Don't touch `legacy/`, `docs/`, `scripts/`** unless instructed.
8. **Don't add libraries casually.** If you think you need one, ask first.
9. **Preserve all existing tests.** Add new tests for new primitives.
10. **Keep Indonesian copy warm and casual** — Nugget's voice. No corporate-speak.

**Default tone for new copy:**
- "Mulai" not "Memulai"
- "Yuk" not "Mari"
- "Hafal" not "Mengingat"
- "Belum hafal" not "Tidak ingat"
- Avoid English unless it's a technical term (SRS, FSRS, PWA)

**File reference cheat sheet:**
- Theme: `src/styles/theme.js`
- App root: `src/App.jsx`
- Dashboard: `src/components/Dashboard.jsx`
- Modes: `src/modes/*.jsx`
- Hooks: `src/hooks/*.js`
- Data: `src/data/*.js`
- Tests: `src/tests/*.test.js`
- Skills: `_MAP.md`, `docs/AUDIT-2026-04-28.md`, `docs/AUDIT-2026-04-28-PASS2.md`
- This proposal: `docs/UX-OVERHAUL-PROPOSAL.md`

---

## Appendix A: Reference Screenshots

The v90 reference screenshots (sent by Nugget on 2026-04-28) showed:
1. Home screen with Materi toggle + Mode Belajar 2×2 + Stats bar + Search
2. FlashcardMode front: kanji + romaji + hint + nav buttons + mark buttons + tools
3. FlashcardMode back: amber gradient bg + romaji + ID translation + "Lihat penjelasan"
4. QuizMode question: category pill + JP question + 4 numbered options + hint
5. QuizMode answered: question reveals romaji+ID, options show full JP+romaji+ID with correct/wrong colors
6. Filter popup: 3×4 category grid with emoji + JP + count

All screenshots are dark theme. Light theme equivalents must be designed per Phase A spec.

---

## Appendix B: Estimated Sessions

| Phase | Sessions | Cumulative |
|-------|----------|------------|
| A. Design System Foundation | 3 | 3 |
| B. Dashboard Overhaul | 3 | 6 |
| C. FlashcardMode Overhaul | 4 | 10 |
| D. QuizMode Reveal | 3 | 13 |
| E. Other Modes Polish | 3 | 16 |
| F. Navigation & Discovery | 2 | 18 |
| G. Beginner UX Features | 3 | 21 |
| H. QA & Polish | 2 | 23 |
| **TOTAL** | **23** | |

Each "session" ≈ 1–2 hours of focused execution by Sonnet.

---

*End of UX Overhaul Proposal · v1 · 2026-04-28 · Crispy*
