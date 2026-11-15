// ─── data/jac-official.js ─────────────────────────────────────────────────────
// Official JAC exam questions: Theory (学科 - common) + Practical (実技 - track-specific).
// ─────────────────────────────────────────────────────────────────────────────

import { JAC_TEORI } from './sets/jac/jac-teori.js';
import { JAC_LIFELINE } from './sets/jac/jac-lifeline.js';
import { JAC_KENCHIKU } from './sets/jac/jac-kenchiku.js';

export { JAC_TEORI } from './sets/jac/jac-teori.js';
export { JAC_LIFELINE } from './sets/jac/jac-lifeline.js';
export { JAC_KENCHIKU } from './sets/jac/jac-kenchiku.js';

// Backward-compat shim — default lifeline pool (95 questions)
export const JAC_OFFICIAL = [...JAC_TEORI, ...JAC_LIFELINE];

/**
 * Returns JAC Official exam questions for the given track ('lifeline' | 'kenchiku').
 * Sourced from official JAC exam sample sets.
 * @param {string} [track='lifeline']
 * @returns {Array}
 */
export function getJacOfficial(track = 'lifeline') {
  if (track === 'kenchiku') {
    return [...JAC_TEORI, ...JAC_KENCHIKU];
  }
  return [...JAC_TEORI, ...JAC_LIFELINE];
}
