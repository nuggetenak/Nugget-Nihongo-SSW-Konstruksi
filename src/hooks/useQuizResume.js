// ─── useQuizResume.js ─────────────────────────────────────────────────────────
// The caller side of item 51's quiz persistence, shared.
//
// QuizShell has been able to snapshot a session since item 51, behind an opt-in
// `persistKey` — but only QuizMode ever passed one, so `jac`, `wayground` and
// `vocab` ran on a shell that could save their progress with the feature simply
// switched off. Wiring each of them up separately would have meant four copies
// of the same three-part dance: read a snapshot at mount, keep the drawn
// question list beside it, and clear both when the session ends or is declined.
//
// Two keys, not one (QuizMode's original convention, kept): the question list is
// written once when a session starts, the progress on every answer. Rewriting
// the whole question list once per answer would be the only alternative.
//
// Note what the questions key is *for*. Every mode here shuffles its questions
// on the way in, so restoring `qIdx: 7` against a freshly shuffled list would
// resume the right position in the wrong exam. The list has to come back
// exactly as it went out.
import { useState, useCallback } from 'react';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';

export function useQuizResume(baseKey, { maxAgeMs } = {}) {
  const progressKey = `${baseKey}-progress`;
  const questionsKey = `${baseKey}-questions`;

  // Read once, in the initialiser. A later save in this same session must not
  // make the prompt reappear mid-quiz.
  const [resumeData, setResumeData] = useState(() => {
    const progress = readQuizSnapshot(progressKey, maxAgeMs);
    const saved = readQuizSnapshot(questionsKey, maxAgeMs);
    if (!progress || !Array.isArray(saved?.questions) || saved.questions.length === 0) return null;
    return { progress, questions: saved.questions, meta: saved.meta ?? null };
  });

  /** Call when a session starts, with the list it will run on and whatever the
   *  mode needs to put itself back in the same place (a set id, a mode flag). */
  const beginSession = useCallback(
    (questions, meta = null) => {
      saveQuizSnapshot(questionsKey, { questions, meta });
    },
    [questionsKey]
  );

  /** Drop the snapshot entirely — finished, declined, or deliberately discarded. */
  const clear = useCallback(() => {
    clearQuizSnapshot(progressKey);
    clearQuizSnapshot(questionsKey);
    setResumeData(null);
  }, [progressKey, questionsKey]);

  /** Take the offer off screen without deleting anything: the caller is about
   *  to resume it, and QuizShell will keep writing to the same keys. */
  const dismiss = useCallback(() => setResumeData(null), []);

  return { resumeData, progressKey, beginSession, clear, dismiss };
}
