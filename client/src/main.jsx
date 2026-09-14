import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { db, ensureDefaultCategories } from './db/db';

// Seed default devotional categories on first launch (idempotent).
ensureDefaultCategories();

// Register the app-shell service worker so the app can open with
// zero internet connection. This never caches the music library —
// that lives in IndexedDB (db.js) and is handled separately.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // Fail silently — app still works online, just without offline shell caching.
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// expose db for debugging in dev builds only
if (import.meta.env.DEV) {
  window.__bhaktiDb = db;
}
