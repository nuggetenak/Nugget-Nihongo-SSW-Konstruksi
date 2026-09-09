#!/usr/bin/env python3
# ─── scripts/archive/extract-jac-images.py ────────────────────────────────────
# One-shot. Produced the 12 files in public/images/jac-official/ from the four
# JAC Official sample-question PDFs the owner supplied on 2026-09-08. Kept for
# provenance: it records exactly which page of which PDF each asset came from,
# which is the part that cannot be recovered from the .webp files themselves.
#
# DO NOT RUN IT AGAIN. The source PDFs are not in this repository (they are
# JAC's, not ours) and the paths below point at a session upload directory that
# no longer exists. The generated assets are committed; that is the artefact.
#
# WHY A PAGE RENDER AND NOT AN IMAGE EXTRACT.  The obvious approach --
# pull the embedded raster with `extract_image(xref)` -- is wrong for this
# document, and silently so.  Two of the exam's own edits live on the page
# rather than in the image:
#
#   * st1_q10 ("青い矢印が指し示す設備の名前はどれか") draws its blue arrow as a
#     vector path ON TOP of the diagram. Extract the raster and the arrow is
#     gone -- the question then points at nothing and cannot be answered.
#   * Seven of the twelve pages paint white or grey rectangles over parts of the
#     photo, masking labels and photo credits that would otherwise give the
#     answer away. Those masks are page drawings too.
#
# So each asset is a clip render of the page region the image occupies, at 3x,
# which is what an exam candidate actually sees. Verified by eye against all
# twelve questions before committing.
#
# Encoding: 720px long edge, WebP q=78 -- 280.7 KB for all twelve. Measured, not
# guessed, in the same spirit as item 59's audio sizing. Deliberately NOT added
# to PRECACHE_URLS: `jac` is not one of the three high-traffic modes whose chunks
# are precached, so precaching its images while its 8.6 kB of code is fetched on
# demand would be incoherent. sw.js serves same-origin images cache-first, so
# they persist for offline use from the first JAC session onward, at zero cost
# to install size.
# ─────────────────────────────────────────────────────────────────────────────
import os

import pymupdf  # pip install pymupdf
from PIL import Image  # pip install Pillow

SRC = "<session upload dir>"  # the four PDFs, as supplied
DEST = "public/images/jac-official"

# (pdf, 0-based page, image xref, question id) -- the question id is the file
# name, so a reader can go from a broken image straight to the question.
MAPPING = [
    ("tt_sample.pdf", 9, 20, "tt1_q10"),  # 免震装置 (seismic isolator)
    ("tt_sample.pdf", 15, 35, "tt1_q16"),  # コンクリート打設工事
    ("tt_sample2.pdf", 1, 3, "tt2_q02"),  # タッチアンドコール
    ("tt_sample2.pdf", 17, 36, "tt2_q18"),  # 敷き均し作業 (asphalt finisher)
    ("tt_sample2.pdf", 21, 45, "tt2_q22"),  # 機械式継手
    ("st_sample_l.pdf", 1, 4, "st1_q02"),  # 電工ナイフ
    ("st_sample_l.pdf", 2, 9, "st1_q03"),  # パイプカッター
    ("st_sample_l.pdf", 3, 13, "st1_q04"),  # 屋外消火栓設備
    ("st_sample_l.pdf", 4, 17, "st1_q05"),  # 墨つぼ
    ("st_sample_l.pdf", 5, 21, "st1_q06"),  # レベル
    ("st_sample_l.pdf", 9, 31, "st1_q10"),  # 電柱 (blue-arrow diagram)
    ("st_sample2_l.pdf", 5, 11, "st2_q06"),  # 台車
]

# st1_q10's image rect on the page overlaps the question's furigana line, so the
# clip render carries a strip of text above the diagram. Fractions of the render.
CROP = {"st1_q10": (0.0, 0.095, 1.0, 0.93)}

RENDER_SCALE = 3.0
MAX_EDGE = 720
WEBP_QUALITY = 78


def main():
    os.makedirs(DEST, exist_ok=True)
    for pdf, page_index, xref, name in MAPPING:
        doc = pymupdf.open(os.path.join(SRC, pdf))
        page = doc[page_index]
        rect = page.get_image_rects(xref)[0]
        pixmap = page.get_pixmap(clip=rect, matrix=pymupdf.Matrix(RENDER_SCALE, RENDER_SCALE))
        tmp = f"/tmp/{name}.png"
        pixmap.save(tmp)
        doc.close()

        im = Image.open(tmp).convert("RGB")
        if name in CROP:
            left, top, right, bottom = CROP[name]
            w, h = im.size
            im = im.crop((int(left * w), int(top * h), int(right * w), int(bottom * h)))
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        out = os.path.join(DEST, f"{name}.webp")
        im.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
        print(f"{out}  {im.size[0]}x{im.size[1]}  {os.path.getsize(out) / 1024:.1f} KB")


if __name__ == "__main__":
    main()
