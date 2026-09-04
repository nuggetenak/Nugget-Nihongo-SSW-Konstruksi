import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import {
  isWaygroundTeoriId,
  isWaygroundPraktikId,
  isJacMockupTeoriId,
  isJacMockupPraktikId,
  isVocabId,
} from '../utils/quiz-classification.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

// TEORI_PRAKTIK now computed inside component using track (see below)
// Praktik's `match` (not a plain prefix) exists because the real ids are
// wgl01..wgl10 -- a simple prefix would miss wgl10 (starts 'wgl1', not
// 'wgl0'). These sets used to live in VocabMode, wrongly counted as vocab
// drill purely because their id happened to start with the same 'wg' as
// the real vocab sets (wglv-*) -- see fix/post-overhaul-bugs' earlier
// commit. They're JAC-style practice questions, not vocabulary, so they
// belong here alongside Teori, not there.
// "CSV Teori"/"CSV Praktik" used prefixes 'ct'/'cp' that haven't existed
// since session 23 (2026-07-11) renamed those ids to 'jmt'/'jml' -- this
// array was never updated to match, so the two groups silently rendered
// nothing while still counting toward this screen's own header total
// (24 set/540 soal was always right; 12 of those 24 sets were simply
// unreachable from any group list). Relabeled to match the rename's own
// naming (source: 'jac-mockup' in the data), not just the prefix fix.
const GROUPS = [
  {
    label: 'Teori',
    icon: '📋',
    color: '#f97316',
    match: isWaygroundTeoriId,
    desc: 'Pengetahuan & konsep teknis',
  },
  {
    label: 'Praktik',
    icon: '🛠️',
    color: '#4ade80',
    match: isWaygroundPraktikId,
    desc: 'Prosedur & aplikasi lapangan',
  },
  {
    label: 'JAC Mockup Teori',
    icon: '📚',
    color: '#f59e0b',
    match: isJacMockupTeoriId,
    desc: 'Simulasi soal teori (CSV)',
  },
  {
    label: 'JAC Mockup Praktik',
    icon: '🔧',
    color: '#34d399',
    match: isJacMockupPraktikId,
    desc: 'Simulasi soal praktik (CSV)',
  },
];

// Load wrong count for a set from engine (progress.wgWrong keyed as `${setId}-${q.id}`).
function getSetWrongCount(setId) {
  const wgWrong = get('progress')?.wgWrong ?? {};
  const prefix = `${setId}-`;
  return Object.entries(wgWrong)
    .filter(([k]) => k.startsWith(prefix))
    .filter(([, v]) => getWrongCount(v) > 0).length;
}

