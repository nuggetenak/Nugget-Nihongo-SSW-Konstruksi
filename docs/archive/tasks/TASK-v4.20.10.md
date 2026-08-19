# TASK v4.20.10 — DB-1, DB-6, DB-7, DB-8

**Status:** DONE ✅ | **Effort:** Medium | **Depends on:** v4.20.9 DONE

## Items

- **DB-1** (P1) — 12 JAC questions with `hasPhoto: true` but no image assets
- **DB-6** (P2) — Track-specific card categories have 0 cards
- **DB-7** (P3) — `ANGKA_KUNCI` 2 entries with `kartu: null`
- **DB-8** (P3) — 185 ID gaps — now guarded by ENG-9 in CI

## Full spec

Read `docs/UPGRADE-PROPOSAL-v4.20.md` sections DB-1, DB-6, DB-7, DB-8.

---

## DB-1: Photo asset handling

12 JAC questions have `hasPhoto: true`. No images exist in `public/jac-photos/`.

**Option A (interim — implement this):** Add a visible warning chip in JACMode/QuizShell for photo questions:

In `src/modes/JACMode.jsx` (or in `src/components/QuizShell.jsx`), find where `q.hint` or question rendering occurs. Add a visible banner when `q.hasPhoto === true`:

```jsx
{
  q.hasPhoto && (
    <div
      style={{
        background: 'rgba(234,179,8,0.12)',
        border: '1px solid rgba(234,179,8,0.4)',
        borderRadius: 8,
        padding: '6px 12px',
        marginBottom: 8,
        fontSize: 12,
        color: '#ca8a04',
      }}
    >
      📷 Soal ini aslinya menggunakan foto/diagram dari buku JAC. Keterangan:{' '}
      {q.photoDesc || 'Lihat buku ujian JAC.'}
    </div>
  );
}
```

Commit: `fix(JACMode): DB-1 add photo-required banner for hasPhoto questions`

## DB-6: Empty track categories

**File:** `src/data/categories.js`

Track categories `doboku_doko`, `doboku_hoso`, `doboku_haisui`, `kenchiku_kutai`, `kenchiku_shiage` have 0 cards. Content was migrated to common categories in v4.18.0.

**Decision required:** These categories are either:

- A) Kept as placeholders for future Ch.5+ content → add `placeholder: true` flag + note
- B) Removed from categories.js if no plans to populate them

**Check first:** Run `node -e "import('./src/data/cards.js').then(m => console.log([...new Set(m.CARDS.map(c=>c.category))].sort().join('\n')))"` to confirm no card uses these categories.

If confirmed empty → implement option A (add `placeholder: true, note: 'Future Ch.5+ content'`).

Commit: `fix(categories): DB-6 mark empty track categories as placeholder`

## DB-7: ANGKA_KUNCI null kartu

**File:** `src/data/angka-kunci.js`

Find entries `"90 detik/soal"` and `"65%"`. These are exam meta-entries. They should have a comment noting why `kartu: null` is intentional:

```js
{
  angka: '90 detik/soal',
  // kartu: null — exam meta rule, no flashcard linked (intentional)
  kartu: null,
  ...
}
```

Commit: `fix(angka-kunci): DB-7 add comment for intentional kartu:null entries`

## DB-8

Covered by ENG-9 (validate-data.mjs duplicate ID check). No additional work.

---

## Final Steps

1. `npm run lint && npm test -- --run && npm run build`
2. Bump → `4.20.10`, update CHANGELOG + \_MAP.md, push

## Done when

- [ ] DB-1 photo banner shown in JACMode for hasPhoto questions
- [ ] DB-6 empty categories marked placeholder
- [ ] DB-7 null kartu entries have comment
- [ ] Tests pass; version 4.20.10
