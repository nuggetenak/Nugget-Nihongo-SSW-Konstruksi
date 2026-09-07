// src/hooks/useTrackedCards.js
// Centralized filtered-cards hook — eliminates repeated filter logic across modes.
//
// `excludeVocab` was removed with VOCAB_SOURCES (item 69): no component ever
// passed it, and the distinction it drew — "vocabulary list" against "chapter
// content" — stopped existing when 7.0.0 made one card one term. See the note in
// data/categories.js for the measurement behind that.
import { useMemo } from 'react';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useProgress } from '../contexts/ProgressContext.jsx';

/**
 * @param {object} opts
 * @param {string} opts.track - 'lifeline' (Doboku/Kenchiku tracks removed)
 * @param {string|null} [opts.category=null] - filter to a single category key
 * @param {string|null} [opts.source=null] - filter to a single source key
 * @param {boolean} [opts.knownOnly=false]
 * @param {boolean} [opts.unknownOnly=false]
 * @param {boolean} [opts.starredOnly=false]
 * @returns {Card[]}
 */
export function useTrackedCards({
  track,
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
      if (category && c.category !== category) return false;
      if (source && c.source !== source) return false;
      if (knownOnly && !known.has(c.id)) return false;
      if (unknownOnly && !unknown.has(c.id)) return false;
      if (starredOnly && !starred.has(c.id)) return false;
      return true;
    });
  }, [track, category, source, knownOnly, unknownOnly, starredOnly, known, unknown, starred]);
}
