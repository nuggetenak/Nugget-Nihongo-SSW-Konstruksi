// ─── utils/motion-pref.js ─────────────────────────────────────────────────────
// The reader-facing control for how much the interface moves.
//
// Built on exactly the shape utils/text-scale.js already established: a list of
// rungs, a getter that falls back through the declared default rather than a
// literal index, and an apply() that writes to the document root so CSS can key
// off it. Nothing here is a new pattern; the app has one way of doing settings.
//
// WHY IT EXISTS. The owner asked for animation "throughout the UI" with no
// ceiling on it, on the reasoning that a dedicated toggle makes anything
// ambitious opt-out rather than imposed. That is right, and this is the toggle
// -- so it ships BEFORE the expressive work, not after. An app that moves a lot
// and cannot be told to stop is worse than one that never moved.
//
// It is also not the same question as the OS setting. `prefers-reduced-motion`
// is an accessibility declaration and always wins on a fresh install; this is a
// preference, and a reader who turns motion back on afterwards has asked for it.

/** Presets, coarsest first in the cycle order the settings Row advances through. */
export const MOTION_PRESETS = [
  {
    key: 'penuh',
    label: 'Penuh',
    emoji: '✨',
    desc: 'Semua animasi aktif',
  },
  {
    key: 'halus',
    label: 'Halus',
    emoji: '🌊',
    desc: 'Transisi dan respons sentuh saja',
  },
  {
    key: 'hemat',
    label: 'Hemat',
    emoji: '🪫',
    desc: 'Hampir tanpa gerak — untuk HP lawas atau baterai tipis',
  },
  {
    key: 'mati',
    label: 'Mati',
    emoji: '⬛',
    desc: 'Tidak ada animasi sama sekali',
  },
];

// What each preset switches on. The granular toggles below are per-feature so a
// reader can keep page transitions and drop the decorative counting, which is
// the split most people actually want and which no single slider expresses.
//
// `press` is in every preset above 'mati' on purpose: on a touch device with no
// hover, the pressed state is the ONLY confirmation that a tap registered before
// the screen changes. Removing it does not calm the interface, it makes it feel
// broken.
const PRESET_FEATURES = {
  penuh: ['page', 'shared', 'press', 'entrance', 'stagger', 'count', 'celebrate', 'card', 'furi'],
  halus: ['page', 'press', 'entrance'],
  hemat: ['press'],
  mati: [],
};

/** Every feature a caller may ask about, with the label the settings screen shows. */
export const MOTION_FEATURES = [
  { key: 'page', label: 'Transisi halaman', desc: 'Pindah tab dan masuk mode' },
  { key: 'shared', label: 'Efek elemen bersama', desc: 'Ikon mode ikut berpindah' },
  { key: 'press', label: 'Respons sentuh', desc: 'Tombol menekan saat disentuh' },
  { key: 'entrance', label: 'Animasi masuk', desc: 'Kartu dan panel muncul' },
  { key: 'stagger', label: 'Daftar berurutan', desc: 'Baris muncul satu per satu' },
  { key: 'count', label: 'Animasi angka', desc: 'Skor dan statistik naik' },
  { key: 'celebrate', label: 'Perayaan', desc: 'Misi selesai' },
  { key: 'card', label: 'Efek kartu', desc: 'Balik dan geser flashcard' },
  { key: 'furi', label: 'Reveal furigana', desc: 'Furigana memudar masuk' },
];

/** Speed multipliers. 1 is the designed speed; the rest scale the whole scale. */
export const MOTION_SPEEDS = [0.5, 0.75, 1, 1.5];

export const DEFAULT_MOTION = { preset: 'penuh', features: null, speed: 1 };

const DEFAULT_INDEX = MOTION_PRESETS.findIndex((p) => p.key === DEFAULT_MOTION.preset);

export function getMotionPreset(key) {
  return MOTION_PRESETS.find((p) => p.key === key) ?? MOTION_PRESETS[DEFAULT_INDEX];
}

export function nextMotionPreset(key) {
  const i = MOTION_PRESETS.findIndex((p) => p.key === key);
  return MOTION_PRESETS[(i === -1 ? DEFAULT_INDEX : i + 1) % MOTION_PRESETS.length].key;
}

/**
 * Which features are on, given a stored pref.
 *
 * `features: null` means "follow the preset", which is the normal state and the
 * one a fresh install is in. As soon as a reader flips an individual toggle the
 * object becomes explicit and the preset stops overriding it -- otherwise
 * turning one thing off would be silently undone by the next preset tap.
 */
export function motionFeatures(motion = DEFAULT_MOTION) {
  const preset = getMotionPreset(motion?.preset).key;
  const base = PRESET_FEATURES[preset] ?? PRESET_FEATURES.penuh;
  if (!motion?.features) return new Set(base);
  const out = new Set();
  for (const f of MOTION_FEATURES) {
    const explicit = motion.features[f.key];
    if (explicit === undefined ? base.includes(f.key) : explicit) out.add(f.key);
  }
  return out;
}

export function clampSpeed(speed) {
  return MOTION_SPEEDS.includes(speed) ? speed : 1;
}

/**
 * Apply a stored motion pref to the document root.
 *
 * Writes `--t-mult`, which every duration token in global.css resolves through,
 * so one property scales the whole motion system -- and `data-motion-*`
 * attributes that CSS and utils/motion.js both read. Mirrors applyTextScale
 * exactly, including the "clear rather than set the no-op value" behaviour.
 */
export function applyMotion(motion = DEFAULT_MOTION) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const preset = getMotionPreset(motion?.preset).key;
  const speed = clampSpeed(motion?.speed);
  const on = motionFeatures(motion);

  root.dataset.motion = preset;
  // Inverted on purpose: a LARGER multiplier is slower. 1.5x speed has to mean
  // 1/1.5 duration, and getting this backwards is the kind of thing that looks
  // right in the settings screen and wrong in the app.
  root.style.setProperty('--t-mult', speed === 1 ? '1' : String(1 / speed));
  for (const f of MOTION_FEATURES) {
    if (on.has(f.key)) root.removeAttribute(`data-motion-no-${f.key}`);
    else root.setAttribute(`data-motion-no-${f.key}`, 'true');
  }
}
