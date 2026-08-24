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
    setToasts((ts) => {
      const remaining = ts.filter((t) => t.id !== id);
      if (remaining.length < MAX_VISIBLE && queueRef.current.length > 0) {
        return [...remaining, queueRef.current.shift()];
      }
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

  // Escape dismisses the frontmost (most recently shown) toast. Guarded
  // against typing targets so it doesn't fight an input's own Escape
  // behaviour (e.g. clearing a search field) — same guard item 31 added for
  // the first global key handler in this app, reused rather than
  // reinvented (see utils/keyboard.js).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || isTypingTarget(e)) return;
      setToasts((ts) => {
        if (ts.length === 0) return ts;
        const top = ts[ts.length - 1];
        dismiss(top.id);
        return ts;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      <div className={S.stack} aria-atomic="false">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast: t, onDismiss }) {
  const touchStart = useRef(null);
  const [paused, setPaused] = useState(false);

  // Owns its own timer so cleanup is automatic: pausing, manual dismissal
  // (this component unmounts, the effect's cleanup runs), and provider
  // unmount all clear it the same way, via React's own effect lifecycle,
  // instead of a hand-tracked timer map that has to remember every exit.
  useEffect(() => {
    if (paused) return;
    const handle = setTimeout(() => onDismiss(t.id), t.duration);
    return () => clearTimeout(handle);
  }, [paused, t.id, t.duration, onDismiss]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (delta > 60) onDismiss(t.id); // swipe left 60px → dismiss
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
            t.undo();
            onDismiss(t.id);
          }}
          aria-label={t.actionLabel}
        >
          {t.actionLabel}
        </button>
      )}
      <button className={S.btnClose} onClick={() => onDismiss(t.id)} aria-label="Tutup notifikasi">
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
