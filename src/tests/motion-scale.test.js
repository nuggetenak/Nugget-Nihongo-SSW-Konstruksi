// ─── tests/motion-scale.test.js ──────────────────────────────────────────────
// The motion counterpart to spacing-scale.test.js, and it exists for the same
// reason that one does: the rule is invisible from any single file, so only a
// sweep can hold it.
//
// What it was holding back, measured before the conversion: ONE keyframe --
// `fadeIn` -- was played at SIX different durations across the app (0.15s, 0.2s,
// 0.25s, 0.3s, 0.35s, 0.4s) depending which file you happened to be in.
// `scaleIn` ran at four, `popIn` at three, `slideUp` and `slideDown` at two
// each. The scale defined two easing curves and the stylesheets contained five
// raw cubic-beziers, three of them near-duplicates of --ease-spring. Tokens were
// used in 49 places and bypassed in 77.
//
// That is why the app read as UNSETTLED rather than unanimated: the same gesture
// arrived at a different speed in each mode, and nothing anywhere said which
// speed was correct. DESIGN_SPEC §4 had stated the policy since item 21; the
// stylesheets simply did not follow it, and no gate noticed.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative } from 'path';
import { T } from '../utils/motion.js';

const SRC = resolve(__dirname, '..');
const global_ = readFileSync(resolve(SRC, 'styles/global.css'), 'utf-8');

function walk(dir, test, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== 'tests') walk(full, test, out);
    } else if (test(entry)) out.push(full);
  }
  return out;
}
const moduleCss = walk(SRC, (f) => f.endsWith('.module.css'));
const jsxFiles = walk(SRC, (f) => f.endsWith('.jsx'));
const rel = (f) => relative(SRC, f);

// Durations and easings that are deliberately NOT on the scale, each with the
// reason written at its call site. An ambient loop is not a UI transition, and a
// dwell time paired with a JS timer must not drift with the speed control.
const EXEMPT = [
  // AMBIENT LOOPS. A thing that repeats forever is not a UI transition: it has
  // no start the user caused and no end they are waiting for, and tying it to
  // --t-mult would make the speed control change what "loading" or "urgent"
  // looks like rather than how fast the interface answers. Dashboard's hazard
  // stripe, Skeleton's shimmer, the urgent exam timer.
  /\binfinite\b/,
  // DWELL TIMES. How long something stays on screen before it takes itself
  // away, each paired with a JS timer that has to agree with it -- so neither
  // may drift with the speed control.
  /missionFadeOut 3s/, // paired with the 3000ms dismiss timer
  /fcHintFade 2s/, // the flip hint's hold before it fades itself out
];
const exempt = (line) => EXEMPT.some((re) => re.test(line));
// A comment that MENTIONS a duration is prose, not a declaration. The rule is
// about what the browser reads, and skipping comments is what lets the
// exceptions explain themselves in place rather than in a list somewhere else.
const isComment = (line) => /^\s*(\/\*|\*|\/\/)/.test(line);

/**
 * The whole value of an object property, starting just after its colon.
 *
 * Reads forward to the `,` or `}` that closes the property, tracking bracket
 * depth and string quoting so a ternary, a template literal or a nested call
 * comes back intact. This is what lets the JSX check see a value that spans
 * six lines, which is exactly how four modes' hardcoded durations avoided it.
 */
function valueSpan(src, from) {
  let depth = 0;
  let quote = null;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    else if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) {
      if (depth === 0) return src.slice(from, i);
      depth--;
    } else if (c === ',' && depth === 0) return src.slice(from, i);
  }
  return src.slice(from);
}

