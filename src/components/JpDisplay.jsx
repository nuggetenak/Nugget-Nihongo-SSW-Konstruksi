// ─── JpDisplay.jsx (phaseF) ──────────────────────────────────────────────────
// Phase F: Added audioEnabled prop to JpFront — shows 🔊 button via speak.js.──
// Note: font-size on jp spans is prop-driven (jpFontSize()) — justified inline.
// Note: VS label font-size is derived from jp size — justified inline.
import { T } from '../styles/theme.js';
import { useMemo, useState } from 'react';
import { canSpeak, speakJP } from '../utils/speak.js'; // eslint-disable-line no-unused-vars
import { stripFuri, extractReadings, jpFontSize } from '../utils/jp-helpers.js';
import S from './JpDisplay.module.css';

// ─── JpFront (phaseE) ─────────────────────────────────────────────────────────
// E.3 TD-10: Added furiganaPolicy prop ('always' | 'tap' | 'hidden').
// Default 'always' preserves existing behavior for all N5-N4 users.
// 'tap' and 'hidden' are wired for Phase E prep — full UI in Phase G.
export function JpFront({ jp = '', furi, furiganaPolicy = 'always', audioEnabled = true }) { // eslint-disable-line no-unused-vars
  const [tapReveal, setTapReveal] = useState(false);
  // policy:
  // always: always show readings/ruby
  // tap: hide until user taps text area
  // hidden: never show readings/ruby
  const isTapMode = furiganaPolicy === 'tap';
  const showFuri = furiganaPolicy === 'always' || (isTapMode && tapReveal);
  const effectiveFuri = showFuri ? furi : null;
  const clean = stripFuri(jp);
  const reading = effectiveFuri || (showFuri ? extractReadings(jp) : null);
  const parsedRuby = useMemo(() => parseRubyFragments(jp), [jp]);
  const ruby = showFuri ? parsedRuby : [];
  const hasRubyInText = parsedRuby.length > 0;
  const showReadingRow = !!reading && !hasRubyInText;
  const hintLabel = isTapMode ? (showFuri ? '👆 Ketuk untuk sembunyikan furigana' : '👆 Ketuk untuk tampilkan furigana') : null;
  const wrapInteractive = (content) => {
    if (!isTapMode) return content;
    return (
      <button
        type="button"
        className={S.tapSurface}
        onClick={() => setTapReveal((v) => !v)}
        aria-label="Toggle furigana"
        aria-pressed={showFuri}
      >
        {content}
        {hintLabel && <div className={S.tapHint}>{hintLabel}</div>}
      </button>
    );
  };

  // Phase F: Audio — inline in render path below

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
    return wrapInteractive(<div className={S.jpWrap}>
        {parts.map((p, i) => (
          <div key={i} className={S.jpWrap}>
            {i > 0 && (
              <div className={S.vsLabel} style={{ fontSize: Math.round(fs * 0.5) }}>VS</div>
            )}
            <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>);
  }

  // ── A・B・C ───────────────────────────────────────────────────────────────
  if (clean.includes('・') && !clean.includes('：')) {
    const parts = clean.split('・').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
      return wrapInteractive(<div className={`${S.jpWrap} ${S.jpWrapTight}`}>
          {parts.map((p, i) => (
            <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
              {i > 0 && <div className={S.hr} />}
              <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
            </div>
          ))}
          {_ReadingRow(reading, showReadingRow)}
        </div>);
    }
  }

  // ── Title：Subtitle ───────────────────────────────────────────────────────
  if (clean.includes('：')) {
    const colonIdx = clean.indexOf('：');
    const title = clean.slice(0, colonIdx).trim();
    const sub = clean.slice(colonIdx + 1).trim();
    return wrapInteractive(<div className={S.jpWrap}>
        <span style={jpStyle(jpFontSize(title))}>{renderJPWithRuby(title, ruby)}</span>
        <div className={`${S.hr} ${S.hrHover}`} />
        <span style={jpStyle(jpFontSize(sub), { opacity: 0.88 })}>{renderJPWithRuby(sub, ruby)}</span>
        {_ReadingRow(reading, showReadingRow)}
      </div>);
  }

  // ── A → B → C ────────────────────────────────────────────────────────────
  if (clean.includes('→')) {
    const parts = clean.split('→').map((p) => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(<div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <span className={S.arrowDown}>↓</span>}
            <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>);
  }

  // ── Plain ─────────────────────────────────────────────────────────────────
  const fs = jpFontSize(clean);
  return wrapInteractive(<div style={{ textAlign: 'center' }}>
      <span style={jpStyle(fs, { letterSpacing: clean.length > 15 ? 0 : 2 })}>{renderJPWithRuby(clean, ruby)}</span>
      {_ReadingRow(reading, showReadingRow)}
    </div>);
}

function parseRubyFragments(jp = '') {
  const frags = [];
  const re = /([一-龯々〆ヵヶ]+)《([^》]+)》/g;
  let m;
  while ((m = re.exec(jp)) !== null) {
    frags.push({ base: m[1], reading: m[2] });
  }
  return frags;
}

function renderJPWithRuby(text, rubyFragments) {
  if (!text || !rubyFragments?.length) return text;
  const nodes = [];
  let rest = text;
  let key = 0;
  for (const frag of rubyFragments) {
    const idx = rest.indexOf(frag.base);
    if (idx < 0) continue;
    if (idx > 0) nodes.push(rest.slice(0, idx));
    nodes.push(
      <ruby key={`rb-${key++}`} className={S.ruby}>
        {frag.base}
        <rt>{frag.reading}</rt>
      </ruby>,
    );
    rest = rest.slice(idx + frag.base.length);
  }
  if (!nodes.length) return text;
  if (rest) nodes.push(rest);
  return nodes;
}

function _ReadingRow(reading, show = true) {
  if (!show || !reading) return null;
  return (
    <div className={S.readingRow}>
      {reading && <div className={S.furi} style={{ fontFamily: T.fontJP }}>{reading}</div>}
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
        {intro.trim() && <div className={S.intro}>{renderJPWithRuby(intro.trim(), parseRubyFragments(intro.trim()))}</div>}
        {items.map((item, i) => (
          <div key={i} className={S.listRow}>
            <span className={S.labelChip}>【{item.label}】</span>
            <span className={S.body}>{renderJPWithRuby(item.body, parseRubyFragments(item.body))}</span>
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
        {intro.trim() && <div className={S.intro}>{renderJPWithRuby(intro.trim(), parseRubyFragments(intro.trim()))}</div>}
        {items.map((item, i) => (
          <div key={i} className={`${S.listRow} ${S.listRowTight}`}>
            <span className={S.numLabel}>{item.num}</span>
            <span className={S.body}>{renderJPWithRuby(item.body.trim(), parseRubyFragments(item.body.trim()))}</span>
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
          {renderJPWithRuby(line, parseRubyFragments(line))}
        </p>
      ))}
      {footnote}
    </div>
  );
}
