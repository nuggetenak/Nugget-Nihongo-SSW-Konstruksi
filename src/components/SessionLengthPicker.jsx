// ─── components/SessionLengthPicker.jsx ──────────────────────────────────────
// Item 80. `angka`, `jebak` and `mirip` had no length control at all — always
// the whole shuffled pool, with no way to take a short session. `kuis` and
// `dengar` had one, written twice, and QuizMode's "Semua" was a fourth option
// bolted on by storing the deck's own size as the count.
//
// One picker, and one preference behind it: the number here is
// `prefs.quizQuestionCount`, so a learner who prefers 20 gets 20 in every mode
// that asks rather than 10 again in each. "Semua" is the QUIZ_COUNT_ALL
// sentinel, not a pool size, so what persists is the choice that was made.
// ─────────────────────────────────────────────────────────────────────────────
import { QUIZ_COUNTS, QUIZ_COUNT_ALL, resolveQuizCount } from '../utils/constants.js';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import { pillStyle } from '../styles/pill.js';
import S from '../modes/modes.module.css';

/** Read the stored preference, resolved against what this pool can offer. */
export function storedQuizCount(total) {
  return resolveQuizCount(storageGet('prefs')?.quizQuestionCount, total);
}

export default function SessionLengthPicker({ total, value, onChange, label = 'Jumlah soal' }) {
  // A count larger than the pool is not a choice, it is the same session under
  // another name — offer it once, as "Semua".
  const options = [
    ...QUIZ_COUNTS.filter((n) => n < total).map((n) => ({ n, label: String(n) })),
    { n: QUIZ_COUNT_ALL, label: `Semua (${total})` },
  ];
  if (options.length < 2) return null;

  const pick = (n) => {
    const prefs = storageGet('prefs') ?? {};
    storageSet('prefs', { ...prefs, quizQuestionCount: n });
    onChange(resolveQuizCount(n, total));
  };

  return (
    <div style={{ marginBottom: 'var(--space-12)' }}>
      <div className={S.sectionLabel}>{label}</div>
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        {options.map((o) => (
          <button
            key={o.n}
            type="button"
            onClick={() => pick(o.n)}
            aria-pressed={value === resolveQuizCount(o.n, total)}
            style={pillStyle(value === resolveQuizCount(o.n, total))}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
