// ─── JpDisplay.jsx ────────────────────────────────────────────────────────────
// Note: font-size on jp spans is prop-driven (jpFontSize()) — justified inline.
// Note: VS label font-size is derived from jp size — justified inline.
import { T } from '../styles/theme.js';
import { stripFuri, extractReadings, jpFontSize } from '../utils/jp-helpers.js';
import S from './JpDisplay.module.css';

// ─── JpFront ─────────────────────────────────────────────────────────────────
export function JpFront({ jp = '', furi, romaji }) {
  const clean = stripFuri(jp);
  const reading = furi || extractReadings(jp);

  const jpStyle = (fs, extra = {}) => ({
    lineHeight: 1.4,
    textAlign: 'center',
    wordBreak: 'break-word',
    fontFamily: T.fontJP,
    fontWeight: 700,
    color: T.textBright,
    fontSize: fs,
    ...extra,
  });

  // ── A vs B ────────────────────────────────────────────────────────────────
  const VS_RE = /\s*vs\s*/i;
  if (VS_RE.test(clean)) {
    const parts = clean.split(VS_RE).map((p) => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return (
      <div className={S.jpWrap}>
        {parts.map((p, i) => (
          <div key={i} className={S.jpWrap}>
            {i > 0 && (
              <div className={S.vsLabel} style={{ fontSize: Math.round(fs * 0.5) }}>VS</div>
            )}
            <span style={jpStyle(fs)}>{p}</span>
          </div>
        ))}
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── A・B・C ───────────────────────────────────────────────────────────────
  if (clean.includes('・') && !clean.includes('：')) {
    const parts = clean.split('・').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
      return (
        <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
          {parts.map((p, i) => (
            <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
              {i > 0 && <div className={S.hr} />}
              <span style={jpStyle(fs)}>{p}</span>
            </div>
          ))}
          {_ReadingRow(reading, romaji)}
        </div>
      );
    }
  }

  // ── Title：Subtitle ───────────────────────────────────────────────────────
  if (clean.includes('：')) {
    const colonIdx = clean.indexOf('：');
    const title = clean.slice(0, colonIdx).trim();
    const sub = clean.slice(colonIdx + 1).trim();
    return (
      <div className={S.jpWrap}>
        <span style={jpStyle(jpFontSize(title))}>{title}</span>
        <div className={`${S.hr} ${S.hrHover}`} />
        <span style={jpStyle(jpFontSize(sub), { opacity: 0.88 })}>{sub}</span>
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── A → B → C ────────────────────────────────────────────────────────────
  if (clean.includes('→')) {
    const parts = clean.split('→').map((p) => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return (
      <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <span className={S.arrowDown}>↓</span>}
            <span style={jpStyle(fs)}>{p}</span>
          </div>
        ))}
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── Plain ─────────────────────────────────────────────────────────────────
  const fs = jpFontSize(clean);
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={jpStyle(fs, { letterSpacing: clean.length > 15 ? 0 : 2 })}>{clean}</span>
      {_ReadingRow(reading, romaji)}
    </div>
  );
}

function _ReadingRow(reading, romaji) {
  if (!reading && !romaji) return null;
  return (
    <div className={S.readingRow}>
      {reading && <div className={S.furi} style={{ fontFamily: T.fontJP }}>{reading}</div>}
      {romaji && <div className={S.romaji}>{romaji}</div>}
    </div>
  );
}

// ─── DescBlock ────────────────────────────────────────────────────────────────
export function DescBlock({ desc = '', maxLines = 0 }) {
  if (!desc) return null;

  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';

  const srcRe = /\s*\([^)]*Sumber[^)]*\)\s*$/;
  const srcMatch = desc.match(srcRe);
  const main = srcMatch ? desc.slice(0, srcMatch.index).trim() : desc.trim();
  const src = srcMatch ? srcMatch[0].trim() : null;

  const footnote = src ? <div className={S.footnote}>{src}</div> : null;

  const applyMaxLines = (text) => {
    if (!maxLines) return text;
    return text.split(/\n|\\n/).filter(Boolean).slice(0, maxLines).join('\n');
  };

  // ── Branch A: 【keyword】 ─────────────────────────────────────────────────
  const bracketMatches = [...main.matchAll(/【([^】]+)】/g)];
  if (bracketMatches.length >= 2) {
    const parts = main.split(/(【[^】]+】)/);
    const items = [];
    let intro = '';
    let label = null;
    for (const p of parts) {
      const lm = p.match(/^【([^】]+)】$/);
      if (lm) { label = lm[1]; }
      else if (label !== null) { items.push({ label, body: p.trim() }); label = null; }
      else { intro += p; }
    }
    return (
      <div className={S.descBlock}>
        {intro.trim() && <div className={S.intro}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} className={S.listRow}>
            <span className={S.labelChip}>【{item.label}】</span>
            <span className={S.body}>{item.body}</span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  // ── Branch B: ①②③ ──────────────────────────────────────────────────────
  const hasCircled = [...CIRCLED].some((c) => main.includes(c));
  if (hasCircled) {
    const CIDX = Object.fromEntries([...CIRCLED].map((c, i) => [c, i + 1]));
    const tokens = main.split(new RegExp(`(${[...CIRCLED].join('|')})`));
    const items = [];
    let intro = '';
    let cur = null;
    let lastIdx = 0;
    for (const t of tokens) {
      if (t.length === 1 && CIRCLED.includes(t)) {
        const tIdx = CIDX[t];
        if (tIdx > lastIdx) {
          if (cur) items.push(cur);
          cur = { num: t, body: '' };
          lastIdx = tIdx;
        } else { if (cur) cur.body += t; else intro += t; }
      } else if (cur) { cur.body += t; }
      else { intro += t; }
    }
    if (cur) items.push(cur);
    return (
      <div className={S.descBlock}>
        {intro.trim() && <div className={S.intro}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} className={`${S.listRow} ${S.listRowTight}`}>
            <span className={S.numLabel}>{item.num}</span>
            <span className={S.body}>{item.body.trim()}</span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  // ── Branch C: plain ───────────────────────────────────────────────────────
  const lines = applyMaxLines(main).split(/\n|\\n/).filter(Boolean);
  return (
    <div className={S.descBlock}>
      {lines.map((line, i) => (
        <p key={i} className={S.plainPara} style={{ marginBottom: i < lines.length - 1 ? 5 : 0, opacity: 0.92 }}>
          {line}
        </p>
      ))}
      {footnote}
    </div>
  );
}
