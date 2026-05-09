// src/hooks/useStableContextValue.js
// ENG-13: Memoizes a context value object based on deps array.
// Adds dev-only console warning if deps array length changes (structural bug indicator).
import { useMemo, useRef } from 'react';

export function useStableContextValue(buildFn, deps) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lenRef = useRef(null);
    if (lenRef.current !== null && lenRef.current !== deps.length) {
      // eslint-disable-next-line no-console
      console.warn('[useStableContextValue] deps length changed — possible deps array bug');
    }
    lenRef.current = deps.length;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(buildFn, deps);
}
