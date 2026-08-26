// ─── useSpeakErrorHandler.js ────────────────────────────────────────────────
// Item 54 (2026-08-26): DengarMode was the only one of six speakJP() call
// sites wiring the onError callback item 25 added -- the other five failed
// silently. Extracted DengarMode's own pattern (toast + online-status
// differentiation + warn-once) into a shared hook for those five, rather
// than copy-pasting the same logic five times.
//
// DengarMode itself is deliberately left using its own local implementation,
// not refactored onto this hook -- it resets its warned-flag between
// sessions (line ~78, `warnedRef.current = false` on restart) so the warning
// can fire again in a fresh session rather than staying silenced from a
// previous one. This hook doesn't expose a reset, and adding one just to
// make DengarMode's refactor possible would be scope creep for an item about
// the five *missing* sites, not about improving the one that already works.
// Touching already-correct code for a purely cosmetic "one implementation"
// win wasn't worth the risk to something that isn't broken.
//
// warnedRef fires the toast only once per mode-session -- if TTS is broken
// (no voice installed, browser doesn't support it), every subsequent tap of
// a speaker button would otherwise re-toast identically, which is noise, not
// information, after the first one.
import { useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useOnlineStatus } from './useOnlineStatus.js';

export function useSpeakErrorHandler() {
  const { toast } = useApp();
  const online = useOnlineStatus();
  const warnedRef = useRef(false);

  return useCallback(() => {
    if (warnedRef.current) return;
    warnedRef.current = true;
    toast.show(
      online
        ? '🔇 Audio gagal diputar. Coba lagi atau lanjutkan tanpa suara.'
        : '📶 Audio tidak tersedia offline di perangkat ini.',
      { type: 'error', duration: 5000 }
    );
  }, [toast, online]);
}
