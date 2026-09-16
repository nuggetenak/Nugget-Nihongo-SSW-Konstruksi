#!/usr/bin/env node
/**
 * audit-css-vars.mjs — checks every `var(--token)` reference in src/ against the tokens
 * actually defined in src/styles/global.css and src/styles/theme.js.
 *
 * WHY THIS EXISTS (UI_UX_PLAN.md item 30, 2026-08-20):
 * An undefined CSS custom property is valid CSS — `var(--typo-name)` with no matching
 * declaration just silently produces the property's initial/inherited value, no warning
 * anywhere. That's invisible to `npm test`, `npm run lint`, and `npm run build`: none of them
 * parse CSS custom-property usage against its declarations. Eleven references shipped this
 * way — two abandoned naming schemes (`--c-*`, `--color-*`) and one typo
 * (`--fw-semibold` for `--fw-semi`) — and the worst instance silently disabled the
 * green/amber/red score colour-coding in WaygroundMode. Nothing caught it until a manual
 * line-by-line audit did. This script makes that audit mechanical and repeatable.
 *
 * References WITH a fallback (`var(--x, someDefault)`) still resolve to something, so a
 * missing `--x` degrades rather than silently voiding — those are reported separately and
 * don't fail the check. Bare references with no fallback are the real bugs: report AND fail.
 *
 * Tokens can also come from src/styles/theme.js's THEMES object (applied at runtime as
 * inline custom properties on the root), which is why both files are read as sources of truth,
 * not just global.css.
 *
 * ── TWO MORE CHECKS (UI_UX_PLAN items 171 + 175, 2026-09-14) ────────────────
 * The check above runs one way only: every REFERENCE has a DECLARATION. Nothing
 * ran the other way, and that absence is exactly what let `--fs-jp-primary` sit
 * in the type scale for four releases reading like the token that sizes a
 * flashcard's Japanese while being referenced by nothing at all. So:
 *
 *   2. Declared and never referenced. An unused token is not merely tidy-up: it
 *      is a claim about the app that is not true, and the next reader believes
 *      it. Scale rungs are the one honest exception -- a spacing ladder with a
 *      hole in it pushes the next person to hardcode -- so those are named in
 *      SCALE_COMPLETENESS below, with the reason, one line each.
 *
 *   3. A colour literal in a stylesheet that EQUALS a semantic --ssw-* token.
 *      Narrower than "no hex in CSS", deliberately. DESIGN_SPEC §2 exempts
 *      identity accents (a mode's own colour) and fixed ink on a fixed brand
 *      fill, and those are most of the ~100 literals in this tree -- a gate
 *      that flagged them would be an allowlist as long as the finding list.
 *      What is never legitimate is spelling out a value the theme already
 *      names, because that is the one that stops following the theme. Gradient
 *      stops are exempt: --ssw-* resolves per theme and a gradient ramp is
 *      built from fixed stops on purpose.
 *
 * Both are zero-tolerance today, which is the point of adding them today.
 *
 * NOT here, and checked before assuming otherwise: raw px in padding/margin/gap.
 * The plan filed that alongside these as ungated; it is not. spacing-scale.test.js
 * ("no px spacing outside the scale") already holds it at zero offenders, and has
 * since item 68. A second gate on the same rule would be the drift this file
 * exists to catch.
 *
 * Run: node scripts/audit-css-vars.mjs
 * Exits 1 (and lists every site) if any check fails.
 */
import { readFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';
const TOKEN_SOURCES = ['src/styles/global.css', 'src/styles/theme.js'];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'tests' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.css') || entry.endsWith('.jsx')) out.push(full);
  }
  return out;
}

const defined = new Set();
/** token -> where it was declared, so check 2 can point at the line to delete. */
const declaredAt = new Map();
for (const src of TOKEN_SOURCES) {
  const text = readFileSync(src, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/^\s*(--[\w-]+):/g)) {
      defined.add(m[1]);
      if (!declaredAt.has(m[1])) declaredAt.set(m[1], `${src}:${i + 1}`);
    }
  });
  // theme.js declares its tokens as quoted object keys rather than CSS lines.
  for (const m of text.matchAll(/'(--[\w-]+)'\s*:/g)) {
    defined.add(m[1]);
    if (!declaredAt.has(m[1])) declaredAt.set(m[1], src);
  }
}

const noFallback = [];
const withFallback = [];

for (const file of walk(ROOT)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
      const [, token, hasFallback] = m;
      if (defined.has(token)) continue;
      const site = `${file}:${idx + 1}`;
      (hasFallback ? withFallback : noFallback).push({ token, site });
    }
  });
}

if (withFallback.length) {
  console.log(
    `⚠️  ${withFallback.length} var() reference(s) with a fallback point at an undefined token (degrades, doesn't break):`
  );
  for (const { token, site } of withFallback) console.log(`   ${token}  ${site}`);
}

if (noFallback.length) {
  console.error(
    `\n❌ ${noFallback.length} var() reference(s) with NO fallback point at an undefined token.`
  );
  console.error('   These silently void their declaration — valid CSS, wrong behaviour.');
  for (const { token, site } of noFallback) console.error(`   ${token}  ${site}`);
  console.error(
    '\nDefine the token, or point the reference at an existing one (see src/styles/theme.js T.*).'
  );
  process.exit(1);
}

console.log(
  `✅ audit-css-vars: all var() references resolve (${defined.size} tokens defined, checked against ${walk(ROOT).length} files).`
);

