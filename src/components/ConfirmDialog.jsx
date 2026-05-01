// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';
import S from './ConfirmDialog.module.css';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

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
          <div className={S.backdrop} onClick={() => answer(false)} />
          <div className={S.sheet} role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
            <div className={S.handle} />
            <div className={S.message} id="confirm-msg">{state.message}</div>
            <div className={S.actions}>
              <button className={S.btnCancel} onClick={() => answer(false)}>
                {state.cancelLabel}
              </button>
              <button className={S.btnConfirm} onClick={() => answer(true)}>
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
