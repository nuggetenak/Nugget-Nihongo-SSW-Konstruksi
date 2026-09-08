// ─── useSRS.js ────────────────────────────────────────────────────────────────
// React hook — bridges the SRS engine to the component tree.
// localStorage is synchronous, so init is instant — no loading state needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initStore } from '../srs/fsrs-store.js';
import {
  recordReview,
  getDueCardIds,
  getSRSStats,
  getCardSRSInfo,
  previewIntervals,
} from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';
import { getAllCards } from '../srs/fsrs-store.js';
import { hesitantCards } from '../utils/hesitation.js';

export function useSRS(trackCardIds = []) {
  // initStore() once — in the useState initializer (runs only on first render).
  // `revision` doubles as the store's change counter: every recorded review
  // bumps it, and the memo below keys off it, so the derived values can be
  // memoised without going stale.
  const [revision, setRevision] = useState(() => {
    initStore();
    return 0;
  });
  const idsRef = useRef(trackCardIds);

  // Keep ref current
  useEffect(() => {
    idsRef.current = trackCardIds;
  }, [trackCardIds]);

  // Derived values. Both walk the whole track (1438 ids), so they're memoised
  // rather than recomputed on every render of a provider that sits near the
  // root — and, more importantly, memoising them here means the returned object
  // can be stable, which is what SRSContext actually needs (see below).
  const { dueCount, stats, hesitation } = useMemo(
    () => ({
      dueCount: getDueCardIds(trackCardIds).length,
      stats: getSRSStats(trackCardIds),
      // Item 58. Derived here rather than in StatsMode so it invalidates on the
      // same revision counter as everything else the SRS panel shows — the
      // stats memo below already walks the whole store, so this is one more
      // pass over data that is being read anyway, not a new cost.
      hesitation: hesitantCards(getAllCards()),
    }),
    // revision is the dependency that matters: the store is module state, so
    // nothing else here changes when a review is recorded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trackCardIds, revision]
  );

  // Record a review — updates store + bumps revision so the memo recomputes
  // `opts` carries item 58's `responseMs` through to the history entry. Passed
  // as the fourth argument because the third is `now`, which callers do not set.
  const review = useCallback((cardId, rating, opts) => {
    const result = recordReview(cardId, rating, new Date(), opts);
    setRevision((n) => n + 1);
    return result;
  }, []);

  const getDue = useCallback(() => getDueCardIds(idsRef.current), []);
  const getInfo = useCallback((id) => getCardSRSInfo(id), []);
  const previewFor = useCallback((id) => previewIntervals(id), []);

  // One memoised object, so SRSContext can hand it straight to its provider.
  // It used to memoise a hand-listed subset of these keys instead —
  // [srs.dueCount, srs.review, srs.getDue, srs.getInfo, srs.previewFor] — which
  // omitted `stats`. Any change that moved a card between learning/young/mature
  // without changing the due count (rating a due card Again keeps it due) left
  // every consumer of `stats` reading the previous render's numbers: StatsMode's
  // SRS panel, the Dashboard, and the readiness score. Deriving the identity
  // here from the same revision counter the values come from removes the chance
  // of the list and the values disagreeing again.
  return useMemo(
    () => ({
      ready: true, // always ready — localStorage is synchronous
      dueCount,
      stats,
      hesitation,
      review,
      getDue,
      getInfo,
      previewFor,
      RATING_META,
    }),
    [dueCount, stats, hesitation, review, getDue, getInfo, previewFor]
  );
}
