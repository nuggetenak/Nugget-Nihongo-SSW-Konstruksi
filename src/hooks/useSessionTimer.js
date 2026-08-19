// src/hooks/useSessionTimer.js
// Centralized session duration tracking.
import { useRef } from 'react';

export function useSessionTimer() {
  const startRef = useRef(Date.now());
  return {
    getDurationMs: () => Date.now() - startRef.current,
    reset: () => {
      startRef.current = Date.now();
    },
  };
}
