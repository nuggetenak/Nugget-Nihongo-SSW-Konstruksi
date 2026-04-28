import React from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme } from './styles/theme.js';
import App from './App.jsx';

// Apply theme immediately — prevents flash of wrong theme before React hydrates
const savedDark = (() => { try { return localStorage.getItem('ssw-theme') === 'dark'; } catch { return false; } })();
applyTheme(savedDark);

createRoot(document.getElementById('root')).render(<App />);
