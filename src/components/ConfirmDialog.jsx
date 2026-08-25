// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import S from './ConfirmDialog.module.css';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const sheetRef = useRef(null);

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

  // item 15: aria-modal="true" was a promise this component didn't keep --
  // no focus trap, no Escape. The hook already existed (src/hooks/useFocusTrap.js)
  // with zero consumers; this is what it was written for.
  useFocusTrap(sheetRef, !!state);

  useEffect(() => {
    if (!state) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') answer(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <>
          <div className={S.backdrop} onClick={() => answer(false)} />
          <div
            ref={sheetRef}
            className={S.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-msg"
          >
            <div className={S.handle} />
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
