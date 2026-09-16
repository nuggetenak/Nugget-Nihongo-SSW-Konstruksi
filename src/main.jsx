import React from 'react';
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import { init as storageInit, get as storageGet } from './storage/engine.js';
import { applyTheme } from './styles/theme.js';
import { resolveIsDark, DEFAULT_THEME } from './utils/theme-mode.js';
import { applyTextScale, DEFAULT_TEXT_SCALE } from './utils/text-scale.js';
import { applyMotion, DEFAULT_MOTION } from './utils/motion-pref.js';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { ConfirmProvider } from './components/ConfirmDialog.jsx';
import { AppProvider } from './contexts/AppContext.jsx';
import { ProgressProvider } from './contexts/ProgressContext.jsx';
import { SRSProvider } from './contexts/SRSContext.jsx';
import App from './App.jsx';

// Init storage engine first (migrates v1 → v2 if needed)
storageInit();

// Apply theme and text scale before React renders — read from the prefs doc.
// Both are pre-paint for the same reason: they change the size and colour of
// everything, so applying them in an effect means a visible reflow on every
// load for anyone who isn't on the defaults.
const prefs = storageGet('prefs');
applyTheme(resolveIsDark(prefs?.theme ?? DEFAULT_THEME));
applyTextScale(prefs?.textScale ?? DEFAULT_TEXT_SCALE);

// Motion, pre-paint for the same reason -- and this is also where the one
// non-negotiable default lives.
//
// The stored default is 'penuh': the owner asked for an expressive app and the
// settings screen is what makes that safe. But on a FRESH INSTALL, if the device
// itself asks for reduced motion, the app starts at 'mati'. That is an
// accessibility declaration, not a preference, and an app whose first impression
// ignores it has already failed the reader once before they find the setting.
//
// New-install only, deliberately: `init()` loads an existing prefs document
// as-is, so this never rewrites a choice someone has already made -- including
// the choice to turn motion back ON despite the OS setting, which is theirs to
// make. Same shape as textScale's `kecil` default and lastSeenVersion
// (defaults-new-install-only.test.js holds the pattern), so STORAGE_VERSION
// stays 7.
const storedMotion = prefs?.motion;
applyMotion(
  storedMotion ??
    (typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? { ...DEFAULT_MOTION, preset: 'mati' }
      : DEFAULT_MOTION)
);

// Root boundary, outside the providers deliberately. Every boundary in the app
// sat *inside* this tree, so a throw in any provider's own render -- or in
// anything above App's tab branches -- had nothing to catch it and painted a
// blank page. Uses the default ErrorFallback via title/desc rather than a
// `fallback` element: TabError calls useApp(), which is exactly the thing that
// may have just failed, so the root fallback must not depend on any context.
createRoot(document.getElementById('root')).render(
  <ErrorBoundary
    title="Aplikasi gagal dimuat"
    desc="Terjadi kesalahan saat memulai aplikasi. Progres kamu tersimpan di perangkat ini dan tidak hilang — coba muat ulang."
  >
    <ToastProvider>
      <ConfirmProvider>
        <AppProvider>
          <ProgressProvider>
            <SRSProvider>
              <App />
            </SRSProvider>
          </ProgressProvider>
        </AppProvider>
      </ConfirmProvider>
    </ToastProvider>
  </ErrorBoundary>
);
