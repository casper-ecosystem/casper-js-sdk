const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');

// Flat config (ESLint 10). Layers eslint core's `recommended` set underneath
// `typescript-eslint`'s `recommended`, then the project-specific rule blocks
// below, then `prettier` last to disable anything stylistic those sets turned
// on.
//
// `lint`/`lint:ci` only ever point eslint at `src/`, but the ignores below keep
// the config correct if that scope ever widens.
module.exports = defineConfig([
  { ignores: ['dist/', 'docs/', 'site/'] },
  js.configs.recommended,
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
      // Nearly every hit is a Vitest assertion (`expect(x).to.be.true`), which
      // is a bare expression by design.
      '@typescript-eslint/no-unused-expressions': 'off'
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
  {
    // Correctness tripwires. Every rule here reports zero on this tree; they
    // exist to stop regressions, not to fix debt.
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      // --- async correctness: the highest-value group for an SDK ---
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'require-atomic-updates': 'error',
      'no-promise-executor-return': 'error',

      // --- control flow ---
      'no-fallthrough': 'error',
      'default-case-last': 'error',
      'array-callback-return': 'error',
      'no-constructor-return': 'error',

      // --- numeric & byte correctness ---
      'no-loss-of-precision': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'error',
      '@typescript-eslint/no-mixed-enums': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',

      // --- error handling ---
      'no-useless-catch': 'error',

      // --- injection sinks: an SDK must never reach these ---
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // --- misc correctness ---
      'no-prototype-builtins': 'error',
      'no-template-curly-in-string': 'error',

      // --- exhaustiveness and the byte→enum boundary ---
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: true
        }
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',

      // --- async and error-handling discipline ---
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      'preserve-caught-error': 'error',

      // --- scoping and comparison rules ---
      '@typescript-eslint/no-shadow': 'error',
      'no-param-reassign': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'guard-for-in': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // --- deprecated and unsafely-stringified APIs ---
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error'
    }
  },
  {
    // `KeyTypeID`/`KeyTypeName` and `TransactionVersion` have members named
    // after domain classes these files also import, and a TS enum body is its
    // own scope, so each member trips `no-shadow` against the outer import.
    //
    // Neither fix is acceptable: renaming a member breaks a published enum,
    // and aliasing the import renames a class file-wide to satisfy a
    // declaration that shadows nothing at any use site.
    files: ['src/types/key/Key.ts', 'src/types/Transaction.ts'],
    rules: {
      '@typescript-eslint/no-shadow': [
        'error',
        { allow: ['Hash', 'URef', 'BidAddr', 'ByteCode', 'Era', 'Deploy'] }
      ]
    }
  },
  prettier // MUST stay last so it disables conflicting stylistic rules
]);
