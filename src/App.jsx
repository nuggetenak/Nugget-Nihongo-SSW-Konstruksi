// ─── SSW Konstruksi · by Nugget Nihongo ─────────────────────────────────────
// v2.3 — SRS integration (FSRS engine, ReviewMode, 4-button flashcard rating)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useEffect, lazy, Suspense } from 'react';
import { T, applyTheme } from './styles/theme.js';
import { CARDS } from './data/cards.js';
import { getCatsForTrack, VOCAB_SOURCES } from './data/categories.js';
import { usePersistedState } from './hooks/usePersistedState.js';
import { useSRS } from './hooks/useSRS.js';

// Components
import TrackPicker from './components/TrackPicker.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './components/Dashboard.jsx';
import FilterPopup from './components/FilterPopup.jsx';

// Modes
const FlashcardMode = lazy(() => import('./modes/FlashcardMode.jsx'));
const QuizMode = lazy(() => import('./modes/QuizMode.jsx'));
const JACMode = lazy(() => import('./modes/JACMode.jsx'));
const WaygroundMode = lazy(() => import('./modes/WaygroundMode.jsx'));
const AngkaMode = lazy(() => import('./modes/AngkaMode.jsx'));
const DangerMode = lazy(() => import('./modes/DangerMode.jsx'));
const SimulasiMode = lazy(() => import('./modes/SimulasiMode.jsx'));
const StatsMode = lazy(() => import('./modes/StatsMode.jsx'));
const SearchMode = lazy(() => import('./modes/SearchMode.jsx'));
const SprintMode = lazy(() => import('./modes/SprintMode.jsx'));
const FocusMode = lazy(() => import('./modes/FocusMode.jsx'));
const GlossaryMode = lazy(() => import('./modes/GlossaryMode.jsx'));
const SumberMode = lazy(() => import('./modes/SumberMode.jsx'));
const ExportMode = lazy(() => import('./modes/ExportMode.jsx'));
const ReviewMode = lazy(() => import('./modes/ReviewMode.jsx'));

// ─── Onboarding ──────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      emoji: '🏗️',
      title: 'Selamat Datang!',
      sub: 'SSW Konstruksi · by Nugget Nihongo',
      desc: 'Aplikasi belajar untuk ujian SSW Konstruksi Jepang. Flashcard, kuis, dan simulasi ujian — semua dalam Bahasa Indonesia.',
    },
    {
      emoji: '📚',
      title: '1.438 Kartu Flashcard',
      sub: '土木 · 建築 · ライフライン設備',
      desc: 'Materi lengkap dari PDF resmi JAC: keselamatan, hukum, jenis pekerjaan, alat, pipa, listrik, dan lainnya.',
    },
    {
      emoji: '🔁',
      title: 'Spaced Repetition (SRS)',
      sub: 'FSRS — algoritma memori modern',
      desc: 'Sistem ulang cerdas: kartu muncul saat hampir terlupakan. 4 tombol rating untuk kontrol lebih presisi.',
    },
    {
      emoji: '🚀',
      title: 'Siap Belajar!',
      sub: '頑張ってね！',
      desc: 'Pilih jalur belajar, lalu mulai dari Kartu. Tandai pemahamanmu, dan biarkan SRS mengaturkan jadwal ulang. Pasti bisa! 💪',
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 56,
          marginBottom: 16,
          filter: 'drop-shadow(0 4px 20px rgba(245,158,11,0.3))',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        {s.emoji}
      </div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 800,
          background: T.accent,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 4,
        }}
      >
        {s.title}
      </h1>
      <div style={{ fontSize: 12, color: T.textMuted, letterSpacing: 0.5, marginBottom: 16 }}>
        {s.sub}
      </div>
      <p
        style={{ fontSize: 13, lineHeight: 1.7, color: T.textDim, maxWidth: 320, marginBottom: 32 }}
      >
        {s.desc}
      </p>
      <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 22 : 7,
              height: 7,
              borderRadius: T.r.pill,
              background: i === step ? T.amber : 'rgba(245,158,11,0.2)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
      <button
        onClick={() => (isLast ? onComplete() : setStep(step + 1))}
        style={{
          fontFamily: 'inherit',
          padding: '12px 44px',
          fontSize: 14,
          fontWeight: 700,
          borderRadius: T.r.md,
          background: T.accent,
          border: 'none',
          color: T.textBright,
          cursor: 'pointer',
          boxShadow: T.shadow.glowStrong,
        }}
      >
        {isLast ? 'Pilih Jalur 🚀' : 'Lanjut →'}
      </button>
      {!isLast && (
        <button
          onClick={onComplete}
          style={{
            fontFamily: 'inherit',
            marginTop: 10,
            padding: '6px 16px',
            fontSize: 11,
            background: 'none',
            border: 'none',
            color: T.textFaint,
            cursor: 'pointer',
          }}
        >
          Lewati
        </button>
      )}
    </div>
  );
}

