// ─── tests/eager-bundle-graph.test.js ────────────────────────────────────────
// UI_UX_PLAN item 131 — what the app downloads before it can show anything.
//
// Two modules pulled the question banks into the initial bundle, each for a
// reason that reads fine on its own line:
//
//   router/modes.js      imported QUIZ_SETS to compute two menu integers.
//   utils/daily-challenge.js imported JAC_OFFICIAL *and* QUIZ_SETS at module
//                        scope, then built all 1,075 questions on import, to
//                        show one question a day. SayaTab is one of App's three
//                        tabs, so that chain was eager too.
//
// Between them, wayground-sets.js (481 kB), jac-mockup-sets.js (226 kB) and
// jac-official.js (81 kB) were modulepreloaded from index.html on every first
// page view, before onboarding rendered. Neither importer looks expensive where
// it is written, which is exactly why a comment could not have caught this and
// a graph walk can.
//
// This walks static imports only — `import()` and React.lazy are how a mode
// pays for its own data, and that is the design.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { dirname, resolve, relative } from 'path';

const ROOT = process.cwd();
const ENTRY = resolve(ROOT, 'src/main.jsx');

// Data modules a first paint must not need. Sizes are the built chunks.
const MUST_BE_LAZY = {
  'src/data/wayground-sets.js': '481 kB',
  'src/data/jac-mockup-sets.js': '226 kB',
  'src/data/jac-official.js': '81 kB',
  'src/data/quiz-sets.js': 'barrel over the two banks above',
  // Added 2026-09-13. This one was *permitted* when the test was written, on the
  // reading that the SRS layer genuinely needs to know which cards exist — and it
  // does, but it needs their ids, not their content. Seven modules imported it
  // eagerly and five wanted nothing but `CARDS.length`. At 212 kB gzipped it was the
  // most expensive thing in the entry graph, larger than the entry chunk itself, and
  // the guard's own header explains why a comment could not have caught that.
  // `src/data/card-index.js` (37 kB raw, ids and categories) is the eager half now.
  'src/data/cards.js': '758 kB / 212 kB gzipped — the single largest chunk',
};

// Matches `import ... from 'x'` and `export ... from 'x'`, not `import('x')`.
const STATIC_FROM = /(?:^|\n)\s*(?:import|export)[\s\S]*?\sfrom\s*['"]([^'"]+)['"]/g;

function resolveSpecifier(spec, fromFile) {
  if (!spec.startsWith('.')) return null; // bare specifier: node_modules
  const base = resolve(dirname(fromFile), spec);
  for (const candidate of [base, `${base}.js`, `${base}.jsx`, `${base}/index.js`]) {
    if (existsSync(candidate) && !candidate.endsWith('.css')) return candidate;
  }
  return null;
}

function eagerGraph() {
  const seen = new Set();
  const queue = [ENTRY];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    let src;
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const m of src.matchAll(STATIC_FROM)) {
      const next = resolveSpecifier(m[1], file);
      if (next) queue.push(next);
    }
  }
  return new Set([...seen].map((f) => relative(ROOT, f)));
}

describe('the eager import graph', () => {
  const graph = eagerGraph();

  it('reaches main.jsx and the shell, so the walk is actually working', () => {
    // Guards the test itself: a resolver that silently returns null for
    // everything would pass every assertion below.
    expect(graph.has('src/App.jsx')).toBe(true);
    expect(graph.has('src/components/SayaTab.jsx')).toBe(true);
    expect(graph.has('src/router/modes.js')).toBe(true);
  });

  it.each(Object.entries(MUST_BE_LAZY))(
    'does not pull %s (%s) into the first page view',
    (file) => {
      expect(
        graph.has(file),
        `${file} is statically reachable from main.jsx — load it with import() instead`
      ).toBe(false);
    }
  );

  it('keeps the id/category index eager, which is the half the first screen needs', () => {
    // The contrast that makes the assertions above mean something, inverted on
    // 2026-09-13. This used to assert that `cards.js` itself was eager, on the
    // reasoning that "the Dashboard shows card counts and the flashcard deck is the
    // app's core". Both halves of that are true and neither needs card *content*:
    // a count is one integer and the SRS layer wants ids. What the corpus was
    // actually paying for was three rows of "Terakhir dipelajari" on the home screen
    // and `ModeRouter`'s `allCards`, for a tree that does not render until a mode is
    // open.
    //
    // So the small generated index is the eager half now, and this assertion is the
    // one that would notice if someone replaced it with the corpus again for
    // convenience.
    expect(graph.has('src/data/card-index.js')).toBe(true);
    expect(graph.has('src/utils/constants.js')).toBe(true); // TOTAL_CARDS
  });
});
