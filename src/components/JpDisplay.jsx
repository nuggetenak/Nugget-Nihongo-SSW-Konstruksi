// ─── JpDisplay.jsx ───────────────────────────────────────────────────────────
// Note: font-size on jp spans is prop-driven (jpFontSize()) — justified inline.
// Note: VS label font-size is derived from jp size — justified inline.
import { T } from '../styles/theme.js';
import { useMemo, useState } from 'react';
import {
  stripFuri,
  extractReadings,
  jpFontSize,
  parseDescStructure,
  isMeaningfullyJapanese,
} from '../utils/jp-helpers.js';
import S from './JpDisplay.module.css';

// ─── JpFront ──────────────────────────────────────────────────────────────────
// furiganaPolicy: 'always' | 'tap' | 'hidden'
// maxSize: optional px ceiling on the auto-computed size (jpFontSize scales
// UP for short strings, e.g. 28px for <=4 chars — right for a single hero
// card, wrong for a dense stacked list, where a handful of short 2-4
// character answers next to longer ones reads as random/erratic size
// jumping rather than intentional emphasis). Leave unset for existing
// single-item contexts; pass e.g. 16 for list rows.
/**
 * `compact` (2026-09-04) — render on one line, aligned with its container,
 * instead of the stacked hero treatment.
 *
 * The vs / ・ / ： / → branches below split a term into parts and stack them
 * vertically, centred, with a big "VS" between. That is right for a flashcard
 * front, where a comparison IS the card. In a scrollable list it is not: 215 of
 * 1438 cards (15%) contain one of those separators, so in SearchMode,
 * GlossaryMode, SumberMode, CatatanMode and DangerMode's accordion every seventh
 * row silently became a 3–5 line centred block among single-line left-aligned
 * neighbours. 免振 vs 制振 vs 耐震 took five lines in a row sized for one.
 *
 * Exactly the same shape of problem as `maxSize` (2026-08-28): a treatment
 * tuned for a single hero card leaking into dense lists, where the two contexts
 * want opposite defaults. Opt-in for the same reason — the hero case is the one
 * that must not change.
 */
