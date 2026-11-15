// ─── components/TrackSwitcherModal.jsx ─────────────────────────────────────────
// Modal bottom sheet allowing users to switch between SSW tracks:
// ⚡ Lifeline (ライフライン設備) and 🏗️ Kenchiku (建築 - Gedung).
// ─────────────────────────────────────────────────────────────────────────────

import Sheet from './Sheet.jsx';
import { T } from '../styles/theme.js';
import s from './TrackSwitcherModal.module.css';

export default function TrackSwitcherModal({ isOpen, onClose, currentTrack, onSelectTrack }) {
  if (!isOpen) return null;

  const tracks = [
    {
      key: 'lifeline',
      icon: '⚡',
      title: 'Lifeline (ライフライン設備)',
      tag: 'Pipa · Listrik · AC · Telekomunikasi · Pemadam',
      desc: 'Instalasi utilitas & MEP gedung: kelistrikan, perpipaan, HVAC, jaringan, dan keselamatan pemadam.',
      badge: '40 Set Soal · 95 Soal Resmi',
      accentColor: T.track.lifeline.color,
    },
    {
      key: 'kenchiku',
      icon: '🏗️',
      title: 'Kenchiku (建築 - Gedung)',
      tag: 'Perancah · Rebar · Bekisting · Beton · Interior · Plester · Waterproofing',
      desc: 'Pekerjaan struktur dan finishing gedung: tobi (足場), tekkin (鉄筋), katawaku (型枠), pompa beton (圧送), naisou, sakan, dan bousui.',
      badge: '28 Set Soal · 95 Soal Resmi',
      accentColor: T.track.kenchiku.color,
    },
  ];

  return (
    <Sheet onClose={onClose} labelledBy="track-switcher-title">
      <div className={s.content}>
        <div className={s.header}>
          <h2 id="track-switcher-title" className={s.title}>
            Pilih Jalur SSW Konstruksi
          </h2>
          <p className={s.subtitle}>
            Materi kuis, contoh soal ujian resmi, dan kartu hafalan disesuaikan dengan jalur yang
            kamu pilih.
          </p>
        </div>

        <div className={s.list}>
          {tracks.map((t) => {
            const isSelected = currentTrack === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={s.trackCard}
                data-selected={isSelected}
                style={{
                  borderColor: isSelected ? t.accentColor : undefined,
                  boxShadow: isSelected ? `0 0 0 1px ${t.accentColor}` : undefined,
                }}
                onClick={() => {
                  onSelectTrack(t.key);
                  onClose();
                }}
              >
                <div className={s.cardTop}>
                  <span className={s.trackIcon}>{t.icon}</span>
                  <div className={s.cardTitleWrap}>
                    <div className={s.trackName}>{t.title}</div>
                    <div className={s.trackTag}>{t.tag}</div>
                  </div>
                  {isSelected && <span className={s.activeBadge}>Aktif ✓</span>}
                </div>
                <div className={s.trackDesc}>{t.desc}</div>
                <div className={s.trackMeta}>
                  <span className={s.metaBadge}>{t.badge}</span>
                </div>
              </button>
            );
          })}
        </div>

        <button type="button" className={s.closeBtn} onClick={onClose}>
          Tutup
        </button>
      </div>
    </Sheet>
  );
}
