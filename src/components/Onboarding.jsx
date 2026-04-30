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
  romaji: 'anzentai',
  id_text: 'Tali Pengaman',
  desc: 'APD wajib saat bekerja di ketinggian ≥2m. Dikaitkan ke titik jangkar yang lebih tinggi dari pinggang.',
};

const TRACKS = [
  {
    key: 'doboku',
    icon: '🏗️',
    label: 'Teknik Sipil',
    jp: '土木',
    desc: 'Jalan, jembatan, terowongan, pondasi',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #78350F, #B45309)',
  },
  {
    key: 'kenchiku',
    icon: '🏢',
    label: 'Bangunan',
    jp: '建築',
    desc: 'Gedung, bekisting, dinding, finishing',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0C4A6E, #0284C7)',
  },
  {
    key: 'lifeline',
    icon: '⚡',
    label: 'Lifeline & Peralatan',
    jp: 'ライフライン・設備',
    desc: 'Listrik, pipa, HVAC, pemadam',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #064E3B, #059669)',
  },
];

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
      <div className={S.heroEmoji} aria-hidden="true">🏗️</div>
      <h1 className={S.heroTitle}>Selamat Datang!</h1>
      <div className={S.heroSub}>SSW Konstruksi · by Nugget Nihongo</div>
      <p className={S.heroDesc}>
        Aplikasi belajar untuk ujian SSW Konstruksi Jepang. 1.438 flashcard,
        kuis, dan simulasi ujian — semua dalam Bahasa Indonesia.
      </p>
      <div className={S.badges}>
        <span className={S.badge}>🏗️ Teknik Sipil</span>
        <span className={S.badge}>🏢 Bangunan</span>
        <span className={S.badge}>⚡ Lifeline</span>
      </div>
      <button className={S.ctaPrimary} onClick={onNext}>
        Mulai →
      </button>
    </div>
  );
}

function StepTrack({ onNext }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className={S.step} data-step="track">
      <div className={S.stepEyebrow}>Langkah 1 dari 3</div>
      <h2 className={S.stepTitle}>Bidang Apa yang Kamu Pelajari?</h2>
      <p className={S.stepDesc}>
        Materi keselamatan &amp; hukum otomatis termasuk di semua jalur.
      </p>

      <div className={S.trackList}>
        {TRACKS.map((t) => {
          const active = selected === t.key;
          return (
            <button
              key={t.key}
              className={S.trackCard}
              data-active={String(active)}
              onClick={() => setSelected(t.key)}
              style={{
                background: active ? t.gradient : undefined,
                borderColor: active ? t.color : undefined,
                boxShadow: active ? `0 6px 24px ${t.color}30` : undefined,
              }}
              aria-pressed={active}
            >
              <span
                className={S.trackIcon}
                style={{ background: active ? 'rgba(255,255,255,0.15)' : `${t.color}18` }}
              >
                {t.icon}
              </span>
              <span className={S.trackMeta}>
                <span className={S.trackLabel}>{t.label}</span>
                <span
                  className={S.trackJp}
                  style={{ color: active ? 'rgba(255,255,255,0.65)' : undefined }}
                >
                  {t.jp}
                </span>
                <span
                  className={S.trackDesc}
                  style={{ color: active ? 'rgba(255,255,255,0.50)' : undefined }}
                >
                  {t.desc}
                </span>
              </span>
              {active && <span className={S.trackCheck} aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      <button
        className={S.ctaPrimary}
        data-ready={String(!!selected)}
        disabled={!selected}
        onClick={() => selected && onNext(selected)}
      >
        {selected ? 'Lanjut →' : 'Pilih salah satu di atas'}
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
      <div className={S.stepEyebrow}>Langkah 2 dari 3</div>
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
            <span className={S.demoRomaji}>{DEMO_CARD.romaji}</span>
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
      <div className={S.stepEyebrow}>Langkah 3 dari 3</div>
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
        Dengan {goal} kartu/hari, kamu bisa selesaikan semua 1.438 materi dalam{' '}
        <strong>~{Math.ceil(1438 / goal)} hari</strong>. Bisa ganti kapan saja di menu Saya.
      </div>

      <button className={S.ctaPrimary} onClick={() => onComplete(goal)}>
        Mulai Belajar 🚀
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding({ onComplete }) {
  // steps: 'welcome' | 'track' | 'demo' | 'goal'
  const [step, setStep] = useState('welcome');
  const [track, setTrack] = useState(null);

  const STEP_ORDER = ['welcome', 'track', 'demo', 'goal'];
  const _stepIdx = STEP_ORDER.indexOf(step); // kept for future progress indicator

  function handleTrackNext(t) {
    setTrack(t);
    setStep('demo');
  }

  function handleGoalDone(goal) {
    onComplete({ track, dailyGoal: goal });
  }

  return (
    <div className={S.wrap}>
      <div className={S.inner}>
        {step === 'welcome' && <StepWelcome onNext={() => setStep('track')} />}
        {step === 'track'   && <StepTrack onNext={handleTrackNext} />}
        {step === 'demo'    && <StepDemo onNext={() => setStep('goal')} />}
        {step === 'goal'    && <StepGoal onComplete={handleGoalDone} />}
      </div>

      {/* Dot indicator (skip welcome) */}
      {step !== 'welcome' && (
        <div className={S.dots} role="presentation">
          {['track', 'demo', 'goal'].map((s) => (
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
