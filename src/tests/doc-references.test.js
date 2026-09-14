// ─── tests/doc-references.test.js ────────────────────────────────────────────
// The live docs are read as instructions. `docs/AGENT_WORKFLOW.md` says so
// outright — "don't ask for these to be pasted, read them from the clone" — so a
// path in one of them is a pointer a future session follows, and a pointer at a
// file that no longer exists costs that session the time it takes to work out
// which of the two is wrong.
//
// Nine of them had gone stale by 2026-09-14, found by resolving every backticked
// path in the live docs rather than by reading them:
//
//   - `docs/COMPONENT_SPEC.md` §16 documented `src/utils/typo-diff.js` and
//     `src/components/TypoDiff.jsx` as shared primitives. Both were deleted in
//     7.0.0 with the only two modes that used them, and that section is a
//     *component inventory* — the one kind of doc where a phantom entry is worst.
//     Its shape taxonomy still listed a free-text row the app no longer has.
//   - `HANDOFF.md`, whose entire job is live state, still listed
//     `docs/RUBY_MISMATCH_AUDIT.md` as an open queue of 144 readings (archived,
//     empty) and the UI/UX plan's "Still open, as of 2026-09-05" list of 18 items
//     (all closed, the file now archived).
//   - `_MAP.md`'s architecture tree listed the plan with "open items live in
//     §12–§14", and described `ci.yml` as "lint + test + build" three gates after
//     item 134 added format:check, audit:full and coverage.
//
// AGENT_WORKFLOW's own §4 states the rule this file enforces — "Every live doc
// belongs in this table… A doc nothing points at is a doc nothing keeps honest" —
// and names the three docs that drifted badly while sitting in `docs/` unrowed.
// A rule stated in prose had already failed three times; the second test below is
// that rule with teeth.
//
// `CHANGELOG.md` is deliberately not scanned. It is a record of what was true at
// each release, so a path that has since been deleted is correct there, and
// rewriting release notes to keep a linter quiet would be falsifying them.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const read = (rel) => readFileSync(resolve(root, rel), 'utf8');
const exists = (rel) => existsSync(resolve(root, rel));

