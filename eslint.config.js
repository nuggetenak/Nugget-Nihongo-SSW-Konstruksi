import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // Item 144: `public/sw.js` used to be ignored here and `lint` only ever ran
  // over `src`, so the service worker and all ten scripts/*.mjs -- including the
  // five audits that gate the data -- were outside every automated check the
  // repo has. The tooling that guards the data was itself unguarded, and a real
  // P0 lived in sw.js the whole time (item 130's atomic precache).
  // `scripts/archive/` stays ignored: those are quarantined one-shot transforms
  // kept for the record, not code anyone should be asked to keep tidy.
  { ignores: ['dist/**', 'node_modules/**', 'legacy/**', 'scripts/archive/**'] },

  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser, __APP_VERSION__: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
    },
    settings: { react: { version: '19' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',

      // Hooks — set-state-in-effect is intentional in init useEffects (e.g. GlossaryMode reset)
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      // React Compiler memoization warnings — not using React Compiler in this project
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/purity': 'off',

      // Quality
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }], // allow empty catch blocks
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipComments: true, skipTemplates: true },
      ],
    },
  },

  {
    files: ['src/**/*.test.{js,jsx}', 'tests/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { 'no-unused-vars': 'off' },
  },

  {
    files: ['scripts/**', 'vite.config.js', 'eslint.config.js', 'vitest.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': 'off', // these ARE console programs
      // Same underscore convention src/ uses. `const { _origIndex, ...card }`
      // is how merge-cards.mjs and verify-content.mjs drop an internal field.
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },

  {
    files: ['public/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker, ...globals.browser } },
    rules: { 'no-console': 'off' }, // a worker has nowhere else to report
  },

  prettier,
];
