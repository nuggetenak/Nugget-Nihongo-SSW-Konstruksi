# FE-07-B: Husky Pre-commit Setup

Run once after cloning (not committed to repo — each dev runs locally):

```bash
npm install --save-dev husky
npx husky init
echo "npm run lint && npm test -- --run" > .husky/pre-commit
chmod +x .husky/pre-commit
```

This ensures `lint` + all tests pass before every commit.
