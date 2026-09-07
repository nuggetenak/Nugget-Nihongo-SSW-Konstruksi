// ─── utils/daily-mission.js ─────────────────────────────────────────────────
// Daily Mission engine — recommends one study activity per day.
// Grounded in: Fogg (2009) Behavior Model, Clear (2018) Habit Loop,
// Nation (2007) Four Strands balance.
// ─────────────────────────────────────────────────────────────────────────────
import { get, set as storageSet } from '../storage/engine.js';
import { getDueCardIds } from '../srs/fsrs-scheduler.js';
import { todayStr } from './date.js';
import { MODE_META } from '../router/modes.js';

// Four Strands mapping (Nation 2007) — strand derives from MODE_META.
//
// Membership rule (item 102c — the list previously had none, and the omissions
// looked arbitrary): a mission is one sitting's worth of study that a person can
// finish and tick off today. That admits every mode with a strand except two
// kinds:
//
//   `simulasi` — a full exam is 100 minutes. Offering it as "today's mission"
//                misrepresents what it costs; it is a thing you schedule.
//   `cari` / `glosari` / `catatan` — reference surfaces. They have no end, so
//                there is nothing to complete.
//
// `wayground` (the largest bank in the app at 740 questions) and `vocab` were
// missing for no reason anyone had written down, and are in now. `produksi` and
// `kuisprod` were in and left with the modes in 7.0.0.
const MISSION_TYPES = [
  { mode: 'ulasan', label: 'Ulasan SRS', icon: '🔁', priority: 5 },
  { mode: 'kartu', label: 'Pelajari Kartu', icon: '🃏', priority: 3 },
  { mode: 'kuis', label: 'Kuis 10 Soal', icon: '❓', priority: 3 },
  { mode: 'sprint', label: 'Sprint 60 Detik', icon: '⚡', priority: 2 },
  { mode: 'jac', label: 'Latihan JAC', icon: '📋', priority: 2 },
  { mode: 'wayground', label: 'Soal Teknis', icon: '🎓', priority: 2 },
  { mode: 'vocab', label: 'Kuis Kosakata', icon: '📖', priority: 3 },
  { mode: 'fokus', label: 'Fokus Kelemahan', icon: '🎯', priority: 4 },
  { mode: 'angka', label: 'Angka Kunci', icon: '🔢', priority: 3 },
  { mode: 'jebak', label: 'Soal Jebak', icon: '⚠️', priority: 3 },
  { mode: 'mirip', label: 'Kata Mirip', icon: '🔀', priority: 2 },
  { mode: 'dengar', label: 'Dengarkan', icon: '🎧', priority: 2 },
].map((m) => ({ ...m, strand: MODE_META[m.mode]?.strand ?? null }));

/** Exported so a test can assert the membership rule above against MODE_META
 *  rather than against a second hand-typed list that drifts from this one. */
export const MISSION_MODES = MISSION_TYPES.map((m) => m.mode);

export function generateDailyMission() {
  const today = todayStr();
  const progress = get('progress');
  const existing = progress?.dailyMission;

  // Already generated today — return cached
  if (existing?.date === today) return existing;

  const dueCount = getDueCardIds().length;
  const sessions = progress?.sessions ?? [];

  // Count strand usage in last 7 days for balance check
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessions.filter((s) => new Date(s.date).getTime() > cutoff);
  const strandCounts = { input: 0, output: 0, fluency: 0, language: 0 };
  recentSessions.forEach((s) => {
    const mt = MISSION_TYPES.find((m) => m.mode === s.mode);
    if (mt) strandCounts[mt.strand] = (strandCounts[mt.strand] ?? 0) + 1;
  });

  let selectedMode;
  if (dueCount > 0) {
    // SRS due cards take highest priority
    selectedMode = 'ulasan';
  } else {
    // Pick underrepresented strand (Four Strands balance)
    const minStrand = Object.entries(strandCounts).sort((a, b) => a[1] - b[1])[0][0];
    const candidates = MISSION_TYPES.filter((m) => m.strand === minStrand);
    selectedMode = candidates[Math.floor(Math.random() * candidates.length)]?.mode ?? 'kartu';
  }

  const meta = MISSION_TYPES.find((m) => m.mode === selectedMode);
  const mission = {
    date: today,
    mode: selectedMode,
    label: meta?.label ?? 'Belajar',
    icon: meta?.icon ?? '📖',
    completedAt: null,
  };

  storageSet('progress', (p) => ({ ...p, dailyMission: mission }));
  return mission;
}

export function completeMission() {
  storageSet('progress', (p) => ({
    ...p,
    dailyMission: p.dailyMission ? { ...p.dailyMission, completedAt: Date.now() } : null,
  }));
}

export function getMission() {
  return get('progress')?.dailyMission ?? null;
}

export function isMissionDoneToday() {
  const m = getMission();
  if (!m?.completedAt) return false;
  return new Date(m.completedAt).toDateString() === new Date().toDateString();
}
