// ─── tests/genba-scenes.test.jsx ─────────────────────────────────────────────
// UI_UX_PLAN item 105. Three things are worth holding here, and only the first is
// about the mode.
//
// 1. THE THREAD. A scene's beats are ordered and that order is load-bearing —
//    「4つ足りません」 is the right answer in `busoku` only because the beat before
//    it asked 「いくつ足りない？」. `buildBeat` must never shuffle beats, only the
//    options within one, and `useMemo(..., [scene])` must map them in source
//    order. A regression here would look like a working mode.
//
// 2. THE LINK TO ITEM 103. The plan blocked 105 on 103 because a scenario is
//    authored dialogue in a register the corpus did not have. Now that it does,
//    the two files should share lines: meet a phrase alone, then find it inside a
//    shift where something depends on it. Asserted, so they cannot drift into two
//    unrelated corpora teaching two unrelated registers.
//
// 3. THE SAME SPLIT genba-phrases.js HAS. Actions for a line you hear, Japanese
//    for one you say — by character class, for the same reason.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkenarioMode, { buildBeat } from '../modes/SkenarioMode.jsx';
import { GENBA_SCENES } from '../data/genba-scenes.js';
import { GENBA_PHRASES } from '../data/genba-phrases.js';
import { MODE_COMPONENTS, MODE_META, MODE_SECTIONS } from '../router/modes.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { init, _reset_for_test } from '../storage/engine.js';

vi.mock('../modes/SkenarioMode.module.css', () => ({
  default: new Proxy({}, { get: (_, k) => k }),
}));

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

// SceneView writes a miss through useProgress, so the thread tests need the real
// provider. Rendered rather than mocked: the write path is item 129's bridge, and
// a stub would prove nothing about it.
const renderMode = () => render(<SkenarioMode />, { wrapper: ProgressProvider });

const ALL_BEATS = GENBA_SCENES.flatMap((s) =>
  s.beats.map((b, i) => ({ ...b, _at: `${s.id}#${i}` }))
);
const HAS_JP = /[ぁ-ゟァ-ヺー一-龯]/;

