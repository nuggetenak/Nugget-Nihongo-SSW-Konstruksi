// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';
import Sheet from './Sheet.jsx';
import S from './ConfirmDialog.module.css';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (message, confirmLabel = 'Ya', cancelLabel = 'Batal', alternative = null) => {
      return new Promise((resolve) => {
        setState({ message, confirmLabel, cancelLabel, alternative, resolve });
      });
    },
    []
  );

  const answer = (ok) => {
    state?.resolve(ok);
    setState(null);
  };

  const takeAlternative = () => {
    state?.alternative?.onClick();
    state?.resolve(false);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <Sheet onClose={() => answer(false)} labelledBy="confirm-msg">
          <div className={S.message} id="confirm-msg">
            {state.message}
          </div>
          {state.alternative && (
            <button className={S.btnAlternative} onClick={takeAlternative}>
              {state.alternative.label}
            </button>
          )}
          <div className={S.actions}>
            <button className={S.btnCancel} onClick={() => answer(false)}>
              {state.cancelLabel}
            </button>
            <button className={S.btnConfirm} onClick={() => answer(true)}>
              {state.confirmLabel}
            </button>
          </div>
        </Sheet>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider');
  return ctx;
}
