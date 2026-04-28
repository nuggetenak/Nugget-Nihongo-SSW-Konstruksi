import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, VOCAB_SOURCES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import SprintMode from './SprintMode.jsx';

export default function FocusMode({ known, _unknown, quizWrong = {}, onExit }) {
  const [activeCat, setActiveCat] = useState(null);

  // Find weakest categories
  const catStats = useMemo(() => {
    return CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang')
      .map((cat) => {
        const catCards = CARDS.filter(
          (c) => c.category === cat.key && !VOCAB_SOURCES.includes(c.source)
        );
        const knownN = catCards.filter((c) => known.has(c.id)).length;
        const wrongN = catCards.filter((c) => getWrongCount(quizWrong[c.id]) > 0).length;
        const score = catCards.length > 0 ? Math.round((knownN / catCards.length) * 100) : 100;
        return {
          ...cat,
          total: catCards.length,
          known: knownN,
          wrong: wrongN,
          score,
          cards: catCards,
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => a.score - b.score);
  }, [known, quizWrong]);

  if (activeCat) {
    const cat = catStats.find((c) => c.key === activeCat);
    if (!cat) return null;
    return <SprintMode cards={cat.cards} onExit={() => setActiveCat(null)} />;
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button
        onClick={onExit}
        style={{
          fontFamily: 'inherit',
          fontSize: 12,
          color: T.textMuted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        ← Kembali
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🎯 Mode Fokus</h2>
      <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
        Latih kategori terlemahmu. Kategori diurutkan dari yang paling lemah.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {catStats.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCat(c.key)}
            style={{
              fontFamily: 'inherit',
              padding: '14px 16px',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.text,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 14 }}>
                {c.emoji} {c.label}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.score >= 70 ? T.correct : c.score >= 40 ? T.gold : T.wrong,
                }}
              >
                {c.score}%
              </span>
            </div>
            <div
              style={{
                height: 3,
                background: T.surface,
                borderRadius: T.r.pill,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${c.score}%`,
                  borderRadius: T.r.pill,
                  background: c.score >= 70 ? T.correct : c.score >= 40 ? T.gold : T.wrong,
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
              {c.known}/{c.total} hafal {c.wrong > 0 && `· ${c.wrong} sering salah`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