// ─── Mode Menus ──────────────────────────────────────────────────────────────
const BELAJAR_MODES = [
  { key: 'ulasan', icon: '🔁', label: 'Ulasan SRS', desc: 'Kartu jatuh tempo hari ini' },
  { key: 'kartu', icon: '🃏', label: 'Kartu', desc: 'Flashcard interaktif' },
  { key: 'kuis', icon: '❓', label: 'Kuis', desc: 'Kuis otomatis 3 level' },
  { key: 'sprint', icon: '⚡', label: 'Sprint', desc: 'Drill kecepatan 60 detik' },
  { key: 'fokus', icon: '🎯', label: 'Fokus', desc: 'Latih kelemahan' },
];
const UJIAN_MODES = [
  { key: 'jac', icon: '📋', label: 'JAC Official', desc: 'Soal contoh ujian resmi' },
  { key: 'wayground', icon: '🎓', label: 'Wayground', desc: '598 soal teknis' },
  { key: 'simulasi', icon: '🎯', label: 'Simulasi', desc: 'Ujian + timer' },
  { key: 'angka', icon: '🔢', label: 'Angka Kunci', desc: 'Angka wajib hafal' },
  { key: 'jebak', icon: '⚠️', label: 'Soal Jebak', desc: 'Istilah mirip' },
];
const LAINNYA_MODES = [
  { key: 'cari', icon: '🔍', label: 'Cari', desc: 'Pencarian cepat' },
  { key: 'glosari', icon: '📖', label: 'Glosari', desc: 'Kamus terurut' },
  { key: 'sumber', icon: '📂', label: 'Sumber', desc: 'Per PDF sumber' },
  { key: 'stats', icon: '📊', label: 'Statistik', desc: 'Progress & kelemahan' },
  { key: 'ekspor', icon: '💾', label: 'Ekspor', desc: 'Simpan & pulihkan progress' },
];

function ModeLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '50dvh',
        display: 'grid',
        placeItems: 'center',
        color: T.textDim,
        fontSize: 13,
      }}
    >
      Memuat mode…
    </div>
  );
}

