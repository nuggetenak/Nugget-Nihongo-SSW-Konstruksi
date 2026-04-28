// ─── useStreak — Track consecutive correct answers ──────────────────────────
import { useState, useCallback } from 'react';

/**
 * React hook for tracking correct-answer streaks.
 *
 * @returns {{ streak, maxStreak, recordAnswer, reset }}
 *
 * Usage:
 *   const { streak, maxStreak, recordAnswer } = useStreak();
 *   // On answer: recordAnswer(isCorrect);
 */
export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const recordAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }, []);

  const reset = useCallback(() => {
    setStreak(0);
    setMaxStreak(0);
  }, []);

  return { streak, maxStreak, recordAnswer, reset };
}
