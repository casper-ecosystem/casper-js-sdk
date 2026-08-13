const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');

// Flat config (ESLint 10), ported 1:1 from the old `.eslintrc.js`.
//
// Deliberately does NOT pull in `@eslint/js`'s `js.configs.recommended`: the old
// config extended only `plugin:@typescript-eslint/recommended` + `prettier`, and
// `@typescript-eslint/recommended` never enabled eslint core's recommended set.
// Adding it here would surface 61 pre-existing style findings in `src/` that are
// out of scope for a dev-only toolchain change — they are tracked separately.
//
// `lint`/`lint:ci` only ever point eslint at `src/`, but the ignores below keep
// the config correct if that scope ever widens.
module.exports = defineConfig([
  { ignores: ['dist/', 'docs/', 'site/'] },
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: ['./tsconfig.json'] }
    }
  },
  {
    rules: {
      // Ported verbatim from the old .eslintrc.js overrides:
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Renamed: no-var-requires (deprecated in v8) -> no-require-imports
      '@typescript-eslint/no-require-imports': 'off',
      // New in typescript-eslint v8's `recommended`; off for parity with v5.
      // Nearly every hit is a chai assertion (`expect(x).to.be.true`), which is a
      // bare expression by design.
      '@typescript-eslint/no-unused-expressions': 'off',
      // v8 flipped the default to `caughtErrors: 'all'`; v5 used 'none'.
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  },
  {
    // `vitest-globals.d.ts` is in tsconfig.json's `include`, and an ambient
    // declaration applies to the whole program — moving the file cannot scope it
    // to the test directory. So `describe`/`it`/`expect`/`vi` resolve inside
    // `src/` too, and a stray one in shipped code type-checks and passes
    // `lint:ci`, failing only at `npm run build`, which uses tsconfig.build.json
    // and excludes the globals. Caught here instead, while feedback is immediate.
    files: ['src/**/*.ts'],
    ignores: ['src/tests/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...[
          'describe',
          'it',
          'test',
          'suite',
          'expect',
          'assert',
          'vi',
          'beforeAll',
          'afterAll',
          'beforeEach',
          'afterEach'
        ].map(name => ({
          name,
          message: `"${name}" is a vitest global and must not appear in shipped code — it is not defined at runtime outside the test suite.`
        }))
      ]
    }
  },
  prettier // MUST stay last so it disables conflicting stylistic rules
]);