function ModeGrid({ modes, onSelect, title, badges = {} }) {
  return (
    <div style={{ padding: '0 16px 24px', maxWidth: T.maxW, margin: '0 auto' }}>
      {title && (
        <div style={{ padding: '16px 0 14px' }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>
            <span
              style={{
                background: T.accent,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {title}
            </span>
          </div>
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        {modes.map((m, i) => {
          const badge = badges[m.key];
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              style={{
                fontFamily: 'inherit',
                padding: '18px 14px',
                borderRadius: T.r.lg,
                cursor: 'pointer',
                background: T.surface,
                border: `1px solid ${badge > 0 ? T.borderLight : T.border}`,
                color: T.text,
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.15s',
                animation: `slideUp 0.3s ease ${i * 0.04}s both`,
              }}
            >
              {badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: T.r.pill,
                    background: T.amber,
                    color: T.bg,
                  }}
                >
                  {badge}
                </span>
              )}
              <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Theme ──
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('ssw-theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    applyTheme(isDark);
    try {
      localStorage.setItem('ssw-theme', isDark ? 'dark' : 'light');
    } catch (_e) {}
  }, [isDark]);

  // Apply on first mount (before any toggle)
  useEffect(() => {
    applyTheme(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  // ── State ──
  const [onboarded, setOnboarded] = useState(() => {
    try {
      return !!localStorage.getItem('ssw-onboarded');
    } catch {
      return false;
    }
  });
  const [track, setTrack] = usePersistedState('ssw-track', null);
  const [tab, setTab] = useState('home');
  const [mode, setMode] = usePersistedState('ssw-last-mode', null);
  const [vocabMode, setVocabMode] = useState(false);
  const [activeCats, setActiveCats] = useState(new Set(['all']));
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Known/Unknown ──
  const [known, setKnown] = usePersistedState('ssw-known', []);
  const [unknown, setUnknown] = usePersistedState('ssw-unknown', []);
  const [starredArr, setStarredArr] = usePersistedState('ssw-starred', []);
  const starredSet = new Set(Array.isArray(starredArr) ? starredArr : []);
  const toggleStar = useCallback((id) => {
    if (!id) return;
    setStarredArr((prev) => {
      const s = new Set(Array.isArray(prev) ? prev : []);
      if (s.has(id)) s.delete(id); else s.add(id);
      return [...s];
    });
  }, [setStarredArr]);
  const knownSet = new Set(Array.isArray(known) ? known : []);
  const unknownSet = new Set(Array.isArray(unknown) ? unknown : []);

  const handleMark = useCallback(
    (id, type) => {
      if (type === 'known') {
        setKnown((k) => {
          const s = new Set(k);
          s.add(id);
          return [...s];
        });
        setUnknown((u) => {
          const s = new Set(u);
          s.delete(id);
          return [...s];
        });
      } else {
        setUnknown((u) => {
          const s = new Set(u);
          s.add(id);
          return [...s];
        });
        setKnown((k) => {
          const s = new Set(k);
          s.delete(id);
          return [...s];
        });
      }
    },
    [setKnown, setUnknown]
  );

  const [quizWrong] = usePersistedState('ssw-quiz-wrong', {});

  // ── Track-aware filtering ──
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  // (filteredCards built below — toggleCat handled via FilterPopup onApply)

  const filteredCards = CARDS.filter((c) => {
    const isVocab = VOCAB_SOURCES.includes(c.source);
    if (vocabMode !== isVocab) return false;
    if (trackCatKeys && !trackCatKeys.has(c.category)) return false;
    if (activeCats.has('all')) return true;
    if (activeCats.has('bintang')) return starredSet.has(c.id);
    return activeCats.has(c.category);
  });

  // ── SRS hook (scoped to current track's card IDs) ──────────────────────
  const trackCardIds = useMemo(
    () =>
      trackCatKeys
        ? CARDS.filter((c) => trackCatKeys.has(c.category)).map((c) => c.id)
        : CARDS.map((c) => c.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [track]
  );
  const srs = useSRS(trackCardIds);

  // ── Navigation ──
  const goMode = (m) => {
    setMode(m);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const exitMode = () => {
    setMode(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const goTab = (t) => {
    setTab(t);
    if (t !== 'home') setMode(null); // only clear mode when leaving home context
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleTrackSelect = (t) => {
    setTrack(t);
    setActiveCats(new Set(['all']));
  };

  // ═══ FLOW ════════════════════════════════════════════════════════════════

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={() => {
          setOnboarded(true);
          try {
            localStorage.setItem('ssw-onboarded', '1');
          } catch (_e) {}
        }}
      />
    );
  }

  if (!track) {
    return <TrackPicker onSelect={handleTrackSelect} />;
  }

  if (mode) {
    const modeMap = {
      ulasan: <ReviewMode srs={srs} onExit={exitMode} />,
      kartu: (
        <FlashcardMode
          cards={filteredCards}
          known={knownSet}
          unknown={unknownSet}
          onMark={handleMark}
          onExit={exitMode}
          srs={srs}
          starred={starredSet}
          onToggleStar={toggleStar}
        />
      ),
      kuis: <QuizMode cards={filteredCards} allCards={CARDS} onExit={exitMode} />,
      jac: <JACMode onExit={exitMode} />,
      wayground: <WaygroundMode onExit={exitMode} />,
      angka: <AngkaMode onExit={exitMode} />,
      jebak: <DangerMode onExit={exitMode} />,
      simulasi: <SimulasiMode onExit={exitMode} />,
      stats: (
        <StatsMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />
      ),
      cari: <SearchMode onExit={exitMode} />,
      sprint: <SprintMode cards={filteredCards} onExit={exitMode} />,
      fokus: (
        <FocusMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />
      ),
      glosari: <GlossaryMode onExit={exitMode} />,
      sumber: <SumberMode onExit={exitMode} />,
      ekspor: <ExportMode onExit={exitMode} />,
    };
    return <Suspense fallback={<ModeLoadingFallback />}>{modeMap[mode] || null}</Suspense>;
  }

  const belajarBadges = { ulasan: srs.dueCount };

  return (
    <div style={{ paddingBottom: T.navH + 16 }}>
      {/* Belajar tab filter panel */}
      {tab === 'belajar' && (
        <div style={{ padding: '12px 16px 0', maxWidth: T.maxW, margin: '0 auto' }}>
          <div style={{ padding: '16px 0 10px' }}>
            <span style={{ fontSize: 17, fontWeight: 800, background: T.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Belajar
            </span>
          </div>

          {/* Materi toggle — prominent with counts */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {[
              { v: false, label: '💡 Konsep' },
              { v: true,  label: '📝 Kosakata' },
            ].map(({ v, label }) => {
              const cnt = CARDS.filter((c) => {
                const isVocab = VOCAB_SOURCES.includes(c.source);
                if (isVocab !== v) return false;
                if (trackCatKeys && !trackCatKeys.has(c.category)) return false;
                return true;
              }).length;
              return (
                <button
                  key={String(v)}
                  onClick={() => { setVocabMode(v); setActiveCats(new Set(['all'])); }}
                  style={{ flex: 1, padding: '10px', fontSize: 12, fontWeight: vocabMode === v ? 700 : 500, fontFamily: 'inherit', border: 'none', cursor: 'pointer', background: vocabMode === v ? 'rgba(245,158,11,0.12)' : T.surface, color: vocabMode === v ? T.gold : T.textDim, lineHeight: 1.3 }}
                >
                  <div>{label}</div>
                  <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>{cnt} kartu</div>
                </button>
              );
            })}
          </div>

          {/* Filter popup trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <button
              onClick={() => setFilterOpen(true)}
              style={{ fontFamily: 'inherit', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: T.r.pill, cursor: 'pointer', background: activeCats.has('all') ? T.surface : 'rgba(245,158,11,0.10)', border: `1px solid ${activeCats.has('all') ? T.border : T.amber}`, color: activeCats.has('all') ? T.textMuted : T.amber, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>⚙ Filter</span>
              {!activeCats.has('all') && (
                <span style={{ background: T.amber, color: T.bg, borderRadius: T.r.pill, fontSize: 9, fontWeight: 800, padding: '1px 6px' }}>
                  {activeCats.size}
                </span>
              )}
              <span style={{ opacity: 0.5 }}>▼</span>
            </button>
            <div style={{ fontSize: 11, color: T.textDim }}>
              {filteredCards.length} kartu
            </div>
          </div>
        </div>
      )}

      {tab === 'home' && (
        <Dashboard
          known={knownSet}
          unknown={unknownSet}
          track={track}
          onNavigate={goMode}
          onChangeTrack={() => setTrack(null)}
          srs={srs}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}
      {tab === 'belajar' && (
        <ModeGrid modes={BELAJAR_MODES} onSelect={goMode} title="" badges={belajarBadges} />
      )}
      {tab === 'ujian' && <ModeGrid modes={UJIAN_MODES} onSelect={goMode} title="Ujian" />}
      {tab === 'lainnya' && <ModeGrid modes={LAINNYA_MODES} onSelect={goMode} title="Lainnya" />}

      <BottomNav active={tab} onChange={goTab} />

      <FilterPopup
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        track={track}
        vocabMode={vocabMode}
        activeCats={activeCats}
        onApply={(newCats) => setActiveCats(newCats)}
        starredCount={starredSet.size}
      />
    </div>
  );
}
