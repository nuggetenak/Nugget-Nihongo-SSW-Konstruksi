import { useEffect, useRef } from 'react';
import { CARDS } from '../data/cards.js';
import { SOURCE_GROUPS, SOURCE_META } from '../data/categories.js';
import { MODE_SECTIONS, MODE_META } from '../router/modes.js';
import { RELEASE_NOTES } from '../data/release-notes.js';
import {
  ABOUT_EXAM,
  ABOUT_SRS,
  ABOUT_PRIVACY,
  ABOUT_CREDITS,
  ABOUT_FAQ,
} from '../data/about-content.js';
import { useApp } from '../contexts/AppContext.jsx';
import { formatCount } from '../utils/format.js';
import Icon from '../components/Icon.jsx';
import S from './modes.module.css';
import T from './TentangMode.module.css';

// ─── TentangMode ──────────────────────────────────────────────────────────────
// One screen, not two. "What is this app" and "what changed in it" are the same
// question asked twice, they share a version string and an audience, and a
// MODE_META entry carries a real per-mode cost (generated icon art, a skeleton
// shape, a strand exclusion, an <h1> that must not ellipsise at 320px). The
// "Baru" badge also needs exactly one home.
//
// The menu guide and the source credits are generated from MODE_SECTIONS +
// MODE_META and SOURCE_GROUPS + SOURCE_META rather than retyped, so they cannot
// drift from the registries that already describe every mode and source.
// ──────────────────────────────────────────────────────────────────────────────

function Section({ id, icon, title, open = false, children, innerRef }) {
  return (
    <details className={T.section} open={open} ref={innerRef} id={id}>
      <summary className={T.summary}>
        <span aria-hidden="true">{icon}</span> {title}
      </summary>
      <div className={T.body}>{children}</div>
    </details>
  );
}

function ReleaseEntry({ entry }) {
  return (
    <div className={T.release}>
      <div className={T.releaseHead}>
        <span className={T.releaseVersion}>v{entry.version}</span>
        {entry.date && (
          <span className={T.releaseDate}>
            {new Date(entry.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
      <div className={T.releaseTitle}>{entry.title}</div>
      <ul className={T.list}>
        {entry.changes.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TentangMode({ onNavigate, section = null }) {
  const { setPref } = useApp();
  const baruRef = useRef(null);

  // Opening the screen is seeing the notes: "Yang baru" is the one section open
  // by default, so stamping here is honest rather than merely convenient.
  useEffect(() => {
    setPref('lastSeenVersion', __APP_VERSION__);
  }, [setPref]);

  useEffect(() => {
    if (section === 'baru') baruRef.current?.scrollIntoView({ block: 'start' });
  }, [section]);

  const [newest, ...older] = RELEASE_NOTES;

  return (
    <div className={`${S.page} ${S.pageTight}`}>
      <p className={T.identity}>
        SSW Konstruksi <strong>v{__APP_VERSION__}</strong> · {formatCount(CARDS.length)} kartu ·
        Lifeline (ライフライン設備) · by Nugget Nihongo 🏗️
      </p>

      <Section id="baru" icon="🆕" title="Yang baru" open innerRef={baruRef}>
        <ReleaseEntry entry={newest} />
        <details className={T.nested}>
          <summary className={T.nestedSummary}>Rilis sebelumnya</summary>
          <div className={T.body}>
            {older.map((r) => (
              <ReleaseEntry key={r.version} entry={r} />
            ))}
          </div>
        </details>
      </Section>

      <Section icon={ABOUT_EXAM.icon} title={ABOUT_EXAM.title}>
        {ABOUT_EXAM.paras.map((p, i) => (
          <p key={i} className={T.para}>
            {p}
          </p>
        ))}
      </Section>

      <Section icon="🧭" title="Panduan tiap menu">
        {Object.entries(MODE_SECTIONS).map(([key, sec]) => (
          <div key={key}>
            <div className={S.sectionLabel}>{sec.title}</div>
            <div className={T.menuGrid}>
              {sec.modes.map((m) => {
                const meta = MODE_META[m];
                if (!meta) return null;
                return (
                  <button key={m} className={T.menuRow} onClick={() => onNavigate(m)}>
                    <Icon name={meta.ui} size={20} />
                    <span className={T.menuText}>
                      <span className={T.menuLabel}>{meta.label}</span>
                      <span className={T.menuDesc}>{meta.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Section icon={ABOUT_SRS.icon} title={ABOUT_SRS.title}>
        {ABOUT_SRS.paras.map((p, i) => (
          <p key={i} className={T.para}>
            {p}
          </p>
        ))}
        <button className={S.btnItem} onClick={() => onNavigate('ulasan')}>
          🔁 Buka Ulasan SRS
        </button>
      </Section>

      <Section icon="❓" title="Pertanyaan umum">
        {ABOUT_FAQ.map((f, i) => (
          <details key={i} className={T.nested}>
            <summary className={T.nestedSummary}>{f.q}</summary>
            <p className={T.para}>{f.a}</p>
          </details>
        ))}
      </Section>

      <Section icon={ABOUT_CREDITS.icon} title={ABOUT_CREDITS.title}>
        <p className={T.para}>{ABOUT_CREDITS.intro}</p>
        {SOURCE_GROUPS.map((g) => (
          <div key={g.label}>
            <div className={S.sectionLabel}>{g.label}</div>
            <ul className={T.list}>
              {g.keys.map((k) => (
                <li key={k}>
                  <span aria-hidden="true">{SOURCE_META[k]?.emoji ?? '📄'}</span>{' '}
                  {SOURCE_META[k]?.label ?? k}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className={T.note}>{ABOUT_CREDITS.note}</p>
        <button className={S.btnItem} onClick={() => onNavigate('sumber')}>
          📂 Belajar per sumber
        </button>
      </Section>

      <Section icon={ABOUT_PRIVACY.icon} title={ABOUT_PRIVACY.title}>
        {ABOUT_PRIVACY.paras.map((p, i) => (
          <p key={i} className={T.para}>
            {p}
          </p>
        ))}
        {/* The one section with a real cost attached, so it links to the fix
            rather than only describing it. */}
        <button className={S.btnItem} onClick={() => onNavigate('ekspor')}>
          💾 Cadangkan progres sekarang
        </button>
      </Section>
    </div>
  );
}
