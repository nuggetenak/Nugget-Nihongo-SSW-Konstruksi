// src/hooks/useDailyChallenge.js
// ENG-5: Daily challenge state + persistence.
// Replaces 8 lines of sessionStorage in SayaTab.jsx.
import { useState, useCallback } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { getDailyChallenge } from '../utils/daily-challenge.js';
import { todayStr } from '../utils/date.js';

export function useDailyChallenge() {
  const today = todayStr(); // local date (REF-6)
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
