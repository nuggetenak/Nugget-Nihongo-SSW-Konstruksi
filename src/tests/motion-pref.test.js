// ─── tests/motion-pref.test.js ───────────────────────────────────────────────
// Pengaturan Gerakan is the reason the rest of the motion work is allowed to be
// ambitious: the owner asked for animation throughout the app with no ceiling,
// on the reasoning that a dedicated toggle makes anything expressive opt-out
// rather than imposed. So the toggle has to actually work, and these are the
// properties it would be easy to get subtly wrong.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MOTION_PRESETS,
  MOTION_FEATURES,
  MOTION_SPEEDS,
  DEFAULT_MOTION,
  getMotionPreset,
  nextMotionPreset,
  motionFeatures,
  clampSpeed,
  applyMotion,
} from '../utils/motion-pref.js';
import { prefersReducedMotion, motionAllows } from '../utils/motion.js';

const root = () => document.documentElement;

beforeEach(() => {
  root().removeAttribute('data-motion');
  root().style.removeProperty('--t-mult');
  for (const f of MOTION_FEATURES) root().removeAttribute(`data-motion-no-${f.key}`);
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
afterEach(() => vi.restoreAllMocks());

describe('presets', () => {
  it('defaults to penuh — an expressive app, with a way out', () => {
    expect(DEFAULT_MOTION.preset).toBe('penuh');
    expect(getMotionPreset(undefined).key).toBe('penuh');
    expect(getMotionPreset('nonsense').key).toBe('penuh');
  });

  it('cycles through every preset and wraps', () => {
    let k = MOTION_PRESETS[0].key;
    const seen = [k];
    for (let i = 0; i < MOTION_PRESETS.length - 1; i++) {
      k = nextMotionPreset(k);
      seen.push(k);
    }
    expect(seen).toEqual(MOTION_PRESETS.map((p) => p.key));
    expect(nextMotionPreset(k)).toBe(MOTION_PRESETS[0].key);
  });

  it('gets quieter in one direction, never louder', () => {
    // The ordering is the whole affordance: someone tapping through is looking
    // for less, and a preset that added motion back mid-cycle would read as a
    // bug rather than a choice.
    const sizes = MOTION_PRESETS.map((p) => motionFeatures({ preset: p.key }).size);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i], `${MOTION_PRESETS[i].key} should not add motion back`).toBeLessThan(
        sizes[i - 1]
      );
    }
    expect(motionFeatures({ preset: 'mati' }).size).toBe(0);
  });

  it('keeps press feedback in every preset that has any motion at all', () => {
    // On a touch device with no hover, the pressed state is the ONLY
    // confirmation a tap registered before the screen changes. Dropping it does
    // not calm the interface, it makes it feel broken.
    for (const p of MOTION_PRESETS) {
      if (p.key === 'mati') continue;
      expect(motionFeatures({ preset: p.key }).has('press'), `${p.key} dropped press`).toBe(true);
    }
  });
});

describe('per-feature overrides', () => {
  it('follows the preset while features is null', () => {
    expect(motionFeatures({ preset: 'halus', features: null }).has('count')).toBe(false);
    expect(motionFeatures({ preset: 'penuh', features: null }).has('count')).toBe(true);
  });

  it('an explicit toggle beats the preset', () => {
    const on = motionFeatures({ preset: 'halus', features: { count: true } });
    expect(on.has('count')).toBe(true);
    const off = motionFeatures({ preset: 'penuh', features: { count: false } });
    expect(off.has('count')).toBe(false);
  });

  it('unspecified features still fall back to the preset', () => {
    const f = motionFeatures({ preset: 'halus', features: { count: true } });
    expect(f.has('page'), 'halus keeps page transitions').toBe(true);
    expect(f.has('celebrate'), 'halus drops celebration').toBe(false);
  });
});

describe('speed', () => {
  it('rejects anything not on the ladder', () => {
    expect(clampSpeed(3)).toBe(1);
    expect(clampSpeed(undefined)).toBe(1);
    for (const s of MOTION_SPEEDS) expect(clampSpeed(s)).toBe(s);
  });

  it('writes the INVERSE as --t-mult, because a bigger multiplier is slower', () => {
    // The one genuinely easy thing to get backwards here: 1.5x speed has to mean
    // 1/1.5 duration. It looks right in the settings screen either way and only
    // looks wrong in the app.
    applyMotion({ ...DEFAULT_MOTION, speed: 1.5 });
    expect(Number(root().style.getPropertyValue('--t-mult'))).toBeCloseTo(1 / 1.5, 5);
    applyMotion({ ...DEFAULT_MOTION, speed: 0.5 });
    expect(Number(root().style.getPropertyValue('--t-mult'))).toBe(2);
    applyMotion({ ...DEFAULT_MOTION, speed: 1 });
    expect(root().style.getPropertyValue('--t-mult')).toBe('1');
  });
});

describe('applyMotion writes what CSS and utils/motion.js read', () => {
  it('marks every switched-off feature and no switched-on one', () => {
    applyMotion({ preset: 'halus', features: null, speed: 1 });
    expect(root().dataset.motion).toBe('halus');
    expect(root().hasAttribute('data-motion-no-count')).toBe(true);
    expect(root().hasAttribute('data-motion-no-page')).toBe(false);
  });

  it('motionAllows agrees with the attributes', () => {
    applyMotion({ preset: 'halus', features: null, speed: 1 });
    expect(motionAllows('page')).toBe(true);
    expect(motionAllows('count')).toBe(false);
  });

  it('mati reads as reduced motion to every existing caller', () => {
    applyMotion({ preset: 'mati', features: null, speed: 1 });
    expect(prefersReducedMotion()).toBe(true);
    expect(motionAllows('press')).toBe(false);
  });
});

describe('the OS setting is not a preference and always wins', () => {
  it('overrides even a reader who switched everything on', () => {
    applyMotion({ preset: 'penuh', features: null, speed: 1 });
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(prefersReducedMotion()).toBe(true);
    for (const f of MOTION_FEATURES) {
      expect(motionAllows(f.key), `${f.key} ignored the OS setting`).toBe(false);
    }
  });
});
