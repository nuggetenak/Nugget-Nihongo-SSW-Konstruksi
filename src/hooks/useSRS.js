// ─── useSRS.js ────────────────────────────────────────────────────────────────
// React hook — wraps the SRS engine for use in components.
//
// Responsibilities:
//   - Initializes the store once on mount (async, non-blocking)
//   - Exposes reactive dueCount so Dashboard/BottomNav can show badges
//   - Provides review(), getDue(), getInfo() as stable callbacks
//   - Keeps the engine and React state in sync after each review
//
// Usage:
//   const srs = useSRS(filteredCardIds);
//   srs.ready          → boolean — false during init
//   srs.dueCount       → number
//   srs.stats          → { total, new, learning, young, mature, due }
//   srs.review(id, r)  → async, records review, returns { entry, interval, isKnown }
//   srs.getDue()       → number[] — due card IDs (current track)
//   srs.getInfo(id)    → { seen, status, strength, R, nextDue, reps, lapses, history }
//   srs.previewFor(id) → { 1: days, 2: days, 3: days, 4: days }
//   srs.RATING_META    → rating button metadata
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
  const [ready, setReady]       = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [stats, setStats]       = useState(null);

  // Keep a ref so callbacks always use the latest track without re-creating
  const idsRef = useRef(trackCardIds);
  useEffect(() => { idsRef.current = trackCardIds; }, [trackCardIds]);

  // ── Init store on mount ─────────────────────────────────────────────────
  useEffect(() => {
    initStore().then(() => {
      setReady(true);
      refreshCounts(trackCardIds);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recompute counts whenever track changes (after ready) ───────────────
  useEffect(() => {
    if (ready) refreshCounts(trackCardIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, trackCardIds.length]);

  // ── Internal: refresh reactive counts ──────────────────────────────────
  function refreshCounts(ids) {
    const due = getDueCardIds(ids);
    setDueCount(due.length);
    setStats(getSRSStats(ids));
  }

  // ── review() — record a rating, refresh state ──────────────────────────
  const review = useCallback(async (cardId, rating) => {
    const result = await recordReview(cardId, rating);
    refreshCounts(idsRef.current);
    return result; // { entry, interval, isKnown }
  }, []);

  // ── getDue() — current due queue ───────────────────────────────────────
  const getDue = useCallback(() => {
    return getDueCardIds(idsRef.current);
  }, []);

  // ── getInfo() — per-card SRS snapshot ─────────────────────────────────
  const getInfo = useCallback((cardId) => {
    return getCardSRSInfo(cardId);
  }, []);

  // ── previewFor() — interval preview per rating (for button hints) ──────
  const previewFor = useCallback((cardId) => {
    return previewIntervals(cardId);
  }, []);

  return {
    ready,
    dueCount,
    stats,
    review,
    getDue,
    getInfo,
    previewFor,
    RATING_META,
  };
}
