import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import ProgressBar from '../components/ProgressBar.jsx';
import OptionButton from '../components/OptionButton.jsx';

const PASS_PCT = 65;

const PRESETS = [
  { key: 'quick', emoji: '⚡', label: 'Latihan Cepat', sub: '15 soal · 15 menit', count: 15, time: 15 * 60 },
  { key: 'half',  emoji: '📝', label: 'Setengah Ujian', sub: '25 soal · 25 menit', count: 25, time: 25 * 60 },
  { key: 'full',  emoji: '🎯', label: 'Ujian Penuh',    sub: 'semua soal · 45 menit', count: 0, time: 45 * 60 },
];

const INSTRUCTIONS = [
  '📋 Pilih satu jawaban yang paling tepat',
  '⏱ Timer berjalan — jangan sampai habis',
  '🚫 Soal otomatis lanjut setelah kamu jawab',
  `✅ ${PASS_PCT}% ke atas = LULUS`,
];

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SimulasiMode({ onExit }) {
  const [phase, setPhase]   = useState('start');
  const [preset, setPreset] = useState('quick');
  const [seed, setSeed]     = useState(0);

  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults]   = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const config = PRESETS.find((p) => p.key === preset) || PRESETS[0];

  // Build shuffled question list when quiz starts
  const questions = useMemo(() => {
    if (phase !== 'playing') return [];
    const pool = shuffle(JAC_OFFICIAL);
    const items = config.count > 0 ? pool.slice(0, config.count) : pool;
    return items.map((q) => {
      // Shuffle options but track original index for answer check
      const shuffledOpts = shuffle(q.options.map((text, origIdx) => ({ text, origIdx })));
      const correctArrayIdx = shuffledOpts.findIndex((o) => o.origIdx === q.answer);
      return {
        jp:          q.jp,
        id_text:     q.id_text,
        opts:        shuffledOpts,       // [{text, origIdx}]
        correctIdx:  correctArrayIdx,    // index in shuffledOpts
        explanation: q.explanation,
        hasPhoto:    q.hasPhoto,
        photoDesc:   q.photoDesc,
      };
    });
  }, [phase, seed, config.count]); // eslint-disable-line react-hooks/exhaustive-deps

  const q     = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  // Global countdown timer
  useEffect(() => {
    if (phase !== 'playing') {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, seed]);

  // Auto-advance 1.5s after answering
  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => {
      if (isLast) {
        setPhase('result');
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  const handleStart = useCallback(() => {
    setSeed((s) => s + 1);
    setQIdx(0);
    setSelected(null);
    setResults([]);
    setTimeLeft(config.time);
    setPhase('playing');
  }, [config.time]);

  const handleSelect = useCallback(
    (optArrayIdx) => {
      if (selected !== null || phase !== 'playing' || !q) return;
      setSelected(optArrayIdx);
      const isCorrect = optArrayIdx === q.correctIdx;
      setResults((r) => [
        ...r,
        {
          isCorrect,
          jp:          q.jp,
          id_text:     q.id_text,
          opts:        q.opts,
          correctIdx:  q.correctIdx,
          userIdx:     optArrayIdx,
          explanation: q.explanation,
        },
      ]);
    },
    [selected, phase, q]
  );

  const isUrgent = timeLeft < 60 && timeLeft > 0 && phase === 'playing';

  // ─── START SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
        <button
          onClick={onExit}
          style={{ fontFamily: 'inherit', fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}
        >
          ← Kembali
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🎯</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Simulasi Ujian</h2>
          <p style={{ fontSize: 13, color: T.textMuted }}>Format ujian SSW Konstruksi dengan timer</p>
        </div>

        {/* Instructions */}
        <div style={{ background: T.surface, borderRadius: T.r.md, padding: '12px 16px', marginBottom: 20, border: `1px solid ${T.border}` }}>
          {INSTRUCTIONS.map((inst, i) => (
            <div key={i} style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.9 }}>{inst}</div>
          ))}
        </div>

        {/* Preset selector */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>
          Mode Simulasi
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              style={{ fontFamily: 'inherit', padding: '13px 16px', borderRadius: T.r.md, cursor: 'pointer', background: preset === p.key ? 'rgba(239,68,68,0.10)' : T.surface, border: `1px solid ${preset === p.key ? 'rgba(239,68,68,0.4)' : T.border}`, color: preset === p.key ? '#ef4444' : T.text, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: preset === p.key ? 'rgba(239,68,68,0.7)' : T.textDim, marginTop: 2 }}>{p.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}
        >
          Mulai Simulasi 🎯
        </button>
      </div>
    );
  }

  // ─── RESULT SCREEN ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    const total   = results.length;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
    const lulus   = pct >= PASS_PCT;
    const wrongList = results.filter((r) => !r.isCorrect);

    return (
      <div style={{ padding: '20px 16px', maxWidth: T.maxW, margin: '0 auto', animation: 'scaleIn 0.3s ease' }}>
        {/* LULUS / BELUM LULUS banner */}
        <div style={{ textAlign: 'center', padding: '28px 20px 24px', background: lulus ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', borderRadius: T.r.xl, border: `2px solid ${lulus ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`, marginBottom: 16, animation: 'scaleIn 0.3s ease' }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{lulus ? '✅' : '❌'}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: lulus ? T.correct : T.wrong, marginBottom: 4, letterSpacing: 1 }}>
            {lulus ? 'LULUS' : 'BELUM LULUS'}
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, color: lulus ? T.correct : T.wrong, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>
            {correct} / {total} benar · batas lulus {PASS_PCT}%
          </div>
          <div style={{ height: 6, background: 'rgba(0,0,0,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: lulus ? 'linear-gradient(90deg,#16a34a80,#16a34a)' : 'linear-gradient(90deg,#dc262680,#dc2626)', borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={handleStart}
            style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            🔄 Ulang
          </button>
          <button
            onClick={onExit}
            style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer' }}
          >
            ← Kembali
          </button>
        </div>

        {/* Wrong answer review */}
        {wrongList.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>
              Review Salah ({wrongList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wrongList.map((r, i) => {
                const correctOpt = r.opts[r.correctIdx];
                const userOpt    = r.opts[r.userIdx];
                return (
                  <div
                    key={i}
                    style={{ padding: '12px 14px', borderRadius: T.r.md, background: T.surface, borderLeft: `3px solid ${T.wrong}`, animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                  >
                    <div style={{ fontSize: 13, fontFamily: T.fontJP, marginBottom: 4, lineHeight: 1.6 }}>
                      {stripFuri(r.jp)}
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, lineHeight: 1.4 }}>
                      {r.id_text}
                    </div>
                    <div style={{ fontSize: 12, color: T.wrong, marginBottom: 3 }}>
                      ✗ {stripFuri(userOpt?.text || '—')}
                    </div>
                    <div style={{ fontSize: 12, color: T.correct }}>
                      ✓ {stripFuri(correctOpt?.text || '—')}
                    </div>
                    {r.explanation && (
                      <div style={{ fontSize: 11, color: T.textDim, marginTop: 6, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
                        💡 {r.explanation.slice(0, 160)}{r.explanation.length > 160 ? '…' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── PLAYING SCREEN ───────────────────────────────────────────────────────
  if (!q) return null;

  const correctDisplayIdx = q.correctIdx;

  return (
    <div style={{ padding: '12px 16px 24px', maxWidth: T.maxW, margin: '0 auto', animation: 'fadeIn 0.2s ease' }}>
      {/* Header: exit + BIG TIMER + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button
          onClick={onExit}
          style={{ fontFamily: 'inherit', fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
        >
          ✕ Keluar
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Big timer box */}
          <div
            style={{ textAlign: 'center', background: isUrgent ? 'rgba(220,38,38,0.10)' : T.surface, border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.4)' : T.border}`, borderRadius: T.r.md, padding: '3px 12px', animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none', minWidth: 70 }}
          >
            <div style={{ fontSize: 9, color: isUrgent ? T.wrong : T.textDim, letterSpacing: 1.5, fontWeight: 700 }}>WAKTU</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: isUrgent ? T.wrong : T.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
              {fmtTime(timeLeft)}
            </div>
          </div>
          {/* Score */}
          <div style={{ fontSize: 12, color: T.textDim, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            <div style={{ color: T.correct, fontWeight: 700 }}>✓ {results.filter((r) => r.isCorrect).length}</div>
            <div style={{ color: T.wrong }}>✗ {results.filter((r) => !r.isCorrect).length}</div>
          </div>
        </div>
      </div>

      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={questions.length} color="#ef4444" />

      <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8, marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
        Soal {qIdx + 1} / {questions.length}
      </div>

      {/* Question card */}
      <div
        style={{ padding: '18px 16px', background: T.surface, borderRadius: T.r.lg, border: `1px solid ${T.border}`, marginBottom: 14, animation: 'fadeIn 0.2s ease' }}
      >
        <div style={{ fontSize: 15, fontFamily: T.fontJP, lineHeight: 1.75, fontWeight: 500 }}>{q.jp}</div>
        {q.id_text && (
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>{q.id_text}</div>
        )}
        {q.hasPhoto && (
          <div style={{ fontSize: 11, color: T.gold, marginTop: 8, padding: '6px 10px', background: 'rgba(251,191,36,0.06)', borderRadius: T.r.sm, lineHeight: 1.4 }}>
            📷 {q.photoDesc || 'Soal asli pakai foto'}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {q.opts.map((opt, i) => (
          <OptionButton
            key={i}
            idx={i}
            text={opt.text}
            subText={null}
            selected={selected}
            isCorrect={i === correctDisplayIdx}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Explanation after answer */}
      {selected !== null && q.explanation && (
        <div
          style={{ marginTop: 12, padding: '12px 14px', borderRadius: T.r.md, background: 'rgba(251,191,36,0.05)', border: `1px solid rgba(251,191,36,0.12)`, fontSize: 12, lineHeight: 1.65, color: T.textMuted, animation: 'fadeIn 0.2s ease' }}
        >
          💡 {q.explanation}
        </div>
      )}

      {/* Manual next button (visible after answering; auto-advance also fires) */}
      {selected !== null && (
        <button
          onClick={() => {
            if (isLast) { setPhase('result'); } else { setQIdx((i) => i + 1); setSelected(null); }
          }}
          style={{ width: '100%', marginTop: 12, padding: '13px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, border: 'none', background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', color: '#fff', cursor: 'pointer', animation: 'fadeIn 0.15s ease' }}
        >
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
