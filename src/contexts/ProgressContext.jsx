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

/** Item 94: which store each `saveScore` type writes to. See saveScore below. */
const SCORE_KEYS = { jac: 'jacScores', wg: 'wgScores', vocab: 'vocabScores', sim: 'simScores' };

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
  // A stored date in the FUTURE means the device's calendar moved backward, and
  // it used to fall through to the `: 1` catch-all and wipe the streak (item
  // 120). That is not a hypothetical for this audience: a worker flying Japan
  // (JST, UTC+9) to Jakarta (WIB, UTC+7) crosses a day boundary backward in
  // minutes of real time, and so does anyone whose clock is corrected after
  // running fast. A 30-day streak went to 1 for changing timezone.
  //
  // Treated as "already counted today": keep the tally, and heal `lastDate`
  // forward to the local date so tomorrow advances normally instead of the
  // learner having to wait out the phantom day. Never advances on this branch,
  // so it cannot be used to gain a day either.
  //
  // Shape-checked before comparing, and the test is what found that: `>` on
  // strings put 'kemarin' after '2026-09-08' (letters sort above digits), so a
  // malformed stored date was read as a future one and preserved a streak that
  // should have restarted.
  const clockWentBack =
    /^\d{4}-\d{2}-\d{2}$/.test(streak.lastDate ?? '') && streak.lastDate > dateStr;
  const days = clockWentBack
    ? (streak.days ?? 0)
    : streak.lastDate === dateStr
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

  // The updater is forwarded to the engine rather than resolved against this
  // component's state first. Same defect as AppContext's setPref had: `prog` is
  // seeded once at mount and never re-synced, while six modules write
  // `progress` straight to the engine (JACMode, SprintMode, VocabMode,
  // WaygroundMode, simulasi-mistakes, daily-mission) -- all of them correctly,
  // with functional updaters against the live cache. Resolving here and handing
  // `engine.set()` a finished object meant every one of those writes was undone
  // by the next card the learner rated, because handleMark returns a full
  // `{ ...prev, ... }` snapshot. Finish a Wayground set, mark one card known,
  // and the set's wrong answers were gone.
  const setProg = useCallback((updater) => {
    setProgState(
      storageSet('progress', (p) =>
        typeof updater === 'function' ? updater(p) : { ...p, ...updater }
      )
    );
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
      // `progress.quizWrong` is keyed by card id and every reader treats it that
      // way -- FokusMode looks up `quizWrong[c.id]`, StatsMode does `Number(id)`.
      // DangerMode passed `danger-<term>` here for years (item 129), landing
      // string keys that are inert in one reader and a `NaN` property in the
      // other, and riding along in every export forever. This is the one writer,
      // so it is the one place the id space can actually be held.
      // utils/mistake-bridge.js is where a non-card mistake belongs.
      if (typeof cardId !== 'number' || !Number.isInteger(cardId)) return;
      setProg((prev) => {
        const qw = { ...(prev.quizWrong ?? {}) };
        qw[cardId] = makeWrongEntry(qw[cardId]);
        return { ...prev, quizWrong: qw };
      });
    },
    [setProg]
  );

  // ── Scores ────────────────────────────────────────────────────────────
  //
  // Item 94 named the trap here before it bit anyone: this was a ternary whose
  // final branch was `vocabScores`, so *any* unrecognised type wrote into vocab
  // rather than failing. Adding `sim` without noticing would have quietly
  // corrupted a different mode's history. A lookup with an explicit reject
  // cannot do that: an unknown type is a bug in the caller, and it says so.
  const saveScore = useCallback(
    (type, setId, scoreData) => {
      // Silent no-op rather than a silent *write to the wrong store*: an
      // unknown type is a caller bug, and the test below is what catches it.
      const key = SCORE_KEYS[type];
      if (!key) return;
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
      simScores: prog.simScores ?? EMPTY_OBJ,
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
