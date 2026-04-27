// ─── Shared Display Components: JpFront & DescBlock ─────────────────────
// These render Japanese text with adaptive font sizing and structured descriptions.
// Used by FlashcardMode, QuizMode, SearchMode, GlossaryMode, etc.
// ───────────────────────────────────────────────────────────────────────

import { stripFuri, extractReadings, hasJapanese, jpFontSize } from "../utils/jp-helpers.js";
import { T } from "../styles/theme.js";

function JpFront({ text }) {
  const clean = stripFuri(text);
  const baseFs = jpFontSize(clean);
  const IS = { lineHeight: 1.4, textAlign: "center", wordBreak: "break-word", fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif", fontWeight: 700 };
  const HR = { width: 44, height: 1, background: "rgba(255,255,255,0.18)", margin: "4px auto" };

  // ── A vs B (handles "Avs B", "A vs B", "AvS B") ──
  const VS_RE = /\s*vs\s*/i;
  if (VS_RE.test(clean)) {
    const parts = clean.split(VS_RE).map(p => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a,b) => a.length > b.length ? a : b));
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            {i > 0 && <div style={{ fontSize: Math.round(fs*0.5), color:"#fda085", fontWeight:900, letterSpacing:4, opacity:0.85 }}>VS</div>}
            <span style={{ ...IS, fontSize: fs }}>{p.trim()}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── A・B・C ──
  if (clean.includes("・") && !clean.includes("：")) {
    const parts = clean.split("・").map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const fs = jpFontSize(parts.reduce((a,b) => a.length > b.length ? a : b));
      return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          {parts.map((p, i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              {i > 0 && <div style={HR} />}
              <span style={{ ...IS, fontSize: fs }}>{p}</span>
            </div>
          ))}
        </div>
      );
    }
  }

  // ── Title：Subtitle ──
  if (clean.includes("：")) {
    const idx = clean.indexOf("：");
    const title = clean.slice(0, idx).trim();
    const sub   = clean.slice(idx + 1).trim();
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
        <span style={{ ...IS, fontSize: jpFontSize(title) }}>{title}</span>
        <div style={{ ...HR, background:"rgba(147,197,253,0.35)" }} />
        <span style={{ ...IS, fontSize: jpFontSize(sub), opacity:0.88 }}>{sub}</span>
      </div>
    );
  }

  // ── A → B → C ──
  if (clean.includes("→")) {
    const parts = clean.split("→").map(p => p.trim()).filter(Boolean);
    const fs = jpFontSize(parts.reduce((a,b) => a.length > b.length ? a : b));
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
        {parts.map((p, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            {i > 0 && <span style={{ fontSize:12, color:"#93c5fd", opacity:0.65, lineHeight:1 }}>↓</span>}
            <span style={{ ...IS, fontSize: fs }}>{p}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── plain ──
  return <span style={{ ...IS, fontSize: baseFs, letterSpacing: clean.length > 15 ? 0 : 2 }}>{clean}</span>;
}

// ─── Smart desc renderer: ①②③ lists, 【keyword】 lists, (Sumber) footnote ──────
function DescBlock({ text }) {
  if (!text) return null;
  const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮";
  const blockStyle = { fontSize:12, lineHeight:1.7, textAlign:"left" };

  // Strip (Sumber:...) footnote — shared across all branches
  const srcRe = /\s*\([^)]*Sumber[^)]*\)\s*$/;
  const srcMatch = text.match(srcRe);
  const main = srcMatch ? text.slice(0, srcMatch.index).trim() : text.trim();
  const src  = srcMatch ? srcMatch[0].trim() : null;
  const Footnote = () => src ? <div style={{ marginTop:5, fontSize:10, opacity:0.38, fontStyle:"italic" }}>{src}</div> : null;

  // ── Branch A: 【keyword】 list (2+ brackets) ──────────────────────────────
  const bracketMatches = [...main.matchAll(/【([^】]+)】/g)];
  if (bracketMatches.length >= 2) {
    // Split into labeled segments
    const parts = main.split(/(【[^】]+】)/);
    const items = []; let intro = "";
    let label = null;
    for (const p of parts) {
      const lm = p.match(/^【([^】]+)】$/);
      if (lm) { label = lm[1]; }
      else if (label !== null) { items.push({ label, body: p.trim() }); label = null; }
      else { intro += p; }
    }
    return (
      <div style={blockStyle}>
        {intro.trim() && <div style={{ marginBottom:6, opacity:0.85 }}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
            <span style={{ color:"#fda085", fontWeight:700, flexShrink:0, whiteSpace:"nowrap", lineHeight:1.7,
              background:"rgba(253,160,133,0.12)", border:"1px solid rgba(253,160,133,0.3)",
              borderRadius:5, padding:"0px 5px", fontSize:11 }}>【{item.label}】</span>
            <span style={{ opacity:0.92 }}>{item.body}</span>
          </div>
        ))}
        <Footnote />
      </div>
    );
  }

  // ── Branch B: ①②③ circled-number list ──────────────────────────────────
  const hasCircled = [...CIRCLED].some(c => main.includes(c));
  if (hasCircled) {
    // Index map for sequence checking: ① = 1, ② = 2, …
    const CIDX = Object.fromEntries([...CIRCLED].map((c, i) => [c, i + 1]));
    const tokens = main.split(/(①|②|③|④|⑤|⑥|⑦|⑧|⑨|⑩|⑪|⑫|⑬|⑭|⑮)/);
    const items = []; let intro = ""; let cur = null; let lastIdx = 0;
    for (const t of tokens) {
      if (t.length === 1 && CIRCLED.includes(t)) {
        const tIdx = CIDX[t];
        // List marker only if index is strictly ascending (back-refs like ①②③ inside ④ are inline)
        if (tIdx > lastIdx) {
          if (cur) items.push(cur);
          cur = { num: t, body: "" };
          lastIdx = tIdx;
        } else {
          if (cur) cur.body += t; else intro += t;
        }
      } else if (cur) { cur.body += t; }
      else { intro += t; }
    }
    if (cur) items.push(cur);
    return (
      <div style={blockStyle}>
        {intro.trim() && <div style={{ marginBottom:6, opacity:0.85 }}>{intro.trim()}</div>}
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", gap:8, marginBottom:5, alignItems:"flex-start" }}>
            <span style={{ color:"#fda085", fontWeight:700, flexShrink:0, minWidth:16, lineHeight:1.7 }}>{item.num}</span>
            <span style={{ opacity:0.92 }}>{item.body.trim()}</span>
          </div>
        ))}
        <Footnote />
      </div>
    );
  }

  // ── Branch C: plain text ─────────────────────────────────────────────────
  return (
    <div style={blockStyle}>
      <span style={{ opacity:0.92 }}>{main}</span>
      <Footnote />
    </div>
  );
}
// ─── SECTION → MODE MAPPING (for tab restore on reload) ──────────────────────
const SECTION_FOR_MODE = {
  kartu: "belajar", kuis: "belajar", sprint: "belajar", fokus: "belajar",
  jac: "ujian", simulasi: "ujian", jebak: "ujian", wayground: "ujian",
  glos: "referensi", angka: "referensi", cari: "referensi", sumber: "referensi",
  stats: "progres",
};

export { JpFront, DescBlock };
