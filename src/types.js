/**
 * @typedef {{
 *   id: string,
 *   category: string,
 *   source: string,
 *   furi: string,
 *   jp: string,
 *   type: 'vocab'|'konsep'|'hukum',
 *   id_text: string,
 *   desc: string,
 *   quote?: string,
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
 * @typedef {{
 *   cardId: string,
 *   stability: number,
 *   difficulty: number,
 *   interval: number,
 *   repetitions: number,
 *   due: number,
 *   lastRating: number
 * }} SRSState
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
 *   type?: 'default'|'success'|'error'|'warning',
 *   undo?: () => void
 * }} ToastItem
 *
 * @typedef {{
 *   days: number,
 *   lastDate: string
 * }} StreakData
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
