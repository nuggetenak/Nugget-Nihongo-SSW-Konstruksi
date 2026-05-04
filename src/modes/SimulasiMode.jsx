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

const PASS_PCT = 65;
const RED_BTN = { fontFamily: 'inherit', borderRadius: T.r.md, border: 'none', background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const PRESETS = [
  { key: 'quick', emoji: '⚡', label: 'Latihan Cepat', sub: '15 soal · 15 menit', count: 15, time: 15 * 60 },
  { key: 'half', emoji: '📝', label: 'Setengah Ujian', sub: '25 soal · 25 menit', count: 25, time: 25 * 60 },
  { key: 'full', emoji: '🎯', label: 'Ujian Penuh', sub: 'semua soal · 45 menit', count: 0, time: 45 * 60 },
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

  // Fire onSessionEnd when we transition to result phase
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
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎯</div>
          <h2 className={S.pageTitle} style={{ fontSize: 20 }}>Simulasi Ujian</h2>
          <p className={S.pageSub}>Format ujian SSW Konstruksi dengan timer</p>
        </div>
        <div className={S.card} style={{ marginBottom: 20 }}>
          {INSTRUCTIONS.map((inst, i) => <div key={i} style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.9 }}>{inst}</div>)}
        </div>
        <div className={S.sectionLabel}>Mode Simulasi</div>
        <div className={S.list} style={{ marginBottom: 24 }}>
          {PRESETS.map((p) => (
            <button key={p.key} className={S.btnItem} onClick={() => setPreset(p.key)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: preset === p.key ? 'rgba(239,68,68,0.10)' : T.surface, border: `1px solid ${preset === p.key ? 'rgba(239,68,68,0.4)' : T.border}`, color: preset === p.key ? '#ef4444' : T.text }}>
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: preset === p.key ? 'rgba(239,68,68,0.7)' : T.textDim, marginTop: 2 }}>{p.sub}</div>
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
      <div className={S.page} style={{ padding: '20px 16px', animation: 'scaleIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', padding: '28px 20px 24px', background: lulus ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', borderRadius: T.r.xl, border: `2px solid ${lulus ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`, marginBottom: 16, animation: 'scaleIn 0.3s ease' }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{lulus ? '✅' : '❌'}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: lulus ? T.correct : T.wrong, marginBottom: 4, letterSpacing: 1 }}>{lulus ? 'LULUS' : 'BELUM LULUS'}</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: lulus ? T.correct : T.wrong, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>{pct}%</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>{correct} / {total} benar · batas lulus {PASS_PCT}%</div>
          <div style={{ height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: lulus ? 'linear-gradient(90deg,#16a34a80,#16a34a)' : 'linear-gradient(90deg,#dc262680,#dc2626)', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </div>
        <div className={S.row} style={{ marginBottom: 16 }}>
          <button style={{ ...RED_BTN, flex: 1, padding: '12px' }} onClick={handleStart}>🔄 Ulang</button>
          <button className={S.btnSecondary} style={{ flex: 1, padding: '12px', borderRadius: T.r.md, fontWeight: 700 }} onClick={onExit}>← Kembali</button>
        </div>
        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list}>
              {wrongList.map((r, i) => {
                const correctOpt = r.opts[r.correctIdx];
                const userOpt = r.opts[r.userIdx];
                return (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: T.r.md, background: T.surface, borderLeft: `3px solid ${T.wrong}`, animation: `slideUp 0.3s ease ${i * 0.05}s both` }}>
                    <div style={{ fontSize: 13, fontFamily: T.fontJP, marginBottom: 4, lineHeight: 1.6 }}>{stripFuri(r.jp)}</div>
                    <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, lineHeight: 1.4 }}>{r.id_text}</div>
                    <div style={{ fontSize: 12, color: T.wrong, marginBottom: 3 }}>✗ {stripFuri(userOpt?.text || '—')}</div>
                    <div style={{ fontSize: 12, color: T.correct }}>✓ {stripFuri(correctOpt?.text || '—')}</div>
                    {r.explanation && <div style={{ fontSize: 11, color: T.textDim, marginTop: 6, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>💡 {r.explanation.slice(0, 160)}{r.explanation.length > 160 ? '…' : ''}</div>}
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
    <div className={S.pageScroll} style={{ padding: '12px 16px 24px' }}>
      <div className={S.rowSpread} style={{ marginBottom: 10 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>✕ Keluar</button>
        <div className={S.row} style={{ gap: 10 }}>
          <div style={{ textAlign: 'center', background: isUrgent ? 'rgba(220,38,38,0.10)' : T.surface, border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.4)' : T.border}`, borderRadius: T.r.md, padding: '3px 12px', animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none', minWidth: 70 }}>
            <div style={{ fontSize: 9, color: isUrgent ? T.wrong : T.textDim, letterSpacing: 1.5, fontWeight: 700 }}>WAKTU</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: isUrgent ? T.wrong : T.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{fmtTime(timeLeft)}</div>
          </div>
          <div style={{ fontSize: 12, color: T.textDim, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            <div style={{ color: T.correct, fontWeight: 700 }}>✓ {results.filter((r) => r.isCorrect).length}</div>
            <div style={{ color: T.wrong }}>✗ {results.filter((r) => !r.isCorrect).length}</div>
          </div>
        </div>
      </div>
      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={questions.length} color="#ef4444" />
      <div className={S.counter}>Soal {qIdx + 1} / {questions.length}</div>

      <div className={S.cardLg} style={{ marginBottom: 14, animation: 'fadeIn 0.2s ease' }}>
        <div style={{ fontSize: 15, fontFamily: T.fontJP, lineHeight: 1.75, fontWeight: 500 }}>{q.jp}</div>
        {q.id_text && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>{q.id_text}</div>}
        {q.hasPhoto && <div style={{ fontSize: 11, color: T.gold, marginTop: 8, padding: '6px 10px', background: 'rgba(251,191,36,0.06)', borderRadius: T.r.sm, lineHeight: 1.4 }}>📷 {q.photoDesc || 'Soal asli pakai foto'}</div>}
      </div>

      <div className={S.list}>
        {q.opts.map((opt, i) => <OptionButton key={i} idx={i} text={opt.text} subText={null} selected={selected} isCorrect={i === q.correctIdx} onSelect={handleSelect} />)}
      </div>

      {selected !== null && q.explanation && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: T.r.md, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', fontSize: 12, lineHeight: 1.65, color: T.textMuted, animation: 'fadeIn 0.2s ease' }}>
          💡 {q.explanation}
        </div>
      )}

      {selected !== null && (
        <button style={{ ...RED_BTN, width: '100%', marginTop: 12, padding: '13px', animation: 'fadeIn 0.15s ease' }} onClick={() => { if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
