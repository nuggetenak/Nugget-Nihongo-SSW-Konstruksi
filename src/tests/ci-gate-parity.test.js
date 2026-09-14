// ─── tests/ci-gate-parity.test.js ────────────────────────────────────────────
// `npm run validate` is the gate every doc in this repo calls the gate, and
// `.github/workflows/ci.yml` deliberately does NOT run it as one command — it
// splits the same checks into named steps so a red run says which gate failed
// without anyone scrolling a log. That is a good trade with one cost: the two
// lists are now maintained by hand, in two files, and nothing compared them.
//
// The workflow's own comment claimed something did: "the set is exactly
// `validate`'s, and format-and-lint.test.js asserts that". There was no
// `format-and-lint.test.js` — not renamed, not moved, never written. A comment
// naming a guard that does not exist is worse than no comment, because the next
// session reads it and stops checking. This file is that guard, under a name
// that says what it does, and the comment in `ci.yml` now points here.
//
// What it holds:
//
//   1. Every script `validate` runs is a step in CI. Dropping one from the
//      workflow is exactly the gap item 134 filed — `format:check` and four of
//      the five data audits sat in no gate at all for weeks, while
//      `HUSKY-SETUP.md` documented the hole and relied on a pre-commit hook
//      that is deliberately not a repo dependency and so guards nobody.
//   2. A CI gate that `validate` does not run has to be declared here by name.
//      `test:coverage` is the one, and on purpose: the thresholds are a ratchet
//      that needs the whole suite instrumented, which is too slow for the local
//      loop and belongs where it cannot be skipped.
//   3. `format` and `format:check` cover the same paths. They are written out
//      twice, and a path added to one and not the other is silent: the writer
//      formats a file the checker never reads, or the reverse.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const ci = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8');

/** The `npm run X` names a composite script chains together, in order. */
function chainedScripts(script) {
  return [...script.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);
}

/** Every script name CI invokes, from its `run:` lines. */
function ciScripts() {
  const out = new Set();
  for (const line of ci.split('\n')) {
    const m = line.match(/^\s*(?:-\s*)?run:\s*npm (?:run )?([\w:-]+)/);
    if (m) out.add(m[1] === 'test' ? 'test' : m[1]);
  }
  return out;
}

/**
 * Gates CI runs that `validate` does not, declared by name rather than counted.
 * Kept out of `validate` so the local loop stays fast; CI is where it has to hold.
 */
const CI_ONLY_GATES = new Set(['test:coverage']);

/** `npm ci` is dependency install, not a gate. */
const NOT_A_GATE = new Set(['ci']);

describe('CI runs the same gates as npm run validate', () => {
  it('validate is still a composite of named scripts', () => {
    // If this ever becomes a single shell line, the parsing below goes quiet
    // rather than wrong, so assert the shape the rest of the file depends on.
    expect(chainedScripts(pkg.scripts.validate)).toEqual([
      'format:check',
      'lint',
      'test',
      'audit:full',
      'build',
    ]);
  });

  it('every script validate runs is a step in ci.yml', () => {
    const inCI = ciScripts();
    const missing = chainedScripts(pkg.scripts.validate).filter((s) => !inCI.has(s));
    expect(
      missing,
      'a gate in `npm run validate` that CI does not run. Add the step to ' +
        '.github/workflows/ci.yml — a check that only runs locally guards nobody'
    ).toEqual([]);
  });

  it('a CI gate validate does not run is declared here by name', () => {
    const fromValidate = new Set(chainedScripts(pkg.scripts.validate));
    const undeclared = [...ciScripts()].filter(
      (s) => !fromValidate.has(s) && !CI_ONLY_GATES.has(s) && !NOT_A_GATE.has(s)
    );
    expect(
      undeclared,
      'CI runs a gate `npm run validate` does not. Either add it to validate so ' +
        'it runs locally too, or add it to CI_ONLY_GATES with the reason'
    ).toEqual([]);
  });

  it('the five data audits are all in audit:full', () => {
    // audit:full is the one composite a new audit gets forgotten in: it is
    // chained by hand, and CI runs the composite, not the pieces.
    const audits = Object.keys(pkg.scripts).filter(
      (s) => s.startsWith('audit:') && s !== 'audit:full'
    );
    const chained = chainedScripts(pkg.scripts['audit:full']);
    expect(
      audits.filter((a) => !chained.includes(a)),
      'an audit script no gate runs'
    ).toEqual([]);
  });

  it('format and format:check cover the same paths', () => {
    const paths = (script) =>
      script
        .replace(/^prettier\s+(--write|--check)\s+/, '')
        .split(/\s+/)
        .filter((t) => !t.startsWith('--') && t !== '.prettierignore')
        .sort();
    expect(paths(pkg.scripts['format:check'])).toEqual(paths(pkg.scripts.format));
  });
});
