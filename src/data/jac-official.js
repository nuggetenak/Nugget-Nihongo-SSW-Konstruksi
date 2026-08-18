// Backward-compat shim — imports from split files
import { JAC_TEORI } from './jac-teori.js';
import { JAC_LIFELINE } from './jac-lifeline.js';
export const JAC_OFFICIAL = [...JAC_TEORI, ...JAC_LIFELINE];
