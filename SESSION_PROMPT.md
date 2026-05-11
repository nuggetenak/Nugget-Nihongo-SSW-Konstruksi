# Session Starter Prompt — content-dq branch

```
Repo: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
Token: [your token here]
Branch: content-dq

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git

## KONTEKS SESI INI

Baca DATA_QUALITY_HANDOFF_v16.md dan PROGRESS.md sebelum apapun.
Canonical source of truth ada di sana. Last commit: a8f6e82

Tujuan branch content-dq: data hygiene, housekeeping, accuracy — sampai
semua 1,443 cards 100% akurat dan bersih.

---

## TASK SESI INI (SATU TASK SAJA)

### Opsi A — Ganti source-based filtering ke type-based filtering

STEP 1 — Audit data dulu, jangan langsung eksekusi:
- Cek: apakah semua 655 vocab-type cards benar-benar punya type: 'vocab'?
- Cek: apakah semua 692 konsep-type cards benar-benar punya type: 'konsep'?
- Cek: apakah semua 96 hukum-type cards benar-benar punya type: 'hukum'?
- Temukan anomali → laporkan ke owner sebelum lanjut

STEP 2 — Setelah owner konfirmasi audit result, baru fix:
1. src/hooks/useTrackedCards.js
   Ganti: VOCAB_SOURCES.includes(c.source)
   Jadi:  c.type === 'vocab'

2. src/components/FilterPopup.jsx
   Ganti: isVocab = VOCAB_SOURCES.includes(c.source)
   Jadi:  isVocab = c.type === 'vocab'

3. src/modes/FocusMode.jsx
   Ganti: !VOCAB_SOURCES.includes(c.source)
   Jadi:  c.type !== 'vocab'

4. Fix 6 hukum cards yang source-nya vocab-teori
   (id: 1167, 1168, 1169, 1184, 1233, 1237)
   → Audit dulu: source yang tepat apa? Jangan assume.

STEP 3 — Setelah semua fix: jalankan test suite, pastikan passing.

---

## RULES

- Baca handoff v16 + PROGRESS.md dulu — jangan asumsi state
- Audit actual file sebelum edit
- Commit per task: format ARCH: [task] — [deskripsi singkat]
- Update PROGRESS.md (centang [x]) setiap task selesai, sebelum commit
- Jangan push ke main
- Kalau ada ambiguitas → catat di handoff, tanya owner, jangan lanjut
- jac-doboku.js dan jac-kenchiku.js jangan disentuh
- JANGAN kerjakan selain Opsi A di sesi ini
  (PDF viewer, v87 comparison, P21 = defer ke sesi berikutnya)
```