/** Docs whose job is to describe the repo as it is now. */
const LIVE_DOCS = [
  'README.md',
  'HANDOFF.md',
  '_MAP.md',
  // Added 2026-09-14: it had told readers for four releases that CI ran neither
  // `format:check` nor four of the five audits, four releases after item 134 put
  // all of them in `ci.yml`. A live doc outside this list is a live doc nothing
  // keeps honest, which is the whole premise of the file.
  'HUSKY-SETUP.md',
  ...readdirSync(resolve(root, 'docs'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `docs/${f}`),
];

/** A backticked repo path, with an optional `:12` or `:12,34` line suffix. */
const PATH_RE = /`((?:src|scripts|docs|public|legacy)\/[A-Za-z0-9_./-]+\.[a-z]{2,4})(?::[\d,]+)?`/g;

/**
 * Paths that no longer exist and are named on purpose, as (doc, path) pairs so
 * the same stale name in a doc that means it as current still fails.
 *
 * Every entry is a passage that says, in its own text, that the thing is gone —
 * which is why it can be named. Deleting these references would delete the
 * record of the deletion.
 */
const DELIBERATELY_GONE = new Set([
  // _MAP.md's session log is history by definition: these rows describe the
  // sessions that deleted or archived the file they name.
  '_MAP.md → docs/UI_UX_PLAN.md',
  '_MAP.md → docs/RUBY_MISMATCH_AUDIT.md',
  '_MAP.md → docs/DATA_ARCH_AUDIT.md',
  '_MAP.md → src/hooks/useStableContextValue.js',
  // CARD_CONTENT_SPEC §0C states outright that the two top-level JAC files were
  // replaced at the 2026-08-18 merge, and §8 is headed "COMPLETE — every item
  // below shipped"; the P12 checklist inside it names a mode dropped in 7.0.0.
  'docs/CARD_CONTENT_SPEC.md → src/data/jac-teori.js',
  'docs/CARD_CONTENT_SPEC.md → src/data/jac-lifeline.js',
  'docs/CARD_CONTENT_SPEC.md → src/modes/ProductionMode.jsx',
  // COMPONENT_SPEC §16 is headed REMOVED IN 7.0.0 and kept for its argument.
  'docs/COMPONENT_SPEC.md → src/utils/typo-diff.js',
  'docs/COMPONENT_SPEC.md → src/components/TypoDiff.jsx',
]);

describe('the live docs point at files that exist', () => {
  it('every backticked repo path resolves, or is named as deliberately gone', () => {
    const broken = [];
    let checked = 0;
    for (const doc of LIVE_DOCS) {
      for (const [, path] of read(doc).matchAll(PATH_RE)) {
        checked++;
        const pair = `${doc} → ${path}`;
        if (exists(path) || DELIBERATELY_GONE.has(pair)) continue;
        const archived = exists(`docs/archive/${path.replace(/^docs\//, '')}`);
        broken.push(pair + (archived ? '  (it is in docs/archive/ — say so)' : ''));
      }
    }

    // A regex that matches nothing passes every assertion below it, so say how
    // much was read: 244 references, 117 distinct paths, across the 11 live docs
    // on 2026-09-14. The floor catches PATH_RE silently breaking; it is not a
    // number to maintain.
    expect(
      checked,
      'PATH_RE stopped matching — this test is no longer checking anything'
    ).toBeGreaterThan(120);
    expect(
      broken,
      'a live doc points at a file that does not exist. Fix the reference, or add ' +
        'the (doc → path) pair to DELIBERATELY_GONE where the passage itself says it is gone'
    ).toEqual([]);
  });

  it('nothing in DELIBERATELY_GONE has quietly come back', () => {
    // An allow-list that outlives its reason is the next stale thing. If a path
    // here exists again, the doc may now be right and the exemption is the lie.
    const resurrected = [...DELIBERATELY_GONE].filter((pair) => exists(pair.split(' → ')[1]));
    expect(resurrected, 'exempted as deleted, but the file is back — drop the exemption').toEqual(
      []
    );
  });

  it('every live doc has a row in AGENT_WORKFLOW §4', () => {
    // The rule is §4's own: "Every live doc belongs in this table." It names the
    // three that drifted while unrowed — DATA_ARCH_AUDIT, BLUEPRINT-CURRENT and
    // RUBY_MISMATCH_AUDIT, the last of which sat in docs/ for nine days while the
    // renderer behaviour its central claim rested on was replaced.
    const table = read('docs/AGENT_WORKFLOW.md');
    const unrowed = LIVE_DOCS.filter((doc) => {
      const name = doc.replace(/^docs\//, '');
      return !table.includes(`\`${doc}\``) && !table.includes(`\`${name}\``);
    });
    expect(
      unrowed,
      'a doc in docs/ or the repo root with no row in AGENT_WORKFLOW §4. Add the row ' +
        'in the same commit that adds the doc — or archive the doc'
    ).toEqual([]);
  });

  it('no live doc is a work queue with open items', () => {
    // Both UI/UX plans retired empty (items 1-42 on 2026-08-25, items 43-144 on
    // 2026-09-14). A queue file in docs/ is not forbidden, but it must not be
    // *silently* reintroduced: an unticked box in a live doc is a claim that work
    // is open, and the docs already carried 55 of those over finished work, under
    // a heading that had to explain they were finished.
    const withOpenBoxes = LIVE_DOCS.filter((doc) => /^\s*[-*] \[ \]/m.test(read(doc)));
    expect(
      withOpenBoxes,
      'a live doc carries unticked checkboxes. If the work is real it belongs in a ' +
        'deliberately-opened plan; if it is done, tick it or say so at the section head'
    ).toEqual(['docs/CARD_CONTENT_SPEC.md']);
  });
});
