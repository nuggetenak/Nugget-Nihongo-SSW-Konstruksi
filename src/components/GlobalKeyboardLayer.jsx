// ─── GlobalKeyboardLayer.jsx ───────────────────────────────────────────────
// item 20: app-level shortcuts that work from any screen, on top of the
// per-mode ones that already existed (useQuizKeyboard, FlashcardMode's own
// handler, etc.) — this layer doesn't replace those, it fills the gap above
// them (mode exit, tab switching, discoverability) that nothing owned before.
//
// Guarded against two things a naive global keydown handler gets wrong:
// - isTypingTarget (utils/keyboard.js, item 31's fix, reused not
//   reimplemented) so this doesn't hijack Escape/1/2/3 from a focused input.
// - an open dialog/sheet (checked via role="dialog"/"alertdialog" in the DOM
//   rather than importing ConfirmProvider's internal state) so pressing
//   Escape to cancel a confirm dialog doesn't *also* exit the mode underneath
//   it. Sheet.jsx (item 15/20's shared shell) already closes itself on
//   Escape; this layer just needs to know to stand down, not to own that
//   close behavior too.
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { isTypingTarget } from '../utils/keyboard.js';
import ShortcutSheet from './ShortcutSheet.jsx';

const TAB_KEYS = { 1: 'home', 2: 'belajar', 3: 'saya' };

function isDialogOpen() {
  return !!document.querySelector('[role="dialog"], [role="alertdialog"]');
}

export default function GlobalKeyboardLayer() {
  const { mode, requestExitMode, goTab } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTypingTarget(e)) return;
      // Sheet.jsx (used by both ConfirmDialog and ShortcutSheet) owns its
      // own Escape-to-close. If one is open, every key here stands down —
      // including '?' and digits, not just Escape, so nothing leaks through
      // a focus-trapped overlay.
      if (isDialogOpen()) return;

      if (e.key === '?') {
        setSheetOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        // requestExitMode, not exitMode: this shortcut fires from outside the
        // active mode, so it has to ask the mode's exit guard first. Calling
        // exitMode directly is what let one Escape keypress discard a running
        // 100-minute exam with no confirmation.
        if (mode !== null) requestExitMode();
        return;
      }
      if (mode === null && TAB_KEYS[e.key]) {
        goTab(TAB_KEYS[e.key]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, requestExitMode, goTab]);

  if (!sheetOpen) return null;
  return <ShortcutSheet onClose={closeSheet} />;
}
