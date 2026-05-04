// ─── utils/daily-mission.js (phaseC) ─────────────────────────────────────────
// Daily Mission engine — recommends one study activity per day.
// Grounded in: Fogg (2009) Behavior Model, Clear (2018) Habit Loop,
// Nation (2007) Four Strands balance.
// ─────────────────────────────────────────────────────────────────────────────
import { get, set as storageSet } from '../storage/engine.js';
import { getDueCardIds } from '../srs/fsrs-scheduler.js';

// Four Strands mapping (Nation 2007)
const MISSION_TYPES = [
  { mode: 'ulasan',   label: 'Ulasan SRS',       icon: '🔁', priority: 5, strand: 'fluency'  },
  { mode: 'kartu',    label: 'Pelajari Kartu',    icon: '🃏', priority: 3, strand: 'input'    },
  { mode: 'kuis',     label: 'Kuis 10 Soal',      icon: '❓', priority: 3, strand: 'language' },
  { mode: 'sprint',   label: 'Sprint 60 Detik',   icon: '⚡', priority: 2, strand: 'output'   },
  { mode: 'jac',      label: 'Latihan JAC',       icon: '📋', priority: 2, strand: 'language' },
  { mode: 'fokus',    label: 'Fokus Kelemahan',   icon: '🎯', priority: 4, strand: 'language' },
  { mode: 'angka',    label: 'Angka Kunci',        icon: '🔢', priority: 3, strand: 'language' },
  { mode: 'jebak',    label: 'Soal Jebak',         icon: '⚠️', priority: 3, strand: 'language' },
];

export function generateDailyMission() {
  const today = new Date().toISOString().slice(0, 10);
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
    dailyMission: p.dailyMission
      ? { ...p.dailyMission, completedAt: Date.now() }
      : null,
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
