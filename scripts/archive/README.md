# scripts/archive/ — One-Shot Migration Scripts

These scripts were used during content standardization (CS-01–CS-05) and are now complete.
They are kept for reference only. **Do not run them again** — they are destructive transforms
that were applied once to the source data.

| Script | Phase | What It Did |
|--------|-------|-------------|
| `split-cards.mjs` | CS-01 | Split `cards.js` into 8 track source files in `src/data/source/` |
| `migrate-cs02.mjs` | CS-02 | Removed `romaji` field, added `type` field to all 1,438 cards |
| `classify-cards.js` | CS-05 pre | Classified cards by source/type for the re-annotation pipeline |
| `curate-cards.js` | CS-05 pre | Curated/filtered card pool before agent re-annotation batches |
| `merge-agent-outputs.js` | CS-05 post | Merged 10-agent re-annotation outputs back into source files |
| `phase1_normalize.py` | Early | Initial normalization pass on raw card data (pre-CS pipeline) |

**Active scripts (still in `scripts/`):**
- `merge-cards.mjs` — used by `deploy.yml` to assemble `src/data/cards.js` from source files
- `audit-integrity.mjs` — used by `npm run audit:integrity`
