# TASK v4.20.15 — ENG-11: useTrackedCards Hook + Migrate Sites
**Status:** READY | **Effort:** Medium | **Depends on:** v4.20.14 DONE

## Goal
Create `hooks/useTrackedCards.js` and replace ~15 repeated filter-cards patterns across modes.

---

## Step 1 — Create `src/hooks/useTrackedCards.js`

```js
// src/hooks/useTrackedCards.js
// ENG-11: Centralized filtered-cards hook.
// Replaces ~15 sites that repeat getCatsForTrack(track) + CARDS.filter().
import { useMemo } from 'react';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack, VOCAB_SOURCES } from '../data/categories.js';
import { useProgress } from '../contexts/ProgressContext.jsx';

/**
 * @param {object} opts
 * @param {string} opts.track - 'doboku' | 'kenchiku' | 'lifeline'
 * @param {boolean} [opts.excludeVocab=false] - exclude cards with VOCAB_SOURCES source
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
      if (excludeVocab && VOCAB_SOURCES.includes(c.source)) return false;
      if (category && c.category !== category) return false;
      if (source && c.source !== source) return false;
      if (knownOnly && !known.has(c.id)) return false;
      if (unknownOnly && !unknown.has(c.id)) return false;
      if (starredOnly && !starred.has(c.id)) return false;
      return true;
    });
  }, [track, excludeVocab, category, source, knownOnly, unknownOnly, starredOnly, known, unknown, starred]);
}
```

Add to `src/hooks/index.js`:
```js
export { useTrackedCards } from './useTrackedCards.js';
```

---

## Step 2 — Find migration sites

Run this to find all sites to migrate:
```bash
grep -rn "getCatsForTrack\|CARDS\.filter\|trackCats" src/modes/ src/components/ --include="*.jsx" --include="*.js" | grep -v ".test."
```

For each site: replace the local `useMemo` filter block with `useTrackedCards({ track, ...options })`.

**Common migration pattern:**
```js
// BEFORE (typical site):
const trackCats = useMemo(() => getCatsForTrack(track), [track]);
const cards = useMemo(() =>
  CARDS.filter((c) => trackCats.includes(c.category)),
[trackCats]);

// AFTER:
const cards = useTrackedCards({ track });
```

**Site with excludeVocab:**
```js
// BEFORE:
const cards = useMemo(() =>
  CARDS.filter(c => trackCats.includes(c.category) && !VOCAB_SOURCES.includes(c.source))
, [trackCats]);

// AFTER:
const cards = useTrackedCards({ track, excludeVocab: true });
```

**Site with known/unknown:**
```js
// BEFORE:
const unknownCards = useMemo(() =>
  allCards.filter(c => !known.has(c.id))
, [allCards, known]);

// AFTER:
const unknownCards = useTrackedCards({ track, unknownOnly: true });
```

Migrate as many sites as cleanly fit this pattern. Sites with more complex filters (multiple conditions, chained filters) can be left for a follow-up. Don't force-fit.

---

## Step 3 — Write test

Add to `src/tests/hooks.test.js` (or create `src/tests/useTrackedCards.test.js`):

```js
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrackedCards } from '../hooks/useTrackedCards.js';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';

const wrapper = ({ children }) => <ProgressProvider>{children}</ProgressProvider>;

describe('useTrackedCards', () => {
  it('returns cards for lifeline track', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper });
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every(c => typeof c.id === 'number')).toBe(true);
  });

  it('excludeVocab filters out vocab sources', () => {
    const all = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper }).result.current;
    const noVocab = renderHook(() => useTrackedCards({ track: 'lifeline', excludeVocab: true }), { wrapper }).result.current;
    expect(noVocab.length).toBeLessThanOrEqual(all.length);
  });

  it('returns empty array for category with no cards', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline', category: 'nonexistent' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });
});
```

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass (add new tests)
3. `npm run build`
4. Bump → `4.20.15`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] useTrackedCards.js created
- [ ] hooks/index.js updated
- [ ] Sites migrated (at least the clean-pattern ones)
- [ ] useTrackedCards tests added
- [ ] All tests pass; version 4.20.15
