// ─── contexts/SRSContext.jsx ──────────────────────────────────────────────────
// Wraps useSRS hook, scoped to the current track's card IDs.
// Provides SRS state to the whole tree without prop drilling.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo } from 'react';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useSRS } from '../hooks/useSRS.js';
import { useApp } from './AppContext.jsx';

const SRSCtx = createContext(null);

export function SRSProvider({ children }) {
  const { track } = useApp();

  const trackCardIds = useMemo(() => {
    if (!track) return CARDS.map((c) => c.id);
    const catKeys = new Set(getCatsForTrack(track));
    return CARDS.filter((c) => catKeys.has(c.category)).map((c) => c.id);
  }, [track]);

  const srs = useSRS(trackCardIds);

  return <SRSCtx.Provider value={srs}>{children}</SRSCtx.Provider>;
}

export function useSRSContext() {
  const ctx = useContext(SRSCtx);
  if (!ctx) throw new Error('useSRSContext must be used within SRSProvider');
  return ctx;
}
