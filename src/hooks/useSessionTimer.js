// src/hooks/useSessionTimer.js
// OVERHAUL-2: Centralized session duration tracking.
// Eliminates per-mode useRef(Date.now()) boilerplate across 14 call sites.
import { useRef } from 'react';

export function useSessionTimer() {
  const startRef = useRef(Date.now());
  return {
    getDurationMs: () => Date.now() - startRef.current,
    reset: () => { startRef.current = Date.now(); },
  };
}
