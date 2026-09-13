// ─── contexts/SRSContext.jsx ──────────────────────────────────────────────────
// Wraps useSRS hook, scoped to the current track's card IDs.
// Provides SRS state to the whole tree without prop drilling.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo } from 'react';
import { CARD_IDS, cardIdsForCategories } from '../data/card-index.js';
import { getCatsForTrack } from '../data/categories.js';
import { useSRS } from '../hooks/useSRS.js';
import { useApp } from './AppContext.jsx';

const SRSCtx = createContext(null);

export function SRSProvider({ children }) {
  const { track } = useApp();

  // Ids and categories, from the generated index rather than from `cards.js`. This
  // is the import that put 212 kB (gzipped) of card *content* on the critical path
  // of every first page view to produce a list of integers: SRSProvider wraps the
  // whole tree, so `cards.js` was fetched and parsed before anything rendered.
  // Splitting it into its own chunk (vite.config.js) helps caching and not timing.
  const trackCardIds = useMemo(() => {
    if (!track) return CARD_IDS;
    return cardIdsForCategories(getCatsForTrack(track));
  }, [track]);

  // useSRS returns a memoised object keyed on its own store revision, so there
  // is nothing left to re-memoise here. This used to rebuild the value from a
  // hand-listed subset of srs's keys that left `stats` out, which meant a review
  // that changed the stats without changing the due count handed consumers the
  // previous render's numbers. See useSRS for the fix.
  const srs = useSRS(trackCardIds);

  return <SRSCtx.Provider value={srs}>{children}</SRSCtx.Provider>;
}

export function useSRSContext() {
  const ctx = useContext(SRSCtx);
  if (!ctx) throw new Error('useSRSContext must be used within SRSProvider');
  return ctx;
}
