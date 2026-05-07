// ─── utils/recommend-mode.js ──────────────────────────────────────────────────
// A2: Smart Mode Recommendation Engine — pure function, no side effects.
// Returns a recommendation object based on current user state.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ srsState, sessions, streak, examDate }} opts
 * @returns {{ mode: string, icon: string, label: string, reason: string }}
 */
export function recommendMode({ srsState, sessions = [], streak = 0, examDate = null }) {
  const dueCount = srsState?.dueCount ?? 0;
  const matureCount = srsState?.stats?.mature ?? 0;

  // Days until exam
  let daysUntilExam = null;
  if (examDate) {
    const diff = new Date(examDate) - new Date();
    daysUntilExam = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Average quiz accuracy from recent sessions (last 10)
  const recentQuiz = sessions
    .filter((s) => ['kuis', 'jac', 'wayground'].includes(s.mode) && s.total > 0)
    .slice(-10);
  const avgAcc = recentQuiz.length > 0
    ? recentQuiz.reduce((acc, s) => acc + (s.correct / s.total) * 100, 0) / recentQuiz.length
    : null;

  // Best sim score
  const simSessions = sessions.filter((s) => s.mode === 'simulasi' && s.total > 0);
  const bestSim = simSessions.length > 0
    ? Math.max(...simSessions.map((s) => Math.round((s.correct / s.total) * 100)))
    : 0;

  // Rules (ordered by priority)
  if (daysUntilExam !== null && daysUntilExam <= 7 && daysUntilExam >= 0) {
    return { mode: 'simulasi', icon: '🎯', label: 'Simulasi Ujian', reason: `${daysUntilExam} hari menuju ujian — saatnya simulasi!` };
  }
  if (dueCount >= 20) {
    return { mode: 'ulasan', icon: '🔁', label: 'Ulasan SRS', reason: `${dueCount} kartu jatuh tempo — prioritaskan ulasan dulu` };
  }
  if (streak === 0) {
    return { mode: 'kartu', icon: '🃏', label: 'Mode Kartu', reason: 'Mulai hari ini dengan review kartu singkat' };
  }
  if (avgAcc !== null && avgAcc < 60) {
    return { mode: 'sprint', icon: '⚡', label: 'Sprint Mode', reason: `Akurasi kuis ${Math.round(avgAcc)}% — sprint dulu untuk membangun kecepatan` };
  }
  if (daysUntilExam !== null && daysUntilExam <= 30) {
    if (bestSim < 65) {
      return { mode: 'simulasi', icon: '📝', label: 'Simulasi Ujian', reason: `Skor simulasi ${bestSim}% — perlu latihan lebih sebelum ujian` };
    }
    return { mode: 'jac', icon: '📋', label: 'Soal JAC', reason: 'Perkuat dengan soal resmi JAC sebelum ujian' };
  }
  if (matureCount < 100) {
    return { mode: 'ulasan', icon: '🌱', label: 'Ulasan SRS', reason: 'Kembangkan kartu SRS matang untuk fondasi yang kuat' };
  }
  if (dueCount > 0) {
    return { mode: 'ulasan', icon: '🔁', label: 'Ulasan SRS', reason: `${dueCount} kartu siap diulang` };
  }
  return { mode: 'kuis', icon: '❓', label: 'Mode Kuis', reason: 'Uji kemampuanmu dengan kuis baru hari ini' };
}
