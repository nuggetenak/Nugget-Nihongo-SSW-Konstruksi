// src/hooks/useStableContextValue.js
// ENG-13: Named marker for stable context value pattern.
// NOTE: react-hooks/exhaustive-deps requires useMemo deps to be inline array literals,
// so this cannot wrap useMemo directly. Each context uses useMemo inline instead.
// This export exists for documentation/searchability — used nowhere at runtime.
export const STABLE_CONTEXT_VALUE = 'ENG-13';
