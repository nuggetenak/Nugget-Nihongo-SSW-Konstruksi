// ─── tests/viewer-data-paths.test.js ─────────────────────────────────────────
// `viewer.html` is the no-build content browser at the repo root: a maintainer
// QA aid, opened as a local file, with no npm step. It is not shipped to users
// — it is not referenced from index.html, the manifest or the service-worker
// precache — which is why two external audits filing its eight `innerHTML`
// sites as a security finding is overstating it. It renders this repository's
// own data files for the person who wrote them.
//
// The real risk is the one that has already happened. From the 2026-08-18 merge
// until 2026-09-05, the JAC Ujian tab was silently EMPTY: the two files it
// imports had moved to `sets/jac/`, `loadJS()` swallows a failed import so one
// missing file cannot take the other five tabs down, and nothing tested any of
// it. A docs audit found it weeks later.
//
// 6.1.0 fixed the paths and made the failure visible in the page. This is the
// part that was still missing: a check that runs in CI, so the NEXT time a data
// file moves it fails here instead of quietly blanking a tab nobody opens until
// they need it.
//
// It resolves paths and export names rather than rendering the page. Rendering
// it under jsdom would mean dynamically importing ~800 kB of question banks to
// assert markup that only a maintainer ever sees; the failure mode worth
// catching is the import, and this catches it in milliseconds.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = process.cwd();
const viewer = readFileSync(resolve(ROOT, 'viewer.html'), 'utf8');

describe('viewer.html data wiring', () => {
  const paths = [...viewer.matchAll(/loadJS\('([^']+)'\)/g)].map((m) => m[1]);

  it('imports the six data files it is built around', () => {
    // A guard against the loop below quietly passing because a refactor renamed
    // loadJS and the regex now matches nothing.
    expect(paths.length).toBe(6);
  });

  it('every path it imports resolves to a real file', () => {
    for (const p of paths) {
      const full = resolve(ROOT, 'src/data', p);
      expect(existsSync(full), `viewer.html imports src/data/${p}, which does not exist`).toBe(
        true
      );
    }
  });

  it('every export it reads is actually exported by those files', () => {
    // The other half of the same failure: a file can still be there while the
    // symbol the viewer destructures off it has been renamed, which empties a
    // tab exactly as a moved file does.
    const reads = [...viewer.matchAll(/\?\.([A-Z][A-Z_]+)\s*\|\|/g)].map((m) => m[1]);
    expect(new Set(reads).size).toBeGreaterThan(3);

    const sources = paths.map((p) => readFileSync(resolve(ROOT, 'src/data', p), 'utf8'));
    for (const name of new Set(reads)) {
      const exported = sources.some((src) =>
        new RegExp(`export\\s+(const|let|function|\\{[^}]*\\b${name}\\b)`).test(src)
          ? new RegExp(
              `export\\s+const\\s+${name}\\b|\\b${name}\\b[^\\n]*\\}\\s*from|export\\s*\\{[^}]*\\b${name}\\b`
            ).test(src)
          : false
      );
      expect(exported, `viewer.html reads ${name}, which none of its imports export`).toBe(true);
    }
  });
});
