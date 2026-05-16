# Session Starter Prompt — content-dq branch

```
Repo: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
Token: [your token here]
Branch: content-dq

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git

## KONTEKS SESI INI

Baca DATA_QUALITY_HANDOFF_v17.md dan PROGRESS.md sebelum apapun.
Canonical spec ada di docs/CARD_CONTENT_SPEC.md.
Last commit: afe24e5
⚠️ SESSION_PROMPT intentionally records one commit behind (self-referential limitation — see DATA_QUALITY_HANDOFF_v17.md)

Tujuan branch content-dq: data hygiene, housekeeping, accuracy — sampai
semua 1,438 cards dan 1,142 soal 100% akurat dan bersih.
(5 kartu sudah dihapus: id=374,592,484,518,982 — total turun dari 1,443)

---

## STATE SAAT INI (per session 20)

**✅ SELESAI s/d session 20:**
- P0–P5, P7, P9: semua done (lihat PROGRESS.md)
- ADMIN: integrity checks clean — 1,438 IDs, no dups, mirrors konsisten, no orphaned related_card_id
- P17 dirty state: resolved OPSI B (jac-mockup files tidak pernah ter-commit)
- P8a items 1,3,4,5: DONE — sets/jac/ + sets/quiz/ annotated; wayground/ + wtv01 sudah bersih

**TASK AKTIF BERIKUTNYA:**

🟡 P8a item 2: `sets/jac-mockup/` — tunggu P17/OD-3 owner confirm
🟡 P8b: Ruby wglv — tunggu P16/OD-2 owner confirm
🟡 P10/P11: wglv quality — tunggu P16
🟡 P14: Type reclassification (bisa mulai kapan saja)
🟡 P15: Usage expansion (bisa mulai kapan saja)

**Blocked (OD pending owner):**
- ⏸ P16 (OD-2): wglv split
- ⏸ P17 (OD-3): jac-mockup rename
- ⏸ P6 (OD-1): source reclassification
- ⏸ P12/P13: furi drop + post-reclassify (setelah P6)

**Deferred (butuh AGENT 12 review):**
- EF接合 triple (id=459,612,613) — P4 deferred
- 6 ambiguous jp pairs (124/842, 299/858, 862/309, 438/911, 482/819, 416/1182)
- id=1240 source fix

**Open decisions:**
- OD-1: source reclassification (P6)
- OD-2: wglv split timing (P16)
- OD-3: jac-mockup rename timing (P17)
- OD-4: wglv02/03 hint direction (P10)
- OD-5: SSW Flashcards furi usage (P12)

---

## RULES

- Baca handoff v17 + PROGRESS.md dulu — jangan asumsi state
- Audit actual file sebelum edit
- Commit per task: format CONTENT: [task] — [deskripsi singkat]
- Update PROGRESS.md (centang [x]) setiap task selesai, sebelum commit
- Jangan push ke main
- Kalau ada ambiguitas → catat di handoff, tanya owner, jangan lanjut
- jac-doboku.js dan jac-kenchiku.js jangan disentuh
- Mirror edits: edit split file → juga update source/cards-*.js → juga update cards.js
```
