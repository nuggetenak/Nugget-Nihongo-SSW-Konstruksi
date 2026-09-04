import { useState, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/index.js';
import { recordReview } from '../srs/fsrs-scheduler.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import QuizShell from '../components/QuizShell.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ResumePrompt from '../components/ResumePrompt.jsx';
import { useQuizResume } from '../hooks/useQuizResume.js';
import S from './modes.module.css';

const SETS = [
  { key: 'all', label: 'Semua Set', icon: '📋' },
  { key: 'tt1', label: '学科 Set 1', icon: '📝' },
  { key: 'tt2', label: '学科 Set 2', icon: '📝' },
  { key: 'st1', label: '実技 Set 1', icon: '🔧' },
  { key: 'st2', label: '実技 Set 2', icon: '🔧' },
];
const TOPICS = [
  { key: 'listrik', label: '⚡ Listrik', color: '#f59e0b' },
  { key: 'pipa', label: '🪣 Pipa', color: '#3b82f6' },
  { key: 'telekomunikasi', label: '📡 Telkom', color: '#8b5cf6' },
  { key: 'pemadam', label: '🔥 Pemadam', color: '#ef4444' },
  { key: 'isolasi', label: '🧱 Isolasi', color: '#6b7280' },
  { key: 'keselamatan', label: '⛑ Selamat', color: '#10b981' },
  { key: 'hukum', label: '⚖ Hukum', color: '#ec4899' },
  { key: 'umum', label: '🏗 Umum', color: '#78716c' },
];
const SET_COUNT = {
  all: JAC_OFFICIAL.length,
  tt1: JAC_OFFICIAL.filter((q) => q.set === 'tt1').length,
  tt2: JAC_OFFICIAL.filter((q) => q.set === 'tt2').length,
  st1: JAC_OFFICIAL.filter((q) => q.set === 'st1').length,
  st2: JAC_OFFICIAL.filter((q) => q.set === 'st2').length,
};
const DELAYS = [
  { ms: 1000, label: '1s' },
  { ms: 1500, label: '1.5s' },
  { ms: 2000, label: '2s' },
  { ms: 0, label: 'Manual' },
];

function mapQuestions(list, withID) {
  return list.map((q) => {
    const hasPhoto = !!q.photoDesc;
    return {
      question: q.q,
      questionSub: withID ? q.hint : null,
      options: q.opts.map((opt, i) => ({
        text: stripFuri(opt),
        sub: q.opts_id?.[i] || null,
      })),
      correctIdx: q.ans,
      explanation: q.exp,
      hint: hasPhoto ? `📷 ${q.photoDesc || 'Soal ini aslinya pakai foto'}` : null,
      hasPhoto,
      photoDesc: q.photoDesc ?? null,
      _qId: q.id,
      // QuizShell's "Latih N salah" and "Latih <kategori>" both key off
      // _cardId, and this mode only ever set _qId -- so both buttons were dead
      // on every JAC session despite ModeRouter handing it a working
      // onRetryWrong, and despite all 95 questions carrying a related_card_id
      // that handleAddToSRS was already using.
      _cardId: typeof q.related_card_id === 'number' ? q.related_card_id : null,
    };
  });
}

function buildQuestions(key, { wrongCounts, topicFilter, showID }) {
  if (!key) return [];
  if (key === 'lemah') {
    const weak = JAC_OFFICIAL.filter((q) => getWrongCount(wrongCounts[q.id]) > 0).sort(
      (a, b) => getWrongCount(wrongCounts[b.id]) - getWrongCount(wrongCounts[a.id])
    );
    return mapQuestions(weak, showID);
  }
  let pool = JAC_OFFICIAL;
  if (key !== 'all') pool = pool.filter((q) => q.set === key);
  if (topicFilter) pool = pool.filter((q) => q.topic === topicFilter);
  return mapQuestions(shuffle(pool), showID);
}

export default function JACMode({ onSessionEnd, onRetryWrong, audioEnabled = false }) {
  const { toast } = useApp();
  const { saveScore, jacScores } = useProgress();
  const [setKey, setSetKey] = useState(null);
  const [wrongCounts, setWrongCounts] = useState(() => get('progress')?.wrongCounts ?? {});

  const [showID, setShowID] = useState(true);
  const [autoDelay, setAutoDelay] = useState(2000);
  // Track wrong question IDs during session for SRS add-to-queue.
  const [wrongQIds, setWrongQIds] = useState([]);
  const [_srsAdded, setSrsAdded] = useState(0);
  const [topicFilter, setTopicFilter] = useState(null);

  const lemahCount = JAC_OFFICIAL.filter((q) => getWrongCount(wrongCounts[q.id]) > 0).length;

  const { resumeData, progressKey, beginSession, clear, dismiss } = useQuizResume('ssw-jac');
  const [questions, setQuestions] = useState([]);
  const [restored, setRestored] = useState(null);

  // Freezing the drawn list in state, rather than deriving it from a useMemo
  // keyed on wrongCounts, is what stops a wrong answer from re-running shuffle()
  // and swapping the question under the user mid-session -- same fix and same
  // reproduction as WaygroundMode's.
  const openSet = useCallback(
    (key) => {
      const drawn = buildQuestions(key, { wrongCounts, topicFilter, showID });
      setQuestions(drawn);
      setSetKey(key);
      setRestored(null);
      clear();
      beginSession(drawn, { setKey: key });
    },
    [wrongCounts, topicFilter, showID, clear, beginSession]
  );

  const handleResume = useCallback(() => {
    if (!resumeData) return;
    setQuestions(resumeData.questions);
    setSetKey(resumeData.meta?.setKey ?? 'all');
    setRestored(resumeData.progress);
    dismiss();
  }, [resumeData, dismiss]);

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect) {
        const qId = questions[qIdx]?._qId;
        if (qId) {
          setWrongCounts((prev) => {
            const updated = { ...prev, [qId]: makeWrongEntry(prev[qId]) };
            storageSet('progress', (p) => ({ ...p, wrongCounts: updated }));
            return updated;
          });
          // Collect wrong question IDs for SRS add.
          if (!wrongQIds.includes(qId)) setWrongQIds((prev) => [...prev, qId]);
        }
      }
    },
    [questions, setWrongCounts, wrongQIds]
  );

  const handleFinish = useCallback(
    ({ correct, total, durationMs = 0 }) => {
      clear(); // QuizShell clears its own progress key; the question list is ours
      if (!setKey) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const prev = jacScores[setKey];
      saveScore('jac', setKey, {
        score: correct,
        total,
        pct,
        date: Date.now(),
        bestPct: Math.max(pct, prev?.bestPct ?? 0),
      });
      onSessionEnd?.({ correct, total, durationMs });
    },
    [setKey, saveScore, jacScores, onSessionEnd, clear]
  );

  // Add wrong JAC questions' related flashcards to SRS queue (rating=1 = Again = due now).
  const handleAddToSRS = useCallback(() => {
    const relatedIds = wrongQIds
      .map((qId) => JAC_OFFICIAL.find((q) => q.id === qId)?.related_card_id)
      .filter((id) => typeof id === 'number');
    const unique = [...new Set(relatedIds)];
    unique.forEach((cardId) => recordReview(cardId, 1));
    setSrsAdded(unique.length);
    setWrongQIds([]);
    toast.show(`✅ ${unique.length} kartu ditambahkan ke Ulasan SRS`, { duration: 3000 });
  }, [wrongQIds, toast]);

  if (setKey === 'lemah' && questions.length === 0) {
    return (
      <div className={S.pageCenter}>
        <EmptyState
          icon="💪"
          title="Belum ada soal lemah"
          desc="Kerjakan beberapa soal dulu!"
          ctaLabel="← Kembali"
          onCta={() => setSetKey(null)}
        />
      </div>
    );
  }

  if (setKey !== null) {
    return (
      <QuizShell
        questions={questions}
        onExit={() => {
          setSetKey(null);
          setQuestions([]);
          setRestored(null);
          setWrongQIds([]);
          setSrsAdded(0);
        }}
        title="JAC Official"
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        onAddToSRS={wrongQIds.length > 0 ? handleAddToSRS : undefined}
        onRetryWrong={onRetryWrong}
        showHint={true}
        accentColor="#ef4444"
        autoNextDelay={autoDelay}
        audioEnabled={audioEnabled}
        persistKey={progressKey}
        initialQIdx={restored?.qIdx ?? 0}
        initialSelected={restored?.selected ?? null}
        initialResults={restored?.results ?? []}
      />
    );
  }

  const pillStyle = (active) => ({
    fontFamily: 'inherit',
    fontSize: 'var(--fs-small)',
    padding: 'var(--space-6) var(--space-12)',
    borderRadius: T.r.pill,
    cursor: 'pointer',
    background: active ? 'rgba(251,191,36,0.15)' : T.surface,
    border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`,
    color: active ? T.gold : T.textMuted,
  });

  const topicInfo = topicFilter ? TOPICS.find((t) => t.key === topicFilter) : null;
  const topicCount = (tKey) => JAC_OFFICIAL.filter((q) => q.topic === tKey).length;
  const setTopicCount = (sKey, tKey) =>
    JAC_OFFICIAL.filter((q) => (sKey === 'all' || q.set === sKey) && q.topic === tKey).length;

  return (
    <div className={S.page}>
      <p className={S.pageSub}>{JAC_OFFICIAL.length} soal dari contoh ujian resmi</p>

      {resumeData && (
        <ResumePrompt
          title="Lanjutkan sesi JAC sebelumnya?"
          detail={`Soal ${(resumeData.progress.qIdx ?? 0) + 1} dari ${resumeData.questions.length}, terjawab ${resumeData.progress.results?.length ?? 0}.`}
          onResume={handleResume}
          onDiscard={clear}
        />
      )}

      <div className={S.row} style={{ marginBottom: 'var(--space-16)', flexWrap: 'wrap' }}>
        {[
          {
            label: `ID ${showID ? 'ON' : 'OFF'}`,
            active: showID,
            onClick: () => setShowID((f) => !f),
          },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 'var(--space-20)' }}>
        <div className={S.sectionLabel}>Lanjut otomatis</div>
        <div className={S.row} style={{ gap: 'var(--space-6)' }}>
          {DELAYS.map((d) => (
            <button
              key={d.ms}
              onClick={() => setAutoDelay(d.ms)}
              style={{
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                padding: 'var(--space-6) var(--space-10)',
                borderRadius: T.r.pill,
                cursor: 'pointer',
                background: autoDelay === d.ms ? 'rgba(245,158,11,0.15)' : T.surface,
                border: `1px solid ${autoDelay === d.ms ? T.amber : T.border}`,
                color: autoDelay === d.ms ? T.amber : T.textMuted,
                fontWeight: autoDelay === d.ms ? 700 : 400,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic filter */}
      <div style={{ marginBottom: 'var(--space-20)' }}>
        <div className={S.sectionLabel}>
          Filter Topik{' '}
          {topicFilter && <span style={{ color: T.textMuted, fontWeight: 400 }}>— aktif</span>}
        </div>
        <div className={S.row} style={{ gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          {topicFilter && (
            <button
              onClick={() => setTopicFilter(null)}
              style={{
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                padding: 'var(--space-6) var(--space-10)',
                borderRadius: T.r.pill,
                cursor: 'pointer',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: T.wrong,
              }}
            >
              ✕ Reset
            </button>
          )}
          {TOPICS.map((t) => {
            const isActive = topicFilter === t.key;
            const cnt = topicCount(t.key);
            return (
              <button
                key={t.key}
                onClick={() => setTopicFilter(isActive ? null : t.key)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'var(--fs-small)',
                  padding: 'var(--space-6) var(--space-10)',
                  borderRadius: T.r.pill,
                  cursor: 'pointer',
                  background: isActive ? `${t.color}22` : T.surface,
                  border: `1px solid ${isActive ? t.color : T.border}`,
                  color: isActive ? t.color : T.textMuted,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {t.label} <span style={{ opacity: 0.7 }}>{cnt}</span>
              </button>
            );
          })}
        </div>
        {topicFilter && (
          <button
            style={{
              marginTop: 'var(--space-10)',
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              padding: 'var(--space-8) var(--space-16)',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: topicInfo ? `${topicInfo.color}18` : T.surface,
              border: `1px solid ${topicInfo ? topicInfo.color : T.border}`,
              color: topicInfo ? topicInfo.color : T.text,
              width: '100%',
              fontWeight: 700,
            }}
            onClick={() => openSet('all')}
          >
            🎯 Simulasi: {topicInfo?.label} ({topicCount(topicFilter)} soal)
          </button>
        )}
      </div>

      <div className={S.list}>
        {SETS.map((s) => {
          const saved = jacScores[s.key];
          const cnt = topicFilter ? setTopicCount(s.key, topicFilter) : SET_COUNT[s.key];
          return (
            <button
              key={s.key}
              className={S.btnItem}
              onClick={() => cnt > 0 && openSet(s.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: cnt === 0 ? 0.4 : 1,
                cursor: cnt === 0 ? 'default' : 'pointer',
              }}
            >
              <span>
                {s.icon} {s.label}
              </span>
              <div className={S.row} style={{ gap: 'var(--space-8)' }}>
                {!topicFilter && saved && (
                  <span
                    style={{
                      fontSize: 'var(--fs-small)',
                      fontWeight: 700,
                      color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong,
                    }}
                  >
                    {saved.pct}%
                  </span>
                )}
                {!topicFilter && saved && saved.bestPct != null && saved.bestPct !== saved.pct && (
                  <span style={{ fontSize: 'var(--fs-micro)', color: T.textMuted }}>
                    best {saved.bestPct}%
                  </span>
                )}
                <span style={{ fontSize: 'var(--fs-caption)', color: T.textDim }}>{cnt} soal</span>
              </div>
            </button>
          );
        })}
        <button
          className={S.btnItem}
          onClick={() => lemahCount > 0 && openSet('lemah')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: lemahCount > 0 ? 'pointer' : 'default',
            background: lemahCount > 0 ? 'rgba(220,38,38,0.06)' : T.surface,
            border: `1px solid ${lemahCount > 0 ? 'rgba(220,38,38,0.25)' : T.border}`,
            color: lemahCount > 0 ? T.wrong : T.textDim,
          }}
        >
          <span>⚠ Lemah</span>
          <span style={{ fontSize: 'var(--fs-caption)' }}>
            {lemahCount > 0 ? `${lemahCount} soal` : 'belum ada'}
          </span>
        </button>
      </div>
    </div>
  );
}
