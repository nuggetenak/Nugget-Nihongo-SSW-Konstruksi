// src/utils/date.js
// REF-6: Shared date utilities — all return local timezone dates (not UTC).
// 'sv' locale produces YYYY-MM-DD in local tz — no library needed.

/** Today's date as YYYY-MM-DD in local timezone. */
export function todayStr() {
  return new Date().toLocaleDateString('sv');
}

/** Yesterday's date as YYYY-MM-DD in local timezone. */
export function prevDayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv');
}

/** Convert a UTC ISO string (e.g. session.date) to local YYYY-MM-DD. */
export function isoToLocalDate(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleDateString('sv');
}
