// ─── useSRS.js ────────────────────────────────────────────────────────────────
// React hook — bridges the SRS engine to the component tree.
// localStorage is synchronous, so init is instant — no loading state needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { initStore } from '../srs/fsrs-store.js';
import {
  recordReview,
  getDueCardIds,
  getSRSStats,
  getCardSRSInfo,
  previewIntervals,
} from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';

export function useSRS(trackCardIds = []) {
  // initStore() is synchronous — runs immediately, no async needed
  const [, forceRender] = useState(0);
  const idsRef = useRef(trackCardIds);

  // Initialize store once (idempotent)
  initStore();

  // Keep ref current
  useEffect(() => {
    idsRef.current = trackCardIds;
  }, [trackCardIds]);

  // Derived values — recomputed on every render (cheap, all in-memory)
  const dueCount = getDueCardIds(trackCardIds).length;
  const stats = getSRSStats(trackCardIds);

  // Record a review — updates store + triggers re-render for dueCount/stats
  const review = useCallback((cardId, rating) => {
    const result = recordReview(cardId, rating);
    forceRender((n) => n + 1);
    return result;
  }, []);

  const getDue = useCallback(() => getDueCardIds(idsRef.current), []);
  const getInfo = useCallback((id) => getCardSRSInfo(id), []);
  const previewFor = useCallback((id) => previewIntervals(id), []);

  return {
    ready: true, // always ready — localStorage is synchronous
    dueCount,
    stats,
    review,
    getDue,
    getInfo,
    previewFor,
    RATING_META,
  };
}
