// ─── components/SayaTab.jsx ───────────────────────────────────────────────────
// "Saya" tab — personal hub.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useMemo } from 'react';
import s from './SayaTab.module.css';
import { CARDS } from '../data/cards.js';
import { exportAll, importAllSafe, resetAll, get as storageGet } from '../storage/engine.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import { useConfirm } from './ConfirmDialog.jsx';
import ProgressRing from './ProgressRing.jsx';
import { buildAchievementState, evaluateAchievements } from '../utils/achievements.js';
import { useDailyChallenge } from '../hooks/useDailyChallenge.js';
import { todayStr } from '../utils/date.js';
import { formatCount } from '../utils/format.js';
import { JpFront, renderJPWithRuby, parseRubyFragments } from './JpDisplay.jsx';
import { stripFuri } from '../utils/jp-helpers.js';

const TRACK_LABELS = {
  lifeline: '⚡ Lifeline · ライフライン',
};

function Row({ label, value, sub, onClick, danger = false }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={s.row}
      data-clickable={!!onClick}
      onClick={onClick}
    >
      <div>
        <div className={s.rowLabel} data-danger={danger}>
          {label}
        </div>
        {sub && <div className={s.rowSub}>{sub}</div>}
      </div>
      {value !== undefined && (
        <div className={s.rowValue}>
          {value}
          {onClick && <span className={s.rowChevron}>›</span>}
        </div>
      )}
    </Tag>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className={s.sectionLabel}>{title}</div>
      <div className={s.sectionBody}>{children}</div>
    </div>
  );
}

