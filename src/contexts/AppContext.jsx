// ─── contexts/AppContext.jsx ──────────────────────────────────────────────────
// Global app state: track, theme, onboarded, tab/mode navigation.
// Reads/writes via storage engine (prefs doc).
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { applyTheme } from '../styles/theme.js';
import { useToast } from '../components/Toast.jsx';

const AppCtx = createContext(null);

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

  // ── Onboarded ──
  const completeOnboarding = useCallback(() => {
    setPref('onboarded', true);
  }, [setPref]);

  const ctx = {
    // Prefs
    track: prefs.track,
    setTrack,
    isDark: prefs.theme === 'dark',
    toggleTheme,
    onboarded: prefs.onboarded,
    completeOnboarding,
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
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
