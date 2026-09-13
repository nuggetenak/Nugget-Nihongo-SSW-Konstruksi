/**
 * JSDoc typedefs for the shapes that cross module boundaries.
 *
 * Re-derived from the real data on 2026-09-13, because this file had drifted into
 * saying things that were not true and nothing imports it, so nothing complained.
 * What it claimed, against what the code does:
 *
 *   - `Card.id: string`. Card ids are **numbers**, and that is load-bearing:
 *     `recordWrong` rejects a non-integer id outright (item 129), `progress.quizWrong`
 *     is keyed by integer, and `audit-integrity.mjs` fails on a non-numeric id. A
 *     typedef telling the next author to pass a string would have them writing a bug
 *     the runtime then silently drops.
 *   - `Card.furi`. No card has ever carried this field — zero of 1,626. `furi` is a
 *     *prop* on JpFront, supplied by a caller, not data on a card.
 *   - `SRSState` described `{ interval, repetitions, due: number, lastRating }`,
 *     which is a pre-FSRS shape. The real serialized card is FSRS's, with an ISO
 *     `due` string, `reps`/`lapses`, and `elapsed_days`/`scheduled_days`. Anything
 *     written against the old shape would have been rejected by `validateSnapshot`
 *     (or worse, accepted and then thrown inside ts-fsrs — see engine.js).
 *
 * The three corrections above are asserted against the shipped data in
 * `src/tests/types-match-data.test.js`, so this file is checkable rather than merely
 * written. A typedef nothing imports and nothing verifies is how the old one got to
 * be wrong for long enough that an external audit had to find it.
 *
 * @typedef {{
 *   id: number,
 *   category: string,
 *   source: string,
 *   jp: string,
 *   type: 'vocab'|'konsep'|'hukum',
 *   id_text: string,
 *   desc: string,
 *   usage?: string
 * }} Card
 *
 * @typedef {{
 *   key: string,
 *   label: string,
 *   emoji: string,
 *   color: string,
 *   tracks: string[]
 * }} Category
 *
 * The FSRS card as it is stored: `serializeCard` in srs/fsrs-core.js writes exactly
 * these fields, and `deserializeCard` reads them back, turning the two date strings
 * into Dates. `state` is ts-fsrs's State enum (0 New … 3 Relearning).
 *
 * @typedef {{
 *   due: string,
 *   stability: number,
 *   difficulty: number,
 *   elapsed_days: number,
 *   scheduled_days: number,
 *   reps: number,
 *   lapses: number,
 *   state: number,
 *   last_review: string|null
 * }} SerializedFSRSCard
 *
 * One entry of the `srs` document's `cards` map, keyed by the card id as a string
 * (localStorage JSON has no numeric keys). `history` is capped at 20 entries.
 *
 * @typedef {{
 *   card: SerializedFSRSCard,
 *   history: Array<{ rating: number, at: string, responseMs?: number|null }>,
 *   reviewed_at?: string
 * }} SRSEntry
 *
 * @typedef {{
 *   key: 'home'|'belajar'|'saya',
 *   label: string,
 *   emoji: string
 * }} Tab
 *
 * @typedef {{
 *   id: number,
 *   message: string,
 *   type?: 'default'|'success'|'error'|'warning'|'anxiety',
 *   undo?: () => void
 * }} ToastItem
 *
 * @typedef {{
 *   days: number,
 *   lastDate: string
 * }} StreakData
 *
 * A question as the three banks write it. Two field dialects exist in this repo on
 * purpose — cards use `jp`/`id_text`/`desc`, questions use `q`/`opts`/`ans` — and the
 * mappers in SimulasiMode and daily-challenge bridge them. `img` is a path relative
 * to `public/`, with no leading slash (a leading one breaks the Pages subpath).
 *
 * @typedef {{
 *   id: number|string,
 *   q: string,
 *   hint?: string,
 *   opts: string[],
 *   opts_id?: string[],
 *   ans: number,
 *   exp?: string,
 *   related_card_id?: number|null,
 *   img?: string|null,
 *   photoDesc?: string|null
 * }} Question
 *
 * @typedef {{
 *   audioEnabled?: boolean,
 *   furiganaPolicy?: 'always'|'tap'|'hidden',
 *   examDate?: string|null
 * }} UserPrefs
 */

// This file is types-only. Import with:
// /** @type {import('./types').Card} */
export {};
