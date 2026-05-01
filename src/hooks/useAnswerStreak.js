// ─── useAnswerStreak.js (phaseA) ──────────────────────────────────────────────
// A.5 TD-04: Renamed from useStreak → useAnswerStreak (clearer intent).
// A.4 BUG-04: Extended with wrongStreak / maxWrongStreak tracking for
//     anxiety-reduction toast (≥5 consecutive wrong → supportive message).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';

/**
 * React hook for tracking correct- and wrong-answer streaks.
 *
 * @returns {{ streak, maxStreak, wrongStreak, maxWrongStreak, recordAnswer, reset }}
 *
 * Usage:
 *   const { streak, maxStreak, wrongStreak, maxWrongStreak, recordAnswer } = useAnswerStreak();
 *   // On answer: recordAnswer(isCorrect);
 */
export function useAnswerStreak() {
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [maxWrongStreak, setMaxWrongStreak] = useState(0);

  const recordAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setWrongStreak(0);
    } else {
      setStreak(0);
      setWrongStreak((w) => {
        const next = w + 1;
        setMaxWrongStreak((m) => Math.max(m, next));
        return next;
      });
    }
  }, []);

  const reset = useCallback(() => {
    setStreak(0);
    setMaxStreak(0);
    setWrongStreak(0);
    setMaxWrongStreak(0);
  }, []);

  return { streak, maxStreak, wrongStreak, maxWrongStreak, recordAnswer, reset };
}