export function JpFront({ jp = '', furi, furiganaPolicy = 'always', maxSize, compact = false }) {
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
  // `compact` collapses every multi-part branch to 'plain', which renders the
  // whole string as one line with its separators intact — the way it reads in a
  // list row.
  const jpBranch = useMemo(() => {
    if (compact) return 'plain';
    const c = stripFuri(jp);
    if (/\s*vs\s*/i.test(c)) return 'vs';
    if (c.includes('・') && !c.includes('：') && c.split('・').length >= 2) return 'bullet';
    if (c.includes('：')) return 'colon';
    if (c.includes('→')) return 'arrow';
    return 'plain';
  }, [jp, compact]);

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
      <span lang="ja" style={jpStyle(fs, { letterSpacing: clean.length > 15 ? 0 : 2 })}>
        {plainContent}
      </span>
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

// A kanji run, optionally followed directly by a run of trailing kana (either
// real okurigana in hiragana, or the tail of a kanji+katakana loanword compound
// -- 移動式クレーン, 冷却コイル, 防水カバー and dozens more are completely
// ordinary vocabulary in this domain, not edge cases), then the 《reading》
// marker. The trailing-kana group is speculative and validated below.
//
// What this regex deliberately does NOT try to capture is where the word
// *starts*. A reading routinely covers text to the left of the kanji it's
// attached to -- ラジオ体操《らじおたいそう》, 差し込み継手《さしこみつぎて》,
// 雇用保険の支給要件《こようほけんのしきゅうようけん》 -- and no regex can tell
// that from ガス溶接《ようせつ》, where the reading covers the kanji only. That
// question is answered by extendBaseLeft/readingFitsBase above, which check the
// reading against the candidate word instead of guessing from shape.
const RUBY_MARKER_SRC = '([一-龯々〆ヵヶ]+)([ぁ-んァ-ヶー]*)《([^》]+)》';
const KATAKANA_RE = /[\u30A1-\u30FA]/;
// A reading is kana (with the occasional latin abbreviation). Kanji inside one
// means the marker is not a reading at all but a parenthetical gloss -- a second,
// unrelated use of 《》 that jac-mockup-sets.js uses throughout (危険予知活動
// 《KY活動》, 180度《完全に開く》, 1件500万円以上《建築工事は1500万円以上》).
// Rendering those as ruby put whole sentences in <rt>, shrunk to annotation size
// above one kanji. Detected here rather than guessed at: 30 distinct cases, all
// unambiguous.
const KANJI_RE = /[\u4E00-\u9FAF]/;

// Katakana and hiragana are the same syllabary in two scripts, so a word and its
// reading can be compared character for character once both are folded to one.
const kataToHira = (t) => t.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

const KANA_RE = /[ぁ-んァ-ヶー]/;
// Characters a word may be built from. Latin and digits are in deliberately:
// GX形ダクタイル鋳鉄管《GXがた…》 and N値《Nち》 are real entries, and their
// readings carry the latin part verbatim, so excluding it would cut the base
// short at exactly the wrong place.
const JP_WORD_RE = /[一-龯々〆ヵヶぁ-んァ-ヺーA-Za-z0-9]/;
const LATIN_RE = /[A-Za-z0-9]/;
// A vowel-lengthening ー in the base is spelled either ー or a bare vowel in the
// reading (くれーん / くれえん both occur in this corpus).
const LONG_VOWEL_MATCHES = 'ーあいうえおアイウエオ';

/**
 * Can `reading` be the reading of `base`?
 *
 * Aligns the two character by character: every kana in `base` must appear in
 * `reading` at that exact point (kana is written the same in a word and in its
 * reading, once katakana is folded to hiragana), while every kanji absorbs one
 * or more kana. Backtracking, because a kanji's length isn't known in advance —
 * 険 takes けん here and 険 could take just け elsewhere.
 *
 * The kana are what make this a real check rather than a guess: they pin the
 * alignment at fixed points, so ラジオ体操/らじおたいそう aligns and
 * ヘルメットを着用/ちゃくよう does not. A run of pure kanji would align with
 * literally any reading of the right length, which is exactly why the caller
 * refuses to extend across one that adds no kana.
 */
function readingFitsBase(base, reading) {
  const b = kataToHira(base);
  const r = kataToHira(reading);
  const memo = new Set();
  const walk = (i, j) => {
    if (i === b.length) return j === r.length;
    if (j >= r.length) return false;
    const key = i * 1000 + j;
    if (memo.has(key)) return false;
    memo.add(key);
    const ch = b[i];
    if (ch === 'ー') {
      // ー is orthography, not a sound: accept whichever vowel the reading
      // spells the long syllable with. Still consumes exactly one character and
      // still has to be a vowel — letting it match anything would make it a
      // wildcard, which is how レーザー墨出し器《すみだしき》 first came out as
      // ー墨出し器 with ー silently eating the す.
      return LONG_VOWEL_MATCHES.includes(r[j]) && walk(i + 1, j + 1);
    }
    if (LATIN_RE.test(ch)) {
      return ch.toLowerCase() === (r[j] ?? '').toLowerCase() && walk(i + 1, j + 1);
    }
    if (KANA_RE.test(ch)) {
      return ch === r[j] && walk(i + 1, j + 1);
    }
    // Kanji: try every plausible reading length for it, shortest first.
    for (let take = 1; take <= 4 && j + take <= r.length; take++) {
      if (walk(i + 1, j + take)) return true;
    }
    return false;
  };
  return walk(0, 0);
}

/**
 * How far left of `kanji` the ruby base really starts.
 *
 * Returns the extra text to prepend to the base (''  when the match already has
 * the whole word). `before` is everything between the previous match and this
 * one; only its trailing run of Japanese word characters is eligible, so a space,
 * a comma or a latin token ends the search.
 *
 * Only extensions that add at least one kana are considered. Prepending a pure
 * kanji run would always "fit" — kanji absorb any reading — so allowing it would
 * turn this into a rule that swallows the preceding word whenever the reading
 * happened to be long enough. Longest valid extension wins, so 雇用保険の支給要件
 * beats の支給要件.
 */
function extendBaseLeft(before, kanji, trailing, reading, atTextStart = false) {
  if (!before) return '';
  // The reading's own length is the natural ceiling: readingFitsBase has to
  // consume all of it, and no Japanese word is longer than its own reading, so a
  // base can never legitimately grow past that. Self-limiting, and better than a
  // fixed number — 12 characters happened to truncate a real 15-character
  // compound in this corpus.
  const maxExtension = reading.length;
  let start = before.length;
  while (start > 0 && JP_WORD_RE.test(before[start - 1]) && before.length - start < maxExtension) {
    start--;
  }
  const word = before.slice(start);
  if (!word) return '';
  const tail = kanji + trailing;
  for (let i = 0; i < word.length; i++) {
    const ext = word.slice(i);
    if (!KANA_RE.test(ext)) continue; // adds no kana — nothing would pin it
    // A single kana starting mid-word is the one shape that fits by accident:
    // the す of 示《しめ》す数値《すうち》, the は of 場合《ばあい》は速《はや》,
    // the と of 趣味《しゅみ》と特技《とくぎ》 — each is okurigana or a particle
    // belonging to what came before, and each happens to equal the first
    // character of the next reading. Two kana agreeing by chance doesn't occur
    // anywhere in this corpus (もう一度言, ねじ接合, せん断力, くさび緊結式足場,
    // あと施工アンカー are all real prefixes), so the bar is two — except at the
    // very start of the text, where there is no earlier word for a kana to have
    // been taken from and ご安全に, お大事に, ご苦労様 are exactly right.
    const opensTheText = atTextStart && i === 0 && start === 0;
    if (ext.length === 1 && !opensTheText && !/[一-龯々〆ヵヶA-Za-z0-9]/.test(ext)) continue;
    if (readingFitsBase(ext + tail, reading)) return ext;
  }
  return '';
}

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
  let last = 0;
  let m;
  while ((m = re.exec(jp)) !== null) {
    const [, kanji, trailing, reading] = m;
    // Gloss, not a reading -- no fragment. Same rule as renderJPWithRuby.
    if (KANJI_RE.test(reading)) {
      last = m.index + m[0].length;
      continue;
    }
    const isKatakanaTail = trailing && KATAKANA_RE.test(trailing);
    const base =
      extendBaseLeft(
        jp.slice(last, m.index),
        kanji,
        isKatakanaTail ? trailing : '',
        reading,
        last === 0
      ) + kanji;
    last = m.index + m[0].length;
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

    // A reading carrying kanji is a parenthetical gloss, not furigana — see
    // KANJI_RE. Pass the whole match through as literal text, which is exactly
    // how the source wrote it and how it reads correctly on screen.
    const isGloss =
      KANJI_RE.test(rawReading) ||
      (trailing && !trailingIsKatakana && !rawReading.endsWith(trailing));

    if (isGloss) {
      // Either a kanji-bearing gloss, or trailing hiragana that ISN'T an
      // okurigana echo of this reading — a glossed synonym
      // (ろう付け《ブレージング》) or a fill-in-the-blank cloze marker (《 》),
      // not a phonetic reading. Don't guess: pass the whole thing through
      // untouched, exactly as if the regex had never matched here.
      if (gapBefore) nodes.push(gapBefore);
      nodes.push(full);
      lastEnd = m.index + full.length;
      continue;
    }

    // Extend the base left through whatever the reading proves belongs to it.
    const ext = extendBaseLeft(
      gapBefore,
      kanji,
      trailingIsKatakana ? trailing : '',
      rawReading,
      lastEnd === 0
    );
    let gap = ext ? gapBefore.slice(0, gapBefore.length - ext.length) : gapBefore;
    let base = ext + kanji;
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
      base += trailing;
    } else if (trailing) {
      // Real, validated hiragana okurigana -- split it back out so it
      // renders as ordinary text after the ruby.
      reading = rawReading.slice(0, rawReading.length - trailing.length);
      suffix = trailing;
    }

    // Last resort. extendBaseLeft handles every case it can *prove*; this
    // catches what's left -- a reading so out of proportion to its base that
    // stranding the gap text beside a disproportionate <rt> is certainly worse
    // than folding it in, even without proof. Kept deliberately as the fallback
    // rather than the rule: it is a length heuristic, and a length heuristic
    // cannot tell 差し込み継手《さしこみつぎて》 from ガス溶接《ようせつ》.
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
