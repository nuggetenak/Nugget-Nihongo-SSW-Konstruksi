// ─── contexts/AppContext.jsx ──────────────────────────────────────────────────
// Global app state: track, theme, onboarded, tab/mode navigation.
// Reads/writes via storage engine (prefs doc).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const goMode = useCallback((m) => {
    setMode(m);
    setPref('lastMode', m);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [setPref]);

  const exitMode = useCallback(() => {
    setMode(null);
    setPref('lastMode', null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [setPref]);

  const goTab = useCallback((t) => {
    setTab(t);
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

  const ctx = {
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
    mode, goMode, exitMode, goTab,
    // Toast
    toast,
  };

  return <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) return { toast: _noopToast };
  return ctx;
}
