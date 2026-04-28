// ─── JpDisplay.jsx ────────────────────────────────────────────────────────────
// JpFront: smart Japanese text layout (vs / ・ / ： / → / plain)
// DescBlock: smart description renderer (①②③ / 【keyword】 / plain + footnote)
// Ported from v87 with T.* token system for light/dark support
// ─────────────────────────────────────────────────────────────────────────────

import { T } from '../styles/theme.js';
import { stripFuri, extractReadings, jpFontSize } from '../utils/jp-helpers.js';

// ─── JpFront ─────────────────────────────────────────────────────────────────
/**
 * Smart Japanese text display for flashcard fronts.
 * Handles compound terms: vs / ・ / ： / → / plain
 * Also shows furi + romaji below main text.
 */
export function JpFront({ jp = '', furi, romaji }) {
  const clean = stripFuri(jp);
  const reading = furi || extractReadings(jp);

  // Shared inline style for JP text spans
  const IS = {
    lineHeight: 1.4,
    textAlign: 'center',
    wordBreak: 'break-word',
    fontFamily: T.fontJP,
    fontWeight: 700,
    color: T.textBright,
  };

  // HR divider between stacked parts
  const HR = {
    width: 44,
    height: 1,
    background: T.borderLight,
    margin: '4px auto',
  };

  // ── A vs B (handles "Avs B", "A vs B", "AvS B") ──────────────────────────
  const VS_RE = /\s*vs\s*/i;
  if (VS_RE.test(clean)) {
    const parts = clean.split(VS_RE).map((p) => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {i > 0 && (
              <div style={{ fontSize: Math.round(fs * 0.5), color: T.amberMid, fontWeight: 900, letterSpacing: 4, opacity: 0.85 }}>
                VS
              </div>
            )}
            <span style={{ ...IS, fontSize: fs }}>{p}</span>
          </div>
        ))}
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── A・B・C (中点 separator) ──────────────────────────────────────────────
  if (clean.includes('・') && !clean.includes('：')) {
    const parts = clean.split('・').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {parts.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {i > 0 && <div style={HR} />}
              <span style={{ ...IS, fontSize: fs }}>{p}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ ...IS, fontSize: jpFontSize(title) }}>{title}</span>
        <div style={{ ...HR, background: T.borderHover }} />
        <span style={{ ...IS, fontSize: jpFontSize(sub), opacity: 0.88 }}>{sub}</span>
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── A → B → C (sequence / flow) ──────────────────────────────────────────
  if (clean.includes('→')) {
    const parts = clean.split('→').map((p) => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {i > 0 && <span style={{ fontSize: 12, color: T.gold, opacity: 0.65, lineHeight: 1 }}>↓</span>}
            <span style={{ ...IS, fontSize: fs }}>{p}</span>
          </div>
        ))}
        {_ReadingRow(reading, romaji)}
      </div>
    );
  }

  // ── Plain text ────────────────────────────────────────────────────────────
  const fs = jpFontSize(clean);
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ ...IS, fontSize: fs, letterSpacing: clean.length > 15 ? 0 : 2 }}>{clean}</span>
      {_ReadingRow(reading, romaji)}
    </div>
  );
}

/** Helper: reading (furi) + romaji row below main text */
function _ReadingRow(reading, romaji) {
  if (!reading && !romaji) return null;
  return (
    <div style={{ marginTop: 6, textAlign: 'center' }}>
      {reading && (
        <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginBottom: 2 }}>
          {reading}
        </div>
      )}
      {romaji && (
        <div style={{ fontSize: 11, color: T.textDim, fontStyle: 'italic' }}>{romaji}</div>
      )}
    </div>
  );
}

// ─── DescBlock ────────────────────────────────────────────────────────────────
/**
 * Smart Indonesian description renderer.
 * Branches:
 *   A — 【keyword】 labeled segments (2+ brackets)
 *   B — ①②③ circled-number list
 *   C — plain text with optional (Sumber:...) footnote
 */
export function DescBlock({ desc = '', maxLines = 0 }) {
  if (!desc) return null;

  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
  const blockStyle = { fontSize: 12, lineHeight: 1.7, textAlign: 'left', color: T.textMuted };

  // Strip (Sumber:...) footnote
  const srcRe = /\s*\([^)]*Sumber[^)]*\)\s*$/;
  const srcMatch = desc.match(srcRe);
  const main = srcMatch ? desc.slice(0, srcMatch.index).trim() : desc.trim();
  const src = srcMatch ? srcMatch[0].trim() : null;

  const footnote = src ? (
    <div style={{ marginTop: 5, fontSize: 10, opacity: 0.38, fontStyle: 'italic', color: T.textDim }}>
      {src}
    </div>
  ) : null;

  // Apply maxLines to plain text only (branch C)
  const applyMaxLines = (text) => {
    if (!maxLines) return text;
    const lines = text.split(/\n|\\n/).filter(Boolean);
    return lines.slice(0, maxLines).join('\n');
  };

  // ── Branch A: 【keyword】 list (2+ bracket pairs) ──────────────────────
  const bracketMatches = [...main.matchAll(/【([^】]+)】/g)];
  if (bracketMatches.length >= 2) {
    const parts = main.split(/(【[^】]+】)/);
    const items = [];
    let intro = '';
    let label = null;

    for (const p of parts) {
      const lm = p.match(/^【([^】]+)】$/);
      if (lm) {
        label = lm[1];
      } else if (label !== null) {
        items.push({ label, body: p.trim() });
        label = null;
      } else {
        intro += p;
      }
    }

    return (
      <div style={blockStyle}>
        {intro.trim() && <div style={{ marginBottom: 6, opacity: 0.85 }}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
            <span
              style={{
                color: T.amberMid,
                fontWeight: 700,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                lineHeight: 1.7,
                background: 'rgba(180,83,9,0.10)',
                border: `1px solid rgba(180,83,9,0.25)`,
                borderRadius: 5,
                padding: '0px 5px',
                fontSize: 11,
              }}
            >
              【{item.label}】
            </span>
            <span style={{ opacity: 0.92 }}>{item.body}</span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  // ── Branch B: ①②③ circled-number list ─────────────────────────────────
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
        } else {
          if (cur) cur.body += t;
          else intro += t;
        }
      } else if (cur) {
        cur.body += t;
      } else {
        intro += t;
      }
    }
    if (cur) items.push(cur);

    return (
      <div style={blockStyle}>
        {intro.trim() && <div style={{ marginBottom: 6, opacity: 0.85 }}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, alignItems: 'flex-start' }}>
            <span
              style={{
                color: T.amberMid,
                fontWeight: 700,
                flexShrink: 0,
                minWidth: 16,
                lineHeight: 1.7,
              }}
            >
              {item.num}
            </span>
            <span style={{ opacity: 0.92 }}>{item.body.trim()}</span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  // ── Branch C: plain text ──────────────────────────────────────────────────
  const text = applyMaxLines(main);
  const lines = text.split(/\n|\\n/).filter(Boolean);

  return (
    <div style={blockStyle}>
      {lines.map((line, i) => (
        <p key={i} style={{ margin: 0, marginBottom: i < lines.length - 1 ? 5 : 0, opacity: 0.92 }}>
          {line}
        </p>
      ))}
      {footnote}
    </div>
  );

  // suppress unused warning for circledRe
}
