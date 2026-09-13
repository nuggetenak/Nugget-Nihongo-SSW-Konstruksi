// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { haptic } from '../utils/haptic.js';
import Sheet from './Sheet.jsx';
import S from './ConfirmDialog.module.css';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  // The resolver of the dialog currently on screen, held outside state so it can
  // be settled without doing work inside a setState updater.
  const pendingRef = useRef(null);

  const confirm = useCallback(
    (message, confirmLabel = 'Ya', cancelLabel = 'Batal', alternative = null) => {
      return new Promise((resolve) => {
        // A second confirm() while one is open used to overwrite the state slot and
        // drop the first `resolve` on the floor. Nothing resolved it and nothing
        // rejected it, so whoever was awaiting it waited forever — and the caller
        // that matters is `runGuarded`, which awaits this before letting you leave
        // a running exam. A guard that never settles is a screen you cannot leave
        // by any of the five routes out of it.
        //
        // Settled false rather than rejected: every caller treats this as a yes/no
        // question and none of them has a catch, so rejecting would trade a hung
        // promise for an unhandled one. "Superseded" means "not confirmed", which
        // is the safe reading for a dialog used exclusively for destructive
        // actions.
        pendingRef.current?.(false);
        pendingRef.current = resolve;
        setState({ message, confirmLabel, cancelLabel, alternative });
      });
    },
    []
  );

  const settle = (ok) => {
    const resolve = pendingRef.current;
    pendingRef.current = null;
    resolve?.(ok);
  };

  const answer = (ok) => {
    // item 21: haptic on destructive-confirm, per the documented rule (§4) --
    // this dialog is used exclusively for destructive actions in this app
    // (btnConfirm is hardcoded var(--ssw-wrong), never a neutral affirmative),
    // so only the confirming tap buzzes, not cancel.
    if (ok) haptic.wrong();
    settle(ok);
    setState(null);
  };

  const takeAlternative = () => {
    state?.alternative?.onClick();
    settle(false);
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
