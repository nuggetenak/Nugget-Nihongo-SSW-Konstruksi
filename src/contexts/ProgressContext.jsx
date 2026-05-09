// ─── contexts/ProgressContext.jsx (phaseA) ────────────────────────────────────
// All user progress: known/unknown/starred, quiz scores, streak, daily count.
// Backed by ssw-progress document in storage engine.
//
// A.3 FIX BUG-03: Added toastQueue / clearToast for milestone toasts.
//     Milestone flags trigger queued toasts consumed by App.jsx useEffect.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { todayStr, prevDayStr } from '../utils/date.js';
import { SESSIONS_CAP } from '../utils/constants.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';

const ProgressCtx = createContext(null);

// Module-level stable defaults — prevent empty object/array recreation each render
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

export function ProgressProvider({ children }) {
  const [prog, setProgState] = useState(() => get('progress'));
  // A.3: Queue of milestone toast messages to be consumed by App.jsx
  const [toastQueue, setToastQueue] = useState([]);

  const setProg = useCallback((updater) => {
    setProgState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storageSet('progress', next);
      return next;
    });
  }, []);

  // ── Known / Unknown ───────────────────────────────────────────────────
  const handleMark = useCallback((id, type) => {
    const dateStr = todayStr();
    setProg((prev) => {
      const knownSet = new Set(Array.isArray(prev.known) ? prev.known : []);
      const unknownSet = new Set(Array.isArray(prev.unknown) ? prev.unknown : []);

      if (type === 'known') {
        knownSet.add(id);
        unknownSet.delete(id);
      } else {
        unknownSet.add(id);
        knownSet.delete(id);
      }

      // Streak
      const streak = prev.streakData ?? {};
      const newDays = streak.lastDate === dateStr
        ? (streak.days ?? 0)
        : streak.lastDate === prevDayStr()
          ? (streak.days ?? 0) + 1
          : 1;
      const streakData = { days: newDays, lastDate: dateStr };

      // Daily count
      const dc = prev.dailyCount ?? { count: 0, date: '' };
      const dailyCount = dc.date === dateStr
        ? { count: dc.count + 1, date: dateStr }
        : { count: 1, date: dateStr };

      // Recent cards (max 20, newest first)
      const recentCards = id
        ? [id, ...(prev.recentCards ?? []).filter((x) => x !== id)].slice(0, 20)
        : prev.recentCards ?? [];

      // Milestone: streak7 — queue toast when first achieved
      const milestoneStreak7 = prev.milestoneStreak7 || newDays >= 7;
      if (!prev.milestoneStreak7 && milestoneStreak7) {
        // Queue outside setState (setTimeout avoids calling setState within setState)
        setTimeout(() => setToastQueue((q) => [
          ...q,
          { msg: '🔥 7 hari berturut-turut! Konsistensi = kunci sukses.', duration: 4000 },
        ]), 0);
      }

      return {
        ...prev,
        known: [...knownSet],
        unknown: [...unknownSet],
        streakData,
        dailyCount,
        recentCards,
        milestoneStreak7,
      };
    });
  }, [setProg]);

  // ── Starred ───────────────────────────────────────────────────────────
  const toggleStar = useCallback((id) => {
    if (!id) return;
    setProg((prev) => {
      const s = new Set(Array.isArray(prev.starred) ? prev.starred : []);
      if (s.has(id)) s.delete(id); else s.add(id);
      return { ...prev, starred: [...s] };
    });
  }, [setProg]);

  // ── Quiz wrong tracking (legacy in-doc counter) ──────────────────────
  // Note: modes now use wrong-tracker.js + ssw-quiz-wrong (out-of-docs).
  // recordWrong writes to progress.quizWrong for FocusMode/QuizMode/SearchMode.
  const recordWrong = useCallback((cardId) => {
    setProg((prev) => {
      const qw = { ...(prev.quizWrong ?? {}) };
      qw[cardId] = makeWrongEntry(qw[cardId]);
      return { ...prev, quizWrong: qw };
    });
  }, [setProg]);

  // ── Scores ────────────────────────────────────────────────────────────
  const saveScore = useCallback((type, setId, scoreData) => {
    const key = type === 'jac' ? 'jacScores' : type === 'wg' ? 'wgScores' : 'vocabScores';
    setProg((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [setId]: scoreData },
    }));
  }, [setProg]);

  // ── Milestone setters ─────────────────────────────────────────────────
  const setMilestoneQuiz70 = useCallback(() => {
    setProg((prev) => {
      // A.3: Queue toast on first achievement only
      if (!prev.milestoneQuiz70) {
        setTimeout(() => setToastQueue((q) => [
          ...q,
          { msg: '🎉 Luar biasa! Nilai kuis ≥70% untuk pertama kali!', duration: 4000 },
        ]), 0);
      }
      return { ...prev, milestoneQuiz70: true };
    });
  }, [setProg]);

  // A.3: Remove first toast from queue (called by App.jsx after displaying)
  const clearToast = useCallback((idx) => {
    setToastQueue((q) => q.filter((_, i) => i !== idx));
  }, []);

  // ── Session tracking (Phase C) ───────────────────────────────────────────
  const recordSession = useCallback(({ mode, correct, total, durationMs }) => {
    setProg((prev) => {
      const sessions = [
        ...(prev.sessions ?? []),
        { mode, correct, total, durationMs: durationMs ?? 0, date: new Date().toISOString() },
      ].slice(-SESSIONS_CAP); // keep last SESSIONS_CAP sessions (~6 months for heatmap)
      return { ...prev, sessions };
    });
  }, [setProg]);

  const ctx = useMemo(() => {
    const knownArr = Array.isArray(prog.known) ? prog.known : [];
    const unknownArr = Array.isArray(prog.unknown) ? prog.unknown : [];
    const starredArr = Array.isArray(prog.starred) ? prog.starred : [];
    return {
      // Raw sets (for components that need set form)
      known: new Set(knownArr),
      unknown: new Set(unknownArr),
      starred: new Set(starredArr),
      // Scores
      quizWrong: prog.quizWrong ?? EMPTY_OBJ,
      jacScores: prog.jacScores ?? EMPTY_OBJ,
      wgScores: prog.wgScores ?? EMPTY_OBJ,
      vocabScores: prog.vocabScores ?? EMPTY_OBJ,
      wgWrong: prog.wgWrong ?? EMPTY_OBJ,
      vocabWrong: prog.vocabWrong ?? EMPTY_OBJ,
      // Progress
      streakData: prog.streakData ?? EMPTY_OBJ,
      dailyCount: prog.dailyCount ?? { count: 0, date: '' },
      recentCards: prog.recentCards ?? EMPTY_ARR,
      // Milestones
      milestoneStreak7: prog.milestoneStreak7 ?? false,
      milestoneQuiz70: prog.milestoneQuiz70 ?? false,
      // A.3: Toast queue
      toastQueue,
      clearToast,
      // Phase C: Session data
      sessions: prog.sessions ?? EMPTY_ARR,
      recordSession,
      // Actions
      handleMark,
      toggleStar,
      recordWrong,
      saveScore,
      setMilestoneQuiz70,
    };
  }, [
    prog, toastQueue, clearToast,
    recordSession, handleMark, toggleStar, recordWrong, saveScore, setMilestoneQuiz70,
  ]);

  return <ProgressCtx.Provider value={ctx}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

