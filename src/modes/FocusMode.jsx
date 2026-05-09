import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, VOCAB_SOURCES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import SprintMode from './SprintMode.jsx';
import S from './modes.module.css';

export default function FocusMode({ known, quizWrong = {}, onExit, onSessionEnd }) {
  const [activeCat, setActiveCat] = useState(null);
  // F3: track which categories trained this session
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
        return { ...cat, total: catCards.length, known: knownN, wrong: wrongN, score, cards: catCards };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => a.score - b.score);
  }, [known, quizWrong]);

  // F2: after sprint, mark trained and auto-suggest next weakest
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

    // F1: Show "kenapa kategori ini?" before drill
    return (
      <div className={S.page}>
        <button className={S.btnBack} onClick={() => setActiveCat(null)}>← Fokus</button>
        <div style={{ background: 'var(--ssw-surface)', border: '1px solid var(--ssw-border)', borderRadius: 16, padding: '20px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--ssw-textDim)', marginBottom: 6 }}>🎯 Latihan fokus untuk:</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{cat.emoji} {cat.label}</div>
          <div style={{ fontSize: 13, color: cat.score >= 70 ? T.correct : cat.score >= 40 ? T.gold : T.wrong, fontWeight: 700, marginBottom: 8 }}>
            Akurasi: {cat.score}% · {cat.known}/{cat.total} hafal{cat.wrong > 0 ? ` · ${cat.wrong} sering salah` : ''}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ssw-textDim)', lineHeight: 1.5 }}>
            {cat.score < 40
              ? 'Kategori ini paling lemah — banyak kartu yang belum hafal. Sprint fokus akan memperkuat ingatan cepat.'
              : cat.score < 70
              ? 'Sudah mulai hafal tapi belum stabil. Latihan ini akan memperkuat yang masih ragu-ragu.'
              : 'Sudah cukup baik! Sprint ini untuk mempertahankan dan mempercepat recall.'}
          </div>
        </div>
        <SprintMode cards={cat.cards} onExit={() => setActiveCat(null)} onSessionEnd={handleSprintEnd} />
      </div>
    );
  }

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>🎯 Mode Fokus</h2>
      <p className={S.pageSub}>Latih kategori terlemahmu. Kategori diurutkan dari yang paling lemah.</p>

      {/* F3: Session progress counter */}
      {trainedKeys.size > 0 && (
        <div style={{ background: 'var(--ssw-surface)', border: '1px solid var(--ssw-border)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>💪</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.correct }}>
              {trainedKeys.size} dari {catStats.length} kategori dilatih sesi ini
            </div>
            <div style={{ fontSize: 11, color: 'var(--ssw-textDim)' }}>
              {catStats.filter((c) => !trainedKeys.has(c.key)).length > 0
                ? `Berikutnya: ${catStats.find((c) => !trainedKeys.has(c.key))?.emoji} ${catStats.find((c) => !trainedKeys.has(c.key))?.label}`
                : 'Semua kategori sudah dilatih! 🎉'}
            </div>
          </div>
        </div>
      )}

      {catStats.length === 0 && (
        <div className={S.emptyInMode}>
          <div className={S.emptyIcon}>✨</div>
          <div className={S.emptyTitle}>Belum ada kartu lemah</div>
          <div className={S.emptyDesc}>
            Lanjutkan kuis dulu, lalu kembali ke sini untuk latihan intensif.
          </div>
          <button className={S.btnPrimary} style={{ width: 'auto', padding: '11px 24px' }} onClick={onExit}>
            Mulai Kuis →
          </button>
        </div>
      )}

      <div className={S.list}>
        {catStats.map((c) => (
          <button key={c.key} className={S.btnItem} onClick={() => setActiveCat(c.key)}>
            <div className={S.rowSpreadMb}>
              <span style={{ fontSize: 14 }}>{c.emoji} {c.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.score >= 70 ? T.correct : c.score >= 40 ? T.gold : T.wrong }}>
                {trainedKeys.has(c.key) && <span style={{ color: T.correct, marginRight: 4 }}>✓</span>}
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
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
              {c.known}/{c.total} hafal {c.wrong > 0 && `· ${c.wrong} sering salah`}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