export default function SayaTab() {
  const {
    track,
    setTrack,
    isDark,
    toggleTheme,
    toast,
    goMode,
    dailyGoal,
    setDailyGoal,
    setPref,
    prefs,
  } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const confirm = useConfirm();
  const { known, unknown, streakData, sessions, jacScores } = useProgress();
  const srs = useSRSContext();

  const total = CARDS.length;
  const knownN = known.size;
  const streak = streakData?.days ?? 0;

  const mature = srs.stats?.mature ?? 0;
  const young = srs.stats?.young ?? 0;
  const newCards = srs.stats?.new ?? 0;

  // Achievements
  const achievements = useMemo(() => {
    const state = buildAchievementState({ known, streakData, sessions, srs, jacScores });
    return evaluateAchievements(state);
  }, [known, streakData, sessions, srs, jacScores]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Daily Challenge
  const today = todayStr();
  const {
    question: dailyChallengeQ,
    answered: dcAnswered,
    submit: submitChallenge,
  } = useDailyChallenge();

  // Inline edit states — replaces prompt() for mobile Android compatibility.
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [editingExam, setEditingExam] = useState(false);
  const [examDraft, setExamDraft] = useState('');

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }, [installPrompt]);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssw-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('💾 Progress berhasil diekspor');
    } catch {
      toast.show('❌ Gagal ekspor');
    }
  }, [toast]);

  // item 15: was a tap→confirm→3s-countdown→tap machine (four renders of one
  // button, easy to mis-tap through without reading any of them). One real
  // dialog instead, with the actual numbers at stake and export offered as
  // the alternative to proceeding, per the plan's "last line of defence"
  // framing for an app whose data lives only in localStorage.
  const handleReset = useCallback(async () => {
    const notesCount = Object.keys(storageGet('prefs')?.notes ?? {}).filter(
      (id) => storageGet('prefs')?.notes?.[id]
    ).length;
    const parts = [];
    if (known.size > 0) parts.push(`${known.size} kartu hafal`);
    if (streakData?.days > 0) parts.push(`${streakData.days} hari streak`);
    if (notesCount > 0) parts.push(`${notesCount} catatan`);
    const lossLine = parts.length > 0 ? `${parts.join(', ')} akan hilang, dan k` : 'K';

    const ok = await confirm(
      `${lossLine}amu akan mulai dari awal lagi (termasuk pengaturan awal). Ini tidak bisa dibatalkan.`,
      'Reset semua',
      'Batal',
      { label: 'Cadangkan data dulu →', onClick: handleExport }
    );
    if (!ok) return;
    resetAll();
    toast.show('🗑️ Semua data telah direset');
  }, [confirm, known, streakData, handleExport, toast]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          importAllSafe(parsed);
          toast.show('📥 Progress diimpor — muat ulang halaman');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          toast.show(`❌ ${err.message ?? 'File tidak valid'}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [toast]);

  return (
    <div className={s.container}>
      <h1 className={s.pageTitle}>Saya</h1>

      {/* PWA install prompt */}
      {installPrompt && !installed && (
        <button className={s.installCard} onClick={handleInstall}>
          <span className={s.installIcon}>📲</span>
          <span className={s.installBody}>
            <span className={s.installLabel}>Install App</span>
            <span className={s.installSub}>Akses lebih cepat, bisa offline</span>
          </span>
          <span className={s.installArrow}>›</span>
        </button>
      )}

      {/* Progress card */}
      <div className={s.progressCard}>
        <ProgressRing current={knownN} total={total} size={100} stroke={8} />
        <div className={s.progressInfo}>
          <div className={s.progressKnown}>{knownN} kartu hafal</div>
          <div className={s.progressDetail}>
            {unknown.size} belum · {total - knownN - unknown.size} sisa
          </div>
          {streak > 0 && <div className={s.progressStreak}>🔥 {streak} hari berturut-turut</div>}
        </div>
      </div>

      {/* Daily Challenge */}
      {dailyChallengeQ && (
        <Section title={`🗓️ Soal Hari Ini · ${today}`}>
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--ssw-surface)',
              borderRadius: 12,
              border: '1px solid var(--ssw-border)',
            }}
          >
            {dcAnswered ? (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: dcAnswered.correct ? 'var(--ssw-correct)' : 'var(--ssw-wrong)',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {dcAnswered.correct ? '✅ Benar!' : '❌ Salah'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ssw-textMuted)', lineHeight: 1.5 }}>
                  <JpFront jp={dailyChallengeQ.jp} furiganaPolicy={furiganaPolicy} />
                </div>
                {dailyChallengeQ.explanation &&
                  (() => {
                    const clean = stripFuri(dailyChallengeQ.explanation);
                    return (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--ssw-textDim)',
                          marginTop: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        💡 {clean.slice(0, 120)}
                        {clean.length > 120 ? '…' : ''}
                      </div>
                    );
                  })()}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 10,
                    lineHeight: 1.5,
                    color: 'var(--ssw-text)',
                  }}
                >
                  <JpFront jp={dailyChallengeQ.jp} furiganaPolicy={furiganaPolicy} />
                </div>
                {dailyChallengeQ.id_text && (
                  <div style={{ fontSize: 11, color: 'var(--ssw-textDim)', marginBottom: 10 }}>
                    {renderJPWithRuby(dailyChallengeQ.id_text, parseRubyFragments(dailyChallengeQ.id_text))}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dailyChallengeQ.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        submitChallenge(i, dailyChallengeQ.answer);
                        toast.show(
                          i === dailyChallengeQ.answer
                            ? '✅ Benar! Hebat!'
                            : '❌ Salah — coba lagi besok'
                        );
                      }}
                      disabled={dcAnswered !== null}
                      style={{
                        padding: '8px 12px',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        borderRadius: 8,
                        cursor: dcAnswered !== null ? 'default' : 'pointer',
                        textAlign: 'left',
                        border: `1px solid ${dcAnswered !== null ? (i === dailyChallengeQ.answer ? 'var(--ssw-correctBorder)' : i === dcAnswered.selected ? 'var(--ssw-wrongBorder)' : 'var(--ssw-border)') : 'var(--ssw-border)'}`,
                        background:
                          dcAnswered !== null
                            ? i === dailyChallengeQ.answer
                              ? 'var(--ssw-correctBg)'
                              : i === dcAnswered.selected
                                ? 'var(--ssw-wrongBg)'
                                : 'var(--ssw-surface)'
                            : 'var(--ssw-surface)',
                        color:
                          dcAnswered !== null
                            ? i === dailyChallengeQ.answer
                              ? 'var(--ssw-correct)'
                              : i === dcAnswered.selected
                                ? 'var(--ssw-wrong)'
                                : 'var(--ssw-textDim)'
                            : 'var(--ssw-text)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Achievement Badges */}
      <Section title={`🏅 Pencapaian (${unlockedCount}/${achievements.length})`}>
        <div className={s.achievementGrid}>
          {achievements.map((a) => (
            <div
              key={a.id}
              title={`${a.label}: ${a.desc}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 4px',
                borderRadius: 10,
                border: `1px solid ${a.unlocked ? 'var(--ssw-borderLight)' : 'var(--ssw-border)'}`,
                background: a.unlocked ? 'var(--ssw-surfaceHover)' : 'var(--ssw-surface)',
                opacity: a.unlocked ? 1 : 0.35,
                cursor: 'default',
                textAlign: 'center',
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}icons/badges/${a.badge}`}
                alt=""
                aria-hidden="true"
                width="34"
                height="34"
                style={{ display: 'block', filter: a.unlocked ? 'none' : 'grayscale(1)' }}
              />
              <div
                style={{
                  fontSize: 9,
                  color: a.unlocked ? 'var(--ssw-textMuted)' : 'var(--ssw-textFaint)',
                  lineHeight: 1.3,
                  fontWeight: a.unlocked ? 700 : 400,
                }}
              >
                {a.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="SRS">
        <Row label="Matang" value={mature} sub="Interval ≥ 21 hari" />
        <Row label="Muda" value={young} sub="Interval < 21 hari" />
        <Row label="Baru" value={newCards} sub="Belum pernah diulang" />
        {srs.dueCount > 0 && (
          <Row label="Jatuh tempo hari ini" value={srs.dueCount} sub="Siap diulang sekarang" />
        )}
      </Section>

      <Section title="Pengaturan">
        <Row
          label="Jalur Belajar"
          value={TRACK_LABELS[track] ?? track}
          sub="Tap untuk ganti"
          onClick={() => setTrack(null)}
        />
        <Row label="Tema" value={isDark ? '🌙 Gelap' : '☀️ Terang'} onClick={toggleTheme} />
        {editingGoal ? (
          <div className={s.inlineEdit}>
            <label className={s.inlineEditLabel} htmlFor="saya-daily-goal">
              Target kartu per hari (1–200)
            </label>
            <div className={s.inlineEditRow}>
              <input
                id="saya-daily-goal"
                type="number"
                min="1"
                max="200"
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                className={s.inlineInput}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const n = parseInt(goalDraft, 10);
                    if (n > 0 && n <= 200) {
                      setDailyGoal(n);
                      toast.show(`✅ Target: ${n} kartu/hari`);
                    }
                    setEditingGoal(false);
                  }
                  if (e.key === 'Escape') setEditingGoal(false);
                }}
              />
              <button
                className={s.inlineSave}
                onClick={() => {
                  const n = parseInt(goalDraft, 10);
                  if (n > 0 && n <= 200) {
                    setDailyGoal(n);
                    toast.show(`✅ Target: ${n} kartu/hari`);
                  }
                  setEditingGoal(false);
                }}
              >
                Simpan
              </button>
              <button className={s.inlineCancel} onClick={() => setEditingGoal(false)}>
                Batal
              </button>
            </div>
          </div>
        ) : (
          <Row
            label="Target Harian"
            value={dailyGoal ? `${dailyGoal} kartu` : '20 kartu'}
            sub="Tap untuk ubah"
            onClick={() => {
              setGoalDraft(String(dailyGoal ?? 20));
              setEditingGoal(true);
            }}
          />
        )}
        {editingExam ? (
          <div className={s.inlineEdit}>
            <label className={s.inlineEditLabel} htmlFor="saya-exam-date">
              Tanggal ujian
            </label>
            <div className={s.inlineEditRow}>
              <input
                id="saya-exam-date"
                type="date"
                value={examDraft}
                onChange={(e) => setExamDraft(e.target.value)}
                className={s.inlineInput}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditingExam(false);
                }}
              />
              <button
                className={s.inlineSave}
                onClick={() => {
                  if (examDraft) {
                    setPref('examDate', examDraft);
                    toast.show('📅 Tanggal ujian disimpan');
                  }
                  setEditingExam(false);
                }}
              >
                Simpan
              </button>
              {prefs?.examDate && (
                <button
                  className={s.inlineDelete}
                  onClick={() => {
                    setPref('examDate', null);
                    setEditingExam(false);
                    toast.show('📅 Tanggal ujian dihapus');
                  }}
                >
                  Hapus
                </button>
              )}
              <button className={s.inlineCancel} onClick={() => setEditingExam(false)}>
                Batal
              </button>
            </div>
          </div>
        ) : (
          <Row
            label="📅 Tanggal Ujian"
            value={
              prefs?.examDate
                ? new Date(prefs.examDate).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Belum diatur'
            }
            sub={
              prefs?.examDate ? 'Tap untuk ubah atau hapus' : 'Set untuk lihat countdown di Beranda'
            }
            onClick={() => {
              setExamDraft(prefs?.examDate ?? '');
              setEditingExam(true);
            }}
          />
        )}
        <Row
          label="🔊 Audio Bahasa Jepang"
          value={prefs?.audioEnabled !== false ? '✅ Aktif' : '⬜ Mati'}
          sub="Web Speech API — tombol 🔊 di kartu"
          onClick={() => setPref('audioEnabled', !(prefs?.audioEnabled !== false))}
        />
        {prefs?.audioEnabled !== false && (
          <Row
            label="🔊 Kapan Bicara (Ulasan)"
            value={prefs?.speakOnFlip === true ? '👆 Saat balik kartu' : '➡️ Saat kartu berikutnya'}
            sub={
              prefs?.speakOnFlip === true
                ? 'Audio diputar saat kartu dibalik'
                : 'Audio diputar saat pindah ke kartu baru'
            }
            onClick={() => {
              const next = !(prefs?.speakOnFlip === true);
              setPref('speakOnFlip', next);
              toast.show(next ? '👆 Audio saat balik kartu' : '➡️ Audio saat kartu berikutnya');
            }}
          />
        )}
        <Row
          label="ふ Furigana di Kartu"
          value={
            prefs?.furiganaPolicy === 'hidden'
              ? '⬜ Tersembunyi'
              : prefs?.furiganaPolicy === 'tap'
                ? '👆 Tap untuk lihat'
                : '✅ Selalu tampil'
          }
          sub={
            prefs?.furiganaPolicy === 'hidden'
              ? 'Hanya kanji — level lanjut'
              : prefs?.furiganaPolicy === 'tap'
                ? 'Tap kartu untuk tampilkan furigana'
                : 'Furigana selalu terlihat (default)'
          }
          onClick={() => {
            const cur = prefs?.furiganaPolicy ?? 'always';
            const next = cur === 'always' ? 'tap' : cur === 'tap' ? 'hidden' : 'always';
            setPref('furiganaPolicy', next);
            toast.show(
              next === 'always'
                ? '✅ Furigana selalu tampil'
                : next === 'hidden'
                  ? '⬜ Furigana disembunyikan'
                  : '👆 Furigana tap-to-reveal'
            );
          }}
        />
      </Section>

      <Section title="Data">
        <Row label="💾 Ekspor Progress" sub="Unduh file JSON cadangan" onClick={handleExport} />
        <Row label="📥 Impor Progress" sub="Pulihkan dari file JSON" onClick={handleImport} />
        <Row
          label="🗑️ Reset Semua Data"
          sub="Hapus semua progress — tidak bisa dibatalkan"
          onClick={handleReset}
          danger
        />
      </Section>

      <Section title="Info">
        <Row label="📂 Sumber Materi" sub="Per PDF sumber" onClick={() => goMode('sumber')} />
        <Row
          label="ℹ️ Tentang Aplikasi"
          sub={`${formatCount(total)} kartu · 3 jalur · FSRS SRS · SSW Konstruksi v${__APP_VERSION__}`}
          onClick={() =>
            toast.show(
              `SSW Konstruksi v${__APP_VERSION__} · ${formatCount(total)} kartu · FSRS · by Nugget Nihongo 🏗️`
            )
          }
        />
      </Section>

      <div className={s.footer}>
        SSW Konstruksi v{__APP_VERSION__}
        <br />
        by Nugget Nihongo
        <br />
        土木 · 建築 · ライフライン設備
      </div>
    </div>
  );
}
