// ─── EmptyState.jsx ───────────────────────────────────────────────────────────
// Generic empty state + 5 named presets from Blueprint B10.
//
// Usage:
//   <EmptyState.NoReviews onCta={() => goMode('kartu')} />
//   <EmptyState.NoWrong onCta={() => goMode('kuis')} />
//   <EmptyState.SearchEmpty query={q} />
//   <EmptyState.NoStarred onCta={() => goMode('kartu')} />
//   <EmptyState.NoProgress onCta={() => goMode('kartu')} />
//   <EmptyState icon="📭" title="..." desc="..." ctaLabel="..." onCta={fn} />
// ─────────────────────────────────────────────────────────────────────────────

import S from './EmptyState.module.css';

export default function EmptyState({ icon = '📭', title, desc, ctaLabel, onCta, style = {} }) {
  return (
    <div className={S.wrap} style={style} role="status" aria-live="polite">
      <div className={S.icon} aria-hidden="true">{icon}</div>
      <div className={S.title}>{title}</div>
      {desc && (
        <div className={`${S.desc}${onCta ? '' : ' ' + S.descNoBtn}`}>{desc}</div>
      )}
      {onCta && (
        <button className={S.cta} onClick={onCta} aria-label={ctaLabel}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// ── Named presets (Blueprint B10) ────────────────────────────────────────────

EmptyState.NoReviews = function NoReviews({ onCta }) {
  return (
    <EmptyState
      icon="🎉"
      title="Tidak ada kartu jatuh tempo"
      desc="Kamu up to date! Datang lagi besok untuk sesi ulasan berikutnya."
      ctaLabel="Pelajari kartu baru →"
      onCta={onCta}
    />
  );
};

EmptyState.NoWrong = function NoWrong({ onCta }) {
  return (
    <EmptyState
      icon="💯"
      title="Belum ada jawaban salah"
      desc="Terus belajar! Jawaban salah akan muncul di sini untuk dilatih ulang."
      ctaLabel="Coba Kuis →"
      onCta={onCta}
    />
  );
};

EmptyState.SearchEmpty = function SearchEmpty({ query, onCta }) {
  return (
    <EmptyState
      icon="🔍"
      title={`Tidak ditemukan untuk "${query}"`}
      desc="Coba kata kunci lain, atau periksa ejaan kamu."
      ctaLabel={onCta ? 'Hapus pencarian' : undefined}
      onCta={onCta}
    />
  );
};

EmptyState.NoStarred = function NoStarred({ onCta }) {
  return (
    <EmptyState
      icon="⭐"
      title="Belum ada kartu favorit"
      desc={'Tap ★ di mode Kartu untuk menandai kartu yang ingin kamu ingat.'}
      ctaLabel="Buka Kartu →"
      onCta={onCta}
    />
  );
};

EmptyState.NoProgress = function NoProgress({ onCta }) {
  return (
    <EmptyState
      icon="🌱"
      title="Mulai perjalananmu!"
      desc="Buka kartu pertamamu dan tandai yang sudah kamu hafal."
      ctaLabel="Mulai →"
      onCta={onCta}
    />
  );
};
