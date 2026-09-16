// ─── Sheet.jsx ─────────────────────────────────────────────────────────────
// item 20: extracted from ConfirmDialog.jsx (item 15) so the shortcut sheet
// inherits the same focus trap and Escape-to-close instead of a second modal
// implementation growing next to it. Content-agnostic -- callers own what
// goes inside, this owns backdrop/positioning/focus/dismissal.
import { useRef, useEffect, createContext, useContext } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useExitTransition } from '../hooks/useExitTransition.js';
import S from './Sheet.module.css';

const SheetCtx = createContext(null);

/**
 * The sheet's own dismiss, for content rendered inside one.
 *
 * ConfirmDialog draws its Ya/Batal buttons as children, so without this they
 * would close the sheet by unmounting it while the backdrop and Escape played
 * an exit — one component, two different behaviours depending on how you left
 * it, which is worse than having no exit at all. Falls back to calling the
 * handler directly when used outside a Sheet, so a caller cannot break by
 * reaching for it in the wrong place.
 */
export function useSheetClose(fallback) {
  const ctx = useContext(SheetCtx);
  return ctx ?? fallback;
}

export default function Sheet({ onClose, labelledBy, role = 'dialog', children }) {
  const sheetRef = useRef(null);

  // The sheet slid up on the way in and vanished on the way out, because its
  // callers unmount it and a child cannot keep itself alive. It can delay
  // TELLING them: requestClose plays the exit, then forwards the real onClose.
  // No caller changed.
  const { closing, requestClose } = useExitTransition(onClose);

  useFocusTrap(sheetRef, true);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  return (
    <SheetCtx.Provider value={requestClose}>
      <div className={S.backdrop} data-closing={closing} onClick={requestClose} />
      <div
        ref={sheetRef}
        className={S.sheet}
        data-closing={closing}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <div className={S.handle} />
        {children}
      </div>
    </SheetCtx.Provider>
  );
}
