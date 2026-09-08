// ─── tests/jac-question-images.test.js ───────────────────────────────────────
// Twelve of the 95 JAC Official questions cannot be answered from their text:
// 写真の道具の名前はどれか names a photo, 青い矢印が指し示す設備 names an arrow.
// They shipped for months with `img: null` and a written description standing in
// for the picture -- and on five of them that description named the answer.
//
// What this holds:
//   1. Every question whose stem refers to a picture has one.
//   2. Every `img` path resolves to a file that is actually in the repository.
//      A quiz image is not like a decorative asset: a 404 here is an
//      unanswerable question, and nothing else in the pipeline would notice --
//      `public/` is copied verbatim by Vite, so a typo'd or deleted file fails
//      no build and no audit.
//   3. No description gives the answer away, in either direction: it is the
//      image's alt text now, so a leak here is a leak to screen-reader users
//      specifically.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JAC_OFFICIAL } from '../data/jac-official.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const strip = (s) => String(s).replace(/《[^》]*》/g, '');

// The stem words that mean "look at the picture". A question containing one of
// these is unanswerable without an asset.
const PICTURE_WORDS = ['写真', '矢印', '図'];
const picture = JAC_OFFICIAL.filter((q) => PICTURE_WORDS.some((w) => q.q.includes(w)));

describe('JAC Official question images', () => {
  it('every question that refers to a picture carries one', () => {
    const missing = picture.filter((q) => !q.img).map((q) => q.id);
    expect(missing).toEqual([]);
    expect(picture.length).toBe(12);
  });

  it('every img path resolves to a file in public/', () => {
    const withImg = JAC_OFFICIAL.filter((q) => q.img);
    expect(withImg.length).toBe(12);
    const broken = withImg
      .filter((q) => !existsSync(path.join(ROOT, 'public', q.img)))
      .map((q) => `${q.id} -> ${q.img}`);
    expect(broken).toEqual([]);
  });

  it('img paths are relative, so BASE_URL can be prefixed for GitHub Pages', () => {
    // `${import.meta.env.BASE_URL}${img}` is how QuestionPhoto builds the src,
    // and BASE_URL already ends in a slash. A leading slash here would produce
    // `//images/...` and break the deployed subpath.
    for (const q of JAC_OFFICIAL.filter((x) => x.img)) {
      expect(q.img.startsWith('/')).toBe(false);
      expect(q.img).toMatch(/^images\/jac-official\/[a-z0-9_]+\.webp$/);
      expect(q.img).toContain(q.id); // the file is named after its question
    }
  });

  it('a picture question has an alt description, and it is not the answer', () => {
    for (const q of picture) {
      expect(q.photoDesc, `${q.id} has no photoDesc`).toBeTruthy();
      const desc = q.photoDesc;
      const answer = strip(q.opts[q.ans]);
      // The description must not contain the correct option's text, and must not
      // contain any option's text -- naming a wrong one is a giveaway too.
      expect(desc, `${q.id} names its answer`).not.toContain(answer);
      for (const opt of q.opts) {
        const t = strip(opt);
        if (t.length >= 3) expect(desc, `${q.id} names option "${t}"`).not.toContain(t);
      }
    }
  });

  it('descriptions carry no emoji prefix — the renderer adds its own', () => {
    // The data used to start '📷 Foto:' / '📸 FOTO:' while both call sites
    // prefixed another 📷, so the fallback box read "📷 📷 Foto: ...".
    for (const q of picture) {
      expect(q.photoDesc.startsWith('📷')).toBe(false);
      expect(q.photoDesc.startsWith('📸')).toBe(false);
    }
  });

  it('no non-picture question claims an image', () => {
    const stray = JAC_OFFICIAL.filter(
      (q) => q.img && !PICTURE_WORDS.some((w) => q.q.includes(w))
    ).map((q) => q.id);
    expect(stray).toEqual([]);
  });
});
