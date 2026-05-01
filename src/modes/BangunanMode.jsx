// ─── BangunanMode.jsx (phaseB) ────────────────────────────────────────────────
// Phase B: Replaced "Segera Hadir" stub with functional quiz mode.
// Uses BANGUNAN_SETS data, saves scores to bangunanScores in storage v3.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { BANGUNAN_SETS } from '../data/bangunan-sets.js';
import { get, set as storageSet } from '../storage/engine.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';
import { T } from '../styles/theme.js';

// Normalize question set format to QuizShell format
function normalizeQuestions(set) {
  return set.questions.map((q) => ({
    question: q.q,
    options: q.opts.map((opt, j) => ({
      text: opt,
      sub: q.opts_id?.[j] ?? null,
    })),
    correctIdx: q.ans,
    explanation: q.exp,
    hint: q.hint ?? null,
    _cat: q.cat,
  }));
}

export default function BangunanMode({ onExit }) {
  const [selectedSet, setSelectedSet] = useState(null);
  const scores = get('progress')?.bangunanScores ?? {};

  const handleFinish = ({ correct, total }) => {
    if (!selectedSet) return;
    storageSet('progress', (p) => ({
      ...p,
      bangunanScores: {
        ...(p.bangunanScores ?? {}),
        [selectedSet.id]: { correct, total, date: new Date().toISOString() },
      },
    }));
  };

  if (selectedSet) {
    return (
      <QuizShell
        questions={normalizeQuestions(selectedSet)}
        onExit={() => setSelectedSet(null)}
        onFinish={handleFinish}
        title={`Bangunan — ${selectedSet.title}`}
        accentColor="#3b82f6"
        showHint
        autoNextDelay={2000}
      />
    );
  }

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>🏗️ Bangunan · 建築</h2>
      <p className={S.pageSub}>Soal SSW Konstruksi jalur 建築</p>

      <div className={S.list}>
        {BANGUNAN_SETS.map((set) => {
          const score = scores[set.id];
          const pct = score ? Math.round((score.correct / score.total) * 100) : null;
          return (
            <button
              key={set.id}
              className={S.btnItem}
              onClick={() => setSelectedSet(set)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: T.surface, border: `1px solid ${T.border}`,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{set.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontJP }}>{set.title}</div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
                  {set.subtitle} · {set.questions.length} soal
                </div>
                {score && (
                  <div style={{ fontSize: 10, color: pct >= 70 ? T.correct : T.wrong, marginTop: 2, fontWeight: 700 }}>
                    Terakhir: {score.correct}/{score.total} ({pct}%)
                  </div>
                )}
              </div>
              <span style={{ fontSize: 18, color: T.textDim, flexShrink: 0 }}>→</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: T.textDim, textAlign: 'center', lineHeight: 1.6 }}>
        {BANGUNAN_SETS.reduce((n, s) => n + s.questions.length, 0)} soal · {BANGUNAN_SETS.length} set
      </div>
    </div>
  );
}
