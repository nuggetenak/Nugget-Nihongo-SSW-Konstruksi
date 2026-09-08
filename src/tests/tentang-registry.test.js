// ─── tests/tentang-registry.test.js ──────────────────────────────────────────
// Registry contract for the `tentang` mode. Its absence from MODE_SECTIONS is a
// decision, not an oversight, so it is asserted here -- otherwise a future
// session "fixing" the missing section entry would look like tidying up.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { MODE_COMPONENTS, MODE_META, MODE_SECTIONS } from '../router/modes.js';
import { MISSION_MODES } from '../utils/daily-mission.js';

describe('tentang', () => {
  it('has a component, metadata, an icon key and a skeleton shape', () => {
    expect(MODE_COMPONENTS.tentang).toBeTruthy();
    const m = MODE_META.tentang;
    expect(m?.label).toBe('Tentang Aplikasi');
    expect(m?.ui).toBeTruthy();
    expect(m?.skeleton).toBeTruthy();
    expect(m?.width).toBeTruthy();
  });

  it('carries no strand, so it can never be handed out as a daily mission', () => {
    // A reference surface has no end to reach; a mission must be finishable.
    expect(MODE_META.tentang.strand).toBeNull();
    expect(MISSION_MODES).not.toContain('tentang');
  });

  it('is deliberately absent from the Belajar menu and the side nav', () => {
    const listed = Object.values(MODE_SECTIONS).flatMap((s) => s.modes);
    expect(listed).not.toContain('tentang');
  });

  it('every mode the guide renders resolves to real metadata', () => {
    // The guide iterates MODE_SECTIONS and reads MODE_META; a section naming a
    // mode with no metadata would render a blank row.
    for (const sec of Object.values(MODE_SECTIONS)) {
      for (const key of sec.modes) {
        expect(MODE_META[key], `${key} has no MODE_META`).toBeTruthy();
        expect(MODE_META[key].desc, `${key} has no desc`).toBeTruthy();
      }
    }
  });
});
