// ─── components/Onboarding.jsx ───────────────────────────────────────────────
// Step 1: Welcome · Step 2: Mini flashcard demo · Step 3: Exam date (item 24,
// skippable) · Step 4: Daily goal setter → calls onComplete({ track,
// dailyGoal, examDate }).
// Track is not a step — content-dq narrowed scope to a single track
// (Lifeline), so onComplete always sends 'lifeline'; nothing left to pick.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { extractReadings, stripFuri } from '../utils/jp-helpers.js';
import S from './Onboarding.module.css';

// ── Demo card: 安全帯 (safety harness) — universally relevant across all tracks
const DEMO_CARD = {
  jp: '安全帯《あんぜんたい》',
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
      <img
        className={S.heroLogo}
        src={`${import.meta.env.BASE_URL}icons/icon-192x192.png`}
        alt=""
        aria-hidden="true"
        width="72"
        height="72"
      />
      <h1 className={S.heroTitle}>Selamat Datang!</h1>
      <div className={S.heroSub}>SSW Konstruksi · by Nugget Nihongo</div>
      <p className={S.heroDesc}>
        Aplikasi belajar untuk ujian SSW Konstruksi Jepang jalur Lifeline (ライフライン設備). 1.438
        flashcard, kuis, dan simulasi ujian — semua dalam Bahasa Indonesia.
      </p>
      <div className={S.badges}>
        <span className={S.badge}>⚡ Lifeline</span>
        <span className={S.badge}>📋 Common</span>
      </div>
      {/* Fills the large empty gap between the badges and the CTA. Decorative,
          so it is hidden from assistive tech and dropped on short viewports
          where the CTA needs the room. */}
      <img
        className={S.heroArt}
        src={`${import.meta.env.BASE_URL}illustrations/onboarding-hero.png`}
        alt=""
        aria-hidden="true"
      />
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
      <p className={S.stepDesc}>Tap kartu di bawah untuk melihat artinya.</p>

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
            <span className={S.demoJp}>{stripFuri(DEMO_CARD.jp)}</span>
            <span className={S.demoFuri}>{extractReadings(DEMO_CARD.jp)}</span>
            {!flipped && <span className={S.demoHint}>👆 Tap untuk balik</span>}
          </div>
          {/* Back */}
          <div className={S.demoBack} aria-hidden={!flipped}>
            <span className={S.demoCat}>⛑ keselamatan</span>
            <span className={S.demoJpSmall}>{stripFuri(DEMO_CARD.jp)}</span>
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
      <div className={S.goalHero} aria-hidden="true">
        🎯
      </div>
      <h2 className={S.stepTitle}>Target Harian</h2>
      <p className={S.stepDesc}>Berapa kartu yang ingin kamu pelajari setiap hari?</p>

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

// item 24: skippable — not everyone has a booked exam date. Dashboard
// already prompts for this later if skipped (item 12's hintTitle/hintSub
// block, "Belum atur tanggal ujian") — this step just means fewer new users
// land on a dashboard with the countdown, the single strongest motivational
// device in the app (per the plan's own framing), silently missing.
function StepExamDate({ onNext }) {
  const [date, setDate] = useState('');

  return (
    <div className={S.step} data-step="examdate">
      <div className={S.stepEyebrow}>Langkah 2 dari 3</div>
      <div className={S.goalHero} aria-hidden="true">
        📅
      </div>
      <h2 className={S.stepTitle}>Kapan Ujianmu?</h2>
      <p className={S.stepDesc}>
        Hitung mundur akan muncul di Beranda. Belum tahu tanggalnya? Lewati saja — bisa diatur
        kapan pun nanti di menu Saya.
      </p>

      <div className={S.inlineEdit} style={{ marginTop: 8 }}>
        <label className={S.inlineEditLabel} htmlFor="onboarding-exam-date">
          Tanggal ujian
        </label>
        <input
          id="onboarding-exam-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={S.inlineInput}
        />
      </div>

      <button className={S.ctaPrimary} onClick={() => onNext(date || null)} style={{ marginTop: 16 }}>
        {date ? 'Lanjut →' : 'Lewati →'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// item 24: startStep lets a caller jump into the sequence rather than always
// replaying it from the top — App.jsx uses this for the track-reset re-entry
// (onboarded stays true, only track goes null; see the second <Onboarding>
// call site there). Track itself no longer has a picker step here — the
// content-dq merge narrowed scope to a single track, so there's nothing left
// to ask about it — which made re-showing Welcome + the flashcard Demo for a
// one-field settings change the actual bug worth fixing, not a step to
// preserve. _stepIdx below was scaffolded for this in an earlier pass
// (comment: "kept for future progress indicator") and went unused until now.
export default function Onboarding({ onComplete, startStep = 'welcome' }) {
  // steps: 'welcome' | 'demo' | 'examdate' | 'goal'
  const [step, setStep] = useState(startStep);
  // undefined = this run never reached/touched the exam-date step (the
  // startStep='goal' re-entry skips it entirely) -> completeOnboarding must
  // leave whatever's already stored alone. null = the step was reached and
  // explicitly skipped -> a real "still don't know", which does overwrite.
  const [examDate, setExamDate] = useState(undefined);

  const STEP_ORDER = ['welcome', 'demo', 'examdate', 'goal'];
  const _stepIdx = STEP_ORDER.indexOf(step); // kept for future progress indicator

  function handleExamDateDone(date) {
    setExamDate(date);
    setStep('goal');
  }

  function handleGoalDone(goal) {
    onComplete({ track: 'lifeline', dailyGoal: goal, examDate });
  }

  return (
    <div className={S.wrap}>
      <div className={S.inner}>
        {step === 'welcome' && <StepWelcome onNext={() => setStep('demo')} />}
        {step === 'demo' && <StepDemo onNext={() => setStep('examdate')} />}
        {step === 'examdate' && <StepExamDate onNext={handleExamDateDone} />}
        {step === 'goal' && <StepGoal onComplete={handleGoalDone} />}
      </div>

      {/* Dot indicator (skip welcome) */}
      {step !== 'welcome' && (
        <div className={S.dots} role="presentation">
          {['demo', 'examdate', 'goal'].map((s) => (
            <div key={s} className={S.dot} data-active={String(step === s)} aria-hidden="true" />
          ))}
        </div>
      )}
    </div>
  );
}
