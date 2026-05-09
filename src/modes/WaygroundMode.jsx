import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount, loadFromStorage } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri, standardizeFuri } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

// TEORI_PRAKTIK now computed inside component using track (see below)
const GROUPS = [
  { label: 'Teori', icon: '📋', color: '#f97316', prefix: 'wt', desc: 'Pengetahuan & konsep teknis' },
  { label: 'Praktik', icon: '🛠️', color: '#4ade80', prefix: 'wp', desc: 'Prosedur & aplikasi lapangan' },
  { label: 'CSV Teori', icon: '📚', color: '#f59e0b', prefix: 'ct', desc: 'Materi teori tambahan (CSV)' },
  { label: 'CSV Praktik', icon: '🔧', color: '#34d399', prefix: 'cp', desc: 'Latihan praktik tambahan (CSV)' },
];

// W2: load wrong count for a set from localStorage (picker-time, outside hook)
function getSetWrongCount(setId) {
  const stored = loadFromStorage(`ssw-wg-wrong-${setId}`, {});
  return Object.values(stored).filter((v) => getWrongCount(v) > 0).length;
}

export default function WaygroundMode({ onExit, onSessionEnd }) {
  const { track } = useApp();
  const TEORI_PRAKTIK = QUIZ_SETS.filter(
    (s) => !s.id.startsWith('wg') && (s.track === 'common' || s.track === track)
  );
  const [activeSet, setActiveSet] = useState(null);
  // W2: 'lemah' mode — only wrong questions for the active set
  const [lemahMode, setLemahMode] = useState(false);
  const [showFuri, setShowFuri] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const { saveScore, wgScores } = useProgress();

  const set = TEORI_PRAKTIK.find((s) => s.id === activeSet);

  const [wrongCounts, setWrongCounts] = useState(() => get('progress')?.wgWrong ?? {});

  const questions = useMemo(() => {
    if (!set) return [];
    let pool = set.questions;
    // W2: filter to wrong-only when in lemah mode
    if (lemahMode) {
      pool = pool.filter((q) => {
        const qId = `${set.id}-${q.id}`;
        return getWrongCount(wrongCounts[qId]) > 0;
      });
    }
    return shuffle(pool).map((q) => ({
      question: showFuri ? standardizeFuri(q.q) : stripFuri(q.q),
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({ text: showFuri ? standardizeFuri(opt) : stripFuri(opt), sub: q.opts_id?.[i] || null })),
      correctIdx: q.ans, explanation: q.exp, _qId: `${set.id}-${q.id}`,
    }));
  }, [set, showFuri, showHint, lemahMode, wrongCounts]);

  const handleAnswer = useCallback((qIdx, _selIdx, isCorrect) => {
    if (!isCorrect && set) {
      const qId = questions[qIdx]?._qId;
      if (qId) {
        setWrongCounts((prev) => {
          const updated = { ...prev, [qId]: makeWrongEntry(prev[qId]) };
          storageSet('progress', (p) => ({ ...p, wgWrong: updated }));
          return updated;
        });
      }
    }
  }, [questions, set]);

  const handleFinish = useCallback(({ correct, total, maxStreak, durationMs = 0 }) => {
    if (!activeSet) return;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    // Only update score for full set runs, not lemah-mode runs
    if (!lemahMode) saveScore('wg', activeSet, { score: correct, total, pct, maxStreak, date: Date.now() });
    onSessionEnd?.({ correct, total, durationMs });
  }, [activeSet, lemahMode, saveScore, onSessionEnd]);

  const handleExit = useCallback(() => {
    setActiveSet(null);
    setLemahMode(false);
  }, []);

  if (activeSet) {
    const title = lemahMode ? `⚠ ${set?.title || ''} · Salah` : (set?.title || '');
    return <QuizShell questions={questions} onExit={handleExit} title={title} onAnswer={handleAnswer} onFinish={handleFinish} showHint={showHint} accentColor={set?.color || T.amber} />;
  }

  const totalSoal = TEORI_PRAKTIK.reduce((n, s) => n + s.questions.length, 0);
  const groups = GROUPS.map((g) => ({ ...g, sets: TEORI_PRAKTIK.filter((s) => s.id.startsWith(g.prefix)) })).filter((g) => g.sets.length > 0);

  const pillStyle = (active) => ({ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: active ? 'rgba(251,191,36,0.15)' : T.surface, border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`, color: active ? T.gold : T.textMuted });

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>Soal Teknis · Lifeline</h2>
      <p className={S.pageSub}>{totalSoal} soal dalam {TEORI_PRAKTIK.length} set · Teori &amp; Praktik</p>

      {/* W5: Suggested order — show recommended next set */}
      {(() => {
        // Untouched sets first, then sets with lowest score
        const untouched = TEORI_PRAKTIK.filter((s) => !wgScores[s.id]);
        const touched = TEORI_PRAKTIK.filter((s) => wgScores[s.id]).sort((a, b) => {
          const pa = wgScores[a.id]?.pct ?? 100;
          const pb = wgScores[b.id]?.pct ?? 100;
          return pa - pb;
        });
        const suggested = untouched[0] || touched[0];
        if (!suggested) return null;
        const isUntouched = !wgScores[suggested.id];
        const savedPct = wgScores[suggested.id]?.pct;
        return (
          <button
            onClick={() => { setLemahMode(false); setActiveSet(suggested.id); }}
            style={{ width: '100%', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ fontSize: 20 }}>⭐</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ssw-amber)', marginBottom: 2 }}>DISARANKAN BERIKUTNYA</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ssw-text)' }}>{suggested.emoji || '📄'} {suggested.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ssw-textDim)', marginTop: 1 }}>
                {isUntouched ? 'Belum pernah dikerjakan' : `Skor terakhir: ${savedPct}% — perlu diperbaiki`}
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--ssw-textDim)' }}>→</span>
          </button>
        );
      })()}

      {/* W4: Total score across all sets */}
      {(() => {
        const scored = TEORI_PRAKTIK.filter((s) => wgScores[s.id]);
        if (scored.length === 0) return null;
        const totalCorrect = scored.reduce((a, s) => a + (wgScores[s.id]?.score ?? 0), 0);
        const totalQ = scored.reduce((a, s) => a + (wgScores[s.id]?.total ?? 0), 0);
        const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
        return (
          <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 700 }}>TOTAL SEMUA SET</div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>{scored.length}/{TEORI_PRAKTIK.length} set dikerjakan · {totalCorrect}/{totalQ} benar</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: overallPct >= 70 ? 'var(--c-correct)' : overallPct >= 50 ? 'var(--c-amber)' : 'var(--c-wrong)' }}>{overallPct}%</div>
          </div>
        );
      })()}

      <div className={S.row} style={{ marginBottom: 20 }}>
        {[{ label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `💡 ${showHint ? 'ON' : 'OFF'}`, active: showHint, onClick: () => setShowHint((f) => !f) }
        ].map((btn) => <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>{btn.label}</button>)}
      </div>

      {groups.map((g) => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          <div className={S.row} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>{g.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: g.color, letterSpacing: 1.8, textTransform: 'uppercase' }}>{g.label}</span>
            {g.desc && <span style={{ fontSize: 10, color: 'var(--c-text-dim)' }}>— {g.desc}</span>}
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${g.color}30,transparent)` }} />
            <span className={S.pill} style={{ fontSize: 10, color: 'var(--c-text-dim)', background: 'var(--c-surface)', border: `1px solid var(--c-border)`, fontWeight: 700 }}>{g.sets.length} set</span>
          </div>
          <div className={S.list}>
            {g.sets.map((s) => {
              const saved = wgScores[s.id];
              const wrongCount = getSetWrongCount(s.id);
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <button className={S.btnItem} onClick={() => { setLemahMode(false); setActiveSet(s.id); }} style={{ paddingLeft: 18, position: 'relative', overflow: 'hidden', borderBottomLeftRadius: wrongCount > 0 ? 0 : undefined, borderBottomRightRadius: wrongCount > 0 ? 0 : undefined }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: s.color || g.color }} />
                    <div className={S.rowSpread}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{s.emoji} {s.title}</span>
                        {!saved && <span style={{ fontSize: 9, fontWeight: 700, background: `${T.amber}15`, color: T.amber, border: `1px solid ${T.amber}30`, borderRadius: 99, padding: '1px 6px' }}>Baru</span>}
                      </div>
                      <div className={S.row} style={{ gap: 8 }}>
                        {saved && <span style={{ fontSize: 11, fontWeight: 700, color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong }}>{saved.pct}%{saved.maxStreak > 1 ? ` 🔥${saved.maxStreak}` : ''}</span>}
                        <span style={{ fontSize: 11, color: T.textDim }}>{s.questions.length}q</span>
                      </div>
                    </div>
                    {s.subtitle && <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}>{s.subtitle}</div>}
                  </button>
                  {/* W2: Ulang Salah sub-button — only shows if this set has wrong answers */}
                  {wrongCount > 0 && (
                    <button
                      onClick={() => { setLemahMode(true); setActiveSet(s.id); }}
                      style={{ fontFamily: 'inherit', fontSize: 11, padding: '6px 18px', textAlign: 'left', cursor: 'pointer', background: 'rgba(220,38,38,0.06)', border: `1px solid rgba(220,38,38,0.2)`, borderTop: 'none', borderBottomLeftRadius: T.r.md, borderBottomRightRadius: T.r.md, color: T.wrong, fontWeight: 600 }}
                    >
                      ⚠ Ulang {wrongCount} salah
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <div className={S.row} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>🚧</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.textDim, letterSpacing: 1.8, textTransform: 'uppercase' }}>Segera Hadir</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div className={S.list}>
          {[{ emoji: '⛏️', label: 'Doboku · Sipil (土木)', sub: '土木施工 — Belum tersedia' },
            { emoji: '🏗️', label: 'Kenchiku · Bangunan (建築)', sub: '建築施工 — Belum tersedia' }
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px 14px 12px 18px', borderRadius: T.r.md, background: T.surface, border: `1px dashed ${T.border}`, opacity: 0.5, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: T.border }} />
              <div className={S.rowSpread}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>{item.emoji} {item.label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r.pill, padding: '2px 8px', letterSpacing: 1 }}>COMING SOON</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
