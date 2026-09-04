// ─── contexts/AppContext.jsx ──────────────────────────────────────────────────
// Global app state: track, theme, onboarded, tab/mode navigation.
// Reads/writes via storage engine (prefs doc).
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { applyTheme } from '../styles/theme.js';
import { useToast } from '../components/Toast.jsx';

const _noopToast = { show: () => {}, hide: () => {} };
const AppCtx = createContext({ toast: _noopToast });

export function AppProvider({ children }) {
  const toast = useToast();

  // ── Prefs (from storage engine) ──
  const [prefs, setPrefsState] = useState(() => get('prefs'));

  const setPref = useCallback((key, value) => {
    setPrefsState((prev) => {
      const next = { ...prev, [key]: value };
      storageSet('prefs', next);
      return next;
    });
  }, []);

  // ── Theme ──
  useEffect(() => {
    applyTheme(prefs.theme === 'dark');
  }, [prefs.theme]);

  // Apply on mount
  useEffect(() => {
    applyTheme(prefs.theme === 'dark');
  }, []); // eslint-disable-line

  const toggleTheme = useCallback(() => {
    setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark');
  }, [prefs.theme, setPref]);

  // ── Navigation ──
  const [tab, setTab] = useState('home');
  const [mode, setMode] = useState(prefs.lastMode ?? null);
  const [modeParams, setModeParams] = useState(null);
  const [modeHistory, setModeHistory] = useState([]); // breadcrumb stack (max 3)

  // goMode(key) — navigate to mode
  // goMode(key, params) — navigate with extra params (e.g. { filterIds: [...] })
  const goMode = useCallback(
    (m, params = null) => {
      setModeHistory((h) => (mode ? [...h.slice(-2), mode] : h)); // push current before navigating
      setMode(m);
      setModeParams(params);
      setPref('lastMode', m);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [mode, setPref]
  );

  const exitMode = useCallback(() => {
    // Always the direct, synchronous update -- exactly as before this item,
    // so nothing that expects `mode` to be null immediately after calling
    // this breaks. Popping the browser history entry (below) is additive:
    // it fixes the actual "needs two back-presses" bug without the visible
    // app state depending on an async popstate round-trip that real
    // browsers (and jsdom) don't guarantee happens in the same tick.
    setModeHistory([]);
    setMode(null);
    setModeParams(null);
    setPref('lastMode', null);
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (canPopRef.current) {
      // Safe: the current top-of-stack entry is the one we pushed on
      // mode-area entry, and nothing has happened since to invalidate that.
      // The [tab, mode] effect above will have already replaceState'd the
      // current entry to reflect the exit (from the direct update just
      // above); this pops it, landing one entry further back than that --
      // exactly where a real hardware back should have gone directly, no
      // longer needing a second press to get there. The popstate this
      // triggers lands on state that's already correct, so it's a harmless,
      // idempotent redundant update, not a race with the direct one above.
      history.back();
    }
  }, [setPref]);

  // Go back one mode in history, or jump directly to a specific ancestor
  // still in the stack (truncates history to everything before it). Called
  // with no argument, pops exactly one level — the original behaviour.
  const goBack = useCallback(
    (targetMode) => {
      if (modeHistory.length === 0) {
        exitMode();
        return;
      }
      if (targetMode) {
        const idx = modeHistory.lastIndexOf(targetMode);
        if (idx !== -1) {
          setMode(targetMode);
          setModeHistory(modeHistory.slice(0, idx));
          setModeParams(null);
          setPref('lastMode', targetMode);
          window.scrollTo({ top: 0, behavior: 'instant' });
          return;
        }
        // targetMode not found in history — fall through to the default
        // pop-one behaviour rather than doing nothing.
      }
      const prev = modeHistory[modeHistory.length - 1];
      setModeHistory((h) => h.slice(0, -1));
      setMode(prev);
      setModeParams(null);
      setPref('lastMode', prev);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [modeHistory, exitMode, setPref]
  );

  const goTab = useCallback(
    (t) => {
      setTab(t);
      setModeHistory([]);
      setMode(null);
      setPref('lastMode', null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    [setPref]
  );

  // ── Browser / hardware back button (item 10, scoped route) ──
  // Hash-based (#/tab/x, #/mode/y) -- avoids the subpath + SW HTML-shell
  // Network-First strategy (docs/PWA_RELEASE_SPEC.md §2); works offline
  // unchanged. This state stays the source of truth for rendering; browser
  // history mirrors it rather than replacing it -- smaller surface for the
  // scoped route than deriving would be.
  //
  // Deliberately coarse: only the tab-level <-> mode-area boundary pushes a
  // real entry. Moving between modes while already inside the mode area
  // (goMode to another mode, goBack to an ancestor) replaces in place, so
  // one hardware back always exits the mode area as a single step rather
  // than retracing every in-mode move -- that finer-grained retracing is
  // ModeHeader's job (item 11), already shipped. This matches what the fix
  // is actually for (back exiting the whole app mid-quiz), without taking on
  // a fully derived history stack, which the plan flags as separate scope.
  //
  // Known gap, fixed (item 52, 2026-08-26): exiting a mode via an in-app
  // control used to always replace rather than pop the pushed entry, so a
  // subsequent hardware back would land on an unchanged screen before a
  // second press reached the real previous one. The plan framed this as
  // needing "a way to tell 'this update came from our own history.back()
  // call' apart from 'the user pressed back'" -- but isPopRef, right below,
  // already solves exactly that; it just wasn't being *used* to initiate a
  // pop, only to react to one that had already happened. canPopRef closes
  // that gap: true only while we're confident the current top-of-stack entry
  // is the one *we* pushed on mode-area entry and nothing has happened since
  // to invalidate that (a real popstate event always clears it, since that
  // means the browser's position moved for reasons outside our tracking).
  // exitMode calls history.back() only when canPopRef is true, letting
  // isPopRef's existing popstate handling take it from there -- never a bare
  // history.back() call, which could eject the user out of the app entirely
  // if there were nothing safe behind the current position. Falls back to
  // the original replace-based exit otherwise, so an uncertain case degrades
  // to the old "two presses" behavior rather than risking a worse one.
  //
  // Also not handled: an in-quiz confirm-before-discard guard. That's item
  // 15's ConfirmDialog, which doesn't exist yet -- owner chose to land the
  // back-button fix now rather than sequence after it.
  const prevModeRef = useRef(mode);
  const isPopRef = useRef(false);
  const canPopRef = useRef(false); // item 52: true iff it's safe to history.back()

  useEffect(() => {
    const enteringModeArea = prevModeRef.current === null && mode !== null;
    prevModeRef.current = mode;

    if (isPopRef.current) {
      isPopRef.current = false; // browser already moved; state is already in sync
      return;
    }

    const state = mode ? { tab, mode, modeHistory } : { tab, mode: null };
    const url = mode ? `#/mode/${mode}` : `#/tab/${tab}`;
    if (enteringModeArea) {
      history.pushState(state, '', url);
    } else {
      history.replaceState(state, '', url);
    }
    if (enteringModeArea) {
      // Deliberate ref mutation, not cached state. The rule appears to flag
      // any ref write conditioned on external state rather than the ref's
      // own prior value (compare isPopRef's mutation above, gated on
      // isPopRef.current itself, which doesn't trigger this) -- verified
      // this isn't masking a real bug via 4 dedicated tests in
      // history.test.jsx that directly exercise canPopRef's actual runtime
      // behavior.
      // eslint-disable-next-line react-hooks/immutability
      canPopRef.current = true;
    }
    // modeHistory intentionally omitted: it never changes without mode also
    // changing (every setModeHistory call site also calls setMode), so it's
    // always fresh here via closure without needing to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, mode]);

  useEffect(() => {
    const onPopState = (e) => {
      isPopRef.current = true;
      canPopRef.current = false; // browser position moved; re-earn trust from a fresh pushState
      const state = e.state;
      if (state?.mode) {
        setTab(state.tab);
        setMode(state.mode);
        setModeHistory(state.modeHistory ?? []);
        setPref('lastMode', state.mode);
      } else {
        // Either a tab-level entry, or popped past everything this app
        // pushed (state is null) -- either way, land at the tab level.
        setTab(state?.tab ?? 'home');
        setMode(null);
        setModeHistory([]);
        setModeParams(null); // found while wiring item 52: this was never
        // cleared here even for a real hardware back -- pre-existing, not
        // introduced by this item, but this handler is now also what
        // exitMode's history.back() path relies on, so worth fixing here
        // rather than leaving a second exit path with the same stale gap.
        setPref('lastMode', null);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setPref]);

  // ── Track ──
  const setTrack = useCallback(
    (t) => {
      setPref('track', t);
    },
    [setPref]
  );

  // ── Daily Goal ──
  const setDailyGoal = useCallback(
    (g) => {
      setPref('dailyGoal', g);
    },
    [setPref]
  );

  // ── Onboarded ──
  // Accepts optional { track, dailyGoal } from new interactive onboarding.
  const completeOnboarding = useCallback((payload) => {
    setPrefsState((prev) => {
      const next = {
        ...prev,
        onboarded: true,
        ...(payload?.track && { track: payload.track }),
        ...(payload?.dailyGoal && { dailyGoal: payload.dailyGoal }),
        // item 24: only overwrite if the step actually set one -- undefined
        // (the re-entry path, which doesn't touch exam date at all) must
        // leave whatever's already stored alone, same as track/dailyGoal
        // above; explicit null (the user reached the step and skipped it)
        // is a deliberate "still don't know", not "no opinion", so it does
        // overwrite a stale prior value.
        ...(payload?.examDate !== undefined && { examDate: payload.examDate }),
      };
      storageSet('prefs', next);
      return next;
    });
  }, []);

  const ctx = useMemo(
    () => ({
      // Prefs
      track: prefs.track,
      setTrack,
      isDark: prefs.theme === 'dark',
      toggleTheme,
      onboarded: prefs.onboarded,
      completeOnboarding,
      dailyGoal: prefs.dailyGoal ?? 20,
      setDailyGoal,
      setPref,
      prefs,
      // Navigation
      tab,
      setTab,
      mode,
      modeParams,
      goMode,
      exitMode,
      goTab,
      modeHistory,
      goBack,
      // Toast
      toast,
    }),
    [
      prefs,
      tab,
      setTab,
      mode,
      modeParams,
      goMode,
      exitMode,
      goTab,
      modeHistory,
      goBack,
      setTrack,
      toggleTheme,
      completeOnboarding,
      setDailyGoal,
      setPref,
      toast,
    ]
  );

  return <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) return { toast: _noopToast };
  return ctx;
}
