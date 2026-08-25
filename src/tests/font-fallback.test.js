// ─── tests/font-fallback.test.js ──────────────────────────────────────────────
// item 39: 14 CSS rules across 6 files set font-family: var(--font-jp, 'Noto
// Serif JP', serif) — --font-jp was defined nowhere and Noto Serif JP was
// never loaded (index.html requests DM Sans, Noto Sans JP, Syne), so every
// one of them fell through to the browser's generic serif. Removed rather
// than defined, since Japanese already inherits the correct, loaded stack
// from body. This test is a tripwire so it can't quietly come back in a
// 15th file.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '..');

function findModuleCssFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findModuleCssFiles(full, out);
    else if (entry.endsWith('.module.css')) out.push(full);
  }
  return out;
}

describe('Japanese font fallback (item 39)', () => {
  it('no CSS file references the undefined --font-jp custom property', () => {
    const offenders = findModuleCssFiles(root).filter((f) =>
      readFileSync(f, 'utf-8').includes('--font-jp')
    );
    expect(offenders).toEqual([]);
  });

  it('no CSS file references the never-loaded Noto Serif JP', () => {
    const offenders = findModuleCssFiles(root).filter((f) =>
      readFileSync(f, 'utf-8').includes('Noto Serif JP')
    );
    expect(offenders).toEqual([]);
  });

  it('the loaded Japanese stack is still Noto Sans JP, inherited from body', () => {
    const css = readFileSync(resolve(root, 'styles/global.css'), 'utf-8');
    expect(css).toMatch(/font-family:\s*'DM Sans',\s*'Noto Sans JP'/);
  });
});
