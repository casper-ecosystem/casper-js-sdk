'use strict';

/**
 * Fails the build when the unit suite ran fewer tests than it should have.
 *
 * A green exit code says "nothing that ran failed". It does not say "everything
 * that should run, ran" — and the two were indistinguishable here for about
 * eighteen months: the karma setup this suite replaced preprocessed globs that
 * no test file had matched since 2025-01, so it reported
 * `Executed 0 of 0 SUCCESS` and exited 0 on every run, while CI never invoked
 * it at all.
 *
 * Vitest closes the total-zero case on its own — it errors when no test file
 * matches, and `--passWithNoTests` is deliberately absent from the unit config.
 * What it cannot notice is a *partial* loss: a file renamed out of
 * `src/**\/*.test.ts`, moved to another directory, or quietly turned into
 * `describe.skip`. Thirty files pass exactly as green as thirty-one.
 *
 * So the floors below are asserted explicitly. Raise them when the suite grows;
 * a deliberate removal is a deliberate edit here, which is the point.
 *
 * Usage: node scripts/assert-test-count.js <vitest-json-report> [label]
 */

const fs = require('fs');

/** Every `*.test.ts` under `src/`, as matched by the vitest `include` glob. */
const MIN_TEST_FILES = 32;
/** Total assertions-bearing cases across those files. */
const MIN_TESTS = 363;
/**
 * The browser leg skips one Node-`crypto` cross-check
 * (`PrivateKey.test.ts`, guarded by `it.skipIf(isBrowser)`). Anything beyond
 * that is a skip somebody added, which is exactly what this guards.
 */
const MAX_SKIPPED = 1;

const [, , reportPath, label = reportPath] = process.argv;

if (!reportPath) {
  console.error(
    'usage: node scripts/assert-test-count.js <report.json> [label]'
  );
  process.exit(2);
}

if (!fs.existsSync(reportPath)) {
  console.error(
    `[${label}] no vitest report at ${reportPath} — the run did not produce one, ` +
      'so nothing can be asserted about what it executed.'
  );
  process.exit(1);
}

let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error(`[${label}] could not parse ${reportPath}: ${error.message}`);
  process.exit(1);
}

const files = report.testResults ? report.testResults.length : 0;
const total = report.numTotalTests ?? 0;
const failed = report.numFailedTests ?? 0;
const skipped = report.numPendingTests ?? 0;

const problems = [];

if (files < MIN_TEST_FILES) {
  problems.push(
    `only ${files} test files ran, expected at least ${MIN_TEST_FILES} — ` +
      'a file has probably fallen outside the include glob'
  );
}
if (total < MIN_TESTS) {
  problems.push(
    `only ${total} tests ran, expected at least ${MIN_TESTS} — ` +
      'cases have been removed, renamed out of the glob, or skipped'
  );
}
if (skipped > MAX_SKIPPED) {
  problems.push(
    `${skipped} tests were skipped, expected at most ${MAX_SKIPPED}`
  );
}
if (failed > 0) {
  problems.push(`${failed} tests failed`);
}

if (problems.length > 0) {
  console.error(`[${label}] the suite did not run what it should have:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `[${label}] ${total} tests across ${files} files, ${skipped} skipped, 0 failed.`
);
