// ─── ConfirmDialog.jsx ────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { haptic } from '../utils/haptic.js';
import Sheet, { useSheetClose } from './Sheet.jsx';
import S from './ConfirmDialog.module.css';

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  // The resolver of the dialog currently on screen, held outside state so it can
  // be settled without doing work inside a setState updater.
  const pendingRef = useRef(null);
  // Identity of the dialog on screen, so a superseding confirm() remounts the
  // Sheet rather than reusing it. Without it the outgoing sheet's exit timer --
  // armed against the PREVIOUS dialog -- would survive into the new one and tear
  // it down mid-question. Remounting runs useExitTransition's cleanup, which
  // clears that timer. See the supersede comment in confirm() below; this is the
  // same hazard, moved from "a promise nobody settles" to "a timer nobody
  // cancels" by giving the sheet an exit at all (item 148).
  const idRef = useRef(0);

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
        setState({ id: ++idRef.current, message, confirmLabel, cancelLabel, alternative });
      });
    },
    []
  );

  // Idempotent by construction: the resolver is taken out of the ref before it
  // is called, so the second caller finds nothing. Both paths below rely on
  // that — the sheet's own dismissal settles false after the exit has played,
  // by which time an explicit answer has usually already settled it.
  const settle = (ok) => {
    const resolve = pendingRef.current;
    pendingRef.current = null;
    resolve?.(ok);
  };

  // What the sheet's own affordances mean once their exit has finished playing:
  // dismissing this dialog is cancelling it, and then it goes away. Reached
  // ~120ms after the backdrop tap or Escape, which is the one place a delayed
  // settle is harmless — the answer is "no", so nothing happens as a result of
  // it, and the sheet is still visibly on screen for the whole wait.
  const dismiss = () => {
    settle(false);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <Sheet key={state.id} onClose={dismiss} labelledBy="confirm-msg">
          <ConfirmBody state={state} settle={settle} />
        </Sheet>
      )}
    </ConfirmCtx.Provider>
  );
}

/**
 * The dialog's own buttons, inside the Sheet so they can reach its dismissal.
 *
 * Split out for `useSheetClose` alone: the buttons have to leave the way the
 * backdrop and Escape leave, or one component would exit two different ways
 * depending on how you dismissed it.
 *
 * THE ORDERING IS THE WHOLE DESIGN. `settle` runs now; only the sheet's removal
 * waits for its exit animation. The first attempt at item 148 had it backwards
 * and routed the answer itself through the exit — so a destructive confirmation
 * took 120ms to do the thing you had just confirmed, and sixteen tests across
 * six files were right to object. An animation may never delay an action the
 * user has taken. It is allowed to outlive it.
 */
function ConfirmBody({ state, settle }) {
  const close = useSheetClose();

  const answer = (ok) => {
    // item 21: haptic on destructive-confirm, per the documented rule (§4) --
    // this dialog is used exclusively for destructive actions in this app
    // (btnConfirm is hardcoded var(--ssw-wrong), never a neutral affirmative),
    // so only the confirming tap buzzes, not cancel.
    if (ok) haptic.wrong();
    settle(ok);
    close();
  };

  const takeAlternative = () => {
    state.alternative.onClick();
    settle(false);
    close();
  };

  return (
    <>
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
    </>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider');
  return ctx;
}
