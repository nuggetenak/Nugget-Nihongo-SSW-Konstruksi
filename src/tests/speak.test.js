// ─── tests/speak.test.js ─────────────────────────────────────────────────────
// Phase F: speak.js utility — canSpeak, speakJP, HVPT cycling.
// All speech calls are no-ops in jsdom (canSpeak returns false).
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { canSpeak, speakJP, stopSpeech, _resetPlayCount } from '../utils/speak.js';

beforeEach(() => {
  _resetPlayCount();
});

describe('Phase F — speak.js', () => {
  it('canSpeak returns false in jsdom (no speechSynthesis)', () => {
    // jsdom does not implement speechSynthesis
    expect(canSpeak()).toBe(false);
  });

  it('speakJP does not throw when speechSynthesis is unavailable', () => {
    expect(() => speakJP('テスト')).not.toThrow();
  });

  it('speakJP with rate/pitch opts does not throw', () => {
    expect(() => speakJP('接地棒', { rate: 0.8, pitch: 1.0 })).not.toThrow();
  });

  it('stopSpeech does not throw when speechSynthesis is unavailable', () => {
    expect(() => stopSpeech()).not.toThrow();
  });

  it('_resetPlayCount resets internal counter', () => {
    // Just verify it does not throw and is callable
    expect(() => _resetPlayCount()).not.toThrow();
  });

  it('canSpeak returns true when speechSynthesis is mocked', () => {
    // Simulate a browser environment
    const originalSpeech = globalThis.speechSynthesis;
    const originalUtt = globalThis.SpeechSynthesisUtterance;
    
    globalThis.speechSynthesis = { cancel: () => {}, speak: () => {} };
    globalThis.SpeechSynthesisUtterance = function(text) { this.text = text; };
    
    expect(canSpeak()).toBe(true);
    
    // Restore
    globalThis.speechSynthesis = originalSpeech;
    globalThis.SpeechSynthesisUtterance = originalUtt;
  });

  it('speakJP calls speechSynthesis.speak when available', () => {
    const spoken = [];
    globalThis.speechSynthesis = { cancel: () => {}, speak: (u) => spoken.push(u) };
    globalThis.SpeechSynthesisUtterance = function(text) { this.text = text; };
    
    speakJP('掘削');
    expect(spoken.length).toBe(1);
    expect(spoken[0].lang).toBe('ja-JP');
    
    // Cleanup
    delete globalThis.speechSynthesis;
    delete globalThis.SpeechSynthesisUtterance;
  });

  it('HVPT cycling: each call uses different rate params', () => {
    const rates = [];
    globalThis.speechSynthesis = { cancel: () => {}, speak: (u) => rates.push(u.rate) };
    globalThis.SpeechSynthesisUtterance = function() {};
    Object.defineProperty(globalThis.SpeechSynthesisUtterance.prototype, 'rate', { writable: true, value: 1 });
    Object.defineProperty(globalThis.SpeechSynthesisUtterance.prototype, 'pitch', { writable: true, value: 1 });
    Object.defineProperty(globalThis.SpeechSynthesisUtterance.prototype, 'lang', { writable: true, value: '' });
    
    speakJP('A'); speakJP('B'); speakJP('C');
    
    // All 3 calls should have been made
    expect(rates.length).toBe(3);
    // Rates should not all be identical (HVPT varies them)
    const unique = new Set(rates);
    expect(unique.size).toBeGreaterThan(1);
    
    delete globalThis.speechSynthesis;
    delete globalThis.SpeechSynthesisUtterance;
  });
});
