// src/hooks/useDailyChallenge.js
// Daily challenge state + persistence via storage engine.
import { useState, useCallback, useEffect } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { getDailyChallenge } from '../utils/daily-challenge.js';
import { todayStr } from '../utils/date.js';

export function useDailyChallenge() {
  const today = todayStr(); // local timezone date
  // Loaded rather than computed: the question pool is ~700 kB of quiz data and
  // used to ride into the initial bundle through this hook (item 131). SayaTab
  // renders the card behind a null check, so `null` for a tick is already a
  // state it handles.
  const [question, setQuestion] = useState(null);
  useEffect(() => {
    let live = true;
    getDailyChallenge(today).then((q) => {
      if (live) setQuestion(q);
    });
    return () => {
      live = false;
    };
  }, [today]);

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
