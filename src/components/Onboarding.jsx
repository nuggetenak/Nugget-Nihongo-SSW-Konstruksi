// ─── components/Onboarding.jsx ───────────────────────────────────────────────
// Phase 7: Interactive 4-step onboarding.
// Step 1: Welcome · Step 2: Track Picker (merged) · Step 3: Mini flashcard demo
// Step 4: Daily goal setter → calls onComplete({ track, dailyGoal })
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import S from './Onboarding.module.css';

// ── Demo card: 安全帯 (safety harness) — universally relevant across all tracks
const DEMO_CARD = {
  jp: '安全帯',
  furi: 'あんぜんたい',
  id_text: 'Tali Pengaman',
  desc: 'APD wajib saat bekerja di ketinggian ≥2m. Dikaitkan ke titik jangkar yang lebih tinggi dari pinggang.',
};

const GOAL_OPTIONS = [
  { value: 10, label: '10 kartu', sub: '~144 hari' },
  { value: 20, label: '20 kartu', sub: '~72 hari' },
  { value: 30, label: '30 kartu', sub: '~48 hari' },
  { value: 50, label: '50 kartu', sub: '~29 hari' },
];

// ─────────────────────────────────────────────────────────────────────────────

function StepWelcome({ onNext }) {
  return (
    <div className={S.step} data-step="welcome">
      <div className={S.heroEmoji} aria-hidden="true">⚡</div>
      <h1 className={S.heroTitle}>Selamat Datang!</h1>
      <div className={S.heroSub}>SSW Konstruksi · by Nugget Nihongo</div>
      <p className={S.heroDesc}>
        Aplikasi belajar untuk ujian SSW Konstruksi Jepang jalur Lifeline
        (ライフライン設備). 1.438 flashcard, kuis, dan simulasi ujian — semua
        dalam Bahasa Indonesia.
      </p>
      <div className={S.badges}>
        <span className={S.badge}>⚡ Lifeline</span>
        <span className={S.badge}>📋 Common</span>
      </div>
      <button className={S.ctaPrimary} onClick={onNext}>
        Mulai →
      </button>
    </div>
  );
}

function StepDemo({ onNext }) {
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(null);

  function handleRate(r) {
    setRated(r);
    // short delay so user sees the selection, then proceed
    setTimeout(() => onNext(), 600);
  }

  return (
    <div className={S.step} data-step="demo">
      <div className={S.stepEyebrow}>Langkah 1 dari 2</div>
      <h2 className={S.stepTitle}>Coba Balik Kartu Ini</h2>
      <p className={S.stepDesc}>
        Tap kartu di bawah untuk melihat artinya.
      </p>

      {/* Mini flashcard */}
      <div
        className={S.demoScene}
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        aria-label="Balik kartu"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !flipped && setFlipped(true)}
      >
        <div className={S.demoCard} data-flipped={String(flipped)}>
          {/* Front */}
          <div className={S.demoFront} aria-hidden={flipped}>
            <span className={S.demoCat}>⛑ keselamatan</span>
            <span className={S.demoJp}>{DEMO_CARD.jp}</span>
            <span className={S.demoFuri}>{DEMO_CARD.furi}</span>
            {!flipped && (
              <span className={S.demoHint}>👆 Tap untuk balik</span>
            )}
          </div>
          {/* Back */}
          <div className={S.demoBack} aria-hidden={!flipped}>
            <span className={S.demoCat}>⛑ keselamatan</span>
            <span className={S.demoJpSmall}>{DEMO_CARD.jp}</span>
            <span className={S.demoIdText}>{DEMO_CARD.id_text}</span>
            <span className={S.demoBackDesc}>{DEMO_CARD.desc}</span>
          </div>
        </div>
      </div>

      {/* Rating buttons — appear after flip */}
      {flipped && (
        <div className={S.demoRating} role="group" aria-label="Nilai pemahamanmu">
          <p className={S.demoRatingLabel}>Seberapa hafal?</p>
          <div className={S.demoButtons}>
            {[
              { key: 'lagi', emoji: '🔴', label: 'Belum', color: '#f87171' },
              { key: 'oke', emoji: '🟢', label: 'Hafal!', color: '#4ade80' },
            ].map((b) => (
              <button
                key={b.key}
                className={S.demoBtn}
                data-selected={String(rated === b.key)}
                style={{ borderColor: rated === b.key ? b.color : undefined }}
                onClick={() => handleRate(b.key)}
              >
                <span className={S.demoBtnEmoji}>{b.emoji}</span>
                <span className={S.demoBtnLabel}>{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!flipped && (
        <button className={S.ctaGhost} onClick={() => setFlipped(true)}>
          Lihat jawaban
        </button>
      )}
    </div>
  );
}

function StepGoal({ onComplete }) {
  const [goal, setGoal] = useState(20);

  return (
    <div className={S.step} data-step="goal">
      <div className={S.stepEyebrow}>Langkah 2 dari 2</div>
      <div className={S.goalHero} aria-hidden="true">🎯</div>
      <h2 className={S.stepTitle}>Target Harian</h2>
      <p className={S.stepDesc}>
        Berapa kartu yang ingin kamu pelajari setiap hari?
      </p>

      <div className={S.goalGrid} role="group" aria-label="Pilih target harian">
        {GOAL_OPTIONS.map((o) => (
          <button
            key={o.value}
            className={S.goalCard}
            data-active={String(goal === o.value)}
            onClick={() => setGoal(o.value)}
            aria-pressed={goal === o.value}
          >
            <span className={S.goalNum}>{o.value}</span>
            <span className={S.goalLabel}>{o.label}</span>
            <span className={S.goalSub}>{o.sub}</span>
          </button>
        ))}
      </div>

      <div className={S.goalNote}>
        Dengan {goal} kartu/hari, kamu bisa selesaikan semua 1.443 materi dalam{' '}
        <strong>~{Math.ceil(1410 / goal)} hari</strong>. Bisa ganti kapan saja di menu Saya.
      </div>

      <button className={S.ctaPrimary} onClick={() => onComplete(goal)}>
        Mulai Belajar 🚀
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding({ onComplete }) {
  // steps: 'welcome' | 'demo' | 'goal'
  const [step, setStep] = useState('welcome');

  const STEP_ORDER = ['welcome', 'demo', 'goal'];
  const _stepIdx = STEP_ORDER.indexOf(step); // kept for future progress indicator

  function handleGoalDone(goal) {
    onComplete({ track: 'lifeline', dailyGoal: goal });
  }

  return (
    <div className={S.wrap}>
      <div className={S.inner}>
        {step === 'welcome' && <StepWelcome onNext={() => setStep('demo')} />}
        {step === 'demo'    && <StepDemo onNext={() => setStep('goal')} />}
        {step === 'goal'    && <StepGoal onComplete={handleGoalDone} />}
      </div>

      {/* Dot indicator (skip welcome) */}
      {step !== 'welcome' && (
        <div className={S.dots} role="presentation">
          {['demo', 'goal'].map((s) => (
            <div
              key={s}
              className={S.dot}
              data-active={String(step === s)}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  );
}
