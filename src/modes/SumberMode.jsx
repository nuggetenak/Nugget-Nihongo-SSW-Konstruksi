import { useState } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { SOURCE_META, SOURCE_GROUPS, SOURCE_ACCENT } from '../data/categories.js';
import { useApp } from '../contexts/AppContext.jsx';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import { get as storageGet } from '../storage/engine.js';
import S from './modes.module.css';

export default function SumberMode({ onExit, onNavigate }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [activeSrc, setActiveSrc] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // Progress per source from storage.
  const known = new Set(storageGet('progress')?.known ?? []);

  if (activeSrc) {
    const srcCards = CARDS.filter((c) => c.source === activeSrc);
    const srcIds = srcCards.map((c) => c.id);
    const meta = SOURCE_META[activeSrc] || { label: activeSrc, emoji: '📄' };
    const color = SOURCE_ACCENT[activeSrc] || T.gold;
    return (
      <div className={S.page} style={{ paddingTop: 16, paddingBottom: 24 }}>
        <button className={S.btnBack} onClick={() => setActiveSrc(null)}>
          ← Sumber
        </button>
        <h2 className={S.pageTitle} style={{ fontSize: 16 }}>
          {meta.emoji} {meta.label}
        </h2>
        <p className={S.pageSub} style={{ fontSize: 12 }}>
          {srcCards.length} kartu
        </p>
        {/* Quick-launch actions per source */}
        {onNavigate && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => onNavigate('kartu', { filterIds: srcIds })}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                padding: '9px 10px',
                borderRadius: T.r.md,
                border: `1px solid ${color}40`,
                background: `${color}12`,
                color,
                cursor: 'pointer',
              }}
            >
              🃏 Kartu
            </button>
            <button
              onClick={() => onNavigate('sprint', { filterIds: srcIds })}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                padding: '9px 10px',
                borderRadius: T.r.md,
                border: `1px solid ${color}40`,
                background: `${color}12`,
                color,
                cursor: 'pointer',
              }}
            >
              ⚡ Sprint
            </button>
            <button
              onClick={() => onNavigate('kuis', { filterIds: srcIds })}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                padding: '9px 10px',
                borderRadius: T.r.md,
                border: `1px solid ${color}40`,
                background: `${color}12`,
                color,
                cursor: 'pointer',
              }}
            >
              ❓ Kuis
            </button>
            <button
              onClick={() => onNavigate('produksi', { filterIds: srcIds })}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                padding: '9px 10px',
                borderRadius: T.r.md,
                border: `1px solid ${color}40`,
                background: `${color}12`,
                color,
                cursor: 'pointer',
              }}
            >
              ✍️ Produksi
            </button>
            <button
              onClick={() => onNavigate('kuisprod', { filterIds: srcIds })}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                padding: '9px 10px',
                borderRadius: T.r.md,
                border: `1px solid ${color}40`,
                background: `${color}12`,
                color,
                cursor: 'pointer',
              }}
            >
              🔤 Kuis Prod
            </button>
          </div>
        )}
        <div className={S.list} style={{ gap: 6 }}>
          {srcCards.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              aria-expanded={expanded === c.id}
              style={{
                width: '100%',
                margin: 0,
                font: 'inherit',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: T.r.md,
                cursor: 'pointer',
                background: T.surface,
                border: 'none',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div className={S.rowSpread}>
                <span style={{ fontSize: 13 }}>
                  <JpFront jp={c.jp} furiganaPolicy={furiganaPolicy} />
                </span>
                <span style={{ fontSize: 12, color: T.textMuted, flexShrink: 0, marginLeft: 8 }}>
                  {c.id_text}
                </span>
              </div>
              {expanded === c.id && (
                <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                  <div style={{ marginTop: 4 }}>
                    <DescBlock desc={c.desc} />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Compute per-source stats for picker
  const srcStats = {};
  let minPct = 101,
    weakestKey = null;
  for (const g of SOURCE_GROUPS) {
    for (const key of g.keys) {
      const cards = CARDS.filter((c) => c.source === key);
      if (!cards.length) continue;
      const knownCount = cards.filter((c) => known.has(c.id)).length;
      const pct = Math.round((knownCount / cards.length) * 100);
      srcStats[key] = { total: cards.length, knownCount, pct };
      if (pct < minPct) {
        minPct = pct;
        weakestKey = key;
      }
    }
  }

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>
        ← Kembali
      </button>
      <h2 className={S.pageTitle}>📂 Sumber</h2>
      <p className={S.pageSub}>Jelajahi kartu berdasarkan sumber PDF/CSV</p>
      {SOURCE_GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          <div className={S.sectionLabel}>{g.label}</div>
          <div className={S.list} style={{ gap: 6 }}>
            {g.keys.map((key) => {
              const meta = SOURCE_META[key];
              if (!meta) return null;
              const color = SOURCE_ACCENT[key] || T.gold;
              const stat = srcStats[key];
              const isWeakest = key === weakestKey;
              return (
                <button
                  key={key}
                  className={S.btnItem}
                  onClick={() => setActiveSrc(key)}
                  style={{ borderLeft: `3px solid ${color}`, paddingBottom: stat ? 10 : undefined }}
                >
                  <div className={S.rowSpread} style={{ marginBottom: stat ? 6 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>
                        {meta.emoji} {meta.label}
                      </span>
                      {isWeakest && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            background: 'rgba(220,38,38,0.1)',
                            color: T.wrong,
                            border: `1px solid rgba(220,38,38,0.25)`,
                            borderRadius: 99,
                            padding: '1px 6px',
                          }}
                        >
                          Terlemah
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: T.textDim }}>{stat?.total ?? 0} kartu</span>
                  </div>
                  {stat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 4,
                          background: T.border,
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${stat.pct}%`,
                            height: '100%',
                            background:
                              stat.pct >= 70 ? T.correct : stat.pct >= 40 ? T.amber : T.wrong,
                            borderRadius: 99,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: stat.pct >= 70 ? T.correct : stat.pct >= 40 ? T.amber : T.wrong,
                          minWidth: 32,
                          textAlign: 'right',
                        }}
                      >
                        {stat.pct}%
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
