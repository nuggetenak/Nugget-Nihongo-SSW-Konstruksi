// ─── gist-sync.js ─────────────────────────────────────────────────────────────
// Optional multi-device sync via GitHub Gist (no backend required).
// User provides a GitHub Personal Access Token (PAT) with gist scope.
// All operations are opt-in — token stored in localStorage only, never sent
// anywhere except api.github.com with the user's own credentials.
// ─────────────────────────────────────────────────────────────────────────────

const GIST_FILENAME = 'ssw-konstruksi-progress.json';
const GIST_DESC = 'SSW Konstruksi — Progress Backup (auto-generated)';
const PAT_KEY = 'ssw-gist-pat';
const GIST_ID_KEY = 'ssw-gist-id';

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
    Authorization: `token ${token}`,
  };
}

// List user's existing gists and find one matching our description
export async function findExistingGist(token) {
  const res = await fetch('https://api.github.com/gists?per_page=100', {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const gists = await res.json();
  return gists.find((g) => g.description === GIST_DESC && GIST_FILENAME in g.files) ?? null;
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
    const res = await fetch(`https://api.github.com/gists/${existingGistId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gagal update Gist: ${res.status}`);
    return await res.json();
  } else {
    // POST — create new gist
    const res = await fetch('https://api.github.com/gists', {
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
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Gagal ambil Gist: ${res.status}`);
  const gist = await res.json();
  const raw = gist.files?.[GIST_FILENAME]?.content;
  if (!raw) throw new Error(`File ${GIST_FILENAME} tidak ditemukan di Gist`);
  return JSON.parse(raw);
}
