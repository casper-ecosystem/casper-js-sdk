const { defineConfig } = require('eslint/config');
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier/flat');
const globals = require('globals');

// Flat config (ESLint 10). Layers eslint core's `recommended` set underneath
// `typescript-eslint`'s `recommended`, plus the project-specific rule blocks
// added across PHASE-3.5, then `prettier` last to disable anything stylistic
// those sets turned on.
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
    // PHASE-3.5 Task 1 — correctness tripwires. Every rule here reports zero on
    // this tree; they exist to stop regressions, not to fix debt. The one
    // exception was `no-promise-executor-return`, whose single hit was fixed
    // alongside this block rather than deferred.
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

      // --- PHASE-3.5 Task 3: exhaustiveness and the byte→enum boundary ---
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: false,
          requireDefaultForNonUnion: true
        }
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'error',

      // --- PHASE-3.5 Task 4: async and error-handling discipline ---
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      'preserve-caught-error': 'error',

      // --- PHASE-3.5 Task 5: ESLint core `recommended` and scoping rules ---
      '@typescript-eslint/no-shadow': 'error',
      'no-param-reassign': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'guard-for-in': 'error',
      '@typescript-eslint/no-unused-vars': 'error',

      // --- PHASE-3.5 Task 6: deprecated-API sweep in crypto and byte paths ---
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/no-base-to-string': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error'
    }
  },
  {
    // `KeyTypeID`/`KeyTypeName` and `TransactionVersion` have members named
    // after domain classes these files also import — `Hash`, `URef`, `BidAddr`,
    // `ByteCode`, `Era`, `Deploy`. A TS enum body is its own scope, so each
    // member declaration trips `no-shadow` against the outer import. Renaming
    // the member would break a published enum; aliasing the import would rename
    // a class throughout the file to satisfy a declaration that shadows
    // nothing at any use site. Scoped to these two files so the rule keeps its
    // full strength everywhere else.
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
