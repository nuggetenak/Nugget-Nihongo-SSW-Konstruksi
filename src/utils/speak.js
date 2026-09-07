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

// ── Graded listening speeds (item 107) ──────────────────────────────────────
// `dengar` spoke at one band, so it trained word recognition rather than
// comprehension: real instructions arrive fast, clipped, and over noise.
//
// Each level is a *band of three*, not a single rate, deliberately. Passing
// `speakJP` an explicit `rate` disables the HVPT cycling above — and that
// cycling is not decoration, it is the reason this wrapper exists (Logan et al.
// 1991: varied rate and pitch help a learner place phoneme boundaries). Grading
// the difficulty should not cost that. So a level shifts the band and keeps the
// variation inside it.
//
// `alami` is the existing HVPT_PARAMS unchanged, and the default, so nothing
// about today's behaviour moves unless the learner asks it to.
export const LISTENING_SPEEDS = {
  jelas: {
    label: 'Jelas',
    sub: 'Pelan, tiap suku kata terdengar',
    params: [
      { rate: 0.55, pitch: 0.9 },
      { rate: 0.6, pitch: 1.0 },
      { rate: 0.68, pitch: 1.05 },
    ],
  },
  alami: {
    label: 'Alami',
    sub: 'Kecepatan percakapan biasa',
    params: HVPT_PARAMS,
  },
  cepat: {
    label: 'Cepat',
    sub: 'Seperti mandor di lapangan',
    params: [
      { rate: 1.05, pitch: 0.85 },
      { rate: 1.2, pitch: 1.0 },
      { rate: 1.35, pitch: 1.1 },
    ],
  },
};

export const LISTENING_SPEED_DEFAULT = 'alami';

/** The parameter band for a level, falling back to the natural one. */
const bandFor = (speed) =>
  (LISTENING_SPEEDS[speed] ?? LISTENING_SPEEDS[LISTENING_SPEED_DEFAULT]).params;

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
 * @param {{ rate?: number, pitch?: number, speed?: string, onError?: (e) => void }} opts —
 *   `speed` picks a graded listening band (item 107: 'jelas' | 'alami' | 'cepat'); an explicit
 *   `rate` overrides both and
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

  // An explicit rate still wins outright — a caller that names one means it.
  // Otherwise cycle the band for the requested listening level (item 107),
  // which is HVPT_PARAMS itself unless one was asked for.
  const band = bandFor(opts.speed);
  const params =
    opts.rate !== undefined
      ? { rate: opts.rate, pitch: opts.pitch ?? 1.0 }
      : band[_playCount++ % band.length];

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
