# Husky pre-commit setup

One-time, run locally after cloning. Husky is deliberately **not** a repo dependency — it is not
in `package.json`'s devDependencies and there is no `.husky/` in the tree, so each dev opts in on
their own machine and CI never runs it.

```bash
npm install --save-dev husky
npx husky init
echo "npm run lint && npm test" > .husky/pre-commit
chmod +x .husky/pre-commit
```

That gates every commit on `lint` (zero warnings) + the full test suite.

## What this does not cover

`npm run validate` is the real gate — it adds `format:check`, the five audit scripts in
`scripts/`, and `build` on top of lint + test. CI (`ci.yml`) runs lint, test and build; nothing
in CI runs `format:check` or four of the five audits. Running the pieces individually is how
`format:check` came to be failing on 33 files, and `audit-integrity.mjs` to report 2876 phantom
issues on every run, for weeks unnoticed.

The hook above is deliberately the fast subset, so committing stays quick. **Run
`npm run validate` before pushing** — see `docs/AGENT_WORKFLOW.md` §3.
