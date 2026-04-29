// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// All state lives in contexts; routing in ModeRouter.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { T } from './styles/theme.js';
import { useApp } from './contexts/AppContext.jsx';
import { useProgress } from './contexts/ProgressContext.jsx';
import { useSRSContext } from './contexts/SRSContext.jsx';

import TrackPicker from './components/TrackPicker.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './components/Dashboard.jsx';
import BelajarTab from './components/BelajarTab.jsx';
import SayaTab from './components/SayaTab.jsx';
import ModeRouter from './router/ModeRouter.jsx';

// ── Onboarding ────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: '🏗️', title: 'Selamat Datang!', sub: 'SSW Konstruksi · by Nugget Nihongo', desc: 'Aplikasi belajar untuk ujian SSW Konstruksi Jepang. Flashcard, kuis, dan simulasi ujian — semua dalam Bahasa Indonesia.' },
    { emoji: '📚', title: '1.438 Kartu Flashcard', sub: '土木 · 建築 · ライフライン設備', desc: 'Materi lengkap dari PDF resmi JAC: keselamatan, hukum, jenis pekerjaan, alat, pipa, listrik, dan lainnya.' },
    { emoji: '🔁', title: 'Spaced Repetition (SRS)', sub: 'FSRS — algoritma memori modern', desc: 'Sistem ulang cerdas: kartu muncul saat hampir terlupakan. 4 tombol rating untuk kontrol lebih presisi.' },
    { emoji: '🚀', title: 'Siap Belajar!', sub: '頑張ってね！', desc: 'Pilih jalur belajar, lalu mulai dari Kartu. Tandai pemahamanmu, dan biarkan SRS mengaturkan jadwal ulang. Pasti bisa! 💪' },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16, filter: 'drop-shadow(0 4px 20px rgba(245,158,11,0.3))', animation: 'scaleIn 0.3s ease' }}>{s.emoji}</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, background: T.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{s.title}</h1>
      <div style={{ fontSize: 12, color: T.textMuted, letterSpacing: 0.5, marginBottom: 16 }}>{s.sub}</div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textDim, maxWidth: 320, marginBottom: 32 }}>{s.desc}</p>
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: T.r.pill, background: i === step ? T.amber : 'rgba(245,158,11,0.2)', transition: 'all 0.3s' }} />)}
      </div>
      <button onClick={() => isLast ? onComplete() : setStep(step + 1)} style={{ fontFamily: 'inherit', padding: '12px 44px', fontSize: 14, fontWeight: 700, borderRadius: T.r.md, background: T.accent, border: 'none', color: T.textBright, cursor: 'pointer', boxShadow: T.shadow.glowStrong }}>
        {isLast ? 'Pilih Jalur 🚀' : 'Lanjut →'}
      </button>
      {!isLast && <button onClick={onComplete} style={{ fontFamily: 'inherit', marginTop: 10, padding: '6px 16px', fontSize: 11, background: 'none', border: 'none', color: T.textFaint, cursor: 'pointer' }}>Lewati</button>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const { track, setTrack, isDark, toggleTheme, onboarded, completeOnboarding, tab, mode, goMode, goTab } = useApp();
  const { known, unknown } = useProgress();
  const srs = useSRSContext();

  // Active mode takes full screen
  if (mode) return <ModeRouter />;

  // First-run flows
  if (!onboarded) return <Onboarding onComplete={completeOnboarding} />;
  if (!track) return <TrackPicker onSelect={setTrack} />;

  const belajarBadges = { ulasan: srs.dueCount };

  return (
    <div style={{ paddingBottom: T.navH + 16 }}>
      {tab === 'home'    && <Dashboard known={known} unknown={unknown} track={track} onNavigate={goMode} onChangeTrack={() => setTrack(null)} srs={srs} isDark={isDark} onToggleTheme={toggleTheme} />}
      {tab === 'belajar' && <BelajarTab onSelect={goMode} badges={belajarBadges} />}
      {tab === 'saya'    && <SayaTab />}

      <BottomNav active={tab} onChange={goTab} dueBadge={srs.dueCount} />
    </div>
  );
}
