// ─── Toast.jsx ────────────────────────────────────────────────────────────────
// Lightweight toast provider. Max 2 toasts, stacked bottom-center, above nav.
// Usage:
//   import { useToast } from './Toast.jsx';
//   const toast = useToast();
//   toast.show('Hafal! ✓', { undo: () => ... });
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';

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
      setToasts((ts) => [...ts.slice(-1), { id, message, undo }]); // max 2
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      {/* Toast stack — fixed above BottomNav */}
      <div
        style={{
          position: 'fixed',
          bottom: T.navH + 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: T.maxW - 32,
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 14px',
              borderRadius: T.r.md,
              background: T.text,
              color: T.bg,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: T.shadow.lg,
              animation: 'toastIn 0.25s ease',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.undo && (
              <button
                onClick={() => {
                  t.undo();
                  dismiss(t.id);
                }}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 800,
                  background: 'none',
                  border: 'none',
                  color: T.gold,
                  cursor: 'pointer',
                  padding: '0 4px',
                  flexShrink: 0,
                }}
              >
                Batalkan
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              style={{
                fontFamily: 'inherit',
                fontSize: 12,
                background: 'none',
                border: 'none',
                color: 'inherit',
                opacity: 0.5,
                cursor: 'pointer',
                padding: '0 2px',
                flexShrink: 0,
              }}
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
