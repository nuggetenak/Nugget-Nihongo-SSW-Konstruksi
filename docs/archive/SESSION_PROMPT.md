# Session Starter Prompt — content-dq branch

```
Repo: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
Token: [your token here]
Branch: content-dq

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git

## KONTEKS SESI INI

Baca DATA_QUALITY_HANDOFF_v18.md dulu — khususnya STATUS SUMMARY di paling atas
dan WHAT'S ACTUALLY NEXT di paling bawah. Lalu PROGRESS.md.
Canonical spec ada di docs/CARD_CONTENT_SPEC.md.
Last commit (sebelum sync ini): 81f7c8d
⚠️ SESSION_PROMPT intentionally records one commit behind (self-referential limitation — see DATA_QUALITY_HANDOFF_v18.md)

Tujuan branch content-dq: data hygiene, housekeeping, accuracy — sampai
semua 1,438 cards dan 1,142 soal 100% akurat dan bersih.
(5 kartu sudah dihapus: id=374,592,484,518,982 — total turun dari 1,443)

---

## STATE SAAT INI (per session 22 + session 23 admin sync)

**✅ SELESAI:**
- P0–P5, P7, P9: semua done (lihat PROGRESS.md)
- P8a: SEMUA 5 item done (jac/, jac-mockup pre-rename, wayground, quiz, wtv01) — item 2 selesai session 22, sempat tidak tercatat di v17/SESSION_PROMPT lama
- P14: type reclassification SELESAI — 581 kartu konsep→vocab, konsep sisa 97
- P15: usage expansion SELESAI — 1,092 usage ditambahkan, vocab coverage 100% (1244/1244)
- ADMIN: integrity checks clean — 1,438 IDs, no dups, no orphaned related_card_id

**⚠️ Session 23 admin sync juga menemukan (BELUM diperbaiki, lihat HANDOFF v18 §1D):**
- `type` field corrupt di 5 record `source/cards-*.js` (id=82,83,186,188,201) — literal `\'vocab\'` alih-alih `'vocab'`. `cards.js` sudah benar. Fix mekanis 1 baris × 5, tapi ini edit file content — belum dikerjakan karena scope sync kemarin murni admin/docs.

**TASK AKTIF BERIKUTNYA — baca ini sebelum ambil task pertama yang `[ ]`:**

Semua task yang TIDAK butuh keputusan owner atau materi eksternal — SUDAH SELESAI. Yang tersisa:

🔵 **Butuh keputusan owner (OD-1 s/d OD-5)** — lihat HANDOFF v18 "WHAT'S ACTUALLY NEXT" Bucket 1.
   OD-2 (P16 wglv split) dan OD-3 (P17 jac-mockup rename) membuka jalan paling banyak task lain.
🟡 **Butuh judgment manual/AGENT 12** (tidak nunggu owner) — EF接合 triple, 6 pasangan jp ambigu, id=1240 source, ~64 kanji jp post-compound. Lihat Bucket 2.
⏸ **Blocked materi eksternal (PDF JAC resmi)** — P5 desc truncation, P21, PDF Viewer Mode. Bucket 3.
🟢 **Belum ada nomor task, tapi actionable sekarang tanpa nunggu siapa-siapa:**
   - Fix corruption id=82,83,186,188,201 di atas (mekanis, low-risk)
   - confusion-pairs.js: tambahkan field `track` ke 28 entries (belum ada task number, tidak butuh keputusan owner)

**Open decisions:**
- OD-1: source reclassification (P6)
- OD-2: wglv split timing (P16)
- OD-3: jac-mockup rename timing (P17)
- OD-4: wglv02/03 hint direction (P10)
- OD-5: SSW Flashcards furi usage (P12)

---

## RULES

- Baca handoff v18 + PROGRESS.md dulu — jangan asumsi state
- Audit actual file sebelum edit
- Commit per task: format CONTENT: [task] — [deskripsi singkat] (atau ADMIN: / DOCS: untuk non-content)
- Update PROGRESS.md (centang [x]) setiap task selesai, sebelum commit
- Jangan push ke main
- Kalau ada ambiguitas → catat di handoff, tanya owner, jangan lanjut
- jac-doboku.js dan jac-kenchiku.js jangan disentuh
- Mirror edits: edit split file → juga update source/cards-*.js → juga update cards.js
- Setelah mirror edit ke source/cards-*.js: pastikan file masih valid JS (parse-check) sebelum commit — session 23 nemu 5 record yang jadi invalid syntax gara-gara ini kelewatan
```
