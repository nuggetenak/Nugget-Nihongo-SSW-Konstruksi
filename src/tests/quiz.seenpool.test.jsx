// ─── tests/quiz.seenpool.test.jsx ────────────────────────────────────────────
// A.1: Verify seenPool is instance-scoped (useRef), not module-scope.
// BUG-02 fix: module-scope Set persisted across mode entries in production.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const quizModeSource = readFileSync(
  resolve(__dirname, '../modes/QuizMode.jsx'),
  'utf-8'
);

describe('A.1 BUG-02 — seenPool scope fix', () => {
  it('does NOT declare _seenPool at module scope', () => {
    // Module-scope const would be outside any function body
    // The old buggy pattern: "const _seenPool = new Set();" at top level
    expect(quizModeSource).not.toMatch(/^const _seenPool/m);
  });

  it('declares seenPool as useRef inside the component', () => {
    expect(quizModeSource).toMatch(/useRef\(new Set\(\)\)/);
  });

  it('imports useRef from react', () => {
    expect(quizModeSource).toMatch(/useRef/);
    expect(quizModeSource).toMatch(/from 'react'/);
  });
});
