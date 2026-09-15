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
import { motionAllows } from '../utils/motion.js';
import { useCountUp } from '../hooks/useCountUp.js';
import S from './MissionCompleteOverlay.module.css';

// item 161. Twelve sparks on a ring, CSS only -- no canvas, no library, and no
// fourth production dependency. Each one is a rotate + translate on its own
// hinge, so the whole burst is `transform` and `opacity` and costs a weak GPU
// nothing. Twelve is the count at which the ring reads as a ring rather than as
// scattered dots; more would be a particle system, which is a different thing
// and not one this app needs.
const SPARKS = Array.from({ length: 12 }, (_, i) => i);

export default function MissionCompleteOverlay({ onDone, result }) {
  const [visible, setVisible] = useState(true);
  // The score climbs (item 159). This is the one screen in the app whose
  // purpose is the number, so it is the one that most deserves to arrive.
  const shownCorrect = useCountUp(result?.correct ?? 0);
  // Not rendered at all when the reader has switched celebrations off, rather
  // than rendered and hidden: twelve elements that can never be seen are
  // twelve elements.
  const celebrate = motionAllows('celebrate');

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
      {/* The hazard stripe sweeping across, DESIGN_SPEC §1's own motif spent on
          the one moment the app has to celebrate -- and the reason this reads
          as THIS app finishing a mission rather than as a generic confetti
          screen. --z-celebration and --t-slow were both reserved for this and
          had never been spent on it. */}
      {celebrate && <div className={S.sweep} aria-hidden="true" />}
      <div className={S.inner}>
        {celebrate && (
          <div className={S.burst} aria-hidden="true">
            {SPARKS.map((i) => (
              <span
                key={i}
                className={S.spark}
                style={{ '--spark-i': i, '--spark-a': `${i * 30}deg` }}
              />
            ))}
          </div>
        )}
        <div className={S.icon} aria-hidden="true">
          {result?.icon ?? '🎉'}
        </div>
        <div className={S.title}>Misi Selesai!</div>
        {result?.label && <div className={S.label}>{result.label}</div>}
        {result?.total > 0 && (
          <div className={S.score}>
            {shownCorrect}/{result.total} benar
          </div>
        )}
        <div className={S.hint}>Ketuk atau tekan Esc untuk tutup</div>
      </div>
    </div>
  );
}
