import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, VOCAB_SOURCES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import SprintMode from './SprintMode.jsx';
import EmptyState from '../components/EmptyState.jsx';
import S from './modes.module.css';

export default function FocusMode({ known, quizWrong = {}, onExit, onSessionEnd }) {
  const [activeCat, setActiveCat] = useState(null);
  // Track which categories trained this session.
  const [trainedKeys, setTrainedKeys] = useState(new Set());

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

  // After drill, mark trained and auto-suggest next weakest.
  const handleSprintEnd = (sessionData) => {
    if (onSessionEnd) onSessionEnd(sessionData);
    // Compute next BEFORE updating state (avoid stale closure)
    const alreadyTrained = new Set([...trainedKeys, activeCat]);
    const nextCat = catStats.find((c) => !alreadyTrained.has(c.key));
    setTrainedKeys(alreadyTrained);
    setActiveCat(nextCat ? nextCat.key : null);
  };

  if (activeCat) {
    const cat = catStats.find((c) => c.key === activeCat);
    if (!cat) return null;

    // Show "kenapa kategori ini?" before drill
    return (
      <div className={S.page}>
        <button className={S.btnBack} onClick={() => setActiveCat(null)}>
          ← Fokus
        </button>
        <div
          style={{
            background: 'var(--ssw-surface)',
            border: '1px solid var(--ssw-border)',
            borderRadius: 16,
            padding: 'var(--space-20) var(--space-16)',
            marginBottom: 'var(--space-16)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--fs-body)',
              color: 'var(--ssw-textDim)',
              marginBottom: 'var(--space-6)',
            }}
          >
            🎯 Latihan fokus untuk:
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            {cat.emoji} {cat.label}
          </div>
          <div
            style={{
              fontSize: 'var(--fs-body)',
              color: cat.score >= 70 ? T.correct : cat.score >= 40 ? T.gold : T.wrong,
              fontWeight: 700,
              marginBottom: 'var(--space-8)',
            }}
          >
            Akurasi: {cat.score}% · {cat.known}/{cat.total} hafal
            {cat.wrong > 0 ? ` · ${cat.wrong} sering salah` : ''}
          </div>
          <div
            style={{ fontSize: 'var(--fs-caption)', color: 'var(--ssw-textDim)', lineHeight: 1.5 }}
          >
            {cat.score < 40
              ? 'Kategori ini paling lemah — banyak kartu yang belum hafal. Sprint fokus akan memperkuat ingatan cepat.'
              : cat.score < 70
                ? 'Sudah mulai hafal tapi belum stabil. Latihan ini akan memperkuat yang masih ragu-ragu.'
                : 'Sudah cukup baik! Sprint ini untuk mempertahankan dan mempercepat recall.'}
          </div>
        </div>
        <SprintMode
          cards={cat.cards}
          onExit={() => setActiveCat(null)}
          onSessionEnd={handleSprintEnd}
        />
      </div>
    );
  }

  return (
    <div className={S.page}>
      <p className={S.pageSub}>
        Latih kategori terlemahmu. Kategori diurutkan dari yang paling lemah.
      </p>

      {/* Session progress counter */}
      {trainedKeys.size > 0 && (
        <div
          style={{
            background: 'var(--ssw-surface)',
            border: '1px solid var(--ssw-border)',
            borderRadius: 12,
            padding: 'var(--space-10) var(--space-14)',
            marginBottom: 'var(--space-16)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-10)',
          }}
        >
          <span style={{ fontSize: 18 }}>💪</span>
          <div>
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: T.correct }}>
              {trainedKeys.size} dari {catStats.length} kategori dilatih sesi ini
            </div>
            <div style={{ fontSize: 'var(--fs-small)', color: 'var(--ssw-textDim)' }}>
              {catStats.filter((c) => !trainedKeys.has(c.key)).length > 0
                ? `Berikutnya: ${catStats.find((c) => !trainedKeys.has(c.key))?.emoji} ${catStats.find((c) => !trainedKeys.has(c.key))?.label}`
                : 'Semua kategori sudah dilatih! 🎉'}
            </div>
          </div>
        </div>
      )}

      {catStats.length === 0 && (
        <EmptyState
          icon="✨"
          title="Belum ada kartu lemah"
          desc="Lanjutkan kuis dulu, lalu kembali ke sini untuk latihan intensif."
          ctaLabel="Mulai Kuis →"
          onCta={onExit}
        />
      )}

      <div className={S.list}>
        {catStats.map((c) => (
          <button key={c.key} className={S.btnItem} onClick={() => setActiveCat(c.key)}>
            <div className={S.rowSpreadMb}>
              <span style={{ fontSize: 14 }}>
                {c.emoji} {c.label}
              </span>
              <span
                style={{
                  fontSize: 'var(--fs-caption)',
                  fontWeight: 700,
                  color: c.score >= 70 ? T.correct : c.score >= 40 ? T.gold : T.wrong,
                }}
              >
                {trainedKeys.has(c.key) && (
                  <span
                    title="Dilatih sesi ini (belum tentu sudah hafal — lihat skornya di samping)"
                    style={{ color: T.textDim, marginRight: 'var(--space-4)' }}
                  >
                    🔁
                  </span>
                )}
                {c.score}%
              </span>
            </div>
            <div className={S.miniBarWrap}>
              <div
                className={S.miniBarFill}
                style={{
                  width: `${c.score}%`,
                  background: c.score >= 70 ? T.correct : c.score >= 40 ? T.gold : T.wrong,
                }}
              />
            </div>
            <div
              style={{ fontSize: 'var(--fs-small)', color: T.textDim, marginTop: 'var(--space-4)' }}
            >
              {c.known}/{c.total} hafal {c.wrong > 0 && `· ${c.wrong} sering salah`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