describe('the corpus', () => {
  it('is six scenes of ordered beats, each with a question and four options', () => {
    expect(GENBA_SCENES.length).toBeGreaterThanOrEqual(6);
    for (const s of GENBA_SCENES) {
      for (const f of ['id', 'emoji', 'title', 'id_title', 'setting']) {
        expect(String(s[f] ?? '').trim(), `${s.id} has empty ${f}`).not.toBe('');
      }
      expect(s.beats.length, `${s.id} is too short to be a thread`).toBeGreaterThanOrEqual(4);
      for (const b of s.beats) {
        expect(b.traps, `${s.id}: a beat has ${b.traps?.length} traps`).toHaveLength(3);
        for (const f of ['jp', 'id_text', 'ask', 'note']) {
          expect(String(b[f] ?? '').trim(), `${s.id}: a beat has empty ${f}`).not.toBe('');
        }
      }
    }
  });

  it('has unique scene ids', () => {
    const ids = GENBA_SCENES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('runs both directions in every scene, so no scene is one-sided', () => {
    // A scene of nothing but foreman lines is a listening drill; one of nothing
    // but your own lines has no thread to follow. Both halves, every scene.
    for (const s of GENBA_SCENES) {
      const speakers = new Set(s.beats.map((b) => b.speaker));
      expect([...speakers].sort(), `${s.id} is one-directional`).toEqual(['sagyouin', 'shokucho']);
    }
  });

  it('keeps actions and phrases on their own sides of the split', () => {
    for (const b of ALL_BEATS) {
      if (b.speaker === 'shokucho') {
        expect(b.answer, `${b._at} is heard but has no action`).toBeTruthy();
        for (const o of [b.answer, ...b.traps]) {
          expect(HAS_JP.test(o), `${b._at} offers Japanese where an action belongs: ${o}`).toBe(
            false
          );
        }
      } else {
        expect(b.answer, `${b._at} duplicates its answer`).toBeUndefined();
        for (const o of [b.jp, ...b.traps]) {
          expect(HAS_JP.test(o), `${b._at} offers a non-Japanese option: ${o}`).toBe(true);
        }
      }
    }
  });
});

describe('the link back to item 103', () => {
  it('shares lines with the phrase corpus rather than starting a second one', () => {
    // 6 of the 14 spoken beats are phrases genba-phrases.js already drills, and
    // the other 8 only make sense in their thread (4つ足りません, 4か所残っています).
    // The floor is what matters: if it hits zero the two files have drifted.
    const known = new Set(GENBA_PHRASES.map((p) => stripFuri(p.jp)));
    const said = ALL_BEATS.filter((b) => b.speaker === 'sagyouin');
    const shared = said.filter((b) => known.has(stripFuri(b.jp)));
    expect(
      shared.length,
      'no scene line appears in genba-phrases.js any more'
    ).toBeGreaterThanOrEqual(5);
    // And not every one, or the scenes would add nothing the drill does not.
    expect(shared.length).toBeLessThan(said.length);
  });
});

describe('buildBeat', () => {
  it('marks the action correct for a heard line and the phrase for a spoken one', () => {
    for (const b of ALL_BEATS) {
      for (let i = 0; i < 20; i++) {
        const q = buildBeat(b);
        const want = b.speaker === 'shokucho' ? b.answer : stripFuri(b.jp);
        expect(q.options[q.correctIdx].text, b._at).toBe(want);
        expect(new Set(q.options.map((o) => o.text)).size, `${b._at} repeats an option`).toBe(4);
        for (const o of q.options) expect(o.text, b._at).not.toContain('《');
      }
    }
  });
});

describe('the scene runs as a thread', () => {
  const scene = GENBA_SCENES[0];

  it('opens on the picker, listing every scene with its setting', () => {
    renderMode();
    expect(screen.getByText(scene.id_title)).toBeTruthy();
    expect(screen.getByText(scene.setting)).toBeTruthy();
  });

  it('starts at the first beat in source order, not a shuffled one', () => {
    renderMode();
    fireEvent.click(screen.getByText(scene.id_title));
    expect(screen.getByText(scene.beats[0].ask)).toBeTruthy();
    // The second beat's question must not be on screen yet.
    expect(screen.queryByText(scene.beats[1].ask)).toBeNull();
  });

  it('adds the answered beat to the transcript and moves to the next one', () => {
    renderMode();
    fireEvent.click(screen.getByText(scene.id_title));

    const first = buildBeat(scene.beats[0]);
    // Pick any option — right or wrong, the beat joins the transcript either way,
    // because the thread has to stay readable after a miss.
    fireEvent.click(screen.getByText(first.options[0].text));
    fireEvent.click(screen.getByText(/Lanjut/));

    expect(screen.getByText(scene.beats[1].ask)).toBeTruthy();
    // The first beat's meaning is now in the transcript above.
    expect(screen.getByText(scene.beats[0].id_text)).toBeTruthy();
  });

  it('shows the phrase with its readings once an answer is in', () => {
    // The options are stripped (OptionButton prints them, QuizAnnouncer speaks
    // them), so this panel is the only place the reading is taught.
    renderMode();
    fireEvent.click(screen.getByText(scene.id_title));
    const first = buildBeat(scene.beats[0]);
    expect(screen.queryByText(scene.beats[0].note)).toBeNull();
    fireEvent.click(screen.getByText(first.options[0].text));
    expect(screen.getByText(scene.beats[0].note)).toBeTruthy();
  });
});

describe('the registry entry', () => {
  it('is registered, described, and reachable from the menu', () => {
    expect(MODE_COMPONENTS.skenario).toBeTruthy();
    expect(MODE_META.skenario?.label).toBe('Skenario');
    expect(MODE_META.skenario?.strand).toBe('fluency');
    expect(Object.values(MODE_SECTIONS).flatMap((s) => s.modes)).toContain('skenario');
  });
});
