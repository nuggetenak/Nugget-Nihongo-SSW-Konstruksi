# TASK v4.20.4 — ENG-3: MODE_META augmentation + B2, F3, REF-4
**Status:** READY | **Effort:** Medium | **Depends on:** v4.20.3 DONE

## Goal
Add `color` and `strand` fields to all 23 MODE_META entries in `modes.js`. Eliminates the local `MODE_COLORS` object in StatsMode (F3) and makes MISSION_TYPES strand permanent (REF-4).

---

## Step 1 — ENG-3: Augment `src/router/modes.js`

**File:** `src/router/modes.js`

Find the `MODE_META` export. Add `color` (hex string) and `strand` ('input' | 'output' | 'fluency' | 'language') to each entry.

**Reference mapping for all 23 modes:**

```js
export const MODE_META = {
  // ── Study modes ──────────────────────────────────────────────
  ulasan:    { icon:'🔁', label:'Ulasan',         desc:'...', color:'#22c55e', strand:'fluency'  },
  kartu:     { icon:'🃏', label:'Flashcard',       desc:'...', color:'#60a5fa', strand:'input'    },
  fokus:     { icon:'🎯', label:'Fokus',           desc:'...', color:'#f97316', strand:'input'    },
  // ── Quiz modes ───────────────────────────────────────────────
  kuis:      { icon:'❓', label:'Kuis',            desc:'...', color:'#f59e0b', strand:'language' },
  sprint:    { icon:'⚡', label:'Sprint',          desc:'...', color:'#a78bfa', strand:'output'   },
  simulasi:  { icon:'📝', label:'Simulasi',        desc:'...', color:'#ef4444', strand:'language' },
  produksi:  { icon:'✍️', label:'Produksi',        desc:'...', color:'#34d399', strand:'output'   },
  kuisprod:  { icon:'🔤', label:'Kuis Produksi',   desc:'...', color:'#10b981', strand:'output'   },
  // ── Lifeline modes ───────────────────────────────────────────
  wayground: { icon:'🏗️', label:'Wayground',       desc:'...', color:'#fb923c', strand:'language' },
  sipil:     { icon:'⛏️', label:'Sipil',           desc:'...', color:'#78716c', strand:'language' },
  bangunan:  { icon:'🏢', label:'Bangunan',        desc:'...', color:'#0ea5e9', strand:'language' },
  jac:       { icon:'📋', label:'JAC Mode',        desc:'...', color:'#6366f1', strand:'language' },
  vocab:     { icon:'📖', label:'Vocab',           desc:'...', color:'#0891b2', strand:'input'    },
  // ── Language modes ───────────────────────────────────────────
  mirip:     { icon:'🔀', label:'Kata Mirip',      desc:'...', color:'#f472b6', strand:'language' },
  dengar:    { icon:'🎧', label:'Dengarkan',       desc:'...', color:'#e879f9', strand:'language' },
  // ── Special modes ────────────────────────────────────────────
  angka:     { icon:'🔢', label:'Angka Kunci',     desc:'...', color:'#facc15', strand:'input'    },
  bahaya:    { icon:'⚠️', label:'Bahaya',          desc:'...', color:'#dc2626', strand:'input'    },
  glosari:   { icon:'📚', label:'Glosari',         desc:'...', color:'#7c3aed', strand:'input'    },
  cari:      { icon:'🔍', label:'Cari',            desc:'...', color:'#475569', strand:'input'    },
  catatan:   { icon:'📝', label:'Catatan',         desc:'...', color:'#84cc16', strand:'input'    },
  ekspor:    { icon:'💾', label:'Ekspor',          desc:'...', color:'#94a3b8', strand:null        },
  sumber:    { icon:'📊', label:'Sumber',          desc:'...', color:'#64748b', strand:null        },
  stat:      { icon:'📈', label:'Statistik',       desc:'...', color:'#2dd4bf', strand:null        },
};
```

**Important:** Don't change the existing `icon`, `label`, `desc` fields — just ADD `color` and `strand` to each. Check the actual file first to see current field names/values and preserve them exactly. The mode key names (ulasan, kartu, etc.) may differ — use whatever keys are currently in the file.

Commit: `feat(modes): ENG-3 — add color + strand to all MODE_META entries`

---

## Step 2 — F3: Remove `MODE_COLORS` from `StatsMode.jsx`

**File:** `src/modes/StatsMode.jsx`

```js
// FIND and DELETE the local MODE_COLORS object:
const MODE_COLORS = { kuis: '#f59e0b', jac: '#6366f1', ... };

// ADD import:
import { MODE_META } from '../router/modes.js';

// REPLACE every usage of MODE_COLORS[mode]:
// BEFORE: color: MODE_COLORS[mode] ?? T.amber
// AFTER:  color: MODE_META[mode]?.color ?? T.amber
```

Commit: `fix(StatsMode): F3 — replace local MODE_COLORS with MODE_META[mode].color`

---

## Step 3 — B2 + REF-4: Fix `daily-mission.js` MISSION_TYPES

**File:** `src/utils/daily-mission.js`

**Interim fix (B2):** Add the 4 missing modes:
```js
// FIND MISSION_TYPES array. ADD these 4 entries:
{ mode: 'produksi', label: 'Latihan Produksi', icon: '✍️', priority: 3, strand: 'output'   },
{ mode: 'kuisprod', label: 'Kuis Produksi',     icon: '🔤', priority: 2, strand: 'output'   },
{ mode: 'mirip',    label: 'Kata Mirip',         icon: '🔀', priority: 2, strand: 'language' },
{ mode: 'dengar',   label: 'Dengarkan',          icon: '🎧', priority: 2, strand: 'language' },
```

**Permanent fix (REF-4):** After adding the entries, make strand derive from MODE_META:
```js
import { MODE_META } from '../router/modes.js';

// Replace hardcoded strand values with:
// strand: MODE_META[mode]?.strand ?? null
// (So if MODE_META is updated, MISSION_TYPES follows automatically)
```

If the file already maps MISSION_TYPES through MODE_META, just verify the 4 modes are present.

Commit: `fix(daily-mission): B2+REF-4 — add produksi/kuisprod/mirip/dengar to MISSION_TYPES; strand from MODE_META`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.4`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] All 23 MODE_META entries have color + strand fields
- [ ] StatsMode uses MODE_META[mode].color (no local MODE_COLORS)
- [ ] daily-mission.js has all 23 modes' strands (4 new + permanent REF-4)
- [ ] All tests pass; version 4.20.4
