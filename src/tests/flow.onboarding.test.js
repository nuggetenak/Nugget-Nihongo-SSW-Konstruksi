// ─── tests/flow.onboarding.test.js ────────────────────────────────────────────
// G.2 Integration: onboarding flow → sets onboarded + track + dailyGoal.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set } from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Flow — Onboarding', () => {
  it('fresh install has onboarded=false', () => {
    expect(get('prefs').onboarded).toBe(false);
  });

  it('completing onboarding sets onboarded=true', () => {
    set('prefs', (p) => ({ ...p, onboarded: true }));
    expect(get('prefs').onboarded).toBe(true);
  });

  it('track selection persists after onboarding', () => {
    set('prefs', (p) => ({ ...p, onboarded: true, track: 'bangunan' }));
    const prefs = get('prefs');
    expect(prefs.onboarded).toBe(true);
    expect(prefs.track).toBe('bangunan');
  });

  it('dailyGoal defaults to 20 and can be changed', () => {
    expect(get('prefs').dailyGoal).toBe(20);
    set('prefs', (p) => ({ ...p, dailyGoal: 30 }));
    expect(get('prefs').dailyGoal).toBe(30);
  });

  it('onboarded persists across engine re-init', () => {
    set('prefs', (p) => ({ ...p, onboarded: true, track: 'sipil' }));
    // Simulate re-open: reset engine cache, re-init from localStorage
    _reset_for_test();
    init();
    const prefs = get('prefs');
    expect(prefs.onboarded).toBe(true);
    expect(prefs.track).toBe('sipil');
  });
});
