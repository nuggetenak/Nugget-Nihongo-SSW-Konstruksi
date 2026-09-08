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
import S from './QuestionPhoto.module.css';

export default function QuestionPhoto({ img, photoDesc, hasPhoto }) {
  if (img) {
    return (
      <figure className={S.figure}>
        <div className={S.frame}>
          <img
            className={S.img}
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
