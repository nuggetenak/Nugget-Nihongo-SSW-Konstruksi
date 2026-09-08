// ─── tests/release-notes.test.js ─────────────────────────────────────────────
// The patch notes are hand-written for users, not generated from CHANGELOG.md.
// These hold the two properties that matter: the list describes the build it
// ships in, and it stays in the register a learner can read.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { RELEASE_NOTES, hasUnseenReleaseNotes } from '../data/release-notes.js';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const real = RELEASE_NOTES.filter((r) => r.date !== null);

describe('the list describes this build', () => {
  it('the newest entry is the version package.json actually ships', () => {
    // Read from package.json, not __APP_VERSION__, so this holds even if the
    // vitest define is ever removed. This is the assertion that stops a release
    // shipping notes that omit itself -- which is the whole point of the badge.
    expect(RELEASE_NOTES[0].version).toBe(pkg.version);
  });

  it('is ordered newest first', () => {
    const nums = real.map((r) => r.version.split('.').map(Number));
    for (let i = 1; i < nums.length; i++) {
      const [a, b] = [nums[i - 1], nums[i]];
      const cmp = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      expect(cmp).toBeGreaterThan(0);
    }
  });

  it('lists the summary entry last and gives it no date', () => {
    expect(RELEASE_NOTES.at(-1).date).toBeNull();
    expect(RELEASE_NOTES.slice(0, -1).every((r) => r.date)).toBe(true);
  });

  it('has no duplicate versions', () => {
    const v = RELEASE_NOTES.map((r) => r.version);
    expect(new Set(v).size).toBe(v.length);
  });

  it('every entry has a title and at least one change line', () => {
    for (const r of RELEASE_NOTES) {
      expect(r.title?.length, `${r.version} has no title`).toBeGreaterThan(0);
      expect(r.changes?.length, `${r.version} has no changes`).toBeGreaterThan(0);
    }
  });
});

describe('it speaks to a user, not to a maintainer', () => {
  // Blunt on purpose. CHANGELOG.md is 1,482 lines of exactly this vocabulary,
  // and pasting a paragraph across is the obvious way this file goes wrong.
  const BANNED =
    /\b(item \d|commit|refactor|migration|regression|ts-fsrs|FSRS SRS|Rating enum|storage v\d|STORAGE_VERSION)\b/i;

  it('uses no maintainer vocabulary anywhere', () => {
    for (const r of RELEASE_NOTES) {
      for (const line of [r.title, ...r.changes]) {
        expect(line, `"${line}"`).not.toMatch(BANNED);
      }
    }
  });

  it('mentions no source filenames', () => {
    for (const r of RELEASE_NOTES) {
      for (const line of [r.title, ...r.changes]) {
        expect(line).not.toMatch(/\.(js|jsx|css|mjs|md)\b/);
      }
    }
  });
});

describe('hasUnseenReleaseNotes', () => {
  const V = '7.2.0';
  it('badges when the key is absent — everyone who upgraded into this feature', () => {
    expect(hasUnseenReleaseNotes({}, V)).toBe(true);
    expect(hasUnseenReleaseNotes(undefined, V)).toBe(true);
  });
  it('badges when the stored version is older', () => {
    expect(hasUnseenReleaseNotes({ lastSeenVersion: '7.1.0' }, V)).toBe(true);
  });
  it('badges on a fresh install, where the default is null', () => {
    expect(hasUnseenReleaseNotes({ lastSeenVersion: null }, V)).toBe(true);
  });
  it('stops badging once the notes have been opened', () => {
    expect(hasUnseenReleaseNotes({ lastSeenVersion: V }, V)).toBe(false);
  });
});
