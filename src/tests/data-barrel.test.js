// ─── tests/data-barrel.test.js ───────────────────────────────────────────────
// `src/data/index.js` re-exports names from the modules under it. When one of
// those names is removed at the source — `VOCAB_SOURCES` was, by item 69 — the
// re-export becomes a reference to nothing.
//
// Neither gate caught it. Vitest's transform resolves the barrel loosely enough
// that 883 tests passed, and `npm run build` completed without a word. Plain
// Node ESM, which checks named exports strictly, refused to load the module at
// all — and Node is what every `scripts/*.mjs` audit runs under, so the first
// symptom was an audit script dying on an import it had nothing to do with.
//
// This asserts the thing directly: every name the barrel claims to re-export
// exists in the module it claims to re-export it from.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BARREL = 'data/index.js';

/** [{ names: string[], from: './categories.js' }] for every re-export in the barrel. */
function reExports(source) {
  const out = [];
  const re = /export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g;
  for (const m of source.matchAll(re)) {
    const names = m[1]
      .split(',')
      .map((n) =>
        n
          .trim()
          .split(/\s+as\s+/)[0]
          .trim()
      )
      .filter(Boolean);
    out.push({ names, from: m[2] });
  }
  return out;
}

describe('the data barrel re-exports only names that exist', () => {
  const source = readFileSync(resolve(SRC, BARREL), 'utf-8');
  const groups = reExports(source);

  it('has re-exports to check at all', () => {
    expect(groups.length).toBeGreaterThan(0);
  });

  it.each(groups.map((g) => [g.from, g.names]))(
    '%s provides every name it is asked for',
    async (from, names) => {
      const mod = await import(/* @vite-ignore */ resolve(SRC, 'data', from));
      const missing = names.filter((n) => !(n in mod));
      expect(
        missing,
        `${BARREL} re-exports ${missing.join(', ')} from ${from}, which does not export them`
      ).toEqual([]);
    }
  );
});
