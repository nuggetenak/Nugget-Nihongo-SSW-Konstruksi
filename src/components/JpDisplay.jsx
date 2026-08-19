// ─── JpDisplay.jsx ───────────────────────────────────────────────────────────
// Note: font-size on jp spans is prop-driven (jpFontSize()) — justified inline.
// Note: VS label font-size is derived from jp size — justified inline.
import { T } from '../styles/theme.js';
import { useMemo, useState } from 'react';
import { stripFuri, extractReadings, jpFontSize, parseDescStructure } from '../utils/jp-helpers.js';
import S from './JpDisplay.module.css';

// ─── JpFront ──────────────────────────────────────────────────────────────────
// furiganaPolicy: 'always' | 'tap' | 'hidden'
export function JpFront({ jp = '', furi, furiganaPolicy = 'always' }) {
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

  // Memoize branch detection — avoids re-running string checks on every render.
  const jpBranch = useMemo(() => {
    const c = stripFuri(jp);
    if (/\s*vs\s*/i.test(c)) return 'vs';
    if (c.includes('・') && !c.includes('：') && c.split('・').length >= 2) return 'bullet';
    if (c.includes('：')) return 'colon';
    if (c.includes('→')) return 'arrow';
    return 'plain';
  }, [jp]);
  const ruby = showFuri ? parsedRuby : [];
  const hasRubyInText = parsedRuby.length > 0;
  const showReadingRow = !!reading && !hasRubyInText;
  const hintLabel = isTapMode
    ? showFuri
      ? '👆 Ketuk untuk sembunyikan furigana'
      : '👆 Ketuk untuk tampilkan furigana'
    : null;
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
  if (jpBranch === 'vs') {
    const parts = clean
      .split(/\s*vs\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={S.jpWrap}>
        {parts.map((p, i) => (
          <div key={i} className={S.jpWrap}>
            {i > 0 && (
              <div className={S.vsLabel} style={{ fontSize: Math.round(fs * 0.5) }}>
                VS
              </div>
            )}
            <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── A・B・C ───────────────────────────────────────────────────────────────
  if (jpBranch === 'bullet') {
    const parts = clean
      .split('・')
      .map((p) => p.trim())
      .filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <div className={S.hr} />}
            <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── Title：Subtitle ───────────────────────────────────────────────────────
  if (jpBranch === 'colon') {
    const colonIdx = clean.indexOf('：');
    const title = clean.slice(0, colonIdx).trim();
    const sub = clean.slice(colonIdx + 1).trim();
    return wrapInteractive(
      <div className={S.jpWrap}>
        <span style={jpStyle(jpFontSize(title))}>{renderJPWithRuby(title, ruby)}</span>
        <div className={`${S.hr} ${S.hrHover}`} />
        <span style={jpStyle(jpFontSize(sub), { opacity: 0.88 })}>
          {renderJPWithRuby(sub, ruby)}
        </span>
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── A → B → C ────────────────────────────────────────────────────────────
  if (jpBranch === 'arrow') {
    const parts = clean
      .split('→')
      .map((p) => p.trim())
      .filter(Boolean);
    const fs = jpFontSize(parts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <span className={S.arrowDown}>↓</span>}
            <span style={jpStyle(fs)}>{renderJPWithRuby(p, ruby)}</span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── Plain ─────────────────────────────────────────────────────────────────
  const fs = jpFontSize(clean);
  const plainContent = hasRubyInText ? (
    renderJPWithRuby(clean, ruby)
  ) : showFuri && reading ? (
    <ruby className={S.ruby}>
      {clean}
      <rt>{reading}</rt>
    </ruby>
  ) : (
    clean
  );
  return wrapInteractive(
    <div style={{ textAlign: 'center' }}>
      <span style={jpStyle(fs, { letterSpacing: clean.length > 15 ? 0 : 2 })}>{plainContent}</span>
      {!hasRubyInText && !(showFuri && reading) && _ReadingRow(reading, showReadingRow)}
    </div>
  );
}

export function parseRubyFragments(jp = '') {
  const frags = [];
  const re = /([一-龯々〆ヵヶ]+)《([^》]+)》/g;
  let m;
  while ((m = re.exec(jp)) !== null) {
    frags.push({ base: m[1], reading: m[2] });
  }
  return frags;
}

export function renderJPWithRuby(text, rubyFragments) {
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
      </ruby>
    );
    // Advance past base AND strip the 《reading》 marker that follows it.
    const afterBase = rest.slice(idx + frag.base.length);
    const marker = `《${frag.reading}》`;
    rest = afterBase.startsWith(marker) ? afterBase.slice(marker.length) : afterBase;
  }
  if (!nodes.length) return text;
  if (rest) nodes.push(rest);
  return nodes;
}

function _ReadingRow(reading, show = true) {
  if (!show || !reading) return null;
  return (
    <div className={S.readingRow}>
      {reading && (
        <div className={S.furi} style={{ fontFamily: T.fontJP }}>
          {reading}
        </div>
      )}
    </div>
  );
}

// ─── DescBlock ────────────────────────────────────────────────────────────────
export function DescBlock({ desc = '', maxLines = 0 }) {
  const parsed = useMemo(() => parseDescStructure(desc, maxLines), [desc, maxLines]);
  if (!parsed) return null;

  const footnote = parsed.src ? <div className={S.footnote}>{parsed.src}</div> : null;

  if (parsed.branch === 'brackets') {
    return (
      <div className={S.descBlock}>
        {parsed.intro && (
          <div className={S.intro}>
            {renderJPWithRuby(parsed.intro, parseRubyFragments(parsed.intro))}
          </div>
        )}
        {parsed.items.map((item, i) => (
          <div key={i} className={S.listRow}>
            <span className={S.labelChip}>【{item.label}】</span>
            <span className={S.body}>
              {renderJPWithRuby(item.body, parseRubyFragments(item.body))}
            </span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  if (parsed.branch === 'circled') {
    return (
      <div className={S.descBlock}>
        {parsed.intro && (
          <div className={S.intro}>
            {renderJPWithRuby(parsed.intro, parseRubyFragments(parsed.intro))}
          </div>
        )}
        {parsed.items.map((item, i) => (
          <div key={i} className={`${S.listRow} ${S.listRowTight}`}>
            <span className={S.numLabel}>{item.num}</span>
            <span className={S.body}>
              {renderJPWithRuby(item.body.trim(), parseRubyFragments(item.body.trim()))}
            </span>
          </div>
        ))}
        {footnote}
      </div>
    );
  }

  // plain
  return (
    <div className={S.descBlock}>
      {parsed.lines.map((line, i) => (
        <p
          key={i}
          className={S.plainPara}
          style={{ marginBottom: i < parsed.lines.length - 1 ? 5 : 0, opacity: 0.92 }}
        >
          {renderJPWithRuby(line, parseRubyFragments(line))}
        </p>
      ))}
      {footnote}
    </div>
  );
}
