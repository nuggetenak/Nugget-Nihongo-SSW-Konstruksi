# scripts/archive/ — One-Shot Migration Scripts

These scripts were used during content standardization (CS-01–CS-05) and are now complete.
They are kept for reference only. **Do not run them again** — they are destructive transforms
that were applied once to the source data, against a tree that no longer looks like this one.

| Script | Phase | What It Did |
|--------|-------|-------------|
| `split-cards.mjs` | CS-01 | Split `cards.js` into per-track source files under `src/data/source/` (8 at the time; the Doboku/Kenchiku files were deleted in session 24, leaving the 2 that exist now) |
| `migrate-cs02.mjs` | CS-02 | Removed `romaji` field, added `type` field to all 1,438 cards |
| `classify-cards.js` | CS-05 pre | Classified cards by source/type for the re-annotation pipeline |
| `curate-cards.js` | CS-05 pre | Curated/filtered card pool before agent re-annotation batches |
| `merge-agent-outputs.js` | CS-05 post | Merged 10-agent re-annotation outputs back into source files |
| `phase1_normalize.py` | Early | Initial normalization pass on raw card data (pre-CS pipeline) |

## Active scripts (in `scripts/`, one level up)

Everything below is live and wired into an npm script. Nothing here is optional: `npm run
validate` runs all five audits, and `prebuild`/`postbuild` run the three build-time ones.

| Script | Run by | What it does |
|--------|--------|--------------|
| `merge-cards.mjs` | `prebuild` | Assembles `src/data/cards.js` from `src/data/source/` |
| `validate-data.mjs` | `prebuild` | Structural validation of the assembled data |
| `generate-precache.mjs` | `postbuild` | Writes the real `PRECACHE_URLS` (every built chunk) into `dist/sw.js` |
| `audit-integrity.mjs` | `npm run audit:integrity` | Card schema + `SOURCE_META` registry rot |
| `audit-css-vars.mjs` | `npm run audit:css-vars` | Every `var(--x)` has a definition |
| `audit-data-text.mjs` | `npm run audit:text` | Ruby markers (pooled, carried-over, malformed) + look-alike codepoints |
| `verify-content.mjs` | `npm run audit:content` | `cards.js` vs `source/`, **field by field** — dependency-free |
| `audit-related-ids.mjs` | `npm run audit:related-ids` | Every `related_card_id` resolves |
| `renumber-cards.mjs` | manual | One-off card-id renumbering helper; not in any npm script |

A script that is in no npm script is a script nobody runs: `audit-related-ids.mjs` died with
`ERR_MODULE_NOT_FOUND` on every invocation from the 2026-08-18 merge until 2026-09-04 without
anyone noticing, because nothing invoked it. If you add a script here, wire it into `audit:full`
or a build hook, and add its row above.
