// ─── useExitGuard.js ──────────────────────────────────────────────────────────
// Lets a mode veto leaving the mode area while it has unsaved in-progress state.
//
// Exists because the back control moved into ModeHeader (2026-09-04). Before
// that, every mode drew its own, so SimulasiMode could route its own button
// through a "you'll lose this exam" confirmation and nothing else needed to
// know. One shared control means one shared way to say "ask me first" —
// otherwise the header's arrow silently discards a half-finished exam.
//
// `guard` returns (or resolves to) true to allow the exit, false to cancel it.
// Pass null/undefined when there is nothing to protect, which is the normal
// state for most modes most of the time — the guard is registered and retired as
// that changes, so a mode can hand over `phase === 'playing' ? confirmExit :
// null` and never think about deregistration.
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';

export function useExitGuard(guard) {
  const { registerExitGuard } = useApp();
  useEffect(() => {
    if (!guard || !registerExitGuard) return undefined;
    return registerExitGuard(guard);
  }, [guard, registerExitGuard]);
}