export default function WaygroundMode({ onSessionEnd }) {
  const { track } = useApp();
  // Everything except vocab drill's own wglv-* ids -- see the GROUPS
  // comment above for why wgl0* (Praktik Set) belongs in here now.
  const TEORI_PRAKTIK = QUIZ_SETS.filter(
    (s) => !isVocabId(s.id) && (s.track === 'common' || s.track === track)
  );
  const [activeSet, setActiveSet] = useState(null);
  // 'Lemah' mode — only wrong questions for the active set.
  const [lemahMode, setLemahMode] = useState(false);

  const [showHint, setShowHint] = useState(true);
  const { saveScore, wgScores } = useProgress();

  const set = TEORI_PRAKTIK.find((s) => s.id === activeSet);

  const [wrongCounts, setWrongCounts] = useState(() => get('progress')?.wgWrong ?? {});

  const questions = useMemo(() => {
    if (!set) return [];
    let pool = set.questions;
    // Filter to wrong-only when in lemah mode.
    if (lemahMode) {
      pool = pool.filter((q) => {
        const qId = `${set.id}-${q.id}`;
        return getWrongCount(wrongCounts[qId]) > 0;
      });
    }
    return shuffle(pool).map((q) => ({
      question: q.q,
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({
        text: stripFuri(opt),
        sub: q.opts_id?.[i] || null,
      })),
      correctIdx: q.ans,
      explanation: q.exp,
      _qId: `${set.id}-${q.id}`,
    }));
  }, [set, showHint, lemahMode, wrongCounts]);

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
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
    },
    [questions, set]
  );

  const handleFinish = useCallback(
    ({ correct, total, maxStreak, durationMs = 0 }) => {
      if (!activeSet) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      // Only update score for full set runs, not lemah-mode runs
      if (!lemahMode)
        saveScore('wg', activeSet, { score: correct, total, pct, maxStreak, date: Date.now() });
      onSessionEnd?.({ correct, total, durationMs });
    },
    [activeSet, lemahMode, saveScore, onSessionEnd]
  );

  const handleExit = useCallback(() => {
    setActiveSet(null);
    setLemahMode(false);
  }, []);

  if (activeSet) {
    const title = lemahMode ? `⚠ ${set?.title || ''} · Salah` : set?.title || '';
    return (
      <QuizShell
        questions={questions}
        onExit={handleExit}
        title={title}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        showHint={showHint}
        accentColor={set?.color || T.amber}
      />
    );
  }

  const totalSoal = TEORI_PRAKTIK.reduce((n, s) => n + s.questions.length, 0);
  const groups = GROUPS.map((g) => ({
    ...g,
    sets: TEORI_PRAKTIK.filter((s) => g.match(s.id)),
  })).filter((g) => g.sets.length > 0);

  const pillStyle = (active) => ({
    fontFamily: 'inherit',
    fontSize: 'var(--fs-small)',
    padding: '6px 12px',
    borderRadius: T.r.pill,
    cursor: 'pointer',
    background: active ? 'rgba(251,191,36,0.15)' : T.surface,
    border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`,
    color: active ? T.gold : T.textMuted,
  });

  return (
    <div className={S.page}>
      <p className={S.pageSub}>
        {totalSoal} soal dalam {TEORI_PRAKTIK.length} set · Teori &amp; Praktik
      </p>

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
            onClick={() => {
              setLemahMode(false);
              setActiveSet(suggested.id);
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              fontFamily: 'inherit',
              cursor: 'pointer',
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 'var(--fs-jp-back)' }}>⭐</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 'var(--fs-small)',
                  fontWeight: 700,
                  color: 'var(--ssw-amber)',
                  marginBottom: 2,
                }}
              >
                DISARANKAN BERIKUTNYA
              </div>
              <div
                style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--ssw-text)' }}
              >
                {suggested.emoji || '📄'} {suggested.title}
              </div>
              <div
                style={{ fontSize: 'var(--fs-small)', color: 'var(--ssw-textDim)', marginTop: 1 }}
              >
                {isUntouched
                  ? 'Belum pernah dikerjakan'
                  : `Skor terakhir: ${savedPct}% — perlu diperbaiki`}
              </div>
            </div>
            <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--ssw-textDim)' }}>→</span>
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
          <div
            style={{
              background: 'rgba(251,191,36,0.07)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--fs-small)', color: T.textDim, fontWeight: 700 }}>
                TOTAL SEMUA SET
              </div>
              <div style={{ fontSize: 'var(--fs-small)', color: T.textMuted, marginTop: 2 }}>
                {scored.length}/{TEORI_PRAKTIK.length} set dikerjakan · {totalCorrect}/{totalQ}{' '}
                benar
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: overallPct >= 70 ? T.correct : overallPct >= 50 ? T.amber : T.wrong,
              }}
            >
              {overallPct}%
            </div>
          </div>
        );
      })()}

      <div className={S.row} style={{ marginBottom: 20 }}>
        {[
          {
            label: `💡 ${showHint ? 'ON' : 'OFF'}`,
            active: showHint,
            onClick: () => setShowHint((f) => !f),
          },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>
            {btn.label}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          <div className={S.row} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--fs-body)' }}>{g.icon}</span>
            <span
              style={{
                fontSize: 'var(--fs-micro)',
                fontWeight: 800,
                color: g.color,
                letterSpacing: 1.8,
                textTransform: 'uppercase',
              }}
            >
              {g.label}
            </span>
            {g.desc && (
              <span style={{ fontSize: 'var(--fs-micro)', color: T.textDim }}>— {g.desc}</span>
            )}
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg,${g.color}30,transparent)`,
              }}
            />
            <span
              className={S.pill}
              style={{
                fontSize: 'var(--fs-micro)',
                color: T.textDim,
                background: T.surface,
                border: `1px solid ${T.border}`,
                fontWeight: 700,
              }}
            >
              {g.sets.length} set
            </span>
          </div>
          <div className={S.list}>
            {g.sets.map((s) => {
              const saved = wgScores[s.id];
              const wrongCount = getSetWrongCount(s.id);
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <button
                    className={S.btnItem}
                    onClick={() => {
                      setLemahMode(false);
                      setActiveSet(s.id);
                    }}
                    style={{
                      paddingLeft: 18,
                      position: 'relative',
                      overflow: 'hidden',
                      borderBottomLeftRadius: wrongCount > 0 ? 0 : undefined,
                      borderBottomRightRadius: wrongCount > 0 ? 0 : undefined,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: s.color || g.color,
                      }}
                    />
                    <div className={S.rowSpread}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 'var(--fs-body)', fontWeight: 700 }}>
                          {s.emoji} {s.title}
                        </span>
                        {!saved && (
                          <span
                            style={{
                              fontSize: 'var(--fs-nano)',
                              fontWeight: 700,
                              background: `${T.amber}15`,
                              color: T.amber,
                              border: `1px solid ${T.amber}30`,
                              borderRadius: 99,
                              padding: '1px 6px',
                            }}
                          >
                            Baru
                          </span>
                        )}
                      </div>
                      <div className={S.row} style={{ gap: 8 }}>
                        {saved && (
                          <span
                            style={{
                              fontSize: 'var(--fs-small)',
                              fontWeight: 700,
                              color:
                                saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong,
                            }}
                          >
                            {saved.pct}%{saved.maxStreak > 1 ? ` 🔥${saved.maxStreak}` : ''}
                          </span>
                        )}
                        <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>
                          {s.questions.length}q
                        </span>
                      </div>
                    </div>
                    {s.subtitle && (
                      <div
                        style={{
                          fontSize: 'var(--fs-small)',
                          color: T.textDim,
                          marginTop: 4,
                          fontFamily: T.fontJP,
                        }}
                      >
                        {renderJPWithRuby(s.subtitle, parseRubyFragments(s.subtitle))}
                      </div>
                    )}
                  </button>
                  {/* W2: Ulang Salah sub-button — only shows if this set has wrong answers */}
                  {wrongCount > 0 && (
                    <button
                      onClick={() => {
                        setLemahMode(true);
                        setActiveSet(s.id);
                      }}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'var(--fs-small)',
                        padding: '6px 18px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: 'rgba(220,38,38,0.06)',
                        border: `1px solid rgba(220,38,38,0.2)`,
                        borderTop: 'none',
                        borderBottomLeftRadius: T.r.md,
                        borderBottomRightRadius: T.r.md,
                        color: T.wrong,
                        fontWeight: 600,
                      }}
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
    </div>
  );
}
