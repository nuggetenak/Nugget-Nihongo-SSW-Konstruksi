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
    for (const f of jsxFiles) {
      readFileSync(f, 'utf-8')
        .split('\n')
        .forEach((line, i) => {
          if (exempt(line) || isComment(line)) return;
          if (!/(transition|animation):\s*['"`]/.test(line)) return;
          expect(line, `${rel(f)}:${i + 1} hardcodes a duration in a style object`).not.toMatch(
            /(?<![\w.-])\d+(\.\d+)?m?s(?![\w.-])/
          );
        });
    }
  });
});
