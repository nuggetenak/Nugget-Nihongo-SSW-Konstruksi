import React from 'react';
import { createRoot } from 'react-dom/client';
import { init as storageInit, get as storageGet } from './storage/engine.js';
import { applyTheme } from './styles/theme.js';
import { ToastProvider } from './components/Toast.jsx';
import { ConfirmProvider } from './components/ConfirmDialog.jsx';
import { AppProvider } from './contexts/AppContext.jsx';
import { ProgressProvider } from './contexts/ProgressContext.jsx';
import { SRSProvider } from './contexts/SRSContext.jsx';
import App from './App.jsx';

// Init storage engine first (migrates v1 → v2 if needed)
storageInit();

// Apply theme before React renders — read from v2 prefs doc
const prefs = storageGet('prefs');
const isDark = (prefs?.theme ?? 'light') === 'dark';
applyTheme(isDark);

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
