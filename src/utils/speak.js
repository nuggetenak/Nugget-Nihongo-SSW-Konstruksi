// ─── utils/speak.js ─────────────────────────────────────────────────────────
// Web Speech API wrapper for Japanese audio output.
// HVPT-inspired: cycles through 3 parameter sets (Logan et al. 1991) — varied
// rate/pitch helps perceptual learning of phoneme boundaries.
// Falls back silently in environments without speechSynthesis (tests, jsdom).
// ─────────────────────────────────────────────────────────────────────────────

let _playCount = 0;

// Three parameter variants to create perceptual variation (HVPT-lite)
const HVPT_PARAMS = [
  { rate: 0.7, pitch: 0.85 }, // slow, lower pitch
  { rate: 0.8, pitch: 1.0 }, // natural rate
  { rate: 0.9, pitch: 1.15 }, // natural pace, higher pitch
];

/** Returns true if Web Speech API is available. */
export function canSpeak() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Speak Japanese text aloud.
 * @param {string} text  — Japanese text to speak
 * @param {{ rate?: number, pitch?: number, onError?: (e) => void }} opts — override params
 *   (skips HVPT cycling); onError (item 25) fires on a real synthesis failure — e.g. no
 *   offline-capable ja-JP voice — so a caller can tell the user rather than stay silent. There's
 *   no reliable way to predict this in advance (voice.localService exists on some browsers but
 *   isn't consistently supported), so this reports an actual failure instead of guessing one.
 */
export function speakJP(text, opts = {}) {
  if (!canSpeak()) {
    opts.onError?.(new Error('speechSynthesis not supported'));
    return;
  }
  // Cancel any current speech before starting
  window.speechSynthesis.cancel();

  const params =
    opts.rate !== undefined
      ? { rate: opts.rate, pitch: opts.pitch ?? 1.0 }
      : HVPT_PARAMS[_playCount++ % HVPT_PARAMS.length];

  const utt = new window.SpeechSynthesisUtterance(text);
  utt.lang = 'ja-JP';
  utt.rate = params.rate;
  utt.pitch = params.pitch;
  if (opts.onError) {
    utt.onerror = (e) => opts.onError(e);
  }
  window.speechSynthesis.speak(utt);
}

/** Stop any current speech. */
export function stopSpeech() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** Reset HVPT cycle counter (useful in tests). */
export function _resetPlayCount() {
  _playCount = 0;
}
