// src/utils/storage-quota.js
// ENG-12: Quota detection + recovery registration.
// Wire up via App.jsx: setQuotaHandler(() => showToast('...'))

let _handler = null;

export function setQuotaHandler(fn) {
  _handler = fn;
}

export function isQuotaError(err) {
  return (
    err?.name === 'QuotaExceededError' ||
    err?.code === 22 ||        // Chrome/Safari
    err?.code === 1014          // Firefox NS_ERROR_DOM_QUOTA_REACHED
  );
}

export function notifyQuotaExceeded(docKey = '') {
  console.warn('[storage] QuotaExceededError on key:', docKey);
  if (_handler) _handler(docKey);
}

/** Uses Storage API where available. Returns null on unsupported browsers. */
export async function estimateStorageUsage() {
  if (navigator?.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      return {
        usedMB: ((est.usage || 0) / 1024 / 1024).toFixed(2),
        quotaMB: ((est.quota || 0) / 1024 / 1024).toFixed(0),
        pct: est.quota ? ((est.usage / est.quota) * 100).toFixed(1) : null,
      };
    } catch { return null; }
  }
  return null;
}
