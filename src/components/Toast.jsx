// ─── Toast.jsx ────────────────────────────────────────────────────────────────
// Note: stack bottom offset is prop-driven (T.navH + 12) — kept inline.
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
    (message, { undo, duration = 3500 } = {}) => {
      const id = ++nextId.current;
      setToasts((ts) => [...ts.slice(-1), { id, message, undo }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      {/* role="status" + aria-live="polite" — screen readers announce each toast */}
      <div
        className={S.stack}
        style={{ bottom: T.navH + 12 }}
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className={S.toast}>
            <span className={S.msg}>{t.message}</span>
            {t.undo && (
              <button
                className={S.btnUndo}
                onClick={() => { t.undo(); dismiss(t.id); }}
                aria-label="Batalkan aksi terakhir"
              >
                Batalkan
              </button>
            )}
            <button
              className={S.btnClose}
              onClick={() => dismiss(t.id)}
              aria-label="Tutup notifikasi"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
