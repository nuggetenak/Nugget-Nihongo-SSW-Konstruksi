// ─── tests/nav-transition.test.js ────────────────────────────────────────────
// item 153 (the shared-element morph) and item 154 (direction and character).
//
// What a jsdom test can and cannot hold here is worth stating, because the
// tempting test is the useless one. jsdom has no View Transitions API and no
// ::view-transition pseudo tree, so nothing in this file can assert that
// anything MOVED -- that is item 147's lesson written down, and the reason the
// real verification for both items is a Chromium harness that reads the live
// pseudo-element tree mid-flight.
//
// What this holds is the contract around the animation: the attributes the CSS
// keys off are set before the transition and gone after it, the morph's source
// is named and un-named in every exit path including the ones where no
// transition runs at all, and every section has a flavour to be given.
//
// The un-naming is the one with teeth. `view-transition-name` has to be UNIQUE
// among rendered elements when a snapshot is taken, so ONE leaked name does not
// break one transition -- it breaks every transition after it, permanently, for
// the life of the page.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withViewTransition, markMorphSource } from '../utils/motion.js';
import { MODE_SECTIONS, sectionOf } from '../router/modes.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const root = document.documentElement;

beforeEach(() => {
  delete root.dataset.navDir;
  delete root.dataset.navFlavor;
  delete root.dataset.navMorph;
  delete root.dataset.motion;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
afterEach(() => {
  delete document.startViewTransition;
});

describe('sectionOf', () => {
  it('finds the section for a mode in every group', () => {
    expect(sectionOf('kartu')).toBe('pelajari');
    expect(sectionOf('kuis')).toBe('latihan');
    expect(sectionOf('simulasi')).toBe('ujian');
    expect(sectionOf('ulasan')).toBe('ulasan');
    expect(sectionOf('stats')).toBe('alat');
  });

  it('returns null for the modes that deliberately belong to no section', () => {
    // Reached from Saya, not from the study menu. Null is the right answer, not
    // a gap: they fall back to the plain directional transition.
    expect(sectionOf('tentang')).toBeNull();
    expect(sectionOf('gerakan')).toBeNull();
  });

  it('agrees with MODE_SECTIONS for every mode it lists', () => {
    for (const [key, section] of Object.entries(MODE_SECTIONS)) {
      for (const m of section.modes) expect(sectionOf(m), m).toBe(key);
    }
  });
});

describe('every section has a transition character', () => {
  // A new section added to MODE_SECTIONS without a flavour rule would silently
  // fall back to the default slide -- which looks fine, which is why nobody
  // would notice that the grouping had stopped meaning anything.
  const css = readFileSync(resolve(__dirname, '../styles/global.css'), 'utf-8');

  it.each(Object.keys(MODE_SECTIONS))('%s has a flavour rule in global.css', (key) => {
    expect(css).toContain(`[data-nav-flavor='${key}']`);
  });

  it('a tab switch has one too, and it carries no direction', () => {
    expect(css).toContain("[data-nav-flavor='tab']");
  });
});

describe('withViewTransition marks the root and cleans up after itself', () => {
  it('sets dir and flavor for the transition and clears both when it settles', async () => {
    let settle;
    const finished = new Promise((r) => (settle = r));
    document.startViewTransition = vi.fn((cb) => {
      cb();
      return { finished };
    });

    withViewTransition(() => {}, undefined, { dir: 'forward', flavor: 'ujian' });
    expect(root.dataset.navDir).toBe('forward');
    expect(root.dataset.navFlavor).toBe('ujian');

    settle();
    await finished;
    await Promise.resolve();
    expect(root.dataset.navDir).toBeUndefined();
    expect(root.dataset.navFlavor).toBeUndefined();
  });

  it('clears them when the transition is SKIPPED, not only when it completes', async () => {
    // `finished` rejects on a skip (another transition starts, the tab is
    // hidden). A stale data-nav-dir would point the NEXT navigation the wrong
    // way, which is worse than having no direction at all.
    let reject;
    const finished = new Promise((_, r) => (reject = r));
    finished.catch(() => {});
    document.startViewTransition = vi.fn((cb) => {
      cb();
      return { finished };
    });

    withViewTransition(() => {}, undefined, { dir: 'back', flavor: 'alat' });
    expect(root.dataset.navDir).toBe('back');

    reject(new Error('skipped'));
    await finished.catch(() => {});
    await Promise.resolve();
    expect(root.dataset.navDir).toBeUndefined();
    expect(root.dataset.navFlavor).toBeUndefined();
  });

  it('runs the update and sets nothing when the API is absent', () => {
    const ran = [];
    withViewTransition(() => ran.push('x'), undefined, { dir: 'forward', flavor: 'ujian' });
    expect(ran).toEqual(['x']);
    expect(root.dataset.navDir).toBeUndefined();
  });
});

describe('markMorphSource', () => {
  function card() {
    const el = document.createElement('button');
    el.innerHTML = '<span data-morph="icon"></span><span data-morph="label">Kartu</span>';
    document.body.appendChild(el);
    return el;
  }
  const names = (el) =>
    [...el.querySelectorAll('[data-morph]')].map((n) => n.style.viewTransitionName);

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('names the tapped card’s icon and label, and flags the root', () => {
    document.startViewTransition = vi.fn((cb) => {
      cb();
      return { finished: Promise.resolve() };
    });
    const el = card();
    markMorphSource(el);
    expect(names(el)).toEqual(['morph-icon', 'morph-title']);
    expect(root.dataset.navMorph).toBe('1');
  });

  it('un-names them when the transition settles', async () => {
    const finished = Promise.resolve();
    document.startViewTransition = vi.fn((cb) => {
      cb();
      return { finished };
    });
    const el = card();
    markMorphSource(el);
    withViewTransition(() => {}, undefined, { dir: 'forward' });
    await finished;
    await Promise.resolve();
    expect(names(el)).toEqual(['', '']);
    expect(root.dataset.navMorph).toBeUndefined();
  });

  it('un-names them even when no transition runs at all', () => {
    // The path that would otherwise leak: markMorphSource fires on the tap,
    // then withViewTransition finds no API (or motion off) and returns early.
    // A name left behind here disables the morph for the rest of the page.
    document.startViewTransition = vi.fn((cb) => {
      cb();
      return { finished: Promise.resolve() };
    });
    const el = card();
    markMorphSource(el);
    delete document.startViewTransition; // the early-out branch
    withViewTransition(() => {}, undefined, { dir: 'forward' });
    expect(names(el)).toEqual(['', '']);
    expect(root.dataset.navMorph).toBeUndefined();
  });

  it('does nothing when the reader has turned shared-element motion off', () => {
    document.startViewTransition = vi.fn();
    root.setAttribute('data-motion-no-shared', '');
    const el = card();
    markMorphSource(el);
    expect(names(el)).toEqual(['', '']);
    expect(root.dataset.navMorph).toBeUndefined();
    root.removeAttribute('data-motion-no-shared');
  });
});
