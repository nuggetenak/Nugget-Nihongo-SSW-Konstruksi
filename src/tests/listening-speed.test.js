// ─── tests/listening-speed.test.js ───────────────────────────────────────────
// Item 107. `dengar` spoke at one band, so it trained word recognition rather
// than comprehension — real instructions arrive fast, clipped, and over noise.
//
// The design decision worth pinning: a level is a *band of three* rates, not one
// rate. Passing `speakJP` an explicit `rate` disables the HVPT cycling the
// wrapper exists for (Logan et al. 1991 — varied rate and pitch help a learner
// place phoneme boundaries), and grading the difficulty must not cost that.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  speakJP,
  LISTENING_SPEEDS,
  LISTENING_SPEED_DEFAULT,
  _resetPlayCount,
} from '../utils/speak.js';

/** Rates handed to speechSynthesis across `n` consecutive calls. */
function ratesFor(opts, n) {
  const rates = [];
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  vi.stubGlobal('speechSynthesis', {
    speak: (u) => rates.push(u.rate),
    cancel: () => {},
    getVoices: () => [],
  });
  _resetPlayCount();
  for (let i = 0; i < n; i++) speakJP('安全', opts);
  vi.unstubAllGlobals();
  return rates;
}

beforeEach(() => _resetPlayCount());
afterEach(() => vi.unstubAllGlobals());

describe('graded listening speeds (item 107)', () => {
  it('offers three levels, from clear to supervisor-pace', () => {
    expect(Object.keys(LISTENING_SPEEDS)).toEqual(['jelas', 'alami', 'cepat']);
    const mean = (k) =>
      LISTENING_SPEEDS[k].params.reduce((a, p) => a + p.rate, 0) /
      LISTENING_SPEEDS[k].params.length;
    expect(mean('jelas')).toBeLessThan(mean('alami'));
    expect(mean('alami')).toBeLessThan(mean('cepat'));
  });

  it('every level is a band, not a single rate', () => {
    // This is the point: the grading must not flatten the HVPT variation.
    for (const [key, meta] of Object.entries(LISTENING_SPEEDS)) {
      const rates = new Set(meta.params.map((p) => p.rate));
      expect(rates.size, `${key} should vary within itself`).toBeGreaterThan(1);
    }
  });

  it('keeps varying across consecutive plays at one level', () => {
    const rates = ratesFor({ speed: 'cepat' }, 3);
    expect(new Set(rates).size).toBe(3);
    rates.forEach((r) => expect(LISTENING_SPEEDS.cepat.params.map((p) => p.rate)).toContain(r));
  });

  it('leaves the existing behaviour exactly where it was by default', () => {
    // `alami` is the old HVPT_PARAMS, so an unasked-for session sounds the same
    // as it did before this item.
    expect(LISTENING_SPEED_DEFAULT).toBe('alami');
    expect(ratesFor({}, 3)).toEqual(ratesFor({ speed: 'alami' }, 3));
  });

  it('falls back to natural for a level that does not exist', () => {
    expect(ratesFor({ speed: 'nonsense' }, 3)).toEqual(ratesFor({ speed: 'alami' }, 3));
  });

  it('an explicit rate still wins outright', () => {
    // A caller that names a rate means it; only the unnamed case is graded.
    expect(ratesFor({ rate: 0.42, speed: 'cepat' }, 2)).toEqual([0.42, 0.42]);
  });

  it('every level carries copy for the picker', () => {
    for (const meta of Object.values(LISTENING_SPEEDS)) {
      expect(meta.label).toBeTruthy();
      expect(meta.sub).toBeTruthy();
    }
  });
});