describe('motion scale', () => {
  it('defines the full ladder, once, and only in global.css', () => {
    for (const t of ['instant', 'fast', 'base', 'enter', 'slow', 'count']) {
      const decls = [...global_.matchAll(new RegExp(`^\\s*--t-${t}:`, 'gm'))];
      expect(decls.length, `--t-${t} should be declared exactly once`).toBe(1);
    }
    for (const e of ['spring', 'smooth', 'exit', 'bounce']) {
      const decls = [...global_.matchAll(new RegExp(`^\\s*--ease-${e}:`, 'gm'))];
      expect(decls.length, `--ease-${e} should be declared exactly once`).toBe(1);
    }
    // No module may define its own copy — that is how six fadeIn durations
    // happened in the first place.
    for (const f of moduleCss) {
      expect(readFileSync(f, 'utf-8'), `${rel(f)} declares a motion token`).not.toMatch(
        /^\s*--(t|ease)-[a-z]+:/m
      );
    }
  });

  it('every duration resolves through --t-mult, so one property scales the app', () => {
    // This is what makes the Gerakan speed control a token change rather than a
    // refactor. A rung declared as a bare literal silently opts out of it.
    for (const t of ['instant', 'fast', 'base', 'enter', 'slow', 'count']) {
      const m = global_.match(new RegExp(`--t-${t}:\\s*([^;]+);`));
      expect(m, `--t-${t} missing`).toBeTruthy();
      expect(m[1], `--t-${t} does not go through --t-mult`).toMatch(/var\(--t-mult\)/);
    }
  });

  it('no stylesheet writes a bare duration in a transition or animation', () => {
    for (const f of moduleCss) {
      readFileSync(f, 'utf-8')
        .split('\n')
        .forEach((line, i) => {
          if (exempt(line) || isComment(line)) return;
          if (!/\b(transition|animation)[^-]/.test(line) && !/^\s+[a-z-]+ [\d.]+m?s/.test(line))
            return;
          expect(line, `${rel(f)}:${i + 1} hardcodes a duration`).not.toMatch(
            /(?<![\w.-])\d+(\.\d+)?m?s(?![\w.-])/
          );
        });
    }
  });

  it('no selector declares transition twice in one stylesheet', () => {
    // NOT a style rule. `transition` is a shorthand, so a second declaration on
    // the same selector REPLACES the first rather than adding to it -- and the
    // natural way to add a press animation is to append a new rule at the bottom
    // of the file, which is what item 164's first pass did.
    //
    // It silently deleted SideNav's background and colour transitions, killed
    // .azBtn's `all` and .termRow's background fade in GlossaryMode, and moved
    // all four selectors below the `prefers-reduced-motion` block that was
    // meant to switch them off -- so a reader who asked for less motion got the
    // press animation anyway. Four selectors, two files, and from inside either
    // rule it looks completely right. Only a sweep can see it, which is the same
    // argument the header of this file already makes.
    for (const f of moduleCss) {
      const css = readFileSync(f, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, (b) =>
        b.replace(/[^\n]/g, ' ')
      );
      const seen = new Map();
      let depth = 0;
      let rule = null;
      css.split('\n').forEach((line, i) => {
        const open = line.indexOf('{');
        if (open >= 0 && depth === 0) {
          rule = { sel: line.slice(0, open).trim().replace(/\s+/g, ' '), line: i + 1, has: false };
        }
        depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
        if (rule && /(^|;|\s)transition\s*:/.test(line)) rule.has = true;
        if (depth === 0 && rule && line.includes('}')) {
          // Selectors inside @media are a deliberate override of the base rule,
          // not a second declaration competing with it.
          if (rule.has && rule.sel && !rule.sel.startsWith('@')) {
            if (!seen.has(rule.sel)) seen.set(rule.sel, []);
            seen.get(rule.sel).push(rule.line);
          }
          rule = null;
        }
      });
      for (const [sel, lines] of seen) {
        expect(
          lines.length,
          `${rel(f)} declares transition for ${sel} at lines ${lines.join(', ')} — ` +
            'the later one replaces the earlier one; merge the terms into one list'
        ).toBe(1);
      }
    }
  });

  it('no stylesheet writes a raw cubic-bezier', () => {
    // Five of them existed against a scale that defines two, and three were
    // near-duplicates of --ease-spring that nobody could have told apart.
    for (const f of moduleCss) {
      expect(readFileSync(f, 'utf-8'), `${rel(f)} writes a raw easing curve`).not.toMatch(
        /cubic-bezier\(/
      );
    }
  });

  it('JSX style objects follow the same rule', () => {
    // ConfusionMode.jsx already did this right -- `transition: 'all var(--t-fast)'`
    // -- which is the spelling the rest should match.
    //
    // WHY THIS READS AN EXPRESSION AND NOT A LINE. The first version of this
    // check required the quote to sit on the same line as the property, and four
    // modes slipped straight through it: Angka, Danger, Confusion and Dengar all
    // wrote the value as a multi-line ternary, so `animation:` was followed by a
    // condition and the literal `'correctFlash 0.5s ease'` landed two lines down
    // with nothing to anchor it. The rule read as enforced and was not, which is
    // the same shape of failure as the View Transition that was asserted to be
    // CALLED while nothing moved (item 147) -- a guard that matches the common
    // spelling of a mistake rather than the mistake.
    for (const f of jsxFiles) {
      const src = readFileSync(f, 'utf-8');
      for (const m of src.matchAll(/\b(transition|animation)\s*:/g)) {
        const span = valueSpan(src, m.index + m[0].length);
        if (exempt(span)) continue;
        const line = src.slice(0, m.index).split('\n').length;
        expect(span, `${rel(f)}:${line} hardcodes a duration in a style object`).not.toMatch(
          /(?<![\w.-])\d+(\.\d+)?m?s(?![\w.-])/
        );
      }
    }
  });
});

describe('the JS scale and the CSS scale are the same scale', () => {
  it('every T rung equals the literal inside its --t-* token', () => {
    // Fourteen setTimeout sites stand in for "wait for the animation to finish"
    // and none of them was linked to the duration it was waiting on. Exporting T
    // is only worth anything if it cannot drift from the CSS, so this parses the
    // literal back out of the calc() and compares.
    for (const [rung, ms] of Object.entries(T)) {
      const m = global_.match(new RegExp(`--t-${rung}:\\s*calc\\((\\d+)ms`));
      expect(m, `--t-${rung} is not a calc() of a literal ms value`).toBeTruthy();
      expect(Number(m[1]), `--t-${rung} disagrees with T.${rung}`).toBe(ms);
    }
  });

  it('covers every rung the CSS declares, with nothing extra', () => {
    const declared = [...global_.matchAll(/^\s*--t-([a-z]+):/gm)]
      .map((m) => m[1])
      .filter((n) => n !== 'mult');
    expect(Object.keys(T).sort()).toEqual(declared.sort());
  });
});
