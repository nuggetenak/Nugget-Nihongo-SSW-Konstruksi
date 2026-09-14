// ─── Toast.jsx ────────────────────────────────────────────────────────────────
// Swipe-left dismiss, type prop (default|success|error|warning|anxiety).
// Stack bottom offset lives in Toast.module.css as --toast-offset, set
// conditionally by AppShell + global.css (item 1, 2026-08-20) — previously a
// hardcoded inline T.navH + 12, which put the stack 76px above nothing on
// desktop and on every mode screen (chrome='mode' has no bottom pill).
//
// item 16 (2026-08-24): queues rather than discards past MAX_VISIBLE, clears
// its own timers (was a leak — see below), role="alert" vs role="status"
// instead of a status role fighting its own aria-live override, Escape
// dismisses the frontmost toast, hover/focus pauses auto-dismiss. Convention
// for when a toast is the right vehicle at all now lives in
// docs/COMPONENT_SPEC.md rather than nowhere.
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useExitTransition } from '../hooks/useExitTransition.js';
import { isTypingTarget } from '../utils/keyboard.js';
import S from './Toast.module.css';

const ToastCtx = createContext(null);

// Concurrent on-screen cap. A queue holds the rest and shows them as slots
// free, rather than the old behaviour of silently discarding whichever toast
// didn't fit — a milestone toast and a quota error landing together used to
// mean one of them just never appeared.
const MAX_VISIBLE = 2;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const queueRef = useRef([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    // The dequeue happens here, outside the updater. It used to be a
    // `queueRef.current.shift()` *inside* the `setToasts` callback, and an updater
    // has to be pure: React is free to call it twice for one update, at which
    // point the second call shifts a second toast out of the queue and returns it
    // in place of the first — so a queued toast is consumed without ever being
    // shown. React 19 makes no purity promise, and the queue exists precisely
    // because silently dropping a toast (a milestone landing with a quota error)
    // was item 16's bug. Re-introducing it through the back door of an impure
    // updater would be a poor trade.
    const promoted = queueRef.current.length > 0 ? queueRef.current.shift() : null;
    setToasts((ts) => {
      const remaining = ts.filter((t) => t.id !== id);
      // Nothing was dismissed (a duplicate dismiss for the same id, or an id that
      // has already gone) so the slot it would have freed does not exist. Put the
      // promoted toast back rather than showing it over the cap.
      if (remaining.length === ts.length) {
        if (promoted) queueRef.current.unshift(promoted);
        return ts;
      }
      if (promoted && remaining.length < MAX_VISIBLE) return [...remaining, promoted];
      if (promoted) queueRef.current.unshift(promoted);
      return remaining;
    });
  }, []);

  const show = useCallback(
    (
      message,
      { undo, actionLabel = 'Batalkan', duration = 3500, type = 'default', priority = false } = {}
    ) => {
      const id = ++nextId.current;
      const toast = { id, message, undo, actionLabel, type, duration };
      setToasts((ts) => {
        if (ts.length < MAX_VISIBLE) return [...ts, toast];
        if (priority) queueRef.current.unshift(toast);
        else queueRef.current.push(toast);
        return ts;
      });
      return id;
    },
    []
  );

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      <div className={S.stack} aria-atomic="false">
        {toasts.map((t, i) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} isFront={i === toasts.length - 1} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast: t, onDismiss, isFront }) {
  const touchStart = useRef(null);
  const [paused, setPaused] = useState(false);
  // `toastIn` existed and nothing played it in reverse: a toast arrived with
  // weight and then was simply gone mid-stack, which also made the stack jump
  // as the ones below it moved up. The `toastOut` keyframe was deleted in the
  // 2026-09-04 consolidation as unreferenced -- it had never been wired, not
  // stopped being used. The provider owns the array, so the item cannot keep
  // itself alive; it delays telling the provider instead.
  const { closing, requestClose } = useExitTransition(() => onDismiss(t.id));

  // Owns its own timer so cleanup is automatic: pausing, manual dismissal
  // (this component unmounts, the effect's cleanup runs), and provider
  // unmount all clear it the same way, via React's own effect lifecycle,
  // instead of a hand-tracked timer map that has to remember every exit.
  useEffect(() => {
    if (paused) return;
    const handle = setTimeout(() => requestClose(), t.duration);
    return () => clearTimeout(handle);
  }, [paused, t.duration, requestClose]);

  // Escape dismisses the frontmost (most recently shown) toast, and it lives
  // here rather than on the provider so it goes out through `requestClose` like
  // every other dismissal. On the provider it called `dismiss(id)` directly,
  // which after item 148 would mean the close button animated the toast away
  // and Escape made it vanish -- one component leaving two different ways
  // depending on how you dismissed it, which is the exact defect the sheet's
  // `useSheetClose` exists to prevent.
  //
  // Each mounted toast subscribes and only the front one acts, which also
  // retires the `toastsRef` mirror the provider kept solely to answer "which is
  // frontmost" from inside an event handler.
  //
  // Guarded against typing targets so it doesn't fight an input's own Escape
  // behaviour (e.g. clearing a search field) — same guard item 31 added for the
  // first global key handler in this app, reused rather than reinvented (see
  // utils/keyboard.js).
  useEffect(() => {
    if (!isFront) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || isTypingTarget(e)) return;
      requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFront, requestClose]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (delta > 60) requestClose(); // swipe left 60px → dismiss
    touchStart.current = null;
  };

  // role="alert" carries an implicit aria-live="assertive" — the correct
  // pairing for something genuinely interrupting. role="status" carries an
  // implicit "polite". Previously this was always role="status" with
  // aria-live sometimes overridden to "assertive", which is the exact
  // contradiction the plan flagged: screen readers vary on how they resolve
  // a role and its implicit live-region setting being fought like that.
  const isAlert = t.type === 'error';

  return (
    <div
      className={S.toast}
      data-closing={closing}
      data-type={t.type ?? 'default'}
      role={isAlert ? 'alert' : 'status'}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={S.msg}>{t.message}</span>
      {t.undo && (
        <button
          className={S.btnUndo}
          onClick={() => {
            // Undo runs immediately; only the toast's removal waits for its
            // exit. Delaying the undo itself would make the button feel
            // unresponsive for the sake of an animation.
            t.undo();
            requestClose();
          }}
          aria-label={t.actionLabel}
        >
          {t.actionLabel}
        </button>
      )}
      <button className={S.btnClose} onClick={() => requestClose()} aria-label="Tutup notifikasi">
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
