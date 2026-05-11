# Session Starter Prompt — content-dq branch

```
Repo: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
Token: [your token here]
Branch: content-dq

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git

## KONTEKS SESI INI

Baca DATA_QUALITY_HANDOFF_v16.md dan PROGRESS.md sebelum apapun.
Canonical source of truth ada di sana. Last commit: e0e689b

Tujuan branch content-dq: data hygiene, housekeeping, accuracy — sampai
semua 1,443 cards 100% akurat dan bersih.

---

## STATE SAAT INI (per session 17)

Semua task aktif di content-dq SELESAI:
- ✅ G1: type-based filtering (useTrackedCards, FilterPopup, FocusMode)
- ✅ G2: source fix — 2 hukum cards (id:1184 → vocab-supplementary, id:1233 → jac-gakka1)
- ✅ W1: wayground taxonomy restructure + set rename (wg/wp → wgl/wglv/wtv)
- ✅ ADM1–ADM8: admin hygiene passes (session 13–17)

Hanya blocked items yang tersisa:
- ⏸ P21: jac-doboku.js + jac-kenchiku.js — tunggu PDF JAC resmi
- ⏸ PDF Viewer Mode — tunggu URL PDF resmi JAC dari owner

---

## TASK SESI INI

### Opsi: Merge prep — verifikasi branch siap merge ke main

Kalau owner ingin melanjutkan ke merge, langkah-langkahnya:

1. Verifikasi data integrity:
   - Total cards: 1,443 ✅
   - Source counts post-G2: vocab-teori:18, vocab-supplementary:272, jac-gakka1:6
   - Type counts: vocab:655, konsep:692, hukum:96

2. Storage migration note (UNTUK AGENT DI MAIN):
   - W1 = breaking change: set IDs di-rename (wg/wp → wgl/wglv/wtv)
   - Di main: wiring STORAGE_VERSION bump + migration (v_current → v_next) required
   - Jangan lupa update wayground-sets.js di main agar ID-nya cocok

### Kalau owner punya task baru: tulis di sini sebelum sesi dimulai.

---

## RULES

- Baca handoff v16 + PROGRESS.md dulu — jangan asumsi state
- Audit actual file sebelum edit
- Commit per task: format ARCH: [task] — [deskripsi singkat]
- Update PROGRESS.md (centang [x]) setiap task selesai, sebelum commit
- Jangan push ke main
- Kalau ada ambiguitas → catat di handoff, tanya owner, jangan lanjut
- jac-doboku.js dan jac-kenchiku.js jangan disentuh
```
