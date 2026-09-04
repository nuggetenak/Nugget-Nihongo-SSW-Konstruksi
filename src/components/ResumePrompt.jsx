// ─── ResumePrompt.jsx ─────────────────────────────────────────────────────────
// "Lanjutkan sesi sebelumnya?" — offered on a mode's start screen when
// useQuizResume finds a snapshot. One component rather than one copy per mode:
// four modes offer this now, and the point of the prompt is that it looks and
// reads the same wherever a session can be picked back up.
import s from './ResumePrompt.module.css';

export default function ResumePrompt({
  title = 'Lanjutkan sesi sebelumnya?',
  detail,
  resumeLabel = 'Lanjutkan',
  onResume,
  onDiscard,
}) {
  return (
    <div className={s.card}>
      <div className={s.title}>{title}</div>
      {detail && <div className={s.detail}>{detail}</div>}
      <div className={s.actions}>
        <button className={s.primary} onClick={onResume}>
          {resumeLabel}
        </button>
        <button className={s.secondary} onClick={onDiscard}>
          Mulai Baru
        </button>
      </div>
    </div>
  );
}
