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
 * Run: node scripts/audit-css-vars.mjs
 * Exits 1 (and lists every site) if any undefined, no-fallback var() reference is found.
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
for (const src of TOKEN_SOURCES) {
  const text = readFileSync(src, 'utf8');
  for (const m of text.matchAll(/^\s*(--[\w-]+):/gm)) defined.add(m[1]);
  for (const m of text.matchAll(/'(--[\w-]+)'/g)) defined.add(m[1]);
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
  console.log(`⚠️  ${withFallback.length} var() reference(s) with a fallback point at an undefined token (degrades, doesn't break):`);
  for (const { token, site } of withFallback) console.log(`   ${token}  ${site}`);
}

if (noFallback.length) {
  console.error(`\n❌ ${noFallback.length} var() reference(s) with NO fallback point at an undefined token.`);
  console.error('   These silently void their declaration — valid CSS, wrong behaviour.');
  for (const { token, site } of noFallback) console.error(`   ${token}  ${site}`);
  console.error('\nDefine the token, or point the reference at an existing one (see src/styles/theme.js T.*).');
  process.exit(1);
}

console.log(`✅ audit-css-vars: all var() references resolve (${defined.size} tokens defined, checked against ${walk(ROOT).length} files).`);
