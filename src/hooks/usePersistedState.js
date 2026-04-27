// ─── usePersistedState — Load/save state to persistent storage ───────────────
import { useState, useEffect, useCallback } from "react";
import { loadFromStorage, saveToStorage } from "../utils/wrong-tracker.js";

/**
 * React hook that persists state to window.storage.
 * Loads initial value from storage on mount, saves on every update.
 *
 * @param {string} key         - Storage key
 * @param {*}      defaultVal  - Default value if key doesn't exist
 * @returns {[value, setValue, isReady]} - State tuple + loading flag
 *
 * Usage:
 *   const [wrongCounts, setWrongCounts, ready] = usePersistedState("ssw-wrong-counts", {});
 */
export function usePersistedState(key, defaultVal) {
  const [value, setValue] = useState(defaultVal);
  const [ready, setReady] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadFromStorage(key, defaultVal);
      if (!cancelled) {
        setValue(stored);
        setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped setter that also persists
  const setPersistedValue = useCallback((updater) => {
    setValue(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveToStorage(key, next);
      return next;
    });
  }, [key]);

  return [value, setPersistedValue, ready];
}
