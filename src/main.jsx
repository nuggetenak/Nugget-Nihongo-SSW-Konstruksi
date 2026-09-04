import React from 'react';
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import { init as storageInit, get as storageGet } from './storage/engine.js';
import { applyTheme } from './styles/theme.js';
import { applyTextScale, DEFAULT_TEXT_SCALE } from './utils/text-scale.js';
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
const isDark = (prefs?.theme ?? 'light') === 'dark';
applyTheme(isDark);
applyTextScale(prefs?.textScale ?? DEFAULT_TEXT_SCALE);

createRoot(document.getElementById('root')).render(
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
);
