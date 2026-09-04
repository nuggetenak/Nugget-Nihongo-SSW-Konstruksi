// ─── contexts/ProgressContext.jsx ────────────────────────────────────────────
// All user progress: known/unknown/starred, quiz scores, streak, daily count.
// Backed by ssw-progress document in storage engine.
// Milestone flags queue toasts consumed by App.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { todayStr, prevDayStr } from '../utils/date.js';
import { SESSIONS_CAP } from '../utils/constants.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';

const ProgressCtx = createContext(null);

// Advances the daily streak and today's activity count for `prev`, returning the
// fields to merge in. `counts` is how much today's tally grows: 1 for a single
// card mark, 0 for a finished session — that keeps the streak alive without
// inflating a counter the UI labels "kartu hari ini".
//
// Lifted out of handleMark 2026-09-04, because handleMark was the ONLY caller
// that existed. Marking a flashcard known/unknown was the sole action in the
// whole app that counted as studying: a learner who did SRS reviews every
// morning for a month, or nothing but quizzes and mock exams, kept a streak of
// 0 throughout. ReviewMode is the mode this app's own plan calls "the one a
// learner uses daily and longest". The streak feeds the Dashboard headline, the
// week_streak/month_streak achievements, and 20 of the 100 points in the
// readiness score, so one missing call site was wrong in four visible places.
export function advanceStudyDay(prev, counts, queueToast) {
  const dateStr = todayStr();
  const streak = prev.streakData ?? {};
  const days =
    streak.lastDate === dateStr
      ? (streak.days ?? 0)
      : streak.lastDate === prevDayStr()
        ? (streak.days ?? 0) + 1
        : 1;

  const dc = prev.dailyCount ?? { count: 0, date: '' };
  const dailyCount =
    dc.date === dateStr
      ? { count: dc.count + counts, date: dateStr }
      : { count: counts, date: dateStr };

  const milestoneStreak7 = prev.milestoneStreak7 || days >= 7;
  if (!prev.milestoneStreak7 && milestoneStreak7) {
    queueToast('🔥 7 hari berturut-turut! Konsistensi = kunci sukses.');
  }

  return { streakData: { days, lastDate: dateStr }, dailyCount, milestoneStreak7 };
}

// Module-level stable defaults — prevent empty object/array recreation each render
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

