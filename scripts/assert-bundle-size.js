'use strict';

/**
 * Fails the build when a bundle outgrows its committed budget.
 *
 * What it catches is not slow growth but the single import that drags a whole
 * library in — a stray `import { … } from 'ethers'` can double the browser
 * bundle without breaking a test.
 *
 * Usage: node scripts/assert-bundle-size.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Raw bytes, not gzipped: raw is what the build emits deterministically, so a
 * budget moves only when the code moves. Each carries roughly 5% headroom.
 * Raise one when the growth is real and intended — after reading what arrived
 * in the bundle (`npx webpack-bundle-analyzer`), not to turn a red build green.
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

  // A missing bundle fails rather than skips: a gate that passes because it
  // measured nothing is not a gate.
  if (!fs.existsSync(absolute)) {
    problems.push(`${file} does not exist — run \`npm run build\` first`);
    continue;
  }

  const contents = fs.readFileSync(absolute);
  // Gzip is reported, never gated: it is what a consumer downloads, but it
  // varies with the compressor rather than with the code.
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
