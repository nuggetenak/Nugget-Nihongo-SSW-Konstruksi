// ─── gist-sync.js ─────────────────────────────────────────────────────────────
// Optional multi-device sync via GitHub Gist (no backend required).
// User provides a GitHub Personal Access Token (PAT) with gist scope.
// All operations are opt-in — token stored in localStorage only, never sent
// anywhere except api.github.com with the user's own credentials.
// ─────────────────────────────────────────────────────────────────────────────

import { UNMANAGED_KEYS } from '../storage/schema.js';

const GIST_FILENAME = 'ssw-konstruksi-progress.json';
const GIST_DESC = 'SSW Konstruksi — Progress Backup (auto-generated)';
// From the schema, not typed again here: storage/engine.js's resetAll() clears
// these, and two independent spellings of the same key is how a "reset
// everything" ends up leaving a credential behind (item 133).
const [PAT_KEY, GIST_ID_KEY] = UNMANAGED_KEYS;

// ── Token management ─────────────────────────────────────────────────────────

export function saveToken(token) {
  if (token) localStorage.setItem(PAT_KEY, token);
  else localStorage.removeItem(PAT_KEY);
}

export function loadToken() {
  return localStorage.getItem(PAT_KEY) ?? '';
}

export function saveGistId(id) {
  if (id) localStorage.setItem(GIST_ID_KEY, id);
  else localStorage.removeItem(GIST_ID_KEY);
}

export function loadGistId() {
  return localStorage.getItem(GIST_ID_KEY) ?? '';
}

// ── GitHub API helpers ───────────────────────────────────────────────────────

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    // `Bearer` is GitHub's documented scheme; `token` is the older spelling and
    // still accepted, but there is no reason to sit on a deprecated one.
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// How long to let a request hang before calling it a failure.
//
// Every fetch in this file used to have no timeout and no abort. The audience is
// on Indonesian mobile data, where a request does not fail so much as stop: the
// promise never settles, so the Push/Pull button spins for as long as the user is
// willing to look at it, with no error, no progress and no way to cancel. A
// timeout turns that into a message they can act on.
const REQUEST_TIMEOUT_MS = 15000;

async function ghFetch(url, options = {}) {
  // AbortSignal.timeout would be tidier and is not in every WebView this app
  // runs in, so the controller is built by hand.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === 'AbortError')
      throw new Error('Koneksi lambat — GitHub tidak menjawab dalam 15 detik. Coba lagi.', {
        cause: err,
      });
    throw new Error('Gagal menghubungi GitHub — periksa koneksi internet.', { cause: err });
  } finally {
    clearTimeout(timer);
  }
}

// How many pages of gists to walk looking for ours. See findExistingGist.
const GIST_SEARCH_MAX_PAGES = 10;

// List the user's gists and find the one matching our description.
//
// This read a single `per_page=100` page and stopped. For a user whose backup
// gist is not among their hundred most recent, that returns null, the push path
// reads null as "no backup exists yet" and creates a *second* gist, and
// `saveGistId` then pins the duplicate — so the device writes to one gist while
// the old one holds the history, and the two drift apart silently. Paginate
// instead, bounded so a user with thousands of gists cannot turn one button press
// into an unbounded walk.
export async function findExistingGist(token) {
  for (let page = 1; page <= GIST_SEARCH_MAX_PAGES; page++) {
    const res = await ghFetch(`https://api.github.com/gists?per_page=100&page=${page}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const gists = await res.json();
    if (!Array.isArray(gists) || gists.length === 0) return null;
    const match = gists.find((g) => g.description === GIST_DESC && GIST_FILENAME in g.files);
    if (match) return match;
    if (gists.length < 100) return null; // last page
  }
  return null;
}

// Push data to a new or existing gist
export async function pushToGist(token, data, existingGistId = '') {
  const content = JSON.stringify(data, null, 2);
  const body = {
    description: GIST_DESC,
    public: false,
    files: { [GIST_FILENAME]: { content } },
  };

  if (existingGistId) {
    // PATCH — update existing gist
    const res = await ghFetch(`https://api.github.com/gists/${existingGistId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gagal update Gist: ${res.status}`);
    return await res.json();
  } else {
    // POST — create new gist
    const res = await ghFetch('https://api.github.com/gists', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gagal buat Gist: ${res.status}`);
    return await res.json();
  }
}

// Pull data from an existing gist
export async function pullFromGist(token, gistId) {
  const res = await ghFetch(`https://api.github.com/gists/${gistId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Gagal ambil Gist: ${res.status}`);
  const gist = await res.json();
  const raw = gist.files?.[GIST_FILENAME]?.content;
  if (!raw) throw new Error(`File ${GIST_FILENAME} tidak ditemukan di Gist`);
  return JSON.parse(raw);
}
