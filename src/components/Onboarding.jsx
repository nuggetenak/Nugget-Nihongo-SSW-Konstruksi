// ─── components/Onboarding.jsx ───────────────────────────────────────────────
// Step 1: Welcome · Step 2: Mini flashcard demo · Step 3: Exam date (item 24,
// skippable) · Step 4: Daily goal setter → calls onComplete({ track,
// dailyGoal, examDate }).
// Track is not a step — content-dq narrowed scope to a single track
// (Lifeline), so onComplete always sends 'lifeline'; nothing left to pick.
// ─────────────────────────────────────────────────────────────────────────────

import { TOTAL_CARDS } from '../utils/constants.js';
import { formatCount } from '../utils/format.js';
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
      {/* Counted, not typed. This said "1.438 flashcard" against a real 1.626 --
          stale since the card split, on the very first screen a new learner
          sees, and found by driving the built app in a browser rather than by
          any test. Exactly the headline-number drift AGENT_WORKFLOW §4 warns
          about, and the same fix the menu counts got: derive it. */}
      <p className={S.heroDesc}>
        Aplikasi belajar untuk ujian SSW Konstruksi Jepang (Lifeline & Kenchiku).{' '}
        {formatCount(TOTAL_CARDS)} flashcard, kuis, dan simulasi ujian — semua dalam Bahasa
        Indonesia.
      </p>
      <div className={S.badges}>
        <span className={S.badge}>⚡ Lifeline</span>
        <span className={S.badge}>🏗️ Kenchiku</span>
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


function StepTrack({ onNext, initialTrack = 'lifeline' }) {
  const [selected, setSelected] = useState(initialTrack);

  const tracks = [
    {
      key: 'lifeline',
      icon: '⚡',
      title: 'Lifeline (ライフライン設備)',
      tag: 'Pipa · Listrik · AC · Telekomunikasi · Pemadam',
      desc: 'Instalasi utilitas: perpipaan, kelistrikan, tata udara (HVAC), telekomunikasi, dan proteksi kebakaran.',
    },
    {
      key: 'kenchiku',
      icon: '🏗️',
      title: 'Kenchiku (建築 - Gedung)',
      tag: 'Perancah · Rebar · Bekisting · Beton · Finishing',
      desc: 'Pekerjaan struktur gedung: perancah (tobi), pembesian (tekkin), bekisting (katawaku), pompa beton, hingga finishing.',
    },
  ];

  return (
    <div className={S.step} data-step="track">
      <div className={S.stepEyebrow}>Pilih Jalur</div>
      <div className={S.goalHero} aria-hidden="true">
        🏗️
      </div>
      <h2 className={S.stepTitle}>Pilih Jalur SSW</h2>
      <p className={S.stepDesc}>
        Pilih spesialisasi konstruksi yang akan kamu pelajari. Bisa diganti kapan saja di menu Saya atau Beranda.
      </p>

      <div
        role="group"
        aria-label="Pilih jalur SSW Konstruksi"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-12)',
          margin: 'var(--space-16) 0',
        }}
      >
        {tracks.map((t) => {
          const isSel = selected === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={S.goalCard}
              data-active={String(isSel)}
              onClick={() => setSelected(t.key)}
              aria-pressed={isSel}
              style={{
                textAlign: 'left',
                padding: 'var(--space-16)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <span style={{ fontSize: 'var(--fs-title)' }}>{t.icon}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 'var(--fs-body)',
                    color: 'var(--ssw-text)',
                  }}
                >
                  {t.title}
                </span>
              </div>
              <div style={{ fontSize: 'var(--fs-small)', color: 'var(--ssw-textMuted)' }}>
                {t.tag}
              </div>
              <div
                style={{
                  fontSize: 'var(--fs-micro)',
                  color: 'var(--ssw-textMuted)',
                  lineHeight: 1.4,
                  marginTop: 'var(--space-4)',
                }}
              >
                {t.desc}
              </div>
            </button>
          );
        })}
      </div>

      <button className={S.ctaPrimary} onClick={() => onNext(selected)}>
        Lanjut →
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
      {/* item 165: the same flip the app uses, not a second one.
          `fc-scene` / `fc-card` / `is-flipped` / `fc-face` are the globals
          FlipCard renders; this supplies only its own sizing on top. Before
          this the FIRST flip a new reader ever saw ran at a different
          perspective and a different curve from the thousand flips after it. */}
      <div
        className={`fc-scene ${S.demoScene}`}
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        aria-label="Balik kartu"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !flipped && setFlipped(true)}
      >
        <div className={`fc-card${flipped ? ' is-flipped' : ''} ${S.demoCard}`}>
          {/* Front */}
          <div className={`fc-face ${S.demoFront}`} aria-hidden={flipped}>
            <span className={S.demoCat}>⛑ keselamatan</span>
            <span className={S.demoJp}>{stripFuri(DEMO_CARD.jp)}</span>
            <span className={S.demoFuri}>{extractReadings(DEMO_CARD.jp)}</span>
            {!flipped && <span className={S.demoHint}>👆 Tap untuk balik</span>}
          </div>
          {/* Back */}
          <div className={`fc-face ${S.demoBack}`} aria-hidden={!flipped}>
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
        Hitung mundur akan muncul di Beranda. Belum tahu tanggalnya? Lewati saja — bisa diatur kapan
        pun nanti di menu Saya.
      </p>

      <div className={S.inlineEdit} style={{ marginTop: 'var(--space-8)' }}>
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

      <button
        className={S.ctaPrimary}
        onClick={() => onNext(date || null)}
        style={{ marginTop: 'var(--space-16)' }}
      >
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
  // steps: 'welcome' | 'track' | 'demo' | 'examdate' | 'goal'
  const [step, setStep] = useState(startStep);
  const [track, setTrack] = useState('lifeline');
  const [examDate, setExamDate] = useState(undefined);

  function handleTrackDone(chosenTrack) {
    setTrack(chosenTrack);
    if (startStep === 'track') {
      onComplete({ track: chosenTrack, dailyGoal: 20 });
    } else {
      setStep('demo');
    }
  }

  function handleExamDateDone(date) {
    setExamDate(date);
    setStep('goal');
  }

  function handleGoalDone(goal) {
    onComplete({ track, dailyGoal: goal, examDate });
  }

  return (
    <div className={S.wrap}>
      <div className={S.inner}>
        {step === 'welcome' && <StepWelcome onNext={() => setStep('track')} />}
        {step === 'track' && <StepTrack initialTrack={track} onNext={handleTrackDone} />}
        {step === 'demo' && <StepDemo onNext={() => setStep('examdate')} />}
        {step === 'examdate' && <StepExamDate onNext={handleExamDateDone} />}
        {step === 'goal' && <StepGoal onComplete={handleGoalDone} />}
      </div>

      {/* Dot indicator (skip welcome) */}
      {step !== 'welcome' && (
        <div className={S.dots} role="presentation">
          {['track', 'demo', 'examdate', 'goal'].map((s) => (
            <div key={s} className={S.dot} data-active={String(step === s)} aria-hidden="true" />
          ))}
        </div>
      )}
    </div>
  );
}