// src/hooks/useDailyChallenge.js
// Daily challenge state + persistence via storage engine.
import { useState, useCallback } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { getDailyChallenge } from '../utils/daily-challenge.js';
import { todayStr } from '../utils/date.js';

export function useDailyChallenge() {
  const today = todayStr(); // local timezone date
  const question = getDailyChallenge(today);

  const [answered, setAnswered] = useState(() => {
    // Hydrate from storage engine (not sessionStorage)
    return get('prefs')?.dailyChallengeLog?.[today] ?? null;
  });

  const submit = useCallback(
    (selectedIdx, correctIdx) => {
      const result = { selected: selectedIdx, correct: selectedIdx === correctIdx };
      setAnswered(result);
      storageSet('prefs', (p) => ({
        ...p,
        dailyChallengeLog: {
          ...(p.dailyChallengeLog ?? {}),
          [today]: result,
        },
      }));
    },
    [today]
  );

  return { question, answered, submit };
}
