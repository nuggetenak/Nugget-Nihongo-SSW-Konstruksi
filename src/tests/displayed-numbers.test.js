// ─── tests/displayed-numbers.test.js ─────────────────────────────────────────
// UI_UX_PLAN item 120 — are the numbers this app shows a learner correct?
//
// Nobody had checked. The app tells someone a readiness band, a daily streak and
// a breakdown of their deck into SRS buckets, and those numbers shape what they
// believe about whether they will pass an exam their visa depends on. Worked
// through by evaluating each formula on concrete inputs rather than reading it.
//
// Two defects came out, both at the edges rather than in the ordinary path, and
// the ordinary path is verified below too — a formula proven right is worth as
// much here as one proven wrong, because it stops the next session re-deriving
// it.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { calcReadiness, calcReadinessBand, getAvgAccuracy } from '../utils/session-analytics.js';
import { advanceStudyDay } from '../contexts/ProgressContext.jsx';
import { todayStr, prevDayStr } from '../utils/date.js';
import { getSRSStats, getDueCardIds } from '../srs/index.js';
import { init, setSRSCard, _reset_for_test } from '../storage/engine.js';

const session = (mode, correct, total) => ({
  mode,
  correct,
  total,
  date: new Date().toISOString(),
});
const noop = () => {};

describe('the readiness score', () => {
  it('is 0, not NaN, for a learner who has done nothing', () => {
    expect(calcReadiness({ srs: null, sessions: [], streakData: {} })).toBe(0);
  });

  it('reaches exactly 100 when every component is maxed, and no further', () => {
    // 40 SRS + 40 quiz + 20 streak. The weights are supposed to sum to 100 and
    // they do.
    expect(
      calcReadiness({
        srs: { stats: { total: 1626, mature: 1000, young: 626 } },
        sessions: [session('kuis', 10, 10)],
        streakData: { days: 14 },
      })
    ).toBe(100);
  });

  it('weights each component as documented', () => {
    const only = (input) => calcReadiness({ sessions: [], streakData: {}, srs: null, ...input });
    expect(only({ srs: { stats: { total: 100, mature: 100, young: 0 } } })).toBe(40);
    expect(only({ sessions: [session('kuis', 10, 10)] })).toBe(40);
    expect(only({ streakData: { days: 14 } })).toBe(20);
  });

  it('caps the streak component at 14 days', () => {
    const s = { srs: null, sessions: [] };
    expect(calcReadiness({ ...s, streakData: { days: 14 } })).toBe(20);
    expect(calcReadiness({ ...s, streakData: { days: 999 } })).toBe(20);
  });

  it('never goes below 0 — a negative streak used to wind the ring backwards', () => {
    // Nothing writes a negative `days`, but an imported document can carry one:
    // validateSnapshot does not check streakData. ProgressRing draws
    // strokeDashoffset = 2πr(1 - score/100), so -71 drew past a full circle.
    expect(calcReadiness({ srs: null, sessions: [], streakData: { days: -50 } })).toBe(0);
  });

  it('cannot be pushed past its cap by a session with more correct than total', () => {
    expect(calcReadiness({ srs: null, sessions: [session('kuis', 11, 10)], streakData: {} })).toBe(
      40
    );
  });

  it('drops an unusable session instead of returning NaN for the whole score', () => {
    const withBadRow = calcReadiness({
      srs: null,
      sessions: [session('kuis', NaN, 10), session('kuis', 8, 10)],
      streakData: {},
    });
    expect(Number.isFinite(withBadRow)).toBe(true);
    expect(withBadRow).toBe(32); // the good row alone: 80% of 40
  });

  it('counts only scored quiz modes toward accuracy', () => {
    expect(getAvgAccuracy([session('kartu', 5, 5)])).toBeNull();
    expect(getAvgAccuracy([session('kuis', 0, 0)])).toBeNull();
    expect(getAvgAccuracy([session('simulasi', 30, 50)])).toBe(60);
  });
});

describe('the readiness band', () => {
  const full = (n) => ({
    srs: { stats: { total: 10, mature: 10, young: 0 } },
    sessions: Array(n).fill(session('kuis', 10, 10)),
    streakData: { days: 14 },
  });

  it('says nothing at all below five scored sessions', () => {
    // "Kurang siap" from three sessions is noise wearing a label.
    expect(calcReadinessBand(full(4))).toBeNull();
    expect(calcReadinessBand(full(5))).not.toBeNull();
  });

  it('puts the band boundaries where the labels claim', () => {
    const at = (score) => (score < 40 ? 'kurang' : score < 70 ? 'cukup' : 'siap');
    expect([39, 40, 69, 70].map(at)).toEqual(['kurang', 'cukup', 'cukup', 'siap']);
    expect(calcReadinessBand(full(5)).key).toBe('siap');
  });
});

