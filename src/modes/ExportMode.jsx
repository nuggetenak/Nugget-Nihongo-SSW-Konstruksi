// ─── ExportMode — Export & Import progress data ──────────────────────────────
import { useState, useEffect, useRef } from "react";
import { T } from "../styles/theme.js";

const EXPORT_VERSION = 1;

// Collect all ssw-* keys from window.storage + ssw-onboarded from localStorage
async function collectData() {
  const data = {};
  try {
    const listed = await window.storage.list("ssw-");
    const keys = listed?.keys ?? [];
    for (const key of keys) {
      try {
        const item = await window.storage.get(key);
        if (item) data[key] = item.value; // already-stringified JSON
      } catch {}
    }
  } catch {}
  try {
    const v = localStorage.getItem("ssw-onboarded");
    if (v) data["__ls__ssw-onboarded"] = v;
  } catch {}
  return data;
}

// Restore all keys. window.storage values are raw JSON strings; __ls__ keys go to localStorage.
async function restoreData(data) {
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("__ls__")) {
      try { localStorage.setItem(key.replace("__ls__", ""), value); count++; } catch {}
    } else {
      try { await window.storage.set(key, value); count++; } catch {}
    }
  }
  return count;
}

export default function ExportMode({ onExit }) {
  const [summary, setSummary] = useState(null); // { keyCount, knownN, unknownN }
  const [status, setStatus] = useState(null);   // { type: "ok"|"err", msg: string }
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  // Load summary on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await collectData();
        const knownRaw = data["ssw-known"];
        const unknownRaw = data["ssw-unknown"];
        const known = knownRaw ? JSON.parse(knownRaw).length : 0;
        const unknown = unknownRaw ? JSON.parse(unknownRaw).length : 0;
        const keyCount = Object.keys(data).length;
        setSummary({ keyCount, known, unknown });
      } catch {
        setSummary({ keyCount: 0, known: 0, unknown: 0 });
      }
    })();
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setStatus(null);
    try {
      const data = await collectData();
      const bundle = {
        _meta: { version: EXPORT_VERSION, exported_at: new Date().toISOString(), app: "SSW Konstruksi" },
        data,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ssw-progress-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: "ok", msg: `✅ Ekspor berhasil! ${Object.keys(data).length} kunci tersimpan.` });
    } catch (e) {
      setStatus({ type: "err", msg: `❌ Ekspor gagal: ${e.message}` });
    }
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatus(null);
    try {
      const text = await file.text();
      const bundle = JSON.parse(text);
      if (!bundle?.data || typeof bundle.data !== "object") throw new Error("Format file tidak valid.");
      const count = await restoreData(bundle.data);
      setStatus({ type: "ok", msg: `✅ Import berhasil! ${count} kunci dipulihkan. Reload halaman untuk melihat perubahan.` });
      // Refresh summary
      const d = await collectData();
      const k = d["ssw-known"] ? JSON.parse(d["ssw-known"]).length : 0;
      const u = d["ssw-unknown"] ? JSON.parse(d["ssw-unknown"]).length : 0;
      setSummary({ keyCount: Object.keys(d).length, known: k, unknown: u });
    } catch (e) {
      setStatus({ type: "err", msg: `❌ Import gagal: ${e.message}` });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: "24px 16px", maxWidth: T.maxW, margin: "0 auto" }}>
      <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Kembali</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>💾 Ekspor & Impor</h2>
      <p style={{ fontSize: 12, color: T.textDim, marginBottom: 20, lineHeight: 1.6 }}>
        Simpan progress belajarmu ke file JSON, atau pulihkan dari backup sebelumnya.
      </p>

      {/* Current Data Summary */}
      <div style={{ padding: "16px", background: T.surface, borderRadius: T.r.lg, border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 10 }}>Data Tersimpan Saat Ini</div>
        {summary === null ? (
          <div style={{ fontSize: 12, color: T.textDim }}>Memuat...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
            {[
              { n: summary.keyCount, label: "Kunci Data",    icon: "🗂️" },
              { n: summary.known,    label: "Kartu Hafal",   icon: "✅" },
              { n: summary.unknown,  label: "Kartu Belum",   icon: "❌" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "10px 6px", background: T.bg, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.gold }}>{s.n}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        style={{
          width: "100%", padding: "14px", marginBottom: 12,
          fontFamily: "inherit", fontSize: 14, fontWeight: 700,
          borderRadius: T.r.md, border: "none", cursor: "pointer",
          background: T.accent, color: T.textBright,
          boxShadow: T.shadow.glow,
        }}
      >
        📤 Ekspor Progress ke File
      </button>

      {/* Import Button */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: "100%", padding: "14px", marginBottom: 20,
          fontFamily: "inherit", fontSize: 14, fontWeight: 700,
          borderRadius: T.r.md, border: `1px dashed ${T.borderLight}`,
          cursor: "pointer", textAlign: "center",
          background: T.surface, color: T.textMuted,
          boxSizing: "border-box",
        }}
      >
        {importing ? "⏳ Mengimpor..." : "📥 Impor Progress dari File"}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Status Message */}
      {status && (
        <div style={{
          padding: "12px 14px", borderRadius: T.r.md, fontSize: 13, lineHeight: 1.5,
          background: status.type === "ok" ? T.correctBg : T.wrongBg,
          border: `1px solid ${status.type === "ok" ? T.correctBorder : T.wrongBorder}`,
          color: status.type === "ok" ? T.correct : T.wrong,
        }}>
          {status.msg}
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: 24, padding: "12px 14px", background: T.surface, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>💡 Yang tersimpan:</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>
          <li>Kartu hafal / belum hafal</li>
          <li>Jawaban salah dari semua mode kuis</li>
          <li>Jalur belajar yang dipilih</li>
          <li>Kartu berbintang (jika ada)</li>
        </ul>
      </div>
    </div>
  );
}