// ─── Check 2: declared and never referenced ──────────────────────────────────

/**
 * Rungs kept for the shape of their scale rather than for a current reader.
 *
 * The argument for each is the same and it is not "we might need it": a ladder
 * with a hole where 56 should be is a ladder the next person steps around by
 * writing 3.5rem, and spacing-scale.test.js asserts in as many words that the
 * scale "covers the 2px grid the app actually uses, WITHOUT GAPS". A floor or a
 * ceiling missing from a scale is the same hole at the end.
 *
 * Everything here is a rung. Nothing here is a one-off, and that is the line:
 * --fs-jp-primary was a one-off dressed as a rung, --ls-normal was a token whose
 * value was the property's own default, and both were deleted (item 171) rather
 * than admitted to this list. If a new entry is not a scale member, it does not
 * belong here -- delete the token instead.
 */
const SCALE_COMPLETENESS = new Map([
  ['--r-xs', 'radius scale floor; --r-sm upward are in use'],
  ['--space-56', 'spacing ladder rung — the scale is asserted gap-free'],
  ['--space-64', 'spacing ladder top rung — same'],
  ['--shadow-xs', 'shadow scale floor; sm/md/lg are in use'],
  ['--z-base', 'z-scale floor — the stacking order is only legible whole'],
]);

// Tokens reach the app through more than var(): theme.js maps them
// (`amber: 'var(--ssw-amber)'`), and JS writes some directly
// (motion-pref.js sets --t-mult, applyTextScale sets the root size). So the
// usage sweep covers .js as well, and both token sources themselves.
function walkAll(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'tests' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkAll(full));
    else if (/\.(css|jsx|js)$/.test(entry)) out.push(full);
  }
  return out;
}

const used = new Set();
for (const file of [...walkAll(ROOT), 'index.html']) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) used.add(m[1]);
  // setProperty('--x', …) / getPropertyValue('--x') — a token written or read
  // from JS is every bit as referenced as one named in a var().
  for (const m of text.matchAll(
    /(?:setProperty|getPropertyValue|removeProperty)\(\s*['"`](--[\w-]+)/g
  ))
    used.add(m[1]);
}

const unused = [...defined].filter((t) => !used.has(t) && !SCALE_COMPLETENESS.has(t));

if (unused.length) {
  console.error(`\n❌ ${unused.length} token(s) declared and referenced nowhere.`);
  console.error('   A token nobody reads is a claim about the app that is not true — and the');
  console.error(
    "   next reader believes it (--fs-jp-primary looked like the flashcard's JP size)."
  );
  for (const t of unused) console.error(`   ${t}  ${declaredAt.get(t) ?? '?'}`);
  console.error("\nDelete it, or reference it. If it is a rung of a scale kept for the scale's");
  console.error('shape, add it to SCALE_COMPLETENESS above with the reason.');
  process.exit(1);
}

console.log(
  `✅ audit-css-vars: every token is referenced (${SCALE_COMPLETENESS.size} scale rungs exempt).`
);

// ─── Check 3: a stylesheet literal that duplicates a semantic token ──────────

/** '#abc' / '#aabbcc' / '#aabbccdd' -> '#aabbcc', so spellings compare equal. */
function normalizeHex(hex) {
  let h = hex.slice(1).toLowerCase();
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  return `#${h.slice(0, 6)}`;
}

// Only --ssw-*: those are the SEMANTIC names (text, surface, border, wrong,
// correct, amber…) that resolve per theme. A literal equal to one of them is a
// value that has stopped following the theme, which is the whole failure.
const semantic = new Map();
for (const src of TOKEN_SOURCES) {
  for (const m of readFileSync(src, 'utf8').matchAll(
    /['"]?(--ssw-[\w-]+)['"]?\s*:\s*['"]?(#[0-9a-fA-F]{3,8})\b/g
  )) {
    const hex = normalizeHex(m[2]);
    if (!semantic.has(hex)) semantic.set(hex, []);
    if (!semantic.get(hex).includes(m[1])) semantic.get(hex).push(m[1]);
  }
}

/**
 * Blank out /* … *\/ spans, keeping newlines so line numbers still line up.
 *
 * Per-line comment detection is not enough and this file proved it: the first
 * version of this check tested whether a line STARTED with a marker, and
 * Onboarding.module.css explains its dark-theme brightness lift in a block
 * comment whose second line begins with the hex it is talking about. Prose
 * about a colour is not a declaration of one.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

const shadowed = [];
for (const file of walk(ROOT)) {
  if (!file.endsWith('.css')) continue;
  stripComments(readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, idx) => {
      // A gradient ramp is built from fixed stops on purpose — --ssw-* resolves
      // per theme, and a ramp that re-resolved mid-gradient is not a ramp.
      if (/gradient\(/.test(line)) return;
      for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        const names = semantic.get(normalizeHex(m[0]));
        if (names) shadowed.push({ site: `${file}:${idx + 1}`, hex: m[0], names });
      }
    });
}

if (shadowed.length) {
  console.error(
    `\n❌ ${shadowed.length} colour literal(s) in a stylesheet spell out a token's value.`
  );
  console.error('   These stop following the theme the moment either theme moves.');
  for (const { site, hex, names } of shadowed)
    console.error(`   ${hex}  ${site}  → var(${names.join(' / ')})`);
  process.exit(1);
}

console.log(
  `✅ audit-css-vars: no stylesheet literal shadows a semantic token (${semantic.size} colours checked).`
);