export function ProgressProvider({ children }) {
  const [prog, setProgState] = useState(() => get('progress'));
  // Queue of milestone toast messages consumed by App.jsx.
  const [toastQueue, setToastQueue] = useState([]);

  // Queued out of band: these fire from inside a setProg updater, and calling
  // setState during another component's state update is exactly what React
  // warns about. Stable identity so the callbacks below don't re-create.
  const queueToast = useCallback((msg, duration = 4000) => {
    setTimeout(() => setToastQueue((q) => [...q, { msg, duration }]), 0);
  }, []);

  const setProg = useCallback((updater) => {
    setProgState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storageSet('progress', next);
      return next;
    });
  }, []);

  // ── Known / Unknown ───────────────────────────────────────────────────
  const handleMark = useCallback(
    (id, type) => {
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

        const { streakData, dailyCount, milestoneStreak7 } = advanceStudyDay(prev, 1, queueToast);

        // Recent cards (max 20, newest first)
        const recentCards = id
          ? [id, ...(prev.recentCards ?? []).filter((x) => x !== id)].slice(0, 20)
          : (prev.recentCards ?? []);

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
    },
    [setProg, queueToast]
  );

  // ── Starred ───────────────────────────────────────────────────────────
  const toggleStar = useCallback(
    (id) => {
      if (!id) return;
      setProg((prev) => {
        const s = new Set(Array.isArray(prev.starred) ? prev.starred : []);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        return { ...prev, starred: [...s] };
      });
    },
    [setProg]
  );

  // ── Reset known/unknown marks ────────────────────────────────────────
  // item 15: FlashcardMode's reset button was calling handleMark('__RESET__',
  // 'reset') — handleMark has no special case for that id, so it just added
  // the literal string '__RESET__' to the unknown set. The button's own label
  // ("Ketuk lagi untuk hapus semua progres") promised an actual reset; found
  // while migrating this control's confirmation, fixed alongside it rather
  // than shipping a more convincing confirmation dialog in front of a button
  // that didn't do what it said. Scoped to known/unknown specifically (not
  // starred, streak, or session history) — those are separate concerns this
  // control was never about.
  const resetKnownUnknown = useCallback(() => {
    setProg((prev) => ({ ...prev, known: [], unknown: [] }));
  }, [setProg]);

  // ── Quiz wrong tracking ───────────────────────────────────────────────
  // recordWrong writes to progress.quizWrong (in-engine, lz-string compressed, exportable).
  const recordWrong = useCallback(
    (cardId) => {
      setProg((prev) => {
        const qw = { ...(prev.quizWrong ?? {}) };
        qw[cardId] = makeWrongEntry(qw[cardId]);
        return { ...prev, quizWrong: qw };
      });
    },
    [setProg]
  );

  // ── Scores ────────────────────────────────────────────────────────────
  const saveScore = useCallback(
    (type, setId, scoreData) => {
      const key = type === 'jac' ? 'jacScores' : type === 'wg' ? 'wgScores' : 'vocabScores';
      setProg((prev) => ({
        ...prev,
        [key]: { ...(prev[key] ?? {}), [setId]: scoreData },
      }));
    },
    [setProg]
  );

  // ── Milestone setters ─────────────────────────────────────────────────
  const setMilestoneQuiz70 = useCallback(() => {
    setProg((prev) => {
      // Queue toast on first achievement only.
      if (!prev.milestoneQuiz70) {
        queueToast('🎉 Luar biasa! Nilai kuis ≥70% untuk pertama kali!');
      }
      return { ...prev, milestoneQuiz70: true };
    });
  }, [setProg, queueToast]);

  // Remove first toast from queue (called by App.jsx after displaying).
  const clearToast = useCallback((idx) => {
    setToastQueue((q) => q.filter((_, i) => i !== idx));
  }, []);

  // ── Session tracking ────────────────────────────────────────────────────
  const recordSession = useCallback(
    ({ mode, correct, total, durationMs }) => {
      setProg((prev) => {
        const sessions = [
          ...(prev.sessions ?? []),
          { mode, correct, total, durationMs: durationMs ?? 0, date: new Date().toISOString() },
        ].slice(-SESSIONS_CAP); // keep last SESSIONS_CAP sessions (~6 months for heatmap)
        // Finishing a session is studying, so it keeps the streak alive — see
        // advanceStudyDay. counts=0 deliberately: dailyCount is rendered as
        // "+N kartu hari ini", and a finished quiz is one session, not one card.
        // The streak is the part that was wrong; the counter's meaning was not.
        //
        // total > 0 gates it. A session where nothing was answered isn't
        // studying, and this app has shipped a phantom 0/0 session before
        // (ReviewMode logged one just for opening the tab with nothing due,
        // fixed 2026-09-01) — a streak that can be advanced by opening a screen
        // is worth less than one that can't.
        const studied = (total ?? 0) > 0;
        return { ...prev, sessions, ...(studied ? advanceStudyDay(prev, 0, queueToast) : null) };
      });
    },
    [setProg, queueToast]
  );

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
      toastQueue,
      clearToast,
      sessions: prog.sessions ?? EMPTY_ARR,
      recordSession,
      // Actions
      handleMark,
      toggleStar,
      resetKnownUnknown,
      recordWrong,
      saveScore,
      setMilestoneQuiz70,
    };
  }, [
    prog,
    toastQueue,
    clearToast,
    recordSession,
    handleMark,
    toggleStar,
    resetKnownUnknown,
    recordWrong,
    saveScore,
    setMilestoneQuiz70,
  ]);

  return <ProgressCtx.Provider value={ctx}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressCtx);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
