// ─── tests/spacing-scale.test.js ─────────────────────────────────────────────
// Locks the two rules the 2026-09-04 layout pass established, both of which are
// invisible from any single file and were each violated in ~350 places before
// it.
//
// RULE 1 — spacing is rem, via the scale.
// Ukuran Teks (utils/text-scale.js) scales the ROOT FONT SIZE, so rem spacing
// grows with the text and px spacing does not. Measured on the running app
// before the fix: at "Sangat Besar" body text went 15px -> 18.8px while --sp-3
// stayed 12px and --sp-4 stayed 16px, so every gap, padding and gutter held
// still and the layout got *tighter* for exactly the reader who had asked for
// it to get looser. A px value in a padding, margin or gap is therefore a bug.
//
// RULE 2 — width has one owner.
// AppShell's .content applies --max-w, the gutter and the bottom-nav safe area
// once, for everything rendered inside it. Ten stylesheets repeated the
// max-width and the gutter anyway, which cost a mode screen 32px of a 390px
// phone. AppShell.module.css says this in its own header; nothing enforced it.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative } from 'path';

const SRC = resolve(__dirname, '..');
const REM_PX = 16;

function walk(dir, test, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== 'tests') walk(full, test, out);
    } else if (test(entry)) out.push(full);
  }
  return out;
}

const cssFiles = walk(SRC, (f) => f.endsWith('.css'));
const jsxFiles = walk(SRC, (f) => f.endsWith('.jsx'));
const global = readFileSync(resolve(SRC, 'styles/global.css'), 'utf-8');

const SPACING_PROP =
  '(?:padding|margin|gap|row-gap|column-gap|padding-(?:top|right|bottom|left|block|inline)|margin-(?:top|right|bottom|left|block|inline))';
const JSX_SPACING_KEY =
  '(?:padding|margin|gap|rowGap|columnGap|padding(?:Top|Right|Bottom|Left|Block|Inline)|margin(?:Top|Right|Bottom|Left|Block|Inline))';

describe('spacing scale', () => {
  const tokens = [...global.matchAll(/--space-(\d+):\s*([\d.]+)rem;/g)].map(([, name, rem]) => ({
    name: Number(name),
    px: Number(rem) * REM_PX,
  }));

  it('every step is defined in rem and named for the px it resolves to', () => {
    expect(tokens.length).toBeGreaterThan(10);
    for (const t of tokens) expect(t.px, `--space-${t.name}`).toBe(t.name);
  });

  it('covers the 2px grid the app actually uses, without gaps', () => {
    // 2px grid to 16, 4px to 32, 8px to 64. The previous scale was six steps on
    // a 4px grid, which had no name for 2, 6, 10 or 14 -- values the CSS under
    // it used 233 times between them, so most spacing bypassed the scale.
    const expected = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64];
    expect(tokens.map((t) => t.name)).toEqual(expected);
  });

  it('the old px scale is gone, not shadowed', () => {
    // Renaming rather than repointing was deliberate: --sp-4 meant 16px and
    // --space-4 means 4px, so leaving both alive would silently mis-size any
    // call site that was missed. With the old names undefined, a survivor
    // fails audit:css-vars instead.
    expect(global).not.toMatch(/--sp-\d+:/);
  });

  it('page gutters and the nav safe-area derive from the scale', () => {
    for (const token of ['--gutter-compact', '--gutter-medium', '--gutter-wide']) {
      const m = global.match(new RegExp(`${token}:\\s*([^;]+);`));
      expect(m, token).toBeTruthy();
      expect(m[1], token).toMatch(/var\(--space-\d+\)/);
    }
    // --nav-h stays px on purpose (a fixed chrome height, not rhythm), so only
    // the padding term is checked here.
    expect(global).toMatch(/--nav-safe:\s*calc\(var\(--nav-h\) \+ var\(--space-\d+\)/);
  });
});

describe('no px spacing outside the scale', () => {
  it('stylesheets use tokens for padding, margin and gap', () => {
    const offenders = [];
    for (const file of cssFiles) {
      readFileSync(file, 'utf-8')
        .split('\n')
        .forEach((line, i) => {
          const m = line.match(new RegExp(`^\\s*${SPACING_PROP}\\s*:([^;]*);`));
          if (!m) return;
          for (const [, sign, num] of m[1].matchAll(/(-?)(\d+(?:\.\d+)?)px/g)) {
            const px = Number(num);
            // 0 is not a length; 1px is a hairline (border overlaps, the
            // sr-only clip rect), not rhythm; a negative offset pairs with a
            // px-sized control (see ModeHeader's back button) and would drift
            // from it in rem.
            if (px === 0 || px === 1 || sign === '-') continue;
            offenders.push(`${relative(SRC, file)}:${i + 1} ${line.trim()}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });

  it('JSX style objects use tokens too', () => {
    // 418 of these were bare numbers and px strings. Fixing only the
    // stylesheets would have left more than half the app's spacing frozen.
    const offenders = [];
    for (const file of jsxFiles) {
      const src = readFileSync(file, 'utf-8');
      const bare = new RegExp(`\\b${JSX_SPACING_KEY}\\s*:\\s*(\\d+)\\s*[,}\\n]`, 'g');
      const quoted = new RegExp(`\\b${JSX_SPACING_KEY}\\s*:\\s*'([^']*)'`, 'g');
      for (const m of src.matchAll(bare)) {
        if (Number(m[1]) > 1) offenders.push(`${relative(SRC, file)}: ${m[0].trim()}`);
      }
      for (const m of src.matchAll(quoted)) {
        for (const [, num] of m[1].matchAll(/(\d+(?:\.\d+)?)px/g)) {
          if (Number(num) > 1) offenders.push(`${relative(SRC, file)}: ${m[0].trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('width has one owner', () => {
  it('only AppShell caps the content column', () => {
    const owners = cssFiles
      // ^\s* so a mention inside a comment doesn't read as a declaration.
      .filter((f) => /^\s*max-width:\s*var\(--max-w/m.test(readFileSync(f, 'utf-8')))
      .map((f) => relative(SRC, f));
    expect(owners).toEqual(['components/AppShell.module.css']);
  });

  it('a mode opting into the shell height can grow but never shrink', () => {
    // `flex: 1` would set flex-basis:0 and let a tall screen collapse below its
    // own content on a short viewport; `1 0 auto` grows into free space only.
    const modes = readFileSync(resolve(SRC, 'modes/modes.module.css'), 'utf-8');
    expect(modes).toMatch(/\.fcWrapper\s*\{[^}]*flex:\s*1 0 auto/s);
    const shell = readFileSync(resolve(SRC, 'components/AppShell.module.css'), 'utf-8');
    expect(shell).toMatch(
      /\.shell\[data-chrome='mode'\] \.content\s*\{[^}]*flex-direction:\s*column/s
    );
  });
});
