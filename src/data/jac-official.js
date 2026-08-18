// Backward-compat shim — imports from the new-schema split files
// (src/data/sets/jac/, migrated at merge time — see CHANGELOG.md)
import { JAC_TEORI } from './sets/jac/jac-teori.js';
import { JAC_LIFELINE } from './sets/jac/jac-lifeline.js';
export const JAC_OFFICIAL = [...JAC_TEORI, ...JAC_LIFELINE];
