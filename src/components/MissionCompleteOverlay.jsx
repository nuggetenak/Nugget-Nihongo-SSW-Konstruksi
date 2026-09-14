// ─── components/MissionCompleteOverlay.jsx ────────────────────────────────────
// Tap-to-dismiss overlay. Shows mission label + score, auto-dismiss after 3s.
// Evidence: Clear (2018) — reward must be salient and interactive.
//
// Three things were wrong with it and they had one cause between them: it was
// built out of inline styles and a role that described what it looked like
// rather than what it did.
//
//  1. Its animation ends at opacity 0 and runs `forwards`. The global
//     reduced-motion catch-all zeroes animation-duration, which for an
//     animation like that does not disable it -- it jumps to the end. The one
//     celebration in the app was therefore INVISIBLE to anyone who had asked
//     their device for less motion. Fixing it needed `animation: none`, which
//     an inline style cannot be reached by; hence the stylesheet next door.
//  2. It was `role="status"` while being a full-screen blocker at
//     --z-celebration. GlobalKeyboardLayer stands every key down while a
//     [role="dialog"] or [role="alertdialog"] is mounted, and matched neither --
//     so while this covered the screen, Escape still exited the mode and 1/2/3
//     still switched tabs, invisibly, behind it. SimulasiMode's pause overlay
//     had this right; this did not.
//  3. "Ketuk untuk tutup" was the only way out. No key dismissed it.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react';
import { haptic } from '../utils/haptic.js';
import S from './MissionCompleteOverlay.module.css';

export default function MissionCompleteOverlay({ onDone, result }) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    onDone?.();
  }, [onDone]);

  useEffect(() => {
    // The first call site `haptic.success()` has ever had. DESIGN_SPEC §4 has
    // recorded it as defined-and-unused since item 21, flagging rather than
    // guessing because picking a first use was a product decision. This is the
    // only celebration in the app, which makes it the one place a five-pulse
    // pattern distinct from correct/wrong means something.
    haptic.success();
  }, []);

  useEffect(() => {
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [dismiss]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      // alertdialog, not status: this blocks the whole screen at the app's
      // highest z-index, so the role should say so -- and saying so is what
      // makes GlobalKeyboardLayer's isDialogOpen() recognise it and stand down.
      role="alertdialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label="Misi hari ini selesai"
      onClick={dismiss}
      className={S.overlay}
    >
      <div className={S.inner}>
        <div className={S.icon} aria-hidden="true">
          {result?.icon ?? '🎉'}
        </div>
        <div className={S.title}>Misi Selesai!</div>
        {result?.label && <div className={S.label}>{result.label}</div>}
        {result?.total > 0 && (
          <div className={S.score}>
            {result.correct}/{result.total} benar
          </div>
        )}
        <div className={S.hint}>Ketuk atau tekan Esc untuk tutup</div>
      </div>
    </div>
  );
}
