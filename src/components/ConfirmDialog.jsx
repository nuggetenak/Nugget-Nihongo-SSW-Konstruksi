// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
// Bottom-sheet confirm dialog. Tap backdrop to cancel.
// Usage:
//   import { useConfirm } from './ConfirmDialog.jsx';
//   const confirm = useConfirm();
//   const ok = await confirm('Reset semua progress?', 'Reset', 'Batal');
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react';
import { T } from '../styles/theme.js';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { message, confirmLabel, cancelLabel, resolve }

  const confirm = useCallback((message, confirmLabel = 'Ya', cancelLabel = 'Batal') => {
    return new Promise((resolve) => {
      setState({ message, confirmLabel, cancelLabel, resolve });
    });
  }, []);

  const answer = (ok) => {
    state?.resolve(ok);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => answer(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 400,
              animation: 'fadeIn 0.15s ease',
            }}
          />
          {/* Sheet */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: T.maxW,
              zIndex: 401,
              background: 'var(--ssw-bg)',
              borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`,
              padding: '24px 20px 36px',
              boxShadow: T.shadow.lg,
              animation: 'slideUp 0.25s ease',
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                background: 'var(--ssw-border)',
                borderRadius: 99,
                margin: '0 auto 20px',
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 20,
                textAlign: 'center',
                color: T.text,
              }}
            >
              {state.message}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => answer(false)}
                style={{
                  flex: 1,
                  padding: '13px',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  borderRadius: T.r.md,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  color: T.textMuted,
                  cursor: 'pointer',
                }}
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => answer(true)}
                style={{
                  flex: 1,
                  padding: '13px',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  borderRadius: T.r.md,
                  background: T.wrong,
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider');
  return ctx;
}
