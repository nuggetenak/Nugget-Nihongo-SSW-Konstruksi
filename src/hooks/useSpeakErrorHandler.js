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
//
// ── Only for audio the user asked for (2026-09-04) ──────────────────────────
// Several modes speak automatically on arrival: ReviewMode and DengarMode on
// each new card, ProductionMode and QuizProduksiMode on start. On a phone with
// no ja-JP voice installed -- ordinary on the cheap Android handsets this app is
// built for -- that turned "open Ulasan" into "open Ulasan and get an error
// toast", every session, about a feature the learner never invoked and may not
// want. Caught by watching ReviewMode load in a headless browser, where the same
// thing happens for the same reason.
//
// So the handler now distinguishes: a failure after a deliberate tap on a
// speaker button is worth reporting, because the user is waiting for a sound
// that isn't coming. A failure during autoplay is not -- there is nothing for
// them to do about it and nothing they asked for. Autoplay failures fall back to
// silence, which is exactly what the "lanjutkan tanpa suara" copy was telling
// them to do anyway.
import { useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useOnlineStatus } from './useOnlineStatus.js';

/**
 * @param {{ silentWhenAutomatic?: boolean }} [opts]
 *   Pass `{ silentWhenAutomatic: true }` and call the returned handler with
 *   `{ automatic: true }` from an autoplay path to swallow the toast there while
 *   keeping it for the mode's own speaker buttons.
 */
export function useSpeakErrorHandler() {
  const { toast } = useApp();
  const online = useOnlineStatus();
  const warnedRef = useRef(false);

  return useCallback(
    (event) => {
      // speakJP passes the SpeechSynthesis error event through; our own callers
      // pass { automatic: true }. Anything else is a user-initiated tap.
      if (event?.automatic) return;
      if (warnedRef.current) return;
      warnedRef.current = true;
      toast.show(
        online
          ? '🔇 Audio gagal diputar. Coba lagi atau lanjutkan tanpa suara.'
          : '📶 Audio tidak tersedia offline di perangkat ini.',
        { type: 'error', duration: 5000 }
      );
    },
    [toast, online]
  );
}
