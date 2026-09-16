// ─── QuestionPhoto.jsx ───────────────────────────────────────────────────────
// The picture half of a JAC Official question.
//
// Twelve of the 95 official questions are unanswerable without one: 写真の道具の
// 名前はどれか ("which is the tool in the photo?") shipped with no photo, and
// 青い矢印が指し示す設備 ("the equipment the blue arrow points at") shipped with
// no arrow. What stood in for them was `photoDesc`, a written description --
// which on five of the twelve named the correct answer outright, so the
// substitute was worse than the gap on the questions it covered.
//
// With a real image, `photoDesc` becomes the image's alt text and nothing else.
// It is still the fallback when a question is marked as having a photo we do not
// have (`hasPhoto` with no `img`), which is how any future question enters the
// bank before its asset does.
//
// The box reserves its height from the aspect ratio before the image loads.
// That is not cosmetic: without it the options row jumps down the moment the
// photo arrives, and on a slow connection the tap that was heading for option 1
// lands on option 2. 4/3 is the ratio eight of the twelve assets already have;
// the four wider ones letterbox inside it rather than resizing the card.
import { useState, useEffect, useRef } from 'react';
import S from './QuestionPhoto.module.css';

export default function QuestionPhoto({ img, photoDesc, hasPhoto }) {
  // item 168. The frame already reserves the photo's height, so nothing MOVES
  // when the file arrives -- it simply appears, at full strength, in a box that
  // was empty a moment ago. On a slow connection that reads as a glitch rather
  // than as a load completing. A fade is the difference between the two, and it
  // is the only motion this component wants: anything that changed the frame's
  // size would undo the layout guarantee the frame exists for.
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Keyed on `img` rather than on mounting, because neither caller remounts
  // this: QuizShell and SimulasiMode both render one <QuestionPhoto> and change
  // its props as the question advances. Without the reset, `loaded` would still
  // be true from the previous photo and every photo after the first would skip
  // its fade -- and `complete` covers the opposite case, a cached image that
  // finished before this ran, where onLoad has already fired into nothing and
  // the photo would otherwise stay invisible for good.
  useEffect(() => {
    if (!img) return;
    setLoaded(imgRef.current?.complete === true);
  }, [img]);

  if (img) {
    return (
      <figure className={S.figure}>
        <div className={S.frame}>
          <img
            ref={imgRef}
            className={S.img}
            data-loaded={loaded}
            onLoad={() => setLoaded(true)}
            src={`${import.meta.env.BASE_URL}${img}`}
            alt={photoDesc || 'Foto soal ujian JAC'}
          />
        </div>
        <figcaption className={S.caption}>Foto: soal resmi JAC</figcaption>
      </figure>
    );
  }
  if (!hasPhoto) return null;
  return (
    <div className={S.fallback}>
      📷 Soal ini aslinya menggunakan foto/diagram dari buku JAC. Keterangan:{' '}
      {photoDesc || 'Lihat buku ujian JAC.'}
    </div>
  );
}
