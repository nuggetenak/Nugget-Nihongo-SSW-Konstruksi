// ─── tests/backup-state.test.js ──────────────────────────────────────────────
// Item 108. Progress is local-only — no account, no sync, nothing off the
// device — and the learner was only told at the moment it cost them something:
// a new phone, a cleared browser, a reinstall. By then the SRS history behind a
// visa-relevant exam is gone. `ekspor` already did the work; saying so was
// missing.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { _reset_for_test, init, get } from '../storage/engine.js';
import {
  markBackedUp,
  getLastBackupAt,
  describeBackup,
  BACKUP_STALE_DAYS,
} from '../utils/backup-state.js';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 86400000;

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('backup state (item 108)', () => {
  it('reads as never on a fresh install, which is the truthful answer', () => {
    expect(getLastBackupAt()).toBeNull();
    expect(describeBackup().state).toBe('never');
  });

  it('says plainly that there is no sync, in every state', () => {
    const now = Date.now();
    for (const at of [null, now, now - 60 * DAY]) {
      expect(describeBackup(now, at).sub).toMatch(/hanya tersimpan di HP ini/);
    }
  });

  it('warns about what is lost only when nothing has been backed up', () => {
    expect(describeBackup().sub).toMatch(/progress hilang/i);
    expect(describeBackup(Date.now(), Date.now()).sub).not.toMatch(/progress hilang/i);
  });

  it('records a backup and reads it back', () => {
    const at = Date.now() - 2 * DAY;
    markBackedUp(at);
    expect(getLastBackupAt()).toBe(at);
    expect(get('prefs').lastBackupAt).toBe(at);
  });

  it('counts the days in words a learner would use', () => {
    const now = Date.now();
    expect(describeBackup(now, now).value).toMatch(/hari ini/);
    expect(describeBackup(now, now - DAY).value).toMatch(/kemarin/);
    expect(describeBackup(now, now - 5 * DAY).value).toMatch(/5 hari lalu/);
  });

  it('treats a long-stale backup as its own state, not as safe', () => {
    // "Backed up once, eight months ago" is closer to never than to safe and
    // must not wear the same tick.
    const now = Date.now();
    expect(describeBackup(now, now - (BACKUP_STALE_DAYS - 1) * DAY).state).toBe('ok');
    expect(describeBackup(now, now - BACKUP_STALE_DAYS * DAY).state).toBe('stale');
    expect(describeBackup(now, now - 240 * DAY).value).toMatch(/⚠️/);
  });

  it('never reports a negative age from a clock that moved backwards', () => {
    const now = Date.now();
    expect(describeBackup(now, now + 5 * DAY).days).toBe(0);
  });

  it('ignores a corrupt stored value rather than rendering it', () => {
    for (const bad of ['yesterday', NaN, Infinity, {}]) {
      const prefs = get('prefs');
      localStorage.setItem('ssw-prefs', JSON.stringify({ ...prefs, lastBackupAt: bad }));
      _reset_for_test();
      init();
      expect(getLastBackupAt()).toBeNull();
    }
  });

  it('every path that makes a backup records one', () => {
    // Export from Saya, export from Ekspor, and a Gist push — the third is
    // arguably the most important, being the only one that leaves the device.
    const files = ['components/SayaTab.jsx', 'modes/ExportMode.jsx'];
    const src = files.map((f) => readFileSync(resolve(SRC, f), 'utf-8')).join('\n');
    expect((src.match(/markBackedUp\(\)/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
});
