'use strict';

/**
 * Fails the build when a bundle outgrows its committed budget.
 *
 * webpack already warns that `lib.cjs.js` is over its recommended size, and a
 * warning has never failed anything here. The failure this guards is not slow
 * growth, though — it is the single import that drags a whole library in. The
 * `v6` work replaces `@ethersproject/*` with native `bigint` and consolidates
 * `@noble`, which is exactly the moment a stray `import { … } from 'ethers'`
 * can double the browser bundle without breaking a single test.
 *
 * The web bundle is the one with a user-facing cost: it ships to browser
 * wallets, where every byte is on someone's connection. The Node bundles are
 * budgeted too, because the same accidental dependency shows up in all three
 * and a diff across them says more than any one of them alone.
 *
 * Budgets are raw bytes, not gzipped — raw is what the build emits
 * deterministically, so this can only move when the code moves. Gzipped size is
 * printed alongside because it is what a consumer actually downloads.
 *
 * Raise a budget when the growth is real and intended; that edit is the review
 * prompt. Do not raise one to make a red build green without reading what
 * arrived in the bundle first — `npx webpack-bundle-analyzer` is installed.
 *
 * Usage: node scripts/assert-bundle-size.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Budgets carry roughly 5% headroom over the measured size at the time they
 * were set, so ordinary changes do not trip them and a new dependency does.
 */
const BUDGETS = [
  // 939_357 bytes measured 2026-08-12. Carries the Buffer shim the Node
  // bundles do not, which is most of the difference between them.
  { file: 'dist/lib.web.js', maxBytes: 986_000 },
  // 495_111 bytes measured 2026-08-12.
  { file: 'dist/lib.node.js', maxBytes: 520_000 },
  // 494_891 bytes measured 2026-08-12.
  { file: 'dist/lib.cjs.js', maxBytes: 520_000 }
];

const kb = bytes => `${(bytes / 1024).toFixed(1)} KB`;

const problems = [];
const rows = [];

for (const { file, maxBytes } of BUDGETS) {
  const absolute = path.resolve(process.cwd(), file);

  // A missing bundle is a failure, not a skip: a gate that passes because it
  // measured nothing is the exact shape of the empty test suite that ran green
  // here for eighteen months.
  if (!fs.existsSync(absolute)) {
    problems.push(`${file} does not exist — run \`npm run build\` first`);
    continue;
  }

  const contents = fs.readFileSync(absolute);
  const gzipped = zlib.gzipSync(contents, { level: 9 }).length;
  const percent = ((contents.length / maxBytes) * 100).toFixed(0);

  rows.push(
    `  ${file.padEnd(20)} ${kb(contents.length).padStart(10)} raw  ` +
      `${kb(gzipped).padStart(10)} gzip  (${percent}% of budget)`
  );

  if (contents.length > maxBytes) {
    problems.push(
      `${file} is ${kb(contents.length)}, over its ${kb(maxBytes)} budget by ` +
        `${kb(contents.length - maxBytes)} — something new landed in the bundle`
    );
  }
}

console.log('bundle sizes:');
for (const row of rows) console.log(row);

if (problems.length > 0) {
  console.error('\nbundle budgets exceeded:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
