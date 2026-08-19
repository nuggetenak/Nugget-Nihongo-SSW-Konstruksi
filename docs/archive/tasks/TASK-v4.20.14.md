# TASK v4.20.14 — PERF-2: JpDisplay Memoization (REF-11)

**Status:** DONE ✅ | **Effort:** Low | **Depends on:** v4.20.13 DONE

## Goal

`JpDisplay.DescBlock` calls `parseRubyFragments()` on every render for every line/item. Memoize it.

---

## Step 1 — Extract `parseDescStructure` to `src/utils/jp-helpers.js`

Open `src/utils/jp-helpers.js`. Add at the end:

```js
/**
 * REF-11: Parse a desc string into a structured object for memoized rendering.
 * @returns {{ branch: 'brackets'|'circled'|'plain', intro: string, items: Array, lines: string[], src: string|null }}
 */
export function parseDescStructure(desc = '', maxLines = 0) {
  if (!desc) return null;

  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
  const srcRe = /\s*\([^)]*Sumber[^)]*\)\s*$/;
  const srcMatch = desc.match(srcRe);
  const main = srcMatch ? desc.slice(0, srcMatch.index).trim() : desc.trim();
  const src = srcMatch ? srcMatch[0].trim() : null;

  // Branch A: 【keyword】
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
    return { branch: 'brackets', intro: intro.trim(), items, src };
  }

  // Branch B: ①②③
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
    return { branch: 'circled', intro: intro.trim(), items, src };
  }

  // Branch C: plain
  const applyMax = (text) =>
    maxLines
      ? text
          .split(/\n|\\n/)
          .filter(Boolean)
          .slice(0, maxLines)
          .join('\n')
      : text;
  const lines = applyMax(main)
    .split(/\n|\\n/)
    .filter(Boolean);
  return { branch: 'plain', lines, src };
}
```

---

## Step 2 — Refactor `DescBlock` in `src/components/JpDisplay.jsx`

1. Add `useMemo` to the React imports at the top
2. Add import for `parseDescStructure`:

```js
import { stripFuri, extractReadings, jpFontSize, parseDescStructure } from '../utils/jp-helpers.js';
```

3. Replace the entire `DescBlock` function body with:

```js
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
```

**Note:** `parseRubyFragments` calls within the render are still present for per-item text — but these are now operating on already-split strings (stable after the outer useMemo). For further optimization, `parseRubyFragments` could also be pre-computed in `parseDescStructure`, but this is sufficient for now.

---

## Step 3 — Memoize `JpFront` branch detection

In `JpFront`, the VS/・/：/→ detection re-runs every render. Add useMemo:

```js
export function JpFront({ jp = '', furi, furiganaPolicy = 'always', audioEnabled = true }) {
  const [tapReveal, setTapReveal] = useState(false);
  // ...existing state...
  const parsedRuby = useMemo(() => parseRubyFragments(jp), [jp]);

  // ADD: memoize the branch detection
  const jpBranch = useMemo(() => {
    const clean = stripFuri(jp);
    if (/\s*vs\s*/i.test(clean)) return 'vs';
    if (clean.includes('・') && !clean.includes('：') && clean.split('・').length >= 2) return 'bullet';
    if (clean.includes('：')) return 'colon';
    if (clean.includes('→')) return 'arrow';
    return 'plain';
  }, [jp]);

  // Use jpBranch in the render return to select the right branch.
  // The rest of the render logic stays the same — just use jpBranch as a switch condition.
```

If this refactor is too invasive, skip Step 3 and only do Steps 1-2. The DescBlock fix (Step 2) is the main win.

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.14`, update CHANGELOG + \_MAP.md, push

## Done when

- [ ] parseDescStructure extracted to jp-helpers.js
- [ ] DescBlock uses useMemo([desc, maxLines])
- [ ] JpFront branch detection memoized (optional but preferred)
- [ ] All existing tests pass; version 4.20.14
