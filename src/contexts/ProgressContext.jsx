// ─── contexts/ProgressContext.jsx (phaseA) ────────────────────────────────────
// All user progress: known/unknown/starred, quiz scores, streak, daily count.
// Backed by ssw-progress document in storage engine.
//
// A.3 FIX BUG-03: Added toastQueue / clearToast for milestone toasts.
//     Milestone flags trigger queued toasts consumed by App.jsx useEffect.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from 'react';
import { get, set as storageSet } from '../storage/engine.js';

const ProgressCtx = createContext(null);

// ── Utility: today's date string ─────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);

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
    const dateStr = today();
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
        : streak.lastDate === getPrevDate()
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

  // ── Quiz wrong tracking ───────────────────────────────────────────────
  const recordWrong = useCallback((cardId) => {
    setProg((prev) => {
      const qw = { ...(prev.quizWrong ?? {}) };
      qw[cardId] = (qw[cardId] ?? 0) + 1;
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
      ].slice(-90); // keep last 90 sessions
      return { ...prev, sessions };
    });
  }, [setProg]);

  // ── Derived sets (memoized inline, cheap) ────────────────────────────
  const knownArr = Array.isArray(prog.known) ? prog.known : [];
  const unknownArr = Array.isArray(prog.unknown) ? prog.unknown : [];
  const starredArr = Array.isArray(prog.starred) ? prog.starred : [];

  const knownSet = new Set(knownArr);
  const unknownSet = new Set(unknownArr);
  const starredSet = new Set(starredArr);

  const ctx = {
    // Raw arrays (for components that need array form)
    known: knownSet,
    unknown: unknownSet,
    starred: starredSet,
    // Scores
    quizWrong: prog.quizWrong ?? {},
    jacScores: prog.jacScores ?? {},
    wgScores: prog.wgScores ?? {},
    vocabScores: prog.vocabScores ?? {},
    wgWrong: prog.wgWrong ?? {},
    vocabWrong: prog.vocabWrong ?? {},
    // Progress
    streakData: prog.streakData ?? {},
    dailyCount: prog.dailyCount ?? { count: 0, date: '' },
    recentCards: prog.recentCards ?? [],
    // Milestones
    milestoneStreak7: prog.milestoneStreak7 ?? false,
    milestoneQuiz70: prog.milestoneQuiz70 ?? false,


  // A.3: Toast queue
    toastQueue,
    clearToast,
    // Phase C: Session data
    sessions: prog.sessions ?? [],
    recordSession,
    // Actions
    handleMark,
    toggleStar,
    recordWrong,
    saveScore,
    setMilestoneQuiz70,
  };

  return <ProgressCtx.Provider value={ctx}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}

// Helper: yesterday's date string
function getPrevDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
