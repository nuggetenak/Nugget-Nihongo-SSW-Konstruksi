// ─── Sheet.jsx ─────────────────────────────────────────────────────────────
// item 20: extracted from ConfirmDialog.jsx (item 15) so the shortcut sheet
// inherits the same focus trap and Escape-to-close instead of a second modal
// implementation growing next to it. Content-agnostic -- callers own what
// goes inside, this owns backdrop/positioning/focus/dismissal.
import { useRef, useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import S from './Sheet.module.css';

export default function Sheet({ onClose, labelledBy, role = 'dialog', children }) {
  const sheetRef = useRef(null);

  useFocusTrap(sheetRef, true);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <>
      <div className={S.backdrop} onClick={onClose} />
      <div ref={sheetRef} className={S.sheet} role={role} aria-modal="true" aria-labelledby={labelledBy}>
        <div className={S.handle} />
        {children}
      </div>
    </>
  );
}
