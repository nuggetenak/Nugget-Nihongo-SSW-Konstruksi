# TASK v4.20.12 — STORAGE-1: Quota Detection + Recovery (ENG-12)
**Status:** READY | **Effort:** Low | **Depends on:** v4.20.9 DONE

## Goal
`localStorage.setItem` in `engine.js` silently swallows `QuotaExceededError`. Add detection, user toast, and recovery path.

---

## Step 1 — Create `src/utils/storage-quota.js`

```js
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
```

---

## Step 2 — Update `src/storage/engine.js`

Find `writeDoc` function (~line 32):
```js
function writeDoc(docKey, data) {
  try {
    const compressed = LZString.compressToUTF16(JSON.stringify(data));
    localStorage.setItem(docKey, compressed);
  } catch {}
}
```

Replace with:
```js
import { isQuotaError, notifyQuotaExceeded } from '../utils/storage-quota.js';

function writeDoc(docKey, data) {
  try {
    const compressed = LZString.compressToUTF16(JSON.stringify(data));
    localStorage.setItem(docKey, compressed);
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) {
      notifyQuotaExceeded(docKey);
      return { ok: false, reason: 'quota' };
    }
    console.error('[storage] writeDoc failed:', docKey, err);
    return { ok: false, reason: 'unknown' };
  }
}
```

---

## Step 3 — Wire handler in `src/App.jsx`

In `App.jsx`, add to the imports:
```js
import { setQuotaHandler } from './utils/storage-quota.js';
```

In the component body, add a `useEffect`:
```js
useEffect(() => {
  setQuotaHandler(() => {
    // useApp() provides toast — get it from context
    // If toast isn't accessible here, dispatch a CustomEvent:
    window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
  });
}, []);
```

**Simpler approach** — if `toast` is available via context in App.jsx:
```js
const { toast } = useApp();
useEffect(() => {
  setQuotaHandler(() => {
    toast('💾 Penyimpanan penuh. Backup data di menu Pengaturan sebelum data hilang.');
  });
}, [toast]);
```

Use whichever pattern fits App.jsx's structure (check how toast is currently used there).

---

## Step 4 — Update `src/utils/index.js` barrel

Add export:
```js
export { setQuotaHandler, isQuotaError, notifyQuotaExceeded, estimateStorageUsage } from './storage-quota.js';
```

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build` — success
4. Bump → `4.20.12`
5. Prepend CHANGELOG:
```
## [4.20.12] - [DATE]

### fix + feat: storage quota detection (STORAGE-1 + ENG-12)
- engine.js writeDoc: QuotaExceededError no longer silently swallowed
- New utils/storage-quota.js: isQuotaError, notifyQuotaExceeded, estimateStorageUsage, setQuotaHandler
- App.jsx: registers quota handler → toast on write failure
- utils/index.js: barrel updated
```
6. Update `_MAP.md` + push

## Done when
- [ ] storage-quota.js created
- [ ] engine.js writeDoc handles quota explicitly + calls notifyQuotaExceeded
- [ ] App.jsx registers quota handler
- [ ] utils/index.js barrel updated
- [ ] Tests pass; version 4.20.12