describe('the daily streak', () => {
  const run = (lastDate, days) =>
    advanceStudyDay({ streakData: { days, lastDate } }, 1, noop).streakData;

  it('holds on a second session the same day', () => {
    expect(run(todayStr(), 5).days).toBe(5);
  });

  it('advances by one on a consecutive day', () => {
    expect(run(prevDayStr(), 5).days).toBe(6);
  });

  it('restarts after a missed day', () => {
    expect(run('2020-01-01', 5).days).toBe(1);
  });

  it('survives the device calendar moving backwards', () => {
    // The literal use case: a worker flying Japan (JST, UTC+9) to Jakarta (WIB,
    // UTC+7) crosses a day boundary backwards in minutes. This fell through to
    // the restart branch and wiped a 30-day streak for changing timezone.
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('sv');
    const after = run(tomorrow, 30);
    expect(after.days).toBe(30);
    // And heals the date forward, so tomorrow advances instead of the learner
    // waiting out a phantom day.
    expect(after.lastDate).toBe(todayStr());
  });

  it('does not let a backwards clock advance the streak either', () => {
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('sv');
    expect(run(tomorrow, 30).days).toBe(30);
  });

  it('restarts on a missing or malformed date rather than throwing', () => {
    for (const bad of ['', undefined, 'kemarin', null]) {
      expect(run(bad, 5).days).toBe(1);
    }
  });

  it('counts a card toward today and not toward a stale day', () => {
    const stale = advanceStudyDay(
      { dailyCount: { count: 12, date: '2020-01-01' } },
      1,
      noop
    ).dailyCount;
    expect(stale).toEqual({ count: 1, date: todayStr() });
    const same = advanceStudyDay(
      { dailyCount: { count: 12, date: todayStr() } },
      1,
      noop
    ).dailyCount;
    expect(same.count).toBe(13);
  });

  it('keeps the streak alive without inflating the card tally', () => {
    // A finished session passes counts=0: it is studying, but it is one session,
    // not one card, and the UI renders dailyCount as "+N kartu hari ini".
    const r = advanceStudyDay({ dailyCount: { count: 4, date: todayStr() } }, 0, noop);
    expect(r.dailyCount.count).toBe(4);
    expect(r.streakData.lastDate).toBe(todayStr());
  });
});

describe('the streak milestone', () => {
  it('fires once, at seven days, and never again', () => {
    const toasts = [];
    const push = (m) => toasts.push(m);
    expect(
      advanceStudyDay({ streakData: { days: 5, lastDate: prevDayStr() } }, 1, push).milestoneStreak7
    ).toBe(false);
    expect(toasts).toHaveLength(0);

    const hit = advanceStudyDay({ streakData: { days: 6, lastDate: prevDayStr() } }, 1, push);
    expect(hit.milestoneStreak7).toBe(true);
    expect(toasts).toHaveLength(1);

    advanceStudyDay(
      { streakData: { days: 20, lastDate: prevDayStr() }, milestoneStreak7: true },
      1,
      push
    );
    expect(toasts).toHaveLength(1); // still one — no re-toast
  });
});

describe('the SRS buckets', () => {
  beforeEach(() => {
    localStorage.clear();
    _reset_for_test();
    init();
  });

  it('partition the deck — every card lands in exactly one bucket', () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8];
    setSRSCard(1, { card: { state: 1, stability: 0.5, due: new Date(0).toISOString() } });
    setSRSCard(2, { card: { state: 2, stability: 3, due: new Date(0).toISOString() } });
    setSRSCard(3, { card: { state: 2, stability: 40, due: new Date(0).toISOString() } });
    const s = getSRSStats(ids);
    expect(s.new + s.learning + s.young + s.mature).toBe(s.total);
    expect(s.total).toBe(ids.length);
    expect(s.new).toBe(5); // the five never rated
  });

  it('counts a card with no SRS entry as new, not as missing', () => {
    const s = getSRSStats([101, 102, 103]);
    expect(s).toMatchObject({ total: 3, new: 3, learning: 0, young: 0, mature: 0, due: 0 });
  });

  it('agrees with the queue ReviewMode actually draws', () => {
    const ids = [1, 2, 3];
    setSRSCard(1, { card: { state: 2, stability: 3, due: new Date(0).toISOString() } });
    setSRSCard(2, {
      card: { state: 2, stability: 3, due: new Date(Date.now() + 8.64e7).toISOString() },
    });
    // The badge count and the queue length are computed by different functions
    // over different data (the whitelist vs the store); they must not disagree.
    expect(getSRSStats(ids).due).toBe(getDueCardIds(ids).length);
    expect(getDueCardIds(ids)).toEqual([1]);
  });

  it('never counts an unrated card as due', () => {
    expect(getSRSStats([1, 2, 3]).due).toBe(0);
  });
});
