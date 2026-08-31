// ─── JpDisplay.jsx ───────────────────────────────────────────────────────────
// Note: font-size on jp spans is prop-driven (jpFontSize()) — justified inline.
// Note: VS label font-size is derived from jp size — justified inline.
import { T } from '../styles/theme.js';
import { useMemo, useState } from 'react';
import { stripFuri, extractReadings, jpFontSize, parseDescStructure, isMeaningfullyJapanese } from '../utils/jp-helpers.js';
import S from './JpDisplay.module.css';

// ─── JpFront ──────────────────────────────────────────────────────────────────
// furiganaPolicy: 'always' | 'tap' | 'hidden'
// maxSize: optional px ceiling on the auto-computed size (jpFontSize scales
// UP for short strings, e.g. 28px for <=4 chars — right for a single hero
// card, wrong for a dense stacked list, where a handful of short 2-4
// character answers next to longer ones reads as random/erratic size
// jumping rather than intentional emphasis). Leave unset for existing
// single-item contexts; pass e.g. 16 for list rows.
export function JpFront({ jp = '', furi, furiganaPolicy = 'always', maxSize }) {
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
  const fontSizeFor = (text) => (maxSize ? Math.min(jpFontSize(text), maxSize) : jpFontSize(text));

  // Memoize branch detection — avoids re-running string checks on every render.
  const jpBranch = useMemo(() => {
    const c = stripFuri(jp);
    if (/\s*vs\s*/i.test(c)) return 'vs';
    if (c.includes('・') && !c.includes('：') && c.split('・').length >= 2) return 'bullet';
    if (c.includes('：')) return 'colon';
    if (c.includes('→')) return 'arrow';
    return 'plain';
  }, [jp]);

  // Some shared slots this component is used in (ResultScreen's userAnswer/
  // correctAnswer across several modes, primarily) sometimes receive content
  // that isn't actually Japanese: ConfusionMode's Indonesian definitions,
  // ProductionMode/QuizProduksiMode's id_text translations, AngkaMode's
  // mostly-Indonesian konteks sentences. Forcing Japanese-specific typography
  // (CJK font, center alignment, bold weight, jpFontSize's length-based
  // auto-scaling meant for kanji-dense strings, not prose sentence length)
  // onto a full Indonesian sentence looks wrong — found by checking this
  // component's real callers, not a hypothetical. Bail out to plain,
  // left-aligned body text before any of the Japanese-specific branching
  // below; ratio-based (isMeaningfullyJapanese), not hasJapanese()'s plain
  // presence check, so a mostly-Japanese phrase with an incidental
  // non-Japanese character still gets full treatment. All hooks above this
  // point already ran unconditionally, so this early return is safe.
  if (!isMeaningfullyJapanese(clean)) {
    return (
      <div
        lang="id"
        style={{
          textAlign: 'left',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 'var(--fw-medium)',
          fontSize: maxSize ? `${Math.min(16, maxSize)}px` : 'var(--fs-subtitle)',
          lineHeight: 1.5,
          color: T.textBright,
          wordBreak: 'break-word',
        }}
      >
        {clean}
      </div>
    );
  }

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
    const parts = jp
      .split(/\s*vs\s*/i)
      .map((p) => p.trim())
      .filter(Boolean);
    const strippedParts = parts.map(stripFuri);
    const fs = fontSizeFor(strippedParts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={S.jpWrap}>
        {parts.map((p, i) => (
          <div key={i} className={S.jpWrap}>
            {i > 0 && (
              <div className={S.vsLabel} style={{ fontSize: Math.round(fs * 0.5) }}>
                VS
              </div>
            )}
            <span lang="ja" style={jpStyle(fs)}>
              {showFuri ? renderJPWithRuby(p) : strippedParts[i]}
            </span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── A・B・C ───────────────────────────────────────────────────────────────
  if (jpBranch === 'bullet') {
    const parts = jp
      .split('・')
      .map((p) => p.trim())
      .filter(Boolean);
    const strippedParts = parts.map(stripFuri);
    const fs = fontSizeFor(strippedParts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <div className={S.hr} />}
            <span lang="ja" style={jpStyle(fs)}>
              {showFuri ? renderJPWithRuby(p) : strippedParts[i]}
            </span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── Title：Subtitle ───────────────────────────────────────────────────────
  if (jpBranch === 'colon') {
    const colonIdx = jp.indexOf('：');
    const title = jp.slice(0, colonIdx).trim();
    const sub = jp.slice(colonIdx + 1).trim();
    const titleClean = stripFuri(title);
    const subClean = stripFuri(sub);
    return wrapInteractive(
      <div className={S.jpWrap}>
        <span lang="ja" style={jpStyle(fontSizeFor(titleClean))}>
          {showFuri ? renderJPWithRuby(title) : titleClean}
        </span>
        <div className={`${S.hr} ${S.hrHover}`} />
        <span lang="ja" style={jpStyle(fontSizeFor(subClean), { opacity: 0.88 })}>
          {showFuri ? renderJPWithRuby(sub) : subClean}
        </span>
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── A → B → C ────────────────────────────────────────────────────────────
  if (jpBranch === 'arrow') {
    const parts = jp
      .split('→')
      .map((p) => p.trim())
      .filter(Boolean);
    const strippedParts = parts.map(stripFuri);
    const fs = fontSizeFor(strippedParts.reduce((a, b) => (a.length > b.length ? a : b)));
    return wrapInteractive(
      <div className={`${S.jpWrap} ${S.jpWrapTight}`}>
        {parts.map((p, i) => (
          <div key={i} className={`${S.jpWrap} ${S.jpWrapTight}`}>
            {i > 0 && <span className={S.arrowDown}>↓</span>}
            <span lang="ja" style={jpStyle(fs)}>
              {showFuri ? renderJPWithRuby(p) : strippedParts[i]}
            </span>
          </div>
        ))}
        {_ReadingRow(reading, showReadingRow)}
      </div>
    );
  }

  // ── Plain ─────────────────────────────────────────────────────────────────
  const fs = fontSizeFor(clean);
  const plainContent = !showFuri ? (
    clean
  ) : hasRubyInText ? (
    renderJPWithRuby(jp)
  ) : reading ? (
    <ruby className={S.ruby}>
      {clean}
      <rp>(</rp>
      <rt>{reading}</rt>
      <rp>)</rp>
    </ruby>
  ) : (
    clean
  );
  return wrapInteractive(
    <div style={{ textAlign: 'center' }}>
      <span lang="ja" style={jpStyle(fs, { letterSpacing: clean.length > 15 ? 0 : 2 })}>{plainContent}</span>
      {!hasRubyInText && !(showFuri && reading) && _ReadingRow(reading, showReadingRow)}
    </div>
  );
}

// A reading is only plausible for the kanji run it's directly attached to if
// its length stays roughly in proportion (compound kanji readings run ~1-3
// kana per character; 4x is already generous headroom -- >= rather than a
// stricter/looser cutoff, chosen after auditing every real (base, reading)
// pair in src/data that sits exactly on this boundary: the large majority
// are the same particle/number/prefix-interrupted pattern as the case this
// guard was originally written for (指差し呼称《ゆびさしこしょう》 sitting at
// exactly base.length*4, previously missed by a strict `>`), not genuine
// long single-word readings).
const MAX_PLAUSIBLE_KANA_PER_KANJI = 4;

// Kanji run, optionally followed directly by a run of trailing kana (either
// real okurigana in hiragana, or the tail of a kanji+katakana loanword
// compound -- 移動式クレーン, 冷却コイル, 防水カバー and dozens more are
// completely ordinary vocabulary in this domain, not edge cases), followed
// by the 《reading》 marker. The trailing-kana group is speculative -- see
// the two different validation strategies in renderJPWithRuby below, one
// per script (hiragana vs katakana can't share a check: readings are always
// written in hiragana, so a katakana suffix never matches the reading's
// tail by exact string comparison even when it's the correct, intended
// reading -- くれーん の long-vowel mark ー doesn't literally appear in its
// own hiragana transliteration くれえん, they're the same sound written two
// different ways, not the same characters).
const RUBY_MARKER_SRC = '([一-龯々〆ヵヶ]+)([ぁ-んァ-ヶー]*)《([^》]+)》';
const KATAKANA_RE = /[\u30A1-\u30FA]/;

// Strip only the CARDS-format pure-reading （reading） parens (this is
// exactly stripFuri's second step, duplicated rather than imported from it
// because stripFuri's first step removes 《》 markers outright, and this
// call site needs to keep those for conversion instead of discarding them).
// Semantic parens like （NFB）/（SGP）are left alone, same rule as stripFuri.
function stripPureReadingParens(text) {
  return text.replace(/（([^）]+)）/g, (match, inner) => {
    const residual = inner
      .replace(/[ぁ-んー]/g, '')
      .replace(/\bvs\b/gi, '')
      .replace(/\b[A-Za-z]\b/g, '')
      .replace(/[\u30FB\s\u3000/]/g, '')
      .trim();
    return residual.length === 0 ? '' : match;
  });
}

// Lightweight "does this text carry at least one renderable reading" check —
// used by JpFront to decide between inline ruby and the plain-text/
// single-blob fallbacks. Only counts markers renderJPWithRuby will actually
// convert (same validation, so the two never disagree about a given string).
export function parseRubyFragments(jp = '') {
  const frags = [];
  const re = new RegExp(RUBY_MARKER_SRC, 'g');
  let m;
  while ((m = re.exec(jp)) !== null) {
    const [, base, trailing, reading] = m;
    if (!trailing) {
      frags.push({ base, reading });
    } else if (KATAKANA_RE.test(trailing)) {
      // Kanji+katakana compound -- always kept combined (see renderJPWithRuby).
      frags.push({ base: base + trailing, reading });
    } else if (reading.endsWith(trailing)) {
      // Real okurigana, reading confirmed to echo it -- split as before.
      frags.push({ base, reading: reading.slice(0, reading.length - trailing.length) });
    } // else: gloss/cloze, not a reading -- no fragment
  }
  return frags;
}

// Converts embedded 《reading》 markers to real <ruby>/<rt> in one forward
// pass over `text` itself, rather than the old parse-then-reindex approach
// (parse fragments once, then re-locate each one in a second string via
// indexOf). That two-step design was silently broken whenever a fragment's
// kanji base repeated earlier in the same string as ordinary unmarked text
// (indexOf finds the first, wrong, occurrence — e.g. "杭間《くいかん》...を
// 杭《くい》を揚げる" put くい's ruby on the base's first, unrelated
// appearance) — audited against every string in src/data before landing on
// this fix, not just the one report that prompted it. A single left-to-right
// walk can't make that mistake: each match is exactly where its own regex
// match landed, full stop.
//
// `_legacyFragments` is accepted and ignored — every existing call site
// passes `parseRubyFragments(text)` for it, which is now redundant (this
// function re-derives everything it needs from `text` itself) but harmless,
// and leaving those ~15 call sites alone keeps this a contained fix.
export function renderJPWithRuby(text, _legacyFragments) {
  if (!text) return text;
  const cleaned = stripPureReadingParens(text);
  if (!cleaned.includes('《')) return cleaned;

  const re = new RegExp(RUBY_MARKER_SRC, 'g');
  const nodes = [];
  let lastEnd = 0;
  let key = 0;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const [full, kanji, trailing, rawReading] = m;
    // A stray 《...》 that doesn't land directly on kanji (+ optional
    // trailing kana) never enters this loop as its own match at all -- it's
    // just part of whichever gap surrounds the marker that *did* match. The
    // known real case: a handful of jac-mockup-sets.js entries carry the
    // same marker twice in a row (冷媒《れいばい》《れいばい》), and the
    // second, orphaned copy has no kanji of its own to attach to. Strip any
    // such leftovers from the gap rather than showing broken raw brackets --
    // same "when genuinely unrenderable, drop it" rule stripFuri already
    // applies everywhere else in this app.
    const gapBefore = cleaned.slice(lastEnd, m.index).replace(/《[^》]*》/g, '');
    const trailingIsKatakana = trailing && KATAKANA_RE.test(trailing);

    if (trailing && !trailingIsKatakana && !rawReading.endsWith(trailing)) {
      // Trailing hiragana that ISN'T an okurigana echo of this reading —
      // a glossed synonym (ろう付け《ブレージング》) or a fill-in-the-blank
      // cloze marker (《 》), not a phonetic reading. Don't guess: pass the
      // whole thing through untouched, exactly as if the regex had never
      // matched here (its pre-existing behaviour for every case like this).
      if (gapBefore) nodes.push(gapBefore);
      nodes.push(full);
      lastEnd = m.index + full.length;
      continue;
    }

    let gap = gapBefore;
    let base = kanji;
    let reading = rawReading;
    let suffix = '';
    if (trailingIsKatakana) {
      // Kanji+katakana loanword compound (移動式クレーン, 冷却コイル, ...).
      // Keep it combined with the full, untrimmed reading rather than
      // trying to split like hiragana okurigana -- readings are always
      // written in hiragana, so even a correct reading essentially never
      // passes an exact endsWith(trailing) check against the katakana
      // itself (long-vowel marks and small kana don't round-trip through a
      // literal character comparison). Not attempting the split is the
      // reliable choice, not a fallback for lack of a better one.
      base = kanji + trailing;
    } else if (trailing) {
      // Real, validated hiragana okurigana -- split it back out so it
      // renders as ordinary text after the ruby.
      reading = rawReading.slice(0, rawReading.length - trailing.length);
      suffix = trailing;
    }

    // See MAX_PLAUSIBLE_KANA_PER_KANJI above: fold an implausibly-long
    // reading's preceding gap text into the ruby base instead of stranding
    // it bare next to a disproportionate <rt>.
    if (reading.length >= base.length * MAX_PLAUSIBLE_KANA_PER_KANJI && gap) {
      base = gap + base;
      gap = '';
    }

    if (gap) nodes.push(gap);
    nodes.push(
      <ruby key={`rb-${key++}`} className={S.ruby}>
        {base}
        <rp>(</rp>
        <rt>{reading}</rt>
        <rp>)</rp>
      </ruby>
    );
    if (suffix) nodes.push(suffix);
    lastEnd = m.index + full.length;
  }

  if (!nodes.length) return cleaned.replace(/《[^》]*》/g, '');
  const tail = cleaned.slice(lastEnd).replace(/《[^》]*》/g, '');
  if (tail) nodes.push(tail);
  return nodes;
}

function _ReadingRow(reading, show = true) {
  if (!show || !reading) return null;
  return (
    <div className={S.readingRow}>
      {reading && (
        <div className={S.furi} lang="ja" style={{ fontFamily: T.fontJP }}>
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
