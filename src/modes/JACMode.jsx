import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { recordReview } from '../srs/fsrs-scheduler.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import QuizShell from '../components/QuizShell.jsx';
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
const SET_COUNT = { all: JAC_OFFICIAL.length, tt1: JAC_OFFICIAL.filter((q) => q.set === 'tt1').length, tt2: JAC_OFFICIAL.filter((q) => q.set === 'tt2').length, st1: JAC_OFFICIAL.filter((q) => q.set === 'st1').length, st2: JAC_OFFICIAL.filter((q) => q.set === 'st2').length };
const DELAYS = [{ ms: 1000, label: '1s' }, { ms: 1500, label: '1.5s' }, { ms: 2000, label: '2s' }, { ms: 0, label: 'Manual' }];

export default function JACMode({ onExit, onSessionEnd, audioEnabled = false }) {
  const { toast } = useApp();
  const { saveScore, jacScores } = useProgress();
  const [setKey, setSetKey] = useState(null);
  const [wrongCounts, setWrongCounts] = useState(() => get('progress')?.wrongCounts ?? {});
  const [showFuri, setShowFuri] = useState(true);
  const [showID, setShowID] = useState(true);
  const [autoDelay, setAutoDelay] = useState(2000);
  // J1: track wrong question IDs during session for SRS add-to-queue
  const [wrongQIds, setWrongQIds] = useState([]);
  const [_srsAdded, setSrsAdded] = useState(0);
  const [topicFilter, setTopicFilter] = useState(null);

  const lemahCount = JAC_OFFICIAL.filter((q) => getWrongCount(wrongCounts[q.id]) > 0).length;

  const filtered = useMemo(() => {
    if (!setKey) return [];
    let pool = JAC_OFFICIAL;
    if (setKey === 'lemah') return [...pool].filter((q) => getWrongCount(wrongCounts[q.id]) > 0).sort((a, b) => getWrongCount(wrongCounts[b.id]) - getWrongCount(wrongCounts[a.id]));
    if (setKey !== 'all') pool = pool.filter((q) => q.set === setKey);
    if (topicFilter) pool = pool.filter((q) => q.topic === topicFilter);
    return shuffle(pool);
  }, [setKey, wrongCounts, topicFilter]);

  const questions = useMemo(() => filtered.map((q) => {
    const reading = showFuri ? extractReadings(q.jp) : null;
    return { question: showFuri ? q.jp : stripFuri(q.jp), questionSub: showID ? q.id_text : reading || null, options: q.options.map((opt) => ({ text: showFuri ? opt : stripFuri(opt), sub: null })), correctIdx: q.answer, explanation: q.explanation, hint: q.hasPhoto ? `📷 ${q.photoDesc || 'Soal ini aslinya pakai foto'}` : null, hasPhoto: q.hasPhoto ?? false, photoDesc: q.photoDesc ?? null, _qId: q.id };
  }), [filtered, showFuri, showID]);

  const handleAnswer = useCallback((qIdx, _selIdx, isCorrect) => {
    if (!isCorrect) {
      const q = filtered[qIdx];
      if (q?.id) {
        setWrongCounts((prev) => {
          const updated = { ...prev, [q.id]: makeWrongEntry(prev[q.id]) };
          storageSet('progress', (p) => ({ ...p, wrongCounts: updated }));
          return updated;
        });
      }
      // J1: collect wrong question IDs for SRS add
      if (q?.id && !wrongQIds.includes(q.id)) setWrongQIds((prev) => [...prev, q.id]);
    }
  }, [filtered, setWrongCounts, wrongQIds]);

  const handleFinish = useCallback(({ correct, total, durationMs = 0 }) => {
    if (!setKey) return;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const prev = jacScores[setKey];
    saveScore('jac', setKey, { score: correct, total, pct, date: Date.now(), bestPct: Math.max(pct, prev?.bestPct ?? 0) });
    onSessionEnd?.({ correct, total, durationMs });
  }, [setKey, saveScore, jacScores, onSessionEnd]);

  // J1: Add wrong JAC questions' related flashcards to SRS queue (rating=1 = Again = due now)
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

  if (setKey === 'lemah' && filtered.length === 0) {
    return (
      <div className={S.pageCenter}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💪</div>
        <div className={S.emptyTitle}>Belum ada soal lemah</div>
        <div className={S.emptyDesc}>Kerjakan beberapa soal dulu!</div>
        <button className={S.btnSecondary} onClick={() => setSetKey(null)}>← Kembali</button>
      </div>
    );
  }

  if (setKey !== null) {
    return <QuizShell questions={questions} onExit={() => { setSetKey(null); setWrongQIds([]); setSrsAdded(0); }} title="JAC Official" onAnswer={handleAnswer} onFinish={handleFinish} onAddToSRS={wrongQIds.length > 0 ? handleAddToSRS : undefined} showHint={true} accentColor="#ef4444" autoNextDelay={autoDelay} audioEnabled={audioEnabled} />;
  }

  const pillStyle = (active) => ({ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: active ? 'rgba(251,191,36,0.15)' : T.surface, border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`, color: active ? T.gold : T.textMuted });

  const topicInfo = topicFilter ? TOPICS.find((t) => t.key === topicFilter) : null;
  const topicCount = (tKey) => JAC_OFFICIAL.filter((q) => q.topic === tKey).length;
  const setTopicCount = (sKey, tKey) => JAC_OFFICIAL.filter((q) => (sKey === 'all' || q.set === sKey) && q.topic === tKey).length;

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>Soal JAC Official</h2>
      <p className={S.pageSub}>{JAC_OFFICIAL.length} soal dari contoh ujian resmi</p>

      <div className={S.row} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `ID ${showID ? 'ON' : 'OFF'}`, active: showID, onClick: () => setShowID((f) => !f) }
        ].map((btn) => <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>{btn.label}</button>)}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className={S.sectionLabel}>Lanjut otomatis</div>
        <div className={S.row} style={{ gap: 6 }}>
          {DELAYS.map((d) => (
            <button key={d.ms} onClick={() => setAutoDelay(d.ms)} style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: autoDelay === d.ms ? 'rgba(245,158,11,0.15)' : T.surface, border: `1px solid ${autoDelay === d.ms ? T.amber : T.border}`, color: autoDelay === d.ms ? T.amber : T.textMuted, fontWeight: autoDelay === d.ms ? 700 : 400 }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* J2/J4: Topic filter */}
      <div style={{ marginBottom: 20 }}>
        <div className={S.sectionLabel}>Filter Topik {topicFilter && <span style={{ color: T.textMuted, fontWeight: 400 }}>— aktif</span>}</div>
        <div className={S.row} style={{ gap: 6, flexWrap: 'wrap' }}>
          {topicFilter && (
            <button onClick={() => setTopicFilter(null)} style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: T.wrong }}>
              ✕ Reset
            </button>
          )}
          {TOPICS.map((t) => {
            const isActive = topicFilter === t.key;
            const cnt = topicCount(t.key);
            return (
              <button key={t.key} onClick={() => setTopicFilter(isActive ? null : t.key)} style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: isActive ? `${t.color}22` : T.surface, border: `1px solid ${isActive ? t.color : T.border}`, color: isActive ? t.color : T.textMuted, fontWeight: isActive ? 700 : 400 }}>
                {t.label} <span style={{ opacity: 0.7 }}>{cnt}</span>
              </button>
            );
          })}
        </div>
        {topicFilter && (
          <button
            style={{ marginTop: 10, fontFamily: 'inherit', fontSize: 12, padding: '8px 16px', borderRadius: T.r.md, cursor: 'pointer', background: topicInfo ? `${topicInfo.color}18` : T.surface, border: `1px solid ${topicInfo ? topicInfo.color : T.border}`, color: topicInfo ? topicInfo.color : T.text, width: '100%', fontWeight: 700 }}
            onClick={() => setSetKey('all')}
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
            <button key={s.key} className={S.btnItem} onClick={() => cnt > 0 && setSetKey(s.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: cnt === 0 ? 0.4 : 1, cursor: cnt === 0 ? 'default' : 'pointer' }}>
              <span>{s.icon} {s.label}</span>
              <div className={S.row} style={{ gap: 8 }}>
                {!topicFilter && saved && <span style={{ fontSize: 11, fontWeight: 700, color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong }}>{saved.pct}%</span>}
                {!topicFilter && saved && saved.bestPct != null && saved.bestPct !== saved.pct && (
                  <span style={{ fontSize: 10, color: T.textMuted }}>best {saved.bestPct}%</span>
                )}
                <span style={{ fontSize: 12, color: T.textDim }}>{cnt} soal</span>
              </div>
            </button>
          );
        })}
        <button
          className={S.btnItem}
          onClick={() => lemahCount > 0 && setSetKey('lemah')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: lemahCount > 0 ? 'pointer' : 'default', background: lemahCount > 0 ? 'rgba(220,38,38,0.06)' : T.surface, border: `1px solid ${lemahCount > 0 ? 'rgba(220,38,38,0.25)' : T.border}`, color: lemahCount > 0 ? T.wrong : T.textDim }}
        >
          <span>⚠ Lemah</span>
          <span style={{ fontSize: 12 }}>{lemahCount > 0 ? `${lemahCount} soal` : 'belum ada'}</span>
        </button>
      </div>
    </div>
  );
}
