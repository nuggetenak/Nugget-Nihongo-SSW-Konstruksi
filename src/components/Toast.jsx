// ─── Toast.jsx ────────────────────────────────────────────────────────────────
// Note: stack bottom offset is prop-driven (T.navH + 12) — kept inline.
// Swipe-left dismiss, type prop (default|success|error|warning),
//          and type-aware aria-live (assertive for errors, polite for others).
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import S from './Toast.module.css';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { undo, duration = 3500, type = 'default' } = {}) => {
      const id = ++nextId.current;
      setToasts((ts) => [...ts.slice(-1), { id, message, undo, type }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      <div className={S.stack} style={{ bottom: T.navH + 12 }} aria-atomic="false">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast: t, onDismiss }) {
  const touchStart = useRef(null);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (delta > 60) onDismiss(t.id); // swipe left 60px → dismiss
    touchStart.current = null;
  };

  // aria-live: assertive for errors so screen readers interrupt immediately,
  // polite for everything else.
  const live = t.type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      className={S.toast}
      data-type={t.type ?? 'default'}
      role="status"
      aria-live={live}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <span className={S.msg}>{t.message}</span>
      {t.undo && (
        <button
          className={S.btnUndo}
          onClick={() => {
            t.undo();
            onDismiss(t.id);
          }}
          aria-label="Batalkan aksi terakhir"
        >
          Batalkan
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
