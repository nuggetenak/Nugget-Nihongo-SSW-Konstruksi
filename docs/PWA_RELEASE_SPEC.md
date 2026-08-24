# PWA / Release Spec — SSW Konstruksi

Stable reference for the offline architecture and what "ready to deploy" actually requires.
`CACHE_VERSION` staleness has already caused a real problem once (see §2) — this doc exists so
that doesn't quietly repeat.

## 1. Why offline-first is a hard constraint, not a preference

Audience is Indonesian construction workers studying on phones, often with unreliable
connectivity. Architecture follows from that: **pure localStorage, no backend, 4 production
dependencies max** (`react`, `react-dom`, `ts-fsrs` for spaced repetition, `lz-string` for
compressing what's in localStorage). Check `package.json`'s `dependencies` block before
suggesting anything new — a 5th production dependency is a real conversation, not a default.

This is also why bundle size (see §4) is a genuine product concern here, not just a build-time
nitpick — every extra kilobyte is a real cost on the connections this app is built for.

## 2. Service worker (`public/sw.js`)

Strategy, by asset type:

- **Static assets** (JS, CSS, fonts, icons) → Cache-First
- **Google Fonts** → Cache-First, separate cache, longer TTL
- **HTML shell** → Network-First (always try fresh, fall back to cache)
- **Everything else** → Network-First with cache fallback

```js
const CACHE_VERSION = 'ssw-v4.23.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_FONTS  = `${CACHE_VERSION}-fonts`;
```

**`CACHE_VERSION` must be bumped on every deploy.** This is how the service worker knows to
invalidate old caches and serve fresh assets to returning users — without a bump, a deployed
change can sit unserved indefinitely for anyone who already has the app installed. This isn't
hypothetical: at the start of `feat/ui-overhaul`, `CACHE_VERSION` was found at `4.21.1` against a
`4.23.0` `package.json` — two releases stale. It's easy to forget because nothing fails loudly
when it's stale; the app just quietly keeps serving old assets to existing users while working
fine for anyone installing fresh.

**Update/activation strategy (item 37).** The worker no longer calls `self.skipWaiting()` on
install — a newly-installed worker sits in the `waiting` state instead of taking over
immediately. `App.jsx` watches the registration (`updatefound` → the installing worker's
`statechange` → `'installed'`, gated on `navigator.serviceWorker.controller` already existing so
a first-ever install doesn't trigger an "update available" prompt) and shows a toast; only if the
user accepts does the client `postMessage({ type: 'SKIP_WAITING' })` to the waiting worker, which
is the only thing that calls `self.skipWaiting()` (`sw.js`'s `message` handler). A
`controllerchange` listener reloads once the new worker actually takes control. This means an
open study session keeps running on the JS bundle it started with — and that bundle's lazy chunks
stay resolvable, since `activate` doesn't delete the previous version's cache until the user has
chosen to move to the new one. Chosen over the alternative of keeping `skipWaiting` and instead
delaying cache deletion by one generation: this route removes the mid-session interruption
entirely rather than mitigating its blast radius, at the cost of updates landing only when a
session ends or the user opts in.

## 3. Storage

Single source of truth: `_MAP.md` §6, "Storage Schema" — schema version, document shape, and
migration notes live there, not duplicated here. `lz-string` compresses what's written to
localStorage; this is the one place bundle-size budget (§4) buys something concrete rather than
just being a build metric.

## 4. Bundle size

`npm run build` warns on any chunk over 500KB. As of this doc, one real offender:
`data-cards-*.js` at 661KB (191KB gzipped) — undercuts the offline-first goal directly on slow
connections, since it has to land before the app is meaningfully usable offline. Known,
deliberately deferred to its own branch (a build/data-loading concern, not a UI one) — see
HANDOFF.md's CURRENT STATE for current status rather than assuming this doc's snapshot is still
accurate.

## 5. Pre-deploy checklist

Before merging to `main` and actually deploying (not just before pushing a feature branch):

1. `npm test` — 435/435 (or current count) passing
2. `npm run lint` — 0 warnings
3. `npm run build` — clean, check the chunk-size warning list hasn't grown
4. **Bump `CACHE_VERSION` in `public/sw.js`** to match the new `package.json` version — see §2,
   this is the step that's been missed before
5. `package-lock.json` version in sync with `package.json` (has also drifted before)

None of this is deploy-specific tooling this repo currently runs automatically — treat it as a
manual checklist until/unless that changes.
