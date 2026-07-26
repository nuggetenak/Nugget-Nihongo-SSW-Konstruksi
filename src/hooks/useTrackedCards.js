// src/hooks/useTrackedCards.js
// Centralized filtered-cards hook — eliminates repeated filter logic across modes.
import { useMemo } from 'react';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useProgress } from '../contexts/ProgressContext.jsx';

/**
 * @param {object} opts
 * @param {string} opts.track - 'lifeline' (doboku/kenchiku removed session 24, see HANDOFF.md)
 * @param {boolean} [opts.excludeVocab=false] - exclude cards with type === 'vocab'
 * @param {string|null} [opts.category=null] - filter to a single category key
 * @param {string|null} [opts.source=null] - filter to a single source key
 * @param {boolean} [opts.knownOnly=false]
 * @param {boolean} [opts.unknownOnly=false]
 * @param {boolean} [opts.starredOnly=false]
 * @returns {Card[]}
 */
export function useTrackedCards({
  track,
  excludeVocab = false,
  category = null,
  source = null,
  knownOnly = false,
  unknownOnly = false,
  starredOnly = false,
} = {}) {
  const { known, unknown, starred } = useProgress();
  return useMemo(() => {
    const trackCats = getCatsForTrack(track);
    return CARDS.filter((c) => {
      if (!trackCats.includes(c.category)) return false;
      if (excludeVocab && c.type === 'vocab') return false;
      if (category && c.category !== category) return false;
      if (source && c.source !== source) return false;
      if (knownOnly && !known.has(c.id)) return false;
      if (unknownOnly && !unknown.has(c.id)) return false;
      if (starredOnly && !starred.has(c.id)) return false;
      return true;
    });
  }, [track, excludeVocab, category, source, knownOnly, unknownOnly, starredOnly, known, unknown, starred]);
}
