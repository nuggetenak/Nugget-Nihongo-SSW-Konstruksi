// ─── utils/backup-state.js ───────────────────────────────────────────────────
// Item 108. Progress is local-only: no account, no sync, nothing off this
// device. That is a reasonable design for an offline-first PWA on a cheap
// Android handset — but the learner is only told about it at the moment it costs
// them something, which is a new phone, a cleared browser, or a reinstall, and
// by then the SRS history behind a visa-relevant exam is gone.
//
// `ekspor` already does all the work. What was missing was saying so, and saying
// when it last happened.
//
// `prefs.lastBackupAt` is additive — an install without it reads as "never",
// which is the truthful answer for anyone who has not exported — so there is no
// migration and STORAGE_VERSION is untouched.
// ─────────────────────────────────────────────────────────────────────────────
import { get as storageGet, set as storageSet } from '../storage/engine.js';

/** A backup older than this is stale enough to say so. */
export const BACKUP_STALE_DAYS = 30;

const DAY_MS = 86400000;

/** Record that a backup just succeeded. Called from every path that makes one. */
export function markBackedUp(at = Date.now()) {
  // Functional, not read-then-write-the-whole-doc. That second shape is what
  // item 121 fixed in both contexts, where it silently destroyed data; here it
  // reads the live cache immediately before writing, so it was never actually
  // stale. It is changed anyway because a reader cannot tell those two cases
  // apart at a glance, and the next person to copy this line may not be so
  // lucky about the gap between the read and the write.
  storageSet('prefs', (p) => ({ ...p, lastBackupAt: at }));
}

/** Epoch ms of the last successful backup, or null if there has never been one. */
export function getLastBackupAt() {
  const v = storageGet('prefs')?.lastBackupAt;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * How to describe the backup state, in Indonesian, for the Saya tab.
 *
 * Three states rather than two, because "backed up once, eight months ago" is
 * closer to "never" than to "safe" and should not wear the same tick.
 *
 * @returns {{ state: 'never'|'stale'|'ok', value: string, sub: string, days: number|null }}
 */
export function describeBackup(now = Date.now(), at = getLastBackupAt()) {
  const LOCAL_ONLY = 'Progress hanya tersimpan di HP ini — tidak ada akun atau sinkronisasi.';

  if (at === null) {
    return {
      state: 'never',
      value: '⚠️ Belum pernah',
      sub: `${LOCAL_ONLY} Ganti HP atau hapus data browser = progress hilang.`,
      days: null,
    };
  }

  const days = Math.max(0, Math.floor((now - at) / DAY_MS));
  const when = days === 0 ? 'hari ini' : days === 1 ? 'kemarin' : `${days} hari lalu`;

  if (days >= BACKUP_STALE_DAYS) {
    return {
      state: 'stale',
      value: `⚠️ ${when}`,
      sub: `${LOCAL_ONLY} Cadangan terakhir sudah lama — sebaiknya ekspor lagi.`,
      days,
    };
  }
  return { state: 'ok', value: `✅ ${when}`, sub: LOCAL_ONLY, days };
}
