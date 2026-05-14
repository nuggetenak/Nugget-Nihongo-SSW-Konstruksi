# Session Starter Prompt — content-dq branch

```
Repo: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
Token: [your token here]
Branch: content-dq

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git

## KONTEKS SESI INI

Baca DATA_QUALITY_HANDOFF_v17.md dan PROGRESS.md sebelum apapun.
Canonical spec ada di docs/CARD_CONTENT_SPEC.md.
Last commit: 319f2c8

Tujuan branch content-dq: data hygiene, housekeeping, accuracy — sampai
semua 1,443 cards dan 1,142 soal 100% akurat dan bersih.

---

## STATE SAAT INI (per session 18)

ADM10 selesai: consolidated spec di-commit, admin docs di-sync.

**TASK AKTIF — lihat PROGRESS.md untuk checklist lengkap:**

🔴 P0 BLOCKING: Fix encoding corrupt (id=476,773) + 12 nested ruby
🟠 P1–P5: Ruby jp/desc, field fixes cards, duplicate resolution, desc truncation
🟡 P9: angka-kunci — 3 null kartu, 28 naked soal
🟡 P7: JAC exp corruption (12 entries berakhir backslash)
⏳ P16/P17: wglv split + jac-mockup rename (OD-2/OD-3 pending owner confirm)
⏳ P8a: Ruby standard question sets (setelah P7+P17)
⏳ P8b/P10/P11: wglv ruby + quality (setelah P16)

**Blocked (unchanged):**
- ⏸ P21: jac-doboku.js + jac-kenchiku.js — tunggu PDF JAC resmi
- ⏸ PDF Viewer Mode — tunggu URL PDF resmi JAC dari owner

**Open decisions dari owner sebelum P6/P16/P17/P12 bisa dikerjakan:**
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
