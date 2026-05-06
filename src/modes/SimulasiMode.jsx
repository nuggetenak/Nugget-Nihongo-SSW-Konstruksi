// ─── SimulasiMode.jsx ─────────────────────────────────────────────────────────
// Note: timer box bg/border/animation conditional on isUrgent — justified inline.
// Note: lulus banner bg/border/color conditional on pass/fail — justified inline.
// Note: progress fill gradient conditional on pass/fail — justified inline.
// Note: red gradient buttons (exam theme) — justified inline (not amber).
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import ProgressBar from '../components/ProgressBar.jsx';
import OptionButton from '../components/OptionButton.jsx';
import S from './modes.module.css';
import SM from './SimulasiMode.module.css';

const PASS_PCT = 65;
const RED_BTN = { fontFamily: 'inherit', borderRadius: T.r.md, border: 'none', background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const PRESETS = [
  { key: 'quick', emoji: '⚡', label: 'Latihan Cepat', sub: '15 soal · 15 menit', count: 15, time: 15 * 60 },
  { key: 'half',  emoji: '📝', label: 'Setengah Ujian', sub: '25 soal · 25 menit', count: 25, time: 25 * 60 },
  { key: 'full',  emoji: '🎯', label: 'Ujian Penuh',    sub: 'semua soal · 45 menit', count: 0, time: 45 * 60 },
];
const INSTRUCTIONS = ['📋 Pilih satu jawaban yang paling tepat', '⏱ Timer berjalan — jangan sampai habis', '🚫 Soal otomatis lanjut setelah kamu jawab', `✅ ${PASS_PCT}% ke atas = LULUS`];
function fmtTime(sec) { const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }

export default function SimulasiMode({ onExit, onSessionEnd }) {
  const [phase, setPhase] = useState('start');
  const [preset, setPreset] = useState('quick');
  const [seed, setSeed] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const config = PRESETS.find((p) => p.key === preset) || PRESETS[0];

  const questions = useMemo(() => {
    if (phase !== 'playing') return [];
    const pool = shuffle(JAC_OFFICIAL);
    const items = config.count > 0 ? pool.slice(0, config.count) : pool;
    return items.map((q) => {
      const shuffledOpts = shuffle(q.options.map((text, origIdx) => ({ text, origIdx })));
      return { jp: q.jp, id_text: q.id_text, opts: shuffledOpts, correctIdx: shuffledOpts.findIndex((o) => o.origIdx === q.answer), explanation: q.explanation, hasPhoto: q.hasPhoto, photoDesc: q.photoDesc };
    });
  }, [phase, seed, config.count]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => { setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); setPhase('result'); return 0; } return t - 1; }); }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, seed]);

  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => { if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }, 1500);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  useEffect(() => {
    if (phase === 'result' && results.length > 0) {
      const correct = results.filter((r) => r.isCorrect).length;
      onSessionEnd?.({ correct, total: results.length });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => { setSeed((s) => s + 1); setQIdx(0); setSelected(null); setResults([]); setTimeLeft(config.time); setPhase('playing'); }, [config.time]);

  const handleSelect = useCallback((optArrayIdx) => {
    if (selected !== null || phase !== 'playing' || !q) return;
    setSelected(optArrayIdx);
    const isCorrect = optArrayIdx === q.correctIdx;
    setResults((r) => [...r, { isCorrect, jp: q.jp, id_text: q.id_text, opts: q.opts, correctIdx: q.correctIdx, userIdx: optArrayIdx, explanation: q.explanation }]);
  }, [selected, phase, q]);

  const isUrgent = timeLeft < 60 && timeLeft > 0 && phase === 'playing';

  // ─── START ─────────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className={S.page}>
        <button className={S.btnBack} onClick={onExit}>← Kembali</button>
        <div className={SM.startHero}>
          <div className={SM.startHeroEmoji}>🎯</div>
          <h2 className={`${S.pageTitle} ${SM.startTitle}`}>Simulasi Ujian</h2>
          <p className={S.pageSub}>Format ujian SSW Konstruksi dengan timer</p>
        </div>
        <div className={`${S.card} ${SM.instructionsCard}`}>
          {INSTRUCTIONS.map((inst, i) => <div key={i} className={SM.instructionLine}>{inst}</div>)}
        </div>
        <div className={S.sectionLabel}>Mode Simulasi</div>
        <div className={`${S.list} ${SM.presetList}`}>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={S.btnItem}
              onClick={() => setPreset(p.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: preset === p.key ? 'rgba(239,68,68,0.10)' : T.surface,
                border: `1px solid ${preset === p.key ? 'rgba(239,68,68,0.4)' : T.border}`,
                color: preset === p.key ? '#ef4444' : T.text,
              }}
            >
              <span className={SM.presetEmoji}>{p.emoji}</span>
              <div>
                <div className={SM.presetLabel}>{p.label}</div>
                <div className={SM.presetSub} style={{ color: preset === p.key ? 'rgba(239,68,68,0.7)' : T.textDim }}>{p.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <button style={{ ...RED_BTN, width: '100%', padding: '14px', fontSize: 15, boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }} onClick={handleStart}>Mulai Simulasi 🎯</button>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const lulus = pct >= PASS_PCT;
    const wrongList = results.filter((r) => !r.isCorrect);
    return (
      <div className={`${S.page} ${SM.resultPage}`}>
        <div
          className={SM.lulusBanner}
          style={{
            background: lulus ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
            border: `2px solid ${lulus ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`,
          }}
        >
          <div className={SM.lulusIcon}>{lulus ? '✅' : '❌'}</div>
          <div className={SM.lulusStatus} style={{ color: lulus ? T.correct : T.wrong }}>{lulus ? 'LULUS' : 'BELUM LULUS'}</div>
          <div className={SM.lulusPct} style={{ color: lulus ? T.correct : T.wrong }}>{pct}%</div>
          <div className={SM.lulusSub}>{correct} / {total} benar · batas lulus {PASS_PCT}%</div>
          <div className={SM.progressTrack}>
            <div style={{ height: '100%', width: `${pct}%`, background: lulus ? 'linear-gradient(90deg,#16a34a80,#16a34a)' : 'linear-gradient(90deg,#dc262680,#dc2626)', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        <div className={`${S.row} ${SM.resultActions}`}>
          <button style={{ ...RED_BTN, flex: 1, padding: '12px' }} onClick={handleStart}>🔄 Ulang</button>
          <button className={`${S.btnSecondary} ${SM.kembaliBtn}`} onClick={onExit}>← Kembali</button>
        </div>
        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list}>
              {wrongList.map((r, i) => {
                const correctOpt = r.opts[r.correctIdx];
                const userOpt = r.opts[r.userIdx];
                return (
                  <div key={i} className={SM.reviewItem} style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}>
                    <div className={SM.reviewJp}>{stripFuri(r.jp)}</div>
                    <div className={SM.reviewIdText}>{r.id_text}</div>
                    <div className={SM.reviewWrong}>✗ {stripFuri(userOpt?.text || '—')}</div>
                    <div className={SM.reviewCorrect}>✓ {stripFuri(correctOpt?.text || '—')}</div>
                    {r.explanation && <div className={SM.reviewExpl}>💡 {r.explanation.slice(0, 160)}{r.explanation.length > 160 ? '…' : ''}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── PLAYING ──────────────────────────────────────────────────────────────
  if (!q) return null;
  return (
    <div className={`${S.pageScroll} ${SM.quizPage}`}>
      <div className={`${S.rowSpread} ${SM.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>✕ Keluar</button>
        <div className={S.row} style={{ gap: 10 }}>
          <div
            className={SM.timerBox}
            style={{
              background: isUrgent ? 'rgba(220,38,38,0.10)' : T.surface,
              border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.4)' : T.border}`,
              animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none',
            }}
          >
            <div className={SM.timerLabel} style={{ color: isUrgent ? T.wrong : T.textDim }}>WAKTU</div>
            <div className={SM.timerValue} style={{ color: isUrgent ? T.wrong : T.text }}>{fmtTime(timeLeft)}</div>
          </div>
          <div className={SM.scoreMini}>
            <div className={SM.scoreCorrect}>✓ {results.filter((r) => r.isCorrect).length}</div>
            <div className={SM.scoreWrong}>✗ {results.filter((r) => !r.isCorrect).length}</div>
          </div>
        </div>
      </div>
      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={questions.length} color="#ef4444" />
      <div className={S.counter}>Soal {qIdx + 1} / {questions.length}</div>

      <div className={`${S.cardLg} ${SM.questionCard}`}>
        <div className={SM.questionJp}>{q.jp}</div>
        {q.id_text && <div className={SM.questionSub}>{q.id_text}</div>}
        {q.hasPhoto && <div className={SM.photoHint}>📷 {q.photoDesc || 'Soal asli pakai foto'}</div>}
      </div>

      <div className={S.list}>
        {q.opts.map((opt, i) => <OptionButton key={i} idx={i} text={opt.text} subText={null} selected={selected} isCorrect={i === q.correctIdx} onSelect={handleSelect} />)}
      </div>

      {selected !== null && q.explanation && (
        <div className={SM.explanationBox}>💡 {q.explanation}</div>
      )}

      {selected !== null && (
        <button style={{ ...RED_BTN, width: '100%', marginTop: 12, padding: '13px', animation: 'fadeIn 0.15s ease' }} onClick={() => { if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
