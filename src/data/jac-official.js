// Backward-compat shim — imports from split files
import { JAC_TEORI } from './jac-teori.js';
import { JAC_LIFELINE } from './jac-lifeline.js';
import { JAC_DOBOKU } from './jac-doboku.js';
import { JAC_KENCHIKU } from './jac-kenchiku.js';
export const JAC_OFFICIAL = [...JAC_TEORI, ...JAC_LIFELINE, ...JAC_DOBOKU, ...JAC_KENCHIKU];
