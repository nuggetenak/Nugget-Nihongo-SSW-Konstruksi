// ─── modes/GerakanMode.jsx ────────────────────────────────────────────────────
// Pengaturan Gerakan — the reader's control over how much the interface moves.
//
// This exists so the rest of the motion work can be ambitious. The owner asked
// for animation throughout the app with no ceiling on it, on the reasoning that
// a dedicated toggle makes anything expressive opt-out rather than imposed --
// which is right, and which is why this ships BEFORE the expressive layer
// rather than after it. An app that moves a lot and cannot be told to stop is
// worse than one that never moved.
//
// Two levels, because one is not enough. The PRESETS are the answer to "this is
// too much" in a single tap. The per-feature toggles are for the split people
// actually want and a slider cannot express: keep the page transitions, drop
// the decorative counting.
import { useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  MOTION_PRESETS,
  MOTION_FEATURES,
  MOTION_SPEEDS,
  DEFAULT_MOTION,
  getMotionPreset,
  motionFeatures,
} from '../utils/motion-pref.js';
import S from './modes.module.css';
import G from './GerakanMode.module.css';

export default function GerakanMode() {
  const { prefs, setPref } = useApp();
  const toast = useToast();
  const motion = prefs?.motion ?? DEFAULT_MOTION;
  const preset = getMotionPreset(motion.preset);
  const active = motionFeatures(motion);
  const osReduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const setMotion = useCallback((next) => setPref('motion', next), [setPref]);

  const pickPreset = (key) => {
    // Clearing `features` is the point: a preset tap means "just give me this
    // one", so it has to discard the per-toggle overrides rather than sit
    // underneath them where the next tap appears to do nothing.
    setMotion({ ...motion, preset: key, features: null });
    toast.show(`${getMotionPreset(key).emoji} Gerakan: ${getMotionPreset(key).label}`);
  };

  const toggleFeature = (key) => {
    const current = motionFeatures(motion);
    const features = { ...(motion.features ?? {}) };
    for (const f of MOTION_FEATURES) {
      if (features[f.key] === undefined) features[f.key] = current.has(f.key);
    }
    features[key] = !current.has(key);
    setMotion({ ...motion, features });
  };

  return (
    <div className={S.page}>
      <p className={S.pageSub}>
        Atur seberapa banyak aplikasi bergerak. Tidak ada yang hilang — hanya animasinya.
      </p>

      {osReduced && (
        <div className={G.osNote} role="status">
          ⚙️ HP kamu minta <strong>kurangi gerak</strong>. Aplikasi mengikuti itu dulu; pengaturan
          di bawah tetap bisa dipakai kalau kamu mau menyalakannya lagi.
        </div>
      )}

      <div className={S.sectionLabel}>Mode</div>
      <div className={G.presets}>
        {MOTION_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={G.preset}
            data-active={p.key === preset.key}
            aria-pressed={p.key === preset.key}
            onClick={() => pickPreset(p.key)}
          >
            <span className={G.presetEmoji} aria-hidden="true">
              {p.emoji}
            </span>
            <span className={G.presetLabel}>{p.label}</span>
            <span className={G.presetDesc}>{p.desc}</span>
          </button>
        ))}
      </div>

      <div className={S.sectionLabel}>Kecepatan</div>
      <div className={G.speeds}>
        {MOTION_SPEEDS.map((sp) => (
          <button
            key={sp}
            type="button"
            className={G.speed}
            data-active={(motion.speed ?? 1) === sp}
            aria-pressed={(motion.speed ?? 1) === sp}
            onClick={() => setMotion({ ...motion, speed: sp })}
          >
            {sp}×
          </button>
        ))}
      </div>
      <p className={G.speedNote}>
        Mengubah kecepatan semua animasi sekaligus. 1× adalah kecepatan yang dirancang.
      </p>

      <div className={S.sectionLabel}>Rinci</div>
      {MOTION_FEATURES.map((f) => (
        <button
          key={f.key}
          type="button"
          className={G.toggle}
          aria-pressed={active.has(f.key)}
          onClick={() => toggleFeature(f.key)}
        >
          <span className={G.toggleText}>
            <span className={G.toggleLabel}>{f.label}</span>
            <span className={G.toggleDesc}>{f.desc}</span>
          </span>
          <span className={G.switch} data-on={active.has(f.key)} aria-hidden="true">
            <span className={G.knob} />
          </span>
        </button>
      ))}

      <p className={G.footNote}>
        Mengubah satu tombol di atas membuat pengaturanmu sendiri. Ketuk salah satu mode untuk
        kembali ke bawaannya.
      </p>
    </div>
  );
}
