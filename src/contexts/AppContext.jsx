// ─── contexts/AppContext.jsx ──────────────────────────────────────────────────
// Global app state: track, theme, onboarded, tab/mode navigation.
// Reads/writes via storage engine (prefs doc).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  useEffect(() => { applyTheme(prefs.theme === 'dark'); }, []); // eslint-disable-line

  const toggleTheme = useCallback(() => {
    setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark');
  }, [prefs.theme, setPref]);

  // ── Navigation ──
  const [tab, setTab] = useState('home');
  const [mode, setMode] = useState(prefs.lastMode ?? null);
  const [modeParams, setModeParams] = useState(null);
  const [modeHistory, setModeHistory] = useState([]); // A3: breadcrumb stack (max 3)

  // goMode(key) — navigate to mode
  // goMode(key, params) — navigate with extra params (e.g. { filterIds: [...] })
  const goMode = useCallback((m, params = null) => {
    setModeHistory((h) => mode ? [...h.slice(-2), mode] : h); // push current before navigating
    setMode(m);
    setModeParams(params);
    setPref('lastMode', m);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [mode, setPref]);

  const exitMode = useCallback(() => {
    setModeHistory([]);
    setMode(null);
    setModeParams(null);
    setPref('lastMode', null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [setPref]);

  // A3: go back one mode in history
  const goBack = useCallback(() => {
    if (modeHistory.length === 0) { exitMode(); return; }
    const prev = modeHistory[modeHistory.length - 1];
    setModeHistory((h) => h.slice(0, -1));
    setMode(prev);
    setModeParams(null);
    setPref('lastMode', prev);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [modeHistory, exitMode, setPref]);

  const goTab = useCallback((t) => {
    setTab(t);
    setModeHistory([]);
    setMode(null);
    setPref('lastMode', null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [setPref]);

  // ── Track ──
  const setTrack = useCallback((t) => {
    setPref('track', t);
  }, [setPref]);

  // ── Daily Goal ──
  const setDailyGoal = useCallback((g) => {
    setPref('dailyGoal', g);
  }, [setPref]);

  // ── Onboarded ──
  // Accepts optional { track, dailyGoal } from new interactive onboarding.
  const completeOnboarding = useCallback((payload) => {
    setPrefsState((prev) => {
      const next = {
        ...prev,
        onboarded: true,
        ...(payload?.track     && { track: payload.track }),
        ...(payload?.dailyGoal && { dailyGoal: payload.dailyGoal }),
      };
      storageSet('prefs', next);
      return next;
    });
  }, []);

  const ctx = useMemo(() => ({
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
    tab, setTab,
    mode, modeParams, goMode, exitMode, goTab,
    modeHistory, goBack, // A3: breadcrumb
    // Toast
    toast,
  }), [
    prefs, tab, setTab, mode, modeParams, goMode, exitMode, goTab,
    modeHistory, goBack, setTrack, toggleTheme, completeOnboarding,
    setDailyGoal, setPref, toast,
  ]);

  return <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) return { toast: _noopToast };
  return ctx;
}
