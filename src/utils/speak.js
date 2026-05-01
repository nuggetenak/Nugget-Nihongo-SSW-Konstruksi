// ─── utils/speak.js (phaseF) ──────────────────────────────────────────────────
// Web Speech API wrapper for Japanese audio output.
// HVPT-inspired: cycles through 3 parameter sets (Logan et al. 1991) — varied
// rate/pitch helps perceptual learning of phoneme boundaries.
// Falls back silently in environments without speechSynthesis (tests, jsdom).
// ─────────────────────────────────────────────────────────────────────────────

let _playCount = 0;

// Three parameter variants to create perceptual variation (HVPT-lite)
const HVPT_PARAMS = [
  { rate: 0.70, pitch: 0.85 }, // slow, lower pitch
  { rate: 0.80, pitch: 1.00 }, // natural rate
  { rate: 0.90, pitch: 1.15 }, // natural pace, higher pitch
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
 * @param {{ rate?: number, pitch?: number }} opts — override params (skips HVPT cycling)
 */
export function speakJP(text, opts = {}) {
  if (!canSpeak()) return;
  // Cancel any current speech before starting
  window.speechSynthesis.cancel();

  const params =
    opts.rate !== undefined
      ? { rate: opts.rate, pitch: opts.pitch ?? 1.0 }
      : HVPT_PARAMS[_playCount++ % HVPT_PARAMS.length];

  const utt   = new window.SpeechSynthesisUtterance(text);
  utt.lang    = 'ja-JP';
  utt.rate    = params.rate;
  utt.pitch   = params.pitch;
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
