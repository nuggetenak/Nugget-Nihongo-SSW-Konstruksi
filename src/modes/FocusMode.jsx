import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, VOCAB_SOURCES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import SprintMode from './SprintMode.jsx';
import S from './modes.module.css';

export default function FocusMode({ known, _unknown, quizWrong = {}, onExit, onSessionEnd }) {
  const [activeCat, setActiveCat] = useState(null);

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

  if (activeCat) {
    const cat = catStats.find((c) => c.key === activeCat);
    if (!cat) return null;
    return <SprintMode cards={cat.cards} onExit={() => setActiveCat(null)} onSessionEnd={onSessionEnd} />;
  }

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>🎯 Mode Fokus</h2>
      <p className={S.pageSub}>Latih kategori terlemahmu. Kategori diurutkan dari yang paling lemah.</p>

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
