// ─── usePersistedState.js ─────────────────────────────────────────────────────
// React hook: persist state to localStorage (GitHub Pages standalone).
// Initializes synchronously from localStorage — no flash of default value.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/wrong-tracker.js';

export function usePersistedState(key, defaultVal) {
  // Initialize directly from localStorage — synchronous, no useEffect needed
  const [value, setValue] = useState(() => loadFromStorage(key, defaultVal));

  const setPersistedValue = useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(key, next);
      return next;
    });
  }, [key]);

  // Return [value, setter] — drop the `ready` flag, it's always ready now
  return [value, setPersistedValue];
}
